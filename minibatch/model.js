const MiniBatch = (() => {
  const targets = [-3,0,3,6];
  function replay(evaluate, initial, rate, size, reverse, steps) {
    const order = reverse ? targets.slice().reverse() : targets;
    const states = [initial], batches = [];
    let weight = initial;
    for (let step=0; step<steps; step++) {
      const offset = (step * size) % targets.length;
      const labels = order.slice(offset,offset+size);
      const gradients = labels.map(target=>evaluate(weight,target).gradient);
      const mean = gradients.reduce((a,b)=>a+b)/size;
      batches.push({labels,gradients,mean});
      weight -= rate*mean;
      states.push(weight);
    }
    return {states,batches};
  }
  function loss(evaluate,weight) {
    return targets.reduce((sum,y)=>sum+evaluate(weight,y).loss,0)/targets.length;
  }
  return {targets,replay,loss};
})();
if (typeof module !== 'undefined') module.exports = MiniBatch;
