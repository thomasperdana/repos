#
# ST_Ready_Aim_Fire_Pro
#
# Last Update 7/13/2020
#
# Copyright (c) 2010-2020 David H. Starr
# Ready.Aim.Fire! is a registered trademark of Managematics LLC.


declare lower;

input ProLength =28;
input OverboughtOversold = 1.2;
input GenerateAlerts=No;
input AlertRequiresAim=Yes;

def CountChg;
rec SC;

def k1v = Max(-100, Min(100, (StochasticFull(KPeriod = 5, slowing_period = 3, averageType=averageType.EXPONENTIAL))) - 50) / 50.01;
def k2v = Max(-100, Min(100, (StochasticFull(KPeriod = 8, slowing_period = 5, averageType=averageType.EXPONENTIAL))) - 50) / 50.01;
def k3v = Max(-100, Min(100, (StochasticFull(KPeriod = 17, slowing_period = 5, averageType=averageType.EXPONENTIAL))) - 50) / 50.01;

def tavg =TEMA(close, ProLength);
def savg = GetValue(tavg, Floor(ProLength/2));
def matr = 0.5*ATR(10);
def savgstate = if low > savg + matr then 1 else if high < savg - matr then -1 else 0;

def hh=ADX(Floor(ProLength/2));
plot hhsig = if hh <= hh[1] or hh[1] > hh[2] then double.NaN else 0;
hhsig.AssignValueColor(if savgstate == 1 then Color.GREEN else if savgstate == -1 then Color.RED else Color.YELLOW);
hhsig.setpaintingstrategy(PaintingStrategy.SQUARES);
hhsig.setlineweight(5);

plot hhDown = if savgstate*hhsig == -1 then 0 else double.NaN;
plot zeroline = if isNaN(hhsig) then 0 else double.NaN;
zeroline.SetPaintingStrategy (PaintingStrategy.HORIZONTAL);
zeroline.SetLineWeight(2);
zeroLine.AssignValueColor (if savgstate ==1 then Color.GREEN else if savgstate == -1 then Color.RED else Color.YELLOW);


plot Overbought = OverboughtOversold ;
plot Oversold = -OverboughtOversold ;


if k2v > 0
Then {
    CountChg = if k1v <= k2v and k1v[1] > k2v[1] and k2v[1] > 0 then -1 else 0;
    SC = CompoundValue(1,  Min (0, SC[1]) + CountChg, 0);
}
else {
    CountChg = if k1v >= k2v and k1v[1] < k2v[1] and k2v[1] <= 0 then 1 else 0;
    SC = CompoundValue (1,  Max (0, SC[1]) + CountChg, 0);
}

DefineGlobalColor ("Ready Buy", CreateColor(0,120,0));
DefineGlobalColor ("Aim Buy", Color.GREEN);
DefineGlobalColor ("Ready Sell", CreateColor(120,0,0));
DefineGlobalColor ("Aim Sell", Color.RED);

AddVerticalLine (((k2v > 0 and k1v <= k2v and k1v[1] > k2v[1]) or (k2v < 0 and k1v >= k2v and k1v[1] < k2v[1])), 
if AbsValue(SC) > 1 then "AIM" else "READY",
if SC > 1 then 
    GlobalColor ("Aim Buy")
else if SC == 1 then
    GlobalColor ("Ready Buy")
else if SC < -1 then
    GlobalColor ("Aim Sell")
else GlobalColor ("Ready Sell"));

rec f3 = CompoundValue(1, if IsNaN(0.5 * (Log((1 + k3v) / (1 - k3v)) + f3[1])) then f3[1]
                             else 0.5 * (Log((1 + k3v) / (1 - k3v)) + f3[1]), 0);


plot Major = if IsNaN(close) then Double.NaN else f3;
plot MajorBuy = if (Sign (f3 - f3[1]) > Sign (f3[1] - f3[2])) and !IsNaN(close) then f3[1] else Double.NaN;
plot MajorSell = if (Sign (f3 - f3[1]) < Sign (f3[1] - f3[2]))  and !IsNaN(close) then f3[1] else Double.NaN;

def BuyCloudL = if sc>1 then OverboughtOversold else if sc == 1 then -OverboughtOversold else double.NaN;
def BuyCloudH = if sc>1 then -OverboughtOversold else if sc == 1 then OverboughtOversold else double.NaN;
AddCloud (BuyCloudL, BuyCloudH, GlobalColor ("Aim Buy"), GlobalColor ("Ready Buy"));
def SellCloudL = if sc<-1 then OverboughtOversold else if sc == -1 then -OverboughtOversold else double.NaN;
def SellCloudH = if sc<-1 then -OverboughtOversold else if sc == -1 then OverboughtOversold else double.NaN;
AddCloud (SellCloudL, SellCloudH, GlobalColor ("Aim Sell"), GlobalColor ("Ready Sell"));

Major.SetDefaultColor(Color.MAGENTA);
MajorBuy.SetDefaultColor(Color.MAGENTA);
MajorSell.SetDefaultColor(Color.MAGENTA);

MajorBuy.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
MajorSell.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
Major.SetLineWeight(2);
MajorBuy.SetLineWeight(5);
MajorSell.SetLineWeight(5);


Overbought.SetDefaultColor (Color.BLUE);
Oversold.SetDefaultColor (Color.BLUE);


Alert(GenerateAlerts and (AlertRequiresAim == No or sc>1) and MajorBuy<=0-OverboughtOversold, "Ready, Aim, Fire! Buy", Alert.BAR, Sound.RING);
Alert(GenerateAlerts and (AlertRequiresAim == No or sc<-1) and MajorSell>=OverboughtOversold, "Ready, Aim, Fire! Sell", Alert.BAR, Sound.RING);

