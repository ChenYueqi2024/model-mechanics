const VisionBlock = (() => {
  function classify(patches, omitted, run, coords = true) {
    const width = Math.sqrt(patches.length);
    const indices = patches.map((_,i)=>i).filter(i=>i!==omitted);
    const sequence = [[0.4,-0.2,0.1,0.3],...indices.map(i=>{
      const v=patches[i].slice();
      if(coords) {v[2]+=(i%width)/(2*width); v[3]+=Math.floor(i/width)/(2*width);}
      return v;
    })];
    const cls=run(sequence)[0];
    return {indices,cls,score:cls.output[0]-cls.output[1]};
  }
  return {classify};
})();
if(typeof module!=='undefined') module.exports=VisionBlock;
