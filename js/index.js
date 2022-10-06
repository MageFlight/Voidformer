let gravity = 0.00072;
let running = true;
let logging = false;

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
  }
};

class Platform extends StaticBox {
  _texture;

  constructor(position, size, texture, color) {
    super(position, size, new StaticAABB({x: 0, y: 0}, size, true), texture);
    this.color = color ? color : '#4fc95b';
    this._texture = texture;
    log("tex: " + JSON.stringify(texture));
  }

  draw() {
    ///console.log("draw platform")
    ///console.log(this.texture);
    //console.log(this.texture.draw)
    this._texture.draw(this.position, this.size);
    // fillRect(this.position, this.size, this.color);
  }
}

class Spike extends StaticBox {
  _texture;

  constructor(position, size, texture) {
    super(position, size, new StaticAABB({x: 0, y: 0}, size, false));
    this._texture = texture;
    log(JSON.stringify(this.collider.position));
  }
  
  draw() {
    //fillRect(this.position, this.size, '#de0023');
    this._texture.draw(this.position, this.size);
  }
}

class Hologram extends Sprite {
  _fontSize = 16;
  _text = "Placeholder";

  constructor(position, text, fontSize) {
    super(position, {width: text.length * fontSize + 1, height: fontSize});
    this._fontSize = fontSize;
    this._text = text;
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

  draw() {
    fillText(this.position, this._text, this._fontSize, "#fff");
  }
}

class Checkpoint extends Sprite {
  _active = false;
  _activationBox;
  _texture;
  static SIZE = {width: 128, height: 128};

  constructor(position, texture) {
    super(position, Checkpoint.SIZE);
    this._activationBox = new AABB(position, this.size);
    this._texture = texture;
  }

  set active(newState) {
    this._active = newState;
  }

  get activationBox() {
    return this._activationBox;
  }

  draw() {
    // fillRect(this.position, this.size, this._active ? "#ffd46e" : "#d480d3");
    this._texture[this._active ? 'active' : 'inactive'].draw(this.position, this.size);
  }
}

class Goal extends DynamicBox {
  _takeoff = {time: 1500, active: false};
  _texture;
  static SIZE = {width: 512, height: 512};

  constructor(position, texture) {
    super(position, Goal.SIZE, new DynamicAABB({x: (Goal.SIZE.width - 283) / 2, y: 0}, {x: 283, y: 0}, {x:0,y:0}, false));
    log("Goal collider: " + JSON.stringify(this.collider.position))
    this.gravityMultiplier = 0;
    this._texture = texture;
  }

  update() {
    if (this._takeoff.active) {
      this._takeoff.time -= dt;
    }
    if (this._takeoff.time <= 0) {
      this.collider.acceleration.y = -0.0003;
    }

    if (this.position.y + this.size.height < -150) {
      this.collider.acceleration.y = 0;
      this.collider.velocity.y = 0;

      alert("You finished the tutorial!");
      alert("Nice Job!");
      running = false;
    }
  }

  startTakeoff() {
    this._takeoff.active = true;
  }

  draw() {
    //fillRect(this.position, this.size, "#44ebd2");
    this._texture.draw(this.position, this.size);
  }
}

class Player extends DynamicBox {
  _texture;
  static SIZE = {width: 128, height: 128};

  constructor(position, texture) {
    super(position, Player.SIZE, new DynamicAABB({x: 0, y: 0}, Player.SIZE, {x: 0, y: 0}, true));
    
    log("PlayerSpawn: " + JSON.stringify(position));
    this.spawn = {x: position.x, y: position.y};
    this._texture = texture;
    
    this.gravityMultiplier = 1;
    this.haveReserveFlip = true;
    this.flipLeft = true;
    this.currentCheckpoint = -1;
  }

  draw() {
    //debugLine(this.position, {x: this.position.x + (this.collider.velocity.x * dt), y: this.position.y + (this.collider.velocity.y * dt)}, '#000' )
    this._texture[this.gravityMultiplier > 0 ? 'normal' : 'inverted'].draw(this.position, this.size);
  }
  
  update() {
    //// Controlling ////
    log("l: " + actions.left.active + " r: " + actions.right.active);
    log("result: " + (actions.left.active == actions.right.active));
    if (actions.left.active == actions.right.active) { // XNOR Gate
      this.collider.acceleration.x = 0;
    } else if (actions.left.active) {
      this.collider.acceleration.x = -0.014;
    } else if (actions.right.active) {
      this.collider.acceleration.x = 0.014;
    }

    if (actions.jump.active && this.groundPlatform != null) {
      this.collider.velocity.y = -2.5 * this.gravityMultiplier;
    }
    if ((actions.gravFlip.active && !actions.gravFlip.stale) && (this.groundPlatform != null || this.haveReserveFlip)) {
      actions.gravFlip.stale = true;
      this.haveReserveFlip = this.groundPlatform != null;
      this.gravityMultiplier *= -1;
    }

    //// Checkpoints ////

    for (let i = 0; i < currentLevel.getSprites(Checkpoint).length; i++) {
      const checkpoint = currentLevel.getSprites(Checkpoint)[i];
      if (this.collider.intersecting(checkpoint.activationBox)) {
        this.spawn = checkpoint.position;
        this.currentCheckpoint = i;
        checkpoint.active = true;
      }
    }
    
    //// Death Conditions ////
    
    // Spikes
    const spikes = currentLevel.getSprites(Spike);
    if (spikes) {
      for (let i = 0; i < spikes.length; i++) {
        log("Spikes: " + JSON.stringify(spikes[i].collider) + " " + JSON.stringify(this.collider));
        if (this.collider.intersecting(spikes[i].collider)) {
          this.die();
        }
      }
    }

    // Void
    log(this.position.y + this.size.height);
    if ((this.position.y > gameHeight && this.gravityMultiplier > 0) || (this.position.y + this.size.height < 0 && this.gravityMultiplier < 0) || this.position.y < -192 || this.position.y > gameHeight + 192) {
      this.die();
    }

    //// Win Condition ////
    if (this.collider.intersecting(currentLevel.getSprites(Goal)[0].collider)) {
      currentLevel.win();
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
  }
  
  physicsUpdate() {}

  die() {
    this.position = {
      x: this.spawn.x,
      y: this.spawn.y
    };
    this.collider.velocity = {x:0,y:0};
    this.collider.acceleration = {x:0,y:0};
    this.syncColliderPos();
    this.gravityMultiplier = 1;
  }
}

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
    alert(e.stack);
    running = false;
  }
};

// setInterval(frame, 1000 / 60)
currentLevel.load()
.then(() => requestAnimationFrame(frame))
.catch(error => { alert(error.stack); running = false });