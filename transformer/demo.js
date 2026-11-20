Course.mount('transformer');
const {id}=Course;
let words;
try { words=JSON.parse(new URLSearchParams(location.search).get('tokens')); } catch { words=null; }
if(!Array.isArray(words)||!words.length||!words.every(w=>typeof w==='string' && w.length<=128)) words=['bright',' ','right'];
words=words.slice(0,8);
let query=0;
const vec=v=>'['+v.map(n=>n.toFixed(2)).join(', ')+']';
words.forEach((w,i)=>{
  const button=document.createElement('button');
  button.textContent=w===' '?'␣':w;
  button.onclick=()=>{query=i;render();};
  id('tokens').append(button);
});
function render(){
  const input=words.map(TinyBlock.embed);
  const row=TinyBlock.run(input,id('mask').checked,id('ff').checked)[query];
  id('bars').replaceChildren();
  words.forEach((w,i)=>{
    id('tokens').children[i].setAttribute('aria-pressed',String(i===query));
    const line=document.createElement('p'), bar=document.createElement('progress');
    bar.max=1;bar.value=row.weights[i];
    line.append((w===' '?'␣':w)+' ',bar,' '+(100*row.weights[i]).toFixed(1)+'%');id('bars').append(line);
  });
  id('stages').replaceChildren();
  for(const [name,v] of [['输入',input[query]],['注意力',row.mixed],['第一条残差',row.residual],['块输出',row.output]]){
    const tr=id('stages').insertRow();tr.insertCell().textContent=name;tr.insertCell().textContent=vec(v);
  }
  id('delta').textContent='前馈分支实际加入 '+vec(id('ff').checked?row.ff:[0,0,0,0]);
}
id('mask').onchange=id('ff').onchange=render;
render();
