let debugWindow = window.open("", "DEUBUG", `width=500,height=500,top=${(screen.height - 500) / 2},left=${screen.width - 500}`);
debugWindow.document.write('<body></body>');
debugWindow.blur();
window.focus();
//console.log = message => alert(message);
//console.error = message => alert('Error: ' + message);
function log(message) {
  if (!debugWindow.closed) {
    const messageElement = debugWindow.document.createElement('p');
    messageElement.textContent = message;
    debugWindow.document.querySelector('body').appendChild(messageElement);
    debugWindow.scrollTo(0, debugWindow.document.body.scrollHeight);
    let debugLines = debugWindow.document.querySelector('body').children;
    if (debugLines.length > 75) {
      debugLines[0].remove();
    }
  } else {
    alert(message);
  }
}

const canvas = document.querySelector('canvas');
const viewport = canvas.getContext('2d');

const gameWidth = 1920;
const gameHeight = 1080;

setCanvasSize();

let gravity = 0.5;
let running = true;

let prevBeginTime = Date.now();
let dt = 0;

// Add an action with the key being its name, an active property set to false, and an array of the key code used to toggle it.
const actions = {
  left: {
    active: false,
    stale: false,
    keys: ['KeyA', 'ArrowLeft']
  },
  right: {
    active: false,
    stale: false,
    keys: ['KeyD', 'ArrowRight']
  },
  jump: {
    active: false,
    stale: false,
    keys: ['Space']
  },
  gravFlip: {
    active: false,
    stale: false,
    keys: ['ShiftLeft']
  },
  reset: {
    active: false,
    stale: false,
    keys: ['KeyR']
  },
  scroll: {
    active: false,
    stale: false,
    keys: ['KeyF']
  },
  paused: {
    active: false,
    stale: false,
    keys: ['KeyP']
  },
  stepFrame: {
    active: false,
    stale: false,
    keys: ['KeyO']
  }
};

class AABB {
  constructor(position, size) {
    this.position = position;
    this.size = size;
  }
  
  intersecting(c2) {
    return !(
        this.position.x + this.size.width < c2.position.x ||
        this.position.x > c2.position.x + c2.size.width ||
        this.position.y + this.size.height < c2.position.y ||
        this.position.y > c2.position.y + c2.size.height
      );
  }
}

// Position (0,0) is the top left corner of the encapsulating sprite.
class StaticAABB  extends AABB {
  constructor(offset = {x: 0, y: 0}, size = {x: 10, y: 10}, enabled = true) {
    super(null, size);
    this.offset = offset;
    this.enabled = enabled;
  }
}

class DynamicAABB extends StaticAABB {
  constructor(offset = {x: 0, y: 0}, size = {x: 10, y: 10}, velocity = {x: 0, y: 0}, enabled = true) {
    super(offset, size, enabled);
    this.velocity = velocity;
    this.previousCollision = null;
  }
}

class Sprite {
  constructor(size, position = {x:0, y:0}) {
    this.position = position;
    this.size = size;
  }

  update() {
  }

  physicsUpdate() {
  }

  draw() {
  }
}



class StaticBox extends Sprite {
  constructor(collider, size = {x: 10, y: 10}, position = {x: 0, y: 0}) {
    super(size, position);
    this.collider = collider;
    this.collider.position = {
      x: this.position.x + this.collider.offset.x,
      y: this.position.y + this.collider.offset.y
    };
  }
  
  syncColliderPos() {
    this.collider.position = {
      x: this.position.x + this.collider.offset.x,
      y: this.position.y + this.collider.offset.y
    };
  }
}

class DynamicBox extends Sprite {
  constructor(collider, size = {x: 10, y: 10}, velocity = {x: 0, y: 0}, position = {x: 0, y: 0}) {
    super(size, position);
    this.collider = collider;
    this.collider.position = {
      x: this.position.x + this.collider.offset.x,
      y: this.position.y + this.collider.offset.y
    };
  }
  
  syncColliderPos() {
    this.collider.position = {
      x: this.position.x + this.collider.offset.x,
      y: this.position.y + this.collider.offset.y
    };
  }
  
  physicsUpdate() {
  }
}

class PhysicsEngine {
  // TODO: Make the physics act directly on the position of the sprite
  constructor() {
    this.staticSprites = [];
    this.dynamicSprites = [];
  }
  
  addStaticSprite(sprite) {
    this.staticSprites.push(sprite);
  }
  
  removeStaticSprite(sprite) {
    this.staticSprites.splice(this.staticSprites.indexOf(sprite), 1);
  }
  
  addDynamicSprite(sprite) {
    this.dynamicSprites.push(sprite);
  }
  
  removeDynamicSprite(sprite) {
    this.dynamicSprites.splice(this.dynamicSprites.indexOf(sprite), 1);
  }
  
  calculateCollisions() {
    // Add broad phasing and narrow phasing
    this.dynamicSprites.forEach(dBox => {
      const broadBox = new AABB(
        {
          x: (dBox.collider.velocity.x > 0 ? dBox.position.x : dBox.position.x + dBox.collider.velocity.x),
          y: (dBox.collider.velocity.y > 0 ? dBox.position.y : dBox.position.y + dBox.collider.velocity.y)
        },{
          width: (dBox.collider.velocity.x > 0 ? dBox.collider.velocity.x + dBox.size.width : dBox.size.width - dBox.collider.velocity.x),
          height: (dBox.collider.velocity.y > 0 ? dBox.collider.velocity.y + dBox.size.height : dBox.size.height - dBox.collider.velocity.y)
        }
      );
      
      this.staticSprites.forEach(sBox => {
        if (broadBox.intersecting(sBox)) {
        const collision = this.sweptAABB(dBox, sBox);
          //log(JSON.stringify(collision));
          dBox.position.x += dBox.collider.velocity.x * collision.time;
          dBox.position.y += dBox.collider.velocity.y * collision.time;
          
          if (!(collision.normal.x == 0 && collision.normal.y == 0)) {
            const dotprod = (dBox.collider.velocity.x * collision.normal.y + dBox.collider.velocity.y * collision.normal.x) * (1 - collision.time);
            log('Doptprod: ' + dotprod);
            log('init vel: ' + JSON.stringify(dBox.collider.velocity));
            dBox.collider.velocity.x = dotprod * collision.normal.y;
            dBox.collider.velocity.y = dotprod * collision.normal.x;
            log("final vel: "+ JSON.stringify(dBox.collider.velocity));
            log("collision: " + JSON.stringify(collision));
            //alert(JSON.stringify(collision));
            dBox.onGround = collision.normal.x == 0 && collision.normal.y == -1;
          } else {
            dBox.onGround = false;
          }
        }
      });

      // Always move dBox
      //log("velocity" + JSON.stringify(dBox.collider.velocity));
      dBox.position.x += dBox.collider.velocity.x;
      dBox.position.y += dBox.collider.velocity.y;
      dBox.syncColliderPos();
    });
  }
  
  // RETURN the time and surface normal.
  // Adapted from https://www.gamedev.net/articles/programming/general-and-gameplay-programming/swept-aabb-collision-detection-and-response-r3084/
  sweptAABB(dynamicBox, staticBox) {
    const b1 = dynamicBox.collider;
    const b2 = staticBox.collider;
    //log("b1 collider: " + JSON.stringify(b1));
    //log(JSON.stringify(b1.velocity));
    
    let entryDist = {x: 0, y: 0};
    let exitDist = {x: 0, y: 0};
    let entryTime = {x: 0, y: 0};
    let exitTime = {x: 0, y: 0};
    
    // Find the distances between the near and far sides of the boxes.
    if (b1.velocity.x > 0) { // Moving right
      entryDist.x = b2.position.x - (b1.position.x + b1.size.width);
      exitDist.x = (b2.position.x + b2.size.width) - b1.position.x;
    } else { // Moving left
      entryDist.x = (b2.position.x + b2.size.width) - b1.position.x;
      exitDist.x = b2.position.x - (b1.position.x + b1.size.width);
    }
    if (b1.velocity.y > 0) { // Moving down
      entryDist.y = b2.position.y - (b1.position.y + b1.size.height);
      exitDist.y = (b2.position.y + b2.size.height) - b1.position.y;
    } else { // Moving Up
      entryDist.y = (b2.position.y + b2.size.height) - b1.position.y;
      exitDist.y = b2.position.y - (b1.position.y + b1.size.height);
    }
    
    
    // Calculate entry and exit times
    //log("dists: " + JSON.stringify(exitDist))
    if (b1.velocity.x == 0) {
      entryTime.x = -Infinity;
      exitTime.x = Infinity;
    } else {
      entryTime.x = entryDist.x / b1.velocity.x;
      exitTime.x = exitDist.x / b1.velocity.x;
    }
    if (b1.velocity.y == 0) {
      entryTime.y = -Infinity;
      exitTime.y = Infinity;
    } else {
      entryTime.y = entryDist.y / b1.velocity.y;
      exitTime.y = exitDist.y / b1.velocity.y;
    }
    
    log(`Entry: ${JSON.stringify(entryTime)}, Entry Dist: ${JSON.stringify(entryDist)}, Velocity: ${JSON.stringify(b1.velocity)}, Position: ${JSON.stringify(b1.position)}, Exit: ${JSON.stringify(exitTime)}`);
    let finalEntryTime = Math.max(entryTime.x, entryTime.y);
    let finalExitTime = Math.min(exitTime.x, exitTime.y);
    if (finalEntryTime < 1 && finalEntryTime > 0) {
      log(JSON.stringify(entryTime) + " " + finalEntryTime + ":" + JSON.stringify(exitTime) + " " + finalExitTime);
    }
    // If no collision
    if (entryTime.x > exitTime.x || entryTime.y > exitTime.y || entryTime.x < 0 && entryTime.y < 0 || entryTime.x > 1 && entryTime.y > 1) {
      return {
        time: 1,
        normal: {x: 0, y: 0}
      };
    } else {
      //alert("finalEntryTime (after check): " + finalEntryTime);
      if (entryTime.x > entryTime.y) {
        if (entryDist.x < 0) {
          return {
            time: finalEntryTime,
            normal: {x: 1, y: 0}
          };
        } else {
          return {
            time: finalEntryTime,
            normal: {x: -1, y: 0}
          };
        }
      } else {
        if (entryDist.y < 0) {
          return {
            time: finalEntryTime,
            normal: {x: 0, y: 1}
          };
        } else {
          return {
            time: finalEntryTime,
            normal: {x: 0, y: -1}
          };
        }
      }
    }
  }
}

class Platform extends StaticBox {
  constructor(position, size, color) {
    super(new StaticAABB({x: 0, y: 0}, size, true), size, position);
    this.color = color ? color : '#4fc95b';
  }

  draw() {
    fillRect(this.position, this.size, this.color);
  }
}

class Spike extends StaticBox {
  constructor(position, size) {
    super(new StaticAABB(position, size, false), size, position);    
  }
  
  draw() {
    fillRect(this.position, this.size, '#de0023');
  }
}

class Level {
  constructor(initData) {
    this.data = initData;
    
    this.staticSprites = [];
    this.dynamicSprites = [];
    this.backgroundColor = '#ffffff';
    this.physicsEngine = new PhysicsEngine();
    this.scrollPos = 1100;
  }
  
  load() {
    try {
      if (this.data === null) { return; }

      this.backgroundColor = this.data.background;
      this.staticSprites = [];
      this.dynamicSprites = [];

      for (let i = 0; i < this.data.platforms.length; i++) {
        const rawPlatform = this.data.platforms[i];
        const initPlatform = new Platform({
          x: rawPlatform.x,
          y: gameHeight - rawPlatform.y
        }, {
          width: rawPlatform.width,
          height: rawPlatform.height
        }, rawPlatform.color);
        this.staticSprites.push(initPlatform);
        this.physicsEngine.addStaticSprite(initPlatform);
      }

      for (let i = 0; i < this.data.spikes; i++) {
        const rawSpike = this.data.spikes[i];
        const initSpike = new Spike({
          x: rawSpike.x,
          y: gameHeight - rawSpike.y
        }, {
          width: rawSpike.width,
          height: rawSpike.height
        });
        this.staticSpries.push(initSpike);
        this.physicsEngine.addStaticSprite(initSpike);
      }

      const player = new Player(this.data.spawn);
      this.dynamicSprites.push(player);
      this.physicsEngine.addDynamicSprite(player);
    } catch (error) {
      alert("loading error: " + error);
    }
  }
  
  update() {
    //this.scrollPos += 1;
    try {
      for (let i = 0; i < this.staticSprites.length; i++) {
        this.staticSprites[i].update();
      }

      for (let i = 0; i < this.dynamicSprites.length; i++) {
        this.dynamicSprites[i].update();
        this.dynamicSprites[i].physicsUpdate();
      }
      
      this.physicsEngine.calculateCollisions();
    } catch (e) {
      alert("Update error: " + e.stack);
    }
  }
  
  draw() {
    const translation = {
      x: viewport.getTransform().e,
      y: viewport.getTransform().f
    };
    viewport.translate(-this.scrollPos - translation.x,0)

    fillRect(translation, {width: gameWidth, height: gameHeight}, this.backgroundColor);
    //alert("drawing: " + JSON.stringify(this.staticSprites));
    for (let i = 0; i < this.staticSprites.length; i++) {
      this.staticSprites[i].draw();
    }
    
    for (let i = 0; i < this.dynamicSprites.length; i++) {
      this.dynamicSprites[i].draw();
    }
  }
  
  changeData(newData) {
    this.data = newData;
    this.load();
  }
}

class Player extends DynamicBox {
  constructor(position) {
    super(new DynamicAABB({x: 0, y: 0}, {width: 100, height: 100}, {x: 0, y: 0}, true));
    
    this.spawn = {x: position.x, y: position.y};
    this.position = position;
    this.size = {width: 100, height: 100};
    
    this.gravityMultiplier = 1;
    this.flipLeft = true;
    this.onGround = false;
  }

  draw() {
    fillRect(this.position, this.size, this.gravityMultiplier > 0 ? '#4287f5' : '#ffc31f');
    //fillRect({x: this.position.x + this.collider.velocity.x, y: this.position.y + this.collider.velocity.y}, this.size, '#333333aa')
  }
  
  update() {
    if (actions.left.active) {
      this.collider.velocity.x = -10;
    }
    if (actions.right.active) {
      this.collider.velocity.x = 10;
    }
    if (actions.jump.active && this.onGround) {
      this.collider.velocity.y = -17;
    }

    //this.collider.velocity.x *= .9;
    document.querySelector('#debugText').textContent = JSON.stringify(this.position);
  }
  
  physicsUpdate() {
    this.collider.velocity.y += gravity * this.gravityMultiplier;
    this.collider.velocity.x *= this.onGround ? 0.85 : 0.92;
  }
}

let currentLevel = new Level(lvl1_1);
currentLevel.load();

//const platforms = [new Platform(0, gameHeight, gameWidth, 1), new Platform(0, 0, gameWidth, 1), new Platform(0, 0, 1, gameHeight), new Platform(gameWidth, 0, 1, gameHeight), new Platform(500, 550, 200, 20), new Platform(600, 350, 200, 20), new Platform(1000, 350, 200, 20)];
/*let staticColliders = [];
let aStaticColliders = [];
let platforms = [];
let spikes = [];

for (let i = 0; i < lvl1_1.platforms.length; i++) {
  const platform = lvl1_1.platforms[i];

  platforms.push(new Platform(platform.x, gameHeight - platform.y, platform.width, platform.height, platform.color || '#4fc95b'));
}

for (let i = 0; i < lvl1_1.spikes.length; i++) {
  const spike = lvl1_1.spikes[i];

  spikes.push(new Spike(spike.x, gameHeight - spike.y, spike.width, spike.height));
}*/


// Game units size is 1920 x 1080
function fillRect(position, size, color) {
  const scaleFactor = canvas.clientWidth / gameWidth; // Since aspect ratio is locked, can base scale factor off of on axis
  //alert(JSON.stringify(position) + " " + new Error("debug").stack);
  
  viewport.fillStyle = color;
  viewport.fillRect(Math.ceil(position.x * scaleFactor), Math.ceil(position.y * scaleFactor), Math.ceil(size.width * scaleFactor), Math.ceil(size.height * scaleFactor));
}

const frame = (beginTime) => {
  requestAnimationFrame(frame); // Rely on the browser to call the frames
  if (actions.paused.active && !actions.paused.stale) {
    actions.paused.stale = true;
    running = !running;
  }
  if (actions.stepFrame.active && !actions.stepFrame.stale) {
    //log('detected step')
    running = true;
  }
  if (running) {
    log('-------');
    dt = beginTime - prevBeginTime;
    prevBeginTime = beginTime;
    document.querySelector('title').textContent = `Voidformer ${Math.round(1000 / dt)} FPS`;

    viewport.clearRect(viewport.getTransform().e, 0, canvas.width, canvas.height);

    currentLevel.update();
    currentLevel.draw();
    if (actions.stepFrame.active && !actions.stepFrame.stale) {
      running = false;
      actions.stepFrame.stale = true;
    }
  }
};
requestAnimationFrame(frame);

function setCanvasSize() {
  // Link to a desmos possibly explaining this: https://www.desmos.com/calculator/lndgojuiit
  console.log("Constraints: " + window.innerWidth + " " + window.innerHeight);

  const roundedHeight = window.innerHeight - (window.innerHeight % 9);
  const roundedWidth = window.innerWidth - (window.innerWidth % 16);
  const proposeSizeHeightBased = {
    height: roundedHeight,
    width: 16 * roundedHeight / 9
  };
  const proposeSizeWidthBased = {
    width: roundedWidth,
    height: 9 * roundedWidth / 16
  };
  console.log(proposeSizeHeightBased);
  console.log(proposeSizeWidthBased);
  if (proposeSizeHeightBased.height <= window.innerHeight && proposeSizeHeightBased.width <= window.innerWidth) {
    canvas.height = proposeSizeHeightBased.height;
    canvas.width = proposeSizeHeightBased.width;
  } else {
    canvas.width = proposeSizeWidthBased.width;
    canvas.height = proposeSizeWidthBased.height;
  }
  console.log("Final: " + canvas.width + " " + canvas.height);
}

addEventListener('keydown', ({code}) => {
  // Loop through all the actions and activate it if the corrosponding key is pressed.
  Object.keys(actions).forEach(actionKey => {
    const action = actions[actionKey];
    if (action.keys.includes(code)) {
      action.active = true;
      action.stale = false;
    }
  });
});

addEventListener('keyup', ({code}) => {
  // Loop through all the actions and deactivate it if the corrosponding key is pressed.
  Object.keys(actions).forEach(actionKey => {
    const action = actions[actionKey];
    if (action.keys.includes(code)) {
      action.active = false;
      action.stale = false;
    }
  });
});

addEventListener('resize', setCanvasSize);

