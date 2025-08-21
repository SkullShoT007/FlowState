import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useSelector } from "react-redux";

export const TaskCompletionChart = () => {
  const tasks = useSelector((state) => state.taskState.taskList);
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const data = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ];
  const COLORS = ["#4CAF50", "#FF5722"];

  return (
    <div className="p-4 shadow rounded-2xl bg-white">
      <h2 className="text-lg font-semibold mb-2">Task Completion</h2>
      <PieChart width={200} height={250}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </div>
  );
};
