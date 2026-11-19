const Neighbors = (() => {
  const truth = x => Number(Math.abs(x) < 3.5);
  function data(noisy) {
    return Array.from({length:15}, (_,i) => {
      const x = i - 7;
      return {x, label: noisy && x === 0 ? 0 : truth(x)};
    });
  }
  const heldOut = Array.from({length:28}, (_,i) => {
    const x = -6.75 + i * 0.5;
    return {x, label: truth(x)};
  });
  function predict(train, x, k) {
    const neighbors = train.slice().sort((a,b) =>
      Math.abs(a.x-x) - Math.abs(b.x-x) || a.x-b.x).slice(0,k);
    const votes = neighbors.reduce((n,v) => n+v.label, 0);
    return {neighbors, votes, label:Number(votes > k/2)};
  }
  function correct(train, samples, k) {
    return samples.filter(p => predict(train,p.x,k).label === p.label).length;
  }
  return {data, heldOut, predict, correct};
})();
if (typeof module !== 'undefined') module.exports = Neighbors;
