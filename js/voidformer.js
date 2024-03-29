console.log("void")
// Add an action with the key being its name, an active property set to false, and an array of the key code used to toggle it.

const actions = {
  left: {
    active: false,
    stale: false,
    keys: ['KeyA', 'ArrowLeft'],
  },
  right: {
    active: false,
    stale: false,
    keys: ['KeyD', 'ArrowRight'],
  },
  jump: {
    active: false,
    stale: false,
    keys: ['Space', 'KeyW', 'ArrowUp'],
  },
  scroll: {
    active: false,
    stale: false,
    keys: ['KeyF'],
  },
  paused: {
    active: false,
    stale: false,
    keys: ['KeyP'],
  },
  stepFrame: {
    active: false,
    stale: false,
    keys: ['KeyO'],
  },
  toggleLog: {
    active: false,
    stale: false,
    keys: ['KeyI'],
  },
  changeVehicle: {
    active: false,
    stale: false,
    keys: ['KeyE'],
  },
  overdrive: {
    active: false,
    stale: false,
    keys: ['KeyQ'],
  },
  toggleInventory: {
    active: false,
    stale: false,
    keys: ['KeyR'],
  },
  back: {
    active: false,
    stale: false,
    keys: ['Escape']
  },
  useRelic1: {
    active: false,
    stale: false,
    keys: ['Digit1']
  },
  useRelic2: {
    active: false,
    stale: false,
    keys: ['Digit2']
  },
  useRelic3: {
    active: false,
    stale: false,
    keys: ['Digit3']
  },
  useRelic4: {
    active: false,
    stale: false,
    keys: ['Digit4']
  },
  useRelic5: {
    active: false,
    stale: false,
    keys: ['Digit5']
  },

};


class Platform extends StaticBody {
  constructor(position, size, name) {
    super(position, size, 0, 0.8, name);
  }
}

class Spike extends Region {
  constructor(position, size, name) {
    super(position, size, name);
  }
}

class Collectable extends Region {
  _collectedState = 0; // 0 is Uncollected, 1 is collected, no checkpoint lock, 2 is collected and locked
  _item;
 
  constructor(position, size, item, name) {
    super(position, size, name);
    this._item = item;
  }

  collect() {
    this._collectedState = 1;
    this.getChildType(AABB).enabled = false;
    this._visible = false;
  }

  reset() {
    log("resetting collectable");
    if (this._collectedState == 2) {
      log("Reset failed due to lock");
      return;
    }
    log("Resetting collectable, state ", this._collectedState);

    this._collectedState = 0;
    this.getChildType(AABB).enabled = true;
    this._visible = true;
  }

  start() {
    console.log("Starting battery", this);
    Utils.listen("playerDie", () => this.reset());
    Utils.listen("nextCheckpoint", () => {
      this._collectedState = Math.min(this._collectedState * 2, 2);
      log("Attempted lock, state " + this._collectedState);
    }); // Lock if collected
  }

  isCollected() {
    return this._collectedState > 0;
  }

  get item() {
    return this._item;
  }
}

class Hologram extends Sprite {
  _fontSize = 16;
  _text = "Placeholder";
  _color;
  _center = false;

  constructor(position, text, fontSize, color, name, center = false) {
    super(position, new Vector2(text.length * fontSize, fontSize), name);
    this._fontSize = fontSize;
    this._text = text;
    this._color = color;
    this._center = center;
  }

  get fontSize() {
    return this._fontSize;
  }

  set fontSize(newSize) {
    this._fontSize = newSize;
  }

  get text() {
    return this._text;
  }
  
  set text(newText) {
    this._text = newText;
  }

  draw(renderer) {
    let position = this.globalPos;
    if (this._center) {
      position.x -= renderer.viewport.measureText(this._text).width / 2;
    }
    renderer.fillText(position, this._text, this._fontSize, this._color);
  }
}

class Checkpoint extends Region {
  _active = false;
  static SIZE = new Vector2(128, 128);

  constructor(position, name) {
    super(position, Checkpoint.SIZE, name);
    log("Creating Checkpoint")
  }

  onRegionEnter(region) {
    if (this._active) return;

    log("Region Entered.");
    if (region instanceof Player) {
      this._active = true;
      log("Texture: " + this.getChildType(TextureRect).texture.changeState);
      this.getChildType(TextureRect).texture.changeState(this._active ? "active" : "inactive");
      Utils.broadcast("nextCheckpoint", this)
    }
  }

  set active(newState) {
    this._active = newState;
  }

  get activationBox() {
    return this._activationBox;
  }
}

class Goal extends Region {
  _takeoff = {time: 1500, active: false};
  _velocity = 0;
  static SIZE = new Vector2(320, 512);

  constructor(position, name) {
    super(position, Goal.SIZE, name);
  }

  start() {
    this.getChildName("changeVehicleHint").visible = false;

    Utils.listen("changeVehicle", vehicle => {
      if (vehicle == this) {
        this._takeoff.active = true;
        this.getChildType(TextureRect).texture.changeState("full");
      }
    });

    this.getChildName("vehicleChangeRange").onRegionEnter = region => {
      if (region instanceof Player) {
        this.getChildName("changeVehicleHint").visible = true;
        this._nearbyVehicle = region;
      }
    }

    this.getChildName("vehicleChangeRange").onRegionExit = region => {
      if (region instanceof Player) {
        this.getChildName("changeVehicleHint").visible = false;
        this._nearbyVehicle = null;
      }
    }
  }

  update(dt) {
    //// Change Vehicle ////
    if (this._nearbyVehicle != null && actions.changeVehicle.active && !actions.changeVehicle.stale) {
      actions.changeVehicle.stale = true;

      this.getChildName("changeVehicleHint").visible = false;
      Utils.broadcast("changeVehicle", this);
    }

    if (this._takeoff.active && this._takeoff.time > 0) {
      this._takeoff.time -= dt;
    }
    if (this._takeoff.time <= 0 && this._takeoff.active) {
      this._velocity -= 0.0003 * dt;
      this._position.y += this._velocity * dt;
    }

    if (this._position.y + this._size.y < -150) {
      this._takeoff.active = false;

      Utils.broadcast("nextLevel");
    }
  }
}

class MovementParameters {
  maxSpeed;

  maxAcceleration;
  maxAirAcceleration;
  deccelerationRate;
  airDeccelerationRate;
  airFriction;
  turnRate;

  jumpHeight;
  maxAirJumps;
  temporaryAirJumps = 0;
  jumpBuffer;
  coyoteTime;

  upwardGravity;
  downwardGravity;

  /**
   * The base set of movement contstraints for a movement controller.
   * @param {Number} maxSpeed The maximum speed of the object
   * @param {Number} maxAcceleration The maximum rate at which the object will speed up while grounded
   * @param {Number} maxAirAcceleration The maximum rate at which the object will speed up while airborne
   * @param {Number} deccelerationRate The maximum rate at which the object will slow down while grounded
   * @param {Number} airDeccelerationRate The maximum rate at which the object will slow down while airborne
   * @param {Number} airFriction The friction of the air: While airborne, the acceleration is divided by this value 
   * @param {Number} turnRate Multiplies the acceleration by this value when the targeted horizontal velocity is not the same sign as the actual velocity.
   * @param {Number} jumpHeight The height of the object's jump
   * @param {Number} maxAirJumps The maximum amount of jumps in the air
   * @param {Number} jumpBuffer The amount of time a jump is held down
   * @param {Number} coyoteTime The amount of time after walking off of a platform when a jump is allowed
   * @param {Number} upwardGravity The multiplier on gravity on the object when its velocity is upwards.
   * @param {Number} downwardGravity The multiplier on gravity on the object when its velocity is 0 or downwards.
   */
  constructor(
    maxSpeed,
    maxAcceleration,
    maxAirAcceleration,
    deccelerationRate,
    airDeccelerationRate,
    airFriction,
    turnRate,
    jumpHeight,
    maxAirJumps,
    jumpBuffer,
    coyoteTime,
    upwardGravity,
    downwardGravity
  ) {
    this.maxSpeed = maxSpeed;
    
    this.maxAcceleration = maxAcceleration;
    this.maxAirAcceleration = maxAirAcceleration;
    this.deccelerationRate = deccelerationRate;
    this.airDeccelerationRate = airDeccelerationRate;
    this.airFriction = airFriction;
    this.turnRate = turnRate;

    this.jumpHeight = jumpHeight;
    this.maxAirJumps = maxAirJumps;

    this.jumpBuffer = jumpBuffer;
    this.coyoteTime = coyoteTime;
    
    this.upwardGravity = upwardGravity;
    this.downwardGravity = downwardGravity;
  }

  clone() {
    return new MovementParameters(
      this.maxSpeed,
      this.maxAcceleration,
      this.maxAirAcceleration,
      this.deccelerationRate,
      this.airDeccelerationRate,
      this.airFriction,
      this.turnRate,
      this.jumpHeight,
      this.maxAirJumps,
      this.upwardGravity,
      this.downwardGravity
    );
  }
}

class MovementController {
  _movementParameters;

  _velocity = Vector2.zero();
  _gravityMultiplier = 1;

  _jumpsUsed = 0;

  _jumped = false;
  _coyoteJumpAllowed = false;

  _attemptingJump = false;

  /**
   * A movement controller computes what an object's velocity should be based on the player input and the movement parameters.
   * @param {MovementParameters} movementParameters The initial movement parameters that constrain the object's movement
   */
  constructor(movementParameters) {
    this._movementParameters = movementParameters;
  }

  get movementParameters() {
    return this._movementParameters;
  }

  set movementParameters(newParameters) {
    this._movementParameters = newParameters;
  }

  /**
   * Calculates the new velocity for the object, using the constraints and current velocity.
   * @param {Number} desiredHorizontalDirection The direction to accelerate towards. -1 is left, 1 is right, and 0 is stop
   * @param {boolean} jumpDesired Determines whether a jump should be attempted.
   * @param {RigidBody} groundPlatform The RigidBody that the object is standing on. If airborne, this is null.
   * @param {Number} downDirection The direction of the ground. -1 is up relative to the screen, and 1 is down relative to the screen
   * @param {Number} dt The elapsed time since the start of the previous frame
   * @param {PhysicsEngine} physics The physics engine used in physics calculations
   * @returns The desired velocity after taking into account the current velocity and constraits.
   */
  computeVelocity(desiredHorizontalDirection, jumpDesired, groundPlatform, downDirection, physics, dt) {
    const onGround = groundPlatform != null;
    log("onGround: ", onGround);
    this._jumped = this._jumped && !onGround;
    
    // Coyote time
    this._coyoteJumpAllowed *= !onGround; // If on the ground, coyoteJumpAllowed resets to 0. Otherwise, it keeps state
    if (!this._jumped && !onGround && this._coyoteJumpAllowed == 0) {
      this._coyoteJumpAllowed = 1;
      Utils.timer(() => {
        log("resetCoyote");
        this._coyoteJumpAllowed = -1;
      }, this._movementParameters.coyoteTime, false);
    }

    // Horizontal Movement
    let acceleration = 0;
    if (desiredHorizontalDirection == 0) { // Deceleration
      acceleration = this._movementParameters.deccelerationRate * onGround + this._movementParameters.airDeccelerationRate * !onGround;
    } else {
      acceleration = this._movementParameters.maxAcceleration * onGround + this._movementParameters.maxAirAcceleration * !onGround;

      if (desiredHorizontalDirection != Math.sign(this._velocity.x)) { // Turning
        acceleration *= this._movementParameters.turnRate;
      }
    }

    acceleration /= onGround ? groundPlatform.friction : this._movementParameters.airFriction;
    this._velocity.x = Utils.moveTowards(this._velocity.x, desiredHorizontalDirection * this._movementParameters.maxSpeed, acceleration * dt);

    //// Vertical Movement ////
    // Jumping
    this._jumpsUsed *= !onGround; // Reset jumps used if on ground

    if (!this._attemptingJump && jumpDesired) {
      this._attemptingJump = true;
      Utils.timer(() => this._attemptingJump = false, this._movementParameters.jumpBuffer);
    }

    log("jumping: ", this._jumped);
    log("jumpDesired: " + jumpDesired);
    log("atteptingJump: " + this._attemptingJump);
    if (((onGround || this._coyoteJumpAllowed == 1) || this._jumpsUsed < this._movementParameters.maxAirJumps || ((this._jumpsUsed >= this._movementParameters.maxAirJumps) && this._movementParameters.temporaryAirJumps)) && this._attemptingJump) {
      this._jumped = true;
      this._attemptingJump = false;

      if ((this._jumpsUsed >= this._movementParameters.maxAirJumps) && this._movementParameters.temporaryAirJumps > 0 && !(onGround || this._coyoteJumpAllowed == 1)) {
        this._movementParameters.temporaryAirJumps--;
      } else {
        this._jumpsUsed += 1 * !(onGround || this._coyoteJumpAllowed == 1);
      }

      let jumpSpeed = -Math.sqrt(-4 * this._movementParameters.jumpHeight * -(physics.gravity * this._movementParameters.upwardGravity)) * downDirection; // Gravity is inverted because y-axis is inverted (relative to math direction) in Andromeda Game Engine.

      // Making jump height constant in air jump environments
      if (this._velocity.y < 0) {
        jumpSpeed = jumpSpeed - this._velocity.y;
      } else if (this._velocity.y > 0) {
        jumpSpeed -= this._velocity.y;
      }

      this._velocity.y += jumpSpeed;
    }

    // Special Gravity

    if (this._velocity.y * downDirection < 0) {
      this._gravityMultiplier = this._movementParameters.upwardGravity * downDirection;
    } else if (this._velocity.y * downDirection > 0) {
      this._gravityMultiplier = this._movementParameters.downwardGravity * downDirection;
    } else {
      this._gravityMultiplier = downDirection;
    }

    // Apply Gravity
    this._velocity.y += physics.gravity * this._gravityMultiplier * dt;

    return this._velocity;
  }
  
  reset() {
    this._velocity = Vector2.zero();
    this._gravityMultiplier = 1;
  }
}

class Player extends KinematicBody {
  static SIZE = new Vector2(128, 128);
  _spawn = Vector2.zero();

  _horizontalDirection = 0;

  _textureDirection = Vector2.one();

  _normalMovementParameters;
  
  _movementController;

  _jumpDesired = false;
  
  _nearbyVehicle = null;

  _downDirection = 1;
  _haveReserveFlip = true;
  _gravityKillZone = 128;
  _gravityKillZoneActive = true;

  _currentCheckpoint = null;

  _activeVehicle = true;

  _savedChargeLevel = 0;
  _chargeLevel = 0;

  _invincible = false;

  _featherUsed = false;

  _inventory = {
    feather: 3,
    ancientShield: 3,
    battery: 3
  };

  _savedInventory = Utils.clone(this._inventory);

  constructor(position, name) {
    super(position, Player.SIZE, name);

    log("PlayerSpawn: " + JSON.stringify(position));
    this._spawn = this.globalPos;
    this._normalMovementParameters = new MovementParameters(
      1.6, 0.009, 0.003, 0.007, 0.001, 0.9, 1.6,
      200, 0,
      83, 50,
      0.8, 1.2
    );
    this._movementController = new MovementController(this._normalMovementParameters);
  }

  start() {
    Utils.listen("playerDie", () => {
      this.die();
    });

    Utils.listen("changeVehicle", vehicle => {
      if (vehicle != this) {
        this._activeVehicle = false;
        this.getChildType(TextureRect).texture.changeState((this._textureDirection.y >= 0 ? "normal" : "inverted") + "Empty");
      }
    });

    Utils.listen("nextCheckpoint", checkpoint => {
      log("checkpoint");
      this._savedChargeLevel = this._chargeLevel;
      this._spawn = checkpoint.globalPos;
      this._currentCheckpoint = checkpoint;

      this._savedInventory = Utils.clone(this._inventory);
    });

    Utils.listen("useRelic", relic => this.useRelic(relic));
  }
  
  update() {
    this.getChildName("playerpos").text = `(${Math.floor(this.globalPos.x / 64)}, ${Math.floor(this.globalPos.y / 64)})`;
    this.getChildName("lvlplayerpos").text = `(${Math.floor(this.globalPos.x / 64)}, ${Math.floor((Utils.gameHeight - this.globalPos.y) / 64)})`;

    Utils.broadcast("playerInventory", this._inventory);

    //// Controlling ////
    const groundPlatform = this.getGroundPlatform(this._downDirection > 0 ? Vector2.up() : Vector2.down());
    const onGround = groundPlatform != null;

    // Horizontal
    this._horizontalDirection =
      (actions.left.active != actions.right.active) * (actions.left.active * -1 + actions.right.active) * // If both left or right are active, then 0. If left is active, then 1. If right is active, then -1.
      this._activeVehicle // Only move if this is the active vehicle.
    
    log("jump active: ", actions.jump.active, " stale: ", actions.jump.stale);
    this._jumpDesired = actions.jump.active && !actions.jump.stale;
    actions.jump.stale = actions.jump.active;
    //// Death Conditions ////

    // Void
    log("downDirection: ", this._downDirection)
    log(this._position.y + this._size.y);
    log("downDirection pos: ", this._position.y > Utils.gameHeight);
    log("downDirection neg: ", (this._position.y + this._size.y) < -Utils.gameHeight);
    if (
      (this._downDirection > 0 && this._position.y > Utils.gameHeight) ||
      (this._downDirection < 0 && (this._position.y + this._size.y) < -Utils.gameHeight) ||
      (this._position.y > Utils.gameHeight + this._size.y * 3) ||
      (this._position.y < -Utils.gameHeight - this.size.y * 3)) {
      log("Out of bounds");
      Utils.broadcast("playerDie");
    }

    //// Texture Updates ////

    // Horizontal
    let currentMovementSigns = new Vector2(Math.sign(this._horizontalDirection), Math.sign(this._downDirection));
    if (currentMovementSigns.x == 0) currentMovementSigns.x = this._textureDirection.x;
    if (!this._textureDirection.equals(currentMovementSigns) && this._activeVehicle) {
      this._textureDirection = currentMovementSigns;
      this.getChildType(TextureRect).texture.changeState((this._textureDirection.y >= 0 ? "normal" : "inverted") + (this._textureDirection.x >= 0 ? "Right" : "Left"));
    }

    //// Relic Use ////
    if (actions.useRelic1.active && !actions.useRelic1.stale) {
      actions.useRelic1.stale = true;
      this.useRelic("battery");
    }
    if (actions.useRelic2.active && !actions.useRelic2.stale) {
      actions.useRelic2.stale = true;
      this.useRelic("ancientShield");
    }
    if (onGround && this._featherUsed) {
      this._featherUsed = false;
      this._movementController._movementParameters.jumpHeight = 200;
    }
    if (actions.useRelic3.active && !actions.useRelic3.stale) {
      actions.useRelic3.stale = true;
      this.useRelic("feather");
    }
  }

  setGravityDirection(downDirection) {
    this._downDirection = downDirection;
    this._gravityKillZone = (this._downDirection > 0) * Utils.gameHeight + this.getChildType(Camera).calculateScroll().y;
    this._gravityKillZoneActive = true;
  }

  physicsUpdate(physics, dt) {
    const groundPlatform = this.getGroundPlatform(this._downDirection > 0 ? Vector2.up() : Vector2.down())
    const onGround = groundPlatform != null;

    const velocity = this._movementController.computeVelocity(this._horizontalDirection, this._jumpDesired, groundPlatform, this._downDirection, physics, dt);
    this.moveAndSlide(velocity, physics, dt);
  }

  onCollision(collision) {
    if (collision.normal.equals(this._downDirection > 0 ? Vector2.up() : Vector2.down())) {
      this._haveReserveFlip = true;
      this._gravityKillZoneActive = false;
    }
  }

  onRegionEnter(region) {
    if (region instanceof Collectable) {
      if (!region.isCollected()) {
        this._inventory[region.item]++;
        region.collect();
      }
    } else if (region instanceof Spike && !this._invincible) {
      Utils.broadcast("playerDie");
    }
  }

  useRelic(relic) {
    if (relic === "battery" && (this._inventory[relic] > 0)) {
      log("relic Amount: " + this._inventory[relic]);
      if (this._downDirection < 0) {
        this._inventory[relic]--;
      }
      this.setGravityDirection(this._downDirection * -1);
      if (this._downDirection < 0) {
        Utils.timer(() => {
          this.setGravityDirection(1);
          this._inventory[relic]--;
        }, 5000);
      }
      
    } else if (relic === "ancientShield" && this._inventory[relic] > 0 && !this._invincible) {
      this._inventory[relic]--;
      this._invincible = true;
      Utils.timer(() => {
        this._invincible = false;
        log("regionsInside length: ", this._regionsInside.length);
        for (const region of this._regionsInside) {
          if (region instanceof Spike) {
            Utils.broadcast("playerDie");
          }
        }
      }, 5000);
    } else if (relic === "feather" && this._inventory[relic] > 0 && !this._featherUsed) {
      this._inventory[relic]--;
      this._movementController._movementParameters.jumpHeight = 400;
      if (this._movementController._movementParameters.temporaryAirJumps < 1)
        this._movementController._movementParameters.temporaryAirJumps = 1;
      this._jumpDesired = true;
      this._featherUsed = true;
    }
  }
  
  die() {
    this._chargeLevel = this._savedChargeLevel;
    this.teleportGlobal(this._spawn);
    this._movementController.movementParameters = this._normalMovementParameters;
    this._movementController.reset();
    this._downDirection = 1;

    this._invincible = false;

    log("Saved Inventory: ", this._savedInventory);
    log("position: ", this._position);
    // Reset Inventory
    this._inventory = Utils.clone(this._savedInventory);
  }
}

class HUD extends CanvasLayer {
  _pressed = false;
  _items = [];

  constructor() {
    super(new Transform(), "HUD");
  }
  
  start() {
    this.getChildType(Button).onPress = () => {
      Utils.broadcast("useRelic", "relic1");
    }
    this._children.forEach(child => {
      if (child.name.match(/^[\w\d]+Count$/i)) {
        this._items.push(child.name.substring(0, child.name.indexOf("Count")));
      }
    })

    Utils.listen("playerInventory", data => {
      Object.keys(data).forEach(key => {
        if (this._items.indexOf(key) != -1) {
          this.getChildName(key + "Count").text = data[key];
        }
      });
    });
  }

  update() {
  }
}

// class InventoryGUI extends Sprite {
//   constructor() {
//     super(Vector2.levelPositionVector2(-3, 3), Vector2.levelVector2(8, 8), "inventoryGUI");
//   }

//   update() {
//     log("Updating inventory, visible: " + this._visible);
//     this._visible = ((actions.toggleInventory.active && !actions.toggleInventory.stale) != this._visible) && !(actions.back.active && !actions.back.stale);
//     actions.toggleInventory.stale = actions.toggleInventory.active;
//     actions.back.stale = actions.back.active;

//     if (this._visible && ((actions.useRelic1.active && !actions.useRelic1.stale) || (actions.useRelic2.active && !actions.useRelic2.stale) || (actions.useRelic3.active && !actions.useRelic3.stale) || (actions.useRelic4.active && !actions.useRelic4.stale) || (actions.useRelic5.active && !actions.useRelic5.stale))) {
//       Utils.broadcast("useRelic",
//         ((actions.useRelic1.active && !actions.useRelic1.stale) * "relic1") +
//         ((actions.useRelic2.active && !actions.useRelic2.stale) * "relic2") +
//         ((actions.useRelic3.active && !actions.useRelic3.stale) * "relic3") +
//         ((actions.useRelic4.active && !actions.useRelic4.stale) * "relic4") +
//         ((actions.useRelic5.active && !actions.useRelic5.stale) * "relic5")
//       );
//     }

//   }
// }