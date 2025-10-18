# ST_VProfile_EndOfDay
# (c) 2019 Simpler Trading, LLC
# 04/15/19
# By Eric Purdy

declare hide_on_intraday;

input startDateYyyyMmDd = 20181224;
def beyondStartDate = if GetYYYYMMDD() >= startDateYyyyMmDd then 1 else 0;
def profileStart = beyondStartDate and !beyondStartDate[1];

profile vol = VolumeProfile("startNewProfile" = profileStart, "onExpansion" = no);

plot POC = if beyondStartDate then vol.GetPointOfControl() else double.nan;
plot VAHigh = if beyondStartDate then vol.GetHighestValueArea()  else double.nan;
plot VALow = if beyondStartDate then vol.GetLowestValueArea() else double.nan;

DefineGlobalColor("Point Of Control", color.white);
DefineGlobalColor("Value Area High", color.pink);
DefineGlobalColor("Value Area Low", color.lime);

POC.SetDefaultColor(GlobalColor("Point Of Control"));
POC.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
POC.SetLineWeight(3);
VAHigh.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
VALow.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
VAHigh.SetLineWeight(2);
VAHigh.SetDefaultColor(GlobalColor("Value Area High"));
VALow.SetDefaultColor(GlobalColor("Value Area Low"));
VALow.SetLineWeight(2);
