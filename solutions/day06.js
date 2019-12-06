const setup = (data) => data.split("\n").map(o => o.split(")"));

const {Tree, UMap, USet} = require("../tools");

class Celestial extends Tree {
  constructor(id, parent) {
    super(id, parent);
  }

  get orbitCount() {
    return (this.parent ? this.parent.orbitCount + 1 : 0);
  }
}

const orbits = new UMap();

function part1(data) {
  for (let [center, satellite] of data) {
    if (!orbits.has(center)) orbits.set(center, new Celestial(center));
    if (!orbits.has(satellite)) orbits.set(satellite, new Celestial(satellite));
    orbits.get(center).addChild(orbits.get(satellite));
  }
  let count = 0;
  for (const [key, satellite] of orbits) count += satellite.orbitCount;
  return count;
}

function part2(data) {
  let chain = new USet();
  let you = orbits.get("YOU");
  let san = orbits.get("SAN");
  let node, current;

  current = you;
  while (current = current.parent) {
    chain.add(current);
  }

  current = san;
  while (current = current.parent) {
    if (chain.has(current)) {
      node = current;
      break;
    }
  }

  return you.parent.orbitCount + san.parent.orbitCount - 2 * (node.orbitCount);
}

module.exports = {setup, part1, part2};
