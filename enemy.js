var Enemy = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function Enemy (scene, imageKey)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, imageKey);

        this.setDepth(10);
        this.setScale(1);

        this.speed = 90;

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

        this.tint = Phaser.Math.RND.pick([0x880000, 0x008800, 0x008888 ]);

        this.setPosition(x, y);

        this.setActive(true);
        this.setVisible(true);
    },

    update: function (time, delta)
    {
      radians = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.body.x, this.scene.player.body.y);
      degrees = radians * (180 / Math.PI);
      
      this.rotation = radians;
      
      this.scene.physics.velocityFromAngle(degrees,
        this.speed,
        this.body.velocity);
    },

    kill: function ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }
});
