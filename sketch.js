const canvasSketch = require("canvas-sketch");
const { lerp } = require("canvas-sketch-util/math");
const random = require("canvas-sketch-util/random");
const palettes = require("nice-color-palettes");

// Set an initial random seed
random.setSeed(random.getRandomSeed());

// Log it for later reproducibility
console.log("Random seed: %s", random.getSeed());

const settings = {
  suffix: random.getSeed(),
  dimensions: [2048, 2048],
  // orientation: 'landscape',
  // units: 'cm',
  // pixelsPerInch: 300
};

const sketch = () => {
  const colorCount = random.rangeFloor(3, 6);
  const palette = random.shuffle(random.pick(palettes)).slice(0, colorCount);

  const createGrid = (count) => {
    const points = [];

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 1 ? 0.5 : x / (count - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        const radius = random.noise2D(u, v) * 0.5 + 0.5;

        points.push({
          color: random.pick(palette),
          radius,
          rotation: random.noise2D(u, v),
          position: { u, v },
        });
      }
    }

    return points;
  };

  const points = createGrid(40).filter(() => random.value() > 0.5);
  const margin = 400;

  return ({ context, width, height }) => {
    // create a white background
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    points.forEach(({ color, position, radius, rotation }) => {
      const x = lerp(margin, width - margin, position.u);
      const y = lerp(margin, height - margin, position.v);
      const r = lerp(width * 0.005, width * 0.07, radius);

      // context.beginPath();
      // context.arc(x, y, r, 0, Math.PI * 2, false);
      // context.fillStyle = color;
      // context.fill();

      context.save();

      context.fillStyle = color;
      context.font = `${r * 2}px "Helvetica"`;
      context.translate(x, y);
      context.rotate(rotation);
      context.fillText("=", 0, 0);

      context.restore();
    });
  };
};

canvasSketch(sketch, settings);
