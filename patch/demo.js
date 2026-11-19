const { side, pixels, tokenize, cosine } = PatchLens;
Course.mount('patch');
const image = pixels();
const byId = id => document.getElementById(id);
let size = 16;
let selected = 0;
let mode = 'color';
let vectors = tokenize(image, size, mode);

function coordinates(id) {
  const cols = side / size;
  return `第 ${Math.floor(id / cols) + 1} 行，第 ${id % cols + 1} 列`;
}

function thumbnail(id) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  const block = ctx.createImageData(size, size);
  const cols = side / size;
  for (let i = 0; i < size * size; i++) {
    const x = (id % cols) * size + i % size;
    const y = Math.floor(id / cols) * size + Math.floor(i / size);
    const offset = (y * side + x) * 3;
    block.data.set(image.subarray(offset, offset + 3), i * 4);
    block.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(block, 0, 0);
  const img = document.createElement('img');
  img.src = canvas.toDataURL();
  img.alt = '';
  return img;
}

function drawInput() {
  const board = byId('input');
  board.replaceChildren();
  board.style.setProperty('--cols', side / size);
  vectors.forEach((_, id) => {
    const button = document.createElement('button');
    button.className = 'cell';
    button.setAttribute('aria-label', coordinates(id));
    button.append(thumbnail(id));
    button.onclick = () => { selected = id; update(); };
    board.append(button);
  });
}

function update() {
  byId('next-lesson').href = '../attention/index.html?' + new URLSearchParams({ size, mode, selected });
  const ref = vectors[selected];
  const scores = vectors.map(v => cosine(ref, v));
  const best = Math.max(...scores.filter((v, i) => v !== null && i !== selected));
  const winners = scores.map((v, i) => i !== selected && v !== null && Math.abs(v - best) < 1e-9);
  const heat = byId('heat');
  heat.style.setProperty('--cols', side / size);
  heat.replaceChildren();
  scores.forEach((v, i) => {
    const active = i === selected;
    const button = byId('input').children[i];
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
    const cell = document.createElement('span');
    cell.className = active ? 'cell active' : 'cell';
    cell.textContent = v === null ? '—' : (Math.abs(v) < 0.0005 ? 0 : v).toFixed(2);
    const strength = v === null ? 0 : Math.abs(v);
    cell.style.background = v < 0 ? `hsl(15 55% ${95 - 62 * strength}%)` : `hsl(173 49% ${95 - 70 * strength}%)`;
    cell.style.color = strength > 0.60 ? 'white' : '#132d36';
    cell.title = coordinates(i) + ' · ' + (active ? '基准' : cell.textContent);
    if (winners[i]) {
      const star = document.createElement('span');
      star.className = 'mark';
      star.textContent = '★';
      cell.append(star);
    }
    heat.append(cell);
  });
  byId('location').textContent = coordinates(selected);
  const labels = mode === 'color' ? ['红', '绿', '蓝', 'RGB 均值'] : ['竖纹', '横纹', '棋盘纹', '斜纹'];
  byId('vector').replaceChildren(...ref.map((value, k) => {
    const row = document.createElement('div');
    const label = document.createElement('dt');
    const reading = document.createElement('dd');
    label.textContent = labels[k];
    reading.textContent = (Math.abs(value) < 0.00005 ? 0 : value).toFixed(4);
    row.append(label, reading);
    return row;
  }));
  const count = winners.filter(Boolean).length;
  byId('result').textContent = `除基准外，有 ${count} 块并列最像。最高余弦相似度为 ${best.toFixed(3)}。`;
  byId('shape').textContent = `64 × 64 的图像切成 ${vectors.length} 块。每块按行展开，依次读取每个像素的 R、G、B 并除以 255，得到 ${size * size * 3} 个数。每块都乘同一组投影权重，产生一个四维 token。`;
  byId('explain').textContent = mode === 'color'
    ? '前三维分别取红、绿、蓝通道的平均值，第四维取三个均值的平均。同一行的花纹排布不同，但每种颜色出现的次数相同。'
    : '每个像素的 RGB 均值分别乘四种纹理模板的 +1 或 −1，再在块内取平均。模板正负平衡，所以整块加上相同底色不会改变纹理读数。';
}

document.querySelectorAll('input[name="mode"]').forEach(input => {
  input.onchange = () => {
    mode = input.value;
    vectors = tokenize(image, size, mode);
    update();
  };
});
byId('size').onchange = event => {
  const x = (selected % (side / size)) * size;
  const y = Math.floor(selected / (side / size)) * size;
  size = Number(event.target.value);
  selected = Math.floor(y / size) * (side / size) + Math.floor(x / size);
  vectors = tokenize(image, size, mode);
  drawInput();
  update();
};
drawInput();
update();
