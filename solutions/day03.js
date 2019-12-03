const setup = (data) => data.split("\n").map(wire => wire.split(","));
const {UMap} = require("../tools");

var board = new UMap();

function part1(wires) {
  for (let i = 0; i < wires.length; i++) {
    let x = 0;
    let y = 0;
    let steps = 0;
    for (let strand of wires[i]) {
      let length = parseInt(strand.substr(1), 10);
      switch (strand[0]) {
        case "U":
          for (let j = 0; j < length; j++) {
            if (!board.has(`${x},${y + j}`)) board.set(`${x},${y + j}`, [Infinity, Infinity]);
            let state = board.get(`${x},${y + j}`);
            state[i] = Math.min(steps, state[i]);
            steps++;
          }
          y += length;
          break;
        case "D":
          for (let j = 0; j < length; j++) {
            if (!board.has(`${x},${y - j}`)) board.set(`${x},${y - j}`, [Infinity, Infinity]);
            let state = board.get(`${x},${y - j}`);
            state[i] = Math.min(steps, state[i]);
            steps++;
          }
          y -= length;
          break;
        case "L":
          for (let j = 0; j < length; j++) {
            if (!board.has(`${x - j},${y}`)) board.set(`${x - j},${y}`, [Infinity, Infinity]);
            let state = board.get(`${x - j},${y}`);
            state[i] = Math.min(steps, state[i]);
            steps++;
          }
          x -= length;
          break;
        case "R":
          for (let j = 0; j < length; j++) {
            if (!board.has(`${x + j},${y}`)) board.set(`${x + j},${y}`, [Infinity, Infinity]);
            let state = board.get(`${x + j},${y}`);
            state[i] = Math.min(steps, state[i]);
            steps++;
          }
          x += length;
          break;
        default:
          throw new Error("I don't understand this! " + strand);
      }
    }
  }
  board.delete("0,0");
  board = board.filter(w => w[0] !== Infinity && w[1] !== Infinity);
  return Math.min(...(board.map((v, k) => k.split(",").map(c => parseInt(c, 10)).reduce((a, c) => a + Math.abs(c), 0))));
}

function part2(wires) {
  return Math.min(...(board.map(v => v[0] + v[1])));
}

module.exports = {setup, part1, part2};
