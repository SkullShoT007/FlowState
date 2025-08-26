import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useMemo } from "react";
import { useSelector } from "react-redux";

export const PomodoroModeChart = () => {
  const sessions = useSelector((state) => state.pomodoroState.sessions);
  const data = useMemo(() => {
    const byDate = new Map();
    sessions.forEach(s => {
      const key = s.date || (s.endTime ? new Date(s.endTime).toISOString().slice(0,10) : '');
      if (!key) return;
      const current = byDate.get(key) || { date: key, focus: 0, break: 0 };
      const minutes = Math.round((Number(s.durationMs) || 0) / 60000);
      if (s.mode === 'focus') current.focus += minutes;
      else current.break += minutes;
      byDate.set(key, current);
    });
    return Array.from(byDate.values()).sort((a,b) => a.date.localeCompare(b.date));
  }, [sessions]);

  return (
    <div className="p-4 shadow rounded-2xl bg-dullBlue text-myWhite">
      <h2 className="text-lg font-semibold mb-2">Pomodoro Focus vs Break</h2>
      <BarChart width={400} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#424549" />
        <XAxis dataKey="date" stroke="#ffffff" />
        <YAxis stroke="#ffffff" />
        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #424549', color: '#ffffff' }} labelStyle={{ color: '#ffffff' }} itemStyle={{ color: '#ffffff' }} />
        <Legend wrapperStyle={{ color: '#ffffff' }} />
        <Bar dataKey="focus" stackId="a" fill="#33ACE4" />
        <Bar dataKey="break" stackId="a" fill="#424549" />
      </BarChart>
    </div>
  );
};
