import { useSelector } from "react-redux";

export const XpBar = () => {
    const xp = useSelector(state => state.xpState.experience);
    const level = useSelector(state => state.xpState.level);
    const nextLevelXp = useSelector(state=> state.xpState.nextLevelXp)
    const totalxp = useSelector(state => state.xpState.totalxp)
    const percent = xp/nextLevelXp*100;
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
    <h1>Next Level: {nextLevelXp} XP</h1>
    <h1>Total XP: {totalxp}</h1>
    </>
    
  )
}
