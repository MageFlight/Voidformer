class Imgui {
  _mouseX = 0;
  _mouseY = 0;
  _mouseBtnStates = [false, false, false, false, false];
  
  _hotItem = 0;
  _activeItem = 0;
  _currentID = 0; // Distributes 1 + this initial value

  constructor() {
    addEventListener("mousemove", event => {
      const size = canvas.getBoundingClientRect();

      this._mouseX = (event.clientX - size.x) / scaleFactor;
      this._mouseY = (event.clientY - size.y) / scaleFactor;
    });
    
    addEventListener("mousedown", event => this._mouseBtnStates[event.button] = true);
    addEventListener("mouseup", event => this._mouseBtnStates[event.button] = false);
  }

  mouseInRegion(regionPos, regionSize) {
    return (
      this._mouseX > regionPos.x &&
      this._mouseX < regionPos.x + regionSize.width &&
      this._mouseY > regionPos.y &&
      this._mouseY < regionPos.y + regionSize.height
    );
  }

  button(id, position, size, texture) {
    if (this.mouseInRegion(position, size)) {
      // update hot and active items
      log(this._activeItem);
      if (this._activeItem == 0 || this._activeItem == id) {
        this._hotItem = id;
        if (this._mouseBtnStates[0]) {
          this._activeItem = id;
        }
      }
    }

    viewport.save();
    viewport.setTransform(1, 0, 0, 1, 0, 0);
    let tex;
    if (this._activeItem == id) {
      tex = texture['active'];
    } else if (this._hotItem == id) {
      tex = texture['hot'];
    } else {
      tex = texture['normal'];
    }
    tex.draw(position, size);
    viewport.restore();

    // If the button is hot and active, but mouse is up,
    // the user must have clicked.
    return !this._mouseBtnStates[0] && this._hotItem == id && this._activeItem == id;
  }

  getID() {
    this._currentID++;
    return this._currentID;
  }

  start() {
    this._currentID = 0;
    this._hotItem = 0;
    log("mouseBtns: " + JSON.stringify(this._mouseBtnStates));
    log("mouseX: " + this._mouseX + " mouseY: " + this._mouseY);
  }

  finish() {
    if (!this._mouseBtnStates[0]) {
      this._activeItem = 0;
    } else if (this._activeItem == 0) {
      this._activeItem = -1;
    }
  }
}

class View {
  constructor() {}

  imgui() {
  }
}