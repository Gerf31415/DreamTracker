import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';

const COLORS = [
  '#a78bfa', '#60a5fa', '#34d399', '#f472b6', '#fb923c',
  '#fbbf24', '#38bdf8', '#c084fc', '#4ade80', '#f87171',
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1730] border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="font-semibold text-white">{payload[0].payload.name}</p>
      <p className="text-white/60 mt-1">
        Appeared <span className="text-white font-medium">{payload[0].value}</span> time{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

export default function ModifiersChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-white/30 text-sm">
        No modifiers found in loaded logs.
      </div>
    );
  }

  const display = data.slice(0, 15);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={display} margin={{ top: 5, right: 20, left: -10, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          angle={-35}
          textAnchor="end"
          interval={0}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {display.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
