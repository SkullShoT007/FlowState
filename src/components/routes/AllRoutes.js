import {Routes, Route} from "react-router-dom"
import { TaskManager } from "../TaskManager"
import { HabitManager } from "../HabitManager"
import { Analytics } from "../analytics/Analytics"
import { Pomodoro } from "../Pomodoro"

export const AllRoutes = () => {
  return (
    
    <Routes>
        <Route path = "/tasks" element={<TaskManager />}/>
        <Route path = "/habits" element={<HabitManager />}/>
        <Route path = "/analytics" element={<Analytics />}/>
        <Route path = "/pomodoro"element = {<Pomodoro/>}/>
    </Routes>
  )
}
