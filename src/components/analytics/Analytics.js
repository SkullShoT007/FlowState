import {DailyFocusChart} from './DailyFocusChart';
import { SessionDistribution } from './SessionDistribution';
import { StreakandGoal } from './StreakandGoal';
import { DistractionTimeline } from './DistractionTimeline';
import { XpProgressionChart } from './XpProgressionChart';

export const Analytics = () => {
  return (
    <div className='grid grid-rows-10 grid-cols-9 gap-4 w-full h-screen m-10'>
      <div className='col-span-4 row-span-5'>
          <DailyFocusChart />
      </div>
      <div className='col-span-3 row-span-4'>
        <SessionDistribution/>
      </div>
      <div className='col-span-2'>
        <StreakandGoal/>
      </div>
      <div className='col-span-4 row-span-5 row-start-6'>
        <DistractionTimeline />
      </div>
      <div className='col-span-3 row-span-5'>
          <XpProgressionChart/>
      </div>

    </div>
  )
}
