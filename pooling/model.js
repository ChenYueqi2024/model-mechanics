const Pooling = (() => {
  function shiftRight(image, distance) {
    return image.map(row => row.map((_, col) => row[Math.max(0, col - distance)]));
  }
  function pool(map, method, stride) {
    const output = [];
    for (let r = 0; r + 1 < map.length; r += stride) {
      const line = [];
      for (let c = 0; c + 1 < map[0].length; c += stride) {
        const values = [map[r][c], map[r][c+1], map[r+1][c], map[r+1][c+1]];
        line.push(method === 'max' ? Math.max(...values) : values.reduce((a,b) => a+b,0)/4);
      }
      output.push(line);
    }
    return output;
  }
  return { shiftRight, pool };
})();
if (typeof module !== 'undefined') module.exports = Pooling;
