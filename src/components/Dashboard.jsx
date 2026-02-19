import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDreams } from '../context/DreamContext';
import TrendChart, { METRICS } from './charts/TrendChart';
import MetricRadar from './charts/MetricRadar';
import ModifiersChart from './charts/ModifiersChart';
import CountChart from './charts/CountChart';

function StatCard({ label, value, sub }) {
  return (
    <div className="card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? '—'}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
  const { logs, aggregated } = useDreams();
  const [activeMetrics, setActiveMetrics] = useState(METRICS.map(m => m.key));

  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🌙</div>
        <h1 className="text-2xl font-bold mb-2">No dream logs loaded</h1>
        <p className="text-white/40 mb-6 max-w-sm">
          Upload your markdown dream log files to start visualizing trends and patterns.
        </p>
        <Link to="/upload" className="btn-primary">Upload Logs</Link>
      </div>
    );
  }

  const { timeSeries, modifierFrequency, radarData, totals } = aggregated;

  const toggleMetric = (key) => {
    setActiveMetrics(prev =>
      prev.includes(key)
        ? prev.filter(k => k !== key)
        : [...prev, key]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {totals.logs} log{totals.logs !== 1 ? 's' : ''} · {totals.dreams} dream{totals.dreams !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/upload" className="btn-secondary text-sm">+ Add Logs</Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Total Logs" value={totals.logs} />
        <StatCard label="Total Dreams" value={totals.dreams} />
        <StatCard label="Avg / Log" value={totals.avgDreamsPerLog} />
        <StatCard label="Avg Overall" value={totals.avgOverall?.toFixed(1)} sub="out of 10" />
        <StatCard label="Avg Vividness" value={totals.avgVividness?.toFixed(1)} sub="out of 10" />
        <StatCard label="Avg Lucidity" value={totals.avgLucidity?.toFixed(1)} sub="out of 10" />
        <StatCard label="Total Words" value={totals.totalWordCount} sub="in dreams" />
        <StatCard label="Avg Words/Log" value={totals.avgWordCount} sub="in dreams" />
      </div>

      {/* Trend chart */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-white/80">Metric Trends Over Time</h2>
          <div className="flex flex-wrap gap-1.5">
            {METRICS.map(m => (
              <button
                key={m.key}
                onClick={() => toggleMetric(m.key)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                  activeMetrics.includes(m.key)
                    ? 'border-transparent text-white'
                    : 'border-white/10 text-white/30 hover:text-white/50'
                }`}
                style={activeMetrics.includes(m.key) ? { backgroundColor: m.color + '33', borderColor: m.color, color: m.color } : {}}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
        {timeSeries.length < 2 ? (
          <p className="text-white/30 text-sm text-center py-8">
            Upload at least 2 logs to see trends over time.
          </p>
        ) : (
          <TrendChart data={timeSeries} activeMetrics={activeMetrics} />
        )}
      </div>

      {/* Middle row: radar + dreams per log */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-white/80 mb-4">Average Metric Profile</h2>
          <MetricRadar data={radarData} />
        </div>
        <div className="card">
          <h2 className="font-semibold text-white/80 mb-4">Dreams Per Log</h2>
          <CountChart data={timeSeries} />
        </div>
      </div>

      {/* Modifiers */}
      <div className="card">
        <h2 className="font-semibold text-white/80 mb-4">External Modifier Frequency</h2>
        <ModifiersChart data={modifierFrequency} />
      </div>

      {/* Recent logs table */}
      {timeSeries.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white/80 mb-4">Log Summary</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {['Date', 'Dreams', 'Words', 'Overall', 'Vividness', 'Lucidity', 'Control', 'Duration'].map(h => (
                    <th key={h} className="pb-2 pr-4 text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...timeSeries].reverse().map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-4 text-white/70">{row.date}</td>
                    <td className="py-2.5 pr-4 text-white">{row.count}</td>
                    <td className="py-2.5 pr-4 text-white/70">{row.wordCount ?? '—'}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-semibold" style={{ color: scoreColor(row.overall) }}>
                        {row.overall?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-white/70">{row.vividness?.toFixed(1) ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-white/70">{row.lucidity?.toFixed(1) ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-white/70">{row.control?.toFixed(1) ?? '—'}</td>
                    <td className="py-2.5 pr-4 text-white/70">{row.duration?.toFixed(1) ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function scoreColor(val) {
  if (val == null) return 'rgba(255,255,255,0.4)';
  if (val >= 7) return '#34d399';
  if (val >= 4) return '#fbbf24';
  return '#f87171';
}
