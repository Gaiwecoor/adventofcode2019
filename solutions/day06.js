const {Tree, UMap, USet} = require("../tools");

class Celestial extends Tree {
  constructor(id, parent) {
    super(id, parent);
  }

  get orbitCount() {
    if (this.ocount) return this.ocount;
    else return this.ocount = (this.parent ? this.parent.orbitCount + 1 : 0);
  }
}

const setup = (data) => {
  const orbits = new UMap();
  for (let [center, satellite] of data.split("\n").map(o => o.split(")"))) {
    if (!orbits.has(center)) orbits.set(center, new Celestial(center));
    if (!orbits.has(satellite)) orbits.set(satellite, new Celestial(satellite));
    orbits.get(center).addChild(orbits.get(satellite));
  }
  return orbits;
};

function part1(orbits) {
  let count = 0;
  for (const [key, satellite] of orbits) count += satellite.orbitCount;
  return count;
}

function part2(orbits) {
  let chain = new USet();
  let you = orbits.get("YOU");
  let san = orbits.get("SAN");
  let ancestor;

  ancestor = you;
  while (ancestor = ancestor.parent) chain.add(ancestor);

  ancestor = san;
  while (!chain.has(ancestor)) ancestor = ancestor.parent;

  return you.parent.orbitCount + san.parent.orbitCount - 2 * (ancestor.orbitCount);
}

module.exports = {setup, part1, part2};
