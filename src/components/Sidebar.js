import { NavLink } from "react-router-dom"

export const Sidebar = () => {
    
    
  return (
    <div className='w-72 min-h-screen text-myWhite bg-darkGray p-5'>
        <div className="py-2 bg-extraLightGray rounded">
            <h1 className="text-center">Tanmay Waghmare</h1>
        </div>

        <div className="flex flex-col mt-10">
            <NavLink to ="tasks"><button  className= {`p-2 my-2  rounded`}>Tasks</button></NavLink>
            <NavLink to = "habits"><button  className= {`p-2 my-2  rounded`}>Habits</button></NavLink>
            <NavLink to = "analytics"><button  className= {`p-2 my-2  rounded`}>Analytics</button></NavLink>
            
        </div>
    </div>
  )
}
