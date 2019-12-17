const {Intcode, setup} = require("../tools");

function part1(code, sigStart = 0) {
  let signal = Array(5);
  let amps;
  let max = 0;
  AmpA:
  for (let a = sigStart; a < sigStart + 5; a++) {
    signal[0] = a;
    AmpB:
    for (let b = sigStart; b < sigStart + 5; b++) {
      signal.fill(undefined, 1);
      if (signal.includes(b)) continue AmpB;
      signal[1] = b;
      AmpC:
      for (let c = sigStart; c < sigStart + 5; c++) {
        signal.fill(undefined, 2);
        if (signal.includes(c)) continue AmpC;
        signal[2] = c;
        AmpD:
        for (let d = sigStart; d < sigStart + 5; d++) {
          signal.fill(undefined, 3);
          if (signal.includes(d)) continue AmpD;
          signal[3] = d;
          AmpE:
          for (let e = sigStart; e < sigStart + 5; e++) {
            signal.fill(undefined, 4);
            if (signal.includes(e)) continue AmpE;
            signal[4] = e;
            amps = signal.map((phase, amp) => new Intcode(code).setInput(phase));
            amps[0].setInput(0);
            for (let amp = 0; amp < 5; amp++) amps[amp].nextIntcode = amps[(amp + 1) % 5];
            let amp = 0;
            while (amps.reduce((a, c) => a || !c.halt, false)) { // Continue as long as one of the amps hasn't halted
              amps[amp].execute();
              amp = (amp + 1) % 5;
            }
            max = Math.max(max, amps[4].out);
          }
        }
      }
    }
  }
  return max;
}

function part2(code) {
  return part1(code, 5);
}

module.exports = {setup, part1, part2};
