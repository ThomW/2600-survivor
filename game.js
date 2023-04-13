class Survivor extends Phaser.Scene
{

    constructor ()
    {
        super();

        this.player = null;

        this.sounds = [];

        this.level = null;
        this.levelText = null;

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

        this.load.spritesheet('adv-bat', 'img/a-bat.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('adv-dragon', 'img/a-dragon.png', { frameWidth: 10, frameHeight: 20 });

        this.load.spritesheet('brz', 'img/brz.png', { frameWidth: 8, frameHeight: 8 });
        this.load.spritesheet('brz-otto', 'img/brz-otto.png', { frameWidth: 8, frameHeight: 10 });

        this.load.audio('player_move', 'audio/tank-move.wav');
        this.load.audio('player_fire', 'audio/tank-fire.wav');

        this.load.audio('pm-dot-hit', 'audio/pm-dot.wav');

        // From https://rexrainbow.github.io/phaser3-rex-notes/docs/site/virtualjoystick/
        this.load.plugin('rexvirtualjoystickplugin', 'lib/rexvirtualjoystickplugin.min.js', true);
        this.load.plugin('rexhorrifipipelineplugin', 'lib/rexhorrifipipelineplugin.min.js', true);

        for (var n = 0; n <= 5; n++) {
          this.load.spritesheet('inv-' + n, 'img/inv-' + n + '.png', { frameWidth: 32, frameHeight: 32 });
        }

        for (var n = 0; n < 10; n++) {
          this.load.image('background-' + n, 'img/background-' + n + '.png');
          this.load.audio('background-' + n, 'audio/background-' + n + '.wav');
        }

        for (var n = 1; n <= 3; n++) {
          this.load.image('rock-' + n, 'img/rock-' + n + '.png');
        }
    }

    create ()
    {
      // Setup for rex postFX Plugin -- https://rexrainbow.github.io/phaser3-rex-notes/docs/site/shader-glowfilter2/
      // Tweaker -- https://codepen.io/rexrainbow/pen/eYMjJMP 
      var postFxPlugin = this.plugins.get('rexhorrifipipelineplugin');
      var postFxPipeline = postFxPlugin.add(this.cameras.main, {
          enable: false,

          // Bloom
          bloomEnable: false,
          bloomRadius: 0.1,
          bloomIntensity: 0.9,
          bloomThreshold: 0.9,
          bloomTexelWidth: 0.1,
          bloomTexelHeight: 0.1,

          // Chromatic abberation
          chromaticEnable: false,
          chabIntensity: 0.125,

          // Vignette
          vignetteEnable: true,
          vignetteStrength: 5,
          vignetteIntensity: 0.125,

          // Noise
          noiseEnable: true,
          noiseStrength: 0.05,
          // seed: 0.5,

          // VHS
          vhsEnable: true,
          vhsStrength: 0.1,

          // Scanlines
          scanlinesEnable: true,
          scanStrength: 0.125,

          //CRT
          crtEnable: true,
          crtWidth: 10,
      });

      this.background = this.add.tileSprite(400, 300, 800, 600, 'background-1');
      this.background.setOrigin(0.5);
      this.background.setScale(10);

      this.backgroundSound = null;

      if ('ontouchstart' in document.documentElement) {
        this.joyStick = this.plugins.get('rexvirtualjoystickplugin').add(this, {
          x: 100,
          y: 400,
          radius: 100,
          base: this.add.circle(0, 0, 100, 0x888888).setAlpha(0.5),
          thumb: this.add.circle(0, 0, 50, 0xcccccc).setAlpha(0.25),
          // dir: '8dir',   // 'up&down'|0|'left&right'|1|'4dir'|2|'8dir'|3
          // forceMin: 16,
          enable: true,
        });
      } else {
        this.joyStick = null;
      }

      // Add the progress bar and keep it stationary at the top of the screen
      this.progressBar = this.add.graphics();
      this.progressBar.setScrollFactor(0);

      // This will probably change, but since it helps show player movement, keep it...
      this.add.bitmapText(400, 128, 'atari', '2600 SURVIVOR').setOrigin(0.5).setScale(2);

      this.levelText = this.add.bitmapText(790, 22, 'atari', 'LEVEL 1').setOrigin(1, 0.5).setScale(1);
      this.levelText.setScrollFactor(0);

      // Setup player
      this.player = new Player(this, 400, 300, 'tank');
      this.add.existing(this.player);
      this.physics.add.existing(this.player);
      this.player.configure(this);

      this.player.setFireSound(this.sound.add('player_fire'));

      this.cursorKeys = this.input.keyboard.createCursorKeys();

      this.cameras.main.startFollow(this.player);

      // Setup sounds that are used by multiple things...
      this.sounds['dot-hit'] = this.sound.add('pm-dot-hit');

      // Create a container that contains all of the enemies in the game
      this.enemies = this.physics.add.group();

      // Setup pools for enemies
      this.pGhosts = this.physics.add.group({
        classType: PGhost,
        maxSize: 10,
        runChildUpdate: true
      });

      this.tanks = this.physics.add.group({
        classType: Enemy,
        maxSize: 10,
        runChildUpdate: true
      });

      this.planes = this.physics.add.group({
        classType: EnemyPlane,
        maxSize: 10,
        runChildUpdate: true
      });

      this.ets = this.physics.add.group({
        classType: Enemy,
        maxSize: 10,
        runChildUpdate: true
      });

      this.rocks = this.physics.add.group({
        classType: EnemyRock,
        maxSize: 15,
        runChildUpdate: true
      });

      this.invaders = this.physics.add.group({
        classType: Enemy,
        maxSize: 15,
        runChildUpdate: true
      });

      for (var n = 0; n <= 5; n++) {
        this.anims.create({
          key: 'invader-' + n + '-move',
          frames: 'inv-' + n,
          frameRate: 2,
          repeat: -1
        });
      }

      this.advDragons = this.physics.add.group({
        classType: Enemy,
        maxSize: 10,
        runChildUpdate: true
      });

      this.anims.create({
        key: 'adv-dragon-move',
        frames: this.anims.generateFrameNumbers('adv-dragon', { frames: [ 0, 1 ] }),
        frameRate: 2,
        repeat: -1
      });

      this.advBats = this.physics.add.group({
        classType: Enemy,
        maxSize: 10,
        runChildUpdate: true        
      });
      
      for (var n = 0; n <= 5; n++) {
        this.anims.create({
          key: 'adv-bat-move',
          frames: 'adv-bat',
          frameRate: 3,
          repeat: -1
        });
      }

      this.brzGuys = this.physics.add.group({
        classType: Enemy,
        maxSize: 10,
        runChildUpdate: true
      });
      
      for (var n = 0; n <= 5; n++) {
        this.anims.create({
          key: 'brz-move',
          frames: 'brz',
          frameRate: 3,
          repeat: -1
        });
      }

      this.brzOtto = this.physics.add.group({
        classType: Enemy,
        maxSize: 1,
        runChildUpdate: true
      });
      
      for (var n = 0; n <= 5; n++) {
        this.anims.create({
          key: 'brz-otto-move',
          frames: 'brz-otto',
          frameRate: 3,
          repeat: -1
        });
      }

      this.physics.add.collider(this.player.bullets, this.enemies, null, function (bulletObj, hitObj) {

        let dot = this.dots.get();
        if (dot) {
          dot.setPosition(hitObj.x, hitObj.y);
          dot.setTexture('coin');
          dot.setScale(2);
          dot.setSize(8, 8);
          dot.soundKey = 'pm-dot-hit';
          dot.value = 1;
        }

        this.enemies.remove(hitObj);

        hitObj.destroy();
        bulletObj.destroy();

      }, this); 

      this.dots = this.physics.add.group({
        classType: Dot,
        maxSize: 100
      });

      this.physics.add.collider(this.player, this.dots, null, function (playerObj, dotObj) {
        this.dots.remove(dotObj);
        dotObj.kill();
        dotObj.destroy();
      }, this);

      // Game start
      this.setLevel(1);
    }

    increaseScore(points) {
      this.points += points;

      if (this.points >= this.targetPoints) {
        this.setLevel(this.level + 1);
      }
    }

    calcRange(arrRange, level) {
      const C_MAX = 1; const C_MIN = 0;
      
      // Calculate percentage, treating level as being a value from 1-10
      let pct = (level - 1) / 9;

      // The .min will clamp values so they don't go over MAX
      return  Math.min(arrRange[C_MAX], (arrRange[C_MAX] - arrRange[C_MIN]) * pct + arrRange[C_MIN]);
    }
  
    setLevel(level) {
      this.level = level;
      this.points = 0;
      this.targetPoints = 10; // Scale with level? Yawn.

      this.player.timeToFire = this.calcRange([2000, 250], this.level);
      this.player.maxSpeed = this.calcRange([250, 500], this.level);
      this.player.turningSpeed = this.calcRange([1, 5], this.level);

      this.player.tint = [
        0xffff00      // 0/10 PM
        , 0x0000ff    // 1 TANK
        , 0xff0000    // 2 AIR
        , 0xA349A4    // 3 ET
        , 0xffffff    // 4 AST
        , 0xffffff    // 5 INV
        , 0x000000    // 6 ADV
        , 0xffffff    // 7 BRZ
        , 0x000000    // 8
        , 0x000000    // 9
      ][this.level % 10];

      this.background.setTexture('background-' + (this.level % 10));

      // Stop the current sound if one's playing
      if (this.backgroundSound != null) {
        this.backgroundSound.stop();
      }

      // Stay on the P-M sound if we get past level 10
      this.backgroundSound = this.sound.add('background-' + (this.level % 10));
      this.backgroundSound.setLoop(true);
      this.backgroundSound.play();

    }

    update (time, delta)
    {
      if (this.points >= this.targetPoints) {
        this.setLevel(this.level + 1);
      }

      const { scrollX, scrollY } = this.cameras.main;

      var virtualCursorKeys = null;
      if (this.joyStick) {
        virtualCursorKeys = this.joyStick.createCursorKeys();
      }

      this.player.update(delta, this.cursorKeys, virtualCursorKeys);

      // Draw the level progress bar
      this.progressBar.fillStyle(0x2d2d2d);
      this.progressBar.fillRect(0, 0, 800, 48);
      this.progressBar.fillStyle(0x2dff2d);
      this.progressBar.fillRect(0, 0, 800 * (this.points / this.targetPoints), 48);

      this.levelText.text = "LEVEL " + this.level;

      // Handle enemy spawning
      this.spawnCooldown -= delta;
      
      if (this.spawnCooldown <= 0) {

        // Rules for the various levels
        switch (this.level % 10) {

          case 1: 
            this.spawnCooldown = 2000;

            var tank = this.tanks.get('tank');
            if (tank) {
              tank.spriteRotates = true;
              tank.speed = 30;
              this.enemies.add(tank);
            }

            break;

          case 2:

            this.spawnCooldown = 750;

            var plane = this.planes.get('plane');
            if (plane) {
              plane.speed = 40;
              this.enemies.add(plane);
            }
            break;

          case 3:
            this.spawnCooldown = 750;

            var et = this.ets.create('et');
            if (et) {
              et.speed = 90;
              et.tint = Phaser.Math.RND.pick([0xABDD7D, 0xC2673F, 0xF08650, 0xF09B59]);
              this.enemies.add(et);
            }
            break;

          case 4:

            this.spawnCooldown = 750;

            var rock = this.rocks.create('rock');
            if (rock) {
              rock.speed = 90;
              rock.setTexture(Phaser.Math.RND.pick(['rock-1', 'rock-2']));
              rock.setSize(16, 16);
              rock.setScale(3);
              rock.tint = Phaser.Math.RND.pick([0xD8EA46, 0x69B7FF, 0xFC3DD8, 0xA1FA4F, 0x9FFCFD, 0xFFFD55, 0xEA3FF7, 0xFFFFFF]);
              this.enemies.add(rock);
            }
            break;

          // INV
          case 5:

            this.spawnCooldown = 250;

            var invader = this.invaders.create('invader');
            if (invader) {
              invader.speed = 90;
              invader.play('invader-' + Phaser.Math.Between(0, 5) + '-move');
              invader.tint = 0xA8A51A;
              this.enemies.add(invader);
            }
          break;

          // ADV
          case 6: {

            this.spawnCooldown = 250;

            let rng = Phaser.Math.RND.pick(['adv-bat', 'adv-dragon']);

            var baddie = this.invaders.create(rng);
            if (baddie) {
              baddie.speed = 90;
              baddie.play(rng + '-move');
              baddie.setScale(3);

              if (rng == 'adv-dragon') {
                baddie.tint = Phaser.Math.RND.pick([0xfbf236, 0x6abe30, 0xfbf236, 0x6abe30, 0xff0000]);
              }
              else {
                baddie.tint = 0x000000;
              }

              this.enemies.add(baddie);
            }
          }
          break;

          // BZK
          case 7: {

            this.spawnCooldown = 250;

            var otto = this.brzOtto.create();
            if (otto) {
              otto.speed = 90;
              otto.play('brz-otto-move');
              otto.setScale(4);
              otto.setSize(8, 8);
              otto.tint = 0xffff00;
              this.enemies.add(otto);
            }

            var baddie = this.brzGuys.create();
            if (baddie) {
              baddie.speed = 90;
              baddie.play('brz-move');
              baddie.setScale(4);
              baddie.setSize(8, 8);
              baddie.tint = 0xD2D240;
              this.enemies.add(baddie);
            }
          }
          break;
    
          // END GAME
          default:

            this.player.tint = 0xffff00;

            this.spawnCooldown = 100;
            
            let enemy = this.pGhosts.get();  
            if (enemy) {
              enemy.spawn();
              this.enemies.add(enemy);
            }
            break;
        }
      }
    }
}

const config = {
  type: Phaser.AUTO,
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
