const setup = (data) => data.split(",").map(n => parseInt(n, 10));

function mode(num) {
  let params = Math.floor(Math.log10(num)) - 1;
  let op = num % 100;
  const modes = Array(3).fill(0);
  for (let i = 0; i < params; i++) {
    modes[i] = Math.floor(num / (10 ** (i + 2))) % 10;
  }
  return {op, modes};
}

function part1(data, input = 1) {
  // Clone the code so we don't modify the original
  const code = Array(data.length);
  for (let i = 0; i < data.length; i++) code[i] = data[i];

  let p = 0;
  let out;
  while (true) {
    let {op, modes} = mode(code[p]);
    let storage;
    switch (op) {
      case 1:
        storage = (modes[2] ? p + 3 : code[p + 3]);
        code[storage] = (modes[0] ? code[p + 1] : code[code[p + 1]]) + (modes[1] ? code[p + 2] : code[code[p + 2]]);
        p += 4;
        break;
      case 2:
        storage = (modes[2] ? p + 3 : code[p + 3]);
        code[storage] = (modes[0] ? code[p + 1] : code[code[p + 1]]) * (modes[1] ? code[p + 2] : code[code[p + 2]]);
        p += 4;
        break;
      case 3:
        // STORE INPUT
        storage = (modes[0] ? p + 1 : code[p + 1]);
        code[storage] = input;
        p += 2;
        break;
      case 4:
        // OUTPUT
        out = (modes[0] ? code[p + 1] : code[code[p + 1]]);
        console.log(p, (modes[0] ? code[p + 1] : code[code[p + 1]]));
        p += 2;
        break;
      case 5:
        if (modes[0] ? code[p + 1] : code[code[p + 1]])
          p = (modes[1] ? code[p + 2] : code[code[p + 2]]);
        else p += 3;
        break;
      case 6:
        if (!(modes[0] ? code[p + 1] : code[code[p + 1]]))
          p = (modes[1] ? code[p + 2] : code[code[p + 2]]);
        else p += 3;
        break;
      case 7:
        storage = (modes[2] ? p + 3 : code[p + 3]);
        if ((modes[0] ? code[p + 1] : code[code[p + 1]]) < (modes[1] ? code[p + 2] : code[code[p + 2]]))
          code[storage] = 1;
        else code[storage] = 0;
        p += 4;
        break;
      case 8:
        storage = (modes[2] ? p + 3 : code[p + 3]);
        if ((modes[0] ? code[p + 1] : code[code[p + 1]]) == (modes[1] ? code[p + 2] : code[code[p + 2]]))
          code[storage] = 1;
        else code[storage] = 0;
        p += 4;
        break;
      case 99:
        return out;
      default:
        throw new Error("I don't know this code! " + code[0]);
    }
  }
}

function part2(data) {
  return part1(data, 5);
}

module.exports = {setup, part1, part2};
