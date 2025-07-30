import { Card } from "./Card"
export const HabitManager = () => {
  return (
    <div className='bg-mainGray w-full p-8 text-myWhite '>
            <div>
                <button className="p-2 my-4 mx-2 bg-lightGray rounded">Habit Manager</button>
                <button className="p-2 my-4 mx-2 bg-lightGray rounded">Analytics</button>
            </div>
            <div className='p-2'>1 July 2026</div>
            <div>
                <button className='my-7'><i class=" p-2 text-5xl bi bi-patch-plus-fill w-10"></i></button>
            </div>
            <div className="flex justify-start flex-wrap items-start">
                <Card />
                <Card />
                <Card />
                <Card />
            </div>
        </div>
  )
}
