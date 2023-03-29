// velocityFromRotation() can be called like a plain function.
const VelocityFromRotation = Phaser.Physics.Arcade.ArcadePhysics.prototype.velocityFromRotation;

class Tank extends Phaser.Physics.Arcade.Image
{
  throttle = 0;

  // The speeds are all done in ranges assuming 1-10 levels
  turnRateRange = [0.5, 5];
  speedRange = [10, 500];
  firingRate = [2000, 250];

  maxSpeed = 0;
  turningSpeed = 0;
  timeToFire = 0;
  nextShot = 0;

  sounds = {};

  bullets;
  
  calcRange(arrRange, level) {
    const C_MAX = 1; const C_MIN = 0;
    
    // Calculate percentage, treating level as being a value from 1-10
    let pct = (level - 1) / 9;

    return  (arrRange[C_MAX] - arrRange[C_MIN]) * pct + arrRange[C_MIN];
  }

  setLevel(level) {
    this.timeToFire = this.calcRange(this.firingRate, level);
    this.maxSpeed = this.calcRange(this.speedRange, level);
    this.turningSpeed = this.calcRange(this.turnRateRange, level);
  }

  configure (game)
  {
      this.angle = -90;

      this.body.angularDrag = 240;
      this.body.maxSpeed = 1;

      this.body.setSize(32, 32, true);

      this.bullets = game.physics.add.group({
        classType: Bullet,
        maxSize: 30,
        runChildUpdate: true
      });

      this.setLevel(game.level);
  }

  setMovementSound(moveSound) {
      this.sounds['move'] = moveSound;
      this.sounds['move'].setLoop(true);
  }

  setFireSound(fireSound) {
      this.sounds['fire'] = fireSound;
  }

  update (delta, cursorKeys)
  {
      const { left, right, up, down } = cursorKeys;

      let lastThrottle = this.throttle;

      if (up.isDown) {
          this.throttle += 0.5 * delta;
      }
      else if (down.isDown) {
          this.throttle -= 0.5 * delta;
      }
      else {
          this.throttle = 0;
      }

      this.throttle = Phaser.Math.Clamp(this.throttle, -this.maxSpeed, this.maxSpeed);

      // Only toggle sound when motion starts or stops
      if (this.throttle == 0 && lastThrottle != 0) {
          this.sounds['move'].stop();
      } else if (this.throttle != 0 && lastThrottle == 0) {
          this.sounds['move'].play();
      }

      if (left.isDown)
      {
          this.body.rotation -= this.turningSpeed;
      }
      else if (right.isDown)
      {
          this.body.rotation += this.turningSpeed;
      }
      else
      {
          this.body.setAngularAcceleration(0);
      }

      VelocityFromRotation(this.rotation, this.throttle, this.body.velocity);

      this.body.maxAngular = Phaser.Math.Clamp(90 * this.body.speed / 1024, 0, 90);

      // Should the player fire? 

      this.nextShot -= delta;
      if (this.nextShot <= 0) {

          let bullet = this.bullets.get();
          if (bullet)
          {
            bullet.fire(this);

            // Play the shot sound
            this.sounds['fire'].play();

            // Reset the nextShot timer
            this.nextShot = this.timeToFire;
          }
          
      }


  }
}
