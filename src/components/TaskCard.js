import { useState } from "react";
import { remove, update } from "./store/taskSlice";
import {completeTask, notCompleteTask} from "./store/xpSlice"
import { useDispatch } from "react-redux";
import { useRef } from "react";
import { deleteFromDB, updateTaskInDB } from "./indexedDB/TaskDB";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities"
export const TaskCard = ({task}) => {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: task.id})
  const style = {
    
    transform: CSS.Transform.toString(transform)
  }
  const [complete, setComplete] = useState(task.completed | false)
  
  const dispatch = useDispatch()
  const titleRef = useRef()
    const descRef = useRef()
    
  function markCompleted()
  {
    setComplete(!complete)
    dispatch(completeTask(task))
    console.log(task)
    dispatch(update({ ...task, completed: true }));
    updateTaskInDB({...task, completed: true})
    
  }
  function markNotCompleted()
  {
    setComplete(!complete)
    dispatch(notCompleteTask(task))
    dispatch(update({ ...task, completed: false }));
    updateTaskInDB({...task, completed: false})

  }

  function handleDelete()
  {
    dispatch(remove(task))
    deleteFromDB(task.id)
  }
  function updateTask(e) {
  e.preventDefault();
  toggleModal(0);
  const title = titleRef.current.value;
  

  const updatedTask = {
    id: task.id,
    title: title,
    difficulty: task.difficulty,
  };
  updateTaskInDB(updatedTask)


  dispatch(update(updatedTask));

  titleRef.current.value = "";
  
}

  function toggleModal(value) {
    const modal = document.getElementById(`updateModal-${task.id}`);
    if (value === 1) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    } else if (value === 0) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }
  return (
    <>
      {/* <div className={`flex flex-col min-h-48 justify-between w-80 rounded  m-8 bg-darkGray `}>
        <div className="relative">
            <h1 className={`text-4xl text-center  ${complete? (" bg-green-400 ") : (" bg-myBlue ")}rounded p-2 text-wrap break-words`}>{task.title} </h1>
            <i onClick={()=>toggleModal(1)} className="bi bi-pencil absolute top-0 right-0 text-white cursor-pointer m-1"></i>
            <p className=' text-center mt-2 p-2 text-wrap break-words'>{task.description}</p>
        </div>
        <div className="flex">
            <button onClick={complete? markNotCompleted: markCompleted} className={`w-full ${complete? "bg-red-600" : "bg-green-400"}  p-2`}>{complete?"mark not complete" : ("mark Complete")}</button>
            <button onClick={handleDelete} className={`w-full bg-extraLightGray  p-2`}><i className="bi bi-archive"></i></button>
        </div>
    </div> */}

    <div style={style} ref={setNodeRef} {...attributes} className="group flex justify-between w-full h-12 hover:h-16 transition-all bg-darkBlue rounded mt-2">
  
  <button onClick={markCompleted} className="bg-brightBlue px-4 rounded-l">+</button>

  
  <h1 className="text-center m-auto pt-2 cursor-grab active:cursor-grabbing h-full w-96"  {...listeners}>
    {task.title}
  </h1>

  <div className="flex flex-col opacity-0 group-hover:opacity-100 transition">
    <i onClick={() => toggleModal(1)} className="bi bi-pencil-square p-1 cursor-pointer"></i>
    <i onClick={handleDelete} className="bi bi-trash3-fill p-1 cursor-pointer"></i>
  </div>
</div>
     <div id={`updateModal-${task.id}`} className="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        
        <div className="bg-white rounded-lg shadow-lg p-6 relative w-96">
          
          <button onClick={() => toggleModal(0)} className="absolute top-2 right-2 text-gray-600 text-xl ">
            <i className="text-5xl bi bi-x-circle-fill"></i>
          </button>
          <form onSubmit={updateTask} className="flex flex-col justify-start gap-5 h-full">
            <input maxLength={20} ref = {titleRef}  className="h-10 w-56 text-center text-lightGray border border-mainGray" type="text" placeholder="enter task name"/>
            
            <button className="p-2 w-40 bg-myBlue" type = "submit">Update Task</button>
          </form>
        </div>
      </div>
    </>
    
    
  )
}
