import { useState } from "react";
import { remove } from "./store/taskSlice";
import { useDispatch } from "react-redux";
export const Card = ({task}) => {
  const [complete, setComplete] = useState(false)
  const dispatch = useDispatch()
  function markCompleted()
  {
    setComplete(!complete)
  }

  function handleDelete()
  {
    dispatch(remove(task))
  }
  
  return (
    <div className={`flex flex-col min-h-48 justify-between w-80 rounded  m-8 bg-darkGray `}>
        <div className="darkGraybg-">
            <h1 className={`text-4xl text-center  ${complete? (" bg-green-400 ") : (" bg-myBlue ")}rounded p-2 text-wrap break-words`}>{task.title}</h1>
            <p className=' text-center mt-2 p-2 text-wrap break-words'>{task.description}</p>
        </div>
        <div>
            <button onClick={markCompleted} className={`w-full ${complete? "bg-red-600" : "bg-green-400"}  p-2`}>{complete?"mark not complete" : ("mark Complete")}</button>
            <button onClick={handleDelete}>delete</button>
        </div>
    </div>
  )
}
