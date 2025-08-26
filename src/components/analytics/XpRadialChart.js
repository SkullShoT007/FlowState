import { RadialBarChart, RadialBar, Legend, Tooltip } from "recharts";
import { useSelector } from "react-redux";

export const XpRadialChart = () => {
  const xp = useSelector((state) => state.xpState);
  const current = Math.max(0, Number(xp.experience) || 0);
  const toNext = Math.max(0, (Number(xp.nextLevelXp) || 0) - current);
  const data = [
    { name: "XP Progress", value: current, fill: "#33ACE4" },
    { name: "Remaining", value: toNext, fill: "#424549" },
  ];

  return (
    <div className="p-4 shadow rounded-2xl bg-dullBlue text-myWhite flex flex-col items-center">
      <h2 className="text-lg font-semibold mb-2">XP Progress</h2>
      <RadialBarChart
        width={300}
        height={300}
        cx="50%"
        cy="50%"
        innerRadius="60%"
        outerRadius="100%"
        barSize={20}
        data={data}
      >
        <RadialBar
          minAngle={15}
          background
          clockWise
          dataKey="value"
        />
        <Legend iconSize={10} layout="horizontal" verticalAlign="bottom" wrapperStyle={{ color: '#ffffff' }} />
        <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #424549', color: '#ffffff' }} labelStyle={{ color: '#ffffff' }} itemStyle={{ color: '#ffffff' }} />
      </RadialBarChart>
    </div>
  );
};
