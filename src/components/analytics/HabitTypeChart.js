import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useSelector } from "react-redux";

export const HabitTypeChart = () => {
  const habits = useSelector((state) => state.habitState.habitList);
  const good = habits.filter(h => h.type === 'good').length;
  const bad = habits.filter(h => h.type === 'bad').length;
  const data = [
    { type: "Good", count: good },
    { type: "Bad", count: bad }
  ];

  return (
    <div className="p-4 shadow rounded-2xl bg-white">
      <h2 className="text-lg font-semibold mb-2">Habits by Type</h2>
      <BarChart width={400} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="count" fill="#009688" />
      </BarChart>
    </div>
  );
};
