const test = require('node:test');
const assert = require('node:assert/strict');
const conv = require('./convolution/model');
const pool = require('./pooling/model');
const sampling = require('./sampling/model');
const {evaluate} = require('./gradient/model');
const batch = require('./minibatch/model');

test('a right shift crosses a stride-two window and changes exactly two max outputs', () => {
  const image = conv.scene('vertical');
  const run = image => pool.pool(conv.apply(image,conv.kernels.vertical).map(row=>row.map(Math.abs)),'max',2);
  assert.deepEqual(run(image),[[4,4],[4,4]]);
  assert.deepEqual(run(pool.shiftRight(image,1)),[[0,4],[0,4]]);
  assert.deepEqual(pool.shiftRight([[1,0,1,0]],2),[[1,1,1,0]]);
});

test('mean pooling uses four entries and discards incomplete windows', () => {
  const x = [[1,2,3],[4,5,6],[7,8,9]];
  assert.deepEqual(pool.pool(x,'mean',1),[[3,4],[6,7]]);
  assert.deepEqual(pool.pool(x,'mean',2),[[3]]);
});

test('stable temperature scaling and nucleus truncation keep the crossing token', () => {
  const z = [10000,9999,9998,9997];
  const a = sampling.distribution(z,1,0.8);
  assert.ok(a.probabilities[1]>0);
  assert.equal(a.probabilities[2],0);
  assert.ok(Math.abs(a.probabilities.reduce((s,v)=>s+v)-1)<1e-12);
  assert.ok(sampling.distribution(z,0.25,1).softmax[0]>sampling.distribution(z,2,1).softmax[0]);
  assert.deepEqual(sampling.distribution([0,0,0,0],1,0.5).probabilities,[0.5,0.5,0,0]);
});

test('sample intervals skip excluded tokens and replay the same uniforms across settings', () => {
  assert.equal(sampling.choose([0,0.5,0,0.5],0),1);
  assert.equal(sampling.choose([0,0.5,0,0.5],0.5),3);
  const a=sampling.replay([0,1,0,0],100), b=sampling.replay([0.25,0.25,0.25,0.25],100);
  assert.deepEqual(a.counts,[0,100,0,0]);
  assert.equal(a.lastUniform,b.lastUniform);
  assert.equal(b.counts.reduce((s,v)=>s+v),100);
  assert.deepEqual(b,sampling.replay([0.25,0.25,0.25,0.25],100));
});

test('at the same starting weight the first example and full dataset pull in opposite directions',()=>{
  const small=batch.replay(evaluate,0,0.1,1,false,1);
  const full=batch.replay(evaluate,0,0.1,4,false,1);
  assert.equal(small.batches[0].mean,9);
  assert.equal(full.batches[0].mean,-4.5);
  assert.equal(small.states[1],-0.9);
  assert.equal(full.states[1],0.45);
  assert.equal(batch.loss(evaluate,0.5),5.625);
});

test('one full pass covers the same samples and only the full-batch result ignores order',()=>{
  for (const size of [1,2,4]) {
    const run=reverse=>batch.replay(evaluate,0.9,0.1,size,reverse,4/size);
    const forward=run(false), backward=run(true);
    assert.deepEqual(forward.batches.flatMap(b=>b.labels),batch.targets);
    const difference=Math.abs(forward.states.at(-1)-backward.states.at(-1));
    assert.ok(size===4 ? difference<1e-12 : difference>0.01);
  }
});
