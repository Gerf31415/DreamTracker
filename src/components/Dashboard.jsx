import { useState, useMemo } from 'react';
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
  const [chartType, setChartType] = useState('line');
  const [activeModifiers, setActiveModifiers] = useState(new Set());

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

  // Collect all unique modifiers across all logs
  const allModifiers = useMemo(() => {
    const seen = new Set();
    for (const log of logs) {
      for (const m of log.metadata.modifiers.internal) seen.add(m);
      for (const m of log.metadata.modifiers.external) seen.add(m);
    }
    return [...seen].sort();
  }, [logs]);

  // Build filename → modifiers map for filtering
  const modsByFile = useMemo(() => {
    const map = {};
    for (const log of logs) {
      map[log.filename] = [
        ...log.metadata.modifiers.internal,
        ...log.metadata.modifiers.external,
      ];
    }
    return map;
  }, [logs]);

  const filteredSeries = useMemo(() => {
    if (!activeModifiers.size) return timeSeries;
    return timeSeries.filter(row =>
      (modsByFile[row.filename] || []).some(m => activeModifiers.has(m))
    );
  }, [timeSeries, activeModifiers, modsByFile]);

  // Metric toggle: click active metric when multiple selected → solo it;
  // click the solo metric → restore all; click inactive → add it.
  const toggleMetric = (key) => {
    setActiveMetrics(prev => {
      if (prev.length === 1 && prev[0] === key) return METRICS.map(m => m.key);
      if (prev.includes(key)) return [key];
      return [...prev, key];
    });
  };

  const toggleModifier = (mod) => {
    setActiveModifiers(prev => {
      const next = new Set(prev);
      next.has(mod) ? next.delete(mod) : next.add(mod);
      return next;
    });
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Total Logs" value={totals.logs} />
        <StatCard label="Total Dreams" value={totals.dreams} />
        <StatCard label="Avg / Log" value={totals.avgDreamsPerLog} />
        <StatCard label="Avg Overall" value={totals.avgOverall?.toFixed(1)} sub="out of 10" />
        <StatCard label="Avg Total Quality" value={totals.avgTotalQuality?.toFixed(2)} sub="out of 10" />
        <StatCard label="Avg Vividness" value={totals.avgVividness?.toFixed(1)} sub="out of 10" />
        <StatCard label="Avg Lucidity" value={totals.avgLucidity?.toFixed(1)} sub="out of 10" />
        <StatCard label="Avg Control" value={totals.avgControl?.toFixed(1)} sub="out of 10" />
        <StatCard label="Total Words" value={totals.totalWordCount} sub="in dreams" />
        <StatCard label="Avg Words/Log" value={totals.avgWordCount} sub="in dreams" />
      </div>

      {/* Trend chart */}
      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-white/80">Metric Trends Over Time</h2>
          <div className="flex items-center gap-3">
            {/* Bar / Line toggle */}
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-xs">
              {['line', 'bar'].map(type => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`px-3 py-1.5 font-medium capitalize transition-colors ${
                    chartType === type
                      ? 'bg-white/10 text-white'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {/* Metric toggles — click active metric to solo; click solo to restore all */}
            <div className="flex flex-wrap gap-1.5">
              {METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => toggleMetric(m.key)}
                  title={
                    activeMetrics.length === 1 && activeMetrics[0] === m.key
                      ? 'Click to show all'
                      : activeMetrics.includes(m.key)
                        ? 'Click to view solo'
                        : 'Click to add'
                  }
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
        </div>
        {timeSeries.length < 2 ? (
          <p className="text-white/30 text-sm text-center py-8">
            Upload at least 2 logs to see trends over time.
          </p>
        ) : (
          <TrendChart data={timeSeries} activeMetrics={activeMetrics} chartType={chartType} />
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

      {/* Log summary table */}
      {timeSeries.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-white/80 mb-4">Log Summary</h2>

          {/* Modifier filter */}
          {allModifiers.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-white/30 uppercase tracking-wider">Filter:</span>
              {allModifiers.map(mod => (
                <button
                  key={mod}
                  onClick={() => toggleModifier(mod)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    activeModifiers.has(mod)
                      ? 'bg-dream-900 text-dream-300 border-dream-700'
                      : 'text-white/30 border-white/10 hover:text-white/60 hover:border-white/20'
                  }`}
                >
                  {mod}
                </button>
              ))}
              {activeModifiers.size > 0 && (
                <button
                  onClick={() => setActiveModifiers(new Set())}
                  className="text-xs text-white/30 hover:text-white/60 underline transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  {['Date', 'Dreams', 'Words', 'Total Quality', 'Overall', 'Vividness', 'Lucidity', 'Control', 'Duration'].map(h => (
                    <th key={h} className="pb-2 pr-4 text-xs font-semibold text-white/40 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filteredSeries].reverse().map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-2.5 pr-4 text-white/70">{row.date}</td>
                    <td className="py-2.5 pr-4 text-white">{row.count}</td>
                    <td className="py-2.5 pr-4 text-white/70">{row.wordCount ?? '—'}</td>
                    <td className="py-2.5 pr-4">
                      <span className="font-semibold" style={{ color: scoreColor(row.totalQuality) }}>
                        {row.totalQuality?.toFixed(2) ?? '—'}
                      </span>
                    </td>
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
            {filteredSeries.length === 0 && activeModifiers.size > 0 && (
              <p className="text-white/30 text-sm text-center py-6">No logs match the selected modifier filter.</p>
            )}
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
