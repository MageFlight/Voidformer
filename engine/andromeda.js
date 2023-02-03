// "Cutting Grass is my passion" - Link 2022

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

  get globalPos() {
    if (this._parent && this._parent instanceof Sprite) {
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
      parentScreenPosition = new Vector2(this._parent.globalPos.x - this._scrollPos.x, this._parent.globalPos.y - this._scrollPos.y);
    }
    log(JSON.stringify(parentScreenPosition));
    log("scrollPos: " + JSON.stringify(this._scrollPos));
    log("scrollMax: " + JSON.stringify(this._scrollMax));
    log("scrollMin: " + JSON.stringify(this._scrollMin));

    // x-axis
    if (!this._horizontalLock) {
      if (parentScreenPosition.x > this._rightBound) this._scrollPos.x += parentScreenPosition.x - this._rightBound;
      if (parentScreenPosition.x < this._leftBound) this._scrollPos.x += parentScreenPosition.x - this._leftBound;
      this._scrollPos.x = Math.min(Math.max(this._scrollPos.x, this._scrollMin.x), this._scrollMax.x - Utils.gameWidth);
    }
    // y-axis
    if (!this._verticalLock) {
      log("screenPos: " + parentScreenPosition.y);
      log("upOffset: " + (parentScreenPosition.y - this._upBound));
      log("downOffset: " + (parentScreenPosition.y - this._downBound));
      if (parentScreenPosition.y < this._upBound) this._scrollPos.y += parentScreenPosition.y - this._upBound;
      if (parentScreenPosition.y > this._downBound) this._scrollPos.y += parentScreenPosition.y - this._downBound;
      log("beforeClamp: " + this._scrollPos.y);
      this._scrollPos.y = Math.min(Math.max(this._scrollPos.y, this._scrollMin.y), this._scrollMax.y)
      log("afterClamp: " + this._scrollPos.y);
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
   * @deprecated
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
      log("Position: " + JSON.stringify(collision.position));
      log("normal: " + JSON.stringify(collision.normal));
      this.teleportGlobal(collision.position);

      log("beforeCollision: " + JSON.stringify(movement));
      const dotprod = (movement.x * collision.normal.y + movement.y * collision.normal.x);
      movement.x = dotprod * collision.normal.y;
      movement.y = dotprod * collision.normal.x;
      log("AfterCollision: " + JSON.stringify(movement));
      log("afterPosition: " + JSON.stringify(this._position))
      log("AfterCollide: " + JSON.stringify(movement));
      
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

    log("FinalMovement: " + JSON.stringify(movement));
    this._position = this._position.addVec(movement.multiply(dt));
    log("Final position: " + JSON.stringify(this._position));
    log("result: " + JSON.stringify(this._position));
    log("slidesLeft: " + slidesLeft)
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