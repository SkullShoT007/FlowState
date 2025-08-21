import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useSelector } from "react-redux";

export const TaskDifficultyChart = () => {
  const tasks = useSelector((state) => state.taskState.taskList);
  const easy = tasks.filter(t => Number(t.difficulty) === 10).length;
  const medium = tasks.filter(t => Number(t.difficulty) === 20).length;
  const hard = tasks.filter(t => Number(t.difficulty) === 50).length;
  const data = [
    { difficulty: "Easy", tasks: easy },
    { difficulty: "Medium", tasks: medium },
    { difficulty: "Hard", tasks: hard },
  ];

  return (
    <div className="p-4 shadow rounded-2xl bg-white">
      <h2 className="text-lg font-semibold mb-2">Tasks by Difficulty</h2>
      <BarChart width={400} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="difficulty" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="tasks" fill="#673AB7" />
      </BarChart>
    </div>
  );
};
