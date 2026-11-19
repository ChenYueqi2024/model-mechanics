const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate, trajectory } = require('./gradient/model');
const { kernels, scene, apply, windowAt } = require('./convolution/model');

test('backpropagation agrees with the centered finite difference of loss', () => {
  const epsilon = 1e-5;
  for (const weight of [-1.5, 0, 0.5, 1, 3]) {
    const actual = (evaluate(weight+epsilon).loss - evaluate(weight-epsilon).loss) / (2*epsilon);
    assert.ok(Math.abs(actual - evaluate(weight).gradient) < 1e-8);
  }
});

test('all three replay traces match the analytic error after every step', () => {
  for (const rate of [0.1, 0.2, 0.25]) {
    const states = trajectory(rate, 12);
    assert.equal(states.length, 13);
    states.forEach(({ prediction, loss }, i) => {
      const error = -3 * (1 - 9*rate)**i;
      assert.ok(Math.abs(prediction - (3 + error)) < 1e-10);
      assert.ok(Math.abs(loss - error**2/2) < 1e-10);
    });
  }
});

test('both Sobel orientations detect only their matching step, including polarity', () => {
  for (const direction of Object.keys(kernels)) {
    const input = scene(direction);
    for (const [orientation, kernel] of Object.entries(kernels)) {
      const result = apply(input, kernel);
      const inverted = apply(input.map(row => row.map(x => 1-x)), kernel);
      assert.equal(result.length, 5);
      result.forEach((line,r) => {
        assert.equal(line.length, 5);
        line.forEach((value,c) => {
          const coordinate = direction === 'vertical' ? c : r;
          const expected = orientation === direction && [1,2].includes(coordinate) ? 4 : 0;
          assert.equal(value, expected);
          assert.equal(value + inverted[r][c], 0);
        });
      });
    }
  }
});

test('each displayed product is the selected input times its original kernel weight', () => {
  const input = scene('square');
  input[3][3] = 0;
  for (const kernel of Object.values(kernels)) {
    const output = apply(input,kernel);
    output.forEach((line,r) => line.forEach((value,c) => {
      const { products } = windowAt(input,kernel,r,c);
      const expected = kernel.map((row,i) => row.map((weight,j) => input[r+i][c+j]*weight));
      assert.deepEqual(products, expected);
      assert.equal(value, expected.flat().reduce((a,b) => a+b, 0));
    }));
  }
});
