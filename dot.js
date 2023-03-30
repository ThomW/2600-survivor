var Dot = new Phaser.Class({

    Extends: Phaser.Physics.Arcade.Image,

    initialize:

    function Dot (scene, onObj, imageKey, soundKey, value)
    {
        Phaser.Physics.Arcade.Image.call(this, scene, 0, 0, imageKey);

        this.setBlendMode(1);
        this.setDepth(10);
        
        this.sound = scene.game.sound.add(soundKey);

        this.value = value;

        this.setScale(2);

        this.setPosition(onObj.x, onObj.y);

        this.setActive(true);
        this.setVisible(true);
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
