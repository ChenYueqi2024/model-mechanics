Course.mount('retrieval');
const { id } = Course;
const images = Retrieval.examples(ConvLab);
const trainVectors = images.map(img => Retrieval.encode(img,ConvLab));
const names = ['右边亮','左边亮','下方亮','上方亮'];
const bits = new URLSearchParams(location.search).get('pixels');
if (bits && /^[01]{49}$/.test(bits)) {
  images.push(bits.match(/.{7}/g).map(line=>[...line].map(Number)));
  names.push('上一课编辑的图像');
}
names.forEach((name,i)=>id('image-choice').add(new Option(name,i)));
if (images.length > 4) id('image-choice').value = 4;
Retrieval.captions.forEach(c=>id('caption').add(new Option(c,c)));
let steps = 0;
function handoff() {
  id('caption-link').href = '../bpe/index.html?' + new URLSearchParams({caption:id('caption').value});
}
function render() {
  const image = images[Number(id('image-choice').value)];
  const vector = Retrieval.encode(image,ConvLab);
  const { words, loss } = Retrieval.train(trainVectors,steps,id('pairing').value === 'swapped');
  const probs = Retrieval.probabilities(vector,words);
  id('pixels').replaceChildren(...image.flat().map(v=>{
    const cell = document.createElement('span');
    cell.style.background = v ? '#f5faf6' : '#223b36'; return cell;
  }));
  const format = v => '[' + v.map(x=>x.toFixed(2)).join(', ') + ']';
  id('vector').textContent = '图像向量 = ' + format(vector);
  id('matches').replaceChildren();
  Retrieval.captions.forEach((c,i) => {
    const row = id('matches').insertRow();
    [c,format(words[i]),(100*probs[i]).toFixed(1)+'%'].forEach(v=>{row.insertCell().textContent = v;});
  });
  const max = Math.max(...probs);
  const winners = Retrieval.captions.filter((_,i)=>Math.abs(probs[i]-max)<1e-10);
  id('caption').value = winners[0];
  id('verdict').textContent = winners.length === 1 ? '排名第一的是 ' + winners[0] + '。也可另选描述。' : '有 ' + winners.length + ' 条描述并列第一，可自行选择。';
  id('loss').textContent = '第 ' + steps + ' 步 · 四对样本的平均训练损失 ' + loss.toFixed(4);
  id('step').disabled = id('train').disabled = steps === 30;
  id('reset').disabled = steps === 0;
  handoff();
}
id('step').onclick = () => { steps++; render(); };
id('train').onclick = () => { steps = 30; render(); };
id('reset').onclick = () => { steps = 0; render(); };
id('image-choice').onchange = id('pairing').onchange = render;
id('caption').onchange = handoff;
render();
