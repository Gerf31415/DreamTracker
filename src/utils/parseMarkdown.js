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

  // Find section indices — headings may be bare or markdown-prefixed (e.g. ##### Dreams)
  const matchSection = (name) => (l) => l.trim().replace(/^#{1,6}\s*/, '') === name;
  const dreamsSectionIdx = lines.findIndex(matchSection('Dreams'));
  const metaSectionIdx = lines.findIndex(matchSection('Metadata'));
  const tagsSectionIdx = lines.findIndex(matchSection('Tags'));

  // -- Parse dreams --
  // Group lines into blank-line-separated blocks; first line = title, rest = description.
  const dreams = [];
  if (dreamsSectionIdx !== -1 && metaSectionIdx !== -1) {
    const dreamLines = lines.slice(dreamsSectionIdx + 1, metaSectionIdx);
    const blocks = [];
    let current = [];
    for (const line of dreamLines) {
      if (line.trim() === '') {
        if (current.length > 0) { blocks.push(current); current = []; }
      } else {
        current.push(line.trim());
      }
    }
    if (current.length > 0) blocks.push(current);

    for (const block of blocks) {
      dreams.push({
        title: block[0] ?? '',
        description: block.slice(1).join('\n').trim(),
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

    // Support both YYYY-MM-DD and M-D-YYYY date formats
    const datePatternISO = /^(\d{4})-(\d{1,2})-(\d{1,2})\s+(\d{1,2}):(\d{2})/;
    const datePatternMDY = /^(\d{1,2})-(\d{1,2})-(\d{4})\s+(\d{1,2}):(\d{2})/;

    const parseDate = (trimmed) => {
      let m = trimmed.match(datePatternISO);
      if (m) {
        return new Date(parseInt(m[1], 10), parseInt(m[2], 10) - 1, parseInt(m[3], 10), parseInt(m[4], 10), parseInt(m[5], 10));
      }
      m = trimmed.match(datePatternMDY);
      if (m) {
        return new Date(parseInt(m[3], 10), parseInt(m[1], 10) - 1, parseInt(m[2], 10), parseInt(m[4], 10), parseInt(m[5], 10));
      }
      return null;
    };

    const splitMods = (str) => str.split(',').map(s => s.trim()).filter(Boolean);

    for (const line of metaLines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Date line
      if (datePatternISO.test(trimmed) || datePatternMDY.test(trimmed)) {
        metadata.rawDate = trimmed;
        metadata.date = parseDate(trimmed);
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
        // Modifiers: inline values are treated as internal modifiers
        case 'modifiers': if (valStr) metadata.modifiers.internal = splitMods(valStr); break;
        case 'external': metadata.modifiers.external = splitMods(valStr); break;
        case 'internal': metadata.modifiers.internal = splitMods(valStr); break;
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

  const countWords = (str) => str.trim() === '' ? 0 : str.trim().split(/\s+/).length;
  const wordCount = dreams.reduce((sum, d) => sum + countWords(d.title) + countWords(d.description), 0);

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
      wordCount,
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
    wordCount: log.stats.wordCount,
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
  const totalWordCount = sorted.reduce((s, l) => s + l.stats.wordCount, 0);

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
      totalWordCount,
      avgWordCount: sorted.length ? Math.round(totalWordCount / sorted.length) : 0,
    },
  };
}
