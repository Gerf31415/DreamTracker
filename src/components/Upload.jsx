import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { useDreams } from '../context/DreamContext';

export default function Upload() {
  const { processFiles, logs, clearLogs } = useDreams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [lastAdded, setLastAdded] = useState(0);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setProcessing(true);
    const parsed = await processFiles(acceptedFiles);
    setLastAdded(parsed.length);
    setProcessing(false);
  }, [processFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/markdown': ['.md'], 'text/plain': ['.txt'] },
    multiple: true,
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Upload Dream Logs</h1>
      <p className="text-white/50 text-sm mb-6">
        Upload one or more markdown (.md) dream log files. Each file will be parsed and added to your dashboard.
      </p>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
          ${isDragActive
            ? 'border-dream-400 bg-dream-900/40'
            : 'border-white/20 hover:border-dream-400 hover:bg-white/5'
          }`}
      >
        <input {...getInputProps()} />
        <div className="text-4xl mb-4">{isDragActive ? '✨' : '📂'}</div>
        {isDragActive ? (
          <p className="text-dream-300 font-semibold">Drop your files here...</p>
        ) : (
          <>
            <p className="text-white/70 font-medium">Drag & drop markdown files here</p>
            <p className="text-white/30 text-sm mt-1">or click to browse</p>
          </>
        )}
        <p className="text-white/20 text-xs mt-4">.md and .txt files supported</p>
      </div>

      {processing && (
        <div className="mt-4 text-center text-dream-300 animate-pulse">Parsing files...</div>
      )}

      {lastAdded > 0 && !processing && (
        <div className="mt-4 card flex items-center justify-between">
          <span className="text-green-400 font-medium">
            Added {lastAdded} log{lastAdded !== 1 ? 's' : ''}. Total: {logs.length}
          </span>
          <button className="btn-primary text-sm" onClick={() => navigate('/')}>
            View Dashboard
          </button>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Loaded Files</h2>
            <button
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
              onClick={() => { clearLogs(); setLastAdded(0); }}
            >
              Clear all
            </button>
          </div>
          <div className="space-y-2">
            {logs.map(log => (
              <div key={log.filename} className="card flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className="text-dream-400">📄</span>
                  <div>
                    <p className="text-sm font-medium">{log.filename}</p>
                    <p className="text-xs text-white/40">
                      {log.stats.count} dream{log.stats.count !== 1 ? 's' : ''}
                      {log.date ? ` · ${log.date.toLocaleDateString()}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-white/30">
                  avg overall: {log.stats.avgOverall != null ? log.stats.avgOverall.toFixed(1) : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
