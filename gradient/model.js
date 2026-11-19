const GradientLab = (() => {
  function evaluate(weight, target = 3) {
    const input = 2, gain = 1.5;
    const hidden = input * weight;
    const prediction = gain * hidden;
    const error = prediction - target;
    const hiddenGradient = error * gain;
    return { weight, hidden, prediction, error, loss: error ** 2 / 2,
      hiddenGradient, gradient: hiddenGradient * input };
  }

  function trajectory(rate, steps) {
    const states = [evaluate(0)];
    for (let step = 0; step < steps; step++) {
      const { weight, gradient } = states.at(-1);
      states.push(evaluate(weight - rate * gradient));
    }
    return states;
  }
  return { evaluate, trajectory };
})();
if (typeof module !== 'undefined') module.exports = GradientLab;
