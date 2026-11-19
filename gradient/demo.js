Course.mount('gradient');
const { id } = Course;
const limit = 12;
let step = 0;
const fmt = value => Number(value.toPrecision(4)).toString();

function drawTrace(states) {
  const values = states.map(s => s.prediction);
  const low = Math.floor(Math.min(0, ...values)), high = Math.ceil(Math.max(4, ...values));
  const y = value => 174 - 156 * (value - low) / (high - low);
  const x = i => 48 + 292 * i / limit;
  id('goal-line').setAttribute('y1', y(3));
  id('goal-line').setAttribute('y2', y(3));
  id('curve').setAttribute('points', values.map((v, i) => [x(i), y(v)].join(',')).join(' '));
  id('latest').setAttribute('cx', x(step));
  id('latest').setAttribute('cy', y(values.at(-1)));
  id('high').textContent = high;
  id('low').textContent = low;
  id('trace-title').textContent = '第 ' + step + ' 步的预测值为 ' + fmt(values.at(-1)) + '，目标值为 3';
}
function render() {
  const rate = Number(id('rate').value);
  const states = GradientLab.trajectory(rate, step);
  const s = states.at(-1);
  id('next-lesson').href = '../minibatch/index.html?' + new URLSearchParams({w:s.weight,rate});
  for (const key of ['weight', 'hidden', 'prediction', 'error', 'loss']) id(key).textContent = fmt(s[key]);
  id('grad-h').textContent = fmt(s.hiddenGradient);
  id('grad-w').textContent = fmt(s.gradient);
  id('chain').textContent = `∂L/∂w = ${fmt(s.error)} × 1.5 × 2 ≈ ${fmt(s.gradient)}`;
  id('update').textContent = `按当前梯度再更新一次，w ≈ ${fmt(s.weight)} − ${rate} × (${fmt(s.gradient)}) ≈ ${fmt(s.weight - rate * s.gradient)}。`;
  id('change').textContent = step ? `上一步损失 ${fmt(states.at(-2).loss)}，本步损失 ${fmt(s.loss)}。` : '初始预测为 0，目标为 3，损失为 4.5。';
  id('count').value = '第 ' + step + ' / 12 步';
  id('step').disabled = id('finish').disabled = step === limit;
  id('reset').disabled = step === 0;
  drawTrace(states);
}
id('step').onclick = () => { step++; render(); };
id('reset').onclick = () => { step = 0; render(); };
id('finish').onclick = () => { step = limit; render(); };
id('rate').onchange = render;
render();
