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

// So many Intcode problems, may as well standardize the setup function.
function setup(data) {
  return data.split(",").map(n => parseInt(n, 10));
}

class Intcode {
  constructor(code, input) {
    this.p = 0;
    this.input = [];
    this.relbase = 0;
    this.opcodes = {
      1: {op: "ADD", params: 3, ref: [0, 0, 1]},
      2: {op: "MULT", params: 3, ref: [0, 0, 1]},
      3: {op: "INPUT", params: 1, ref: [1]},
      4: {op: "OUTPUT", params: 1, ref: [0]},
      5: {op: "JIT", params: 2, ref: [0, 0]},
      6: {op: "JIF", params: 2, ref: [0, 0]},
      7: {op: "LT", params: 3, ref: [0, 0, 1]},
      8: {op: "EQ", params: 3, ref: [0, 0, 1]},
      9: {op: "REL", params: 1, ref: [0]},
      99: {op: "EXIT", params: 0, ref: []}
    };
    this.halt = false;
    if (code) this.loadCode(code);
    if (input !== undefined) this.setInput(input);
  }

  printOutput(val) {
    this.print = val;
    return this;
  }

  execute() {
    while (!this.halt) {
      let {op, modes} = this.mode(this.code[this.p] || 0);
      let params = this.code.slice(this.p + 1, this.p + 1 + op.params)
      .map((p, i) => {
        if ((modes[i] == 0) && !op.ref[i]) {
          return this.code[p] || 0;
        } else if ((modes[i] == 1) || ((modes[i] == 0) && op.ref[i])) {
          return p;
        } else if ((modes[i] == 2) && !op.ref[i]) {
          return this.code[this.relbase + p] || 0;
        } else if ((modes[i] == 2) && op.ref[i]) {
          return this.relbase + p;
        }
      });
      if (this[op.op](...params)) break;
    }
    return this;
  }

  loadCode(code, preserve = true) {
    if (preserve) {
      this.code = Array(code.length);
      for (let i = 0; i < code.length; i++) this.code[i] = code[i];
    } else this.code = code;
    return this;
  }

  mode(num) {
    const opcode = num % 100;
    const op = this.opcodes[opcode];
    if (!op) throw new Error("I don't know this op code! " + JSON.stringify({opcode, num}));
    const params = op.ref.length;
    const modes = Array(params);
    for (let i = 0; i < params; i++) {
      modes[i] = Math.floor(num / (10 ** (i + 2))) % 10;
    }
    return {op, modes};
  }

  setInput(val) {
    if (val instanceof Intcode) val.nextIntcode = this;
    else if (Array.isArray(val)) this.input = this.input.concat(val);
    else this.input.push(val);
    return this;
  }

  // OP CODES
  ADD(a, b, c) {
    this.code[c] = a + b;
    this.p += 4;
  }

  MULT(a, b, c) {
    this.code[c] = a * b;
    this.p += 4;
  }

  INPUT(a) {
    if (this.input.length > 0) {
      this.code[a] = this.input.shift();
      this.p += 2;
    } else return true;
  }

  OUTPUT(a) {
    this.out = a;
    if (this.print) console.log(this.out);
    if (this.nextIntcode) this.nextIntcode.setInput(this.out);
    this.p += 2;
  }

  JIT(a, b) {
    if (a) this.p = b;
    else this.p += 3;
  }

  JIF(a, b) {
    if (!a) this.p = b;
    else this.p += 3;
  }

  LT(a, b, c) {
    this.code[c] = (a < b ? 1 : 0);
    this.p += 4;
  }

  EQ(a, b, c) {
    this.code[c] = (a == b ? 1 : 0);
    this.p += 4;
  }

  REL(a) {
    this.relbase += a;
    this.p += 2;
  }

  EXIT() {
    this.halt = true;
    return true;
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
    const newLink = new this.constructor(value);
    this.after = newLink;
    newLink.before = this;
    newLink.after = displaced;
    if (displaced) displaced.before = newLink;
    return this.after;
  }

  addBefore(value) {
    const displaced = this.before;
    const newLink = new this.constructor(value);
    this.before = newLink;
    newLink.after = this;
    newLink.before = displaced;
    if (displaced) displaced.after = newLink;
    return this.before;
  }

  get chainSize() {
    let link = this;
    let size = 1;
    while (link = link.before) {
      if (link == this) return size;
      size++;
    }
    link = this;
    while (link = link.after) {
      if (link == this) return size;
      size++;
    }
    return size;
  }

  next(q = 1) {
    let link = this;
    let i = 0;
    while (i++ < q) {
      link = link.after;
      if (!link) break;
    }
    return link;
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
      for (const prop in y) this[prop] = y[prop];
    } else {
      this.x = x;
      this.y = y;
      for (const prop in v) this[prop] = v[prop];
    }
  }

  angleTo(pt) {
    // +y downward, 0 North
    let angle = Math.atan2(pt.x - this.x, this.y - pt.y);
    if (angle < 0) angle += Math.PI * 2;
    return angle;
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
    const clone = new this.constructor();
    for (const [key, value] of this) clone.set(key, value);
    return clone;
  }

  filter(fn) {
    const filtered = new this.constructor();
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
      let values = Array(Math.min(parseInt(n, 10), this.size));
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

  join(other) {
    for (const [key, value] of other) this.set(key, value);
    return this;
  }

  map(fn) {
    const mapped = Array(this.size);
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

class Grid extends UMap {
  constructor(data) {
    super(data);
  }

  delete(x, y) {
    return super.delete(`${x},${y}`);
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

class USet extends Set {
  constructor(...args) {
    super(...args);
  }

  clone() {
    const cloned = new this.constructor();
    for (const element of this) cloned.add(element);
    return cloned;
  }

  deleteIndex(index) {
    let i = 0;
    for (const element of this) {
      if (index == i++) {
        this.delete(element);
        return this;
      }
    }
  }

  filter(fn) {
    const filtered = new this.constructor();
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
      let values = Array(Math.min(parseInt(n, 10), this.size));
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
    let i = 0;
    for (const element of this) {
      if (index == i++) return element;
    }
  }

  join(other) {
    for (const element of other) this.add(element);
    return this;
  }

  map(fn) {
    const mapped = Array(this.size);
    let i = 0;
    for (const element of this) mapped[i++] = fn(element);
    return mapped;
  }

  reduce(fn, value) {
    let accumulator = value;
    for (const element of this) accumulator = fn(accumulator, element);
    return accumulator;
  }

  sort(fn) {
    return [...this].sort(fn);
  }
}

class Tree {
  constructor(id, parent) {
    this.id = id;
    this.parent = parent;
    this.children = new UMap();
  }

  addChild(child, returnChild = false) {
    if (!(child instanceof this.constructor)) child = new this.constructor(child);
    child.parent = this;
    this.children.set(child.id, child);
    return (returnChild ? child : this);
  }

  get root() {
    if (!this.parent) return this;
    let current = this;
    while (current = current.parent) {
      if (!current.parent) return current;
    }
  }
}

module.exports = {
  factorial,
  Grid,
  Intcode,
  Link,
  Solution,
  Point,
  Tree,
  UMap,
  USet,
  setup
};
