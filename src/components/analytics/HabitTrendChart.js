import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useEffect, useMemo, useState } from "react";
import HabitHistoryDB from "../indexedDB/HabitHistoryDB";

export const HabitTrendChart = () => {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    let active = true;
    HabitHistoryDB.getAllHistory().then((rows) => {
      if (active) setHistory(rows || []);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const data = useMemo(() => {
    const byDate = new Map();
    history.forEach(r => {
      const key = r.date;
      if (!key) return;
      const c = byDate.get(key) || 0;
      byDate.set(key, c + (r.status ? 1 : 0));
    });
    return Array.from(byDate.entries())
      .map(([date, completed]) => ({ date, completed }))
      .sort((a,b) => a.date.localeCompare(b.date));
  }, [history]);

  return (
    <div className="p-4 shadow rounded-2xl bg-white">
      <h2 className="text-lg font-semibold mb-2">Habit Completion Trend</h2>
      <AreaChart width={400} height={250} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="completed" stroke="#4CAF50" fill="#C8E6C9" />
      </AreaChart>
    </div>
  );
};
