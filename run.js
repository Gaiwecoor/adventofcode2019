const day = process.argv[2];
const {Solution} = require("./tools");

console.time("Complete Time");
console.time("Setup Time");
const parts = require(`./solutions/day${day.padStart(2, "0")}`);
const solve = new Solution(day, parts);
solve.setup();
console.timeEnd("Setup Time");
console.time("Part 1 Time");
solve.pt1();
console.timeEnd("Part 1 Time");
console.time("Part 2 Time");
solve.pt2();
console.timeEnd("Part 2 Time");
console.timeEnd("Complete Time");
