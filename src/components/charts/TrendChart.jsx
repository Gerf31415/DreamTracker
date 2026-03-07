import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';

const METRICS = [
  { key: 'overall',      color: '#a78bfa', label: 'Overall',       yAxis: 'left' },
  { key: 'totalQuality', color: '#e879f9', label: 'Total Quality', yAxis: 'left' },
  { key: 'vividness',    color: '#60a5fa', label: 'Vividness',     yAxis: 'left' },
  { key: 'lucidity',     color: '#34d399', label: 'Lucidity',      yAxis: 'left' },
  { key: 'control',      color: '#f472b6', label: 'Control',       yAxis: 'left' },
  { key: 'consequence',  color: '#fb923c', label: 'Consequence',   yAxis: 'left' },
  { key: 'wordCount',    color: '#94a3b8', label: 'Words',         yAxis: 'right' },
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
          <span className="text-white font-medium">
            {p.dataKey === 'wordCount' ? (p.value ?? '—') : (p.value?.toFixed(2) ?? '—')}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function TrendChart({ data, activeMetrics = METRICS.map(m => m.key), chartType = 'line' }) {
  if (!data || data.length === 0) return null;

  const activeMetricDefs = METRICS.filter(m => activeMetrics.includes(m.key));
  const hasRightAxis = activeMetricDefs.some(m => m.yAxis === 'right');

  const sharedAxes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
      <XAxis
        dataKey="date"
        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
        axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
        tickLine={false}
      />
      <YAxis
        yAxisId="left"
        domain={[0, 10]}
        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
        axisLine={false}
        tickLine={false}
      />
      {hasRightAxis && (
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={45}
        />
      )}
      <Tooltip content={<CustomTooltip />} />
      <Legend
        wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}
        iconType="circle"
        iconSize={8}
      />
    </>
  );

  if (chartType === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} margin={{ top: 5, right: hasRightAxis ? 50 : 20, left: -10, bottom: 5 }}>
          {sharedAxes}
          {activeMetricDefs.map(m => (
            <Bar
              key={m.key}
              dataKey={m.key}
              name={m.label}
              fill={m.color}
              yAxisId={m.yAxis}
              fillOpacity={0.8}
              radius={[3, 3, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 5, right: hasRightAxis ? 50 : 20, left: -10, bottom: 5 }}>
        {sharedAxes}
        {activeMetricDefs.map(m => (
          <Line
            key={m.key}
            type="monotone"
            dataKey={m.key}
            name={m.label}
            stroke={m.color}
            yAxisId={m.yAxis}
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
