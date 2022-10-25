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
    super("multi");
    log("MultitexStates:", states);
    this._textures = states;
    this._currentState = initialState;
  }

  changeState(newState) {
    this._currentState = newState;
  }

  get currentTex() {
    log("current state:" + this._currentState);
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
    let tiles = [];
    for (let i = 0; i < this._sources.length; i++) {
      tiles.push(await getImage(this._sources[i]));
    }
    
    const tileCanvas = document.createElement('canvas');
    tileCanvas.width = this._size.width;
    tileCanvas.height = this._size.height;
    const tileRender = tileCanvas.getContext('2d');
    const rng = Utils.seedRandom(currentTileRNG);
    currentTileRNG++;

    let workingTiles = [...tiles]; // Copy the tiles
    Utils.shuffleArray(workingTiles, rng) // Initialize seed and shuffule array

    for (let column = 0; column < (this._tileHor ? this._size.width : this._tileSize); column += this._tileSize) {
      for (let row = 0; row < (this._tileVer ? this._size.height : this._tileSize); row += this._tileSize) {
        const img = workingTiles.shift();
        //console.log(img.complete);

        if (this._rotation != 0) {
          const width = this._tileHor ? this._tileSize : this._size.width;
          const height = this._tileVer ? this._tileSize : this._size.height;
          const x = column + width / 2; // middle of image
          const y = row + height / 2;

          const angle = this._rotation == -1 ? Math.floor(rng.next().value * 4) * 0.5 * Math.PI : this._rotation * Math.PI / 180;
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
          Utils.shuffleArray(workingTiles, rng);
        }
      }
    }
    
    this.data = tileCanvas;
  }
}

async function parseTex(data, size) {
  let tex;

  log("rawData: " + JSON.stringify(data))
  switch (data.type) {
    case 'colorTex':
      tex = new ColorTexture(data.color, data.fill);
      await tex.load();
      break;

    case 'staticTex':
      tex = new ImgTexture(data.src);
      await tex.load();
      break;

    case 'tiledTex':
      tex = new TiledTexture(
        size,
        data.tileSize,
        data.rotation,
        data.tileDir,
        data.src
      );
      await tex.load();
      break;
    
    case 'multiStateTex':
      log("loading multi: ", data);
      let states = {};
      let stateKeys = Object.keys(data.states);
      log("keys: " + stateKeys);
      for (let i = 0; i < stateKeys.length; i++) {
        log("loading for multi: " + data.states[stateKeys[i]])
        const stateTex = await (parseTex(data.states[stateKeys[i]], size));
        states[stateKeys[i]] = stateTex;
      }
      tex = new MultiStateTex(states, data.default);
      break;
    
    default:
      throw new Error("Unknown texture type: " + data.type);
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
    addEventListener("resize", () => this.setCanvasSize());
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
    }
  }

  drawImage(position, size, data) {
    viewport.drawImage(data, Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor), Math.ceil(size.width * Renderer._scaleFactor), Math.ceil(size.height * Renderer._scaleFactor));
  }

  fillRect(position, size, color) {
    log("fillRect: " + JSON.stringify(position) + " " + Renderer._scaleFactor);
    this._viewport.fillStyle = color;
    this._viewport.fillRect(Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor), Math.ceil(size.width * Renderer._scaleFactor), Math.ceil(size.height * Renderer._scaleFactor));
  }

  strokeRect(position, size, color, width = 1) {
    this._viewport.lineWidth = width;
    this._viewport.strokeStyle = color;
    this._viewport.strokeRect(Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor), Math.ceil(size.width * Renderer._scaleFactor), Math.ceil(size.height * Renderer._scaleFactor))
  }

  debugLine(startPos, endPos, color, width = 1) {
    this._viewport.strokeStyle = color;
    this._viewport.lineWidth = width;
    this._viewport.beginPath();
    this._viewport.moveTo(Math.floor(startPos.x * Renderer._scaleFactor), Math.floor(startPos.y * Renderer._scaleFactor));
    this._viewport.lineTo(Math.floor(endPos.x * Renderer._scaleFactor), Math.floor(endPos.y * Renderer._scaleFactor));
    this._viewport.stroke();
  }

  fillText(position, text, fontSize, color) {
    this._viewport.font = `${Math.ceil(fontSize * Renderer._scaleFactor)}px arial`;
    this._viewport.fillStyle = color;
    this._viewport.fillText(text, Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor));
  }

  translateTo(x, y) {
    this._viewport.translate(-x * Renderer.scaleFactor - this._viewport.getTransform().e, y * Renderer.scaleFactor - this._viewport.getTransform().f);
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