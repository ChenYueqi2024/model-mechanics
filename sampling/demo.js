Course.mount('sampling');
const { id } = Course;
const params = new URLSearchParams(location.search);
const raw = params.get('h'), parsed = Number(raw);
const carried = raw !== null && raw.trim() !== '' && Number.isFinite(parsed) && parsed>=-1 && parsed<=1.2;
const h = carried ? parsed : 0.8;
let count = 0;
if (params.has('tokens')) id('next-lesson').href = '../transformer/index.html?' + new URLSearchParams({tokens:params.get('tokens').slice(0,1024)});
id('context').textContent = (carried ? '来自上一课所选查询的输出' : '示例查询的输出') + ' h = '+h.toFixed(4)+'。四个字符使用固定的教学用权重。';
function render() {
  const scores = Sampling.logits(h);
  const {softmax,probabilities} = Sampling.distribution(scores,Number(id('temp').value),Number(id('p').value));
  const {counts,lastUniform,lastToken} = Sampling.replay(probabilities,count);
  id('dist').replaceChildren(); id('bars').replaceChildren();
  Sampling.tokens.forEach((token,i)=>{
    const row = id('dist').insertRow();
    [token,scores[i].toFixed(2),softmax[i],probabilities[i]].forEach((v,j)=>{
      row.insertCell().textContent = j<2 ? v : (v*100).toFixed(1)+'%';
    });
    const line = document.createElement('div');
    line.className = 'frequency';
    const bar = document.createElement('progress');
    bar.max = Math.max(1,count); bar.value = counts[i];
    bar.setAttribute('aria-label',token+' 的抽样频率');
    line.append(token,bar,counts[i]+' 次'); id('bars').append(line);
  });
  id('count').textContent = '已抽 '+count+' 次 · 固定随机种子 42';
  id('draw').textContent = count ? '最近一次的随机数为 '+lastUniform.toFixed(6)+'，抽中 '+Sampling.tokens[lastToken]+'。' : '点击「抽一次」查看随机数和对应的字符。';
  id('reset').disabled = count === 0;
  id('one').disabled = count >= 1000; id('many').disabled = count > 900;
}
id('one').onclick = () => { count++; render(); };
id('many').onclick = () => { count+=100; render(); };
id('reset').onclick = () => { count=0; render(); };
id('temp').onchange = id('p').onchange = render;
render();
