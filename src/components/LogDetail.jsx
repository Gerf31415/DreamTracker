import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDreams } from '../context/DreamContext';

const METRIC_COLORS = {
  vividness: '#60a5fa',
  consequence: '#fb923c',
  lucidity: '#34d399',
  control: '#f472b6',
  overall: '#a78bfa',
  duration: '#fbbf24',
};

function ScoreBar({ label, values, color }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/50 uppercase tracking-wider font-medium">{label}</span>
        <div className="flex gap-2">
          {values.map((v, i) => (
            <span key={i} className="text-xs font-semibold" style={{ color }}>
              {v}
            </span>
          ))}
        </div>
      </div>
      <div className="flex gap-1.5">
        {values.map((v, i) => (
          <div key={i} className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${(v / 10) * 100}%`, backgroundColor: color }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LogDetail() {
  const { filename } = useParams();
  const { logs, removeLog } = useDreams();
  const navigate = useNavigate();
  const decoded = decodeURIComponent(filename);
  const log = logs.find(l => l.filename === decoded);

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-xl font-bold mb-2">Log not found</h1>
        <p className="text-white/40 mb-6">This log may have been removed.</p>
        <Link to="/logs" className="btn-secondary">Back to Logs</Link>
      </div>
    );
  }

  const handleRemove = () => {
    removeLog(log.filename);
    navigate('/logs');
  };

  const hasModifiers = log.metadata.modifiers.external.length > 0 || log.metadata.modifiers.internal.length > 0;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Link to="/logs" className="text-white/40 hover:text-white/70 text-sm transition-colors">
          ← Logs
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold break-all">{log.filename}</h1>
          {log.date && (
            <p className="text-white/40 mt-1">
              {log.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {' · '}
              {log.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
            </p>
          )}
        </div>
        <button onClick={handleRemove} className="text-xs text-red-400/60 hover:text-red-400 border border-red-400/20 hover:border-red-400/50 px-3 py-1.5 rounded-lg transition-all">
          Remove
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Dreams */}
        <div className="card md:col-span-2">
          <h2 className="font-semibold text-white/70 mb-4">
            Dreams
            <span className="ml-2 text-xs bg-dream-900 text-dream-300 border border-dream-700 px-2 py-0.5 rounded-full">{log.stats.count}</span>
            <span className="ml-2 text-xs text-white/30">{log.stats.wordCount} words</span>
          </h2>
          <div className="space-y-4">
            {log.dreams.map((dream, i) => (
              <div key={i} className="border-l-2 border-dream-700 pl-4">
                <p className="font-semibold text-dream-300 text-sm">{dream.title}</p>
                <p className="text-white/60 text-sm mt-1 leading-relaxed">{dream.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics */}
        <div className="card">
          <h2 className="font-semibold text-white/70 mb-4">Metrics</h2>
          {log.metadata.vividness.length > 0 && (
            <ScoreBar label="Vividness" values={log.metadata.vividness} color={METRIC_COLORS.vividness} />
          )}
          {log.metadata.consequence.length > 0 && (
            <ScoreBar label="Consequence" values={log.metadata.consequence} color={METRIC_COLORS.consequence} />
          )}
          {log.metadata.lucidity.length > 0 && (
            <ScoreBar label="Lucidity" values={log.metadata.lucidity} color={METRIC_COLORS.lucidity} />
          )}
          {log.metadata.control.length > 0 && (
            <ScoreBar label="Control" values={log.metadata.control} color={METRIC_COLORS.control} />
          )}
          {log.metadata.overall.length > 0 && (
            <ScoreBar label="Overall" values={log.metadata.overall} color={METRIC_COLORS.overall} />
          )}
          {log.metadata.duration.length > 0 && (
            <ScoreBar label="Duration" values={log.metadata.duration} color={METRIC_COLORS.duration} />
          )}
        </div>

        {/* Averages + Modifiers */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-white/70 mb-3">Averages</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Overall', log.stats.avgOverall, METRIC_COLORS.overall],
                ['Vividness', log.stats.avgVividness, METRIC_COLORS.vividness],
                ['Lucidity', log.stats.avgLucidity, METRIC_COLORS.lucidity],
                ['Control', log.stats.avgControl, METRIC_COLORS.control],
                ['Consequence', log.stats.avgConsequence, METRIC_COLORS.consequence],
                ['Duration', log.stats.avgDuration, METRIC_COLORS.duration],
              ].map(([label, val, color]) => (
                <div key={label} className="bg-white/5 rounded-lg p-2.5">
                  <p className="text-xs text-white/40">{label}</p>
                  <p className="text-lg font-bold mt-0.5" style={{ color }}>
                    {val != null ? val.toFixed(1) : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {hasModifiers && (
            <div className="card">
              <h2 className="font-semibold text-white/70 mb-3">Modifiers</h2>
              {log.metadata.modifiers.external.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-2">External</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.metadata.modifiers.external.map(mod => (
                      <span key={mod} className="text-xs bg-dream-900/50 text-dream-300 border border-dream-800 px-2 py-0.5 rounded-full">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {log.metadata.modifiers.internal.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Internal</p>
                  <div className="flex flex-wrap gap-1.5">
                    {log.metadata.modifiers.internal.map(mod => (
                      <span key={mod} className="text-xs bg-purple-900/50 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full">
                        {mod}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {log.metadata.tags.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-white/70 mb-3">Tags</h2>
              <div className="flex flex-wrap gap-1.5">
                {log.metadata.tags.map(tag => (
                  <span key={tag} className="text-xs bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
