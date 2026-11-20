Course.mount('vit');
const {id}=Course, params=new URLSearchParams(location.search);
const size=params.get('size')==='8'?8:16, width=64/size;
const pixels=PatchLens.pixels(), raw=PatchLens.tokenize(pixels,size,params.get('mode')==='texture'?'texture':'color');
const requested=Number(params.get('query'));
const original=Number.isInteger(requested)&&requested>=0&&requested<raw.length?requested:0;
const order=raw.map((v,i)=>i);
if(params.get('moved')==='true'){
  const other=order.length-1-original;
  [order[other],order[original]]=[original,other];
}
const inputs=order.map(i=>raw[i]),coords=params.get('coords')!=='false';
const full=VisionBlock.classify(inputs,-1,TinyBlock.run,coords);
let selected=order.indexOf(original);
id('tiles').style.setProperty('--cols',width);
full.indices.forEach((_,i)=>{
  const button=document.createElement('button'), w=full.cls.weights[i+1];
  button.textContent=(100*w).toFixed(1)+'%';
  button.style.background='hsl(165 38% '+(91-48*w/Math.max(...full.cls.weights.slice(1)))+'%)';
  button.onclick=()=>{selected=i;render();}; id('tiles').append(button);
});
function render(){
  const minus=VisionBlock.classify(inputs,selected,TinyBlock.run,coords);
  [...id('tiles').children].forEach((el,i)=>{el.classList.toggle('selected',i===selected);el.setAttribute('aria-pressed',String(i===selected));});
  id('self').textContent='[CLS] 给自身的权重为 '+(100*full.cls.weights[0]).toFixed(2)+'%。';
  id('shape').textContent='完整序列有 1 个 [CLS] 与 '+raw.length+' 个图块，当前选中第 '+(selected+1)+' 块。';
  id('scores').replaceChildren();
  for(const [name,score] of [['完整',full.score],['移除所选块',minus.score]]){
    const tr=id('scores').insertRow();tr.insertCell().textContent=name;tr.insertCell().textContent=score.toFixed(5);
  }
  id('result').textContent='读出分数变化 '+(minus.score-full.score).toFixed(6);
  const crop=PositionLab.binaryCrop(pixels,size,order[selected],64);
  id('next-lesson').href='../convolution/index.html?crop='+crop.flat().join('');
}
render();
