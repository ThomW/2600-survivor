class Survivor extends Phaser.Scene
{

    constructor ()
    {
        super();
        this.iter = 0;
        this.crtPipeline = null;

        this.sounds = [];

        this.level = 1;

        this.points = 0;
        this.targetPoints = 10;
    }

    preload ()
    {
        this.load.bitmapFont('atari', 'fonts/8bit.png', 'fonts/8bit.xml');

        this.load.image('player', 'img/player.png');
        this.load.image('shot', 'img/shot.png');

        this.load.spritesheet('p-man', 'img/p-man.png', { frameWidth: 9, frameHeight: 9 });
        this.load.spritesheet('p-ghost', 'img/p-ghost.png', { frameWidth: 10, frameHeight: 10 });
        this.load.image('p-dot', 'img/p-dot.png');

        this.load.spritesheet('et', 'img/et.png', { frameWidth: 32, frameHeight: 32 });

        this.load.spritesheet('a-bat', 'img/a-bat.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('a-dragon', 'img/a-dragon.png', { frameWidth: 32, frameHeight: 48 });

        this.load.audio('player_move', 'audio/tank-move.wav');
        this.load.audio('player_fire', 'audio/tank-fire.wav');

        this.load.audio('pm-dot-hit', 'audio/pm-dot.wav');

        this.load.plugin('rexhorrifipipelineplugin', 'lib/rexhorrifipipelineplugin.min.js', true);
    }

    create ()
    {
      // Setup for rex postFX Plugin
      var postFxPlugin = this.plugins.get('rexhorrifipipelineplugin');
      var postFxPipeline = postFxPlugin.add(this.cameras.main, {
          enable: true,

          // Bloom
          bloomEnable: true,
          bloomRadius: 0.1,
          bloomIntensity: 0.9,
          bloomThreshold: 0.9,
          bloomTexelWidth: 0.1,
          bloomTexelHeight: 0.1,

          // Chromatic abberation
          chromaticEnable: false,
          chabIntensity: 0.125,

          // Vignette
          vignetteEnable: false,
          vignetteStrength: 0.9,
          vignetteIntensity: 0.125,

          // Noise
          noiseEnable: false,
          noiseStrength: 0.1,
          // seed: 0.5,

          // VHS
          vhsEnable: false,
          vhsStrength: 0.5,

          // Scanlines
          scanlinesEnable: false,
          scanStrength: 0.125,

          //CRT
          crtEnable: false,
          crtWidth: 4,
      });

      // Add the progress bar and keep it stationary at the top of the screen
      this.progressBar = this.add.graphics();
      this.progressBar.setScrollFactor(0);

      // This will probably change, but since it helps show player movement, keep it...
      this.add.bitmapText(400, 128, 'atari', '2600 SURVIVOR').setOrigin(0.5).setScale(2);

      // Setup player
      this.player = new Tank(this, 400, 300, 'player');
      this.add.existing(this.player);
      this.physics.add.existing(this.player);
      this.player.configure(this);

      this.player.setMovementSound(this.sound.add('player_move'));
      this.player.setFireSound(this.sound.add('player_fire'));

      this.cursorKeys = this.input.keyboard.createCursorKeys();

      this.cameras.main.startFollow(this.player);

      // Setup pools for enemies
      this.pGhosts = this.physics.add.group({
        classType: PGhost,
        maxSize: 30,
        runChildUpdate: true
      });

      this.dots = this.physics.add.group({
        classType: Dot,
        maxSize: 100
      });

      this.physics.add.collider(this.player.bullets, this.pGhosts, null, function (bulletObj, ghostObj) {

        this.dots.create(ghostObj, 'p-dot', 'pm-dot-hit', 1);

        bulletObj.kill();
        ghostObj.kill();

      }, this);

      this.physics.add.collider(this.player, this.dots, null, function (playerObj, dotObj) {
        dotObj.kill();
      }, this);

    }

    increaseScore(points) {
      this.points += points;

      console.log(this.points, this.targetPoints);

      if (this.points >= this.targetPoints) {
        this.setLevel(this.level + 1);
      }
    }

    setLevel(level) {
      this.points -= this.targetPoints;
      this.targetPoints = this.level * 100;
    }

    update (time, delta)
    {
      if (this.points >= this.targetPoints) {
        this.setLevel(this.level + 1);
      }

      const { scrollX, scrollY } = this.cameras.main;

      this.player.update(delta, this.cursorKeys);

      this.iter += 0.01;

      // Draw the level progress bar
      this.progressBar.fillStyle(0x2d2d2d);
      this.progressBar.fillRect(0, 0, 800, 48);

      this.progressBar.fillStyle(0x2dff2d);




      this.progressBar.fillRect(0, 0, 800 * (this.points / this.targetPoints), 48);

      // Rules for the various levels
      if (this.level == 1) {

        let enemy = this.pGhosts.get();  
        if (enemy)
        {
          enemy.spawn();
        }

      }

    }
}

const config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  parent: 'phaser-game',
  pixelArt: true,
  scene: [ Survivor ],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: true
    }
  } 
};

const game = new Phaser.Game(config);
