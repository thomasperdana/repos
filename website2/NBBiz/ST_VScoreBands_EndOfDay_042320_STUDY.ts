# ST_VScoreBands_EndOfDay
# (c) 2020 Simpler Trading, LLC
# 04/23/20
# By Eric Purdy

declare hide_on_intraday;
declare once_per_bar;

input startDateYyyyMmDd = 20181224;
input price = close;
def atStartDate = if GetYYYYMMDD() == startDateYyyyMmDd then 1 else 0;
def beyondStartDate = if GetYYYYMMDD() >= startDateYyyyMmDd then 1 else 0;

def VWP = if atStartDate then (price) * volume else VWP[1] + (price * volume);
def VS =  if atStartDate then volume else VS[1] + volume;
plot VWAP = if beyondStartDate then VWP / VS else double.nan;
def vwapSQR =  if atStartDate then Sqr(price - VWAP) * volume else vwapSQR[1] + Sqr(price - VWAP) * volume;
def VWAPSD = Sqrt(vwapSQR / VS);

plot PlusOne = VWAP + VWAPSD;
plot MinusOne = VWAP - VWAPSD;
plot PlusTwo = VWAP + VWAPSD * 2;
plot MinusTwo = VWAP - VWAPSD * 2;
plot PlusThree = VWAP + VWAPSD * 3;
plot MinusThree = VWAP - VWAPSD * 3;

VWAP.SetDefaultColor(Color.WHITE);
PlusOne.SetDefaultColor(Color.GRAY);
MinusOne.SetDefaultColor(Color.GRAY);
PlusTwo.SetDefaultColor(Color.DARK_RED);
MinusTwo.SetDefaultColor(Color.DARK_GREEN);
PlusThree.SetDefaultColor(Color.RED);
MinusThree.SetDefaultColor(Color.GREEN);

VWAP.SetLineWeight(2);
PlusTwo.SetDefaultColor(Color.DARK_RED);
MinusTwo.SetDefaultColor(Color.DARK_GREEN);
PlusThree.SetDefaultColor(Color.RED);
MinusThree.SetDefaultColor(Color.GREEN);

VWAP.HideBubble();
PlusOne.HideBubble();
MinusOne.HideBubble();
PlusTwo.HideBubble();
MinusTwo.HideBubble();
PlusThree.HideBubble();
MinusThree.HideBubble();

VWAP.HideTitle();
PlusOne.HideTitle();
MinusOne.HideTitle();
PlusTwo.HideTitle();
MinusTwo.HideTitle();
PlusThree.HideTitle();
MinusThree.HideTitle();

