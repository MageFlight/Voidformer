// "Cutting Grass is my passion" - Link 2022

// const gameWidth = 1920;
// const gameHeight = 1088;

// setCanvasSize();

// let prevBeginTime = Date.now();

// let debugWindow = window.open("", "DEUBUG", `width=500,height=500,top=${(screen.height - 500) / 2},left=${screen.width - 500}`);
// debugWindow.document.write('<title>DEBUG</title><body><p id="log" style="white-space: pre-wrap;"></p></body>');
// debugWindow.blur();
// window.focus();
// let debugLines = [];
// //console.log = message => alert(message);
// //console.error = message => alert('Error: ' + message);
// function log(message) {
//   console.log(message);
//   //return;
//   if (logging) {
//     if (!debugWindow.closed) {
//       /*debugLines.push(message);
//       if (debugLines.length > 10) debugLines.shift(); // If more than 200 lines, remove the first one.
//       debugWindow.document.querySelector('#log').textContent = debugLines.join("\n");*/
//       const messageElement = debugWindow.document.createElement('p');
//       messageElement.textContent = message;
//       debugWindow.document.querySelector('body').appendChild(messageElement);
//       debugWindow.scrollTo(0, debugWindow.document.body.scrollHeight);
//       let debugLines = debugWindow.document.querySelector('body').children;
//       if (debugLines.length > 40) {
//         debugLines[0].remove();
//       }
//     } else {
//       alert(message);
//     }
//   }
// }

// class Scene {
//   _name = "";
//   _loader;

//   constructor(name, loader) {
//     this._name = name;
//     this._loader = loader;
//   }

//   async load(...data) {
//     return this._loader.call(this, ...data);
//   }

//   get name() {
//     return this._name;
//   }

//   get loader() {
//     return this._loader;
//   }
// }

class GameObject {
  static genID = 0;

  _name = "";

  _children = [];
  _parent = null;

  _uid = GameObject.genID++;

  constructor(name) {
    this._name = name;
  }

  start() {
  }

  update(dt) {
  }

  physicsUpdate(physics, dt) {
  }

  addChild(child) {
    log("parent init: " + this._parent);
    child.parent = this;
    this._children.push(child);
    return this;
  }

  removeChild(child) {
    child.parent = null;
    this._children.splice(this._children.indexOf(child), 1);
  }

  getChildType(type) {
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] instanceof type) {
        return this._children[i];
      }
    }

    return null;
  }

  getChildName(name) {
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i].name == name) {
        return this._children[i];
      }
    }

    return null;
  }

  getChildUid(uid) {
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i].uid == uid) {
        return this._children[i];
      }
    }

    return null;
  }

  getChildrenType(type) {
    let kids = [];

    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] instanceof type) {
        kids.push(this._children[i]);
      }
    }

    return kids.length == 0 ? null : kids;
  }

  resolvePath(path) {
    const names = path.split("/");

    let currentSpr = this;
    for (let i = 0; i < names.length; i++) {
      if (currentSpr == null) return null;

      currentSpr = currentSpr.getChildName(names[i]);
    }
    return currentSpr;
  }

  get children() {
    return this._children;
  }

  get name() {
    return this._name;
  }

  get uid() {
    return this._uid;
  }

  get parent() {
    return this._parent;
  }
  
  set parent(newParent) {
    this._parent = newParent;
  }
}

class Sprite extends GameObject {  
  _position;
  _size = Vector2.one();
  _visible = true;

  constructor(position, size, name) {
    super(name);
    this._position = position.clone();
    this._size = size;
  }

  draw(renderer) {
  }

  get position() {
    return this._position;
  }

  set position(newPosition) {
    this._position = newPosition;
  }

  /**
   * Translates this sprite along a given vector
   * @param {Vector2} vector Vector to translate by
   */
  translate(vector) {
    if (this._pinned) return;

    const parentPos = this._globalPos.subtract(this._position);
    this._position = this._position.addVec(vector);
  }

  /**
   * Moves this sprite to a given position
   * @param {Vector2} position The position to teleport to
   */
  teleport(position) {
    if (this._pinned) return;

    const parentPos = this._globalPos.subtract(this._position);
    this._position = position.clone();
  }

  /**
   * Moves this sprite to a given global position
   * @param {Vector2} position Global position to teleport to
   */
  teleportGlobal(position) {
    if (this._pinned) return;

    this._position = this._position.addVec(position.subtract(this.globalPos));
  }

  /**
   * Updates this sprite's global position based on its parent's position
   * @param {Vector2} parentPos The position to update relative to
   */
  /*
  updateGlobalPos(parentPos) {
    this._globalPos = this._position.addVec(parentPos);

    for (let i = 0; i < this._children.length; i++) {
      this._children[i].updateGlobalPos(this._position);
    }
  }*/

  get globalPos() {
    if (this._parent && this._parent instanceof Sprite) {
      // log("Parent: " + this._parent);
      // log("pos: " + JSON.stringify(this._position));
      // log("parent: " + JSON.stringify(this._parent.globalPos))
      // log("parentPlus: " + JSON.stringify(this._position.addVec(this._parent.globalPos)))
      return this._position.addVec(this._parent.globalPos);
    }
    return this._position.clone();
  }

  get size() {
    return this._size;
  }

  get visible() {
    return this._visible;
  }

  set visible(newVisible) {
    this._visible = newVisible;
  }
}

class CanvasLayer extends GameObject {
  _transform; // This transform is seperate from the regular canvas transform

  constructor(initialTransform, name) {
    super(name);
    this._transform = initialTransform;
  }

  get transform() {
    return this._transform;
  }

  set transform(newTransform) {
    this._transform = newTransform;
  }
}

class Camera extends Sprite {
  _scrollMin;
  _scrollMax;
  
  _leftBound;
  _rightBound;
  _upBound;
  _downBound;

  _horizontalLock;
  _verticalLock;

  _scrollPos = Vector2.zero();

  /**
   * Creates a new camera
   * @param {Vector2} scrollMin The minimum scroll amounts
   * @param {Vector2} scrollMax The maximum scroll amounts
   * @param {Number} leftBound The x amount at which the camera starts scrolling left
   * @param {Number} rightBound The x amount at which the camera starts scrolling right
   * @param {Number} upBound The y amount at which the camera starts scrolling up
   * @param {Number} downBound The y amount at which the camera starts scrolling down
   * @param {Boolean} horizontalLock Controls whether or not the camera will scroll horizontally
   * @param {Boolean} verticalLock Controls whether or not the camera will scroll horizontally
   * @param {Boolean} initialCamera Controls if the camera will be the first active camera
   * @param {String} name The name of the camera
   */
  constructor(scrollMin, scrollMax, leftBound, rightBound, upBound, downBound, horizontalLock, verticalLock, initialCamera, name) {
    super(Vector2.zero(), Vector2.zero(), name);

    this._scrollMin = scrollMin;
    this._scrollMax = scrollMax;

    this._leftBound = leftBound;
    this._rightBound = rightBound;
    this._upBound = upBound;
    this._downBound = downBound;

    this._horizontalLock = horizontalLock;
    this._verticalLock = verticalLock;
    
    if (initialCamera) this.activate();
  }

  activate() {
    Utils.broadcast("changeCamera", this);
  }

  calculateScroll() {
    let parentScreenPosition;
    if (this._parent == null) {
      parentScreenPosition == Vector2.zero();
    } else {
      parentScreenPosition = this._parent.globalPos.subtract(this._scrollPos);
    }
    log(JSON.stringify(parentScreenPosition));
    log("scrollPos: " + JSON.stringify(this._scrollPos));
    log("scrollMax: " + JSON.stringify(this._scrollMax));

    // x-axis
    if (!this._horizontalLock) {
      if (parentScreenPosition.x > this._rightBound) this._scrollPos.x += parentScreenPosition.x - this._rightBound;
      if (parentScreenPosition.x < this._leftBound) this._scrollPos.x += parentScreenPosition.x - this._leftBound;
      this._scrollPos.x = Math.min(Math.max(this._scrollPos.x, this._scrollMin.x), this._scrollMax.x - Utils.gameWidth);
    }
    // y-axis
    if (!this._verticalLock) {
      if (parentScreenPosition.y < this._upBound) this._scrollPos.y += parentScreenPosition.y - this._upBound;
      if (parentScreenPosition.y > this._downBound) this._scrollPos.y += parentScreenPosition.y - this._downBound;
      this._scrollPos.y = Math.min(Math.max(this._scrollPos.y, this._scrollMin.y - Utils.gameHeight), this._scrollMax.y)
    }
  
    return this._scrollPos;
  }
}

class CollisionObject extends Sprite {
  _collisionMask = 0b1; // Same as 0b0000000001
  _collisionLayer = 0b1;

  constructor(position, size, collisionMask, collisionLayer, name) {
    super(position, size, name);
    this._collisionMask = collisionMask;
    this._collisionLayer = collisionLayer;
  }

  get collisionMask() {
    return this._collisionMask;
  }

  get collisionLayer() {
    return this._collisionLayer;
  }

  setMaskLevel(level, value) {
    this._collisionMask = this._collisionMask & (1 << level) ^ (value << index) ^ this._collisionMask;
  }

  setLayerLevel(level, value) {
    this._collisionLayer = this._collisionLayer & (1 << level) ^ (value << index) ^ this._collisionLayer;
  }

  /**
   * Checks if this region and another region are intersecting
   * @param {Region} region Region to check interesction with
   */
  intersecting(region) {
    const c1 = this.getChildType(AABB);
    const c2 = region.getChildType(AABB);

    return (
      (region.collisionMask & this._collisionLayer || this._collisionMask & region.collisionLayer) && // If mask and layers align
      PhysicsEngine.staticAABB(c1, c2) // And intersecting
    );
  }
}

class Region extends CollisionObject {
  _regionsInside = [];

  constructor(position, size, name) {
    super(position, size, 0b1, 0b1, name);
  }

  interactWithRegion(region) {
    // log("checking region: " + region.uid);
    const intersecting = this.intersecting(region);
    const containsRegion = this._regionsInside.indexOf(region) > -1;

    if (intersecting && !containsRegion) { // If inside, but wasn't last frame
      this._regionsInside.push(region);
      this.onRegionEnter(region);
    } else if (!intersecting && containsRegion) { // If not inside, but was last frame
      this._regionsInside.splice(this._regionsInside.indexOf(region), 1);
      this.onRegionExit(region);
    }
  }

  onRegionEnter(region) {}
  onRegionExit(region) {}
}

class RigidBody extends CollisionObject {
  constructor(position, size, name) {
    super(position, size, 0b1, 0b1, name);
  }

  onCollision(collision) {}
}

class StaticBody extends RigidBody {
  _bounce = 0;
  _friction = 0.8;

  constructor(position, size, bounce, friction, name) {
    super(position, size, name);
    this._bounce = bounce;
    this._friction = friction;
  }

  get bounce() {
    return this._bounce;
  }

  set bounce(newBounce) {
    this._bounce = newBounce;
  }

  get friction() {
    return this._friction;
  }

  set friction(newFriction) {
    this._friction = newFriction;
  }
}

class KinematicBody extends RigidBody {
  _lastSlideCollisions = [];

  constructor(position, size, name) {
    super(position, size, name);
  }

  /**
   * Moves this sprite by the movement vector and stops if it encounters a collider.
   * @param {Vector2} movement The vector to move by.
   * @param {Number} dt Delta time
   * @returns The information about the collision, or null if there was none.
   */
  moveAndCollide(movement, physics, dt) {
    return physics.checkCollisions(this, movement, dt);
  }
  

  /**
   * Moves this sprite by the movement vector and slides along the surface it encounters.
   * @param {Vector2} movement How much to move by
   * @param {Number} dt Delta time between frames
   * @param {Number} slidesLeft Maximum number of collisions
   */
  moveAndSlide(movement, physics, dt, slidesLeft=4) {
    this._lastSlideCollisions = [];

    let excludeList = [];
    let collision = physics.checkCollisions(this, movement, excludeList, dt);
    while (!collision.normal.equals(Vector2.zero()) && slidesLeft > 0) {
      log("collision!!!!!!!!!!!!!!");
      log("collisionTime: " + collision.time);
      this._position.x += movement.x * collision.time * dt;
      this._position.y += movement.y * collision.time * dt;

      log("beforeCollision: " + JSON.stringify(movement));
      const dotprod = (movement.x * collision.normal.y + movement.y * collision.normal.x);
      movement.x = dotprod * collision.normal.y;
      movement.y = dotprod * collision.normal.x;
      log("AfterCollision: " + JSON.stringify(movement));
      log("afterPosition: " + JSON.stringify(this._position))
      log("AfterCollide: ", movement);
      
      if (!collision.normal.equals(Vector2.zero())) {
        log("Add Collision")
        this._lastSlideCollisions.push(collision);
        excludeList.push(collision.collider);
        slidesLeft--;
      } else {
        return;
      }

      collision = physics.checkCollisions(this, movement, excludeList, dt);
    }

    log("FinalMovement: ", movement);
    this._position = this._position.addVec(movement.multiply(dt));
    log("Final position: " + JSON.stringify(this._position));
    log("result: ", this._position);
  }

  isOnGround(upDirection) {
    log("Looking in last slides: " + this._lastSlideCollisions.length);
    for (let i = 0; i < this._lastSlideCollisions.length; i++) {
      if (this._lastSlideCollisions[i].normal.equals(upDirection)) return true;
    }

    return false;
  }

  getGroundPlatform(upDirection) {
    for (let i = 0; i < this._lastSlideCollisions.length; i++) {
      if (this._lastSlideCollisions[i].normal.equals(upDirection)) return this._lastSlideCollisions[i].collider;
    }

    return null;
  }
}

/*
class StaticBox extends Sprite {
  _collider;

  constructor(position = {x: 0, y: 0}, size = {x: 64, y: 64}, collider, frictionCoef = 0.9) {
    super(position, size);
    this._collider = collider;
    this._collider.position = {
      x: this.position.x + this._collider.offset.x,
      y: this.position.y + this._collider.offset.y
    };
    this.frictionCoef = frictionCoef;
    log("friction " + this.frictionCoef);
  }

  get collider() {
    return this._collider;
  }
  
  syncColliderPos() {
    this._collider.position = {
      x: this.position.x + this._collider.offset.x,
      y: this.position.y + this._collider.offset.y
    };
  }
}

  
class DynamicBox extends Sprite {
  static genID = Utils.counter();

  _collider;

  constructor(position = {x: 0, y: 0}, size = {x: 10, y: 10}, collider, mass=10) {
    super(position, size);
    this._collider = collider;
    this._collider.position = {
      x: this.position.x + this._collider.offset.x,
      y: this.position.y + this._collider.offset.y
    };
    this.gravityMultiplier = 1;
    this.mass = mass;
    this.groundPlatform = null;
  }

  get collider() {
    return this._collider;
  }

  customCollisionResponse(collision) {}
  
  syncColliderPos() {
    this._collider.position = {
      x: this.position.x + this._collider.offset.x,
      y: this.position.y + this._collider.offset.y
    };
  }
  
  physicsUpdate() {
  }
}*/
/*
class Level {
  _gui;

  constructor(initData) {
    this.data = initData;
    
    this.staticSprites = [];
    this.dynamicSprites = [];
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

    //log("drawing: " + JSON.stringify(this.staticSprites));
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
}*/

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