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
  dimensions: [2048, 1024],
  // orientation: 'landscape',
  // units: 'cm',
  // pixelsPerInch: 300
};

const sketch = () => {
  const colorCount = random.rangeFloor(3, 6);
  const palette = random.shuffle(random.pick(palettes)).slice(0, colorCount);

  const createGrid = (count) => {
    const points = [];

    for (let x = 0; x < count * 2; x++) {
      for (let y = 0; y < count; y++) {
        const u = count <= 2 ? 0.5 : x / (count * 2 - 1);
        const v = count <= 1 ? 0.5 : y / (count - 1);
        // const radius = random.noise2D(u, v) * 0.5 + 0.5;

        points.push({
          // color: random.pick(palette),
          // radius,
          order: random.noise2D(u, v), // + u + v * 100,
          position: { u, v },
        });
      }
    }

    return points;
  };

  const points = createGrid(5);
  const margin = 200;

  return ({ context, width, height }) => {
    const getXY = ({ u, v }) => [
      lerp(margin, width - margin, u),
      lerp(margin, height - margin, v),
    ];

    const createTrapezoid = (point1, point2) => {
      context.beginPath();
      context.moveTo(...getXY(point1.position));
      context.lineTo(...getXY(point2.position));
      context.lineTo(getXY(point2.position)[0], height - margin);
      context.lineTo(getXY(point1.position)[0], height - margin);
      context.closePath();
      context.fillStyle = random.pick(palette);
      context.fill();
      context.strokeStyle = "white";
      context.lineWidth = 4;
      context.stroke();
    };

    // create a background
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    // draw the grid
    // points.forEach(({ color, position, radius, rotation }) => {
    //   context.beginPath();
    //   context.arc(...getXY(position), 10, 0, Math.PI * 2, false);
    //   context.fillStyle = "black";
    //   context.fill();
    // });

    const pointPairs = points
      .sort((point1, point2) => point1.order - point2.order)
      .reduce((acc, point, index) => {
        if (index % 2 === 0) return [...acc, [point]];
        return [
          ...acc.slice(0, acc.length - 1),
          [...acc[acc.length - 1], point],
        ];
      }, []);

    pointPairs
      .sort((pointPair1, pointPair2) => {
        const avgY1 = (pointPair1[0].position.v + pointPair1[1].position.v) / 2;
        const avgY2 = (pointPair2[0].position.v + pointPair2[1].position.v) / 2;

        return avgY1 - avgY2;
      })
      .forEach((pointPair) => createTrapezoid(...pointPair));
  };
};

canvasSketch(sketch, settings);
