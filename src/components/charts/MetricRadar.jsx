import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1730] border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="font-semibold text-white">{payload[0].payload.metric}</p>
      <p className="text-white/60 mt-1">
        Avg: <span className="text-white font-medium">{payload[0].value?.toFixed(2)}</span> / 10
      </p>
    </div>
  );
};

export default function MetricRadar({ data }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="metric"
          tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
        />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 10]}
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
          axisLine={false}
        />
        <Radar
          name="Average"
          dataKey="value"
          stroke="#a78bfa"
          fill="#a78bfa"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
