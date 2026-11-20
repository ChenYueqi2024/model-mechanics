Course.mount('moe');
const {id}=Course, batch=[-1,-0.2,0.4,0.9], names=['A','B','C'];
batch.forEach((x,i)=>id('query').add(new Option('x = '+x,i)));
function render(){
  const k=Number(id('k').value),bias=Number(id('bias').value);
  const routes=batch.map(x=>ExpertLab.route(x,k,bias)), query=routes[Number(id('query').value)];
  id('route').replaceChildren();id('load').replaceChildren();
  names.forEach((name,i)=>{
    const tr=id('route').insertRow();
    [name,query.scores[i].toFixed(2),query.weights[i].toFixed(3),query.outputs[i]?.toFixed(3)??'未激活'].forEach(v=>{tr.insertCell().textContent=v;});
    const count=routes.filter(r=>r.active.includes(i)).length, line=document.createElement('p'),bar=document.createElement('progress');
    bar.max=batch.length;bar.value=count;line.append(name+' ',bar,' '+count+' 个 token');id('load').append(line);
  });
  id('output').textContent='专家输出加权和 = '+query.value.toFixed(4);
  id('work').textContent='偏置 '+bias+' · 四个 token 合计执行 '+batch.length*k+' 次专家计算。';
}
id('k').onchange=id('query').onchange=id('bias').oninput=render;render();
