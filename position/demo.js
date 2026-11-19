Course.mount('position');
const { id } = Course;
const params = new URLSearchParams(location.search);
const size = params.get('size') === '8' ? 8 : 16;
const cols = PatchLens.side / size;
const mode = params.get('mode') === 'texture' ? 'texture' : 'color';
const pixels = PatchLens.pixels();
const tokens = PatchLens.tokenize(pixels,size,mode);
function indexParam(key) {
  const v = Number(params.get(key));
  return Number.isInteger(v) && v >= 0 && v < tokens.length ? v : 0;
}
const query = indexParam('query'), source = indexParam('source');
const crop = PositionLab.binaryCrop(pixels,size,query,PatchLens.side);
id('next-lesson').href = '../convolution/index.html?crop=' + crop.flat().join('');
const delta = Math.max(-2, Math.min(2, Number(params.get('delta')) || 0));
let moved = false;
const tileSheet = document.createElement('canvas');
tileSheet.width = tileSheet.height = 64;
const sheet = tileSheet.getContext('2d');
const data = sheet.createImageData(64,64);
for (let i = 0; i < pixels.length/3; i++) {
  data.data.set(pixels.subarray(i*3,i*3+3),i*4);
  data.data[i*4+3] = 255;
}
sheet.putImageData(data,0,0);
function render() {
  const positioned = id('coords').checked;
  const layout = swap => PositionLab.layout(tokens,query,swap,positioned,Attention.attend,source,delta);
  const before = layout(false), after = layout(moved);
  const ctx = id('picture').getContext('2d');
  const side = 256/cols;
  ctx.imageSmoothingEnabled = false;
  after.order.forEach((original,i) => {
    const x = (i%cols)*side, y = Math.floor(i/cols)*side;
    ctx.drawImage(tileSheet,(original%cols)*size,Math.floor(original/cols)*size,size,size,x,y,side,side);
    ctx.lineWidth = 1; ctx.strokeStyle = '#ffffff80'; ctx.strokeRect(x+.5,y+.5,side-1,side-1);
  });
  const pos = after.location, x = (pos%cols)*side, y = Math.floor(pos/cols)*side;
  ctx.lineWidth = 4; ctx.strokeStyle = '#122c35'; ctx.strokeRect(x+2,y+2,side-4,side-4);
  ctx.lineWidth = 2; ctx.strokeStyle = '#ffca65'; ctx.strokeRect(x+4,y+4,side-8,side-8);
  id('where').textContent = '查询图块现在位于第 ' + (1+Math.floor(pos/cols)) + ' 行、第 ' + (1+pos%cols) + ' 列。';
  id('setup').textContent = size + ' 像素 · ' + (mode === 'color' ? '颜色' : '纹理') + '投影';
  id('swap').textContent = moved ? '还原排列' : '交换两块';
  id('values').replaceChildren();
  after.output.forEach((v,i) => {
    const row = id('values').insertRow();
    [i+1,before.output[i].toFixed(5),v.toFixed(5)].forEach(text => { row.insertCell().textContent = text; });
  });
  const distance = Math.max(...after.output.map((v,i)=>Math.abs(v-before.output[i])));
  id('change').textContent = '最大分量变化量 = ' + distance.toFixed(6);
}
id('swap').onclick = () => { moved = !moved; render(); };
id('coords').onchange = render;
render();
