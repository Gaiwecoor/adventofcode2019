const setup = (data) => {
  data = data.split("\n").map(react => react.split(" => "));
  const ORE = new Reaction();
  const reactions = new UMap([["ORE", ORE]]);
  ORE.reactions = reactions;
  for (const reaction of data) {
    const react = new Reaction(reaction);
    react.reactions = reactions.set(react.chemical, react);
  }
  return reactions;
};
const {UMap} = require("../tools");

const parse = (chem) => {
  const parts = chem.split(" ");
  return {n: parseInt(parts[0], 10), chemical: parts[1]};
}

class Reaction {
  constructor(react = ["1 ORE", "1 ORE"]) {
    let result = parse(react[1]);
    this.chemical = result.chemical;
    this.yields = result.n;

    if (this.chemical == "ORE") {
      this.requires = null;
      this.chainLength = 0;
    } else {
      this.requires = {};
      for (const comp of react[0].split(", ")) {
        let chem = parse(comp);
        this.requires[chem.chemical] = chem.n;
      }
    }
  }

  get chain() {
    if (this.chainLength !== undefined) return this.chainLength;
    this.chainLength = 0;
    for (const x in this.requires) {
      this.chainLength = Math.max(this.reactions.get(x).chain, this.chainLength);
    }
    return ++this.chainLength;
  }
}

function part1(reactions, whole = (n) => Math.ceil(n)) {
  const FUEL = reactions.get("FUEL");
  const requires = new UMap([["FUEL", {reaction: FUEL, required: 1}]]);

  while (requires.size > 1 || !requires.has("ORE")) {
    let element = requires.sort((a, b) => b.reaction.chain - a.reaction.chain)[0];
    let mult = whole(element.required / element.reaction.yields);
    for (let el in element.reaction.requires) {
      let num = element.reaction.requires[el];
      if (!requires.has(el)) requires.set(el, {reaction: reactions.get(el), required: 0});
      requires.get(el).required += num * mult;
      requires.delete(element.reaction.chemical);
    }
  }

  return requires.get("ORE").required;
}

function part2(reactions) {
  return Math.floor(1000000000000 / part1(reactions, (n) => n));
}

module.exports = {setup, part1, part2};
