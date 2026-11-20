Course.mount('gnn');
const {id}=Course,names=[...'ABCDE'],points=[[32,95],[103,60],[180,85],[257,60],[328,95]];
let depth=0;
function svg(tag,attrs,label){
  const el=document.createElementNS('http://www.w3.org/2000/svg',tag);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));if(label!==undefined)el.textContent=label;return el;
}
function render(){
  const result=GraphLab.propagate(depth,id('shortcut').checked,id('source').selectedIndex), values=result.states.at(-1);
  const graph=id('graph');graph.replaceChildren();
  result.edges.forEach(([a,b])=>{
    const [x1,y1]=points[a],[x2,y2]=points[b];
    if(a===0 && b===4) graph.append(svg('path',{d:'M32 95 Q180 -58 328 95',fill:'none',stroke:'#087569','stroke-width':3}));
    else graph.append(svg('line',{x1,y1,x2,y2,stroke:'#607d73','stroke-width':3}));
  });
  points.forEach(([x,y],i)=>{
    graph.append(svg('circle',{cx:x,cy:y,r:20,fill:'hsl(165 38% '+(92-50*values[i])+'%)',stroke:'#274f44'}));
    graph.append(svg('text',{x,y:y+5,'text-anchor':'middle'},names[i]),svg('text',{x,y:y+41,'text-anchor':'middle','font-size':13},values[i].toFixed(3)));
  });
  const node=id('node').selectedIndex,neighbors=result.neighbors[node];
  id('terms').textContent='下一层将读取 '+neighbors.map(j=>names[j]+' ('+values[j].toFixed(3)+')').join('、')+'。';
  id('next').textContent='这些值的均值 = '+(neighbors.reduce((n,j)=>n+values[j],0)/neighbors.length).toFixed(4);
  id('depth').textContent='第 '+depth+' 层 · '+values.filter(x=>x>0).length+' / 5 个节点收到信号';
  id('reset').disabled=depth===0;id('step').disabled=depth===8;
}
id('source').onchange=id('shortcut').onchange=id('node').onchange=render;
id('step').onclick=()=>{depth++;render();};id('reset').onclick=()=>{depth=0;render();};render();
