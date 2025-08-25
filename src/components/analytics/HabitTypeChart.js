import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,  Cell} from "recharts";
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
    <div className="p-4 shadow rounded-2xl bg-darkGray text-myWhite">
  <h2 className="text-lg font-semibold mb-2">Habits by Type</h2>
  <BarChart width={300} height={250} data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#424549" />
    <XAxis dataKey="type" stroke="#ffffff" />
    <YAxis stroke="#ffffff" />
    <Tooltip
      contentStyle={{ backgroundColor: '#36393E', border: '1px solid #424549', color: '#ffffff' }}
      labelStyle={{ color: '#ffffff' }}
      itemStyle={{ color: '#ffffff' }}
    />
    <Legend wrapperStyle={{ color: '#ffffff' }} />
    <Bar dataKey="count">
      {data.map((entry, index) => (
        <Cell 
          key={`cell-${index}`} 
          fill={["#87A2FF", "#EF5A6F", "#A072F7", "#72F79B", "#F7E372"][index % 5]} 
        />
      ))}
    </Bar>
  </BarChart>
</div>
  );
};
