let textureSlots = {};
let loadedImages = {};

const canvas = document.querySelector('canvas');
const viewport = canvas.getContext('2d');
let scaleFactor = 1;
let currentTileRNG = 0;

class Texture {
  _data = null;
  _src;

  constructor(src = "") {
    this._src = src;
  }

  async load() {
    log("loadingStaticTex: " + this._src)
    this._data = await getImage(this._src);
  }

  get raw() {
    return this._data;
  }

  draw(position, size) {
    viewport.drawImage(
      this._data,
      Math.floor(position.x * scaleFactor),
      Math.floor(position.y * scaleFactor),
      Math.ceil(size.width * scaleFactor),
      Math.ceil(size.height * scaleFactor)
    );
  }
}

class TiledTexture extends Texture {
  _tileSize = 64; // Assume tiles are square
  _sources = [];
  _size;
  _rotating;

  constructor(size, imageSize, rotating, sources) {
    super();
    this._tileSize = imageSize;
    this._sources = sources;
    this._size = size;
    this._rotating = rotating;
  }

  async load() {
    log("rawSources: " + JSON.stringify(this._sources))
    let tiles = [];
    for (let i = 0; i < this._sources.length; i++) {
      tiles.push(await getImage(this._sources[i]));
    }
    
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = this._size.width;
    tileCanvas.height = this._size.height;
    const tileRender = tileCanvas.getContext('2d');
    rngSeed = currentTileRNG;
    currentTileRNG++;

    let workingTiles = [...tiles]; // Copy the tiles
    seedShuffleArray(workingTiles) // Initialize seed and shuffule array

    for (let column = 0; column < this._size.width; column += this._tileSize) {
      for (let row = 0; row < this._size.height; row += this._tileSize) {
        const img = workingTiles.shift();
        //console.log(img.complete);

        if (this._rotating) {
          const x = column + this._tileSize / 2; // middle of image
          const y = row + this._tileSize / 2;

          const angle = Math.floor(seedRand(0, 4)) * 0.5 * Math.PI;

          // Essentially rotating the image about its center
          tileRender.save();
          tileRender.translate(x, y);
          tileRender.rotate(angle);
          tileRender.drawImage(
            img,
            -this._tileSize / 2,
            -this._tileSize / 2,
            this._tileSize,
            this._tileSize
          )
          tileRender.restore();
        } else {
          tileRender.drawImage(
            img,
            column,
            row,
            this._tileSize,
            this._tileSize
          );
        }

        tileRender.setTransform(1, 0, 0, 1, 0, 0); // Identity matrix to reset

        //console.log(column, row, imageSize)

        if (workingTiles.length == 0) {
          workingTiles = [...tiles];
          seedShuffleArray(workingTiles);
        }
      }
    }
    
    this._data = tileCanvas;
  }
}

async function parseTex(rawWidth, rawHeight, rawData, scale) {
  let tex;

  log("rawData: " + JSON.stringify(rawData))
  switch (rawData.type) {
    case 'staticTex':
      tex = new Texture(rawData.src);
      break;

    case 'tiledTex':
      tex = new TiledTexture({
        width: rawWidth * scale,
        height: rawHeight * scale
      }, rawData.tileSize * scale, rawData.rotating, rawData.src)
      break;
  }
  await tex.load();

  return tex;
}

async function getImage(src) {
  log("fetching image " + src)
  if (!Object.hasOwn(loadedImages, src)) { // Check if the image is already loaded
    log("loading img " + src)
    loadedImages[src] = await loadImg(src);
  }

  return loadedImages[src];
}

function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      console.log("loaded image " + src);
      resolve(img);
    };
  });
};

function fillRect(position, size, color) {
  viewport.fillStyle = color;
  viewport.fillRect(Math.floor(position.x * scaleFactor), Math.floor(position.y * scaleFactor), Math.ceil(size.width * scaleFactor), Math.ceil(size.height * scaleFactor));
}

function strokeRect(position, size, color, width = 1) {
  viewport.lineWidth = width;
  viewport.strokeStyle = color;
  viewport.strokeRect(Math.floor(position.x * scaleFactor), Math.floor(position.y * scaleFactor), Math.ceil(size.width * scaleFactor), Math.ceil(size.height * scaleFactor))
}

function debugLine(startPos, endPos, color, width = 1) {
  viewport.strokeStyle = color;
  viewport.lineWidth = width;
  viewport.beginPath();
  viewport.moveTo(Math.floor(startPos.x * scaleFactor), Math.floor(startPos.y * scaleFactor));
  viewport.lineTo(Math.floor(endPos.x * scaleFactor), Math.floor(endPos.y * scaleFactor));
  viewport.stroke();
}

function fillText(position, text, fontSize, color) {
  log("text: " + JSON.stringify(position) + ", " + text + ", " + fontSize + ", " + color);
  viewport.font = `${Math.ceil(fontSize * scaleFactor)}px arial`;
  viewport.fillStyle = color;
  viewport.fillText(text, Math.floor(position.x * scaleFactor), Math.floor(position.y * scaleFactor));
}

function setCanvasSize() {
  // Link to a desmos possibly explaining this: https://www.desmos.com/calculator/lndgojuiit

  const roundedHeight = window.innerHeight - (window.innerHeight % 17);
  const roundedWidth = window.innerWidth - (window.innerWidth % 30);
  const proposeSizeHeightBased = {
    height: roundedHeight,
    width: 30 * roundedHeight / 17
  };
  const proposeSizeWidthBased = {
    width: roundedWidth,
    height: 17 * roundedWidth / 30
  };

  if (proposeSizeHeightBased.height <= window.innerHeight && proposeSizeHeightBased.width <= window.innerWidth) {
    canvas.height = proposeSizeHeightBased.height;
    canvas.width = proposeSizeHeightBased.width;
  } else {
    canvas.width = proposeSizeWidthBased.width;
    canvas.height = proposeSizeWidthBased.height;
  }
  scaleFactor = canvas.clientWidth / gameWidth;
}