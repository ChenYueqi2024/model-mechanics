const ExpertLab = (() => {
  function route(x,k,bias) {
    const scores = [-2*x,1-Math.abs(x)+bias,2*x];
    const active = [0,1,2].sort((a,b)=>scores[b]-scores[a] || a-b).slice(0,k);
    const mass = active.map(i=>Math.exp(scores[i]-scores[active[0]]));
    const sum=mass.reduce((a,b)=>a+b,0);
    const weights=[0,0,0], outputs=[null,null,null];
    active.forEach((expert,j)=>{
      weights[expert]=mass[j]/sum;
      outputs[expert]=[v=>Math.max(0,-v),v=>Math.max(0,1-Math.abs(v)),v=>Math.max(0,v)][expert](x);
    });
    return {scores,weights,outputs,active,value:active.reduce((s,i)=>s+weights[i]*outputs[i],0)};
  }
  return {route};
})();
if(typeof module!=='undefined') module.exports=ExpertLab;
