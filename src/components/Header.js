import { XpBar } from "./XpBar"
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import { useState, useEffect } from "react"
import { useSelector } from 'react-redux'
import { auth, provider } from "../firebase/config"
import { syncIndexedDBToFirebase } from "../firebase/firebase_sync"
export const Header = () => {
  const [isAuth, setIsAuth] = useState(JSON.parse(localStorage.getItem("isAuth")) || false)
  const [user, setUser] = useState({})
  const level = useSelector((state) => state.xpState?.level ?? 0)
  const [isFrameModalOpen, setIsFrameModalOpen] = useState(false)
  const [selectedFrame, setSelectedFrame] = useState(() => {
    const saved = localStorage.getItem('selectedFrame')
    return saved ? Number(saved) : 1
  })
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
    
  return (
    <div className="bg-dullBlue p-5 flex gap-10">
      <div className="relative w-40 h-40 cursor-pointer" onClick={() => setIsFrameModalOpen(true)} title="Customize frame">
  {/* User Image */}
  <img
    src={user.photoURL || "https://placehold.co/400"}
    alt="Profile"
    className="absolute inset-0 m-auto w-28 h-28 rounded object-cover"
  />
  
  {/* Frame on Top */}
  <img
    src={`./Frames/frame-${selectedFrame}.png`}
    alt="Frame"
    className=" absolute top-1 inset-0 w-full h-full pointer-events-none"
  />
</div>
      
       
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
      {/* Frame Selection Modal */}
      {isFrameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsFrameModalOpen(false)} />
          <div className="relative z-10 bg-[#0f172a] text-white rounded-lg shadow-xl w-[90vw] max-w-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-semibold">Select your frame</h2>
              <button className="px-2 py-1 rounded bg-brightBlue text-black" onClick={() => setIsFrameModalOpen(false)}>Close</button>
            </div>
            <p className="text-sm opacity-80 mb-4">Frames unlock with level. Current level: {level}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((frameNum) => {
                const requiredLevel = frameNum - 1
                const unlocked = level >= requiredLevel
                const isSelected = frameNum === selectedFrame
                return (
                  <button
                    key={frameNum}
                    className={`relative aspect-square rounded overflow-hidden border ${isSelected ? 'border-brightBlue' : 'border-slate-600'} ${unlocked ? 'hover:opacity-90' : 'opacity-50 cursor-not-allowed'}`}
                    onClick={() => {
                      if (!unlocked) return
                      setSelectedFrame(frameNum)
                      localStorage.setItem('selectedFrame', String(frameNum))
                      setIsFrameModalOpen(false)
                    }}
                  >
                    <img src={`./Frames/frame-${frameNum}.png`} alt={`Frame ${frameNum}`} className="w-full h-full object-contain bg-slate-900" />
                    {!unlocked && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-xs">Requires L{requiredLevel}</div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1 right-1 text-[10px] bg-brightBlue text-black px-1 rounded">Selected</div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
          
    </div>
  )
}
