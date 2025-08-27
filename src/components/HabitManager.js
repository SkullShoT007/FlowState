import { HabitCard } from "./HabitCard";
import { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// import { XpBar } from "./XpBar";
import { add, setHabits } from "./store/habitSlice";
import { addToDB, getHabits } from "./indexedDB/HabitDB";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";


function arrayMove(array, from, to) {
  const updated = [...array];
  const [movedItem] = updated.splice(from, 1);
  updated.splice(to, 0, movedItem);
  return updated;
}
export const HabitManager = () => {
  const habitList = useSelector((state) => state.habitState.habitList);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);

  const getHabitPos = (id) => habitList.findIndex((habit) => habit.id === id);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return; // dropped outside
    if (active.id === over.id) return;

    const originalPos = getHabitPos(active.id);
    const newPos = getHabitPos(over.id);

    const reordered = arrayMove(habitList, originalPos, newPos);
    dispatch(setHabits(reordered));
  }

  useEffect(() => {
    async function fetchHabits() {
      const habits = await getHabits();
      dispatch(setHabits(habits));
    }
    fetchHabits();
  }, [dispatch]);

  const titleRef = useRef();
  const typeRef = useRef();
  function habitSubmit(event) {
    event.preventDefault();

    const title = titleRef.current.value;
    const type = typeRef.current.value;

    const habit = {
      id: Math.floor(Math.random() * 9000) + 1000,
      title,
      type: type,
      completed: false,
    };

    addToDB(habit);
    dispatch(add(habit));

    titleRef.current.value = "";
  }

  return (
    <div className=" p-8 text-myWhite">
      

      <div className="w-80 p-2 bg-dullBlue rounded">
        
        <form
          className="habit-form flex flex-col items-center"
          onSubmit={habitSubmit}
          onFocus={() => setExpanded(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              if (!titleRef.current.value) setExpanded(false);
            }
          }}
        >
          <input
            ref={titleRef}
            className={`p-2 w-full m-auto rounded bg-darkerBlue transition-all duration-300 ${
              expanded ? "h-16" : "h-10"
            }`}
            type="text"
            placeholder="enter habit"
          />

          {expanded && (
            <select
              ref={typeRef}
              className="bg-dullBlue p-2 rounded w-60 m-auto mt-2 transition-opacity duration-300"
              name="habit-type"
            >
              <option value="good">Good Habit</option>
              <option value="bad">Bad Habit</option>
            </select>
          )}
        </form>

        
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <SortableContext items={habitList} strategy={verticalListSortingStrategy}>
            {habitList.map((habit) => (
              <HabitCard key={habit.id} habit={habit} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
