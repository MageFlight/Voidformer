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

  static parseObjectPath(path, object) {
    const keys = path.split("/");

    let runningObj = object;
    let finalObj;
    for (let i = 0; i < keys.length; i++) {
      if (i == keys.length - 1) {
        finalObj = runningObj[keys[i]];
      } else {
        runningObj = runningObj[keys[i]];
      }
    }

    return finalObj;
  }

  static* seedRandom(startSeed) {
    let seed = startSeed;
    while (true) {
      seed = (seed * 9301 + 49297) % 233280;
      yield seed / 233280;
    }
  }

  static shuffleArray(arr, randGen) {
    for (let i = arr.length - 1; i > 0; i--) {
      let j = Math.floor(randGen.next().value * i);
      
      // Same thing as this:
      let t = arr[i]; arr[i] = arr[j]; arr[j] = t
      // [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

let debugWindow = null;

/*function log(message) {
  return;
  if (debugWindow == null) {
    debugWindow = window.open("", "DEBUG", `width=500,height=500,top=${(screen.height - 500) / 2},left=${screen.width - 500}`);
  }
  debugWindow.document.write(message + "\n");
}*/
const log = console.log;