class View {
  constructor() {
  }

  async init() {
  }

  start() {
  }

  stop() {
  }

  update(dt) {
  }

  draw(renderer) {
  }

  imgui(gui, renderer) {
  }
}

class TitleView extends View {
  _startButtonTexture;

  _backgroundTex;
  _titleTex;

  _joinPoint = Utils.gameWidth;

  constructor() {
    super();
  }

  async init() {
    log("initing");
    this._startButtonTexture = await MultiStateTex.create({
      normal: await ImageTexture.create("assets/titleScreen/startGameBtnN.svg"),
      hot: await ImageTexture.create("assets/titleScreen/startGameBtnH.svg"),
      active: await ImageTexture.create("assets/titleScreen/startGameBtnA.svg")
    }, "normal");

    this._backgroundTex = await ImageTexture.create("assets/titleScreen/titleBackground.svg");
    this._titleTex = await ImageTexture.create("assets/titleScreen/title.svg");
  }

  start() {
  }

  stop() {
  }

  update(dt) {
    // Main.get().queueViewChange(1, tutorialLevel);
    this._joinPoint -= 0.125 * dt;

    if (this._joinPoint <= 0) this._joinPoint = Utils.gameWidth;
  }

  draw(renderer) {
    this._backgroundTex.draw(new Vector2(this._joinPoint - this._backgroundTex.size.x, 0), renderer);
    this._backgroundTex.draw(new Vector2(this._joinPoint, 0), renderer);

    this._titleTex.draw(new Vector2(416, 64), renderer);
  }

  imgui(gui, renderer) {
    try {
      log("imguing");

      log("tex: ", this._activeTex);
      gui.start(renderer);
      if (gui.button(gui.getID(), new Vector2(675, 608), new Vector2(576, 128), this._startButtonTexture)) {
        Main.get().queueViewChange(1, new LevelOne());
      }
      gui.finish();
    } catch(e) {
      log(e.stack)
    }
  }
}

class LevelView extends View {
  _levelScale = 64;

  _sprites = [];

  _activeCamera = null;

  _physics;

  _levels = [new TutorialLevel(), new LevelOne()];
  _currentLevel = 1;

  constructor() {
    super();
    this._physics = new PhysicsEngine();
    console.log("creating level");
  }

  async loadCurrentLevel() {
    const lvl = this._levels[this._currentLevel];

    // Attach Listeners
    Utils.listen("changeCamera", newCamera => this._activeCamera = newCamera);

    this._physics.reset();
    this._sprites = (await lvl.root()).flat();

    this._physics.addSprites(this._sprites);

    this._sprites.forEach(sprite => sprite.start());
    log("loaded");
  }

  async init() {
    Utils.listen("removeSprite", spr => {
      this._physics.removeSprite(spr);
      this._sprites.splice(this._sprites.indexOf(spr), 1);
    });

    Utils.listen("nextLevel", () => {
      this._currentLevel++;
      if (this._currentLevel == this._levels.length) {
        alert("You finished the game! Reload the page to play again.");
        Utils.broadcast("togglePause");
        return;
      }
      Utils.broadcast("syncLoad", this.loadCurrentLevel());
    });

    Utils.broadcast("syncLoad", this.loadCurrentLevel());
  }

  update(dt) {
    log("------ dt: " + dt + " ------");
    for (let i = 0; i < this._sprites.length; i++) {
      this.updateSprite(this._sprites[i], dt);
    }

    this._physics.interactRegions();
  }

  imgui(gui, renderer) {
    gui.start(renderer);
    
    for (let i = 0; i < this._sprites.length; i++) {
      this.imguiSprite(this._sprites[i], gui);
    }

    gui.finish();
  }

  imguiSprite(sprite, gui) {
    if (sprite instanceof GUISprite) {
      sprite.imgui(gui);
    }

    for (let i = 0; i < sprite.children.length; i++) {
      this.imguiSprite(sprite.children[i], gui);
    }
  }

  updateSprite(sprite, dt) {
    sprite.update(dt);
    sprite.physicsUpdate(this._physics, dt);
    
    for (let i = 0; i < sprite.children.length; i++) {
      this.updateSprite(sprite.children[i], dt);
    }
  }

  draw(renderer) {
    if (this._activeCamera) renderer.translateTo(this._activeCamera.calculateScroll());

    for (let i = 0; i < this._sprites.length; i++) {
      this.drawSprite(this._sprites[i], renderer);
    }
  }

  drawSprite(sprite, renderer) {
    const vp = renderer.viewport;
    let originTransform;
    if (sprite instanceof CanvasLayer) {
      originTransform = vp.getTransform();
      vp.setTransform(...sprite.transform.asRaw());
    } else {
      if (!sprite.visible) return;

      sprite.draw(renderer);
    }

    for (let i = 0; i < sprite.children.length; i++) {
      this.drawSprite(sprite.children[i], renderer);
    }

    if (sprite instanceof CanvasLayer) vp.setTransform(originTransform);
  }

  stop() {
  }

  getAllSprites(type) {
    let sprites = [];

    for (let i = 0; i > this._sprites.length; i++) {
      if (this._sprites[i] instanceof type) {
        sprites.push(this._sprites[i]);
      }
    }

    return sprites;
  }

  getSprite(type) {
    for (let i = 0; i < this._sprites.length; i++) {
      const sprite = this._sprites[i];
      if (sprite instanceof type) {
        return sprite;
      }
    }

    return null;
  }
}