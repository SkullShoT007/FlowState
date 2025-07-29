export const Sidebar = ({btn, setBtn}) => {
    function handleBtn(value)
    {
        if(value === 1)
        {
            setBtn(true)

        }
        else if(value === 0)
        {
            setBtn(false)
        }
    }
  return (
    <div className='w-72 min-h-screen text-myWhite bg-darkGray p-5'>
        <div className="py-2 bg-extraLightGray rounded">
            <h1 className="text-center">Tanmay Waghmare</h1>
        </div>

        <div className="flex flex-col mt-10">
            <button onClick = {() => handleBtn(1)} className= {`p-2 my-2 ${btn? "bg-lightGray" : ""} rounded`}>Tasks</button>
            <button  onClick={() => handleBtn(0)} className= {`p-2 my-2 ${!btn? "bg-lightGray" : ""} rounded`}>Habits</button>
        </div>
    </div>
  )
}
