const {USet, Point} = require("../tools");
const setup = (data) => {
  data = data.split("\n");
  const belt = new USet();
  for (let y = 0; y < data.length; y++) {
    for (let x = 0; x < data[y].length; x++) {
      if (data[y][x] == "#") belt.add(new Point(x, y));
    }
  }
  return belt;
};

function part1(belt) {
  let max = 0;
  let center = null;
  for (const a1 of belt) {
    const sees = new USet();
    for (const a2 of belt) {
      if (!a1.is(a2)) sees.add(a1.angleTo(a2));
    }
    if (sees.size > max) {
      max = sees.size;
      if (center) center.value = false;
      center = a1;
      center.value = true;
    }
  }
  return max;
}

function part2(belt) {
  // Find center and remove from targets
  const center = belt.find(a => a.value);
  belt.delete(center);
  // Collect discrete angle list
  let angles = new USet();
  for (const a of belt) angles.add(center.angleTo(a));
  angles = angles.sort((a, b) => a - b);

  let destroyed = 0;
  let angle = 0;
  let targeted;

  while (destroyed < 200) {
    const inLine = belt.filter(a => center.angleTo(a) == angles[angle % angles.length]);
    if (inLine.size > 0) {
      target = inLine.sort((a, b) => center.d(a) - center.d(b))[0];
      if (target) {
        belt.delete(target);
        destroyed++;
      }
    }
    angle++;
  }
  return target.x * 100 + target.y;
}

module.exports = {setup, part1, part2};
