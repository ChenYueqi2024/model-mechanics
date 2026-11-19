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
  function train(cost, episodes = 400, seed = 42) {
    const random = randomStream(seed);
    const q = new Float64Array(width * height * 4);
    const events = [], ends = [];
    for (let episode = 1; episode <= episodes; episode++) {
      let s = start;
      for (let step = 1; step <= 80; step++) {
        const explore = random() < (episode <= 100 ? 1 : 0.25);
        const choices = explore ? edges[s] : bestMoves(q, s);
        const { a, next } = choices[Math.floor(random() * choices.length)];
        const reward = (next === near ? 2 : next === far ? 8 : 0) - cost;
        const future = terminal(next) ? 0 : Math.max(...edges[next].map(e => q[next * 4 + e.a]));
        const old = q[s * 4 + a];
        const target = reward + gamma * future;
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
  return { width, height, start, near, far, wall, arrows, alpha, gamma, edges, bestMoves, train, tableAt, route };
})();
if (typeof module !== 'undefined') module.exports = GridLab;
