import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export const PomodoroDailyChart = () => {
  const sessions = useSelector((state) => state.pomodoroState.sessions);
  const data = useMemo(() => {
    const counts = new Map();
    sessions.forEach(s => {
      const key = s.date || (s.endTime ? new Date(s.endTime).toISOString().slice(0,10) : '');
      if (!key) return;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    return Array.from(counts.entries()).map(([date, sessions]) => ({ date, sessions }));
  }, [sessions]);

  return (
    <div className="p-4 shadow rounded-2xl bg-white">
      <h2 className="text-lg font-semibold mb-2">Pomodoro Sessions</h2>
      <BarChart width={400} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="sessions" fill="#FF9800" />
      </BarChart>
    </div>
  );
};
