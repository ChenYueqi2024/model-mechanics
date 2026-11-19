// The same functions drive the browser demo and the numerical checks.
const PatchLens = (() => {
  const side = 64;
  const palette = [[179, 78, 77], [62, 143, 126], [81, 107, 171], [181, 151, 59]];
  const patterns = (x, y) => {
    const a = x % 4 < 2 ? 1 : -1;
    const b = y % 4 < 2 ? 1 : -1;
    return [a, b, a * b, (x + y) % 4 < 2 ? 1 : -1];
  };

  function pixels() {
    const image = new Uint8ClampedArray(side * side * 3);
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const color = palette[Math.floor(y / 16)];
        const contrast = 40 * patterns(x, y)[Math.floor(x / 16)];
        image.set(color.map(value => value + contrast), (y * side + x) * 3);
      }
    }
    return image;
  }

  function weights(size, mode) {
    const n = size * size;
    const w = Array.from({ length: 4 }, () => new Float64Array(n * 3));
    for (let i = 0; i < n; i++) {
      const masks = patterns(i % size, Math.floor(i / size));
      for (let ch = 0; ch < 3; ch++) {
        const j = i * 3 + ch;
        if (mode === 'color') {
          w[ch][j] = 1 / n;
          w[3][j] = 1 / (3 * n);
        } else {
          masks.forEach((sign, k) => { w[k][j] = sign / (3 * n); });
        }
      }
    }
    return w;
  }

  function tokenize(image, size, mode) {
    const w = weights(size, mode);
    const cols = side / size;
    return Array.from({ length: cols * cols }, (_, id) => {
      const flat = [];
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const row = Math.floor(id / cols) * size + y;
          const col = (id % cols) * size + x;
          const start = (row * side + col) * 3;
          for (let ch = 0; ch < 3; ch++) flat.push(image[start + ch] / 255);
        }
      }
      return w.map(axis => axis.reduce((sum, v, i) => sum + v * flat[i], 0));
    });
  }

  function cosine(a, b) {
    const magnitude = Math.hypot(...a) * Math.hypot(...b);
    if (magnitude < 1e-12) return null;
    const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
    return Math.max(-1, Math.min(1, dot / magnitude));
  }
  return { side, pixels, tokenize, cosine };
})();
if (typeof module !== 'undefined') module.exports = PatchLens;
