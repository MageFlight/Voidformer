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
  _tex;

  constructor() {
    super();

    this._tex = new MultiStateTex({
      active: new ImgTexture("assets/gui/titleScreen/startGameBtnA.svg"),
      hot: new ImgTexture("assets/gui/titleScreen/startGameBtnH.svg"),
      normal: new ImgTexture("assets/gui/titleScreen/startGameBtnN.svg")
    }, "paused");
  }

  async init() {
    log("initing");
    await this._tex.load();
    log(JSON.stringify(this._tex));
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
    try {
      log("imguing");

      gui.start(renderer);
      if (gui.button(gui.getID(), {x: 64, y: 64}, {width: 576, height: 128}, this._tex)) {
        log("state: " + this._tex.currentState);
        Main.get().queueViewChange(1, lvlTutorial);
      }
      gui.finish();
    } catch(e) {
      alert(e.stack)
    }
  }
}

class LevelView extends View {
  _levelScale = 64;

  _sprites = [];
  _background;
  _maxScroll;
  _minScroll = 0;
  _scrollPos = 0;

  _physics;

  constructor() {
    super();
    this._physics = new PhysicsEngine();
    console.log("creating level");
  }

  async init(lvl) {
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
    console.log(this._sprites);

    // Attach Listeners
    Utils.listen("playerWin", () => {
      this.getSprite(Goal).win();
      alert('win!!!!!!!!!!!');
    });
  }

  update(dt) {
    for (let i = 0; i < this._sprites.length; i++) {
      this._sprites[i].update(dt);
    }

    this._physics.updateSprites(dt);

    // Update scroll position
    const rightBound = 750;
    const leftBound = 625;
    const playerScreenX = this.getSprite(Player).position.x - this._scrollPos;
    if (playerScreenX > rightBound) {
      this._scrollPos += playerScreenX - rightBound;
    } else if (playerScreenX < leftBound) {
      this._scrollPos = this._scrollPos + playerScreenX - leftBound;
    }
    log("maxScroll: " + this._maxScroll)
    log("currentScroll: " + this._scrollPos)
    this._scrollPos = Math.min(Math.max(this._scrollPos, this._minScroll), this._maxScroll);
  }

  draw(renderer) {
    renderer.translateTo(this._scrollPos, 0);

    renderer.drawTexture({x: this._scrollPos, y: 0}, {width: Utils.gameWidth + 1, height: Utils.gameHeight}, this._background);

    for (let i = 0; i < this._sprites.length; i++) {
      this._sprites[i].draw(renderer);
    }
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