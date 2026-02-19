import { Link } from 'react-router-dom';
import { useDreams } from '../context/DreamContext';

function scoreColor(val) {
  if (val == null) return 'rgba(255,255,255,0.4)';
  if (val >= 7) return '#34d399';
  if (val >= 4) return '#fbbf24';
  return '#f87171';
}

export default function LogList() {
  const { logs, removeLog } = useDreams();

  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-5xl mb-4">📋</div>
        <h1 className="text-2xl font-bold mb-2">No logs uploaded</h1>
        <p className="text-white/40 mb-6">Upload your dream log files to get started.</p>
        <Link to="/upload" className="btn-primary">Upload Logs</Link>
      </div>
    );
  }

  const sorted = [...logs].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date - a.date;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dream Logs</h1>
          <p className="text-white/40 text-sm mt-0.5">{logs.length} file{logs.length !== 1 ? 's' : ''} loaded</p>
        </div>
        <Link to="/upload" className="btn-secondary text-sm">+ Upload More</Link>
      </div>

      <div className="space-y-3">
        {sorted.map(log => (
          <div key={log.filename} className="card hover:border-dream-700/50 transition-colors group">
            <div className="flex items-start justify-between gap-4">
              <Link to={`/logs/${encodeURIComponent(log.filename)}`} className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-dream-400">🌙</span>
                  <h2 className="font-semibold group-hover:text-dream-300 transition-colors truncate">
                    {log.filename}
                  </h2>
                </div>
                <p className="text-xs text-white/40 mb-3">
                  {log.date ? log.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Date unknown'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Pill label="Dreams" value={log.stats.count} />
                  <Pill label="Overall" value={log.stats.avgOverall?.toFixed(1)} color={scoreColor(log.stats.avgOverall)} />
                  <Pill label="Vividness" value={log.stats.avgVividness?.toFixed(1)} />
                  <Pill label="Lucidity" value={log.stats.avgLucidity?.toFixed(1)} />
                  <Pill label="Duration" value={log.stats.avgDuration?.toFixed(1)} />
                </div>
                {log.metadata.modifiers.external.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {log.metadata.modifiers.external.map(mod => (
                      <span key={mod} className="text-xs bg-dream-900/50 text-dream-300 border border-dream-800/50 px-2 py-0.5 rounded-full">
                        {mod}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
              <button
                onClick={() => removeLog(log.filename)}
                className="text-white/20 hover:text-red-400 transition-colors text-sm shrink-0"
                title="Remove log"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pill({ label, value, color }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-white/40">{label}:</span>
      <span className="text-xs font-semibold" style={{ color: color || 'rgba(255,255,255,0.8)' }}>
        {value ?? '—'}
      </span>
    </div>
  );
}
