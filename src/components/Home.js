import { TaskManager } from "./TaskManager"
import { Sidebar } from "./Sidebar"
import { HabitManager } from "./HabitManager";
import { useState } from "react";

export const Home = () => {
  const [btn, setBtn] = useState(true)
  return (
    <main className="flex">
      
      <Sidebar  btn = {btn} setBtn = {setBtn}/>
      
      {btn ? (<TaskManager />) : (<HabitManager />)}
      
    </main>
  )
}
