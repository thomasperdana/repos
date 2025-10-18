# ST_VScore_EndOfDay
# (c) 2019 Simpler Trading, LLC
# 04/26/19
# By Eric Purdy

declare hide_on_intraday;
declare once_per_bar;
declare lower;

input startDateYyyyMmDd = 20181224;
def beyondStartDate = if GetYYYYMMDD() >= startDateYyyyMmDd then 1 else 0;

def cVWAP = TotalSum(if beyondStartDate then (((high + low + close) / 3) * volume) else 0) / TotalSum(if beyondStartDate then volume else 0);
def VWAPSD  =  Sqrt(TotalSum(if beyondStartDate then Sqr(((high + low + close) / 3) - cVWAP) * volume else 0) / TotalSum(if beyondStartDate then volume else 0));

plot VWAPZScore = if beyondStartDate[1] then (close-cVWAP)/VWAPSD else double.nan;
VWAPZScore.SetDefaultColor(color.MaGENTA);
VWAPZScore.SetLineWeight(2);

plot Mean = if beyondStartDate then 0 else double.nan;

plot PlusOne = if beyondStartDate then 1 else double.nan;
plot MinusOne = if beyondStartDate then -1 else double.nan;
plot PlusTwo = if beyondStartDate then 2 else double.nan;
plot MinusTwo = if beyondStartDate then -2 else double.nan;
plot PlusThree = if beyondStartDate then 3 else double.nan;
plot MinusThree = if beyondStartDate then -3 else double.nan;

Mean.setDefaultColor(color.white);
PlusOne.setDefaultColor(color.gray);
MinusOne.setDefaultColor(color.gray);
PlusTwo.setDefaultColor(color.dark_red);
MinusTwo.setDefaultColor(color.Dark_green);
PlusThree.setDefaultColor(color.red);
MinusThree.setDefaultColor(color.green);

Mean.setLineWeight(2);
PlusTwo.setDefaultColor(color.dark_red);
MinusTwo.setDefaultColor(color.Dark_green);
PlusThree.setDefaultColor(color.red);
MinusThree.setDefaultColor(color.green);

Mean.hideBubble();
PlusOne.hideBubble();
MinusOne.hideBubble();
PlusTwo.hideBubble();
MinusTwo.hideBubble();
PlusThree.hideBubble();
MinusThree.hideBubble();

Mean.hideTitle();
PlusOne.hideTitle();
MinusOne.hideTitle();
PlusTwo.hideTitle();
MinusTwo.hideTitle();
PlusThree.hideTitle();
MinusThree.hideTitle();


