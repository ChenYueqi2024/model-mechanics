const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const patch = require('./patch/model');
const { attend } = require('./attention/model');
const position = require('./position/model');
const conv = require('./convolution/model');
const retrieval = require('./retrieval/model');
const bpe = require('./bpe/model');
const causal = require('./causal/model');
const knn = require('./generalization/model');

test('following the same query preserves content-only attention even after a V edit', () => {
  const image = patch.pixels();
  for (const size of [8,16]) for (const mode of ['color','texture']) {
    const values = patch.tokenize(image,size,mode);
    const q = 2, src = 3;
    const plain = attend(values,q,src,-0.75).output;
    const swap = position.layout(values,q,true,false,attend,src,-0.75);
    assert.equal(swap.order[swap.location],q);
    plain.forEach((v,i) => assert.ok(Math.abs(v-swap.output[i]) < 1e-12));
    const a = position.layout(values,q,false,true,attend);
    const b = position.layout(values,q,true,true,attend);
    assert.ok(a.output.some((v,i) => Math.abs(v-b.output[i])>1e-5));
  }
});

test('the carried crop is taken from the original RGB patch even for the last 8px tile', () => {
  const rgb = new Uint8Array(64*64*3);
  rgb[(56*64 + 56)*3] = 255;
  const crop = position.binaryCrop(rgb,8,63,64);
  assert.equal(crop[0][0],1);
  assert.equal(crop.flat().reduce((a,b) => a+b),1);
  assert.ok(position.binaryCrop(rgb,8,0,64).flat().every(v => v === 0));
});

test('contrastive updates learn the given pairs and do not assign meaning to a zero image vector', () => {
  const vectors = retrieval.examples(conv).map(img=>retrieval.encode(img,conv));
  assert.deepEqual(vectors, [[1,0],[-1,0],[0,1],[0,-1]]);
  for (const swap of [false,true]) {
    let loss = Infinity;
    for (let i=0; i<=30; i++) {
      const state = retrieval.train(vectors,i,swap);
      assert.ok(state.loss < loss); loss = state.loss;
      if (i===30) {
        vectors.forEach((v,j) => {
          const p = retrieval.probabilities(v,state.words);
          assert.equal(p.indexOf(Math.max(...p)), (swap && j<2) ? 1-j : j);
          assert.ok(Math.abs(1-p.reduce((a,b)=>a+b)) < 1e-12);
        });
        const square = retrieval.encode(conv.scene('square'),conv);
        assert.deepEqual(retrieval.probabilities(square,state.words),[0.25,0.25,0.25,0.25]);
      }
    }
  }
});

test('caption BPE can be replayed at each round and masking excludes all future changes', () => {
  const rules = bpe.train(bpe.corpora.captions);
  for (const text of retrieval.captions) for (let i=0; i<=rules.length; i++) {
    const tokens = bpe.encode(text,rules.slice(0,i));
    assert.equal(tokens.join(''),text);
    const v = tokens.slice(0,8).map(causal.feature);
    for (let q=0;q<v.length-1;q++) {
      const edit = v.slice(); edit[q+1] = -1;
      const masked = causal.read(v,q,true);
      assert.ok(masked.weights.slice(q+1).every(w=>w===0));
      assert.deepEqual(masked,causal.read(edit,q,true));
      assert.notEqual(causal.read(v,q,false).output,causal.read(edit,q,false).output);
    }
  }
});

test('training and held-out reports count separate observations and expose the noisy label', () => {
  const data = knn.data(true);
  assert.ok(knn.heldOut.every(v=>data.every(p=>p.x!==v.x)));
  assert.deepEqual([1,3,15].map(k=>[knn.correct(data,data,k),knn.correct(data,knn.heldOut,k)]),
    [[15,26],[14,28],[9,14]]);
  const clean = knn.data(false);
  assert.equal(knn.correct(clean,knn.heldOut,1),28);
});

test('the static catalog and every forward lesson link agree on the learning path', () => {
  const order = ['patch','attention','position','convolution','retrieval','bpe','causal','gradient','generalization','rl'];
  const read = name => fs.readFileSync(path.join(__dirname,name),'utf8');
  const cards = [...read('index.html').matchAll(/class="tile" href="([^/]+)\/index.html"/g)].map(m=>m[1]);
  assert.deepEqual(cards,order);
  order.forEach((slug,i)=>{
    const html = read(slug+'/index.html');
    const footer = html.slice(html.indexOf('class="actions"'));
    const next = order[i+1] ? '../'+order[i+1]+'/index.html' : '../index.html';
    assert.ok(footer.includes('href="'+next+'"'),slug);
    if (i>0) assert.ok(footer.includes('href="../'+order[i-1]+'/index.html"'),slug);
  });
});
