Course.mount('pooling');
const { id } = Course;
const params = new URLSearchParams(location.search);
const bits = params.get('pixels');
const original = bits && /^[01]{49}$/.test(bits) ? bits.match(/.{7}/g).map(row=>[...row].map(Number)) : ConvLab.scene('vertical');
const kernel = params.get('kernel') === 'horizontal' ? ConvLab.kernels.horizontal : ConvLab.kernels.vertical;
let selected = 0;
function paint(name, matrix, active, interactive) {
  const grid = id(name);
  grid.style.setProperty('--cols',matrix[0].length);
  grid.replaceChildren(...matrix.flatMap((row,r)=>row.map((v,c)=>{
    const cell = document.createElement(interactive ? 'button' : 'span');
    cell.textContent = v;
    cell.classList.toggle('chosen',active(r,c));
    cell.style.background = 'hsl(163 39% '+(96-14*v)+'%)';
    cell.style.color = v>3 ? 'white' : '#18332b';
    if (interactive) {
      cell.setAttribute('aria-label','第 '+(r+1)+' 行第 '+(c+1)+' 列，值 '+v);
      cell.setAttribute('aria-pressed',String(active(r,c)));
      cell.onclick = () => { selected = r*matrix[0].length+c; render(); id(name).children[selected].focus(); };
    }
    return cell;
  })));
}
function render() {
  const stride = Number(id('stride').value), method = id('method').value;
  const shifted = Pooling.shiftRight(original,Number(id('shift').value));
  const maps = [original,shifted].map(image=>ConvLab.apply(image,kernel).map(row=>row.map(Math.abs)));
  const outputs = maps.map(m=>Pooling.pool(m,method,stride));
  const width = outputs[0].length;
  selected = Math.min(selected,width*width-1);
  const row = Math.floor(selected/width), col = selected%width;
  const r0 = row*stride, c0 = col*stride;
  ['before','after'].forEach((side,i)=>{
    paint(side+'-map',maps[i],(r,c)=>r>=r0 && r<r0+2 && c>=c0 && c<c0+2,false);
    paint(side+'-out',outputs[i],(r,c)=>r===row && c===col,true);
  });
  const terms = maps[1].slice(r0,r0+2).flatMap(r=>r.slice(c0,c0+2));
  const changed = outputs[0].flat().filter((v,i)=>v!==outputs[1].flat()[i]).length;
  id('window').textContent = '选中窗口 [' + terms.join(', ') + '] 的' + (method==='max'?'最大值':'平均值') + '为 '+outputs[1][row][col]+'。平移前同一格为 '+outputs[0][row][col]+'。';
  id('summary').textContent = width*width+' 个池化输出中，有 '+changed+' 个发生变化。';
  id('next-lesson').href = '../retrieval/index.html?pixels='+shifted.flat().join('');
}
id('shift').onchange = id('method').onchange = id('stride').onchange = render;
render();
