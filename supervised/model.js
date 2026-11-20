const BinaryLab = (() => {
  const data = [-3,-2,-0.4,0.4,2,3].map(x=>({x,y:Number(x>0)}));
  const probability = (w,b,x) => 1/(1+Math.exp(-(w*x+b)));
  function fit(samples,sequence,rate=0.25) {
    let w=0,b=0;
    for(const index of sequence) {
      const {x,y} = samples[index];
      const error = probability(w,b,x)-y;
      w-=rate*error*x; b-=rate*error;
    }
    return {w,b};
  }
  function loss(samples,{w,b}) {
    return samples.reduce((s,{x,y})=>{
      const z=w*x+b;
      return s+Math.max(z,0)-z*y+Math.log1p(Math.exp(-Math.abs(z)));
    },0)/samples.length;
  }
  return {data,probability,fit,loss};
})();
if(typeof module!=='undefined') module.exports=BinaryLab;
