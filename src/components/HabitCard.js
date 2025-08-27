import { useState } from "react";
import { remove, update } from "./store/habitSlice";
import {GoodHabit, BadHabit} from "./store/xpSlice"
import { useDispatch } from "react-redux";
import { useRef } from "react";
import { deleteFromDB, updateHabitInDB } from "./indexedDB/HabitDB";
import { HabitHistoryDB } from "./indexedDB/HabitHistoryDB";
import { useSortable } from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities"
export const HabitCard = ({habit}) => {
  const {attributes, listeners, setNodeRef, transform, transition} = useSortable({id: habit.id})
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  const [complete, setComplete] = useState(habit.completed || false)
  
  const dispatch = useDispatch()
  const titleRef = useRef()
    const descRef = useRef()
    const typeRef = useRef()
    
    
  function markCompleted()
  {
    setComplete(!complete)
    if(habit.type === 'good')
    {
      dispatch(GoodHabit({xp: 50}))
      dispatch(update({ ...habit, completed: true }));
      updateHabitInDB({...habit, completed: true})
      HabitHistoryDB.recordCompletion({ habitId: habit.id, status: true }).catch(()=>{})
    }
    else if(habit.type === 'bad')
    {
      dispatch(BadHabit({xp:50}))
      dispatch(update({ ...habit, completed: true }));
      updateHabitInDB({...habit, completed: true})
      HabitHistoryDB.recordCompletion({ habitId: habit.id, status: true }).catch(()=>{})
    }

  }
  


  function handleDelete()
  {
    dispatch(remove(habit))
    deleteFromDB(habit.id)

  }
  function updatehabit(e) {
  e.preventDefault();
  toggleModal(0);
  const title = titleRef.current.value;
  const desc = descRef.current.value;
  const type = typeRef.current.value;

  const updatedhabit = {
    id: habit.id, 
    title: title,
    type: type,
    description: desc,
  };

  dispatch(update(updatedhabit));

  titleRef.current.value = "";
  descRef.current.value = "";
}

  function toggleModal(value) {
    const modal = document.getElementById(`updateModal-${habit.id}`);
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
    <div style={style} ref={setNodeRef} {...attributes} className="group flex justify-between w-full h-12 hover:h-16 transition-all bg-darkerBlue rounded mt-2">

  <button onClick={markCompleted} className={`${habit.type === 'good' ? 'bg-brightBlue' : 'bg-red-300'} px-4 rounded-l`}>+</button>

  
  <h1 className="text-center m-auto pt-2 cursor-grab active:cursor-grabbing h-full w-96"  {...listeners}>
    {habit.title}
  </h1>

  <div className="flex flex-col opacity-0 group-hover:opacity-100 transition">
    <i onClick={() => toggleModal(1)} className="bi bi-pencil-square p-1 cursor-pointer"></i>
    <i onClick={handleDelete} className="bi bi-trash3-fill p-1 cursor-pointer"></i>
  </div>
</div>
     <div id={`updateModal-${habit.id}`} className="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        
        <div className="bg-white rounded-lg shadow-lg p-6 relative w-96">
          
          <button onClick={() => toggleModal(0)} className="absolute top-2 right-2 text-gray-600 text-xl ">
            <i className="text-5xl bi bi-x-circle-fill"></i>
          </button>
          <form onSubmit={updatehabit} className="flex flex-col justify-start gap-5 h-full">
            <input maxLength={20} ref = {titleRef}  className="h-10 w-56 text-center text-lightGray border border-mainGray" type="text" placeholder="enter habit name"/>
            <input maxLength={100} ref = {descRef}  className="h-10 w-56 text-center text-lightGray border border-mainGray" type="text" placeholder="description"/>
            <select ref = {typeRef} name="habit-type" id="">
              <option value="good">Good Habit</option>
              <option value="bad">Bad Habit</option>
            </select>
            <button className="p-2 w-40 bg-myBlue" type = "submit">Update habit</button>
          </form>
        </div>
      </div>
    </>
    
    
  )
}
