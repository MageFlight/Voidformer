class Resource {
    static pool = {};
    _name = "";
    _data = null;

    constructor(name) {
        this._name = name;
        Resource.pool[name] = this;
    }

    async load() {

    }

    get data() {
        return this._data;
    }

    set data(newData) {
        this._data = newData;
    }

    get name() {
        return this._name;
    }

    static getResource(name) {
        return Resource.pool[name];
    }
}

class Texture extends Resource {
    _size = Vector2.zero();
    _sizeOverride;

    constructor(name, sizeOverride=null) {
        super(name);
        this._sizeOverride = sizeOverride;
    }

    static async create() {
    }

    get size() {
        return this._size;
    }

    get sizeOverride() {
        return this._sizeOverride;
    }

    set sizeOverride(newSize) {
        this._sizeOverride = newSize;
    }

    draw(position, renderer) {
        renderer.drawImage(position, this._sizeOverride == null ? this._size : this._sizeOverride, this._data);
    }
}

class MultiStateTex extends Texture {
    _states = {};
    _currentState;

    constructor(states, initialState) {
        super("$multi");
        this._states = states;
        this._currentState = initialState;
        this.changeState(initialState);
    }

    static async create(states, initialState) {
        const tex = new MultiStateTex(states, initialState);
        return tex;
    }

    get states() {
        return this._states;
    }

    get currentState() {
        return this._currentState;
    }

    changeState(newState) {
        log("Changing Multi State: " + newState);
        log("options: " + JSON.stringify(this._states));
        this._currentState = newState;
        log("currentState: " + this._currentState);
        this._data = this._states[this._currentState].data;
        this._sizeOverride = this._states[this._currentState].sizeOverride;
        log("New SizeOverride: " + JSON.stringify(this._sizeOverride));
        this._size = this._states[this._currentState].size;
    }
}

class ImageTexture extends Texture {
    constructor(path, imageBitmap, sizeOverride) {
        super(path, sizeOverride);
        this._data = imageBitmap;
        log("creating image Tex: " + this._data.width);
        this._size = new Vector2(this._data.width, this._data.height);
    }

    static async create(path, sizeOverride=null) {
        const rawImage = await getImage(path);
        log("rawSrc: " + path);
        log("raw " + rawImage.width);
        return new ImageTexture(path, await createImageBitmap(rawImage, 0, 0, rawImage.width, rawImage.height), sizeOverride)
    }
}

class ColorTexture extends Texture {
    constructor(size, imageBitmap) {
        super("$color");
        this._size = size;
        this._data = imageBitmap;
    }

    static async create(size, color, fill=true) {
        const context = document.createElement('canvas').getContext('2d');

        if (fill) {
            context.fillStyle = color;
            context.fillRect(0, 0, size.x, size.y);
        } else {
            context.strokeStyle = color;
            context.strokeRect(0, 0, size.x, size.y);
        }

        return new ColorTexture(size, await createImageBitmap(context.canvas));
    }
}

class TiledTexture extends Texture {
    static _rng = Utils.seedRandom(12);

    constructor(size, imageBitmap) {
        super("$tiled");
        this._size = size;
        this._data = imageBitmap;
    }

    static async create(size, sources, tileSize, rotation=0, tileHor=true, tileVer=true) {
        let tiles = [];
        for (let i = 0; i < sources.length; i++) {
            tiles.push(await getImage(sources[i]));
        }
        
        const tileCanvas = document.createElement('canvas');
        tileCanvas.width = size.x;
        tileCanvas.height = size.y;
        const tileRender = tileCanvas.getContext('2d');

        let workingTiles = [...tiles]; // Copy the tiles
        Utils.shuffleArray(workingTiles, TiledTexture._rng) // Initialize seed and shuffule array

        for (let column = 0; column < (tileHor ? size.x : tileSize); column += tileSize) {
            for (let row = 0; row < (tileVer ? size.y : tileSize); row += tileSize) {
                const img = workingTiles.shift();
                //console.log(img.complete);

                if (rotation != 0) {
                    const width = tileHor ? tileSize : size.x;
                    const height = tileVer ? tileSize : size.y;
                    const x = column + width / 2; // middle of image
                    const y = row + height / 2;

                    const angle = rotation == -1 ? Math.floor(TiledTexture._rng.next().value * 4) * 0.5 * Math.PI : rotation * Math.PI / 180;
                    // Essentially rotating the image about its center
                    tileRender.save();
                    tileRender.translate(x, y);
                    tileRender.rotate(angle);
                    tileRender.drawImage(
                        img,
                        -width / 2,
                        -height / 2,
                        width,
                        height
                    );
                    tileRender.restore();
                } else {
                    tileRender.drawImage(
                        img,
                        column,
                        row,
                        tileHor ? tileSize : size.x,
                        tileVer ? tileSize : size.y
                    );
                }

                tileRender.setTransform(1, 0, 0, 1, 0, 0); // Identity matrix to reset

                //console.log(column, row, imageSize)

                if (workingTiles.length == 0) {
                    workingTiles = [...tiles];
                    Utils.shuffleArray(workingTiles, TiledTexture._rng);
                }
            }
        }
        
        log(tileCanvas.width);
        return new TiledTexture(size, await createImageBitmap(tileCanvas));
    }
}

// Image Handling
let loadedImages = {};

async function getImage(src) {
    if (!Object.hasOwn(loadedImages, src)) { // Check if the image is already loaded
      log("loading img " + src)
      loadedImages[src] = await loadImg(src);
    }
  
    return loadedImages[src];
  }
  
  function loadImg(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        console.log("loaded image " + src);
        log(`Image ${src} width is ${img.width}`);
        resolve(img);
      };
      img.onerror = error => {
        reject(error);
      }
    });
  };