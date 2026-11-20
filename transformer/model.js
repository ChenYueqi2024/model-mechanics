const TinyBlock = (() => {
  const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
  function norm(v) {
    const mean = v.reduce((s,x)=>s+x,0)/v.length;
    const scale = Math.sqrt(v.reduce((s,x)=>s+(x-mean)**2,0)/v.length + 1e-5);
    return v.map(x=>(x-mean)/scale);
  }
  function run(inputs, causal = false, useFF = true) {
    const normalized = inputs.map(norm);
    return inputs.map((input,i)=>{
      const scores = normalized.map((key,j)=>causal && j>i ? -Infinity : dot(normalized[i],key)/2);
      const peak = Math.max(...scores);
      const exp = scores.map(v=>Math.exp(v-peak));
      const sum = exp.reduce((a,b)=>a+b,0);
      const weights = exp.map(v=>v/sum);
      const mixed = input.map((_,d)=>normalized.reduce((s,v,j)=>s+weights[j]*v[d],0));
      const residual = input.map((x,d)=>x+mixed[d]);
      const n = norm(residual);
      const a = Math.max(0,n[0]-n[1]), b = Math.max(0,n[2]-n[3]);
      const ff = [a-b,b,-a,(a+b)/2];
      const output = residual.map((x,d)=>x+(useFF?ff[d]:0));
      return {weights,mixed,residual,ff,output};
    });
  }
  function embed(word,i) {
    let hash = 17;
    for (const c of word) hash=(31*hash+c.codePointAt(0))%997;
    return [Math.sin(hash), Math.cos(hash),Math.sin(i+1),Math.cos(i+1)];
  }
  return {norm,run,embed};
})();
if(typeof module!=='undefined') module.exports=TinyBlock;
