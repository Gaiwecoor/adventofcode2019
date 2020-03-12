const setup = data => data.split("\n").map(row => row.split(""));
const {UMap, USet, Point} = require("../tools");

class Labrynth {
  constructor(map) {
    // Set navigable
    this.navigable = new USet();
    this.keys = new UMap();
    this.doors = new UMap();
    this.map = map;
    this.compass = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
    this.bots = Array(1);
  }

  accessible(state) {
    return this.keys.filter((key, label) => {
      return (key.behind.filter(door => {
        return !state.collected.has(door.toLowerCase());
      }).size == 0 && !state.collected.has(label));
    });
  }

  getDistances() {
    let map = this.map;
    // Distance between keys
    for (const [label, key] of this.keys) {
      let flooded = new USet();
      let flooding = new USet([key]);
      let steps = 1;
      while (flooding.size > 0) {
        let next = new USet();
        for (const flood of flooding) {
          for (const dir of this.compass) {
            let x = flood.x + dir.x;
            let y = flood.y + dir.y;
            if (!this.navigable.has(`${x},${y}`) || flooded.has(`${x},${y}`)) continue;
            let char = map[y][x];
            next.add(new Point(x, y, {steps}));
            if (char.toUpperCase() == char) continue;
            let other = this.keys.get(char);
            key.to.set(char, steps);
          }
        }

        for (const point of flooding) {
          flooded.add(point.label);
          flooding.delete(point);
        }
        flooding = next;
        steps++;
      }
    }
    return this;
  }

  getKeys() {
    let map = this.map;
    // Distance from Start
    let flooded = new USet();
    let flooding = new USet(this.bots);
    let steps = 1;
    while (flooding.size > 0) {
      let next = new USet();
      for (const flood of flooding) {
        for (const dir of this.compass) {
          let x = flood.x + dir.x;
          let y = flood.y + dir.y;
          let char = map[y][x];
          if (char == "#") continue;
          this.navigable.add(`${x},${y}`);
          if (flooded.has(`${x},${y}`)) continue;
          if (char == ".") {
            next.add(new Point(x, y, {
              behind: new USet(flood.behind),
              region: flood.region
            }));
          } else if (char.toLowerCase() == char) {
            let key = new Point(x, y, {
              char,
              behind: new USet(flood.behind),
              to: new UMap([["@", steps]]),
              region: flood.region
            });
            next.add(key);
            this.keys.set(char, key);
          } else if (char.toUpperCase() == char) {
            let door = new Point(x, y, {
              char,
              behind: new USet(flood.behind).add(char),
              open: false,
              region: flood.region
            });
            next.add(door);
            this.doors.set(char, door);
          }
        }
      }

      for (const point of flooding) {
        flooded.add(point.label);
        flooding.delete(point);
      }
      flooding = next;
      steps++;
    }
    return this;
  }

  getStart() {
    let map = this.map;
    // Collect start information
    for (let y = 0; y < map.length; y++) {
      if (map[y].includes("@")) {
        this.bots = [new Point(map[y].indexOf("@"), y, {
          char: "@",
          behind: new USet(),
          to: new UMap()
        })];
        break;
      }
    }
    return this;
  }

  init() {
    return this.getStart().getKeys().getDistances();
  }

  stateLabel(state) {
    return [...(state.collected)].sort().join("") + ":" + state.location;
  }

  findPath() {
    let complete = new USet();
    let current = new UMap([[":@", {
      steps: 0,
      collected: new USet(),
      location: "@"
    }]]);
    while (current.size > 0) {
      let next = new UMap();
      for (const [label, state] of current) {
        let available = this.accessible(state);
        for (const [location, key] of available) {
          let collected = new USet(state.collected).add(location);
          let newState = {
            steps: state.steps + key.to.get(state.location),
            collected,
            location
          };
          if (next.has(this.stateLabel(newState)) && next.get(this.stateLabel(newState)).steps <= newState.steps) continue;
          if (collected.size == this.keys.size) complete.add(newState);
          else next.set(this.stateLabel(newState), newState);
        }
      }
      current = next;
    }
    return Math.min(...complete.map(s => s.steps));
  }
}

class MultiLabrynth extends Labrynth {
  constructor(map) {
    super(map);
    this.bots = Array(4);
  }

  getStart() {
    let map = this.map;
    // Collect start information
    for (let y = 0; y < map.length; y++) {
      if (map[y].includes("@")) {
        let x = map[y].indexOf("@");
        for (let dir of this.compass) {
          map[y + dir.y][x + dir.x] = "#";
        }
        map[y][x] = "#";

        let dirs = [{x: -1, y: -1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: 1, y: 1}];
        for (let region = 0; region < dirs.length; region++) {
          let dir = dirs[region];
          map[y + dir.y][x + dir.x] = "@";
          this.bots[region] = new Point(x + dir.x, y + dir.y, {
            char: "@",
            behind: new USet(),
            to: new UMap(),
            region
          });
        }
        break;
      }
    }
    return this;
  }

  stateLabel(state) {
    return [...(state.collected)].sort().join("") + ":" + state.locations.join("");
  }

  findPath() {
    let complete = new USet();
    let current = new UMap([[":@@@@", {
      steps: 0,
      collected: new USet(),
      locations: Array(4).fill("@")
    }]]);
    while (current.size > 0) {
      let next = new UMap();
      for (const [label, state] of current) {
        let available = this.accessible(state);
        for (const [location, key] of available) {
          let collected = new USet(state.collected).add(location);
          let newState = {
            steps: state.steps + key.to.get(state.locations[key.region]),
            collected,
            locations: state.locations.map((l, r) => (r == key.region ? location : l))
          };
          if (next.has(this.stateLabel(newState)) && next.get(this.stateLabel(newState)).steps <= newState.steps) continue;
          if (collected.size == this.keys.size) complete.add(newState);
          else next.set(this.stateLabel(newState), newState);
        }
      }
      current = next;
    }
    return Math.min(...complete.map(s => s.steps));
  }
}

function part1(map) {
  return new Labrynth(map).init().findPath();
}

function part2(map) {
  return new MultiLabrynth(map).init().findPath();
}

module.exports = {setup, part1, part2};
