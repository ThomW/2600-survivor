var PGhost = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function PGhost (scene)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, 'p-ghost');

        // Animation set
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('p-ghost'),
            frameRate: 4,
            repeat: -1
        });

        this.play('walk');

        // this.setBlendMode(1);
        this.setDepth(10);
        this.setScale(3);

        this.speed = 150;

        this.nextMove = 0;
    },

    spawn: function ()
    {
        // Calculate spawn point of new enemy along the edges of the screen
        var halfWidth = (this.scene.cameras.main.width * 0.5) + 20;
        var playerX = this.scene.player.x;
        var halfHeight = (this.scene.cameras.main.height * 0.5) + 20;
        var playerY = this.scene.player.y;

        var x, y;
        var edge = Phaser.Math.Between(1, 4);

        if (edge in [1,3]) {
            x = Phaser.Math.Between(playerX - halfWidth, playerX + halfWidth);
            if (edge == 1) {
                y = playerY - halfHeight;
            } else {
                y = playerY + halfHeight;
            }
        } else {
            if (edge == 2) {
                x = playerX + halfWidth;
            } else {
                x = playerX - halfWidth;
            }
            y = Phaser.Math.Between(playerY - halfHeight, playerY + halfHeight);
        }

        this.tint = Phaser.Math.RND.pick([0xff0000, 0xeeb8ee, 0x00ffff, 0xffb852]);

        this.setPosition(x, y);

        this.body.reset(x, y);

        this.body.setSize(10, 10, true);

        this.setActive(true);
        this.setVisible(true);

        // Set nextMove to zero to force it to calculate velocity, etc. on first update
        this.nextMove = 0;
    },

    update: function (time, delta)
    {
        // Countdown to the next move change
        this.nextMove -= delta;
        if (this.nextMove <= 0) {

            // Start countdown to next move
            this.nextMove = 500;

            radians = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.body.x, this.scene.player.body.y);
            degrees = radians * (180 / Math.PI);

            // Lock enemy into 90deg angles
            degrees = [-360, -270, -180, -90, 0, 90, 180, 270, 360].reduce(function(prev, curr) {
                return (Math.abs(curr - degrees) < Math.abs(prev - degrees) ? curr : prev);
            });

            this.scene.physics.velocityFromAngle(degrees,
                this.speed,
                this.body.velocity);
        }
    },

    kill: function ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }
});
