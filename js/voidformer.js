console.log("void")
// Add an action with the key being its name, an active property set to false, and an array of the key code used to toggle it.

const actions = {
  left: {
    active: false,
    stale: false,
    keys: ['KeyA', 'ArrowLeft'],
    onPress: null
  },
  right: {
    active: false,
    stale: false,
    keys: ['KeyD', 'ArrowRight'],
    onPress: null
  },
  jump: {
    active: false,
    stale: false,
    keys: ['Space', 'KeyW', 'ArrowUp'],
    onPress: null
  },
  gravFlip: {
    active: false,
    stale: false,
    keys: ['ShiftLeft', 'ShiftRight'],
    onPress: null
  },
  reset: {
    active: false,
    stale: false,
    keys: ['KeyR'],
    onPress: null
  },
  scroll: {
    active: false,
    stale: false,
    keys: ['KeyF'],
    onPress: null
  },
  paused: {
    active: false,
    stale: false,
    keys: ['KeyP'],
    onPress: null
  },
  stepFrame: {
    active: false,
    stale: false,
    keys: ['KeyO'],
    onPress: null
  },
  toggleLog: {
    active: false,
    stale: false,
    keys: ['KeyI'],
    onPress: null
  },
  changeVehicle: {
    active: false,
    stale: false,
    keys: ['KeyE'],
    onPress: null
  },
  overdrive: {
    active: false,
    stale: false,
    keys: ['KeyQ'],
    onPress: null
  }
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

  onRegionEnter(region) {
    if (region instanceof Player) {
      Utils.broadcast("playerDie");
    }
  }
}

class Battery extends Region {
  constructor(position, size, name) {
    super(position, size, name);
  }

  start() {
    Utils.listen("playerDie", () => {
      this.getChildType(AABB).enabled = true;
      this._visible = true;
    });
  }

  onRegionEnter(region) {
    if (region instanceof Player && !this._collected) {
      Utils.broadcast("batteryGet");
      this.getChildType(AABB).enabled = false;
      this._visible = false;
    }
  }
}

class Hologram extends Sprite {
  _fontSize = 16;
  _text = "Placeholder";
  _color;

  constructor(position, text, fontSize, color, name) {
    super(position, new Vector2(text.length * fontSize + 1, fontSize), name);
    this._fontSize = fontSize;
    this._text = text;
    this._color = color;
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
    renderer.fillText(this.globalPos, this._text, this._fontSize, this._color);
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
    log("Region Entered.");
    if (region instanceof Player) {
      this._active = true;
      log("Texture: " + this.getChildType(TextureRect).texture.changeState);
      this.getChildType(TextureRect).texture.changeState(this._active ? "active" : "inactive");
      Utils.broadcast("playerCheckpoint", this)
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

class Player extends KinematicBody {
  static SIZE = new Vector2(128, 128);
  _spawn = Vector2.zero();

  _velocity = Vector2.zero();
  _desiredHorizontalVelocity = 0;

  _textureDirection = Vector2.one();

  _normalMovementParameters = {
    maxSpeed: 1.6,
    maxAcceleration: 0.009,
    maxAirAcceleration: 0.003,
    deccelerationRate: 0.007,
    airDeccelerationRate: 0.001,
    airFriction: 0.9,
    turnRate: 1.6,

    jumpHeight: 200,
    maxAirJumps: 0,
    jumpsUsed: 0,
    upwardMovementMultiplier: .8,
    downwardMovementMultiplier: 1.2,
  };

  _overdriveMovementParameters = {
    maxSpeed: 2,
    maxAcceleration: 0.006,
    maxAirAcceleration: 0.006,
    deccelerationRate: 0.006,
    airDeccelerationRate: 0.001,
    airFriction: 0.9,
    turnRate: 1.6,

    jumpHeight: 400,
    maxAirJumps: 0,
    jumpsUsed: 0,
    upwardMovementMultiplier: 0.9,
    downwardMovementMultiplier: 1.2
  };

  _activeMovementParameters = {
    maxSpeed: 1.6,
    maxAcceleration: 0.009,
    maxAirAcceleration: 0.003,
    deccelerationRate: 0.009,
    airDeccelerationRate: 0.001,
    airFriction: 0.9,
    turnRate: 1.7,

    jumpHeight: 200,
    maxAirJumps: 0,
    upwardMovementMultiplier: .9,
    downwardMovementMultiplier: 1.2,
  };

  _queueMovementParameters = null;

  _jumpsUsed = 0;
  
  _nearbyVehicle = null;

  _gravityMultiplier = 1;
  _haveReserveFlip = true;
  _gravityKillZone = 0;
  _gravityKillZoneActive = false;

  _currentCheckpoint = null;

  _activeVehicle = true;

  _chargeLevel = 0;

  _overdriven = false;

  constructor(position, name) {
    super(position, Player.SIZE, name);

    log("PlayerSpawn: " + JSON.stringify(position));
    this._spawn = position.clone();
  }

  start() {
    Utils.listen("playerCheckpoint", checkpoint => {
      this._spawn = checkpoint.position.clone();
      this._currentCheckpoint = checkpoint;
    });

    Utils.listen("playerDie", () => {
      this.die();
    });

    Utils.listen("changeVehicle", vehicle => {
      if (vehicle != this) {
        this._activeVehicle = false;
        this.getChildType(TextureRect).texture.changeState((this._textureDirection.y >= 0 ? "normal" : "inverted") + "Empty");
      }
    });

    Utils.listen("batteryGet", () => {
      this._chargeLevel = Math.min(this._chargeLevel + 20, 100);
    });
  }
  
  update() {
    this._chargeLevel = 100;
    console.log("regions inside ", this._regionsInside)
    this.getChildName("playerpos").text = `(${Math.floor(this.globalPos.x / 64)}, ${Math.floor(this.globalPos.y / 64)})`;
    this.getChildName("lvlplayerpos").text = `(${Math.floor(this.globalPos.x / 64)}, ${Math.floor((Utils.gameHeight - this.globalPos.y) / 64)})`;

    //// Controlling ////
    const groundPlatform = this.getGroundPlatform(this._gravityMultiplier > 0 ? Vector2.up() : Vector2.down());
    const onGround = groundPlatform != null;

    // Movement Parameters
    if (onGround && this._queueMovementParameters != null) {
      this._activeMovementParameters = this._queueMovementParameters;
      this._queueMovementParameters = null;
    }

    // Horizontal
    this._desiredHorizontalVelocity =
      (actions.left.active != actions.right.active) * (actions.left.active * -1 + actions.right.active) * // If both left or right are active, then 0. If left is active, then 1. If right is active, then -1.
      this._activeMovementParameters.maxSpeed *
      this._activeVehicle // Only move if this is the active vehicle.
    
    if ((actions.stepFrame.active && !actions.stepFrame.active)) {
      Utils.broadcast("toggleFrame");
    }

    // Gravity Flip
    if ((actions.gravFlip.active && !actions.gravFlip.stale) && (onGround || this._haveReserveFlip) && this._activeVehicle) {
      actions.gravFlip.stale = true;
      this._gravityMultiplier *= -1;
      this._haveReserveFlip = onGround;
      this._gravityKillZone = (this._gravityMultiplier > 0) * Utils.gameHeight + this.getChildType(Camera).calculateScroll().y;
      log("killZone: " + this._gravityKillZone);
      this._gravityKillZoneActive = true;
    }

    //// Overdrive ////

    // Activation
    if (actions.overdrive.active && !actions.overdrive.stale/* && this._chargeLevel == 0*/) {
      this._overdriven = true;
      Utils.timer(() => {
        this._overdriven = 0;
        this._activeMovementParameters = this._normalMovementParameters;
      }, 5000, false);
      this._chargeLevel = 0;
      this._activeMovementParameters = this._overdriveMovementParameters;
    }
    
    //// Death Conditions ////

    // Void
    log(this._position.y + this._size.y);
    if (this._position.y > Utils.gameHeight || this._position.y + this._size.y < -Utils.gameHeight /*|| (this._gravityKillZoneActive && ((this._gravityMultiplier > 0 && this._position.y > this._gravityKillZone) || (this._gravityMultiplier < 0 && this._position.y + this._size.y < this._gravityKillZone)))*/) {
      Utils.broadcast("playerDie");
    }

    //// Texture Updates ////

    // Horizontal
    let currentMovementSigns = new Vector2(Math.sign(this._desiredHorizontalVelocity), Math.sign(this._gravityMultiplier));
    if (currentMovementSigns.x == 0) currentMovementSigns.x = this._textureDirection.x;
    if (!this._textureDirection.equals(currentMovementSigns) && this._activeVehicle) {
      this._textureDirection = currentMovementSigns;
      this.getChildType(TextureRect).texture.changeState((this._textureDirection.y >= 0 ? "normal" : "inverted") + (this._textureDirection.x >= 0 ? "Right" : "Left"));
    }
  }

  physicsUpdate(physics, dt) {
    const groundPlatform = this.getGroundPlatform(this._gravityMultiplier > 0 ? Vector2.up() : Vector2.down())
    const onGround = groundPlatform != null;

    // Horizontal Movement
    let acceleration = 0;
    if (this._desiredHorizontalVelocity == 0) { // Deceleration
      acceleration = this._activeMovementParameters.deccelerationRate * onGround + this._activeMovementParameters.airDeccelerationRate * !onGround;
    } else {
      acceleration = this._activeMovementParameters.maxAcceleration * onGround + this._activeMovementParameters.maxAirAcceleration * !onGround;

      if (Math.sign(this._desiredHorizontalVelocity) != Math.sign(this._velocity.x)) { // Turning
        acceleration *= this._activeMovementParameters.turnRate;
      }
    }
    
    log("accel before friction: " + acceleration)
    acceleration /= onGround ? groundPlatform.friction : this._activeMovementParameters.airFriction;
    this._velocity.x = Utils.moveTowards(this._velocity.x, this._desiredHorizontalVelocity, acceleration * dt);


    //// Vertical Movement ////
    const downDirection = Math.sign(this._gravityMultiplier); // If 1, normal. If -1, gravity is inverted

    // Jumping
    this._jumpsUsed *= !onGround; // Reset jumps used if on ground

    if ((onGround || this._jumpsUsed < this._activeMovementParameters.maxAirJumps) && actions.jump.active && this._activeVehicle) {
      this._jumpsUsed += 1 * !onGround;

      let jumpSpeed = -Math.sqrt(-4 * this._activeMovementParameters.jumpHeight * -(physics.gravity * this._activeMovementParameters.upwardMovementMultiplier)) * downDirection; // Gravity is inverted because y-axis is inverted (relative to math direction) in Andromeda Game Engine.
      log("jumpSpeed: " + jumpSpeed)

      // Making jump height constant in air jump environments
      if (this._velocity.y < 0) {
        log("adjusting (up)")
        jumpSpeed = Math.max(jumpSpeed - this._velocity.y, 0);
      } else if (this._velocity.y > 0) {
        log("adjusting (down)")
        jumpSpeed -= this._velocity.y;
      }

      log("yvel: " + this._velocity.y + " finalJump: " + jumpSpeed)
      this._velocity.y += jumpSpeed;
    }

    log("yVel before grav: " + this._velocity.y);
    // Special Gravity

    if (this._velocity.y * downDirection < 0) {
      this._gravityMultiplier = this._activeMovementParameters.upwardMovementMultiplier * downDirection;
    } else if (this._velocity.y * downDirection > 0) {
      this._gravityMultiplier = this._activeMovementParameters.downwardMovementMultiplier * downDirection;
    } else {
      this._gravityMultiplier = downDirection;
    }
    log("gravMultiplier: " + this._gravityMultiplier);

    // Apply Gravity
    this._velocity.y += physics.gravity * this._gravityMultiplier * dt;

    this.moveAndSlide(this._velocity, physics, dt);
  }

  onCollision(collision) {
    if (collision.normal.equals(this._gravityMultiplier > 0 ? Vector2.up() : Vector2.down())) {
      this._haveReserveFlip = true;
      this._gravityKillZoneActive = false;
    }
  }
  
  die() {
    this._activeMovementParameters = this._normalMovementParameters;
    this._chargeLevel = 0;
    this._position = this._spawn.clone();
    this._velocity = Vector2.zero();
    this._acceleration = Vector2.zero();
    this._gravityMultiplier = 1;
  }
}