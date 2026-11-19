Course.mount('generalization');
const { id } = Course;
function mark(cell,label) {
  cell.textContent = label;
  cell.classList.toggle('one',label === 1);
}
Neighbors.heldOut.forEach((p,i)=>{
  const truth = document.createElement('span'), prediction = document.createElement('button');
  mark(truth,p.label); truth.title = 'x = '+p.x;
  id('truth').append(truth);
  prediction.onclick = () => { id('probe').value = i; render(); };
  id('predictions').append(prediction);
});
function render() {
  const k = Number(id('k').value), index = Number(id('probe').value);
  const train = Neighbors.data(id('noise').checked), held = Neighbors.heldOut, sample = held[index];
  const result = Neighbors.predict(train,sample.x,k);
  id('train').replaceChildren(...train.map(point=>{
    const cell = document.createElement('span'); mark(cell,point.label);
    cell.classList.toggle('neighbor',result.neighbors.includes(point)); cell.title = 'x = '+point.x;
    return cell;
  }));
  held.forEach((p,i)=>{
    const value = Neighbors.predict(train,p.x,k).label;
    const cell = id('predictions').children[i];
    mark(cell,value); cell.classList.toggle('wrong',p.label !== value);
    cell.setAttribute('aria-pressed',String(i===index));
    cell.setAttribute('aria-label','位置 '+p.x+'，预测 '+value+'，真实 '+p.label);
  });
  id('training').textContent = '训练答对 ' + Neighbors.correct(train,train,k) + ' / 15';
  id('validation').textContent = '留出答对 ' + Neighbors.correct(train,held,k) + ' / 28。带下划线的预测有误。';
  id('vote').textContent = 'x = '+sample.x+'，'+k+' 票中有 '+result.votes+' 票选 1，预测 '+result.label+'，真实 '+sample.label+'。';
}
id('probe').oninput = id('k').onchange = id('noise').onchange = render;
render();
