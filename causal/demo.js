Course.mount('causal');
const { id } = Course;
const params = new URLSearchParams(location.search);
const corpus = Object.hasOwn(BPE.corpora,params.get('corpus')) ? params.get('corpus') : 'captions';
const count = params.has('rounds') ? Math.max(0,Math.min(5,parseInt(params.get('rounds'),10)||0)) : 5;
const rules = BPE.train(BPE.corpora[corpus]).slice(0,count);
id('sample').value = (params.get('sample') ?? 'bright right').slice(0,64);
let tokens = [], query = 0, edited = false;
const label = s => s === ' ' ? '␣' : s;
function tokenize() {
  const all = BPE.encode(id('sample').value,rules);
  tokens = all.slice(0,8);
  query = 0; edited = false;
  id('query').replaceChildren();
  tokens.forEach((t,i)=>id('query').add(new Option((i+1)+' · '+label(t),i)));
  id('context').textContent = '沿用 ' + count + ' 轮合并规则。当前显示 ' + tokens.length + ' / ' + all.length + ' 个 token，最多八个。';
  render();
}
function render() {
  const masked = id('mask').checked, n = tokens.length;
  id('edit').disabled = query+1 >= n;
  id('edit').textContent = edited ? '还原下一个 token' : '改动下一个 token';
  id('query').disabled = n === 0;
  id('weights').replaceChildren(); id('map').replaceChildren();
  id('tokens').replaceChildren(...tokens.map((t,i)=>{
    const chip = document.createElement('span');
    chip.textContent = edited && i===query+1 ? '★' : label(t);
    if (i === query) chip.className = 'query-chip';
    return chip;
  }));
  if (!n) { id('change').textContent = '输入两个或更多 token 后，可以比较未来位置的影响。'; return; }
  id('map').style.setProperty('--cols',n);
  for (let r=0; r<n; r++) for (let c=0; c<n; c++) {
    const cell = document.createElement('span');
    cell.textContent = !masked || c<=r ? '✓' : '×';
    if (r===query) cell.className = 'query-row';
    id('map').append(cell);
  }
  const values = tokens.map(CausalLab.feature);
  const before = CausalLab.read(values,query,masked);
  if (edited) values[query+1] = -1;
  const after = CausalLab.read(values,query,masked);
  tokens.forEach((t,i)=>{
    const row = id('weights').insertRow();
    [label(t)+(edited && i===query+1?' → ★':''),before.weights[i],after.weights[i]].forEach((v,j)=>{
      row.insertCell().textContent = j ? (100*v).toFixed(1)+'%' : v;
    });
  });
  id('change').textContent = '原输出 ' + before.output.toFixed(4) + ' · 当前输出 ' + after.output.toFixed(4) + (query+1>=n?'。该位置已是末尾，右边没有 token。':'');
}
id('sample').oninput = tokenize;
id('query').onchange = () => { query = Number(id('query').value); edited = false; render(); };
id('mask').onchange = render;
id('edit').onclick = () => { edited = !edited; render(); };
tokenize();
