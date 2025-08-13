
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

const data = [
  { date: "Mon", focusMinutes: 120 },
  { date: "Tue", focusMinutes: 180 },
  { date: "Wed", focusMinutes: 90 },
  { date: "Thu", focusMinutes: 150 },
  { date: "Fri", focusMinutes: 200 },
  { date: "Sat", focusMinutes: 80 },
  { date: "Sun", focusMinutes: 160 },
];

export const  DailyFocusChart = () =>{
  const avgFocus =
    data.reduce((acc, curr) => acc + curr.focusMinutes, 0) / data.length;

  return (
    <div className="bg-darkGray  rounded-lg shadow-md w-full h-full flex flex-col justify-center items-center">
      <h2 className="text-xl font-bold text-black">Daily Focus Time</h2>
      <ResponsiveContainer width="80%" height="80%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb" }}
            formatter={(value) => [`${value} min`, "Focus Time"]}
          />
          <ReferenceLine
            y={avgFocus}
            label={{ value: "Avg", position: "insideTopRight", fill: "#2563eb" }}
            stroke="#2563eb"
            strokeDasharray="3 3"
          />
          <Area
            type="monotone"
            dataKey="focusMinutes"
            stroke="#2563eb"
            fillOpacity={1}
            fill="url(#focusGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}