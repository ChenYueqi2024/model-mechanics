const GridLab = (() => {
  const width = 5, height = 3, start = 5, near = 0, far = 9, wall = 7;
  const alpha = 0.5, gamma = 0.95;
  const moves = [[0, -1], [1, 0], [0, 1], [-1, 0]];
  const arrows = ['↑', '→', '↓', '←'];
  const terminal = s => s === near || s === far;
  function options(s) {
    if (terminal(s) || s === wall) return [];
    const result = [];
    moves.forEach(([dx, dy], a) => {
      const x = s % width + dx, y = Math.floor(s / width) + dy;
      const next = y * width + x;
      if (x >= 0 && x < width && y >= 0 && y < height && next !== wall) result.push({ a, next });
    });
    return result;
  }
  const edges = Array.from({ length: width * height }, (_, s) => options(s));
  function shortestPath(goal) {
    const queue = [[start]];
    const visited = new Set([start]);
    for (let i = 0; i < queue.length; i++) {
      const path = queue[i];
      const position = path.at(-1);
      if (position === goal) return path;
      for (const { next } of edges[position]) {
        if (visited.has(next)) continue;
        visited.add(next);
        queue.push([...path, next]);
      }
    }
  }
  const referencePaths = { near: shortestPath(near), far: shortestPath(far) };
  const rewardAt = (position, cost) => (position === near ? 2 : position === far ? 8 : 0) - cost;

  function routeSteps(path, cost, discount) {
    return path.slice(1).map((position, index) => {
      const reward = rewardAt(position, cost);
      const weight = discount ** index;
      return { reward, weight, contribution: reward * weight };
    });
  }

  function bestMoves(q, s) {
    const best = Math.max(...edges[s].map(({ a }) => q[4 * s + a]));
    return edges[s].filter(({ a }) => q[4 * s + a] === best);
  }
  function randomStream(seed) {
    let state = seed >>> 0;
    return () => {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      return state / 4294967296;
    };
  }
  function train(cost, episodes = 400, seed = 42, { discount = gamma, epsilon = 0.25, warmup = 100 } = {}) {
    const random = randomStream(seed);
    const q = new Float64Array(width * height * 4);
    const events = [], ends = [];
    for (let episode = 1; episode <= episodes; episode++) {
      let s = start;
      for (let step = 1; step <= 80; step++) {
        const explore = random() < (episode <= warmup ? 1 : epsilon);
        const choices = explore ? edges[s] : bestMoves(q, s);
        const { a, next } = choices[Math.floor(random() * choices.length)];
        const reward = rewardAt(next, cost);
        const future = terminal(next) ? 0 : Math.max(...edges[next].map(e => q[next * 4 + e.a]));
        const old = q[s * 4 + a];
        const target = reward + discount * future;
        const value = old + alpha * (target - old);
        q[s * 4 + a] = value;
        events.push({ episode, step, s, a, next, reward, future, target, old, value, explore });
        s = next;
        if (terminal(s)) break;
      }
      ends.push(events.length);
    }
    return { events, ends };
  }
  function tableAt(events, cursor) {
    const q = new Float64Array(width * height * 4);
    for (let i = 0; i < cursor; i++) {
      const { s, a, value } = events[i];
      q[s * 4 + a] = value;
    }
    return q;
  }
  function route(q) {
    const path = [start];
    while (!terminal(path.at(-1))) {
      const { next } = bestMoves(q, path.at(-1))[0];
      if (path.includes(next)) return { path, loop: true };
      path.push(next);
    }
    return { path, loop: false };
  }
  function discountedReturn(cost, discount, steps, bonus) {
    let total = 0;
    for (let t = 0; t < steps; t++) {
      total += discount ** t * (t === steps - 1 ? bonus - cost : -cost);
    }
    return total;
  }

  const banditProbabilities = [0.35, 0.50, 0.65];
  function compareBandits(rounds, epsilon, repeats = 64) {
    const policies = [
      { epsilon: 0, choices: [0, 0, 0], tokens: 0, regret: 0 },
      { epsilon, choices: [0, 0, 0], tokens: 0, regret: 0 }
    ];
    for (let rep = 0; rep < repeats; rep++) {
      const seed = 42 + Math.imul(rep, 0x9e3779b9);
      const outcomes = randomStream(seed);
      const draws = Array.from({ length: rounds }, () =>
        banditProbabilities.map(p => Number(outcomes() < p)));
      for (const policy of policies) {
        const random = randomStream(seed ^ 0x86bd4);
        const counts = [0, 0, 0], means = [0, 0, 0];
        draws.forEach((results, round) => {
          let arm = round;
          if (round >= counts.length) {
            const best = Math.max(...means);
            const candidates = [0, 1, 2].filter(index => means[index] === best);
            arm = random() < policy.epsilon ? Math.floor(random() * counts.length)
              : candidates[Math.floor(random() * candidates.length)];
          }
          const observed = results[arm];
          counts[arm]++;
          means[arm] += (observed - means[arm]) / counts[arm];
          policy.choices[arm]++;
          policy.tokens += observed;
          policy.regret += banditProbabilities[2] - banditProbabilities[arm];
        });
      }
    }
    return policies.map(policy => ({
      fractions: policy.choices.map(count => count / (rounds * repeats)),
      tokens: policy.tokens / repeats, regret: policy.regret / repeats
    }));
  }

  const responseTypes = [
    { name: '简明且正确', accuracy: 0.94, format: 0.36 },
    { name: '详细有依据', accuracy: 0.83, format: 0.62 },
    { name: '格式漂亮但常出错', accuracy: 0.43, format: 0.98 }
  ];
  function optimizeReward(weight) {
    const scores = responseTypes.map(({ accuracy, format }) => (1 - weight) * accuracy + weight * format);
    const preferences = scores.map(score => Math.exp(8 * score));
    const total = preferences.reduce((sum, value) => sum + value, 0);
    const rates = preferences.map(value => value / total);
    const average = metric => responseTypes.reduce((sum, item, i) => sum + rates[i] * item[metric], 0);
    return { rates, accuracy: average('accuracy'), format: average('format') };
  }

  return { width, height, start, near, far, wall, arrows, alpha, gamma, edges, bestMoves, train, tableAt, route,
    referencePaths, routeSteps, discountedReturn, banditProbabilities, compareBandits, responseTypes, optimizeReward };
})();
if (typeof module !== 'undefined') module.exports = GridLab;
