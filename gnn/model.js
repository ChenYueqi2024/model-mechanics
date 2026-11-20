const GraphLab = (() => {
  function propagate(layers,shortcut,source) {
    const edges=[[0,1],[1,2],[2,3],[3,4]];
    if(shortcut) edges.push([0,4]);
    const neighbors=Array.from({length:5},(_,i)=>[i]);
    edges.forEach(([a,b])=>{neighbors[a].push(b);neighbors[b].push(a);});
    const states=[Array.from({length:5},(_,i)=>Number(i===source))];
    for(let layer=0;layer<layers;layer++){
      const prev=states.at(-1);
      states.push(neighbors.map(ids=>ids.reduce((s,i)=>s+prev[i],0)/ids.length));
    }
    return {states,edges,neighbors};
  }
  return {propagate};
})();
if(typeof module!=='undefined') module.exports=GraphLab;
