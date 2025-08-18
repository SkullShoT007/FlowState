import { TaskCard } from "./TaskCard";
import { useRef, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { XpBar } from "./XpBar";
import { add, setTasks } from "./store/taskSlice";

import { addToDB, getTasks } from "./indexedDB/TaskDB";
import { closestCorners, DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";


function arrayMove(array, from, to) {
  const updated = [...array];
  const [movedItem] = updated.splice(from, 1);
  updated.splice(to, 0, movedItem);
  return updated;
}

export const TaskManager = () => {
  const taskList = useSelector((state) => state.taskState.taskList);
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);

  const getTaskPos = (id) => taskList.findIndex((task) => task.id === id);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return; // dropped outside
    if (active.id === over.id) return;

    const originalPos = getTaskPos(active.id);
    const newPos = getTaskPos(over.id);

    const reordered = arrayMove(taskList, originalPos, newPos);
    dispatch(setTasks(reordered));
  }

  useEffect(() => {
    async function fetchTasks() {
      const tasks = await getTasks();
      dispatch(setTasks(tasks));
    }
    fetchTasks();
  }, [dispatch]);

  const titleRef = useRef();
  const typeRef = useRef();

  function taskSubmit(event) {
    event.preventDefault();

    const title = titleRef.current.value;
    const diff = typeRef.current.value;

    const task = {
      id: Math.floor(Math.random() * 9000) + 1000,
      title,
      difficulty: diff,
      completed: false,
    };

    addToDB(task);
    dispatch(add(task));
    console.log(task);

    titleRef.current.value = "";
  }

  return (
    <div className="bg-mainGray w-full p-8 text-myWhite">
      <XpBar />

      <div className="w-80 p-2 bg-darkGray rounded">
        
        <form
          className="habit-form flex flex-col items-center"
          onSubmit={taskSubmit}
          onFocus={() => setExpanded(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
              if (!titleRef.current.value) setExpanded(false);
            }
          }}
        >
          <input
            ref={titleRef}
            className={`p-2 w-full m-auto rounded bg-lightGray transition-all duration-300 ${
              expanded ? "h-16" : "h-10"
            }`}
            type="text"
            placeholder="enter habit"
          />

          {expanded && (
            <select
              ref={typeRef}
              className="bg-darkGray p-2 rounded w-60 m-auto mt-2 transition-opacity duration-300"
              name="habit-type"
            >
              <option value="10">Easy</option>
              <option value="20">Medium</option>
              <option value="50">Hard</option>
            </select>
          )}
        </form>

        
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCorners}>
          <SortableContext items={taskList} strategy={verticalListSortingStrategy}>
            {taskList.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
