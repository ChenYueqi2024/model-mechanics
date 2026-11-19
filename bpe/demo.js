Course.mount('bpe');
const { id } = Course;
let cursor = 0;
const params = new URLSearchParams(location.search);
if (params.has('caption')) {
  id('sample').value = params.get('caption').slice(0,64);
  id('corpus').value = 'captions';
}
function render() {
  const corpus = BPE.corpora[id('corpus').value];
  const rounds = BPE.train(corpus);
  cursor = Math.max(0, Math.min(cursor, rounds.length));
  const learned = rounds.slice(0, cursor);
  const current = rounds[cursor];
  const words = current ? current.before : rounds.at(-1).before.map(word => BPE.merge(word, rounds.at(-1).pair));
  id('training').textContent = words.map(word => word.join('·')).join('　');
  id('round').textContent = `已合并 ${cursor} / ${rounds.length} 轮`;
  id('prev').disabled = cursor === 0;
  id('next').disabled = id('finish').disabled = cursor === rounds.length;
  const body = id('candidates'); body.replaceChildren();
  if (current) {
    current.candidates.slice(0, 3).forEach(({ pair, count }) => {
      const row = body.insertRow();
      row.insertCell().textContent = pair.join(' + ');
      row.insertCell().textContent = count;
    });
  } else {
    const cell = body.insertRow().insertCell();
    cell.colSpan = 2; cell.textContent = '已达到五轮合并预算。';
  }
  id('rules').replaceChildren(...learned.map(({ pair }) => {
    const item = document.createElement('li');
    item.textContent = pair.join(' + ') + ' → ' + pair.join('');
    return item;
  }));
  id('empty').hidden = cursor > 0;
  const result = BPE.encode(id('sample').value, learned);
  id('to-causal').href = '../causal/index.html?' + new URLSearchParams({
    sample: id('sample').value, corpus: id('corpus').value, rounds: cursor
  });
  id('chips').replaceChildren(...result.map(token => {
    const chip = document.createElement('span');
    chip.textContent = token === ' ' ? '␣' : token;
    return chip;
  }));
  id('count').textContent = `${result.length} 个 token`;
}
id('prev').onclick = () => { cursor--; render(); };
id('next').onclick = () => { cursor++; render(); };
id('finish').onclick = () => { cursor = Infinity; render(); };
id('corpus').onchange = render;
id('sample').oninput = render;
render();
