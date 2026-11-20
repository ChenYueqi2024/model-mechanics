Course.mount('curriculum');
const {id}=Course;
const held=[-2.5,-1,-0.2,0.2,1,2.5].map(x=>({x,y:Number(x>0)}));
function render(){
  const step=Number(id('steps').value);id('runs').replaceChildren();
  for(const [key,name] of [['easy','先易后难'],['hard','先难后易'],['mixed','固定交错']]){
    const schedule=ScheduleLab.order(key,step), model=BinaryLab.fit(BinaryLab.data,schedule);
    const points=Array.from({length:step+1},(_,i)=>{
      const state=BinaryLab.fit(BinaryLab.data,schedule.slice(0,i));
      return [42+295*i/36,132-116*BinaryLab.loss(held,state)/0.7].join(',');
    });
    id(key).setAttribute('points',points.join(' '));
    const tr=id('runs').insertRow();
    const last=schedule.slice(-3).map(i=>BinaryLab.data[i].x).join(' → ')||'—';
    [name,last,BinaryLab.loss(BinaryLab.data,model).toFixed(4),BinaryLab.loss(held,model).toFixed(4)].forEach(v=>{tr.insertCell().textContent=v;});
  }
  id('seen').textContent='各组均已更新 '+step+' 次，完成 '+Math.floor(step/6)+' 轮。';
  id('one').disabled=id('epoch').disabled=step===36;id('reset').disabled=step===0;
}
id('steps').oninput=render;
id('one').onclick=()=>{id('steps').stepUp();render();};
id('epoch').onclick=()=>{const n=Number(id('steps').value);id('steps').value=n+6-n%6;render();};
id('reset').onclick=()=>{id('steps').value=0;render();};render();
