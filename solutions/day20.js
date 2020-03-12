/**************************************************
**  NOTE: I tampered with my input,              **
**  making single-character labels for portals.  **
**************************************************/

const setup = (data) => new Donut(data.replace(/ /g, "#").split("\n"));
const {Grid, UMap, USet, Point} = require("../tools");

class Donut {
  constructor(map) {
    this.map = map;
    this.height = map.length - 1;
    this.width = map[0].length - 1;
    this.regionCount = 0;
    this.regions = new Grid();
    this.portals = new UMap();
    for (let y = 1; y < map.length; y++) {
      for (let x = 1; x < map[y].length; x++) {
        if (this.regions.has(x, y)) continue;
        else if (map[y][x] == ".") this.fillRegion(x, y);
      }
    }
    this.measureRegions();
  }

  addPortal(pt) {
    this.portals.set(pt.label, pt);
  }

  fillRegion(x, y) {
    if (this.regions.has(x, y)) return this;
    let region = this.regionCount++;
    let compass = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];

    let flooding = new USet([(x instanceof Point ? new Point(x, {region}) : new Point(x, y, {region}))]);
    let flooded = new USet();

    while (flooding.size > 0) {
      let next = new USet();
      for (const flood of flooding) {
        for (const dir of compass) {
          let point = flood.offset(dir, {region});
          if (flooded.has(point.label)) continue;
          let name = this.value(point);
          switch (name) {
            default:
              name += (this.outer(point) ? 0 : 1);
              point.name = name;
              point.to = new UMap();
              this.portals.set(name, point);
            case ".":
              next.add(point);
              this.regions.set(point, region);
            case "#":
            case " ":
            case undefined:
              break;
          }
        }
        flooded.add(flood.label);
        flooding.delete(flood);
      }
      flooding = next;
    }
    return this;
  }

  findPath() {
    let start = this.portals.get("@0");
    let checking = new UMap([[`${start.name}:${start.name}`, {
      portal: start,
      path: [start.name],
      steps: 0
    }]]);
    let checked = new USet();
    let complete = new UMap();
    while (checking.size > 0) {
      let next = new UMap();
      for (const [pathLabel, state] of checking) {
        for (const [name, distance] of state.portal.to) {
          if (state.path.includes(name)) continue;
          let portal = this.portals.get(name);
          let step = {
            portal,
            path: [...state.path, name],
            steps: state.steps + distance
          }
          let stepLabel = this.pathLabel(step);

          if (name.startsWith("%")) {
            complete.set(step.path.join(","), step);
          } else {
            let portalExit = this.portals.find(p => p.name.startsWith(name[0]) && p.name != name);
            step.path.push(portalExit.name)
            step.portal = portalExit;
            step.steps++;
            next.set(this.pathLabel(step), step);
          }
        }
        checked.add(this.pathLabel(state));
        checking.delete(this.pathLabel(state));
      }

      checking = next;
    }
    return Math.min(...complete.map(s => s.steps));
  }

  measureRegions() {
    let compass = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: -1}, {x: 0, y: 1}];

    let flooding = new USet(this.portals.values());
    let flooded = new USet();
    let steps = 1;

    while (flooding.size > 0) {
      let next = new USet();
      for (const flood of flooding) {
        for (const dir of compass) {
          let point = flood.offset(dir, {name: flood.name, region: flood.region});
          if (flooded.has(`${point.name}:${point.label}`)) continue;
          let name = this.value(point);
          switch (name) {
            default:
              this.portals.get(point.name).to.set(name + (this.outer(point) ? 0 : 1), steps);
              break;
            case ".":
              next.add(point);
            case "#":
            case " ":
            case undefined:
              break;
          }
        }
        flooded.add(`${flood.name}:${flood.label}`);
        flooding.delete(flood);
      }
      steps++;
      flooding = next;
    }
    return this;
  }

  outer(pt) {
    return (pt.x == 0 || pt.y == 0 || pt.x == this.width || pt.y == this.height);
  }

  pathLabel(state) {
    return [...state.path].sort().join(",") + ":" + state.portal.name;
  }

  recursionPath() {
    let start = this.portals.get("@0");
    let checking = new UMap([[`${start.name}:${start.name}`, {
      portal: start,
      path: [start.name + ".0"],
      steps: 0,
      level: 0
    }]]);
    let checked = new USet();
    let complete = new UMap();
    while (checking.size > 0 && complete.size < 5) {
      let next = new UMap();
      for (const [pathLabel, state] of checking) {
        for (const [name, distance] of state.portal.to) {
          if (
            state.path.includes(`${name}.${state.level}`) || // We've already been there.
            (
              (
                state.level == 0 &&
                name.endsWith("0") &&
                name != "@0" &&
                name != "%0"
              )
            ) ||
            (
              (
                state.level != 0 &&
                (
                  name == "@0" ||
                  name == "%0"
                )
              )
            )
          ) continue;
          let portal = this.portals.get(name);
          let step = {
            portal,
            path: [...state.path, `${name}.${state.level}`],
            steps: state.steps + distance,
            level: state.level
          }
          let stepLabel = this.pathLabel(step);

          if (name == "%0") {
            complete.set(step.path.join(","), step);
          } else {
            let portalExit = this.portals.find(p => p.name.startsWith(name[0]) && p.name != name);
            if (this.outer(step.portal)) step.level--;
            else step.level++;
            step.path.push(`${portalExit.name}.${step.level}`);
            step.portal = portalExit;
            step.steps++;
            next.set(this.pathLabel(step), step);
          }
        }
        checked.add(this.pathLabel(state));
        checking.delete(this.pathLabel(state));
      }

      checking = next;
    }
    return Math.min(...complete.map(s => s.steps));
  }

  value(x, y) {
    if (x instanceof Point) {
      y = x.y;
      x = x.x;
    }
    if (this.map[y] && this.map[y][x]) return this.map[y][x];
    else return undefined;
  }
}

function part1(maze) {
  return maze.findPath();
}

function part2(maze) {
  return maze.recursionPath();
}

module.exports = {setup, part1, part2};
