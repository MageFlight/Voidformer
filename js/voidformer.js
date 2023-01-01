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
  }
};


class Platform extends StaticBody {
  constructor(position, size, name) {
    super(position, size, 0, 0.8, name);
  }

  // static async loadFromRaw(data, scale) {
  //   const pos = data.pos.multiply(scale);
  //   pos.y = Utils.gameHeight - pos.y;
  //   const size = data.size.multiply(scale);

  //   return new Platform(pos, size, data.name);
  // }
/*
  draw(renderer) {
    ///console.log("draw platform")
    ///console.log(this.texture);
    //console.log(this.texture.draw)
    renderer.drawTexture(this._position, this._size, this._texture);
    // fillRect(this._position, this._size, this.color);
  }*/
}

class Spike extends Region {
  constructor(position, size, name) {
    super(position, size, name);
  }
  /*
  draw(renderer) {
    //fillRect(this._position, this._size, '#de0023');
    renderer.drawTexture(this._position, this._size, this._texture);
  }*/
  onRegionEnter(region) {
    if (region instanceof Player) {
      Utils.broadcast("playerDie");
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

  // static async loadFromRaw(data, scale) {
  //   const pos = data.pos.multiply(scale);
  //   pos.y = Utils.gameHeight - pos.y;
  //   const text = data.text;
  //   const fontSize = data.fontSize;

  //   return new Hologram(pos, text, fontSize, data.name);
  // }

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

  static async loadFromRaw(data, scale) {
    const pos = data.pos.multiply(scale);
    pos.y = Utils.gameHeight - pos.y;

    return new Goal(pos, data.name);
  }

  update(dt) {
    for (let i = 0; i < this._regionsInside.length; i++) {
      if (this._regionsInside[i] instanceof Player && actions.changeVehicle.active && !actions.changeVehicle.stale) {
        actions.changeVehicle.stale = true;
        this._takeoff.active = true;
        this.getChildType(TextureRect).texture.changeState("full");
        Utils.broadcast("playerWin");
      }
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

      alert("You finished the tutorial!");
      alert("Nice Job!");
      Utils.broadcast("togglePause");
    }
  }

  /*
  draw(renderer) {
    //fillRect(this._position, this._size, "#44ebd2");
    renderer.drawTexture(this._position, this._size, this._texture);
  }*/
}

class Player extends KinematicBody {
  static SIZE = new Vector2(128, 128);
  _spawn = Vector2.zero();

  _velocity = Vector2.zero();
  _desiredHorizontalVelocity = 0;

  _textureDirection = Vector2.one();

  _maxSpeed = 1.6;
  _maxAcceleration = 0.002;
  _maxAirAcceleration = 0.0014;
  _deccelerationRate = 0.0049;
  _airDeccelerationRate = 0.0008;
  _airFriction = 0.9;
  _turnRate = 1.8;

  _jumpHeight = 200;
  _maxAirJumps = 0;
  _jumpsUsed = 0;
  _downwardMovementMultiplier = 1.185;
  _upwardMovementMultiplier = 0.9;

  _gravityMultiplier = 1;
  _haveReserveFlip = true;

  _currentCheckpoint = null;

  _inEndingAnimation = false;

  constructor(position, name) {
    super(position, Player.SIZE, name);

    log("PlayerSpawn: " + JSON.stringify(position));
    this._spawn = position.clone();

    Utils.listen("playerCheckpoint", checkpoint => {
      this._spawn = checkpoint.position.clone();
      this._currentCheckpoint = checkpoint;
    });

    Utils.listen("playerDie", () => {
      this.die();
    });

    Utils.listen("playerWin", () => {
      this._inEndingAnimation = true;
      this.getChildType(TextureRect).texture.changeState((this._textureDirection.y >= 0 ? "normal" : "inverted") + "Finish");
    });
  }

  static async loadFromRaw(data, scale) {
    const pos = data.pos.multiply(scale);
    pos.y = Utils.gameHeight - pos.y;

    return new Player(pos, data.name);
  }

  /*
  draw(renderer) {
    //debugLine(this._position, {x: this._position.x + (this._collider.velocity.x * dt), y: this._position.y + (this._collider.velocity.y * dt)}, '#000' )
    log(this._texture);
    renderer.drawTexture(this._position, this._size, this._texture.currentTex);
  }*/
  
  update() {
    console.log("regions inside ", this._regionsInside)
    this.getChildName("playerpos").text = `(${Math.floor(this.globalPos.x / 64)}, ${Math.floor(this.globalPos.y / 64)})`;
    this.getChildName("lvlplayerpos").text = `(${Math.floor(this.globalPos.x / 64)}, ${Math.floor((Utils.gameHeight - this.globalPos.y) / 64)})`;

    //// Controlling ////
    const groundPlatform = this.getGroundPlatform(this._gravityMultiplier > 0 ? Vector2.up() : Vector2.down());
    const onGround = groundPlatform != null;

    // Horizontal
    this._desiredHorizontalVelocity =
      (actions.left.active != actions.right.active) * (actions.left.active * -1 + actions.right.active) * // If both left or right are active, then 0. If left is active, then 1. If right is active, then -1.
      this._maxSpeed *
      !this._inEndingAnimation // If in ending animation, don't move.
    
    if ((actions.stepFrame.active && !actions.stepFrame.active)) {
      Utils.broadcast("toggleFrame");
    }

    // Gravity Flip
    if ((actions.gravFlip.active && !actions.gravFlip.stale) && (onGround || this._haveReserveFlip) && !this._inEndingAnimation) {
      actions.gravFlip.stale = true;
      this._haveReserveFlip = onGround;
      this._gravityMultiplier *= -1;
    }
    
    //// Death Conditions ////

    // Void
    log(this._position.y + this._size.y);
    if ((this._position.y > Utils.gameHeight && this._gravityMultiplier > 0) || (this._position.y + this._size.y < 0 && this._gravityMultiplier < 0) || this._position.y < -192 || this._position.y > Utils.gameHeight + 192) {
      this.die();
    }

    //// Texture Updates ////

    // Horizontal
    const horizontalMovementSign = Math.sign(this._desiredHorizontalVelocity);
    if (this._textureDirection.y != Math.sign(this._gravityMultiplier) || (this._textureDirection.x != horizontalMovementSign && horizontalMovementSign != 0)) {
      this._textureDirection = new Vector2(horizontalMovementSign, Math.sign(this._gravityMultiplier));
      this.getChildType(TextureRect).texture.changeState((this._textureDirection.y >= 0 ? "normal" : "inverted") + (this._textureDirection.x >= 0 ? "Right" : "Left"));
    }
  }

  physicsUpdate(physics, dt) {
    const groundPlatform = this.getGroundPlatform(this._gravityMultiplier > 0 ? Vector2.up() : Vector2.down())
    const onGround = groundPlatform != null;

    // Horizontal Movement
    let acceleration = 0;
    if (this._desiredHorizontalVelocity == 0) { // Deceleration
      acceleration = this._deccelerationRate * onGround + this._airDeccelerationRate * !onGround;
    } else {
      acceleration = this._maxAcceleration * onGround + this._maxAirAcceleration * !onGround;

      if (Math.sign(this._desiredHorizontalVelocity) != Math.sign(this._velocity.x)) { // Turning
        acceleration *= this._turnRate;
      }
    }
    
    log("accel before friction: " + acceleration)
    acceleration /= onGround ? groundPlatform.friction : this._airFriction;
    this._velocity.x = Utils.moveTowards(this._velocity.x, this._desiredHorizontalVelocity, acceleration * dt);


    //// Vertical Movement ////
    const downDirection = Math.sign(this._gravityMultiplier); // If 1, normal. If -1, gravity is inverted

    // Jumping
    this._jumpsUsed *= !onGround; // Reset jumps used if on ground

    if ((onGround || this._jumpsUsed < this._maxAirJumps) && actions.jump.active && !this._inEndingAnimation) {
      this._jumpsUsed += 1 * !onGround;

      let jumpSpeed = -Math.sqrt(-4 * this._jumpHeight * -(physics.gravity * this._upwardMovementMultiplier)) * downDirection; // Gravity is inverted because y-axis is inverted (relative to math direction) in Andromeda Game Engine.
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
      this._gravityMultiplier = this._upwardMovementMultiplier * downDirection;
    } else if (this._velocity.y * downDirection >= 0) {
      this._gravityMultiplier = this._downwardMovementMultiplier * downDirection;
    }
    log("gravMultiplier: " + this._gravityMultiplier);

    // Apply Gravity
    this._velocity.y += physics.gravity * this._gravityMultiplier * dt;

    // Left world boundary
    const colliderPos = this.getChildType(AABB).globalPos;
    if (this._velocity.x * dt + colliderPos.x <= 0) {
      this.teleportGlobal(new Vector2(0, colliderPos.y));
      this._velocity.x = 0;
    }

    this.moveAndSlide(this._velocity, physics, dt);
  }

  onCollision(collision) {
    if (collision.normal.equals(this._gravityMultiplier > 0 ? Vector2.up() : Vector2.down())) {
      this._haveReserveFlip = true;
    }
  }
/*
  onSpriteEnter(sprite) {
    log("Sprite Entered: ", sprite);
    if (sprite instanceof Spike) {
      this.die();
    } else if (sprite instanceof Checkpoint) {
      log("checkpoint")
      this.spawn = sprite.position;
      this.currentCheckpoint = sprite;
      sprite.active = true;
    } else if (sprite instanceof Goal) {
      Utils.broadcast("playerWin");
    }
  }

  customCollisionResponse(collisions) {
    if (collisions.length == 0) {
      this.groundPlatform = null;
      return;
    }

    let toGround = true;
    for (let i = 0; i < collisions.length; i++) {
      const collision = collisions[i];

      if (collision.normal.x == 0 &&
        // Check if on ground for current gravity.
        ((collision.normal.y == -1 && this.gravityMultiplier > 0) || (collision.normal.y == 1 && this.gravityMultiplier < 0))) {
        this.groundPlatform = collision.platform;
        this.haveReserveFlip = true;
        toGround = false;
      }
    }
    
    if (toGround) this.groundPlatform = null;
  }*/
  
  die() {
    this._position = this._spawn.clone();
    this._velocity = Vector2.zero();
    this._acceleration = Vector2.zero();
    this._gravityMultiplier = 1;
  }
}
/*
let currentLevel = new Level(lvlTutorial);

const frame = beginTime => {
  try {
    dt = beginTime - prevBeginTime;
    prevBeginTime = beginTime;

    requestAnimationFrame(frame); // Rely on the browser to call the frames
    if (actions.paused.active && !actions.paused.stale) {
      actions.paused.stale = true;
      running = !running;
    }
    if (actions.stepFrame.active && !actions.stepFrame.stale) {
      //log('detected step')
      running = true;
    }

    if (actions.toggleLog.active && !actions.toggleLog.stale) {
      logging = !logging;
      actions.toggleLog.stale = true;
    }
    if (running && dt > 0) {
      log('-------');
      log('dt: ' + dt);
      rngSeed = 12;
      document.querySelector('title').textContent = `Voidformer ${Math.round(1000 / dt)} FPS`;

      viewport.clearRect(-viewport.getTransform().e, 0, canvas.width, canvas.height);

      currentLevel.update();
      if (actions.stepFrame.active && !actions.stepFrame.stale) {
        running = false;
        actions.stepFrame.stale = true;
      }
    }
    currentLevel.draw();
  } catch (e) {
    log(e.stack);
    running = false;
  }
};

// setInterval(frame, 1000 / 60)
currentLevel.load()
.then(() => requestAnimationFrame(frame))
.catch(error => { log(error.stack); running = false });*/