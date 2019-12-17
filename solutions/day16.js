const setup = null;

function FFT(n = 1) {
  const base = [0, 1, 0, -1];
  const pattern = Array(base.length * n);
  for (let i = 0; i < pattern.length; i++) pattern.fill(base[i], i * n, (i + 1) * n);
  return pattern;
}

function part1(data, offset = 0) {
  let signal = data.split("").map(n => parseInt(n, 10));

  for (let phase = 1; phase <= 100; phase++) {
    let out = Array(signal.length);
    for (let a = 0; a < signal.length; a++) {
      let sum = 0, i = 1, pattern = FFT(a + 1);
      for (let b = 0; b < signal.length; b++) {
        let digit = pattern[i] * signal[b];
        sum += digit;
        i = (i + 1) % pattern.length;
      }
      out[a] = Math.abs(sum) % 10;
    }
    signal = out;
  }
  return signal.slice(offset, offset + 8).join("");
}

function part2(data) {
  return undefined;
}

module.exports = {setup, part1, part2};
