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
  }
};

class Platform extends StaticBox {
  _texture;

  constructor(position, size, texture) {
    super(position, size, new StaticAABB({x: 0, y: 0}, size, true), texture);
    this._texture = texture;
    log("tex: " + JSON.stringify(texture));
  }

  static async loadFromRaw(data, scale, textures) {
    const pos = {
      x: data.x * scale,
      y: Utils.gameHeight - (data.y * scale)
    };
    const size = {
      width: data.w * scale,
      height: data.h * scale
    };
    let tex = null;
    if (data.texture && data.texture != "") {
      tex = await parseTex(Utils.parseObjectPath(`platform/${data.texture}`, textures), size);
    } else {
      tex = new ColorTexture("#ff0000", true);
    }

    return new Platform(pos, size, tex);
  }

  draw(renderer) {
    ///console.log("draw platform")
    ///console.log(this.texture);
    //console.log(this.texture.draw)
    renderer.drawTexture(this._position, this._size, this._texture);
    // fillRect(this._position, this._size, this.color);
  }
}

class Spike extends StaticBox {
  _texture;

  constructor(position, size, texture) {
    super(position, size, new StaticAABB({x: 0, y: 0}, size, false));
    this._texture = texture;
    log(JSON.stringify(this._collider.position));
  }

  static async loadFromRaw(data, scale, textures) {
    const pos = {
      x: data.x * scale,
      y: Utils.gameHeight - (data.y * scale)
    };
    const size = {
      width: data.w * scale,
      height: data.h * scale
    };
    let tex = null;
    if (data.texture && data.texture != "") {
      tex = await parseTex(Utils.parseObjectPath(`spike/${data.texture}`, textures), size);
    } else {
      tex = new ColorTexture("#ff0000", true);
    }

    return new Spike(pos, size, tex);
  }
  
  draw(renderer) {
    //fillRect(this._position, this._size, '#de0023');
    renderer.drawTexture(this._position, this._size, this._texture);
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

  static async loadFromRaw(data, scale, textures) {
    console.log("creating sprite with data:", data);
    const pos = {
      x: data.x * scale,
      y: Utils.gameHeight - (data.y * scale)
    };
    const text = data.text;
    const fontSize = data.fontSize;

    return new Hologram(pos, text, fontSize);
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
    renderer.fillText(this._position, this._text, this._fontSize, "#fff");
  }
}

class Checkpoint extends StaticBox {
  _active = false;
  _texture;
  static SIZE = {width: 128, height: 128};

  constructor(position, texture) {
    super(position, Checkpoint.SIZE, new StaticAABB({x: 0, y: 0}, Checkpoint.SIZE, false));
    this._texture = texture;
  }

  static async loadFromRaw(data, scale, textures) {
    const pos = {
      x: data.x * scale,
      y: Utils.gameHeight - (data.y * scale)
    };
    let tex = null;
    if (data.texture && data.texture != "") {
      tex = await parseTex(Utils.parseObjectPath(`checkpoint/${data.texture}`, textures), Checkpoint.SIZE);
    } else {
      tex = new ColorTexture("#ff0000", true);
    }

    return new Checkpoint(pos, tex);
  }

  set active(newState) {
    this._active = newState;
  }

  get activationBox() {
    return this._activationBox;
  }

  draw(renderer) {
    // fillRect(this._position, this._size, this._active ? "#ffd46e" : "#d480d3");
    renderer.drawTexture(this._position, this._size, this._texture.currentTex);
  }
}

class Goal extends DynamicBox {
  _takeoff = {time: 1500, active: false};
  _texture;
  static SIZE = {width: 512, height: 512};

  constructor(position, texture) {
    super(position, Goal.SIZE, new DynamicAABB({x: (Goal.SIZE.width - 283) / 2, y: 0}, {x: 283, y: 0}, {x:0,y:0}, false));
    log("Goal collider: " + JSON.stringify(this._collider.position))
    this.gravityMultiplier = 0;
    this._texture = texture;
  }

  static async loadFromRaw(data, scale, textures) {
    const pos = {
      x: data.x * scale,
      y: Utils.gameHeight - (data.y * scale)
    };
    let tex = null;
    if (data.texture && data.texture != "") {
      tex = await parseTex(Utils.parseObjectPath(`goal/${data.texture}`, textures), Goal.SIZE);
    } else {
      tex = new ColorTexture("#ff0000", true);
    }

    return new Goal(pos, tex);
  }

  update(dt) {
    if (this._takeoff.active) {
      this._takeoff.time -= dt;
    }
    if (this._takeoff.time <= 0) {
      this._collider.acceleration.y = -0.0003;
    }

    if (this._position.y + this._size.height < -150) {
      this._collider.acceleration.y = 0;
      this._collider.velocity.y = 0;

      alert("You finished the tutorial!");
      alert("Nice Job!");
      running = false;
    }
  }

  startTakeoff() {
    this._takeoff.active = true;
  }

  draw(renderer) {
    //fillRect(this._position, this._size, "#44ebd2");
    renderer.drawTexture(this._position, this._size, this._texture);
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

    // Add Callbacks
    this._collider.onSpriteEnter = this.onSpriteEnter;
  }

  static async loadFromRaw(data, scale, textures) {
    const pos = {
      x: data.spawn.x * scale,
      y: Utils.gameHeight - (data.spawn.y * scale)
    };
    let tex = null;
    if (data.texture && data.texture != "") {
      tex = await parseTex(Utils.parseObjectPath(`player/${data.texture}`, textures), Player.SIZE);
    } else {
      tex = new ColorTexture("#ff0000", true);
    }

    return new Player(pos, tex);
  }

  draw(renderer) {
    //debugLine(this._position, {x: this._position.x + (this._collider.velocity.x * dt), y: this._position.y + (this._collider.velocity.y * dt)}, '#000' )
    log(this._texture);
    renderer.drawTexture(this._position, this._size, this._texture.currentTex);
  }
  
  update() {
    //// Controlling ////
    log("l: " + actions.left.active + " r: " + actions.right.active);
    log("result: " + (actions.left.active == actions.right.active));
    if (actions.left.active == actions.right.active) { // XNOR Gate
      this._collider.acceleration.x = 0;
    } else if (actions.left.active) {
      this._collider.acceleration.x = -0.014;
    } else if (actions.right.active) {
      this._collider.acceleration.x = 0.014;
    }

    if (actions.jump.active && this.groundPlatform != null) {
      this._collider.velocity.y = -2.5 * this.gravityMultiplier;
    }
    if ((actions.gravFlip.active && !actions.gravFlip.stale) && (this.groundPlatform != null || this.haveReserveFlip)) {
      actions.gravFlip.stale = true;
      this.haveReserveFlip = this.groundPlatform != null;
      this.gravityMultiplier *= -1;
      this._texture.changeState(this.gravityMultiplier > 0 ? "normal" : "inverted");
    }
    
    //// Death Conditions ////

    // Void
    log(this._position, this._size);
    log(this._position.y + this._size.height);
    if ((this._position.y > Utils.gameHeight && this.gravityMultiplier > 0) || (this._position.y + this._size.height < 0 && this.gravityMultiplier < 0) || this._position.y < -192 || this._position.y > Utils.gameHeight + 192) {
      this.die();
    }

    log("reaction: ", this._collider.onSpriteEnter);
  }

  onSpriteEnter(sprite) {
    log("Sprite Entered: ", sprite);
    if (sprite instanceof Spike) {
      this.die();
    } else if (sprite instanceof Checkpoint) {
      alert("checkpoint")
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
  }
  
  physicsUpdate() {}

  die() {
    this._position = {
      x: this.spawn.x,
      y: this.spawn.y
    };
    this._collider.velocity = {x:0,y:0};
    this._collider.acceleration = {x:0,y:0};
    this.syncColliderPos();
    this.gravityMultiplier = 1;
    this._texture.changeState("normal");
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
    alert(e.stack);
    running = false;
  }
};

// setInterval(frame, 1000 / 60)
currentLevel.load()
.then(() => requestAnimationFrame(frame))
.catch(error => { alert(error.stack); running = false });*/