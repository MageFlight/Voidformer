class AABB {
    _position;
  
    constructor(position, size) {
      this._position = position;
      this.size = size;
    }
  
    get position() {
      return this._position;
    }
  
    set position(position) {
      this._position = position;
    }
    
    intersecting(c2) {
      return !(
          this._position.x + this.size.width < c2.position.x ||
          this._position.x > c2.position.x + c2.size.width ||
          this._position.y + this.size.height < c2.position.y ||
          this._position.y > c2.position.y + c2.size.height
        );
    }
  }
  
  // Position (0,0) is the top left corner of the encapsulating sprite.
  class StaticAABB extends AABB {
    constructor(offset = {x: 0, y: 0}, size = {x: 10, y: 10}, enabled = true) {
      super(null, size);
      this.offset = offset;
      this.enabled = enabled;
    }
  }
  
  class DynamicAABB extends StaticAABB {
    constructor(offset = {x: 0, y: 0}, size = {x: 10, y: 10}, velocity = {x: 0, y: 0}, enabled = true) {
      super(offset, size, enabled);
      
      log("Offset: " + JSON.stringify(offset));
      this.velocity = velocity;
      this.acceleration = {x:0, y:0};
      this.previousCollision = null;
    }
  }

class PhysicsEngine {
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
  
    updateSprites() {
      this.calculateCollisions();
      
      for (let i = 0; i < this.dynamicSprites.length; i++) {
        const sprite = this.dynamicSprites[i];
        sprite.collider.velocity.x += sprite.collider.acceleration.x * dt;
        // Friction stuff
        // log(sprite.collider.acceleration.x);
        // if (sprite.groundPlatform != null) {
        //   // TODO: Move friction to right after collision to eliminatre groundPlatform.
        //   const frictionForce = sprite.groundPlatform.frictionCoef * (gravity * sprite.mass) * dt;
        //   log(sprite.collider.velocity.x);
        //   log("frictionForce: " + frictionForce);
        //   sprite.collider.velocity.x = sprite.collider.velocity.x - (sprite.collider.velocity.x > 0 ? frictionForce : -frictionForce);
        //   log(Math.abs(sprite.collider.velocity.x));
        //   if (Math.abs(sprite.collider.velocity.x) <= frictionForce) {
        //     sprite.collider.velocity.x = 0;
        //   }
        //   log("velocity after friction: " + sprite.collider.velocity.x);
        // }
        log('vel: ' + JSON.stringify((sprite.collider.velocity)));
        console.log(dt)
        sprite.collider.velocity.x *= Math.pow(1 / 1.012, dt);
        sprite.collider.velocity.y += (sprite.collider.acceleration.y + (gravity * sprite.mass * sprite.gravityMultiplier)) * dt; // Gravity is positive because it is applying force going down.
      }
    }
    
    calculateCollisions() {
      log("dboxes: " + JSON.stringify(this.dynamicSprites.length));
      this.dynamicSprites.forEach(dBox => {
        if (dBox.collider.enabled) {
          let possiblePlatforms = [];
          const broadBox = new AABB(
            {
              x: (dBox.collider.velocity.x > 0 ? dBox.position.x : dBox.position.x + (dBox.collider.velocity.x * dt)),
              y: (dBox.collider.velocity.y > 0 ? dBox.position.y : dBox.position.y + (dBox.collider.velocity.y * dt))
            },{
              width: (dBox.collider.velocity.x > 0 ? (dBox.collider.velocity.x * dt) + dBox.size.width : dBox.size.width - (dBox.collider.velocity.x * dt)),
              height: (dBox.collider.velocity.y > 0 ? (dBox.collider.velocity.y * dt) + dBox.size.height : dBox.size.height - (dBox.collider.velocity.y * dt))
            }
          );
  
          //strokeRect(broadBox.position, broadBox.size, '#000');
          // Get possible platforms to intersect
          this.staticSprites.forEach(sBox => {
            if (!sBox.collider.enabled) return;
            if (broadBox.intersecting(sBox)) {
              possiblePlatforms.push(sBox);
            }
          });
  
          // Get closest one
          possiblePlatforms.sort((a,b) => {
            let distToA = PhysicsEngine.getDist(dBox, a);
            let distToB = PhysicsEngine.getDist(dBox, b);
            if (distToA > distToB) {
              return 1;
            } else if (distToA < distToB) {
              return -1;
            } else {
              return 0;
            }
          });
  
          let collisions = [];
          possiblePlatforms.forEach(sBox => {
            if (broadBox.intersecting(sBox)) {
              const collision = this.sweptAABB(dBox, sBox);
              
              if (!(collision.normal.x == 0 && collision.normal.y == 0)) {
                dBox.position.x += (dBox.collider.velocity.x * dt) * collision.time;
                dBox.position.y += (dBox.collider.velocity.y * dt) * collision.time;
                
                const dotprod = (dBox.collider.velocity.x * collision.normal.y + dBox.collider.velocity.y * collision.normal.x) * (1 - collision.time);
                dBox.collider.velocity.x = dotprod * collision.normal.y;
                dBox.collider.velocity.y = dotprod * collision.normal.x;
                collisions.push(collision);
              }
            }
          });
  
          dBox.customCollisionResponse(collisions);
        }
  
        if (!dBox.pinned) {
          log("moving: " + JSON.stringify(dBox.collider.velocity));
          dBox.position.x += dBox.collider.velocity.x * dt;
          dBox.position.y += dBox.collider.velocity.y * dt;
          if (dBox.position.x < 0) {
            dBox.position.x = 0;
            dBox.collider.velocity.x = 0;
          }
          dBox.syncColliderPos();
        }
      });
    }
  
    static getDist(dBox, sBox) {
      let dist = {
        x: 0,
        y: 0
      };
  
      // Get the distances
      if (dBox.collider.velocity.x > 0) { // Moving right
        dist.x = sBox.position.x - (dBox.position.x + dBox.size.width);
      } else { // Moving left
        dist.x = (sBox.position.x + sBox.size.width) - dBox.position.x;
      }
      if (dBox.collider.velocity.y > 0) { // Moving down
        dist.y = sBox.position.y - (dBox.position.y + dBox.size.height);
      } else { // Moving Up
        dist.y = (sBox.position.y + sBox.size.height) - dBox.position.y;
      }
  
      dist.x = dist.x < 0 ? Infinity : dist.x;
      dist.y = dist.y < 0 ? Infinity : dist.y;
      return Math.min(dist.x, dist.y);
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
        entryTime.x = entryDist.x / (b1.velocity.x * dt);
        exitTime.x = exitDist.x / (b1.velocity.x * dt);
      }
      if (b1.velocity.y == 0) {
        entryTime.y = -Infinity;
        exitTime.y = Infinity;
      } else {
        entryTime.y = entryDist.y / (b1.velocity.y * dt);
        exitTime.y = exitDist.y / (b1.velocity.y * dt);
      }
      
      let finalEntryTime = Math.max(entryTime.x, entryTime.y);
      let finalExitTime = Math.min(exitTime.x, exitTime.y);
      // If no collision
      if (finalEntryTime > finalExitTime || entryTime.x > exitTime.x || entryTime.y > exitTime.y || entryTime.x < 0 && entryTime.y < 0 || entryTime.x > 1 && entryTime.y > 1) {
        return {
          time: 1,
          normal: {x: 0, y: 0},
          platform: null
        };
      } else {
        //alert("finalEntryTime (after check): " + finalEntryTime);
        if (entryTime.x > entryTime.y) {
          if (entryDist.x < 0 || (entryDist.x == 0 && b1.velocity.x > 0)) {
            return {
              time: finalEntryTime,
              normal: {x: 1, y: 0},
              platform: staticBox
            };
          } else {
            return {
              time: finalEntryTime,
              normal: {x: -1, y: 0},
              platform: staticBox
            };
          }
        } else {
          if (entryDist.y < 0 || (entryDist.y == 0 && b1.velocity.y < 0)) {
            return {
              time: finalEntryTime,
              normal: {x: 0, y: 1},
              platform: staticBox
            };
          } else {
            return {
              time: finalEntryTime,
              normal: {x: 0, y: -1},
              platform: staticBox
            };
          }
        }
      }
    }
  }