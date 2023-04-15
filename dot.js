var Dot = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Sprite,

    initialize:

    function Dot (scene, onObj, imageKey, soundKey, value)
    {
        Phaser.Physics.Arcade.Sprite.call(this, scene, 0, 0, imageKey);

        // this.setBlendMode(1);
        this.setDepth(10);
        
        this.soundKey = soundKey;

        this.value = value;

        this.setScale(2);

        this.setPosition(onObj.x, onObj.y);

        this.setActive(true);
        this.setVisible(true);
    },

    kill: function ()
    {
        this.scene.increaseScore(this.value);

        this.scene.sounds['dot-hit'].play();
    
        this.setActive(false);
        this.setVisible(false);
        
        this.body.stop();
    }

});
