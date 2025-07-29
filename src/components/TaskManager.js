import { Card } from "./Card"
export const TaskManager = () => {
  return (
    <div className='bg-mainGray w-full p-8 text-myWhite '>
        <div>
            <button className="p-2 my-4 mx-2 bg-lightGray rounded">Task Manager</button>
            <button className="p-2 my-4 mx-2 bg-lightGray rounded">Analytics</button>
        </div>
        <div className='p-2'>16 July 2026</div>
        <div className=" w-40">
            <button className='addbtn my-7'><i className=" p-2 text-5xl bi bi-patch-plus-fill w-10"></i></button>
        </div>
        <div className="flex justify-start flex-wrap">
            <Card />
            <Card />
            <Card />
            <Card />
        </div>
    </div>
  )
}
