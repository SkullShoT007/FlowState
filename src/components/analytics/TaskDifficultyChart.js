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
    <div className="p-4 shadow rounded-2xl bg-darkGray text-myWhite">
      <h2 className="text-lg font-semibold mb-2">Tasks by Difficulty</h2>
      <BarChart width={400} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#424549" />
        <XAxis dataKey="difficulty" stroke="#ffffff" />
        <YAxis stroke="#ffffff" />
        <Tooltip contentStyle={{ backgroundColor: '#36393E', border: '1px solid #424549', color: '#ffffff' }} labelStyle={{ color: '#ffffff' }} itemStyle={{ color: '#ffffff' }} />
        <Legend wrapperStyle={{ color: '#ffffff' }} />
        <Bar dataKey="tasks" fill="#7289DA" />
      </BarChart>
    </div>
  );
};
