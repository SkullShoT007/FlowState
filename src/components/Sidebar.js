import { NavLink } from "react-router-dom"

export const Sidebar = () => {
  return (
    <div className="min-w-72 min-h-screen text-myWhite bg-darkBlue p-5 border-r-2 border-myBlue">
      
        <div className="flex flex-col justify-evenly items-center mt-10 h-64">
            <NavLink to ="/">
              <div className="flex items-center">
                <h1>Home</h1>
        <svg className="hover:fill-myBlue transition" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 20C20 20.5523 19.5523 21 19 21H5C4.44772 21 4 20.5523 4 20V11L1 11L11.3273 1.6115C11.7087 1.26475 12.2913 1.26475 12.6727 1.6115L23 11L20 11V20ZM11 13V19H13V13H11Z"></path></svg>
              </div>
            </NavLink>
            
            <NavLink  className="w-6" to = "pomodoro"><svg className="hover:fill-myBlue transition" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.6177 5.9681L19.0711 4.51472L20.4853 5.92893L19.0319 7.38231C20.2635 8.92199 21 10.875 21 13C21 17.9706 16.9706 22 12 22C7.02944 22 3 17.9706 3 13C3 8.02944 7.02944 4 12 4C14.125 4 16.078 4.73647 17.6177 5.9681ZM12 20C15.866 20 19 16.866 19 13C19 9.13401 15.866 6 12 6C8.13401 6 5 9.13401 5 13C5 16.866 8.13401 20 12 20ZM11 8H13V14H11V8ZM8 1H16V3H8V1Z"></path></svg></NavLink>
            <NavLink className="w-6" to = "analytics"><svg className="hover:fill-myBlue transition" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3V19H21V21H3V3H5ZM19.9393 5.93934L22.0607 8.06066L16 14.1213L13 11.121L9.06066 15.0607L6.93934 12.9393L13 6.87868L16 9.879L19.9393 5.93934Z"></path></svg></NavLink>
        </div>
    </div>
  )
}
