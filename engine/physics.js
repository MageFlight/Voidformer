class AABB extends Sprite {
  static genID = 0;

  _enabled;

  /**
   * Creates an Axis-Aligned Bounding Box.
   * @param {Vector2} position The initial position of the collider
   * @param {Vector2} size The size of the collider
   * @param {String} name The name of the collider
   * @param {boolean} enabled The initial enabled status of the collider
   */
  constructor(position, size, enabled = true, name="AABB") {
    super(position, size, name == "AABB" ? name + (AABB.genID++) : name);
    this._enabled = enabled;
  }

  static async loadFromRaw(data, scale) {
    const pos = data.pos.multiply(scale);
    pos.y = Utils.gameHeight - pos.y;
    log(data.size)
    const size = data.size.multiply(scale);

    return new AABB(pos, size, data.enabled, data.name);
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(enabled) {
    this._enabled = enabled;
  }
}

class PhysicsEngine {
    _regions = [];
    _rigidBodies = []; // TODO: Moving platforms (eventually)
    _gravity = 0.0072;
    // static _instance = null;

    constructor() {
    }

    /*static get() {
      if (PhysicsEngine._instance == null) {
        PhysicsEngine._instance = new PhysicsEngine();
      }

      return PhysicsEngine._instance;
    }*/

    get gravity() {
      return this._gravity;
    }

    addSprites(sprites) {
      sprites.forEach(sprite => {
        this.addSprite(sprite);
        this.addSprites(sprite.children);
      });
    }

    addSprite(spr) {
      if (spr instanceof RigidBody) {
        this._rigidBodies.push(spr);
      } else if (spr instanceof Region) {
        this._regions.push(spr);
      }
    }
    
    removeSprite(spr) {
      if (spr instanceof RigidBody) {
        this._rigidBodies.splice(this._rigidBodies.indexOf(spr), 1);
      } else if (spr instanceof Region) {
        this._regions.splice(this._regions.indexOf(spr), 1);
      }
    }
  
    interactRegions() {
      const allBodies = this._regions.concat(this._rigidBodies);

      for (let i = 0; i < this._regions.length; i++) {
        const region = this._regions[i];

        for (let x = 0; x < allBodies.length; x++) {
          const sprite2 = allBodies[x];
          if (region != sprite2) region.interactWithRegion(sprite2); // TODO: Add capability to detect region overlap
        }
      }

      /*
      // Update sprite entering and exiting
      const allSprites = this._dynamicSprites.concat(this._staticSprites);
      for (let i = 0; i < this._dynamicSprites.length; i++) {
        const collider = this._dynamicSprites[i].collider;
        const sprite = this._dynamicSprites[i];

        for (let x = 0; x < allSprites.length; x++) {
          const otherCollider = allSprites[x].collider;
          const otherSprite = allSprites[x];

          if (i != x && !collider.isInsideSprite(otherSprite) && this.staticAABB(collider, otherSprite)) {
            collider.enterSprite(otherSprite);
            otherCollider.enterSprite(sprite);
          } else if (i != x && collider.isInsideSprite(otherSprite) && !this.staticAABB(collider, otherSprite)) {
            collider.exitSprite(otherSprite);
            otherCollider.exitSprite(sprite);
          }
        }
        
      }

      this.calculateCollisions(dt);
      
      for (let i = 0; i < this._dynamicSprites.length; i++) {
        const sprite = this._dynamicSprites[i];
        sprite.physicsUpdate(dt);
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
        sprite.collider.velocity.y += (sprite.collider.acceleration.y + (this._gravity * sprite.mass * sprite.gravityMultiplier)) * dt; // Gravity is positive because it is applying force going down.
      }*/
    }
    
    /**
     * Checks for any collisions between physics-recognised sprites and the provided sprite.
     * @param {RigidBody} sprite Sprite to check collision for
     * @param {Vector2} velocity The velocity of the sprite
     * @param {CollisionObject[]} spritesExclude Sprites to ignore during collision checking.
     * @param {Number} dt Delta time
     * @returns The collision information
     */
    checkCollisions(sprite, velocity, spriteExcludeList, dt) {
      const spriteGlobalPos = sprite.getChildType(AABB).globalPos;
      let broadBox = new AABB(
        new Vector2(
          velocity.x > 0 ? spriteGlobalPos.x : spriteGlobalPos.x + (velocity.x * dt),
          velocity.y > 0 ? spriteGlobalPos.y : spriteGlobalPos.y + (velocity.y * dt)
        ),
        new Vector2(
          velocity.x > 0 ? (velocity.x * dt) + sprite.size.x : sprite.size.x - (velocity.x * dt),
          velocity.y > 0 ? (velocity.y * dt) + sprite.size.y : sprite.size.y - (velocity.y * dt)
        ),
        true,
        "broadBox"
      );
      log("vel: " + JSON.stringify(velocity) + " dt: " + dt);
      log("bBox size: " + JSON.stringify(broadBox.size));
      log("bBox pos: " + JSON.stringify(broadBox.position));
      log("dBox pos: " + JSON.stringify(sprite.globalPos));

      const possibleSprites = [];
      for (let i = 0; i < this._rigidBodies.length; i++) {
        const spr = this._rigidBodies[i];
        if (spr != sprite && spriteExcludeList.indexOf(spr) == -1 && PhysicsEngine.staticAABB(broadBox, spr.getChildType(AABB))) possibleSprites.push(spr);
      }

      if (possibleSprites.length == 0) {
        return {
          time: 1,
          normal: Vector2.zero(),
          position: sprite.globalPos.addVec(velocity.multiply(dt)),
          collider: null
        };
      }

      // Check if any are directly overlapping with a static Seperating Axis Theorem test. (https://noonat.github.io/intersect/#aabb-vs-aabb)
      for (let i = 0; i < possibleSprites.length; i++) {
        const b1Collider = sprite.getChildType(AABB);
        const b2Collider = possibleSprites[i].getChildType(AABB);

        const b2Pos = b2Collider.globalPos;
        
        const b1HalfSize = b1Collider.size.multiply(0.5);
        const b2HalfSize = b2Collider.size.multiply(0.5);
        
        const dx = (b1HalfSize.x + b2HalfSize.x) - Math.abs((b2Pos.x + b2HalfSize.x) - (spriteGlobalPos.x + b1HalfSize.x));
        if (dx <= 0) continue;

        const dy = (b1HalfSize.y + b2HalfSize.y) - Math.abs((b2Pos.y + b2HalfSize.y) - (spriteGlobalPos.y + b1HalfSize.y));
        if (dy <= 0) continue;

        log("ExtraCheck  dx: " + dx + " dy: " + dy);
        if (dx < dy) {
          const signX = Math.sign(dx);
          const collision = {
            time: 0,
            normal: new Vector2(signX, 0),
            position: new Vector2(spriteGlobalPos + signX, 0),
            collider: possibleSprites[i]
          };

          sprite.onCollision(collision);
          possibleSprites[i].onCollision(collision);
          return collision;
        } else {
          const signY = Math.sign(dy);
          const collision = {
            time: 0,
            normal: new Vector2(0, signY),
            position: new Vector2(0, spriteGlobalPos - signY),
            collider: possibleSprites[i]
          };

          sprite.onCollision(collision);
          possibleSprites[i].onCollision(collision);
          return collision;
        }
      }
      
      // Get closest collision
      let closestSprites = [];
      let closestDist = Infinity;
      for (let i = 0; i < possibleSprites.length; i++) {
        const dist = PhysicsEngine.getDist(sprite, possibleSprites[i], velocity);
        if (dist < closestDist) {
          closestDist = dist;
          closestSprites = [possibleSprites[i]];
        } else if (dist == closestDist) {
          closestSprites.push(possibleSprites[i]);
        }
      }
      
      // Calculate Collision if Found
      if (closestSprites.length > 0) {
        let suggestedVelocity = velocity.clone();
        let collisions = [];
        for (let i = 0; i < closestSprites.length; i++) {
          const collision = PhysicsEngine.sweptAABB(sprite, closestSprites[i], suggestedVelocity, dt);

          if (!collision.normal.equals(Vector2.zero())) {
            collisions.push(collision);

            suggestedVelocity.x = suggestedVelocity.x * collision.time * dt;
            suggestedVelocity.y = suggestedVelocity.y * collision.time * dt;
          } else {
            break;
          }
        }

        if (collisions.length > 0) {
          const finalCollision = collisions[collisions.length - 1];
          sprite.onCollision(finalCollision);
          finalCollision.collider.onCollision(finalCollision);
          return finalCollision;
        } else {
          return {
            time: 1,
            normal: Vector2.zero(),
            position: sprite.globalPos.addVec(velocity.multiply(dt)),
            collider: null
          }; 
        }
      }

      /*
      log("dboxes: " + JSON.stringify(this._dynamicSprites.length));
      this._dynamicSprites.forEach(dBox => {
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
          this._staticSprites.forEach(sBox => {
            if (!sBox.collider.enabled) return;
            if (this.staticAABB(broadBox, sBox)) {
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
  
          log("Possible platforms: " + JSON.stringify(possiblePlatforms));
          let collisions = [];
          possiblePlatforms.forEach(sBox => {
            if (this.staticAABB(broadBox, sBox)) {
              const collision = this.sweptAABB(dBox, sBox, dt);
              
              if (!(collision.normal.x == 0 && collision.normal.y == 0)) {
                dBox.position.x += (dBox.collider.velocity.x * dt) * collision.time;
                dBox.position.y += (dBox.collider.velocity.y * dt) * collision.time;
                
                const dotprod = (dBox.collider.velocity.x * collision.normal.y + dBox.collider.velocity.y * collision.normal.x);
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
      });*/
    }
  
    static getDist(dBox, sBox, dBoxVel) {
      let dist = Vector2.zero();
      const dBoxPos = dBox.globalPos;
      const sBoxPos = sBox.globalPos;
      log("sBox pos: " + JSON.stringify(sBoxPos));
  
      // Get the distances
      if (dBoxVel.x > 0) { // Moving right
        dist.x = sBoxPos.x - (dBoxPos.x + dBox.size.x);
      } else { // Moving left
        dist.x = (sBoxPos.x + sBox.size.x) - dBoxPos.x;
      }
      if (dBoxVel.y > 0) { // Moving down
        dist.y = sBoxPos.y - (dBoxPos.y + dBox.size.y);
      } else { // Moving Up
        dist.y = dBoxPos.y - (sBoxPos.y + sBox.size.y);
      }

      log("dists preSnap: " + JSON.stringify(dist));
      dist.x = dist.x < 0 ? Infinity : dist.x;
      dist.y = dist.y < 0 ? Infinity : dist.y;
      log("dists: " + JSON.stringify(dist));
      return Math.min(dist.x, dist.y);
    }

    /**
     * Checks if two colliders are currently intersecting.
     * @param {AABB} c1 First Collider
     * @param {AABB} c2 Second Collider
     * @returns True if both colliders are intersecting, False if they aren't.
     */
    static staticAABB(c1, c2) {
      const c1Pos = c1.globalPos;
      const c2Pos = c2.globalPos;

      return (
        c1Pos.x + c1.size.x > c2Pos.x &&
        c1Pos.x < c2Pos.x + c2.size.x &&
        c1Pos.y + c1.size.y > c2Pos.y &&
        c1Pos.y < c2.globalPos.y + c2.size.y
      );
      //   !(
      //   c1.globalPos.x + c1.size.x < c2.globalPos.x ||
      //   c1.globalPos.x > c2.globalPos.x + c2.size.x ||
      //   c1.globalPos.y + c1.size.y < c2.globalPos.y ||
      //   c1.globalPos.y > c2.globalPos.y + c2.size.y
      // );
    }
    
    // RETURN the time and surface normal.
    // Adapted from https://www.gamedev.net/articles/programming/general-and-gameplay-programming/swept-aabb-collision-detection-and-response-r3084/
    static sweptAABB(dynamicBox, staticBox, vel, dt) {
      const b1 = dynamicBox.getChildType(AABB);
      const b2 = staticBox.getChildType(AABB);

      const b1Pos = b1.globalPos;
      const b2Pos = b2.globalPos;
      //log("b1 collider: " + JSON.stringify(b1));
      //log(JSON.stringify(b1.velocity));
      
      let entryDist = Vector2.zero();
      let exitDist = Vector2.zero();
      let entryTime = Vector2.zero();
      let exitTime = Vector2.zero();

      log("b1Pos: " + JSON.stringify(b1Pos));      
      log("b1Size: " + JSON.stringify(b1.size));      
      log("b2Pos: " + JSON.stringify(b2Pos));      
      log("b2Size: " + JSON.stringify(b2.size));      
      // Find the distances between the near and far sides of the boxes.
      if (vel.x > 0) { // Moving right
        entryDist.x = b2Pos.x - (b1Pos.x + b1.size.x);
        exitDist.x = (b2Pos.x + b2.size.x) - b1Pos.x;
      } else { // Moving left
        entryDist.x = (b2Pos.x + b2.size.x) - b1Pos.x;
        exitDist.x = b2Pos.x - (b1Pos.x + b1.size.x);
      }
      if (vel.y > 0) { // Moving down
        entryDist.y = b2Pos.y - (b1Pos.y + b1.size.y);
        exitDist.y = (b2Pos.y + b2.size.y) - b1Pos.y;
      } else { // Moving Up
        entryDist.y = (b2Pos.y + b2.size.y) - b1Pos.y;
        exitDist.y = b2Pos.y - (b1Pos.y + b1.size.y);
      }
      
      log("entryDist: " + JSON.stringify(entryDist));
      log("exitDist: " + JSON.stringify(exitDist));
      
      // Calculate entry and exit times
      //log("dists: " + JSON.stringify(exitDist))
      if (vel.x == 0) {
        entryTime.x = -Infinity;
        exitTime.x = Infinity;
      } else {
        entryTime.x = entryDist.x / (vel.x * dt);
        exitTime.x = exitDist.x / (vel.x * dt);
      }
      if (vel.y == 0) {
        entryTime.y = -Infinity;
        exitTime.y = Infinity;
      } else {
        entryTime.y = entryDist.y / (vel.y * dt);
        exitTime.y = exitDist.y / (vel.y * dt);
      }

      log("entry: " + JSON.stringify(entryTime));
      log("exit: " + JSON.stringify(exitTime));
      
      let finalEntryTime = Math.max(entryTime.x, entryTime.y);
      let finalExitTime = Math.min(exitTime.x, exitTime.y);
      log("finalEntry: " + JSON.stringify(finalEntryTime));
      log("finalExit: " + JSON.stringify(finalExitTime));
      log("vel: " + JSON.stringify(vel));
      // If no collision
      if (finalEntryTime > finalExitTime || entryTime.x > exitTime.x || entryTime.y > exitTime.y || entryTime.x < 0 && entryTime.y < 0 || entryTime.x > 1 && entryTime.y > 1) {
        return {
          time: 1,
          normal: Vector2.zero(),
          position: b1Pos.addVec(vel.multiply(dt)),
          collider: null
        };
      } else {
        //log("finalEntryTime (after check): " + finalEntryTime);
        if (entryTime.x > entryTime.y) {
          if (entryDist.x < 0 || (entryDist.x == 0 && vel.x < 0)) {
            return {
              time: finalEntryTime,
              normal: Vector2.right(),
              position: new Vector2(b2Pos.x + b2.size.x, b1Pos.y + (vel.y * finalEntryTime)),
              collider: staticBox
            };
          } else {
            return {
              time: finalEntryTime,
              normal: Vector2.left(),
              position: new Vector2(b2Pos.x - b1.size.x, b1Pos.y + (vel.y * finalEntryTime)),
              collider: staticBox
            };
          }
        } else {
          if (entryDist.y < 0 || (entryDist.y == 0 && vel.y < 0)) {
            return {
              time: finalEntryTime,
              normal: Vector2.down(),
              position: new Vector2(b1Pos.x + (vel.x * finalEntryTime), b2Pos.y + b2.size.y),
              collider: staticBox
            };
          } else {
            return {
              time: finalEntryTime,
              normal: Vector2.up(),
              position: new Vector2(b1Pos.x + (vel.x * finalEntryTime), b2Pos.y - b1.size.y),
              collider: staticBox
            };
          }
        }
      }
    }
  }