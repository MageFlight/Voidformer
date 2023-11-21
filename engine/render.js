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
    this._viewport.translate(-position.x * Renderer.scaleFactor - this._viewport.getTransform().e, -position.y * Renderer.scaleFactor - this._viewport.getTransform().f);
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