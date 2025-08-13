import React from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

// Fake data
const fakeStats = {
  streakDays: 12, // current streak
  bestStreak: 20, // record streak
  goalProgress: 75 // % of goal completed
};

export const StreakandGoal = () => {
  // Data for streak radial chart
  const streakData = [
    {
      name: "Streak",
      value: Math.round((fakeStats.streakDays / fakeStats.bestStreak) * 100),
      fill: "#ff9800"
    }
  ];

  // Data for goal progress bar
  const goalData = [
    {
      name: "Goal",
      Progress: fakeStats.goalProgress
    }
  ];

  return (
    <div className=" bg-darkGray rounded-lg shadow p-4">
      {/* Streak Radial Chart */}
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4 text-myWhite">Current Streak</h2>
        <ResponsiveContainer width={200} height={200}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={20}
            data={streakData}
            startAngle={90}
            endAngle={-270}
          >
            <RadialBar
              minAngle={15}
              clockWise
              dataKey="value"
              cornerRadius={10}
            />
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              wrapperStyle={{ top: "45%", left: "50%", transform: "translate(-50%, -50%)" }}
            />
            <Tooltip />
          </RadialBarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-gray-500">
          {fakeStats.streakDays} days (Best: {fakeStats.bestStreak})
        </p>
      </div>

      {/* Goal Progress Bar */}
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold mb-4 text-myWhite">Goal Progress</h2>
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={goalData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} hide />
            <YAxis dataKey="name" type="category" hide />
            <Tooltip />
            <Bar dataKey="Progress" fill="#4caf50" radius={[10, 10, 10, 10]} />
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-2 text-sm text-gray-500">
          {fakeStats.goalProgress}% complete — Keep going!
        </p>
      </div>
    </div>
  );
};