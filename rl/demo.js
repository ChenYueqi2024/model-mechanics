Course.mount('rl');
const { id } = Course;
const { start, near, far, wall, width, edges, arrows } = GridLab;
const fmt = value => value.toFixed(3);
const nameOf = s => `(${Math.floor(s / width) + 1}, ${s % width + 1})`;
const runs = new Map();
function runFor(cost) {
  if (!runs.has(cost)) runs.set(cost, GridLab.train(cost));
  return runs.get(cost);
}
let run = runFor(Number(id('cost').value));
let cursor = 0;
function render() {
  const cost = Number(id('cost').value);
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
    id('update').textContent = `目标 = ${reward.toFixed(1)} + 0.95 × ${fmt(future)} ≈ ${fmt(target)}。新 Q = ${fmt(old)} + 0.5 × (${fmt(target)} − ${fmt(old)}) ≈ ${fmt(value)}。`;
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
id('cost').onchange = () => {
  const old = run.events[cursor - 1];
  const atEnd = old && cursor === run.ends[old.episode - 1];
  run = runFor(Number(id('cost').value));
  if (old) {
    const end = run.ends[old.episode - 1];
    const begin = run.ends[old.episode - 2] ?? 0;
    cursor = atEnd ? end : Math.min(begin + old.step, end);
  }
  render();
};
render();
