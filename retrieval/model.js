const Retrieval = (() => {
  const captions = ['bright right', 'bright left', 'bright bottom', 'bright top'];
  const dot = (a,b) => a[0]*b[0] + a[1]*b[1];
  function examples(conv) {
    const vertical = conv.scene('vertical'), horizontal = conv.scene('horizontal');
    const invert = img => img.map(row => row.map(v => 1-v));
    return [vertical, invert(vertical), horizontal, invert(horizontal)];
  }
  function encode(image, conv) {
    const vector = Object.values(conv.kernels).map(kernel =>
      conv.apply(image, kernel).flat().reduce((a,b) => a+b, 0));
    const norm = Math.hypot(...vector);
    return norm ? vector.map(v => v/norm) : [0, 0];
  }
  function probabilities(vector, words) {
    const scores = words.map(w => dot(vector, w));
    const max = Math.max(...scores);
    const exp = scores.map(v => Math.exp(v - max));
    const sum = exp.reduce((a,b) => a+b, 0);
    return exp.map(v => v/sum);
  }
  function train(images, steps, swap) {
    // Each direction word has a trainable vector. The shared word "bright" contributes zero.
    const words = captions.map(() => [0,0]);
    const targets = swap ? [1,0,2,3] : [0,1,2,3];
    function loss() {
      return -images.reduce((sum,v,i) => sum + Math.log(probabilities(v,words)[targets[i]]), 0) / images.length;
    }
    for (let step = 0; step < steps; step++) {
      const grads = words.map(() => [0,0]);
      images.forEach((v,i) => {
        probabilities(v,words).forEach((p,j) => {
          const error = p - Number(targets[i] === j);
          for (let d = 0; d < 2; d++) grads[j][d] += error * v[d] / images.length;
        });
      });
      words.forEach((w,j) => w.forEach((_,d) => { w[d] -= grads[j][d]; }));
    }
    return { words, loss: loss(), targets };
  }
  return { captions, examples, encode, probabilities, train };
})();
if (typeof module !== 'undefined') module.exports = Retrieval;
