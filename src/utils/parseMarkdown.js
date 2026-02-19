/**
 * Parses a dream log markdown file into a structured object.
 *
 * Expected format:
 * Dreams
 * [DreamTitle]
 * [DreamDescription]
 * ...
 * Metadata
 * Count: N
 * Duration: v1, v2, ...
 * Vividness: v1, v2, ...
 * Consequence: v1, v2, ...
 * Lucidity: v1, v2, ...
 * Control: v1, v2, ...
 * Overall: v1, v2, ...
 * Modifiers:
 * External: mod1, mod2
 * M-D-YYYY H:MM
 * Tags
 * [optional tags]
 */
export function parseDreamLog(text, filename = '') {
  const lines = text.split('\n').map(l => l.trimEnd());
  const nonEmpty = (l) => l.trim() !== '';

  // Find section indices
  const dreamsSectionIdx = lines.findIndex(l => l.trim() === 'Dreams');
  const metaSectionIdx = lines.findIndex(l => l.trim() === 'Metadata');
  const tagsSectionIdx = lines.findIndex(l => l.trim() === 'Tags');

  // -- Parse dreams --
  const dreams = [];
  if (dreamsSectionIdx !== -1 && metaSectionIdx !== -1) {
    const dreamLines = lines.slice(dreamsSectionIdx + 1, metaSectionIdx).filter(nonEmpty);
    for (let i = 0; i < dreamLines.length; i += 2) {
      dreams.push({
        title: dreamLines[i]?.trim() ?? '',
        description: dreamLines[i + 1]?.trim() ?? '',
      });
    }
  }

  // -- Parse metadata --
  const metadata = {
    count: 0,
    duration: [],
    vividness: [],
    consequence: [],
    lucidity: [],
    control: [],
    overall: [],
    modifiers: { external: [], internal: [] },
    date: null,
    rawDate: '',
    tags: [],
  };

  if (metaSectionIdx !== -1) {
    const metaEnd = tagsSectionIdx !== -1 ? tagsSectionIdx : lines.length;
    const metaLines = lines.slice(metaSectionIdx + 1, metaEnd);

    const datePattern = /^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/;

    let inModifiers = false;

    for (const line of metaLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (trimmed.toLowerCase() === 'modifiers:') {
        inModifiers = true;
        continue;
      }

      if (datePattern.test(trimmed)) {
        metadata.rawDate = trimmed;
        const m = trimmed.match(datePattern);
        // M-D-YYYY H:MM
        const month = parseInt(m[1], 10) - 1;
        const day = parseInt(m[2], 10);
        const year = parseInt(m[3], 10);
        const hour = parseInt(m[4], 10);
        const minute = parseInt(m[5], 10);
        metadata.date = new Date(year, month, day, hour, minute);
        inModifiers = false;
        continue;
      }

      if (inModifiers) {
        if (/^external:/i.test(trimmed)) {
          metadata.modifiers.external = trimmed
            .replace(/^external:/i, '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        } else if (/^internal:/i.test(trimmed)) {
          metadata.modifiers.internal = trimmed
            .replace(/^internal:/i, '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        }
        continue;
      }

      // Parse key: val1, val2, ...
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx === -1) continue;
      const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
      const valStr = trimmed.slice(colonIdx + 1).trim();
      const vals = valStr.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

      switch (key) {
        case 'count': metadata.count = parseInt(valStr, 10) || 0; break;
        case 'duration': metadata.duration = vals; break;
        case 'vividness': metadata.vividness = vals; break;
        case 'consequence': metadata.consequence = vals; break;
        case 'lucidity': metadata.lucidity = vals; break;
        case 'control': metadata.control = vals; break;
        case 'overall': metadata.overall = vals; break;
      }
    }
  }

  // -- Parse tags --
  if (tagsSectionIdx !== -1) {
    const tagLines = lines.slice(tagsSectionIdx + 1).filter(nonEmpty);
    metadata.tags = tagLines.map(t => t.trim()).filter(Boolean);
  }

  // Compute averages
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;

  return {
    filename,
    dreams,
    metadata,
    stats: {
      count: metadata.count,
      avgDuration: avg(metadata.duration),
      avgVividness: avg(metadata.vividness),
      avgConsequence: avg(metadata.consequence),
      avgLucidity: avg(metadata.lucidity),
      avgControl: avg(metadata.control),
      avgOverall: avg(metadata.overall),
    },
    date: metadata.date,
  };
}

/**
 * Aggregates an array of parsed dream logs into dashboard-ready data.
 */
export function aggregateLogs(logs) {
  // Sort by date ascending
  const sorted = [...logs].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date - b.date;
  });

  // Time-series data for charts
  const timeSeries = sorted.map(log => ({
    date: log.date ? log.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : log.filename,
    rawDate: log.date,
    count: log.stats.count,
    vividness: log.stats.avgVividness != null ? +log.stats.avgVividness.toFixed(2) : null,
    consequence: log.stats.avgConsequence != null ? +log.stats.avgConsequence.toFixed(2) : null,
    lucidity: log.stats.avgLucidity != null ? +log.stats.avgLucidity.toFixed(2) : null,
    control: log.stats.avgControl != null ? +log.stats.avgControl.toFixed(2) : null,
    overall: log.stats.avgOverall != null ? +log.stats.avgOverall.toFixed(2) : null,
    duration: log.stats.avgDuration != null ? +log.stats.avgDuration.toFixed(2) : null,
    filename: log.filename,
  }));

  // Modifier frequency
  const modifierCount = {};
  for (const log of sorted) {
    for (const mod of log.metadata.modifiers.external) {
      modifierCount[mod] = (modifierCount[mod] || 0) + 1;
    }
    for (const mod of log.metadata.modifiers.internal) {
      modifierCount[mod] = (modifierCount[mod] || 0) + 1;
    }
  }
  const modifierFrequency = Object.entries(modifierCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Overall averages
  const allVividness = sorted.flatMap(l => l.metadata.vividness);
  const allLucidity = sorted.flatMap(l => l.metadata.lucidity);
  const allControl = sorted.flatMap(l => l.metadata.control);
  const allConsequence = sorted.flatMap(l => l.metadata.consequence);
  const allOverall = sorted.flatMap(l => l.metadata.overall);
  const allDuration = sorted.flatMap(l => l.metadata.duration);
  const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const totalDreams = sorted.reduce((s, l) => s + l.stats.count, 0);

  const radarData = [
    { metric: 'Vividness', value: +avg(allVividness).toFixed(2), max: 10 },
    { metric: 'Lucidity', value: +avg(allLucidity).toFixed(2), max: 10 },
    { metric: 'Control', value: +avg(allControl).toFixed(2), max: 10 },
    { metric: 'Consequence', value: +avg(allConsequence).toFixed(2), max: 10 },
    { metric: 'Overall', value: +avg(allOverall).toFixed(2), max: 10 },
  ];

  return {
    timeSeries,
    modifierFrequency,
    radarData,
    totals: {
      logs: sorted.length,
      dreams: totalDreams,
      avgDreamsPerLog: sorted.length ? +(totalDreams / sorted.length).toFixed(1) : 0,
      avgVividness: +avg(allVividness).toFixed(2),
      avgLucidity: +avg(allLucidity).toFixed(2),
      avgControl: +avg(allControl).toFixed(2),
      avgOverall: +avg(allOverall).toFixed(2),
      avgDuration: +avg(allDuration).toFixed(2),
    },
  };
}
