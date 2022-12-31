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
  _normalTex;
  _hotTex;
  _activeTex;

  constructor() {
    super();
  }

  async init() {
    log("initing");
    this._normalTex = await ImageTexture.create("assets/gui/titleScreen/startGameBtnN.png");
    this._hotTex = await ImageTexture.create("assets/gui/titleScreen/startGameBtnH.png");
    this._activeTex = await ImageTexture.create("assets/gui/titleScreen/startGameBtnA.png");
  }

  start() {
  }

  stop() {
  }

  update(dt) {
    // Main.get().queueViewChange(1, tutorialLevel);
  }

  draw(renderer) {
  }

  imgui(gui, renderer) {
    try {
      log("imguing");

      log("tex: ", this._activeTex);
      gui.start(renderer);
      if (gui.button(gui.getID(), new Vector2(64, 64), new Vector2(576, 128), this._normalTex, this._hotTex, this._activeTex)) {
        Main.get().queueViewChange(1, new TutorialLevel());
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

  constructor() {
    super();
    this._physics = new PhysicsEngine();
    console.log("creating level");
  }

  async init(lvl) {
    if (lvl === null) throw new Error("No level data provided for Level View creation.");
    
    // Attach Listeners

    Utils.listen("changeCamera", newCamera => this._activeCamera = newCamera);
    
    this._sprites = (await lvl.root()).flat();

    this._physics.addSprites(this._sprites);

    console.log("loaded");

    /*
    if (lvl === null) throw new Error("No level data provided for Level View creation.");

    console.log("loading level")
    const texDat = lvl.textures;

    this._background = await parseTex(texDat.background[lvl.background], {width: Utils.gameWidth, height: Utils.gameHeight});
    this._maxScroll = lvl.maxScroll * this._levelScale - Utils.gameWidth;

    // Load Sprites
    for (let i = 0; i < lvl.sprites.length; i++) {
      const rawSprite = lvl.sprites[i];
      let sprite = await rawSprite.type.loadFromRaw(rawSprite.data, this._levelScale, texDat);
      this._sprites.push(sprite);
      if (sprite instanceof StaticBox || sprite instanceof DynamicBox) {
        this._physics.addSprite(sprite);
      }
    }

    console.log("loaded");
    console.log(this._sprites);*/

  }

  loadSprite(sprite) {
    /*
    log("HI")
    log(data);
    const spr = await data.type.loadFromRaw(data.data, this._levelScale);
    if (spr instanceof Region) {
      this._physics.addSprite(spr);
    }

    if (data.children) {
      log("children: ", data.children);
      for (let i = 0; i < data.children.length; i++) {
        log("loading child")
        const child = await this.loadSprite(data.children[i]);
        spr.addChild(child);
      }
      log("finished children")
    }
    return spr;*/
  }

  update(dt) {
    for (let i = 0; i < this._sprites.length; i++) {
      const spr = this._sprites[i];
      spr.update(dt);
      spr.physicsUpdate(this._physics, dt);
    }

    this._physics.interactRegions();

    // Update scroll position
    /*const rightBound = 750;
    const leftBound = 625;
    const playerScreenX = this.getSprite(Player).position.x - this._scrollPos;
    if (playerScreenX > rightBound) {
      this._scrollPos += playerScreenX - rightBound;
    } else if (playerScreenX < leftBound) {
      this._scrollPos = this._scrollPos + playerScreenX - leftBound;
    }
    log("maxScroll: " + this._maxScroll)
    log("currentScroll: " + this._scrollPos)
    this._scrollPos = Math.min(Math.max(this._scrollPos, this._minScroll), this._maxScroll);*/
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