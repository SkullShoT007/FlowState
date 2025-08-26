import { useSelector } from "react-redux";
import { useXpPersistence } from "./hooks/useXpPersistence";

export const XpBar = () => {
    const { xpState, getLevelProgress, getXpToNextLevel } = useXpPersistence();
    const { experience: xp, level, nextLevelXp, totalxp } = xpState;
    const percent = getLevelProgress();
    const xpToNext = getXpToNextLevel();
  return (
    <>
    <h1>Level: {level}</h1>
    <div className='relative h-6 bg-darkBlue w-[32rem] rounded'>
        <div
            className="h-6 bg-brightBlue rounded text-black text-center transition-all duration-300 max-w-[32rem]"
            style={{ width: `${percent}%` }}
          >
        {Math.floor(xp)}
        
</div>

    </div>
    <div className="flex gap-2 mt-2 text-sm">
        <p>Next Level: {nextLevelXp} XP</p>
        <p>•</p>
        <p>XP to next: {xpToNext}</p>
    </div>
    <h1>Total XP: {totalxp}</h1>
    
    
    
    </>
    
  )
}
