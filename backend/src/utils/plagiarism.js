const getTokens = (text) => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(token => token.length > 1);
};

const calculateCosineSimilarity = (text1, text2) => {
  const tokens1 = getTokens(text1);
  const tokens2 = getTokens(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const freq1 = {};
  const freq2 = {};

  tokens1.forEach(t => freq1[t] = (freq1[t] || 0) + 1);
  tokens2.forEach(t => freq2[t] = (freq2[t] || 0) + 1);

  const allTerms = new Set([...Object.keys(freq1), ...Object.keys(freq2)]);

  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;

  allTerms.forEach(term => {
    const val1 = freq1[term] || 0;
    const val2 = freq2[term] || 0;
    dotProduct += val1 * val2;
    mag1 += val1 * val1;
    mag2 += val2 * val2;
  });

  const magnitude = Math.sqrt(mag1) * Math.sqrt(mag2);
  if (magnitude === 0) return 0;

  return Math.round((dotProduct / magnitude) * 100);
};

module.exports = { calculateCosineSimilarity };
