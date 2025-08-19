import {Routes, Route} from "react-router-dom"
import { TaskManager } from "../TaskManager"
import { HabitManager } from "../HabitManager"
import { Analytics } from "../analytics/Analytics"
import { Pomodoro } from "../Pomodoro"
import { Home } from "../Home"

export const AllRoutes = () => {
  return (
    
    <Routes>
        <Route path = "/" element = {<Home/>}/>
        <Route path = "/tasks" element={<TaskManager />}/>
        <Route path = "/habits" element={<HabitManager />}/>
        <Route path = "/analytics" element={<Analytics />}/>
        <Route path = "/pomodoro"element = {<Pomodoro/>}/>
    </Routes>
  )
}
