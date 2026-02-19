import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const METRICS = [
  { key: 'overall', color: '#a78bfa', label: 'Overall' },
  { key: 'vividness', color: '#60a5fa', label: 'Vividness' },
  { key: 'lucidity', color: '#34d399', label: 'Lucidity' },
  { key: 'control', color: '#f472b6', label: 'Control' },
  { key: 'consequence', color: '#fb923c', label: 'Consequence' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#1a1730] border border-white/10 rounded-xl p-3 text-sm shadow-xl">
      <p className="font-semibold text-white/70 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span style={{ color: p.color }}>●</span>
          <span className="text-white/60">{p.name}:</span>
          <span className="text-white font-medium">{p.value?.toFixed(2) ?? '—'}</span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data, activeMetrics = METRICS.map(m => m.key) }) {
  if (!data || data.length === 0) return null;
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}
          iconType="circle"
          iconSize={8}
        />
        {METRICS.filter(m => activeMetrics.includes(m.key)).map(m => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            name={m.label}
            stroke={m.color}
            strokeWidth={2}
            dot={{ r: 4, fill: m.color, strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#0f0e17' }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export { METRICS };
