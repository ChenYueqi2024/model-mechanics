const test=require('node:test');
const assert=require('node:assert/strict');
const block=require('./transformer/model');
const vision=require('./vit/model');
const binary=require('./supervised/model');
const schedule=require('./curriculum/model');
const experts=require('./moe/model');
const graph=require('./gnn/model');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-10,a+' vs '+b);

test('a causal block excludes the future, and switching off its MLP preserves the attention residual',()=>{
  const x=[[0,1,0,0],[1,0,0,0],[0,0,1,0]];
  const row=block.run(x,true)[1], noFF=block.run(x,true,false)[1];
  close(row.weights.reduce((s,v)=>s+v),1);
  assert.equal(row.weights[2],0);
  assert.deepEqual(row.mixed,noFF.mixed);
  assert.deepEqual(noFF.output,row.residual);
  assert.notDeepEqual(row.output,row.residual);
  assert.deepEqual(block.run([...x.slice(0,2),[2,3,4,5]],true)[1],row);
  assert.deepEqual(block.norm([1,1,1,1]),[0,0,0,0]);
});

test('ViT masks the chosen patch without renumbering positions and reads the same shared block',()=>{
  const patches=[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]];
  const a=vision.classify(patches,-1,block.run);
  const b=vision.classify(patches,1,block.run);
  assert.deepEqual(b.indices,[0,2,3]);
  const expected=block.run([[0.4,-0.2,0.1,0.3],[1,0,0,0],[0,0,1,0.25],[0,0,0.25,1.25]])[0];
  assert.deepEqual(b.cls,expected);
  assert.notEqual(a.score,b.score);
  close(b.cls.weights.reduce((s,v)=>s+v),1);
});

test('one logistic update follows the signed label error and repeated passes reduce cross entropy',()=>{
  const run=y=>binary.fit([{x:2,y}],[0]);
  assert.deepEqual(run(1),{w:0.25,b:0.125});
  assert.deepEqual(run(0),{w:-0.25,b:-0.125});
  const trained=binary.fit(binary.data,schedule.order('mixed',36));
  assert.ok(binary.loss(binary.data,trained)<Math.log(2));
});

test('all three curricula train on the same multiset at epoch boundaries',()=>{
  const losses=[];
  for(const mode of ['easy','hard','mixed']){
    const steps=schedule.order(mode,36);
    for(let i=0;i<36;i+=6) assert.deepEqual(steps.slice(i,i+6).sort(),[0,1,2,3,4,5]);
    losses.push(binary.loss(binary.data,binary.fit(binary.data,steps.slice(0,6))));
  }
  assert.ok(losses[0]<losses[1]);
  assert.equal(new Set(losses).size,3);
});

test('sparse routing normalizes only the selected experts and reports unexecuted experts',()=>{
  for(const k of [1,2]) for(const x of [-1,-0.2,0.4,0.9]){
    const r=experts.route(x,k,0);
    assert.equal(r.active.length,k);
    assert.equal(r.outputs.filter(v=>v!==null).length,k);
    close(r.weights.reduce((a,b)=>a+b),1);
    close(r.value,r.outputs.reduce((a,v,i)=>a+(v??0)*r.weights[i],0));
  }
  assert.deepEqual(experts.route(0.4,1,0).active,[2]);
  assert.deepEqual(experts.route(0.4,1,1).active,[1]);
});

test('a signal takes four synchronous hops along the chain or one across the shortcut',()=>{
  const chain=graph.propagate(4,false,0).states;
  for(let layer=0;layer<4;layer++) assert.equal(chain[layer][4],0);
  close(chain[4][4],1/54);
  close(graph.propagate(1,true,0).states[1][4],1/3);
});
