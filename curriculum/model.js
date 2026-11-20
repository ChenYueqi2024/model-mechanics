const ScheduleLab = (() => {
  function order(mode,steps) {
    // Each epoch contains the same six labeled examples exactly once.
    const schedule = {easy:[0,5,1,4,2,3],hard:[2,3,1,4,0,5],mixed:[1,3,0,4,2,5]}[mode];
    return Array.from({length:steps},(_,i)=>schedule[i%schedule.length]);
  }
  return {order};
})();
if(typeof module!=='undefined') module.exports=ScheduleLab;
