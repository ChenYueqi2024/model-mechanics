Course.mount('rl');
const { id } = Course;
const { start, near, far, wall, width, edges, arrows } = GridLab;
const fmt = value => value.toFixed(3);
const nameOf = s => `(${Math.floor(s / width) + 1}, ${s % width + 1})`;
function trainSelected() {
  return GridLab.train(Number(id('cost').value), 400, 42, {
    discount: Number(id('gamma').value), epsilon: Number(id('grid-epsilon').value),
    warmup: id('warmup').checked ? 100 : 0
  });
}
let run = trainSelected();
let cursor = 0;
function render() {
  const cost = Number(id('cost').value);
  const discount = Number(id('gamma').value);
  const { events } = run;
  const event = events[cursor - 1];
  const q = GridLab.tableAt(events, cursor);
  const route = GridLab.route(q);
  const position = event?.next ?? start;
  id('timeline').max = events.length;
  id('timeline').value = cursor;
  id('progress').value = event ? `第 ${event.episode} 回合 · 第 ${event.step} 步` : '训练开始';
  id('back').disabled = id('reset').disabled = cursor === 0;
  id('step').disabled = id('end').disabled = id('episode').disabled = cursor === events.length;
  id('maze').replaceChildren(...edges.map((options, s) => {
    const cell = document.createElement('div');
    const label = document.createElement('small');
    const arrow = options.length ? arrows[GridLab.bestMoves(q, s)[0].a] : '';
    const symbol = s === wall ? '墙' : s === near ? '+2' : s === far ? '+8' : arrow;
    cell.append(symbol);
    label.textContent = s === start ? '起点' : s === near || s === far ? '终点' : '';
    cell.append(label);
    if (s === wall) cell.classList.add('wall');
    if (s === position) cell.classList.add('here');
    if (route.path.includes(s)) cell.classList.add('route');
    cell.title = nameOf(s) + ' ' + symbol;
    return cell;
  }));
  const destination = route.path.at(-1);
  id('route').textContent = route.loop ? '当前策略在到达终点前形成了循环。' :
    `依当前策略，从起点走 ${route.path.length - 1} 步抵达${destination === near ? '近' : '远'}处终点。`;
  const state = event?.s ?? start;
  const nearReturn = GridLab.discountedReturn(cost, discount, 1, 2);
  const farReturn = GridLab.discountedReturn(cost, discount, 6, 8);
  id('route-reference').textContent = '已知地图参考 · 近处 ' + fmt(nearReturn) + '，远处 ' + fmt(farReturn) +
    (route.loop ? '。当前路线有循环，未获得终点奖励。' : '。当前路线回报 ' +
      fmt(GridLab.discountedReturn(cost, discount, route.path.length - 1, destination === near ? 2 : 8)) + '。');
  const visited = new Set();
  for (let i = 0; i < cursor; i++) visited.add(events[i].s * 4 + events[i].a);
  id('coverage').textContent = '已采样的状态–动作组合 ' + visited.size + ' / ' + edges.flat().length + '。';
  id('cell-title').textContent = '出发格 ' + nameOf(state) + ' 的动作价值';
  id('qtable').replaceChildren();
  edges[state].forEach(({ a, next }) => {
    const row = id('qtable').insertRow();
    row.insertCell().textContent = arrows[a] + ' ' + nameOf(next);
    row.insertCell().textContent = fmt(q[4 * state + a]);
  });
  if (event) {
    const { s, a, next, reward, future, old, target, value, explore } = event;
    const bonus = next === near ? 2 : next === far ? 8 : 0;
    id('transition').textContent = `${explore ? '随机探索' : '选取最大 Q'} · ${nameOf(s)} ${arrows[a]} ${nameOf(next)}`;
    id('reward').textContent = `即时奖励 r = ${bonus} − ${cost} = ${reward.toFixed(1)}。下一格的后续价值为 ${fmt(future)}。`;
    id('update').textContent = `目标 = ${reward.toFixed(1)} + ${discount} × ${fmt(future)} ≈ ${fmt(target)}。新 Q = ${fmt(old)} + 0.5 × (${fmt(target)} − ${fmt(old)}) ≈ ${fmt(value)}。`;
  } else {
    id('transition').textContent = '智能体位于起点，还没有采样。';
    id('reward').textContent = '点击「走一步」，查看一次真实的状态转移。';
    id('update').textContent = '新 Q = 旧 Q + 学习率 × (即时奖励 + 折扣 × 下一格最大 Q − 旧 Q)';
  }
}
id('timeline').oninput = event => { cursor = Number(event.target.value); render(); };
id('back').onclick = () => { cursor--; render(); };
id('step').onclick = () => { cursor++; render(); };
id('episode').onclick = () => { cursor = run.ends.find(end => end > cursor); render(); };
id('end').onclick = () => { cursor = run.events.length; render(); };
id('reset').onclick = () => { cursor = 0; render(); };
function compareSettings() {
  const old = run.events[cursor - 1];
  const atEnd = old && cursor === run.ends[old.episode - 1];
  run = trainSelected();
  if (old) {
    const end = run.ends[old.episode - 1];
    const begin = run.ends[old.episode - 2] ?? 0;
    cursor = atEnd ? end : Math.min(begin + old.step, end);
  }
  render();
}
for (const field of ['cost', 'gamma', 'grid-epsilon', 'warmup']) id(field).onchange = compareSettings;
render();

function compareCard(title, items, fractions, summary) {
  const card = document.createElement('article');
  card.className = 'panel';
  const heading = document.createElement('h3');
  heading.textContent = title;
  const chart = document.createElement('div');
  chart.className = 'rl-bars';
  items.forEach((label, i) => {
    const row = document.createElement('div');
    row.className = 'rl-bar';
    const text = document.createElement('span');
    text.textContent = label;
    const bar = document.createElement('progress');
    bar.max = 1;
    bar.value = fractions[i];
    bar.setAttribute('aria-label', label);
    const number = document.createElement('span');
    number.textContent = percent(fractions[i]);
    row.append(text, bar, number);
    chart.append(row);
  });
  const details = document.createElement('p');
  details.className = 'readout';
  details.textContent = summary;
  card.append(heading, chart, details);
  return card;
}
const percent = value => (100 * value).toFixed(1) + '%';

function renderBandit() {
  const epsilon = Number(id('bandit-epsilon').value) / 100;
  const rounds = Number(id('bandit-rounds').value);
  id('bandit-epsilon-value').value = percent(epsilon);
  const names = GridLab.banditProbabilities.map((p, i) => '机器 ' + 'ABC'[i] + ' · ' + percent(p));
  const results = GridLab.compareBandits(rounds, epsilon);
  id('bandit-results').replaceChildren(...results.map((result, i) =>
    compareCard(i ? 'ε-贪心 · 选中比例' : '纯贪心 · 选中比例', names, result.fractions,
      '平均代币 ' + result.tokens.toFixed(1) + ' · 平均累计遗憾 ' + result.regret.toFixed(1))));
  id('bandit-note').textContent = '如果能每次直接选 C，' + rounds + ' 次的期望代币为 ' +
    (rounds * GridLab.banditProbabilities[2]).toFixed(1) + '。试着比较短预算和长预算下，探索能否补回成本。';
}

function renderReward() {
  const weight = Number(id('proxy-weight').value) / 100;
  id('proxy-value').value = percent(weight);
  const names = GridLab.responseTypes.map(type => type.name);
  const baseline = GridLab.optimizeReward(0);
  const changed = GridLab.optimizeReward(weight);
  id('reward-results').replaceChildren(...[baseline, changed].map((result, i) =>
    compareCard(i ? '当前奖励 · 策略比例' : '仅奖励正确 · 策略比例', names, result.rates,
      '独立正确率 ' + percent(result.accuracy) + ' · 格式得分 ' + percent(result.format))));
  id('reward-note').textContent = '相对基线，正确率变化 ' + (100 * (changed.accuracy - baseline.accuracy)).toFixed(1) +
    ' 个百分点，格式得分变化 ' + (100 * (changed.format - baseline.format)).toFixed(1) + ' 个百分点。';
}

id('bandit-epsilon').addEventListener('input', renderBandit);
id('bandit-rounds').addEventListener('change', renderBandit);
id('proxy-weight').addEventListener('input', renderReward);
renderBandit();
renderReward();
id('bandit-lab').hidden = false;
id('reward-lab').hidden = false;
