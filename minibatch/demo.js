Course.mount('minibatch');
const { id } = Course;
const params = new URLSearchParams(location.search);
const input = Number(params.get('w'));
const initial = Number.isFinite(input) && Math.abs(input)<=20 ? input : 0;
const inputRate = Number(params.get('rate'));
const rate = [0.1,0.2,0.25].includes(inputRate) ? inputRate : 0.1;
const limit = 16;
let seen = 0;
const fmt = n => Number(n.toPrecision(5)).toString();
function trace(batch,steps) {
  return MiniBatch.replay(GradientLab.evaluate,initial,rate,batch,id('order').value==='reverse',steps);
}
function render() {
  const batch = Number(id('size').value);
  const steps = seen/batch;
  const replay = trace(batch,steps+1);
  const weight = replay.states[steps], next = replay.batches[steps];
  const all = MiniBatch.targets.map(y=>GradientLab.evaluate(weight,y).gradient);
  const full = all.reduce((a,b)=>a+b)/4;
  id('setup').textContent = '起始 w = '+fmt(initial)+'，学习率 '+rate+'。当前 w = '+fmt(weight)+'。';
  id('gradients').replaceChildren();
  MiniBatch.targets.forEach((target,i)=>{
    const row = id('gradients').insertRow();
    [target,fmt(all[i]),next.labels.includes(target) ? '✓' : '—'].forEach(v=>{row.insertCell().textContent=v;});
  });
  id('compare').textContent = '下一批平均梯度 '+fmt(next.mean)+' · 全数据平均梯度 '+fmt(full)+'。按此批更新将得到 w ≈ '+fmt(replay.states[steps+1])+'。';
  const sizes = [1,2,4];
  const traces = sizes.map(size=>trace(size,Math.floor(seen/size)).states);
  const lo = Math.floor(Math.min(0,...traces.flat())), hi = Math.ceil(Math.max(1,...traces.flat()));
  const y = value => 174 - 158*(value-lo)/(hi-lo);
  sizes.forEach((size,j)=>{
    id('trace'+size).setAttribute('points',traces[j].map((v,i)=>[44+296*i*size/limit,y(v)].join(',')).join(' '));
  });
  id('top').textContent=hi; id('bottom').textContent=lo;
  id('goal').setAttribute('y1',y(0.5)); id('goal').setAttribute('y2',y(0.5));
  id('progress').textContent = '已用 '+seen+' 个样本，更新 '+steps+' 次 · 全数据平均损失 '+fmt(MiniBatch.loss(GradientLab.evaluate,weight));
  id('step').disabled = id('epoch').disabled = seen===limit; id('reset').disabled=seen===0;
}
id('size').onchange = () => { const size=Number(id('size').value); seen-=seen%size; render(); };
id('step').onclick = () => { seen+=Number(id('size').value); render(); };
id('epoch').onclick = () => { seen+=4-seen%4; render(); };
id('reset').onclick = () => {seen=0;render();};
id('order').onchange = render;
render();
