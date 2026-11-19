const test = require('node:test');
const assert = require('node:assert/strict');
const { attend } = require('./attention/model');
const patch = require('./patch/model');
const bpe = require('./bpe/model');
const rl = require('./rl/model');
const close = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} vs ${expected}`);

test('attention agrees with an explicit weighted sum of independently edited values', () => {
  for (const size of [8, 16]) {
    for (const mode of ['texture', 'color']) {
      const x = patch.tokenize(patch.pixels(), size, mode);
      const source = 3;
      const edited = attend(x, 2, source, -1.5);
      const original = attend(x, 2, source, 0);
      assert.deepEqual(original.weights, edited.weights);
      close(edited.weights.reduce((a, b) => a + b), 1);
      const scores = x.map(k => Math.exp(x[2].reduce((sum, v, i) => sum + (6*v)*(6*k[i]), 0) / 2));
      const total = scores.reduce((a,b) => a+b);
      for (let d = 0; d < 4; d++) {
        close(edited.output[d], x.reduce((sum, row, j) =>
          sum + scores[j] / total * (row[d] - (d === 0 && j === source ? 1.5 : 0)), 0));
      }
    }
  }
});

test('BPE learns different segmentations from the two corpora', () => {
  const a = bpe.train(bpe.corpora.play), b = bpe.train(bpe.corpora.ing);
  assert.deepEqual(bpe.encode('playing', a), ['play', 'i', 'n', 'g']);
  assert.deepEqual(bpe.encode('playing', b), ['p', 'l', 'a', 'y', 'ing']);
  for (const text of ['', ' playing ', '分词🦊', 'aaaa']) {
    for (let n = 0; n <= a.length; n++) assert.equal(bpe.encode(text, a.slice(0,n)).join(''), text);
  }
});

test('BPE counts overlapping pairs, merges non-overlapping matches, respects boundaries and ties', () => {
  const rounds = bpe.train('aaa ab ac');
  assert.deepEqual(rounds[0].pair, ['a','a']);
  assert.equal(rounds[0].count, 2);
  assert.deepEqual(bpe.merge([...'aaa'], ['a','a']), ['aa','a']);
  assert.deepEqual(bpe.train('ab ac')[0].pair, ['a','b']);
  assert.deepEqual(bpe.train('a b'), []);
});

test('replayed Q updates use only valid actions and zero continuation at both terminals', () => {
  const run = rl.train(0.1);
  const q = new Float64Array(60);
  for (const e of run.events) {
    assert.ok(rl.edges[e.s].some(edge => edge.a === e.a && edge.next === e.next));
    const next = rl.edges[e.next];
    const future = next.length ? Math.max(...next.map(({ a }) => q[4 * e.next + a])) : 0;
    close(future, e.future);
    close(q[4 * e.s + e.a], e.old);
    close(e.value, e.old + 0.5 * (e.reward + 0.95 * future - e.old));
    q[4 * e.s + e.a] = e.value;
  }
  assert.deepEqual(q, rl.tableAt(run.events, run.events.length));
  assert.deepEqual(run, rl.train(0.1));
});

test('the two costs lead to opposite learned and optimal destinations', () => {
  for (const [cost, goal, length] of [[0.1, rl.far, 6], [1.5, rl.near, 1]]) {
    const { events, ends } = rl.train(cost);
    assert.equal(ends.length, 400);
    const { path, loop } = rl.route(rl.tableAt(events, ends.at(-1)));
    assert.equal(loop, false);
    assert.equal(path.at(-1), goal);
    assert.equal(path.length - 1, length);
    const farReturn = 8 * rl.gamma ** 5 - cost * Array.from({ length: 6 }, (_, t) => rl.gamma ** t).reduce((a,b) => a+b);
    assert.equal(farReturn > 2 - cost, goal === rl.far);
  }
});
