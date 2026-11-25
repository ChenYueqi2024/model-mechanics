const Workbench = (() => {
  const sum = values => values.reduce((total, value) => total + value, 0);
  const mean = values => sum(values) / values.length;

  const positive = [24, 33, 45, 52, 58, 60, 65, 70, 72, 73, 77, 78, 80, 83, 84, 89, 90, 93, 96, 98];
  const negative = [3, 7, 11, 14, 18, 20, 23, 25, 27, 30, 32, 34, 37, 39, 45, 51, 53, 61, 67, 78];

  function confusion(cutoff, negativeWeight, missCost) {
    const tp = positive.filter(score => score >= cutoff).length;
    const fp = negative.filter(score => score >= cutoff).length * negativeWeight;
    const fn = positive.length - tp;
    const tn = negative.length * negativeWeight - fp;
    return { tp, fp, fn, tn, precision: tp + fp ? tp / (tp + fp) : null, recall: tp / positive.length,
      cost: (fp + fn * missCost) / (positive.length + negative.length * negativeWeight) };
  }

  function routeTokens(skew, capacity, reroute) {
    const demand = [0, 0, 0], load = [0, 0, 0];
    const tokens = Array.from({length: 12}, (_, index) => {
      const preferred = (index * 7) % 12 < Math.round(12 * skew) ? 0 : index % 3;
      demand[preferred]++;
      const order = reroute ? [preferred, (preferred + 1) % 3, (preferred + 2) % 3] : [preferred];
      const assigned = order.find(expert => load[expert] < capacity) ?? null;
      if (assigned !== null) load[assigned]++;
      return { preferred, assigned };
    });
    return { demand, load, tokens, unhandled: tokens.length - sum(load),
      rerouted: tokens.filter(token => token.assigned !== null && token.preferred !== token.assigned).length };
  }

  function attention(size, mode, window, depth) {
    const rows = Array.from({length: size}, (_, i) => Array.from({length: i + 1}, (_, j) => j)
      .filter(j => mode === 'full' || i - j < window || (mode === 'anchors' && (i % 4 === 3 || j % 4 === 3))));
    let reachable = new Set([size - 1]);
    for (let step = 0; step < depth; step++) reachable = new Set([...reachable].flatMap(token => rows[token]));
    return { rows, reachable, pairs: sum(rows.map(row => row.length)), full: size * (size + 1) / 2 };
  }

  const compareSets = {
    repeat: [1, 3, 1, 3], constant: [2, 2, 2], outlier: [1, 3, 8], reverse: [3, 1]
  };
  function aggregate(mode, fixture) {
    const pool = mode === 'sum' ? sum : mode === 'mean' ? mean : values => Math.max(...values);
    return [[1, 3], compareSets[fixture]].map(values => ({values, result: pool(values)}));
  }

  function smooth(depth, retain) {
    const initial = [0, 0, 0, 0, 1, 1, 1, 1];
    let values = initial;
    for (let i = 0; i < depth; i++) {
      values = values.map((_, node) => (1 - retain) *
        mean(values.slice(Math.max(0, node - 1), node + 2)) + retain * initial[node]);
    }
    return { values, difference: mean(values.slice(4)) - mean(values.slice(0, 4)) };
  }

  function bellman(success, discount, rounds, policy) {
    let bridge = 0;
    const history = [];
    for (let step = 1; step <= rounds; step++) {
      const near = 1.9;
      const far = -0.1 + discount * bridge;
      const nextBridge = 3.9 * success - 1.1 * (1 - success);
      const value = policy === 'near' ? near : policy === 'far' ? far : Math.max(near, far);
      history.push({ step, bridge, near, far, nextBridge, value });
      bridge = nextBridge;
    }
    return history;
  }

  const logs = {
    missing: [[28, 17], [16, 12], [0, 0]],
    rare: [[24, 14], [15, 11], [2, 2]],
    covered: [[21, 13], [16, 12], [12, 4]]
  };
  function offline(log, support, prior) {
    const truth = [0.6, 0.75, 0.3];
    const actions = logs[log].map(([count, wins], i) =>
      ({ name: 'ABC'[i], count, wins, estimate: count ? wins / count : prior, actual: truth[i], supported: count >= support }));
    const choices = actions.filter(action => action.supported);
    const selected = choices.reduce((best, action) => !best || action.estimate > best.estimate ? action : best, null);
    return { actions, selected };
  }

  return { positive, negative, confusion, routeTokens, attention, aggregate, smooth, bellman, offline };
})();
if (typeof module !== 'undefined') module.exports = Workbench;
