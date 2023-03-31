// velocityFromRotation() can be called like a plain function.
const VelocityFromRotation = Phaser.Physics.Arcade.ArcadePhysics.prototype.velocityFromRotation;

class Player extends Phaser.Physics.Arcade.Image
{
  throttle = 0;

  maxSpeed = 0;
  turningSpeed = 0;
  timeToFire = 0;
  nextShot = 0;

  sounds = {};

  bullets;

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

      this.tint = 0x0000ff;
  }

  setFireSound(fireSound) {
      this.sounds['fire'] = fireSound;
  }

  update (delta, cursorKeys)
  {
      const { left, right, up, down } = cursorKeys;

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
