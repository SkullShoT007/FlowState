
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Fake Data
const dailyStats = [
  { date: "2025-08-01", xpGained: 20 },
  { date: "2025-08-02", xpGained: 35 },
  { date: "2025-08-03", xpGained: 15 },
  { date: "2025-08-04", xpGained: 40 },
  { date: "2025-08-05", xpGained: 25 },
  { date: "2025-08-06", xpGained: 50 },
  { date: "2025-08-07", xpGained: 30 }
];

const userProfile = {
  currentLevel: 3
};

export const XpProgressionChart = () => {
  // Convert XP gained each day into cumulative XP
  let cumulativeXp = 0;
  const chartData = dailyStats.map((entry) => {
    cumulativeXp += entry.xpGained;
    return { date: entry.date, xpTotal: cumulativeXp };
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">
        XP Progression Over Time (Level {userProfile.currentLevel})
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="xpTotal"
            stroke="#4caf50"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};