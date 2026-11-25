(() => {
  const lab = document.body.dataset.lab;
  Course.mount(lab);
  const {id} = Course;
  const model = Workbench;
  const value = field => id(field).value;
  const number = field => Number(value(field));
  const fraction = field => number(field) / 100;
  const fmt = value => value.toFixed(2);
  const pct = value => value === null ? '无' : (100 * value).toFixed(1) + '%';

  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function draw(nodes, readout) {
    id('visual').replaceChildren(...nodes);
    id('result').textContent = readout;
  }

  function strip(values, mark = () => false) {
    const tray = element('div', undefined, 'lab-strip');
    values.forEach((label, index) => tray.append(element('span', label, mark(index) ? 'active' : '')));
    return tray;
  }

  function table(name, labels, rows) {
    const wrapper = element('div', undefined, 'lab-scroll');
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', name);
    const table = element('table', undefined, 'matrix numeric');
    const header = table.createTHead().insertRow();
    labels.forEach(label => {
      const th = element('th', label);
      th.scope = 'col';
      header.append(th);
    });
    const body = table.createTBody();
    rows.forEach(values => {
      const row = body.insertRow();
      values.forEach(value => row.insertCell().textContent = value);
    });
    wrapper.append(table);
    return wrapper;
  }

  function meter(name, value, max, display) {
    const row = element('div', undefined, 'lab-meter');
    const bar = element('progress');
    bar.max = max;
    bar.value = value;
    bar.setAttribute('aria-label', name);
    row.append(element('span', name), bar, element('output', display));
    return row;
  }

  function curvePlot(title, verticalLabel, horizontalLabel, traces, baseline, stair = false) {
    const figure = element('figure', undefined, 'lab-curve');
    const canvas = element('canvas');
    canvas.width = 400;
    canvas.height = 250;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', title + '，横轴' + horizontalLabel + '，纵轴' + verticalLabel);
    const ctx = canvas.getContext('2d');
    const x = value => 42 + value * 330;
    const y = value => 196 - value * 155;
    ctx.fillStyle = '#f2f7f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#385853';
    ctx.font = '13px system-ui';
    for (const tick of [0, 0.25, 0.5, 0.75, 1]) {
      ctx.strokeStyle = '#cadad5';
      ctx.beginPath();
      ctx.moveTo(x(tick), y(0));
      ctx.lineTo(x(tick), y(1));
      ctx.moveTo(x(0), y(tick));
      ctx.lineTo(x(1), y(tick));
      ctx.stroke();
      ctx.fillText(String(100 * tick), x(tick) - 8, 214);
      ctx.fillText(String(100 * tick), 10, y(tick) + 4);
    }
    ctx.fillText(verticalLabel + ' %', 42, 25);
    ctx.fillText(horizontalLabel + ' %', 172, 236);
    ctx.strokeStyle = '#728b84';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(x(0), y(baseline ? baseline[0] : 0));
    ctx.lineTo(x(1), y(baseline ? baseline[1] : 1));
    ctx.stroke();
    for (const {points, shown, color, dashed} of traces) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.8;
      ctx.setLineDash(dashed ? [7, 3] : []);
      ctx.beginPath();
      ctx.moveTo(x(points[0][0]), y(points[0][1]));
      points.slice(1).forEach(([px, py], index) => {
        if (stair) ctx.lineTo(x(points[index][0]), y(py));
        ctx.lineTo(x(px), y(py));
      });
      ctx.stroke();
      if (shown[1] !== null) {
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(x(shown[0]), y(shown[1]), 5, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
    figure.append(element('figcaption', title), canvas);
    return figure;
  }

  const experiments = {
    threshold() {
      const cutoff = number('cutoff');
      const weight = value('prevalence') === 'rare' ? 9 : 1;
      const report = model.confusion(cutoff, weight, number('miss'));
      const plot = element('div', undefined, 'score-track');
      plot.setAttribute('role', 'img');
      plot.setAttribute('aria-label', '上排真实缺陷分数，下排无缺陷分数，竖线是所选阈值。');
      for (const [scores, group] of [[model.positive, 'positive'], [model.negative, 'negative']]) {
        scores.forEach(score => {
          const marker = element('span', undefined, 'score-mark score-' + group);
          marker.style.left = score + '%';
          plot.append(marker);
        });
      }
      const line = element('span', undefined, 'score-cutoff');
      line.style.left = cutoff + '%';
      plot.append(line);
      const legend = element('p', '上排 · 真实缺陷　下排 · 无缺陷　竖线 · 阈值', 'muted');
      const counts = table('混淆矩阵', ['实际类别', '送检', '放行'], [
        ['有缺陷', report.tp, report.fn], ['无缺陷', report.fp, report.tn]
      ]);
      draw([legend, plot, counts], '精确率 ' + pct(report.precision) + ' · 召回率 ' + pct(report.recall) +
        ' · 每件平均成本 ' + fmt(report.cost) + '。');
    },
    'classification-curves'() {
      const cutoff = number('cutoff');
      const weight = number('negative-weight');
      const a = model.scoreCurves(1), b = model.scoreCurves(weight);
      const aPoint = model.scorePoint(cutoff, 1), bPoint = model.scorePoint(cutoff, weight);
      const roc = {points: a.points.map(p => [p.fpr, p.recall]), shown: [aPoint.fpr, aPoint.recall], color: '#087569'};
      const pr = (curve, point, color, dashed) => ({
        points: curve.points.map(p => [p.recall, p.precision ?? 1]), shown: [point.recall, point.precision], color, dashed
      });
      const plots = element('div', undefined, 'duo');
      plots.append(curvePlot('ROC · 两组重合', '召回率', '误报率', [roc], null),
        curvePlot('PR · 比较两种基率', '精确率', '召回率',
          [pr(a, aPoint, '#087569', false), pr(b, bPoint, '#a35b30', true)], [1 / (weight + 1), 1 / (weight + 1)], true));
      const stats = table('阈值读数', ['场景', '阳性基率', '误报率', '召回率', '精确率', 'AP'], [
        ['原样本', pct(0.5), pct(aPoint.fpr), pct(aPoint.recall), pct(aPoint.precision), pct(a.ap)],
        ['调整权重', pct(1 / (weight + 1)), pct(bPoint.fpr), pct(bPoint.recall), pct(bPoint.precision), pct(b.ap)]
      ]);
      draw([element('p', '绿色实线 · 原样本　橙色虚线 · 调整权重　圆点 · 当前阈值。PR 的灰色水平线表示调整后的阳性基率。', 'muted'), plots, stats],
        'ROC AUC 均为 ' + a.auc.toFixed(3) + '。AP 从 ' + pct(a.ap) + ' 变为 ' + pct(b.ap) +
        '；当前阈值的精确率从 ' + pct(aPoint.precision) + ' 变为 ' + pct(bPoint.precision) + '。');
    },
    'review-budget'() {
      const separate = value('mode') === 'separate';
      id('cutoff-b').disabled = !separate;
      const cutoffA = number('cutoff-a');
      const cutoffB = separate ? number('cutoff-b') : cutoffA;
      const budget = number('budget');
      const report = model.reviewBudget(cutoffA, cutoffB, budget);
      const groupRows = [[report.a, 'A', cutoffA], [report.b, 'B', cutoffB]].map(([group, name, cutoff]) => [
        name, cutoff + '%', pct(group.recall), group.fn, group.fp, group.tp + group.fp
      ]);
      draw([table('分组误差', ['产线', '阈值', '召回率', '漏报', '误报', '待复核'], groupRows),
        meter('待复核件数', report.reviews, 80, report.reviews + '/80'),
        meter('人工名额', budget, 80, budget + '/80')],
        '召回差距 ' + (report.recallGap * 100).toFixed(1) + ' 个百分点。提出复核 ' + report.reviews +
        ' 件，名额 ' + budget + ' 件。' + (report.over ? '超出 ' + report.over + ' 件。' : '本批名额足够。'));
    },
    'moe-capacity'() {
      const report = model.routeTokens(fraction('skew'), number('capacity'), value('overflow') === 'reroute');
      const expert = index => 'ABC'[index];
      const loads = report.load.map((load, i) => meter('专家 ' + expert(i), load, number('capacity'), load + '/' + number('capacity')));
      const rows = report.tokens.map(({preferred, assigned}, i) =>
        [i + 1, expert(preferred), assigned === null ? '未处理' : expert(assigned)]);
      draw([...loads, table('每个 token 的分派', ['token', '首选', '实际分派'], rows)],
        '首选数 A / B / C · ' + report.demand.join(' / ') + '。成功改派 ' + report.rerouted + ' 个，未处理 ' + report.unhandled + ' 个。');
    },
    'sparse-attention'() {
      const mode = value('mask');
      const width = id('window');
      width.disabled = mode === 'full';
      const {rows, reachable, pairs, full} = model.attention(12, mode, number('window'), number('layers'));
      const matrix = element('div', undefined, 'lab-matrix');
      matrix.setAttribute('aria-hidden', 'true');
      matrix.append(element('span', 'Q/K'));
      for (let j = 1; j <= rows.length; j++) matrix.append(element('span', j));
      rows.forEach((keys, i) => {
        matrix.append(element('span', i + 1));
        for (let j = 0; j < rows.length; j++) {
          const css = !keys.includes(j) ? 'off' : mode === 'anchors' && j % 4 === 3 ? 'anchor' : 'on';
          matrix.append(element('span', undefined, css));
        }
      });
      const reaches = strip(rows.map((_, index) => index + 1), index => reachable.has(index));
      draw([element('p', '行 · 查询　列 · 被读取的位置　紫色 · 可读锚点', 'muted'), matrix,
        element('h3', '最后一个 token 可接收的来源'), reaches],
        '单层配对 ' + pairs + ' / ' + full + '。第 ' + number('layers') + ' 层可从 ' +
          [...reachable].sort((a,b) => a-b).map(i => i + 1).join('、') + ' 接收信息。');
    },
    'graph-aggregation'() {
      const [a, b] = model.aggregate(value('aggregation'), value('neighbors'));
      draw([element('h3', '图 A 的邻居'), strip(a.values), element('h3', '图 B 的邻居'), strip(b.values)],
        'A 聚合值 ' + fmt(a.result) + ' · B 聚合值 ' + fmt(b.result) + '。' +
        (a.result === b.result ? '当前聚合无法区分这两组。' : '当前聚合能区分这两组。'));
    },
    'graph-depth'() {
      const {values, difference} = model.smooth(number('depth'), fraction('residual'));
      draw([element('h3', '链上节点特征'), ...values.map((v, i) => meter((i < 4 ? '左' : '右') + ' · ' + (i+1), v, 1, fmt(v)))],
        '初始组间差为 1.00。当前组间均值差为 ' + fmt(difference) + '。');
    },
    'rl-value'() {
      const policy = value('policy');
      const rows = model.bellman(fraction('success'), fraction('discount'), number('iteration'), policy);
      const latest = rows.at(-1);
      const history = table('逐轮同步更新', ['轮次', '读到的桥头旧值', '起点远路值', '起点新值', '桥头新值'],
        [[0, '—', '—', '0.00', '0.00'], ...rows.map(r =>
          [r.step, fmt(r.bridge), fmt(r.far), fmt(r.value), fmt(r.nextBridge)])]);
      const preference = !latest ? '当前是初始值，尚未执行备份。' :
        latest.near === latest.far ? '两条路同值。' : (latest.near > latest.far ? '近路' : '远路') + '的备份值更高。';
      const baseline = latest ? '近路备份值 1.90，远路备份值 ' + fmt(latest.far) + '。' : '';
      draw([history], baseline + preference + (policy !== 'optimal' ? '本次按固定策略计算起点价值。' : ''));
    },
    'rl-offline'() {
      const report = model.offline(value('log'), number('support'), fraction('prior'));
      const rows = report.actions.map(action =>
        [action.name, action.wins + ' / ' + action.count, pct(action.estimate), action.supported ? '可选' : '不足', pct(action.actual)]);
      draw([table('日志证据与独立环境对照', ['动作', '历史成功 / 尝试', '估值', '支持', '真实成功率'], rows)],
        report.selected ? '选择 ' + report.selected.name + '，日志估值 ' + pct(report.selected.estimate) +
          '，环境中的独立成功率为 ' + pct(report.selected.actual) + '。' : '目前没有达到最低支持的动作。');
    }
  };

  function render() {
    for (const output of document.querySelectorAll('output[data-unit]')) {
      output.value = value(output.htmlFor[0]) + output.dataset.unit;
    }
    experiments[lab]();
  }
  for (const field of document.querySelectorAll('.lab-settings input, .lab-settings select')) {
    field.addEventListener('input', render);
  }
  render();
  id('experiment').hidden = false;
})();
