const setup = (data) => data.split(",").map(n => parseInt(n, 10));
const {Intcode} = require("../tools");

function part1(code) {
  return new Intcode(code).setInput(1).execute().out;
}

function part2(code) {
  return new Intcode(code).setInput(2).execute().out;
}

module.exports = {setup, part1, part2};
