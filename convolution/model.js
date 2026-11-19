const ConvLab = (() => {
  const kernels = {
    vertical: [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]],
    horizontal: [[-1, -2, -1], [0, 0, 0], [1, 2, 1]]
  };
  function scene(pattern) {
    return Array.from({ length: 7 }, (_, r) => Array.from({ length: 7 }, (_, c) => {
      if (pattern === 'vertical') return Number(c >= 3);
      if (pattern === 'horizontal') return Number(r >= 3);
      return Number(r >= 2 && r <= 4 && c >= 2 && c <= 4);
    }));
  }
  function windowAt(image, kernel, row, col) {
    const products = kernel.map((line, r) => line.map((k, c) => k * image[row + r][col + c]));
    return { products, value: products.flat().reduce((sum, v) => sum + v, 0) };
  }
  function apply(image, kernel) {
    return Array.from({ length: image.length - kernel.length + 1 }, (_, r) =>
      Array.from({ length: image[0].length - kernel[0].length + 1 }, (_, c) => windowAt(image, kernel, r, c).value));
  }
  return { kernels, scene, windowAt, apply };
})();
if (typeof module !== 'undefined') module.exports = ConvLab;
