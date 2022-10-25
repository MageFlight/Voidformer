class Imgui {
  _hotItem = 0;
  _activeItem = 0;
  _currentID = 0; // Distributes 1 + this initial value

  _renderer = null;

  constructor() {
  }

  mouseInRegion(regionPos, regionSize) {
    const mouseX = Main.get().mouseHandeler.getMousePos().x;
    const mouseY = Main.get().mouseHandeler.getMousePos().y;

    return (
      mouseX > regionPos.x &&
      mouseX < regionPos.x + regionSize.width &&
      mouseY > regionPos.y &&
      mouseY < regionPos.y + regionSize.height
    );
  }

  button(id, position, size, texture) {
    if (this.mouseInRegion(position, size)) {
      // update hot and active items
      if (this._activeItem == 0 || this._activeItem == id) {
        this._hotItem = id;
        if (Main.get().mouseHandeler.getButtonState(0)) {
          this._activeItem = id;
        }
      }
    }

    viewport.save();
    viewport.setTransform(1, 0, 0, 1, 0, 0); // Always display GUI on top
    if (this._activeItem == id) {
      texture.changeState('active');
    } else if (this._hotItem == id) {
      texture.changeState('hot');
    } else {
      texture.changeState('normal');
    }
    this._renderer.drawTexture(position, size, texture.currentTex);
    viewport.restore();

    // If the button is hot and active, but mouse is up,
    // the user must have clicked.
    return !Main.get().mouseHandeler.getButtonState(0) && this._hotItem == id && this._activeItem == id;
  }

  getID() {
    this._currentID++;
    return this._currentID;
  }

  start(renderer) {
    this._currentID = 0;
    this._hotItem = 0;
    this._renderer = renderer;
  }

  finish() {
    this._renderer = null;
    if (!Main.get().mouseHandeler.getButtonState(0)) {
      this._activeItem = 0;
    } else if (this._activeItem == 0) {
      this._activeItem = -1;
    }
  }
}