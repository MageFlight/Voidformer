class Utils {
  static _gameWidth = 1920;
  static _gameHeight = 1088;

  static _signals = {};

  static get gameWidth() {
    return Utils._gameWidth;
  }

  static get gameHeight() {
    return Utils._gameHeight;
  }

  static broadcast(signal, data = null) {
    Utils._signals[signal].forEach(action => {
      action.call(action, data);
    });
  }

  static listen(signal, action) {
    if (!Utils._signals[signal]) {
      Utils._signals[signal] = [];
    }
    Utils._signals[signal].push(action);
  }
}

let debugWindow = null;

function log(message) {
  if (debugWindow == null || debugWindow.closed) {
    debugWindow = window.open("", "DEBUG", `width=500,height=500,top=${(screen.height - 500) / 2},left=${screen.width - 500}`);
  }
  debugWindow.document.write(message + "\n");
}