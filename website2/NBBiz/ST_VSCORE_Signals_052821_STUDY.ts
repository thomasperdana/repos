# ************************************
#
# Simpler Trading Vscore Signals
# By Lorna St. George
# Revision Date: 05/28/21
# Latest Revision Date: 10/13/22 - LSG
# (c) 2021 Simpler Trading, LLC
# http://www.simplertrading.com
# Modification or sharing of this code is strictly prohibited
# ************************************

#29-Apr-2021
#updated to fix invalid calculations based on original
# Lorna St. George
#fixes -- removed once_per_bar -- this creates invalid data after inital chart draw if left in
#updated rounding to sync with plot bubbles
#updated VWPSQR input with static value 
#cleaned up obsolete code
#NOTE: original VSCORE calc left for comparison

#5/1/21 update - 
#removed squeeze
#added arrows
#added config ability to enable or disable arrows
#added config to enable or disable plotting high and low
#modified default style for visibility

#5/16 remove debug code
#10/22
# change default colors for "close" arrows to match Raghee's prefs
declare lower;

input periodStartEST = 0700;
input periodEndEST = 0930;
input showLabels = Yes;
input plotArrows = Yes;
input plotHighLow = Yes;
input howclose = 0.2;
input displayAlert = yes;
input alertSound = Sound.ding;

def  price = close;
DefineGlobalColor("Low Of Period Color", Color.GREEN);
DefineGlobalColor("High Of Period Color", Color.RED);
DefineGlobalColor("Close to VSCORE Low", Color.YELLOW);
DefineGlobalColor("Close to VSCORE High", Color.YELLOW);

def periodStart = if SecondsTillTime(periodStartEST) <= 0 and SecondsTillTime(periodStartEST)[1] > 0 then 1 else 0;
def periodEnd = if SecondsTillTime(periodEndEST) <= 0 and SecondsTillTime(periodEndEST)[1] > 0 then 1 else 0;

def VWP1 = if periodStart then (price) * volume else VWP1[1] + (price * volume);
def VS1 =  if periodStart then volume else VS1[1] + volume;
def cVWAP1 = VWP1 / VS1;
#use constant value for inital input to prevent buffer overrun
def vwapSQR1 =  if periodStart then .01 else vwapSQR1[1] + Sqr(price - cVWAP1) * volume;
def VWAPSD1 = Sqrt(vwapSQR1 / VS1);
#remove rounding -- this should never be imprecise
plot VWAPZScore1 = (close - cVWAP1) / VWAPSD1;
VWAPZScore1.SetDefaultColor(Color.CYAN);
VWAPZScore1.SetLineWeight(3);

def highVWAP = VWAPZScore1;
def lowVWAP = VWAPZScore1;

def inPeriod = if periodStart then 1 else if periodEnd then 0 else inPeriod[1];
def newPeriod = if periodStart then 1 else 0;

def highOfPeriod = if newPeriod then highVWAP else if inPeriod then if highVWAP > highOfPeriod[1] then highVWAP else highOfPeriod[1] else highOfPeriod[1];
def lowOfPeriod = if newPeriod then lowVWAP else if inPeriod then if lowVWAP < lowOfPeriod[1] then lowVWAP else lowOfPeriod[1] else lowOfPeriod[1];

#plot scale
plot Mean = 0;
plot PlusOne = 1;
plot MinusOne = -1;
plot PlusTwo = 2;
plot MinusTwo = -2;
plot PlusThree = 3;
plot MinusThree = -3;

Mean.SetDefaultColor(Color.DARK_GRAY);
PlusOne.SetDefaultColor(Color.GRAY);
MinusOne.SetDefaultColor(Color.GRAY);
PlusTwo.SetDefaultColor(Color.DARK_RED);
MinusTwo.SetDefaultColor(Color.DARK_GREEN);
PlusThree.SetDefaultColor(Color.RED);
MinusThree.SetDefaultColor(Color.GREEN);

Mean.SetLineWeight(2);
PlusTwo.SetDefaultColor(Color.DARK_RED);
MinusTwo.SetDefaultColor(Color.DARK_GREEN);
PlusThree.SetDefaultColor(Color.RED);
MinusThree.SetDefaultColor(Color.GREEN);

Mean.HideBubble();
PlusOne.HideBubble();
MinusOne.HideBubble();
PlusTwo.HideBubble();
MinusTwo.HideBubble();
PlusThree.HideBubble();
MinusThree.HideBubble();

Mean.HideTitle();
PlusOne.HideTitle();
MinusOne.HideTitle();
PlusTwo.HideTitle();
MinusTwo.HideTitle();
PlusThree.HideTitle();
MinusThree.HideTitle();

#plot for highs and lows
def plotHOPLOP = if plotHighLow then 1 else 0;
def vsHigh = Round(highOfPeriod , 4);
def vsLow = Round(lowOfPeriod, 4);

plot HOP = if plotHOPLOP == 1 then vsHigh  else Double.NaN;
plot LOP = if plotHOPLOP == 1 then vsLow else Double.NaN;

HOP.SetLineWeight(2);
LOP.SetLineWeight(2);

HOP.SetPaintingStrategy(PaintingStrategy.DASHES);
LOP.SetPaintingStrategy(PaintingStrategy.DASHES);

HOP.SetDefaultColor(Color.WHITE);
LOP.SetDefaultColor(Color.WHITE);

#show range for the highs and lows calculations
AddVerticalLine(periodStart, "Start", Color.MAGENTA);
AddVerticalLine(periodEnd, "End", Color.MAGENTA);

AddLabel(showLabels, "VScore High: " + vsHigh , GlobalColor("High Of Period Color"));
AddLabel(showLabels, "VScore Low: " + vsLow , GlobalColor("Low Of Period Color"));
AddLabel(showLabels, "Current VScore: " + VWAPZScore1, Color.CYAN);

#arrows
#close-ish -- aka really close to high or now but not exact
def roundedVScore = Round(VWAPZScore1, 6);
def highEnough =  vsHigh - (vsHigh * AbsValue(howclose));
def closeToHigh = if  roundedVScore < vsHigh and roundedVScore >= highEnough then 1 else 0;
def lowEnough =  vsLow + - (vsLow * AbsValue(howclose));
def closeToLow = if  roundedVScore > vsLow and roundedVScore <= lowEnough then 1 else 0;

def alertVscoreHigh = if !inPeriod and vsHigh <> 0 then if roundedVScore >= vsHigh then 1 else 0 else 0;

def alertVscoreCloseToHigh = if !inPeriod and vsHigh <> 0 then if closeToHigh then 1 else 0 else 0;

def alertVscoreLow = if !inPeriod and vsLow <> 0 then if roundedVScore <= vsLow then 1 else 0 else 0;
def alertVscoreCloseToLow = if !inPeriod and vsLow <> 0 then if closeToLow then 1 else 0 else 0;

#plot arrows
def offset = .5;
def printLowArrow = if plotArrows and alertVscoreLow and alertVscoreLow[1] == 0 then 1 else 0;

#print a warning arror -- it got close!
def printCloseToLowArrow = if plotArrows and alertVscoreCloseToLow and alertVscoreCloseToLow[1] == 0 then 1 else 0;

def printHighArrow = if plotArrows and alertVscoreHigh and alertVscoreHigh[1] == 0 then 1 else 0;
def printCloseToHighArrow = if plotArrows and alertVscoreCloseToHigh and alertVscoreCloseToHigh[1] == 0 then 1 else 0;

plot lowArrow = if printLowArrow then VWAPZScore1 - offset else Double.NaN;
lowArrow.AssignValueColor(GlobalColor("Low Of Period Color"));
lowArrow.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
lowArrow.SetLineWeight(3);

#print closetolow arrow
plot closetolowArrow = if printCloseToLowArrow then VWAPZScore1 - offset else Double.NaN;
closetolowArrow.AssignValueColor(GlobalColor("Close to VSCORE Low"));
closetolowArrow.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
closetolowArrow.SetLineWeight(3);

plot highArrow = if printHighArrow then VWAPZScore1 + offset else Double.NaN;
highArrow.AssignValueColor(GlobalColor("High Of Period Color"));
highArrow.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
highArrow.SetLineWeight(3);

plot closetohighArrow = if printCloseToHighArrow then VWAPZScore1 + offset else Double.NaN;
closetohighArrow.AssignValueColor(GlobalColor("Close to VSCORE High"));
closetohighArrow.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
closetohighArrow.SetLineWeight(3);

#alerts!
alert(printLowArrow ==1 and displayAlert==1 , "VSCORE Low breached" , alert.BAR, alertSound);
alert(printHighArrow ==1 and displayAlert==1 , "VSCORE High breached" , alert.BAR, alertSound);

