class MouseHandeler {
  _buttonStates = [false, false, false, false, false];
  _buttonStatesQueue = [true, true, true, true, true];
  _position = {x: 0, y: 0};

  constructor() {
    addEventListener("mousemove", event => {
      const size = canvas.getBoundingClientRect();

      this._position.x = (event.clientX - size.x) / Renderer.scaleFactor;
      this._position.y = (event.clientY - size.y) / Renderer.scaleFactor;
    });

    addEventListener("mousedown", event => {
      this._buttonStates[event.button] = true;
    });
    addEventListener("mouseup", event => {
      this._buttonStatesQueue[event.button] = false;
    });
  }

  update() {
    for (let i = 0; i < this._buttonStates.length; i++) {
      this._buttonStates[i] = this._buttonStates[i] && this._buttonStatesQueue[i];
    }

    this._buttonStatesQueue = [true, true, true, true, true];
  }

  getButtonState(mouseBtn) {
    return this._buttonStates[mouseBtn];
  }

  getMousePos() {
    return this._position;
  }
}