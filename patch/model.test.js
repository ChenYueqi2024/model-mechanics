const test = require('node:test');
const assert = require('node:assert/strict');
const { pixels, tokenize, cosine } = require('./model');
const image = pixels();
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-9);

test('RGB means respect channels and row-major patch order', () => {
  const tokens = tokenize(image, 16, 'color');
  [179, 78, 77].forEach((v, i) => near(tokens[0][i], v / 255));
  near(tokens[0][3], (179 + 78 + 77) / (3 * 255));
  near(tokens[4][0], 62 / 255);
});

for (const size of [8, 16]) {
  for (const mode of ['color', 'texture']) {
    test(`${size}px / ${mode} reproduces every nearest-neighbor tie`, () => {
      const tokens = tokenize(image, size, mode);
      const cols = 64 / size;
      assert.equal(tokens.length, cols ** 2);
      function group(id) {
        const coordinate = mode === 'color' ? Math.floor(id / cols) : id % cols;
        return Math.floor(coordinate * size / 16);
      }
      for (const [i, token] of tokens.entries()) {
        assert.equal(token.length, 4);
        for (const [j, other] of tokens.entries()) {
          const score = cosine(token, other);
          if (group(i) === group(j)) near(score, 1);
          else assert.ok(score < 1 - 1e-9);
        }
      }
    });
  }
}

test('constant patches cancel in each balanced texture mask', () => {
  const tokens = tokenize(new Uint8Array(image.length).fill(90), 16, 'texture');
  tokens.flat().forEach(v => near(v, 0));
  assert.equal(cosine(tokens[0], tokens[1]), null);
});
