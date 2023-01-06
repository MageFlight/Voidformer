let textureSlots = {};

const canvas = document.querySelector('canvas');
const viewport = canvas.getContext('2d');
let currentTileRNG = 0;


class TextureRect extends Sprite {
  _texture;

  constructor(position, size, texture, name) {
    super(position, size, name);
    log("tex: " + JSON.stringify(texture));
    this._texture = texture;
  }

  set texture(newTex) {
    this._texture = newTex;
  }

  get texture() {
    return this._texture;
  }

  draw(renderer) {
    this._texture.draw(this.globalPos, renderer);
  }
}
/*
class MultiStateTex extends TextureRect {
  static genID = 0;

  _textures = {};
  _currentState = "";

  constructor(position, size, states, initialState, name="multiStateTex") {
    super(position, size, name == "multiStateTex" ? name + (MultiStateTex.genID++) : name);
    log("MultitexStates:", states);
    this._textures = states;
    this._currentState = initialState;
  }

  static async loadFromRaw(data, scale) {
    const pos = data.pos.multiply(scale);
    pos.y = Utils.gameHeight - pos.y;
    const size = data.size.multiply(scale);

    const states = {};
    const stateKeys = Object.keys(data.states);
    for (let i = 0; i < stateKeys.length; i++) {
      const stateKey = stateKeys[i];
      states[stateKey] = await data.states[stateKey].type.loadFromRaw(data.states[stateKey], scale);
    }

    const tex = new MultiStateTex(pos, size, states, data.initialState, data.name);
    await tex.load();
    return tex;
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

  draw(renderer) {
    this._textures[this._currentState].draw(renderer);
  }
}

class ColorTextureRect extends TextureRect {
  static genID = 0;

  _color;
  _fill;


  constructor(position, size, color, fill = true, name="colorTexture") {
    super(position, size, name == "colorTexture" ? name + (ColorTexture.genID++) : name);
    this._color = color;
    this._fill = fill;
  }

  static async loadFromRaw(data, scale) {
    const pos = data.pos.multiply(scale);
    pos.y = Utils.gameHeight - pos.y;
    const size = data.size.multiply(scale);

    if (!data.color.match(/^#(([\da-fA-F]){6}|([0-9a-f])(\3{2}))$/)) {
      throw new Error("Invalid Color: " + data.color);
    }
    const colorTex = new ColorTexture(pos, size, data.color, data.fill, data.name);
    await colorTex.load();
    return colorTex;
  }

  async load() {
    this.data = this._color;
  }

  draw(renderer) {
    if (this._fill) {
      renderer.fillRect(this._position, this._size, this._data);
    } else {
      renderer.strokeRect(this._position, this._size, this._data);
    }
  }
}

class ImgTextureRect extends TextureRect {
  static genID = 0;

  _src;

  constructor(position, size, src = "", name="imgTexture") {
    super(position, size, "img", name == "imgTexture" ? name + (ImgTexture.genID++) : name);
    this._src = src;
  }

  static async loadFromRaw(data, scale) {
    const pos = data.pos.multiply(scale);
    pos.y = Utils.gameHeight - pos.y;
    const size = data.size.multiply(scale);

    console.log(pos);
    const imgTex = new ImgTexture(pos, size, data.src, data.name);
    await imgTex.load();
    return imgTex;
  }

  async load() {
    log("loadingStaticTex: " + this._src);
    this._data = await getImage(this._src);
  }

  draw(renderer) {
    log("drawing")
    renderer.drawImage(this._position, this._size, this._data);
  }
}

class TiledTextureRect extends TextureRect {
  static genID = 0;

  _tileSize = 64; // Assume tiles are square
  _sources = [];
  _rotation;
  _tileHor;
  _tileVer;

  constructor(position, size, sources, tileSize, rotation = 0, tileDirection = "all", name="tiledTexture") {
    super(position, size, "img", name == "tiledTexture" ? name + (TiledTexture.genID++) : name);
    this._tileSize = tileSize;
    this._sources = sources;
    this._rotation = rotation;
    this._tileHor = tileDirection == "all" || tileDirection == "hor";
    this._tileVer = tileDirection == "all" || tileDirection == "ver";
  }

  static async loadFromRaw(data, scale) {
    const pos = data.pos.multiply(scale);
    pos.y = Utils.gameHeight - pos.y;
    const size = data.size.multiply(scale);

    
    const tiledTex = new TiledTexture(pos, size, data.sources, data.tileSize.multiply(scale), data.rotation, data.tileDirection, data.name);
    await tiledTex.load();
    return tiledTex;
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

  draw(renderer) {
    renderer.drawImage(this._position, this._size, this._data);
  }
}*/

/*async function parseTex(data, size) {
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
}*/

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
    this._viewport.drawImage(data, Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor), Math.ceil(size.x * Renderer._scaleFactor), Math.ceil(size.y * Renderer._scaleFactor));
  }

  fillRect(position, size, color) {
    log("fillRect: " + JSON.stringify(position) + " " + Renderer._scaleFactor);
    this._viewport.fillStyle = color;
    this._viewport.fillRect(Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor), Math.ceil(size.x * Renderer._scaleFactor), Math.ceil(size.y * Renderer._scaleFactor));
  }

  strokeRect(position, size, color, width = 1) {
    this._viewport.lineWidth = width;
    this._viewport.strokeStyle = color;
    this._viewport.strokeRect(Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor), Math.ceil(size.x * Renderer._scaleFactor), Math.ceil(size.y * Renderer._scaleFactor))
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
    this._viewport.font = `${Math.ceil(fontSize * Renderer._scaleFactor)}px exo2  `;
    this._viewport.fillStyle = color;
    this._viewport.fillText(text, Math.floor(position.x * Renderer._scaleFactor), Math.floor(position.y * Renderer._scaleFactor));
  }

  translateTo(position) {
    this._viewport.translate(-position.x * Renderer.scaleFactor - this._viewport.getTransform().e, position.y * Renderer.scaleFactor - this._viewport.getTransform().f);
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

  get viewport() {
    return this._viewport;
  }

  set viewport(newViewport) {
    this._viewport = newViewport;
  }

  get canvas() {
    return this._canvas;
  }
  
  set canvas(newCanvas) {
    this._canvas = newCanvas;
  }
}