import { TaskManager } from "./TaskManager"
// import { Sidebar } from "./Sidebar"
import { HabitManager } from "./HabitManager";
// import { useState } from "react";
// import { XpBar } from "./XpBar";
// import { Header } from "./Header";

export const Home = () => {
  return (
    <main className="flex w-full text-myWhite justify-evenly mt-10">
        
           <TaskManager/>
          <HabitManager/>
       
    </main>
  )
}
