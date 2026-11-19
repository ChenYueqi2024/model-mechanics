const Attention = (() => {
  function attend(tokens, query, source, delta, keyInputs = tokens) {
    const dimension = keyInputs[0].length;
    // Shared diagonal projections Wq = Wk = 6I, Wv = I.
    const logits = keyInputs.map(key =>
      36 * key.reduce((sum, k, i) => sum + k * keyInputs[query][i], 0) / Math.sqrt(dimension));
    const max = Math.max(...logits);
    const exp = logits.map(score => Math.exp(score - max));
    const total = exp.reduce((sum, v) => sum + v, 0);
    const weights = exp.map(v => v / total);
    const base = Array.from({ length: dimension }, (_, d) =>
      tokens.reduce((sum, token, i) => sum + weights[i] * token[d], 0));
    const output = base.slice();
    output[0] += weights[source] * delta;
    return { logits, weights, base, output };
  }
  return { attend };
})();
if (typeof module !== 'undefined') module.exports = Attention;
