const CausalLab = (() => {
  // Fixed scalar embeddings keep the weighted sum inspectable.
  function feature(token) {
    let hash = 0;
    for (const char of token) hash = (31 * hash + char.codePointAt(0)) % 997;
    return 0.1 + hash / 997;
  }
  function read(values, query, causal) {
    const scores = values.map((v,i) => causal && i > query ? 0 : Math.exp(values[query] * v));
    const sum = scores.reduce((a,b) => a+b, 0);
    const weights = scores.map(v => v/sum);
    return { weights, output: weights.reduce((acc,v,i) => acc + v * values[i], 0) };
  }
  return { feature, read };
})();
if (typeof module !== 'undefined') module.exports = CausalLab;
