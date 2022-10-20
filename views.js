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
        Utils.broadcast("greet", true);
      }

      console.log(gui.finish)
      gui.finish();
    } catch(e) {
      alert(e.stack)
    }
  }
}