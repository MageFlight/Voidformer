class Utils {
  static _gameWidth = 1920;
  static _gameHeight = 1088;

  static _levelScale = 64;
  static _levelWidth = Utils._gameWidth / Utils._levelScale;
  static _levelHeight = Utils._gameHeight / Utils._levelScale;

  static _signals = {};

  static _timers = [];

  static get gameWidth() {
    return Utils._gameWidth;
  }

  static get gameHeight() {
    return Utils._gameHeight;
  }

  static get levelWidth() {
    return Utils._levelWidth;
  }

  static get levelHeight() {
    return Utils._levelHeight;
  }

  static get levelScale() {
    return Utils._levelScale;
  }

  /**
   * Rounds a number to a specified number of decimal places.
   * @param {Number} n The number to round
   * @param {Number} places The number of places to round the decmal to.
   */
  static roundToDecimal(n, places) {
    const zeroes = Math.pow(10, places);
    return Math.round(n * zeroes) / zeroes;
  }

  /**
   * Moves a value 'current' towards 'target'
   * @param {Number} current The current value
   * @param {Number} target The value to move towards
   * @param {Number} maxDelta The maximum change that should be applied to the value
   * @returns A linear interpolation that moves from current to target as far as possible without the speed exceeding maxDelta, and the result value not exceeding target.
   */
  static moveTowards (current, target, maxDelta) {
    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }

    return current + Math.sign(target - current) * maxDelta;
  }

  static broadcast(signal, data = null) {
    if (!Utils._signals[signal]) return;

    Utils._signals[signal].forEach(action => {
      action.call(action, data);
    });
  }

  static listen(signal, action) {
    console.log("Add action", action);

    if (!Utils._signals[signal]) {
      Utils._signals[signal] = [];
    }
    Utils._signals[signal].push(action);
  }

  static timer(action, timeout, recurring) {
    Utils._timers.push({
      action: action,
      length: timeout,
      timeRemaining: 0,
      recurring: recurring
    }); 
  }

  static timerUpdate(dt) {
    for (let i = 0; i < Utils._timers.length; i++) {
      const timer = Utils._timers[i];
      timer.timeRemaining += dt;
      log("dt: " + dt);
      log("timeRemaining: " + timer.timeRemaining);
      log("Length: " + timer.length); 

      if (timer.timeRemaining >= timer.length) {
        timer.action.call(timer.action);

        if (timer.recurring) {
          log("rercurring.");
          timer.timeRemaining = 0;
          log("final time left: " + timer.timeRemaining);
        } else {
          log("removing")
          Utils._timers.splice(i, 1);
        }
      }
    }
  }

  static parseObjectPath(path, object) {
    const keys = path.split("/");

    let runningObj = object;
    let finalObj;
    for (let i = 0; i < keys.length; i++) {
      if (i == keys.length - 1) {
        finalObj = runningObj[keys[i]];
      } else {
        runningObj = runningObj[keys[i]];
      }
    }

    return finalObj;
  }

  static* seedRandom(startSeed) {
    let seed = startSeed;
    while (true) {
      seed = (seed * 9301 + 49297) % 233280;
      yield seed / 233280;
    }
  }

  static shuffleArray(arr, randGen) {
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(randGen.next().value * i);
      
      // Same thing as this:
      // let t = arr[i]; arr[i] = arr[j]; arr[j] = t
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  static* counter(startNumber = 0) {
    let i = startNumber;
    yield i;
    while (true) {
      yield i++;
    }
  }

  static clone(object) {
    let newObject = {};

    for (let key in object) {
      newObject[key] = object[key];
    }

    return newObject;
  }
}

class Vector2 {
  _x;
  _y;

  /**
   * Creates a new Vector2 from two numbers
   * @param {Number} x Initial x-value of the vector
   * @param {Number} y Initial y-value of the vector
   */
  constructor(x, y) {
    this._x = x;
    this._y = y;
  }

  /**
   * Creates a new Vector2 by multiplying two numbers by 64. The y-value is flipped such that the bottom left corner of the screen is (0, 0).
   * @param {Number} x The initial x-value of the vector
   * @param {Number} y the initial y-value of the vector
   * @returns A new Vector2, appropriately scaled
   */
  static levelPositionVector2(x, y) {
    log("LevelVec x: " + (x * Utils.levelScale) + " y: " + (Utils.gameHeight - (y * Utils.levelScale)));
    return new Vector2(x * Utils.levelScale, Utils.gameHeight - (y * Utils.levelScale));
  }

  static levelVector2(x, y) {
    return new Vector2(x * Utils.levelScale, y * Utils.levelScale);
  }

  /**
   * Returns a zero vector: a vector with all components set to 0
   * @returns A new Zero vector2
   */
  static zero() {
    return new Vector2(0, 0);
  }

  /**
   * Creates a new one vector: a vector with all components set to 1
   * @returns A new one vector2
   */
  static one() {
    return new Vector2(1, 1);
  }

  get x() {
    return this._x;
  }

  set x(newX) {
    this._x = newX;
  }

  get y() {
    return this._y;
  }

  set y(newY) {
    this._y = newY;
  }

  static up() {
    return new Vector2(0, -1);
  }

  static down() {
    return new Vector2(0, 1);
  }

  static left() {
    return new Vector2(-1, 0);
  }

  static right() {
    return new Vector2(1, 0);
  }

  /**
   * Adds this vector to another vector.
   * @param {Vector2} vector Vector to add
   * @returns The resulting vector
   */
  addVec(vector) {
    return new Vector2(this._x + vector.x, this._y + vector.y);
  }

  /**
   * Adds the resulting vector of the parameters to this vector
   * @param {Number} x The value to add to this vector's X value
   * @param {Number} y The value to add to this vector's Y value
   * @returns The resulting vector
   */
  add(x, y) {
    return new Vector2(this._x + x, this._y + y);
  }

  /**
   * Increases the x and y-values of this vector by n
   * @param {Number} n Adds this value to both the x and y-values of this vector
   * @returns The resulting vector
   */
  add(n) {
    return new Vector2(this._x + n, this._y + n);
  }

  /**
   * Subtracts another vector from this vector (this - another)
   * @param {Vector2} vector The vector subtracting with
   * @returns The resulting vector
   */
  subtract(vector) {
    return new Vector2(this._x - vector.x, this._y - vector.y);
  }

  /**
   * Multiplies the x-component and the y-component by a scalar.
   * @param {Nuber} n The scalar value to multiply both components by
   * @returns The resulting vector
   */
  multiply(n) {
    return new Vector2(Utils.roundToDecimal(this._x * n, 5), Utils.roundToDecimal(this._y * n, 5));
  }


  /**
   * Creates a clone of this vector
   * @returns The clone of this vector
   */
  clone() {
    return new Vector2(this._x, this._y);
  }

  equals(vector2) {
    return this._x == vector2.x && this._y == vector2.y;
  }
}

// Refrence https://docs.godotengine.org/en/stable/tutorials/math/matrices_and_transforms.html
class Transform {
  _x = Vector2.right();
  _y = Vector2.down();
  _origin = Vector2.zero();

  constructor(x = Vector2.right(), y = Vector2.down(), origin = Vector2.zero()) {
    this._x = x;
    this._y = y;
    this._origin = origin;
  }

  get x() {
    return this._x;
  }

  set x(newX) {
    this._x = newX;
  }

  get y() {
    return this._y;
  }

  set y(newY) {
    this._y = newY;
  }

  get origin() {
    return this._origin;
  }

  set origin(newOrigin) {
    this._origin = newOrigin;
  }

  asRaw() {
    return [this._x.x, this._x.y, this._y.x, this._y.y, this._origin.x, this._origin.y];
  }
}

let debugWindow = null;
let logBuffer = [];
let logScroll = 1;

function log(...messages) {
  const formattedMessages = [];
  messages.forEach(message => {
    if (message === undefined) {
      formattedMessages.push("undefined");
      return;
    }

    formattedMessages.push(JSON.stringify(message).replace(/\\?\"/g, ''))
  });
  
  formattedMessages.unshift(`[${(new Error().stack.toString().split(/\r\n|\n/))[2].replace(/([\S\s]*\/Voidformer\/)|(\)$)/g, '')}] `);
  logBuffer.push(formattedMessages.join(''));
}

function clearLogBuffer() {
  logBuffer = [];
}

function logUpdate() {
  if (debugWindow == null || debugWindow.closed) {
    debugWindow = window.open("", "DEBUG", `width=${screen.width / 2},height=${screen.height},top=${(screen.height - 500) / 2},left=${screen.width - 500}`);
    debugWindow.document.body.appendChild(debugWindow.document.createElement("pre"));
  }

  const text = debugWindow.document.querySelector('pre');
  text.textContent = logBuffer.join("\n");
  logScroll = debugWindow.document.body.scrollTop / debugWindow.document.body.scrollHeight;
  debugWindow.scrollTo(debugWindow.document.body.scrollLeft, logScroll * debugWindow.document.body.scrollHeight);
}