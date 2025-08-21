import { TaskCompletionChart } from "./TaskCompletionChart";
import { TaskDifficultyChart } from "./TaskDifficultyChart";
import { HabitTrendChart } from "./HabitTrendChart";
import { HabitTypeChart } from "./HabitTypeChart";
import { XpProgressChart } from "./XpProgressChart";
import { XpRadialChart } from "./XpRadialChart";
import { PomodoroDailyChart } from "./PomodoroDailyChart";
import { PomodoroModeChart } from "./PomodoroModeChart";

export const Analytics = () => {
  return (
    <div className="grid grid-cols-10 m-5 gap-4">
      
      <div className="col-span-4"> 
          <HabitTrendChart />
      </div>
      <div className="col-span-2"> 
          <TaskCompletionChart />
      </div>
      <div className="col-span-4">
        <TaskDifficultyChart />
      </div>
      <div className="row-start-2 col-span-3">
        <XpRadialChart />
        
      </div>
      <div className="col-span-7">
        <XpProgressChart />
      </div>
      <div className="col-span-3">
        <HabitTypeChart />
      </div>
      <div className="col-span-3">
        <PomodoroDailyChart />
      </div>
      <div className="col-span-4">
        <PomodoroModeChart />
      </div>
      
      
      
      
      
      
      
      
    </div>
  );
}
