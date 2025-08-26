import { XpBar } from "./XpBar"
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { useState, useEffect } from "react"
import { auth, provider } from "../firebase/config"
import { syncIndexedDBToFirebase } from "../firebase/firebase_sync"
export const Header = () => {
  const [isAuth, setIsAuth] = useState(JSON.parse(localStorage.getItem("isAuth")) || false)
  const [user, setUser] = useState({})
  useEffect(() => {
      // ✅ Track auth state across refresh
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser)
          setIsAuth(true)
          localStorage.setItem("isAuth", true)
          localStorage.setItem("uid", currentUser.uid)
        } else {
          setUser({})
          setIsAuth(false)
          localStorage.setItem("isAuth", false)
          localStorage.removeItem("uid")
        }
      })
      
  
      return () => unsubscribe()
    }, [])
  
    useEffect(() => {
      if (isAuth && navigator.onLine) {
        syncIndexedDBToFirebase()
      }
    }, [isAuth])
  
    function handleLogin() {
      provider.setCustomParameters({
        prompt: 'select_account',
      })
      signInWithPopup(auth, provider)
        .then((result) => {
          setUser(result.user)
          setIsAuth(true)
          localStorage.setItem("isAuth", true)
          localStorage.setItem("uid", auth.currentUser.uid)
        })
    }
  
    function handleLogout() {
      signOut(auth)
      setIsAuth(false)
      localStorage.setItem("isAuth", false)
      setUser({})
     
    }
    console.log(user)
  return (
    <div className="bg-dullBlue p-5 flex gap-10">
       <img className="w-28 h-28" src={user.photoURL || "https://placehold.co/400"} alt="Profile" />
      <div className="flex justify-between w-full items-center h-full">
        <div>
            <h1 className="text-3xl font-bold text-myWhite">{user.displayName || "user"}</h1>
        <XpBar/>
        </div>
        <div className="flex h-full place-self-start">
          <div className={`p-2 ${isAuth ? "bg-pink-500" : "bg-brightBlue"} rounded relative`}>
        {isAuth ? (
          <>
            <h1 onClick={handleLogout}
              className="text-center cursor-pointer select-none"
              
            >
              {"Logout"}
            </h1>

            
          </>
        ) : (
          <button
            onClick={handleLogin}
            type="button"
            className="rounded h-full w-full"
          >
            Sign in with Google
          </button>
        )}
      </div>
        </div>
         
      </div>
          
    </div>
  )
}
