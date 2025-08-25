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
  // App theme colors
  const COLORS = ["#7289DA", "#424549"]; // myBlue, extraLightGray

  return (
    <div className="p-4 shadow rounded-2xl bg-darkGray text-myWhite">
      <h2 className="text-lg font-semibold mb-2">Task Completion</h2>
      <PieChart width={200} height={250}>
        <Pie
          data={data}
          dataKey="value"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={false}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#36393E', border: '1px solid #424549', color: '#ffffff' }} labelStyle={{ color: '#ffffff' }} itemStyle={{ color: '#ffffff' }} />
        <Legend wrapperStyle={{ color: '#ffffff' }} />
      </PieChart>
    </div>
  );
};
