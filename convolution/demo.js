Course.mount('convolution');
const { id } = Course;
let image = ConvLab.scene('vertical');
const cropBits = new URLSearchParams(location.search).get('crop');
const crop = cropBits && /^[01]{49}$/.test(cropBits) ? cropBits.match(/.{7}/g).map(line=>[...line].map(Number)) : null;
if (crop) {
  id('scene').add(new Option('上一课的图块中心','crop'));
  id('scene').value = 'crop';
  image = crop.map(line => line.slice());
  document.querySelector('.intro').textContent = '输入取自上一课跟踪图块的中心 7 × 7 像素。以窗口平均亮度为阈值，把较亮的像素记为 1。移动卷积核，观察纹理在哪个方向有响应；也可以换成单条边缘来做对照。';
}
let row = 2, col = 1;
function makeGrid(name, size, action) {
  const grid = id(name);
  grid.style.setProperty('--cols', size);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const button = document.createElement('button');
      button.onclick = () => { action(r,c); render(); };
      grid.append(button);
    }
  }
}
makeGrid('pixels', 7, (r,c) => { image[r][c] = 1 - image[r][c]; });
makeGrid('responses', 5, (r,c) => { row = r; col = c; });
function render() {
  id('to-retrieval').href = '../retrieval/index.html?pixels=' + image.flat().join('');
  const kernel = ConvLab.kernels[id('kernel').value];
  const output = ConvLab.apply(image, kernel);
  image.forEach((line, r) => line.forEach((v,c) => {
    const cell = id('pixels').children[7*r+c];
    cell.className = 'source-bit';
    if (r >= row && r <= row + 2 && c >= col && c <= col + 2) {
      if (r === row) cell.classList.add('margin-top');
      if (r === row+2) cell.classList.add('margin-bottom');
      if (c === col) cell.classList.add('margin-left');
      if (c === col+2) cell.classList.add('margin-right');
    }
    cell.textContent = v;
    cell.setAttribute('aria-label', `输入第 ${r+1} 行第 ${c+1} 列，亮度 ${v}`);
    cell.setAttribute('aria-pressed', String(v === 1));
  }));
  output.forEach((line, r) => line.forEach((v,c) => {
    const cell = id('responses').children[5*r+c];
    const selected = r === row && c === col;
    cell.classList.toggle('chosen', selected);
    cell.style.background = v === 0 ? '#edf1ed' : `hsl(${v > 0 ? 166 : 25} 43% ${88 - 14*Math.abs(v)}%)`;
    cell.style.color = Math.abs(v) >= 3 ? 'white' : '#162f32';
    cell.textContent = v > 0 ? '+' + v : v;
    cell.setAttribute('aria-pressed', String(selected));
    cell.setAttribute('aria-label', `输出第 ${r+1} 行第 ${c+1} 列，响应 ${v}`);
  }));
  const { products, value } = ConvLab.windowAt(image, kernel, row, col);
  id('products').replaceChildren(...products.flatMap((line,r) => line.map((v,c) => {
    const term = document.createElement('span');
    term.textContent = `${image[row+r][col+c]} × ${kernel[r][c]} = ${v}`;
    return term;
  })));
  id('sum').textContent = `第 ${row+1} 行第 ${col+1} 列 · 九项之和 = ${value}`;
}
function restore() {
  image = id('scene').value === 'crop' ? crop.map(line => line.slice()) : ConvLab.scene(id('scene').value);
  render();
}
id('scene').onchange = restore;
id('reset').onclick = restore;
id('kernel').onchange = render;
id('invert').onclick = () => { image = image.map(line => line.map(v => 1-v)); render(); };
render();
