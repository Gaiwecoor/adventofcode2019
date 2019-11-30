const fs = require("fs"),
  path = require("path");

const defaults = {
  split: false,
  setup: (data) => data,
  part1: () => false,
  part2: () => false
}

function factorial(n) {
  n = parseInt(n, 10);
  if (n < 0) return new Error("That's a negative integer.");

  if (n == 0) return 1;

  let product = 1;
  for (let i = 2; i <= n; i++) product *= i;

  return product;
}

class Grid extends Map {
  constructor(data) {
    super(data);
  }

  get(x, y) {
    return super.get(`${x},${y}`);
  }

  has(x, y) {
    return super.has(`${x},${y}`);
  }

  set(x, y, value) {
    return super.set(`${x},${y}`, value);
  }
}

class Link {
  constructor(value, closed = true) {
    this.value = value;
    this.after = (closed ? this : undefined);
    this.before = (closed ? this : undefined);
  }

  addAfter(value) {
    const displaced = this.after;
    const newLink = new Link(value);
    this.after = newLink;
    newLink.before = this;
    newLink.after = displaced;
    if (displaced) displaced.before = newLink;
    return this.after;
  }

  addBefore(value) {
    const displaced = this.before;
    const newLink = new Link(value);
    this.before = newLink;
    newLink.after = this;
    newLink.before = displaced;
    if (displaced) displaced.after = newLink;
    return this.before;
  }

  get chainSize() {
    let link = this;
    let size = 1;
    if (this.closed) {
      while (this !== link.after) {
        link = link.after;
        size++;
      }
    } else {
      while (link = link.before) size++;
      link = this;
      while (link = link.after) size++;
    }
    return size;
  }

  next(q = 1) {
    let link = this;
    let i = 0;
    while (i++ < q) {
      link = link.after;
      if (!link) break;
    }return link;
  }

  previous(q = 1) {
    let link = this;
    let i = 0;
    while (i++ < q) {
      link = link.before;
      if (!link) break;
    }
    return link;
  }

  remove(after = true) {
    this.before.after = this.after;
    this.after.before = this.before;
    return (after ? this.after : this.before);
  }
}

class Point {
  constructor(x, y, v) {
    if (x.x !== undefined && x.y !== undefined) {
      this.x = x.x;
      this.y = x.y;
      this.value = y;
    } else {
      this.x = x;
      this.y = y;
      this.value = v;
    }
  }

  d(pt) {
    return Math.abs(this.x - pt.x) + Math.abs(this.y - pt.y);
  }

  is(pt) {
    return (this.x === pt.x) && (this.y === pt.y);
  }

  get label() {
    return `${this.x},${this.y}`;
  }
}

class Solution {
  constructor(day, parts = defaults) {
    this.data = fs.readFileSync(path.resolve(__dirname, `./data/day${day.padStart(2, "0")}.txt`), "utf8").trim();

    this.init = (parts.setup ? parts.setup : defaults.setup);
    this.part1 = (parts.part1 ? parts.part1 : defaults.part1);
    this.part2 = (parts.part2 ? parts.part2 : defaults.part2);
  }

  pt1() {
    console.log("Part 1 Result:", this.part1(this.data));
    return this;
  }

  pt2() {
    console.log("Part 2 Result:", this.part2(this.data));
    return this;
  }

  setup() {
    this.data = this.init(this.data);
    return this;
  }
}

class UMap extends Map {
  constructor(data) {
    super(data);
  }

  clone() {
    const clone = new UMap();
    for (const [key, value] of this) clone.set(key, value);
    return clone;
  }

  filter(fn) {
    const filtered = new UMap();
    for (const [key, value] of this) {
      if (fn(value, key)) filtered.set(key, value);
    }
    return filtered;
  }

  find(fn) {
    for (const [key, value] of this) {
      if (fn(value, key)) return value;
    }
    return undefined;
  }

  first(n) {
    if (n !== undefined) {
      let values = new Array(Math.min(parseInt(n, 10), this.size));
      let i = 0;
      for (const [key, value] of this) {
        values[i++] = value;
        if (i >= n) break;
      }
      return values;
    } else {
      for (const [key, value] of this) {
        return value;
      }
    }
  }

  map(fn) {
    const mapped = new Array(this.size);
    let i = 0;
    for (const [key, value] of this) {
      mapped[i++] = fn(value, key, this);
    }
    return mapped;
  }

  reduce(fn, init) {
    let accumulator = init;
    for (const [key, value] of this) {
      if (accumulator == undefined) {
        accumulator = value;
        continue;
      }
      accumulator = fn(accumulator, value, key, this);
    }
    return accumulator;
  }

  sort(fn) {
    let sorted = Array.from(this.values());
    return sorted.sort(fn);
  }
}

class USet extends Set {
  constructor(...args) {
    super(...args);
  }

  clone() {
    return new USet([...this]);
  }

  deleteIndex(index) {
    this.delete(this.getIndex(index));
    return this;
  }

  filter(fn) {
    const filtered = new USet();
    for (const value of this) {
      if (fn(value)) filtered.add(value);
    }
    return filtered;
  }

  find(fn) {
    for (const value of this) {
      if (fn(value)) return value;
    }
    return null;
  }

  first(n) {
    if (n !== undefined) {
      let values = new Array(Math.min(parseInt(n, 10), this.size));
      let i = 0;
      for (const value of this) {
        values[i++] = value;
        if (i >= n) break;
      }
      return values;
    } else {
      for (const value of this) {
        return value;
      }
    }
  }

  getIndex(index) {
    return [...this][index];
  }

  map(fn) {
    return [...this].map(fn);
  }

  reduce(fn, value) {
    return [...this].reduce(fn, value);
  }

  sort(fn) {
    return [...this].sort(fn);
  }
}

module.exports = {
  factorial,
  Grid,
  Link,
  Solution,
  Point,
  UMap,
  USet
};
