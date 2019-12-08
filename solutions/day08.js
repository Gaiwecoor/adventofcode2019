const setup = (data) => {
  let layers = data.length / (25 * 6);
  const image = Array(layers);
  for (let l = 0; l < layers; l++) {
    image[l] = Array(6);
    for (let y = 0; y < 6; y++) {
      image[l][y] = data.substr((25 * 6 * l) + (y * 25), 25);
    }
  }
  return image;
};

function digitCount(layer) {
  let zeros = 0;
  let ones = 0;
  let twos = 0;
  for (let i = 0; i < layer.length; i++) {
    if (layer[i] == "0") zeros++;
    else if (layer[i] == "1") ones++;
    else if (layer[i] == "2") twos++;
  }
  return {zeros, ones, twos};
}

function part1(image) {
  let minZeros = Infinity;
  let product;
  for (let layer = 0; layer < image.length; layer++) {
    let layerStr = image[layer].join("");
    let counts = digitCount(layerStr);
    if (counts.zeros < minZeros) {
      minZeros = counts.zeros;
      product = counts.ones * counts.twos;
    }
  }
  return product;
}

function part2(image) {
  for (let y = 0; y < 6; y++) {
    let row = Array(25);
    for (let x = 0; x < 25; x++) {
      findColor:
      for (let l = 0; l < image.length; l++) {
        if (image[l][y][x] == 2) continue findColor;
        else if (image[l][y][x] == 1) row[x] = "#";
        else if (image[l][y][x] == 0) row[x] = " ";
        break findColor;
      }
    }
    console.log(row.join(""));
  }
  return undefined;
}

module.exports = {setup, part1, part2};
