var Coin = new Phaser.Class({

    Extends: Dot,

    initialize:

    function Coin (scene, onObj, imageKey = 'coin', soundKey = null, value = 1)
    {
        Dot.call(this, scene, 0, 0, imageKey);

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers(imageKey, { frames: [ 0, 1, 2, 3, 2, 1] }),
            frameRate: 8,
            repeat: -1
        });

        this.play('idle');
    },

    kill: function ()
    {
        this.scene.increaseScore(this.value);

        this.sound.play();
    
        this.setActive(false);
        this.setVisible(false);
        
        this.body.stop();

        this.destroy();
    }

});
