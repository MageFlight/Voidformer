class Main {
  static _mainContext;
  _prevView = -1;
  _currentView = -1;
  _nextView = -1;

  _updateView = true;
  _drawView = true;
  _updateGui = true;

  _gui;
  _renderer;
  _debugger;
  _mouseHandeler;

  _dt = -1;
  _prevStartTime = Date.now();

  constructor() {
  }

  init() {
    try {
      this._mouseHandeler = new MouseHandeler();
      this._gui = new Imgui();
      this._renderer = new Renderer(document.querySelector("canvas"));
      Utils.listen("greet", data => alert(JSON.stringify(data)));
    } catch (e) {
      log(e.stack);
    }
  }

  frame(startTime) {
    try {
      this._dt = startTime - this._prevStartTime;
      this._prevStartTime = startTime;

      if (this._dt > 0) {
        this._renderer.clear('#00ff00');

        if (this._updateView) this._currentView.update(this._dt);
        if (this._drawView) this._currentView.draw(this._renderer);
        if (this._updateGui) this._currentView.imgui(this._gui, this._renderer);
        this._mouseHandeler.update();
      }

      if (this._nextView >= 0) {
        this.changeView(this._nextView);
        this._nextView = -1;
      } else {
        requestAnimationFrame(st => this.frame(st)); // Must use arrow function to retain refrence to this.
      }
    } catch (e) {
      alert(e.stack);
    }
  }

  queueViewChange(newView) {
    this._nextView = newView;
  }

  changeView(newView) {
    this._prevView = this._currentView;

    switch (newView) {
      case 0:
        this._currentView = new TitleView();
        break;
    }

    this._currentView.init().then(() => {
      this._currentView.start();
      log("started");
      requestAnimationFrame(st => {
        this.frame(st);
        log("frame")
      });
    });
  }

  get gui() {
    return this._gui;
  }

  static get() {
    if (!this._mainContext) {
      this._mainContext = new Main();
    }

    return this._mainContext;
  }

  get mouseHandeler() {
    return this._mouseHandeler;
  }
}

function start() {
  log("starting");
  const main = Main.get();
  main.init();
  main.changeView(0);
}

//log(document.querySelector("body"));
document.querySelector("body").onload = start;