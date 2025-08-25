import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useEffect, useMemo, useState } from "react";
import db from "../indexedDB/indexedDB";

export const XpProgressChart = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (db && db.xpHistory) {
          const rows = await db.xpHistory.orderBy('timestamp').toArray();
          if (active) setHistory(rows || []);
        } else {
          setHistory([]);
        }
      } catch (e) {
        console.error('Failed to load XP history', e);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const data = useMemo(() => (history.map(r => ({ date: new Date(r.timestamp).toISOString().slice(0,10), xp: r.totalxp }))), [history]);

  return (
    <div className="p-4 shadow rounded-2xl bg-darkGray text-myWhite">
      <h2 className="text-lg font-semibold mb-2">XP Progression</h2>
      <LineChart width={800} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#424549" />
        <XAxis dataKey="date" stroke="#ffffff" />
        <YAxis stroke="#ffffff" />
        <Tooltip contentStyle={{ backgroundColor: '#36393E', border: '1px solid #424549', color: '#ffffff' }} labelStyle={{ color: '#ffffff' }} itemStyle={{ color: '#ffffff' }} />
        <Legend wrapperStyle={{ color: '#ffffff' }} />
        <Line type="monotone" dataKey="xp" stroke="#7289DA" strokeWidth={2} />
      </LineChart>
    </div>
  );
};
