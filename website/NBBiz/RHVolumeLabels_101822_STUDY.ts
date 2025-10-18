declare lower;
#Inputs
input Show30DayAvg = yes;
input ShowTodayVolume = yes;
input ShowPercentOf30DayAvg = yes;
input UnusualVolumePercent = 200;
input Show30BarAvg = yes;
input ShowCurrentBar = yes;
input volumeLookback = 30;
input averageLastNumberofBars = 21;

DefineGlobalColor("Neutral", color.Light_Gray);
DefineGlobalColor("HigherThanUnusualVolume",color.Green);
DefineGlobalColor("Greaterthan100%",color.Orange);
DefineGlobalColor("CurBar%ofAvgDefault",color.white);


#Volume Data
def volLast30DayAvg ;
def today;
def percentOf30Day;

if GetAggregationPeriod() <= AggregationPeriod.DAY {
volLast30DayAvg =  
              (fold i = 1 to 31 
                 with v=0
                 do v + volume(period = "DAY")[i]) / 30;

today =  volume(period = "DAY");
percentOf30Day =  Round((volume(period = "DAY") / volLast30DayAvg) * 100, 0) ;
}
else
{
 volLast30DayAvg =Double.NaN;
 today =Double.NaN;
 percentOf30Day =Double.NaN;
}

#average over last X bars
def averageLastX = (fold l = 1 to averageLastNumberofBars + 1
                 with lv=0
                 do lv + volume[l]) / averageLastNumberofBars;

def curVolume = volume;
def percentCurrentofAverageLastX = Round((curVolume/averageLastX) *100,0);


# Labels
AddLabel(volLast30DayAvg and Show30DayAvg , "Daily Avg: " +  Round(volLast30DayAvg, 0), GlobalColor("Neutral"));
AddLabel(volLast30DayAvg and ShowTodayVolume, "Today: " + today, (if percentOf30Day >= UnusualVolumePercent then GlobalColor("HigherThanUnusualVolume") else if percentOf30Day >= 100 then GlobalColor("Greaterthan100%") else GlobalColor("Neutral")));
AddLabel(volLast30DayAvg and ShowPercentOf30DayAvg,"Percent of last 30 days: "+ percentOf30Day + "%", (if percentOf30Day >= UnusualVolumePercent then GlobalColor("HigherThanUnusualVolume") else if percentOf30Day >= 100 then GlobalColor("Greaterthan100%") else GlobalColor("CurBar%ofAvgDefault")) );

AddLabel(Show30BarAvg, "Avg " + averageLastNumberofBars + " Bars: " + Round(averageLastX, 0), GlobalColor("Neutral"));


AddLabel(ShowCurrentBar and GetAggregationPeriod() != AggregationPeriod.DAY , "Cur Bar: " + curVolume, (if curVolume >= averageLastX then GlobalColor("HigherThanUnusualVolume") else GlobalColor("Greaterthan100%")));

AddLabel(ShowCurrentBar, "Cur Bar % of Average: " + percentCurrentofAverageLastX+ "%", (if percentCurrentofAverageLastX >= UnusualVolumePercent then GlobalColor("HigherThanUnusualVolume")  else if percentCurrentofAverageLastX >= 100 then GlobalColor("Greaterthan100%") else GlobalColor("CurBar%ofAvgDefault")) );
plot border =1; #keeps the indicator in place. otherwise it jumps on hover
border.hideBubble();
border.hideTitle();
border.setLineWeight(1);
