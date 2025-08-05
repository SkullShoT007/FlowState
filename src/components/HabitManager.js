import { HabitCard } from "./HabitCard";
import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { XpBar } from "./XpBar";
import { add } from "./store/habitSlice";
export const HabitManager = () => {

  const habitList = useSelector(state => state.habitState.habitList);
  const dispatch = useDispatch()
  console.log(habitList)
  
  const titleRef = useRef()
  const descRef = useRef()
  const typeRef = useRef()
  function toggleModal(value) {
    const modal = document.getElementById("habitModal");
    if (value === 1) {
      modal.classList.remove("hidden");
      modal.classList.add("flex");
    } else if (value === 0) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  }

  function habitSubmit(event)
  {
    event.preventDefault()
    toggleModal(0);
    const title = titleRef.current.value;
    const desc = descRef.current.value;
    const type = typeRef.current.value;
    const habit = {
      id: Math.floor(Math.random() * 9000) + 1000,
      title: title,
      type: type,
      description: desc
    }
    dispatch(add(habit))
    
    
    titleRef.current.value = "";
    descRef.current.value = ""
    
  }

  return (
    <div className='bg-mainGray w-full p-8 text-myWhite'>
      <XpBar />
      <div>
        <button className="p-2 my-4 mx-2 bg-lightGray rounded">habit Manager</button>
        <button className="p-2 my-4 mx-2 bg-lightGray rounded">Analytics</button>
      </div>

      <div className='p-2'>17 July 2026</div>

      <div className="w-40">
        <button onClick={() => toggleModal(1)} className='addbtn my-7'>
          <i className="p-2 text-5xl bi bi-patch-plus-fill w-10"></i>
        </button>
      </div>

      {/* Modal */}
      <div id="habitModal" className="fixed inset-0 bg-black bg-opacity-50 hidden items-center justify-center z-50">
        
        <div className="bg-white rounded-lg shadow-lg p-6 relative w-96">
          
          <button onClick={() => toggleModal(0)} className="absolute top-2 right-2 text-gray-600 text-xl ">
            <i className="text-5xl bi bi-x-circle-fill"></i>
          </button>
          <form onSubmit={habitSubmit} className="flex flex-col justify-start gap-5 h-full text-lightGray">
            <input maxLength={20} ref = {titleRef}  className="h-10 w-56 text-center text-lightGray border border-mainGray" type="text" placeholder="enter habit name"/>
            <input maxLength={100} ref = {descRef}  className="h-10 w-56 text-center text-lightGray border border-mainGray" type="text" placeholder="description"/>
            <select ref = {typeRef} name="habit-type" id="">
              <option value="good">Good Habit</option>
              <option value="bad">Bad Habit</option>
            </select>
            <button className="p-2 w-40 bg-myBlue" type = "submit">Add Habit</button>
          </form>
        </div>
      </div>

      <div className="flex justify-start flex-wrap">
        {habitList.map((habit, index) => (
          <HabitCard key = {index} habit = {habit}/>
        ))}
      </div>
    </div>
  )
}
