var EnemyPlane = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function EnemyPlane (scene, imageKey)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, imageKey);

        this.setDepth(10);
        this.setScale(1);

        // Calculate spawn point of new enemy along the edges of the screen
        var halfWidth = (this.scene.cameras.main.width * 0.5) + 20;
        var playerX = this.scene.player.x;
        var halfHeight = (this.scene.cameras.main.height * 0.5) + 20;
        var playerY = this.scene.player.y;

        var x, y;
        if (Phaser.Math.Between(0, 1)) {
            x = playerX - halfWidth;
            this.rotation = 0;
        } else {
            x = playerX + halfWidth;
            this.rotation = Math.PI;
            this.flipY = true;
        }
        
        y = Phaser.Math.Between(playerY - halfHeight, playerY + halfHeight);

        let colors = [ 0xff0000, 0x75FF33, 0xffff00, 0xFFBD33 ];
        this.tint = colors[this.scene.planes.getTotalUsed() % colors.length];


        // this.tint = Phaser.Math.RND.pick([);

        this.setPosition(x, y);

        this.setActive(true);
        this.setVisible(true);
    },

    update: function (time, delta)
    {
        // Dead simple method to move planes
        this.x += (this.speed / delta) * (this.rotation == 0 ? 1 : -1);

        // Wrap the planes in the screen
        var playerX = this.scene.player.x;        
        var sceneWidth = this.scene.cameras.main.width;
        var sceneHeight = this.scene.cameras.main.height;
        var halfWidth = sceneWidth * 0.5;

        if (this.rotation == 0) {
            if (this.x > playerX + halfWidth) {
                this.x -= sceneWidth;
            }
        } else {
            if (this.x < playerX - halfWidth) {
                this.x += sceneWidth;
            }
        }

        var playerY = this.scene.player.y;
        if (this.y > playerY + sceneHeight * 0.5) {
            this.y -= sceneHeight;
        }
        else if (this.y < playerY - sceneHeight * 0.5) {
            this.y += sceneHeight;
        }

    },

    kill: function ()
    {
        this.setActive(false);
        this.setVisible(false);
        this.body.stop();
    }
});
