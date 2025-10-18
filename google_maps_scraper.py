#!/usr/bin/env python3
"""
google_maps_scraper.py
=======================

This script implements a simple command‑line tool to query the Google Maps
Places API and extract contact information for businesses matching a
user‑supplied query.  The tool accepts a search string of the form
```
<count> <industry> in <location>
```
For example, ``10 HVAC in Orlando, Florida`` will collect contact details for
the first 10 heating, ventilation and air‑conditioning (HVAC) businesses
in Orlando, Florida returned by the Google Places Text Search endpoint.

For each place, the script retrieves the following fields from the Place
Details endpoint:

* `name` – the name of the business or establishment
* `formatted_address` – the complete postal address
* `international_phone_number` – the phone number in international format (if available)
* `website` – the business’ official website (if available)
* `rating` – the average user rating on Google Maps (if available)
* `user_ratings_total` – the total number of user ratings
* Up to five `reviews` – a sample of user reviews. Only the first review
  is captured in the exported CSV to keep the output manageable.
* `emails` – any email addresses discovered by scanning the business’ own
  website for ``mailto:`` links or text that matches an email pattern.

The script writes the results to a CSV file.  If you supply your API key via
the `--api_key` argument or set the `GOOGLE_API_KEY` environment variable, the
tool will make live requests to the Google Places API.  Without an API key
the script will refuse to run.

Note that Google does not expose business email addresses via the Places
API.  Therefore email detection relies on scanning the business’ website,
which may or may not contain a contact email.  This scanning respects
standard network timeouts and uses a simple regular expression; it is
provided purely as a convenience and may miss some addresses or return
addresses that are unrelated to the business.

Usage::

    python google_maps_scraper.py "10 HVAC in Orlando, Florida" --api_key YOUR_API_KEY --output hvac_orlando.csv

See the `--help` flag for more options.
"""

import argparse
import csv
import os
import re
import sys
import urllib.parse
from typing import Dict, List, Tuple, Optional

import requests


def parse_query(query: str) -> Tuple[int, str, str]:
    """Parse the user input of the form "<count> <industry> in <location>".

    Args:
        query: The input string supplied by the user.

    Returns:
        A tuple of (count, industry, location).

    Raises:
        ValueError: If the query does not match the expected pattern.
    """
    # Use a regular expression to capture count, industry and location.
    # The pattern is greedy for the industry segment to allow spaces (e.g. "real estate agent").
    match = re.match(
        r"^(?P<count>\d+)\s+(?P<industry>.+?)\s+in\s+(?P<location>.+)$",
        query.strip(),
        re.IGNORECASE,
    )
    if not match:
        raise ValueError(
            "Query must be in the format '<count> <industry> in <location>', e.g. '10 HVAC in Orlando, Florida'"
        )
    count = int(match.group("count"))
    industry = match.group("industry").strip()
    location = match.group("location").strip()
    return count, industry, location


def text_search(api_key: str, term: str, location: str) -> List[Dict]:
    """Perform a Places Text Search request to find candidate places.

    Args:
        api_key: Your Google Maps API key.
        term: The industry or search keyword (e.g. "HVAC").
        location: A human‑readable location string (e.g. "Orlando, Florida").

    Returns:
        A list of place search result objects as returned by the API.  On error
        the returned list will be empty and the error message (if any) will
        be printed to stderr.
    """
    query = f"{term} in {location}"
    url = (
        "https://maps.googleapis.com/maps/api/place/textsearch/json?query="
        f"{urllib.parse.quote_plus(query)}&key={api_key}"
    )
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
    except Exception as exc:
        print(f"Failed to query Places Text Search endpoint: {exc}", file=sys.stderr)
        return []
    status = data.get("status")
    if status != "OK":
        err_msg = data.get("error_message", "Unknown error")
        print(f"Places Text Search request failed with status {status}: {err_msg}", file=sys.stderr)
        return []
    return data.get("results", [])


def place_details(api_key: str, place_id: str) -> Optional[Dict]:
    """Fetch detailed information about a place using its place_id.

    Args:
        api_key: Your Google Maps API key.
        place_id: The unique identifier of the place obtained from a Text Search result.

    Returns:
        The `result` object from the Place Details API response, or None on error.
    """
    # Request all relevant fields.  The API requires a comma‑separated list
    # without spaces.  Reviews are limited to five by default.
    fields = (
        "name,formatted_address,international_phone_number,website,rating,"
        "user_ratings_total,reviews"
    )
    url = (
        "https://maps.googleapis.com/maps/api/place/details/json?place_id="
        f"{place_id}&fields={fields}&key={api_key}"
    )
    try:
        response = requests.get(url, timeout=10)
        data = response.json()
    except Exception as exc:
        print(f"Failed to query Place Details endpoint: {exc}", file=sys.stderr)
        return None
    status = data.get("status")
    if status != "OK":
        err_msg = data.get("error_message", "Unknown error")
        print(
            f"Place Details request for {place_id} failed with status {status}: {err_msg}",
            file=sys.stderr,
        )
        return None
    return data.get("result")


def extract_emails_from_text(text: str) -> List[str]:
    """Return a list of unique email addresses found in the provided text."""
    # Use a basic regex for email addresses; this may capture some false positives.
    email_pattern = re.compile(
        r"[a-zA-Z0-9_.+\-]+@[a-zA-Z0-9\-]+\.[a-zA-Z0-9\-.]+", re.IGNORECASE
    )
    return list(set(email_pattern.findall(text)))


def discover_emails_from_website(url: str) -> List[str]:
    """Attempt to fetch the provided website and extract email addresses.

    Args:
        url: The URL of the business website.

    Returns:
        A list of unique email addresses discovered in the page's content.  If
        the request fails or no email addresses are found, an empty list is
        returned.
    """
    if not url:
        return []
    try:
        resp = requests.get(url, timeout=10)
        # Only proceed if we got a successful response and the content is not too large.
        if resp.status_code == 200 and len(resp.text) < 5_000_000:
            return extract_emails_from_text(resp.text)
    except Exception:
        pass
    return []


def scrape_places(query: str, api_key: str, limit: Optional[int] = None) -> List[Dict[str, any]]:
    """High‑level function to orchestrate the scraping process.

    Args:
        query: The user query string (e.g. "10 HVAC in Orlando, Florida").
        api_key: Google Maps API key for authentication.
        limit: If provided, overrides the number of places to retrieve.

    Returns:
        A list of dictionaries containing the scraped information for each place.
    """
    count, industry, location = parse_query(query)
    # If an external limit is provided, use the smaller of the two values.
    target = min(limit or count, count)
    search_results = text_search(api_key, industry, location)
    places = []
    for item in search_results[:target]:
        place_id = item.get("place_id")
        if not place_id:
            continue
        details = place_details(api_key, place_id)
        if not details:
            continue
        entry: Dict[str, any] = {
            "name": details.get("name"),
            "address": details.get("formatted_address"),
            "phone": details.get("international_phone_number"),
            "website": details.get("website"),
            "rating": details.get("rating"),
            "reviews_total": details.get("user_ratings_total"),
        }
        # Capture the first review's author, rating and text for brevity.
        reviews = details.get("reviews") or []
        if reviews:
            rev = reviews[0]
            entry["review_author"] = rev.get("author_name")
            entry["review_rating"] = rev.get("rating")
            # Strip newline characters from review text for CSV cleanliness.
            text = rev.get("text")
            entry["review_text"] = text.replace("\n", " ") if isinstance(text, str) else None
        else:
            entry["review_author"] = None
            entry["review_rating"] = None
            entry["review_text"] = None
        # Attempt to discover email addresses on the business's website.
        emails = discover_emails_from_website(entry.get("website"))
        entry["emails"] = "; ".join(emails) if emails else None
        places.append(entry)
    return places


def write_csv(data: List[Dict[str, any]], output_path: str) -> None:
    """Write the scraped data to a CSV file.

    Args:
        data: A list of dictionaries representing place information.
        output_path: Path to the CSV file to create.
    """
    if not data:
        print("No data to write to CSV.")
        return
    # Determine CSV columns by aggregating all keys found in the data.
    fieldnames: List[str] = sorted(
        {key for entry in data for key in entry.keys()}
    )
    try:
        with open(output_path, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            writer.writeheader()
            for row in data:
                writer.writerow(row)
        print(f"Successfully wrote {len(data)} records to '{output_path}'.")
    except Exception as exc:
        print(f"Failed to write CSV file {output_path}: {exc}", file=sys.stderr)


def main() -> None:
    """Entry point for the command‑line interface."""
    parser = argparse.ArgumentParser(
        description=(
            "Scrape contact information from Google Maps using the Places API. "
            "Provide your query in the format '<count> <industry> in <location>'."
        )
    )
    parser.add_argument(
        "query",
        help="Search string, e.g. '10 HVAC in Orlando, Florida'",
    )
    parser.add_argument(
        "--api_key",
        help=(
            "Google Maps API key. If omitted, the script looks for the GOOGLE_API_KEY "
            "environment variable."
        ),
        default=os.environ.get("GOOGLE_API_KEY"),
    )
    parser.add_argument(
        "--output",
        help="Path to the CSV file where results will be stored.",
        default="results.csv",
    )
    parser.add_argument(
        "--limit",
        type=int,
        help=(
            "Optional: limit the number of results returned. Useful for testing "
            "when the count specified in the query is high."
        ),
    )

    args = parser.parse_args()
    if not args.api_key:
        parser.error(
            "An API key is required. Provide it via the --api_key option or set the GOOGLE_API_KEY environment variable."
        )
    # Scrape the data
    places = scrape_places(args.query, args.api_key, args.limit)
    # Write to CSV
    write_csv(places, args.output)


if __name__ == "__main__":
    main()