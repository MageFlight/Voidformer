const gameWidth = 1920;
const gameHeight = 1088;

setCanvasSize();

let prevBeginTime = Date.now();
let dt = 0;

let debugWindow = window.open("", "DEUBUG", `width=500,height=500,top=${(screen.height - 500) / 2},left=${screen.width - 500}`);
debugWindow.document.write('<title>DEBUG</title><body><p id="log" style="white-space: pre-wrap;"></p></body>');
debugWindow.blur();
window.focus();
let debugLines = [];
//console.log = message => alert(message);
//console.error = message => alert('Error: ' + message);
function log(message) {
  console.log(message);
  //return;
  if (logging) {
    if (!debugWindow.closed) {
      /*debugLines.push(message);
      if (debugLines.length > 10) debugLines.shift(); // If more than 200 lines, remove the first one.
      debugWindow.document.querySelector('#log').textContent = debugLines.join("\n");*/
      const messageElement = debugWindow.document.createElement('p');
      messageElement.textContent = message;
      debugWindow.document.querySelector('body').appendChild(messageElement);
      debugWindow.scrollTo(0, debugWindow.document.body.scrollHeight);
      let debugLines = debugWindow.document.querySelector('body').children;
      if (debugLines.length > 40) {
        debugLines[0].remove();
      }
    } else {
      alert(message);
    }
  }
}

class Sprite {
    _showing = true;
    _pinned = false;
    _position = {x: 0, y: 0};
    
    constructor(position, size) {
      this._position = position;
      this.size = size;
    }
  
    update() {
    }
  
    physicsUpdate() {
    }
  
    draw() {
    }
  
    set position(newPos) {
      if (!this._pinned) {
        this._position = newPos;
      }
    }
  
    get position() {
      return this._position;
    }
  
    set showing(newValue) {
      this._showing = newValue;
    }
  
    get showing() {
      return this._showing;
    }
  
    get pinned() {
      return this._pinned;
    }
  
    set pinned(pinned) {
      this._pinned = pinned;
    }
  }

class StaticBox extends Sprite {
    constructor(position = {x: 0, y: 0}, size = {x: 64, y: 64}, collider, frictionCoef = 0.9) {
      super(position, size);
      this.collider = collider;
      this.collider.position = {
        x: this.position.x + this.collider.offset.x,
        y: this.position.y + this.collider.offset.y
      };
      this.frictionCoef = frictionCoef;
      log("friction " + this.frictionCoef);
    }
    
    syncColliderPos() {
      this.collider.position = {
        x: this.position.x + this.collider.offset.x,
        y: this.position.y + this.collider.offset.y
      };
    }
  }
  
  class DynamicBox extends Sprite {
    constructor(position = {x: 0, y: 0}, size = {x: 10, y: 10}, collider, mass=10) {
      super(position, size);
      this.collider = collider;
      this.collider.position = {
        x: this.position.x + this.collider.offset.x,
        y: this.position.y + this.collider.offset.y
      };
      this.gravityMultiplier = 1;
      this.mass = mass;
      this.groundPlatform = null;
    }
  
    customCollisionResponse(collision) {}
    
    syncColliderPos() {
      this.collider.position = {
        x: this.position.x + this.collider.offset.x,
        y: this.position.y + this.collider.offset.y
      };
    }
    
    physicsUpdate() {
    }
  }

class Level {
  _gui;

  constructor(initData) {
    this.data = initData;
    
    this.staticSprites = [];
    this.dynamicSprites = []; // Dynamic Sprites[0] is always player.
    this.backgroundColor = '#ffffff';
    this.physicsEngine = new PhysicsEngine();
    this.scrollPos = 0;
    this.maxScroll = 0;
    this.background = null;
    this._gui = new Imgui();
    this._pauseBtn;
  }
  
  async load() {
    const lvlScale = 64;
    if (this.data === null) { return; }

    this.staticSprites = [];
    this.dynamicSprites = [];

    this._pauseBtn = await parseTex(1, 1, {
      type: "multiStateTex",
      states: {
        pause: {
          type: "multiStateTex",
          states: {
            normal: {
              type: "staticTex",
              src: "assets/gui/pauseNormal.svg"
            },
            hot: {
              type: "staticTex",
              src: "assets/gui/pauseHot.svg"
            },
            active: {
              type: "staticTex",
              src: "assets/gui/pauseActive.svg"
            }
          }
        },
        start: {
          type: "multiStateTex",
          states: {
            normal: {
              type: "staticTex",
              src: "assets/gui/startNormal.svg"
            },
            hot: {
              type: "staticTex",
              src: "assets/gui/startHot.svg"
            },
            active: {
              type: "staticTex",
              src: "assets/gui/startActive.svg"
            }
          }
        }
      }
    }, lvlScale);

    // Load Background
    this.background = await parseTex(gameHeight / lvlScale, gameWidth / lvlScale, this.data.textures.background[this.data.background], lvlScale);

    // Load maxScroll
    this.maxScroll = (this.data.maxScroll * lvlScale) - gameWidth;

    // Load Platfofrms
    for (let i = 0; i < this.data.platforms.length; i++) {
      const rawPlatform = this.data.platforms[i];
      const position = {
        x: rawPlatform.x * lvlScale,
        y: gameHeight - rawPlatform.y * lvlScale
      }
      const size = {
        width: rawPlatform.width * lvlScale,
        height: rawPlatform.height * lvlScale
      }
      const tex = await parseTex(rawPlatform.width, rawPlatform.height, this.data.textures.platform[rawPlatform.texture], lvlScale);

      const initPlatform = new Platform(position, size, tex, rawPlatform.color);

      this.staticSprites.push(initPlatform);
      this.physicsEngine.addStaticSprite(initPlatform);
    }

    // Load Spikes
    for (let i = 0; i < this.data.spikes.length; i++) {
      const rawSpike = this.data.spikes[i];
      const initSpike = new Spike({
        x: rawSpike.x * lvlScale,
        y: gameHeight - rawSpike.y * lvlScale
      }, {
        width: rawSpike.width * lvlScale,
        height: rawSpike.height * lvlScale
      },
      await parseTex(rawSpike.width, rawSpike.height, this.data.textures.spike[rawSpike.texture], lvlScale));

      this.staticSprites.push(initSpike);
      this.physicsEngine.addStaticSprite(initSpike);
    }

    // Load Holograms
    for (let i = 0; i < this.data.holograms.length; i++) {
      const rawHolo = this.data.holograms[i];
      const initHolo = new Hologram({x: rawHolo.x * lvlScale, y: gameHeight - rawHolo.y * lvlScale}, rawHolo.text, rawHolo.fontSize);

      this.staticSprites.push(initHolo);
    }

    // Load Checkpoints
    for (let i = 0; i < this.data.checkpoints.length; i++) {
      const rawCheck = this.data.checkpoints[i];
      const initCheck = new Checkpoint({
        x: rawCheck.x * lvlScale,
        y: gameHeight - (rawCheck.y * lvlScale)
      },
      await parseTex(Checkpoint.SIZE.width / lvlScale, Checkpoint.SIZE.height / lvlScale, this.data.textures.checkpoint[rawCheck.texture], lvlScale));

      this.staticSprites.push(initCheck);
    }

    // Load Goal
    // TODO: Make size determined in lvl
    const goal = new Goal(
      {
        x: this.data.goal.x * lvlScale,
        y: gameHeight - (this.data.goal.y * lvlScale)
      },
      await parseTex(Goal.SIZE.width / lvlScale, Goal.SIZE.height / lvlScale, this.data.textures.goal[this.data.goal.texture], lvlScale)
    );

    this.dynamicSprites.push(goal);
    this.physicsEngine.addDynamicSprite(goal);

    // Load Player
    const player = new Player(
      {x: this.data.spawn.x * lvlScale, y: gameHeight - (this.data.spawn.y * lvlScale)},
      await parseTex(Player.SIZE.width / lvlScale, Player.SIZE.height / lvlScale, this.data.textures.player.normal, lvlScale)
    );

    this.dynamicSprites.push(player);
    this.physicsEngine.addDynamicSprite(player);
  }
  
  update() {
    for (let i = 0; i < this.staticSprites.length; i++) {
      this.staticSprites[i].update();
    }

    for (let i = 0; i < this.dynamicSprites.length; i++) {
      this.dynamicSprites[i].update();
      this.dynamicSprites[i].physicsUpdate();
    }
    
    this.physicsEngine.updateSprites();

    // Update scroll position
    const rightBound = 750;
    const leftBound = 625;
    const playerScreenX = this.getSprites(Player)[0].position.x - this.scrollPos;
    if (playerScreenX > rightBound) {
      this.scrollPos += playerScreenX - rightBound;
    } else if (playerScreenX < leftBound) {
      this.scrollPos = this.scrollPos + playerScreenX - leftBound;
    }
    this.scrollPos = Math.min(Math.max(this.scrollPos, 0), this.maxScroll);
  }
  
  draw() {
    log("scroll: " + this.scrollPos);
    viewport.translate(-this.scrollPos * (canvas.clientWidth / gameWidth) - viewport.getTransform().e,0);
    this.background.draw({x: this.scrollPos, y: 0}, {width: gameWidth + 1, height: gameHeight});

    //alert("drawing: " + JSON.stringify(this.staticSprites));
    for (let i = 0; i < this.staticSprites.length; i++) {
      if (this.staticSprites[i].showing) this.staticSprites[i].draw();
    }
    
    for (let i = 0; i < this.dynamicSprites.length; i++) {
      if (this.dynamicSprites[i].showing) this.dynamicSprites[i].draw();
    }

    this._gui.start();

    if (this._gui.button(this._gui.getID(), {x: 25, y: 25}, {width: 64, height: 64}, this._pauseBtn[running ? 'pause' : 'start'])) {
      running = !running;
    }

    this._gui.finish();
  }
  
  changeData(newData) {
    this.data = newData;
    this.load();
  }

  win() {
    const player = this.getSprites(Player)[0];
    player.showing = false;
    player.pinned = true;
    this.getSprites(Goal)[0].startTakeoff();
  }

  getSprites(type) {
    let sprites = [];
    for (let i = 0; i < this.staticSprites.length; i++) {
      if (this.staticSprites[i] instanceof type) {
        sprites.push(this.staticSprites[i]);
      }
    }

    for (let i = 0; i < this.dynamicSprites.length; i++) {
      if (this.dynamicSprites[i] instanceof type) {
        sprites.push(this.dynamicSprites[i]);
      }
    }

    if (sprites.length === 0) {
      log("couldn't find sprite of type " + type);
      return null;
    } else {
      return sprites;
    }
  }
}

addEventListener('keydown', ({code}) => {
  // Loop through all the actions and activate it if the corrosponding key is pressed.
  Object.keys(actions).forEach(actionKey => {
    const action = actions[actionKey];
    if (action.keys.includes(code)) {
      action.active = true;
      action.stale = false;
    }
  });
});

addEventListener('keyup', ({code}) => {
  // Loop through all the actions and deactivate it if the corrosponding key is pressed.
  Object.keys(actions).forEach(actionKey => {
    const action = actions[actionKey];
    if (action.keys.includes(code)) {
      action.active = false;
      action.stale = false;
    }
  });
});

addEventListener('resize', setCanvasSize);

//// Utilities ////

let rngSeed = 12;
// RNG w/ seed
function seedRand(min = 0, max = 1,startSeed=-1) {
  rngSeed = startSeed > 0 ? startSeed : (rngSeed * 9301 + 49297) % 233280;
  return min + (rngSeed / 233280) * (max - min);
}

function seedShuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(seedRand(0, i + 1));
    
    // Same thing as this:
    // let t = array[i]; array[i] = array[j]; array[j] = t
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}