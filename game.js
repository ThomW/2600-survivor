class Survivor extends Phaser.Scene
{

    constructor ()
    {
        super();

        this.player = null;

        this.sounds = [];

        this.level = 2;

        this.points = 0;
        this.targetPoints = 10;

        this.spawnCooldown = 0;
    }

    preload ()
    {
        this.load.bitmapFont('atari', 'fonts/8bit.png', 'fonts/8bit.xml');

        this.load.image('tank', 'img/tank.png');
        this.load.image('plane', 'img/plane.png');
        this.load.image('shot', 'img/shot.png');

        this.load.spritesheet('coin', 'img/coin.png', { frameWidth: 8, frameHeight: 8 });

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
      // Setup for rex postFX Plugin -- https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shader-glowfilter2/
      // Tweaker -- https://codepen.io/rexrainbow/pen/eYMjJMP 
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
      this.player = new Player(this, 400, 300, 'tank');
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

      this.tanks = this.physics.add.group({
        classType: Enemy,
        maxSize: 30,
        runChildUpdate: true
      });

      this.planes = this.physics.add.group({
        classType: Enemy,
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

      this.physics.add.collider(this.player.bullets, this.tanks, null, function (bulletObj, tankObj) {

        this.dots.create(tankObj, 'coin', 'pm-dot-hit', 1);

        bulletObj.destroy();
        tankObj.destroy();

      }, this);

      this.physics.add.collider(this.player.bullets, this.planes, null, function (proj, tgt) {

        this.dots.create(tgt, 'coin', 'pm-dot-hit', 1);

        proj.destroy();
        tgt.destroy();

      }, this);

      this.physics.add.collider(this.player, this.dots, null, function (playerObj, dotObj) {
        dotObj.kill();
      }, this);

      // Game start
      this.setLevel(1);
    }

    increaseScore(points) {
      this.points += points;

      console.log(this.points, this.targetPoints);

      if (this.points >= this.targetPoints) {
        this.setLevel(this.level + 1);
      }
    }

    calcRange(arrRange, level) {
      const C_MAX = 1; const C_MIN = 0;
      
      // Calculate percentage, treating level as being a value from 1-10
      let pct = (level - 1) / 9;

      return  (arrRange[C_MAX] - arrRange[C_MIN]) * pct + arrRange[C_MIN];
    }
  
    setLevel(level) {
      this.level = level;
      this.points = 0;
      this.targetPoints = 10; // Scale with level? Yawn.

      this.player.timeToFire = this.calcRange([2000, 250], this.level);
      this.player.maxSpeed = this.calcRange([100, 500], this.level);
      this.player.turningSpeed = this.calcRange([0.5, 5], this.level);
    }

    update (time, delta)
    {
      if (this.points >= this.targetPoints) {
        this.setLevel(this.level + 1);
      }

      const { scrollX, scrollY } = this.cameras.main;

      this.player.update(delta, this.cursorKeys);

      // Draw the level progress bar
      this.progressBar.fillStyle(0x2d2d2d);
      this.progressBar.fillRect(0, 0, 800, 48);
      this.progressBar.fillStyle(0x2dff2d);
      this.progressBar.fillRect(0, 0, 800 * (this.points / this.targetPoints), 48);

      // Handle enemy spawning
      this.spawnCooldown -= delta;
      if (this.spawnCooldown <= 0) {

        // Rules for the various levels
        switch (this.level) {

          case 1: 
            this.spawnCooldown = 2000;

            var tank = this.tanks.create('tank');
            tank.speed = 30;

            break;

          case 2:
            this.spawnCooldown = 1500;

            var plane = this.planes.create('plane');
            plane.speed = 30;

            break;

          case 3:
            this.spawnCooldown = 100;
            
            // TODO: Refactor this ... 
            let enemy = this.pGhosts.get();  
            if (enemy)
            {
              enemy.spawn();
            }
            break;

          case 3:
            break;
    

          default:
            break;

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
      debug: false
    }
  } 
};

const game = new Phaser.Game(config);
