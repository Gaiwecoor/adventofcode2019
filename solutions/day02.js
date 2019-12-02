const setup = (data) => data.split(",").map(int => parseInt(int, 10));

function part1(data, n = 12, v = 2) {
  // Clone the code so we don't modify the original
  const code = Array(data.length);
  for (let i = 0; i < data.length; i++) code[i] = data[i];
  // Init the 1202 (Or other, as req'd by part2)
  code[1] = n;
  code[2] = v;

  let p = 0;
  while (true) {
    switch (code[p]) {
      case 1:
        code[code[p + 3]] = code[code[p + 1]] + code[code[p + 2]];
        break;
      case 2:
        code[code[p + 3]] = code[code[p + 1]] * code[code[p + 2]];
        break;
      case 99:
        return code[0];
      default:
        throw new Error("I don't know this code! " + code[0]);
    }
    p += 4;
  }
}

function part2(data) {
  for (let n = 0; n < 100; n++) {
    for (let v = 0; v < 100; v++) {
      let output = part1(data, n, v);
      if (output == 19690720) return 100 * n + v;
    }
  }
  throw new Error("I couldn't find an answer!");
}

module.exports = {setup, part1, part2};
