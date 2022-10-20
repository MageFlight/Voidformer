let textureSlots = {};
let loadedImages = {};

const canvas = document.querySelector('canvas');
const viewport = canvas.getContext('2d');
let currentTileRNG = 0;


class Texture {
  _data;
  _type;

  constructor(type) {
    this._type = type;
  }

  set data(newData) {
    this._data = newData;
  }

  get data() {
    return this._data;
  }

  get type() {
    return this._type;
  }

  async load() {
  }
}

class MultiStateTex extends Texture {
  _textures = {};
  _currentState = "";

  constructor(states, initialState) {
    super("multi")
    this._textures = states;
    this._currentState = initialState;
  }

  changeState(newState) {
    this._currentState = newState;
  }

  get currentTex() {
    return this._textures[this._currentState];
  }

  get currentState() {
    return this._currentState;
  }

  get textures() {
    return this._textures;
  }

  get states() {
    return Object.keys(this._textures);
  }

  async load() {
    const stateKeys = Object.keys(this._textures);
    for (let i = 0; i < stateKeys.length; i++) {
      await this._textures[stateKeys[i]].load();
    }
  }
}

class ColorTexture extends Texture {
  _color;

  constructor(color, fill = true) {
    super((fill ? "f" : "s") + "Rect");
    this._color = color;
  }

  async load() {
    this.data = this._color;
  }
}

class ImgTexture extends Texture {
  _src;

  constructor(src = "") {
    super("img");
    this._src = src;
  }

  async load() {
    log("loadingStaticTex: " + this._src);
    this.data = await getImage(this._src);
  }
}

class TiledTexture extends Texture {
  _tileSize = 64; // Assume tiles are square
  _sources = [];
  _size;
  _rotation;
  _tileHor;
  _tileVer;

  constructor(size, imageSize, rotation, tileDirection, sources) {
    super("img");
    this._tileSize = imageSize;
    this._sources = sources;
    this._size = size;
    this._rotation = rotation;
    this._tileHor = tileDirection == "all" || tileDirection == "hor";
    this._tileVer = tileDirection == "all" || tileDirection == "ver";
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

    log("tileSize: " + this._tileSize)
    for (let column = 0; column < (this._tileHor ? this._size.width : this._tileSize); column += this._tileSize) {
      for (let row = 0; row < (this._tileVer ? this._size.height : this._tileSize); row += this._tileSize) {
        const img = workingTiles.shift();
        //console.log(img.complete);

        if (this._rotation != 0) {
          log("tile hor: " + this._tileHor);
          log("tile ver: " + this._tileVer);
          const width = this._tileHor ? this._tileSize : this._size.width;
          const height = this._tileVer ? this._tileSize : this._size.height;
          log("width: " + width + " height: " + height)
          const x = column + width / 2; // middle of image
          const y = row + height / 2;

          const angle = this._rotation == -1 ? Math.floor(seedRand(0, 4)) * 0.5 * Math.PI : this._rotation * Math.PI / 180;

          // Essentially rotating the image about its center
          tileRender.save();
          tileRender.translate(x, y);
          tileRender.rotate(angle);
          tileRender.drawImage(
            img,
            -width / 2,
            -height / 2,
            width,
            height
          )
          tileRender.restore();
        } else {
          tileRender.drawImage(
            img,
            column,
            row,
            this._tileHor ? this._tileSize : this._size.width,
            this._tileVer ? this._tileSize : this._size.height
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
    
    this.data = tileCanvas;
  }
}

async function parseTex(textureData, width, height) {
  let tex;

  log("rawData: " + JSON.stringify(rawData))
  switch (rawData.type) {
    case 'colorTex':
      tex = new ColorTexture(rawData.color, rawData.fill);
      await tex.load();
      break;

    case 'staticTex':
      tex = new ImgTexture(rawData.src);
      await tex.load();
      break;

    case 'tiledTex':
      tex = new TiledTexture(
        {
          width: rawWidth * scale,
          height: rawHeight * scale
        },
        rawData.tileSize * scale,
        rawData.rotation,
        rawData.tileDir,
        rawData.src
      );
      await tex.load();
      break;
    
    case 'multiStateTex':
      log("loading multi");
      tex = {};
      let states = Object.keys(rawData.states);
      for (let i = 0; i < states.length; i++) {
        const stateTex = await (parseTex(rawWidth, rawHeight, rawData.states[states[i]], scale));
        tex[states[i]] = stateTex;
      }
      break;
    
    default:
      throw new Error("Unknown texture type: " + rawData.type);
      // Don't need break because of the error thrown.
  }

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

class Renderer {
  _viewport;
  _canvas;
  static _scaleFactor = 1;

  constructor(canvas) {
    this._canvas = canvas;
    this._viewport = canvas.getContext("2d");
    addEventListener("resize", this.setCanvasSize);
    this.setCanvasSize();
  }

  clear(color) {
    this._viewport.clearRect(-this._viewport.getTransform().e, 0, this._canvas.width, this._canvas.height);
    this._viewport.fillStyle = color;
    this._viewport.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }

  drawTexture(position, size, texture) {
    switch (texture.type.toLowerCase()) {
      case "frect":
        this.fillRect(position, size, texture.data);
        break;
      case "srect":
        this.strokeRect(position, size, texture.data);
        break;
      case "img":
        this.drawImage(position, size, texture.data);
        break;
      case "multi":
        this.drawTexture(position, size, texture.currentTex);
        break;
      case "custom":
        texture.draw();
      default:
        throw new Error("Unknown texture type '" + texture.type.toLowerCase() + "'");
        break;
    }
  }

  drawImage(position, size, data) {
    viewport.drawImage(data, Math.floor(position.x * Renderer.scaleFactor), Math.floor(position.y * Renderer.scaleFactor), Math.ceil(size.width * Renderer.scaleFactor), Math.ceil(size.height * Renderer.scaleFactor));
  }

  fillRect(position, size, color) {
    log("fillRect: " + JSON.stringify(position) + " " + Renderer.scaleFactor);
    this._viewport.fillStyle = color;
    this._viewport.fillRect(Math.floor(position.x * Renderer.scaleFactor), Math.floor(position.y * Renderer.scaleFactor), Math.ceil(size.width * Renderer.scaleFactor), Math.ceil(size.height * Renderer.scaleFactor));
  }

  strokeRect(position, size, color, width = 1) {
    this._viewport.lineWidth = width;
    this._viewport.strokeStyle = color;
    this._viewport.strokeRect(Math.floor(position.x * scaleFactor), Math.floor(position.y * scaleFactor), Math.ceil(size.width * scaleFactor), Math.ceil(size.height * scaleFactor))
  }

  debugLine(startPos, endPos, color, width = 1) {
    this._viewport.strokeStyle = color;
    this._viewport.lineWidth = width;
    this._viewport.beginPath();
    this._viewport.moveTo(Math.floor(startPos.x * scaleFactor), Math.floor(startPos.y * scaleFactor));
    this._viewport.lineTo(Math.floor(endPos.x * scaleFactor), Math.floor(endPos.y * scaleFactor));
    this._viewport.stroke();
  }

  fillText(position, text, fontSize, color) {
    log("text: " + JSON.stringify(position) + ", " + text + ", " + fontSize + ", " + color);
    this._viewport.font = `${Math.ceil(fontSize * scaleFactor)}px arial`;
    this._viewport.fillStyle = color;
    this._viewport.fillText(text, Math.floor(position.x * scaleFactor), Math.floor(position.y * scaleFactor));
  }

  setCanvasSize() {
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
      this._canvas.height = proposeSizeHeightBased.height;
      this._canvas.width = proposeSizeHeightBased.width;
    } else {
      this._canvas.width = proposeSizeWidthBased.width;
      this._canvas.height = proposeSizeWidthBased.height;
    }

    log("canvasSize: " + this._canvas.clientWidth + " gameWidth: " + Utils.gameWidth);
    Renderer._scaleFactor = this._canvas.clientWidth / Utils.gameWidth;
  }

  static get scaleFactor() {
    return Renderer._scaleFactor;
  }
}