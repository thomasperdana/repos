# ST_VProfile_Intraday
# (c) 2019 Simpler Trading, LLC
# 04/15/19
# By Eric Purdy

declare hide_on_daily;

input price = close;
input anchorTimeEST = 0930;

def atStartTime = if secondsFromTime(anchorTimeEST) >= 0 and secondsFromTime(anchorTimeEST)[1] < 0 or (secondsFromTime(anchorTimeEST) >= 0 and secondsFromTime(anchorTimeEST)[1] >= 0 and getDay() != getDay()[1]) then 1 else 0;

DefineGlobalColor("Point Of Control", color.white);
DefineGlobalColor("Value Area High", color.pink);
DefineGlobalColor("Value Area Low", color.lime);

profile vp = volumeProfile("startNewProfile" = atStartTime, "onExpansion" = no, "pricePerRow" = TickSize());
plot VPOC = vp.getPointOfControl();
plot VAHigh = vp.getHighestValueArea();
plot VALow =  vp.getLowestValueArea();
VPOC.setLineWeight(3);
VPOC.SetDefaultColor(globalColor("Point Of Control"));
VPOC.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
VAHigh.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
VALow.SetPaintingStrategy(PaintingStrategy.HORIZONTAL);
VAHigh.SetDefaultColor(globalColor("Value Area High"));
VALow.SetDefaultColor(globalColor("Value Area Low"));
