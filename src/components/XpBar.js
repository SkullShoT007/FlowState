import { useSelector } from "react-redux";
import { useXpPersistence } from "./hooks/useXpPersistence";

export const XpBar = () => {
    const { xpState, getLevelProgress, getXpToNextLevel, saveXpData, resetXpData } = useXpPersistence();
    const { experience: xp, level, nextLevelXp, totalxp } = xpState;
    const percent = getLevelProgress();
    const xpToNext = getXpToNextLevel();
  return (
    <>
    <h1>Level: {level}</h1>
    <div className='relative h-6 bg-white w-[32rem] rounded'>
        <div
            className="h-6 bg-myBlue rounded text-black text-center transition-all duration-300 max-w-[32rem]"
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
    
    {/* Development/Admin Controls */}
    <div className="flex gap-2 mt-4">
        <button 
            onClick={saveXpData}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            title="Manually save XP data to IndexedDB"
        >
            Save XP
        </button>
        <button 
            onClick={() => {
                if (window.confirm('Are you sure you want to reset all XP data? This cannot be undone.')) {
                    resetXpData();
                }
            }}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            title="Reset all XP data"
        >
            Reset XP
        </button>
    </div>
    </>
    
  )
}
