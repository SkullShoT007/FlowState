import React from 'react'

export const Card = () => {
  return (
    <div className='w-80 rounded min-h-24  bg-extraLightGray m-8'>
        <div>
            <h1 className='text-4xl text-center bg-myBlue rounded p-2'>title</h1>
            <p className='text-center mt-2 p-2'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,</p>
        </div>
        <div>
            <button className='w-full bg-green-400 p-2'>Mark as Completed</button>
        </div>
        
    </div>
  )
}
