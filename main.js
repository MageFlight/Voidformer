class Main {
  static _mainContext;
  _prevView = null;
  _currentView = null;
  _nextView = -1;
  _transferData = null;

  _updateView = true;
  _drawView = true;
  _updateGui = true;
  _toggleActive = false;

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
      Utils.listen("togglePause", () => this.togglePause());
    } catch (e) {
      log(e.stack);
    }
  }

  togglePause() {
    log("toggleing pause")
    this._updateView = !this._updateView;
    this._updateGui = !this._updateGui;
    this._drawView = !this._drawView;
  }

  stop() {
    this._updateView = false;
    this._updateGui = false;
    this._drawView = false;
  }

  start() {
    this._updateView = true;
    this._updateGui = true;
    this._drawView = true;
  }

  frame(startTime) {
    try {
      this._dt = startTime - this._prevStartTime;
      this._prevStartTime = startTime;
      document.querySelector('title').textContent = Math.round(1000 / this._dt) + " FPS";

      if (this._dt > 0) {
        if (actions.paused.active && !actions.paused.stale) {
          actions.paused.stale = true;
          this.togglePause();
        }
        if (actions.stepFrame.active && !actions.stepFrame.stale) {
          this.start();
        }

        if (this._updateView) {
          this._currentView.update(this._dt);
          Utils.timerUpdate(this._dt);
        }
        if (this._drawView) {
          this._renderer.clear('#00ff00');
          this._currentView.draw(this._renderer);
        }
        if (this._updateGui) this._currentView.imgui(this._gui, this._renderer);

        if (actions.stepFrame.active && !actions.stepFrame.stale) {
          this.stop();
          actions.stepFrame.stale = true;
        }
        this._mouseHandeler.update();
      }

      if (this._nextView >= 0) {
        this.changeView(this._nextView).then(() => this._nextView = -1);
      } else {
        requestAnimationFrame(st => this.frame(st)); // Must use arrow function to retain refrence to this.
      }
    } catch (e) {
      alert("Error1");
      alert(e.stack);
    }
  }

  queueViewChange(newView, transferData) {
    this._nextView = newView;
    this._transferData = transferData;
  }

  async changeView(newView) {
    try {
      if (this._currentView != null) {
        this._currentView.stop();
        this._prevView = this._currentView;
      }
    
      switch (newView) {
        case 0:
          this._currentView = new TitleView();
          break;
        case 1:
          this._currentView = new LevelView();
          break;
        default:
          throw new Error("Unknown view: '" + newView + "'");
      }

      console.log(this._currentView);
      await this._currentView.init(this._transferData);
      this._currentView.start();
      log("started");
      requestAnimationFrame(st => {
        this.frame(st);
        log("frame");
      });
    } catch (e) {
      alert("Error2");
      alert(e.stack);
    }
  }

  get renderer() {
    return this._renderer;
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
  try {
    log("starting");
    const main = Main.get();
    main.init();
    main.changeView(0);
  } catch (e) {
    alert("Error3");
    alert(e.stack);
  }
}

//log(document.querySelector("body"));
document.querySelector("body").onload = start;