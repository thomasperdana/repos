# ST_Multi_Histogram
# By Eric Purdy
# Last Revision 04/17/20
# (c) 2020 Simpler Trading, LLC

#hint: Add this indicator to your chart multiple times to watch more than one HIGHER time frame Squeeze Histogram. Use a different period for each. Any time frames selected that are LOWER than then current chart will not show.

input period = AggregationPeriod.DAY;

DefineGlobalColor("Above Zero Rising", Color.CYAN);
DefineGlobalColor("Above Zero Falling", Color.BLUE);
DefineGlobalColor("Below Zero Falling", Color.RED);
DefineGlobalColor("Below Zero Rising", Color.YELLOW);

script SymbolSqueezeHistogram {

    input aP = AggregationPeriod.DAY;
    def c = close( period = aP);
    def h = high( period = aP);
    def l = low( period = aP);
    def hEst = Inertia(c - ((Highest(h, 20) + Lowest(l, 20)) / 2 + ExpAverage(c, 20)) / 2, 20);;
    plot result = if hEst > 0 and hEst > hEst[1] then 3 else if hEst > 0 then 2 else if hEst < 0 and hEst < hEst[1] then 1 else 0;

}

def currentPeriod = GetAggregationPeriod();
def sP;

if period >= currentPeriod {
    sP = SymbolSqueezeHistogram( aP = period);

} else {
    sP = Double.NaN;

}

AddLabel(!IsNaN(sP), if period == AggregationPeriod.MONTH then "M" 
else
if period == AggregationPeriod.WEEK then "W" 
else
if period == AggregationPeriod.FOUR_DAYS then "4D" 
else
if period == AggregationPeriod.THREE_DAYS then "3D" 
else
if period == AggregationPeriod.TWO_DAYS then "2D" 
else
if period  == AggregationPeriod.DAY then "D" 
else
if period == AggregationPeriod.FOUR_HOURS then "4H" 
else
if period == AggregationPeriod.TWO_HOURS then "2H" 
else
if period == AggregationPeriod.HOUR then "60m"
else 
if period == AggregationPeriod.THIRTY_MIN then "30m" 
else 
if period == AggregationPeriod.TWENTY_MIN then "20m" 
else 
if period  == AggregationPeriod.FIFTEEN_MIN then "15m"
else
if period == AggregationPeriod.TEN_MIN then "10m" 
else
if period == AggregationPeriod.FIVE_MIN then "5m" 
else
if period == AggregationPeriod.FOUR_MIN then "4m" 
else
if period  == AggregationPeriod.THREE_MIN then "3m" 
else
if period == AggregationPeriod.TWO_MIN then "2m" 
else
if period  == AggregationPeriod.MIN then "1m" 
else "", if sP == 3 then GlobalColor("Above Zero Rising") else if sP == 2 then GlobalColor("Above Zero Falling") else if sP == 1 then GlobalColor("Below Zero Falling") else GlobalColor("Below Zero Rising"));