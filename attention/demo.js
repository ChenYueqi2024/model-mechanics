Course.mount('attention');
const { id } = Course;
const params = new URLSearchParams(location.search);
const size = params.get('size') === '8' ? 8 : 16;
const mode = params.get('mode') === 'texture' ? 'texture' : 'color';
const tokens = PatchLens.tokenize(PatchLens.pixels(), size, mode);
const cols = PatchLens.side / size;
const requested = Number(params.get('selected'));
let query = Number.isInteger(requested) && requested >= 0 && requested < tokens.length ? requested : 0;
let source = query;
const position = i => `第 ${Math.floor(i / cols) + 1} 行第 ${i % cols + 1} 列`;
const fmt = n => n.toFixed(4);
const percent = n => (100 * n).toFixed(cols === 8 ? 0 : 1) + '%';
id('heat').style.setProperty('--cols', cols);
id('input-info').textContent = `${size} 像素 · ${mode === 'color' ? '颜色' : '纹理'}投影 · ${tokens.length} 个图块`;
tokens.forEach((_, i) => {
  id('query').add(new Option(position(i), i));
  const button = document.createElement('button');
  button.type = 'button';
  button.onclick = () => { source = i; draw(); };
  id('heat').append(button);
});
id('query').value = query;
function draw() {
  const delta = Number(id('delta').value);
  const { weights, base, output } = Attention.attend(tokens, query, source, delta);
  const max = Math.max(...weights);
  weights.forEach((w, i) => {
    const el = id('heat').children[i];
    const t = w / max;
    el.style.background = `hsl(168 42% ${96 - 66 * t}%)`;
    el.style.color = t > 0.65 ? 'white' : '#132f38';
    el.textContent = percent(w);
    el.setAttribute('aria-label', position(i) + '，权重 ' + (w * 100).toFixed(3) + '%');
    el.classList.toggle('selected', source === i);
    el.setAttribute('aria-pressed', String(source === i));
  });
  id('selected-weight').textContent = `已选来源为${position(source)}，权重 ${fmt(weights[source])}。`;
  id('delta-read').value = delta.toFixed(2);
  id('source-value').textContent = `来源 V 第一维从 ${fmt(tokens[source][0])} 变为 ${fmt(tokens[source][0] + delta)}。`;
  const rows = base.map((v, i) => {
    const row = document.createElement('tr');
    [i + 1, fmt(v), fmt(output[i])].forEach(value => {
      const cell = row.insertCell(); cell.textContent = value;
    });
    return row;
  });
  id('rows').replaceChildren(...rows);
  id('result').textContent = `Δ输出₁ = ${fmt(weights[source])} × ${delta.toFixed(2)} ≈ ${fmt(output[0] - base[0])}`;
}
id('delta').oninput = draw;
id('plus').onclick = () => { id('delta').value = 1; draw(); };
id('query').onchange = e => { query = Number(e.target.value); draw(); };
draw();
