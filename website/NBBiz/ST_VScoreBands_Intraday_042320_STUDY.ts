# ST_VScoreBands_Intraday
# (c) 2019 Simpler Trading, LLC
# 04/23/20
# By Eric Purdy

declare hide_on_daily;

input price = close;
input anchorTimeEST = 0930;

def atStartTime = if secondsFromTime(anchorTimeEST) >= 0 and secondsFromTime(anchorTimeEST)[1] < 0 or (secondsFromTime(anchorTimeEST) >= 0 and secondsFromTime(anchorTimeEST)[1] >= 0 and getDay() != getDay()[1]) then 1 else 0;
def beyondStartTime = if secondsFromTime(anchorTimeEST) > 0 then 1 else 0;

def VWP = if atStartTime then (price)*volume else VWP[1] + (price*volume);
def VS =  if atStartTime then volume else VS[1] + volume;
plot VWAP = VWP/VS;
def vwapSQR =  if atStartTime then Sqr(price-VWAP)*volume else vwapSQR[1] + Sqr(price-VWAP)*volume;
def VWAPSD = Sqrt(vwapSQR/VS);

plot PlusOne = VWAP+VWAPSD;
plot MinusOne = VWAP-vwapSD;
plot PlusTwo = VWAP+VWAPSD*2;
plot MinusTwo = VWAP-VWAPSD*2;
plot PlusThree = VWAP+VWAPSD*3;
plot MinusThree = VWAP-VWAPSD*3;

VWAP.setDefaultColor(color.white);
PlusOne.setDefaultColor(color.gray);
MinusOne.setDefaultColor(color.gray);
PlusTwo.setDefaultColor(color.dark_red);
MinusTwo.setDefaultColor(color.Dark_green);
PlusThree.setDefaultColor(color.red);
MinusThree.setDefaultColor(color.green);

VWAP.setLineWeight(2);
PlusTwo.setDefaultColor(color.dark_red);
MinusTwo.setDefaultColor(color.Dark_green);
PlusThree.setDefaultColor(color.red);
MinusThree.setDefaultColor(color.green);

VWAP.hideBubble();
PlusOne.hideBubble();
MinusOne.hideBubble();
PlusTwo.hideBubble();
MinusTwo.hideBubble();
PlusThree.hideBubble();
MinusThree.hideBubble();

VWAP.hideTitle();
PlusOne.hideTitle();
MinusOne.hideTitle();
PlusTwo.hideTitle();
MinusTwo.hideTitle();
PlusThree.hideTitle();
MinusThree.hideTitle();

AddVerticalLine(atStartTime, "", color.magenta);

