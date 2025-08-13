
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Example category colors
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

// Fake data
const fakeData = [
  { category: "Coding", minutes: 120 },
  { category: "Reading", minutes: 40 },
  { category: "Wellness", minutes: 20 },
  { category: "Exercise", minutes: 30 },
  { category: "Planning", minutes: 25 }
];

export const SessionDistribution = () => {
  return (
    <div className="w-full bg-white rounded-lg shadow p-4 h-full">
      <h2 className="text-xl font-semibold text-center">Session Distribution</h2>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={fakeData}
            dataKey="minutes"
            nameKey="category"
            cx="50%"
            cy="50%"
            outerRadius={60}
            fill="#8884d8"
            label
          >
            {fakeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value} min`} />
          <Legend  wrapperStyle={{
    fontSize: '14px',   // Change legend text size
    padding: '10px',    // Optional: adjust spacing
  }}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
