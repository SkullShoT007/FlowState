import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

// Fake distraction data (minutes per hour)
const fakeDistractionData = [
  { hour: "08 AM", Phone: 5, SocialMedia: 10, Browsing: 2 },
  { hour: "09 AM", Phone: 0, SocialMedia: 15, Browsing: 8 },
  { hour: "10 AM", Phone: 12, SocialMedia: 5, Browsing: 10 },
  { hour: "11 AM", Phone: 8, SocialMedia: 12, Browsing: 5 },
  { hour: "12 PM", Phone: 15, SocialMedia: 20, Browsing: 10 },
  { hour: "01 PM", Phone: 7, SocialMedia: 8, Browsing: 4 },
  { hour: "02 PM", Phone: 4, SocialMedia: 5, Browsing: 15 },
  { hour: "03 PM", Phone: 10, SocialMedia: 12, Browsing: 3 },
  { hour: "04 PM", Phone: 6, SocialMedia: 10, Browsing: 2 },
  { hour: "05 PM", Phone: 8, SocialMedia: 5, Browsing: 7 },
  { hour: "06 PM", Phone: 12, SocialMedia: 15, Browsing: 5 },
  { hour: "07 PM", Phone: 5, SocialMedia: 7, Browsing: 12 },
];

export const DistractionTimeline = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Distraction Timeline</h2>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={fakeDistractionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hour" />
          <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Phone" stackId="a" fill="#ff9800" />
          <Bar dataKey="SocialMedia" stackId="a" fill="#3f51b5" />
          <Bar dataKey="Browsing" stackId="a" fill="#4caf50" />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-sm text-gray-500">
        Shows minutes lost to each type of distraction per hour.
      </p>
    </div>
  );
};