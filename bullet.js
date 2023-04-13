var Bullet = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

    function Bullet (scene)
    {
        Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, 'shot');

        // this.setBlendMode(1);
        this.setDepth(10);
        this.setScale(5);

        this.speed = 300;
        this.lifespan = 1000;

        this._temp = new Phaser.Math.Vector2();
    },

    fire: function (ship)
    {
        this.lifespan = 1000;

        this.setActive(true);
        this.setVisible(true);
        this.setAngle(ship.body.rotation);
        this.setPosition(ship.x, ship.y);

        this.body.reset(ship.x, ship.y);

        this.body.setSize(2, 2, true);

        var angle = Phaser.Math.DegToRad(ship.body.rotation);

        this.scene.physics.velocityFromRotation(angle, this.speed, this.body.velocity);

        this.body.velocity.x *= 2;
        this.body.velocity.y *= 2;
    },

    update: function (time, delta) {

        // Kill bullets once they hit the edge of the screen
        var playerX = this.scene.player.x;
        var playerY = this.scene.player.y;
        var halfWidth = this.scene.cameras.main.width * 0.5;
        let halfHeight = this.scene.cameras.main.height * 0.5;

        if (this.x > playerX + halfWidth
            || this.x < playerX - halfWidth
            || this.y > playerY + halfHeight
            || this.y < playerY - halfHeight) {
                this.kill();
            }
    },
    kill: function () {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }
});
