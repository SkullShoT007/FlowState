import React from 'react'
import { useSelector } from "react-redux";

export const XpBar = () => {
    const xp = useSelector(state => state.xpState.experience);
    const percent = xp/100*100;
  return (
    <div className='relative h-6 bg-white w-[32rem] rounded'>
        <div
  className="h-6 bg-myBlue rounded text-black text-center transition-all duration-300 max-w-[32rem]"
  style={{ width: `${percent}%` }}
>
  {Math.floor(percent)}%
</div>
    </div>
  )
}
