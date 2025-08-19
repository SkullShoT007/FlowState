import { TaskManager } from "./TaskManager"
import { Sidebar } from "./Sidebar"
import { HabitManager } from "./HabitManager";
import { useState } from "react";
import { XpBar } from "./XpBar";

export const Home = () => {
  const [btn, setBtn] = useState(true)
  return (
    <main className="flex flex-col bg-mainGray w-full p-8 text-myWhite">
       <XpBar/>
       <div className="flex justify-start">
           <TaskManager/>
          <HabitManager/>
       </div>
     
      
      
    </main>
  )
}
