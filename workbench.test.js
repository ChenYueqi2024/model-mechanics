const test = require('node:test');
const assert = require('node:assert/strict');
const lab = require('./workbench/model');

test('changing prevalence preserves recall at a fixed threshold and lowers precision', () => {
  const balanced = lab.confusion(60, 1, 4);
  const rare = lab.confusion(60, 9, 4);
  assert.equal(balanced.recall, rare.recall);
  assert.equal(rare.fp, balanced.fp * 9);
  assert.ok(rare.precision < balanced.precision);
  assert.equal(lab.confusion(100, 1, 4).precision, null);
});

test('rerouting uses open slots without exceeding the expert capacity', () => {
  const dropped = lab.routeTokens(1, 3, false);
  const moved = lab.routeTokens(1, 3, true);
  assert.deepEqual(dropped.demand, [12, 0, 0]);
  assert.deepEqual(moved.load, [3, 3, 3]);
  assert.equal(moved.rerouted, 6);
  assert.equal(moved.unhandled, 3);
  assert.equal(dropped.unhandled, 9);
});

test('causal attention never reads the future and local coverage grows across layers', () => {
  const local = lab.attention(12, 'local', 3, 1);
  const deeper = lab.attention(12, 'local', 3, 4);
  const anchors = lab.attention(12, 'anchors', 3, 1);
  assert.equal(local.pairs, 33);
  assert.equal(local.reachable.size, 3);
  assert.equal(deeper.reachable.size, 9);
  assert.equal(anchors.reachable.size, 12);
  assert.ok(anchors.pairs < anchors.full);
  assert.ok(anchors.rows.every((entries, row) => entries.every(col => col <= row)));
});

test('pooling collisions and oversmoothing remain visible in the teaching graphs', () => {
  assert.deepEqual(lab.aggregate('mean', 'repeat').map(x => x.result), [2, 2]);
  assert.deepEqual(lab.aggregate('sum', 'repeat').map(x => x.result), [4, 8]);
  assert.equal(lab.smooth(0, 0).difference, 1);
  assert.ok(lab.smooth(24, 0).difference < lab.smooth(3, 0).difference);
  assert.ok(lab.smooth(24, 0.15).difference > lab.smooth(24, 0).difference);
});

test('synchronous Bellman backups propagate bridge value back after a round', () => {
  const trace = lab.bellman(0.8, 0.95, 3, 'optimal');
  assert.equal(trace[0].far, -0.1);
  assert.equal(trace[0].value, 1.9);
  assert.ok(Math.abs(trace[1].far - 2.655) < 1e-10);
  assert.equal(trace[2].value, trace[1].value);
  assert.equal(lab.bellman(0.8, 0.95, 3, 'near').at(-1).value, 1.9);
});

test('unsupported and underobserved actions can lead to optimistic choices', () => {
  assert.equal(lab.offline('missing', 0, 0.95).selected.name, 'C');
  assert.equal(lab.offline('missing', 1, 0.95).selected.name, 'B');
  assert.equal(lab.offline('rare', 1, 0.95).selected.name, 'C');
  assert.equal(lab.offline('rare', 3, 0.95).selected.name, 'B');
  assert.equal(lab.offline('covered', 0, 0.95).selected.name, 'B');
});

test('duplicating negative samples changes PR while preserving the ROC points', () => {
  const balanced = lab.scoreCurves(1);
  const rare = lab.scoreCurves(9);
  assert.deepEqual(balanced.points.map(p => [p.fpr, p.recall]), rare.points.map(p => [p.fpr, p.recall]));
  assert.equal(balanced.auc, rare.auc);
  assert.ok(rare.ap < balanced.ap);
  assert.deepEqual(rare.points.at(-1).precision, 0.1);
  assert.equal(rare.points.at(-1).recall, 1);
});

test('matching recall after a synthetic score shift can exceed a review quota', () => {
  const shared = lab.reviewBudget(65, 65, 26);
  const separate = lab.reviewBudget(65, 47, 26);
  assert.equal(shared.reviews, 23);
  assert.equal(shared.over, 0);
  assert.ok(Math.abs(shared.recallGap - 0.35) < 1e-12);
  assert.equal(separate.recallGap, 0);
  assert.equal(separate.reviews, 32);
  assert.equal(separate.over, 6);
  assert.equal(lab.reviewBudget(0, 0, 80).reviews, 80);
});
