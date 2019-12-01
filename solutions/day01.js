const setup = (data) => data.split("\n").map(load => parseInt(load, 10));

function part1(data) {
  return data.reduce((total, load) => total + Math.floor(load / 3) - 2, 0);
}

function part2(data) {
  const fuel = (load) => Math.max(Math.floor(load / 3) - 2, 0);

  let total = 0;
  for (let tank of data) {
    let additional;

    while (additional = fuel(tank)) {
      total += additional;
      tank = additional;
    }
  }
  return total;
}

module.exports = {setup, part1, part2};
