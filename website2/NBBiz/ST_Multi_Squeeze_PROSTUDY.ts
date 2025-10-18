# ST_Multi_Squeeze_PRO
# By Eric Purdy
# Last Revision 03/25/20
# (c) 2020 Simpler Trading, LLC

#hint: Add this indicator to your chart multiple times to watch more than one HIGHER time frame Squeeze Pro. Use a different period for each. Any time frames selected that are LOWER than then current chart will not show.

input period = aggregationPeriod.DAY;

DefineGlobalColor("Low Squeeze", Color.dark_gray);
DefineGlobalColor("Mid Squeeze", color.red);
DefineGlobalColor("High Squeeze", color.orange);
DefineGlobalCOlor("No Squeeze", color.dark_green);

script SymbolSqueeze {

input aP = aggregationPeriod.DAY;
def nBB = 2.0;
def Length = 20.0; 
def price1 = close( period = aP);
def UpperBand = MovingAverage(AverageType.Simple, data = price1, length = length) + nBB * stdev(data = price1, length = length);
def shift = MovingAverage(AverageType.Simple, TrueRange(high( period=aP), close( period=aP), low( period=aP)), length);
def average = MovingAverage(AverageType.Simple, price1, length);
def Avg = average;
def Upper_BandL = MovingAverage(AverageType.Simple, price1, length)+ shift*2.0;
def Upper_BandM = MovingAverage(AverageType.Simple, price1, length)+ shift*1.5;
def Upper_BandH = MovingAverage(AverageType.Simple, price1, length)+ shift*1.0;
def BolKelDeltaL = UpperBand-Upper_BandL;
def BolKelDeltaM = UpperBand-Upper_BandM;
def BolKelDeltaH = UpperBand-Upper_BandH;
plot result = if BolKelDeltaH <= 0 then 3 else if BolKelDeltaM <= 0 then 2 else if BolKelDeltaL <= 0 then 1 else 0;

}

def currentPeriod = getAggregationPeriod();
def sP;

if period >= currentPeriod {
sP = SymbolSqueeze( aP = period); 

} else {
sP = double.nan;

}

AddLabel(!isNan(sP),if period == aggregationPeriod.MONTH then "M" 
else
if period == aggregationPeriod.WEEK then "W" 
else
if period == aggregationPeriod.FOUR_DAYS then "4D" 
else
if period == aggregationPeriod.THREE_DAYS then "3D" 
else
if period == aggregationPeriod.TWO_DAYS then "2D" 
else
if period  == aggregationPeriod.DAY then "D" 
else
if period == aggregationPeriod.FOUR_HOURS then "4H" 
else
if period == aggregationPeriod.TWO_HOURS then "2H" 
else
if period == aggregationPeriod.HOUR then "60m"
else 
if period == aggregationPeriod.THIRTY_MIN then "30m" 
else 
if period == aggregationPeriod.TWENTY_MIN then "20m" 
else 
if period  == aggregationPeriod.FIFTEEN_MIN then "15m"
else
if period == aggregationPeriod.TEN_MIN then "10m" 
else
if period == aggregationPeriod.FIVE_MIN then "5m" 
else
if period == aggregationPeriod.FOUR_MIN then "4m" 
else
if period  == aggregationPeriod.THREE_MIN then "3m" 
else
if period == aggregationPeriod.TWO_MIN then "2m" 
else
if period  == aggregationPeriod.MIN then "1m" 
else "", if sP == 3 then GlobalColor("High Squeeze") else if sP == 2 then GlobalColor("Mid Squeeze") else if sP == 1 then GlobalColor("Low Squeeze") else GlobalColor("No Squeeze"));

