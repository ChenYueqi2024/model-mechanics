Course.mount('supervised');
const {id}=Course;
function render(){
  const samples=BinaryLab.data.map(p=>({...p,y:id('flip').checked&&p.x===0.4?1-p.y:p.y}));
  const epochs=Number(id('epochs').value);
  const model=BinaryLab.fit(samples,Array.from({length:epochs*samples.length},(_,i)=>i%samples.length));
  id('samples').replaceChildren();
  samples.forEach(p=>{
    const tr=id('samples').insertRow();
    [p.x,p.y,BinaryLab.probability(model.w,model.b,p.x).toFixed(3)].forEach(v=>{tr.insertCell().textContent=v;});
  });
  const x=Number(id('probe').value),prob=BinaryLab.probability(model.w,model.b,x);
  id('prediction').textContent='x = '+x+'，P(1) = '+prob.toFixed(3)+'，以 0.5 为阈值预测为 '+Number(prob>=0.5)+'。';
  id('loss').textContent=epochs+' 轮 · 平均交叉熵 '+BinaryLab.loss(samples,model).toFixed(4)+' · w = '+model.w.toFixed(3)+'，b = '+model.b.toFixed(3);
}
id('train').onclick=()=>{id('epochs').value=6;render();};
id('epochs').oninput=id('probe').oninput=id('flip').onchange=render;render();
