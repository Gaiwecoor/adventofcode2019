const {setup, Intcode, Grid} = require("../tools");

class Tensor extends Grid {
  constructor() {
    super();
  }

  get(x, y) {
    if (!this.has(x, y)) this.set(x, y, new Intcode(this.code).setInput([x, y]).execute().out);
    return super.get(x, y);
  }
}

const tensor = new Tensor();

function part1(code) {
  tensor.code = code;

  let affected = 0;
  for (let y = 0; y < 50; y++)
    for (let x = 0; x < 50; x++)
      affected += tensor.get(x, y);
  return affected;
}

function part2(code) {
  for (let y1 = 600; y1 < Infinity; y1++) {
    for (let x1 = 1200; x1 < Infinity; x1++) {
      if (!tensor.get(x1, y1)) continue; // Left corner isn't there yet. Keep moving.
      if (!tensor.get(x1 + 99, y1)) break; // Too narrow, move on to next row.
      if (!tensor.get(x1, y1 + 99)) continue; // Too shallow, move on to next column.
      return x1 * 10000 + y1;
    }
  }
}

module.exports = {setup, part1, part2};
