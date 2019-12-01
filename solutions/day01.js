const setup = (data) => data.split("\n").map(l => parseInt(l, 10));

function part1(data) {
  return data.map(l => Math.floor(l / 3) - 2).reduce((a, c) => a + c, 0);
}

function part2(data) {
  const fuel = (m) => Math.max(Math.floor(m / 3) - 2, 0);

  let total = 0;
  for (let i = 0; i < data.length; i++) {
    let tank = data[i];
    let additional;

    while (additional = fuel(tank)) {
      total += additional;
      tank = additional;
    }
  }
  return total;
}

module.exports = {setup, part1, part2};
