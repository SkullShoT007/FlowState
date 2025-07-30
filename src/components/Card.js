import { useState } from "react";

export const Card = ({task}) => {
  const [complete, setComplete] = useState(false)
  function markCompleted()
  {
    setComplete(!complete)
  }
  
  return (
    <div className={`flex flex-col min-h-48 justify-between w-80 rounded  m-8 `}>
        <div>
            <h1 className={`text-4xl text-center  ${complete? (" bg-green-400 ") : (" bg-myBlue ")}rounded p-2 text-wrap break-words`}>{task.title}</h1>
            <p className='text-center mt-2 p-2 text-wrap break-words'>{task.description}</p>
        </div>
        <div>
            <button onClick={markCompleted} className={`w-full ${complete? "bg-red-600" : "bg-green-400"}  p-2`}>{complete?"mark not complete" : ("mark Complete")}</button>
        </div>
    </div>
  )
}
