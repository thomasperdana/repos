# ST_VWAPMax
# (c) 2022 Simpler Trading, LLC
# creation date: 09/29/2022
# By Lorna St. George
# 
#Update to VWAPMAX intraday and eod
#    - add Trendalorian crosses
#    - add ability to easily enable or disable MPP bands
#    - combine intraday and daily for simplicity
#
# http://www.simplertrading.com
# Modification or sharing of this code is strictly prohibited
# ************************************

input price = close;
input anchorTimeEST = 0700;
input startDateYyyyMmDd = 20220101;
input standardDeviations = 3.0;
input arrowlookback = 8;
input emacross = 3;
input DisplayMaximumPermissableDeviations = no;
input DisplayTrendalorian = yes;
input EnableAlerts = no;

def isIntraDay = if GetAggregationPeriod() < AggregationPeriod.DAY then 1 else 0;
def beyondStartDate = if GetYYYYMMDD() >= startDateYyyyMmDd then 1 else 0;
def atStartTime = if SecondsFromTime(anchorTimeEST) >= 0 and SecondsFromTime(anchorTimeEST)[1] < 0 or (SecondsFromTime(anchorTimeEST) >= 0 and SecondsFromTime(anchorTimeEST)[1] >= 0 and GetDay() != GetDay()[1]) then 1 else 0;
def beyondStartTime = if SecondsFromTime(anchorTimeEST) > 0 then 1 else 0;

def VWP;
def VS;
def cVWAP;
def vwapSQR;
def VWAPSD;
def HOP;
def LOP;
def mp;
def MA1;
plot VWAP;

if (isIntraDay == 1) {
    VWP       = if atStartTime then (price) * volume else VWP[1] + (price * volume);
    VS        = if atStartTime then volume else VS[1] + volume;
    cVWAP     = VWP / VS;
    vwapSQR   =  if atStartTime then Sqr(price - cVWAP) * volume else vwapSQR[1] + Sqr(price - cVWAP) * volume;
    VWAPSD    = Sqrt(vwapSQR / VS);
    HOP       = if atStartTime then high else Max(HOP[1], high);
    LOP       = if atStartTime then low else Min(LOP[1], low);
    mp        = (HOP - LOP) / 2.0;
    VWAP      = if atStartTime[-1] then Double.NaN else cVWAP;
    MA1       = ExpAverage(close, emacross);

} else {
    VWAP    = TotalSum(if beyondStartDate then (hlc3  * volume) else 0) / TotalSum(if beyondStartDate then volume else 0);
    VWAPSD  =  Sqrt(TotalSum(if beyondStartDate then Sqr(hlc3 - VWAP) * volume else 0) / TotalSum(if beyondStartDate then volume else 0));
    HOP     = if beyondStartDate then Max(HOP[1], high) else 0;
    LOP     = if beyondStartDate and !beyondStartDate[1] then low else if beyondStartDate then Min(LOP[1], low) else 0;
    mp      = (HOP - LOP) / 2.0;
    VWP     = Double.NaN;
    cVWAP   = VWAP;
    MA1     = ExpAverage(close, emacross);
    VS      = Double.NaN;
    vwapSQR = Double.NaN;
}


VWAP.SetDefaultColor(Color.CYAN);
VWAP.SetLineWeight(2);

plot VWAPSDp = if DisplayMaximumPermissableDeviations then VWAP + VWAPSD * standardDeviations else Double.NaN;
plot VWAPSDm = if DisplayMaximumPermissableDeviations then VWAP - VWAPSD * standardDeviations else Double.NaN;

VWAPSDp.SetDefaultColor(Color.PINK);
VWAPSDp.SetStyle(Curve.SHORT_DASH);
VWAPSDp.SetLineWeight(1);
VWAPSDm.SetDefaultColor(Color.GREEN);
VWAPSDm.SetStyle(Curve.SHORT_DASH);
VWAPSDm.SetLineWeight(1);

plot VWAPMPp = if DisplayMaximumPermissableDeviations then VWAP + mp else Double.NaN;
plot VWAPMPm = if DisplayMaximumPermissableDeviations then VWAP - mp else Double.NaN;

VWAPMPp.SetDefaultColor(Color.PINK);
VWAPMPp.SetStyle(Curve.LONG_DASH);
VWAPMPp.SetLineWeight(1);
VWAPMPm.SetDefaultColor(Color.GREEN);
VWAPMPm.SetStyle(Curve.LONG_DASH);
VWAPMPm.SetLineWeight(1);

#trendalorian
def barNumber = BarNumber();
def arrowLookbacklength = arrowlookback;
def lastBar = HighestAll(if IsNaN(close) then 0 else barNumber);
def arrowOffset = Min(arrowLookbacklength - 1, lastBar - barNumber);
def tcUP = MA1 crosses above cVWAP;
def tcdown =  MA1 crosses below cVWAP;

plot trendyCrossUpSignal = if DisplayTrendalorian then  if tcUP then GetValue(Lowest(low[1], arrowLookbacklength), -arrowOffset) else Double.NaN else Double.NaN ;
trendyCrossUpSignal.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
trendyCrossUpSignal.SetDefaultColor(Color.CYAN);
trendyCrossUpSignal.SetLineWeight(5);
trendyCrossUpSignal.HideTitle();

plot trendyCrossDownSignal = if DisplayTrendalorian then if tcdown  then GetValue(Highest(high[1], arrowLookbacklength), -arrowOffset) else Double.NaN else Double.NaN;
trendyCrossDownSignal.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
trendyCrossDownSignal.SetDefaultColor(Color.CYAN);
trendyCrossDownSignal.SetLineWeight(5);
trendyCrossDownSignal.HideTitle();

#ALERTS
Alert(EnableAlerts and tcUp, "Trendalorian crossing UP!", Alert.BAR, Sound.Ring);
Alert(EnableAlerts and tcDown, "Trendalorian Crossing DOWN!", Alert.BAR, Sound.Ring);
