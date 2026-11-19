const PositionLab = (() => {
  function layout(tokens, query, swap, positioned, attend, source = query, delta = 0) {
    const cols = Math.sqrt(tokens.length);
    const order = tokens.map((_, i) => i);
    const other = tokens.length - 1 - query;
    if (swap) [order[other], order[query]] = [query, other];
    const values = order.map(i => tokens[i]);
    const keys = values.map((v, i) => {
      if (!positioned) return v;
      const code = [Math.floor(i / cols), i % cols];
      return v.map((x, d) => x + (code[d] || 0) / (2 * (cols - 1)));
    });
    const location = order.indexOf(query);
    const output = attend(values, location, order.indexOf(source), delta, keys).output;
    return { order, location, output };
  }
  // Take a centered 7×7 sample inside the tracked patch; all supported patches are at least 8×8.
  function binaryCrop(rgb, size, original, side) {
    const cols = side / size, inset = Math.floor((size - 7) / 2);
    const left = original % cols * size + inset;
    const top = Math.floor(original / cols) * size + inset;
    const light = Array.from({length:7}, (_,r) => Array.from({length:7}, (_,c) => {
      const i = 3 * ((top + r) * side + left + c);
      return rgb[i] + rgb[i+1] + rgb[i+2];
    }));
    const mean = light.flat().reduce((a,b) => a+b, 0) / 49;
    return light.map(row => row.map(v => Number(v > mean)));
  }
  return { layout, binaryCrop };
})();
if (typeof module !== 'undefined') module.exports = PositionLab;
