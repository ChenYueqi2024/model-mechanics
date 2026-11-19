const Sampling = (() => {
  const tokens = ['r','l','t','b'];
  function logits(h) { return [2*h+0.3, 0.6*h+0.1, -0.5*h, -1.5*h-0.2]; }
  function distribution(scores, temperature, topP) {
    const max = Math.max(...scores);
    const exp = scores.map(s => Math.exp((s-max)/temperature));
    const total = exp.reduce((a,b) => a+b);
    const softmax = exp.map(v => v/total);
    const ranked = softmax.map((p,i)=>({p,i})).sort((a,b)=>b.p-a.p || a.i-b.i);
    const kept = new Set();
    let mass = 0;
    for (const {p,i} of ranked) {
      kept.add(i); mass += p;
      if (topP < 1 && mass >= topP) break;
    }
    const probabilities = softmax.map((p,i)=>kept.has(i) ? p/mass : 0);
    return { softmax, probabilities };
  }
  function choose(probabilities,u) {
    let cumulative = 0, last = 0;
    for (let i=0; i<probabilities.length; i++) {
      if (!probabilities[i]) continue;
      last = i;
      cumulative += probabilities[i];
      if (u < cumulative) return i;
    }
    return last;
  }
  function replay(probabilities,count) {
    const counts = probabilities.map(()=>0);
    let seed = 42, lastToken = null, lastUniform = null;
    for (let i=0; i<count; i++) {
      seed = (Math.imul(seed,1664525)+1013904223) >>> 0;
      lastUniform = seed/4294967296;
      lastToken = choose(probabilities,lastUniform);
      counts[lastToken]++;
    }
    return {counts,lastToken,lastUniform};
  }
  return {tokens,logits,distribution,choose,replay};
})();
if (typeof module !== 'undefined') module.exports = Sampling;
