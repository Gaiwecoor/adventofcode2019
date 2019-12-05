const setup = (data) => data.split("-").map(n => parseInt(n, 10));

function part1(range) {
  let count = 0;

  numberCheck:
  for (let pwd = range[0]; pwd <= range[1]; pwd++) {
    let code = pwd.toString(10);
    let hasDouble = false;
    for (let i = 1; i < 6; i++) {
      if (code[i] < code[i - 1]) continue numberCheck;
      if (code[i] == code[i - 1]) hasDouble = true;
    }
    if (hasDouble) count++;
  }

  return count;
}

function part2(range) {
  let count = 0;

  numberCheck:
  for (let pwd = range[0]; pwd <= range[1]; pwd++) {
    let code = pwd.toString(10);
    let hasDouble = false;
    for (let i = 1; i < 6; i++) {
      if (code[i] < code[i - 1]) continue numberCheck;
      if ((code[i] == code[i - 1]) && (i == 5 || (code[i] != code[i + 1])) && (i == 1 || (code[i - 1] != code[i - 2]))) hasDouble = true;
    }
    if (hasDouble) count++;
  }

  return count;
}

module.exports = {setup, part1, part2};
