import { createContext, useContext, useState, useCallback } from 'react';
import { parseDreamLog, aggregateLogs } from '../utils/parseMarkdown';

const DreamContext = createContext(null);

export function DreamProvider({ children }) {
  const [logs, setLogs] = useState([]);
  const [aggregated, setAggregated] = useState(null);

  const addLogs = useCallback((newLogs) => {
    setLogs(prev => {
      // Deduplicate by filename
      const existing = new Set(prev.map(l => l.filename));
      const filtered = newLogs.filter(l => !existing.has(l.filename));
      const combined = [...prev, ...filtered];
      setAggregated(aggregateLogs(combined));
      return combined;
    });
  }, []);

  const removeLog = useCallback((filename) => {
    setLogs(prev => {
      const updated = prev.filter(l => l.filename !== filename);
      setAggregated(updated.length ? aggregateLogs(updated) : null);
      return updated;
    });
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setAggregated(null);
  }, []);

  const processFiles = useCallback(async (files) => {
    const parsed = [];
    for (const file of files) {
      try {
        const text = await file.text();
        const log = parseDreamLog(text, file.name);
        parsed.push(log);
      } catch (e) {
        console.error(`Failed to parse ${file.name}:`, e);
      }
    }
    if (parsed.length) addLogs(parsed);
    return parsed;
  }, [addLogs]);

  return (
    <DreamContext.Provider value={{ logs, aggregated, addLogs, removeLog, clearLogs, processFiles }}>
      {children}
    </DreamContext.Provider>
  );
}

export function useDreams() {
  const ctx = useContext(DreamContext);
  if (!ctx) throw new Error('useDreams must be used within DreamProvider');
  return ctx;
}
