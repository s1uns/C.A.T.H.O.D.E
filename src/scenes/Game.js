import Phaser from "../lib/phaser.js";

import Gold from "../game/Gold.js";
import Radiation from "../game/Radiation.js";
import Lifes from "../game/Lifes.js";

export default class Game extends Phaser.Scene {
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;

  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;

  /** @type {Phaser.Physics.Arcade.Group} */
  gold;

  goldCollected = 0;

  /** @type {Phaser.GameObjects.Text} */
  goldCollectedText;
  LifesText;

  /** @type {Phaser.Physics.Arcade.Group} */
  Radiation;
  lifes;

  numberOfLife = 1;

  constructor() {
    super("game");
  }

  init() {
    this.goldCollected = 0;
    this.numberOfLife = 1;
  }
  
  preload() {
    this.load.image("background", "assets/bg_layer1.png");
    this.load.image("platform", "assets/ground.png");
    this.load.image("robot-stand", "assets/robot_stand.png");
    this.load.image("robot-jump", "assets/robot_jump.png");
    this.load.image("gold", "assets/Au_1.png");
    this.load.image("radiation", "assets/radiation.png");
    this.load.image("lifes", "assets/battery.png");

    this.load.audio("jump", "assets/phaseJump1.ogg");

    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    this.platforms = this.physics.add.staticGroup();

    // then create 5 platforms from the group
    for (let i = 0; i < 5; ++i) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      /** @type {Phaser.Physics.Arcade.StaticBody} */
      const body = platform.body;
      body.updateFromGameObject();
    }

    this.player = this.physics.add
      .sprite(240, 320, "robot-stand")
      .setScale(0.5);

    this.physics.add.collider(this.platforms, this.player);

    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    this.cameras.main.startFollow(this.player);
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    this.gold = this.physics.add.group({
      classType: Gold,
    });

    this.radiation = this.physics.add.group({
      classType: Radiation,
    });
    this.lifes = this.physics.add.group({
      classType: Lifes,
    });

    this.physics.add.collider(this.platforms, this.gold);
    this.physics.add.collider(this.platforms, this.radiation);
    this.physics.add.collider(this.platforms, this.lifes);
    this.physics.add.overlap(
      this.player,
      this.gold,
      this.handleCollectGold,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.radiation,
      this.handleCollectRadiation,
      undefined,
      this
    );
    this.physics.add.overlap(
      this.player,
      this.lifes,
      this.handleCollectLife,
      undefined,
      this
    );

    this.goldCollectedText = this.add
      .text(160, 10, "Знайдено золота: 0", { color: "#000", fontSize: 24 })
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
    this.LifesText = this.add
      .text(400, 10, "Життя: 3", { color: "#000", fontSize: 24 })
      .setScrollFactor(0)
      .setOrigin(0.5, 0);
  }
   
  

  update(t, dt) {
    if (!this.player) {
      return;
    }

    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;

      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 100);
        platform.body.updateFromGameObject();
      if (Phaser.Math.Between(0, 10) == 4 || Phaser.Math.Between(0, 10) == 5 || Phaser.Math.Between(0, 10) == 6)  {
        this.addGoldAbove(platform);
      } 
      else if (Phaser.Math.Between(0, 10) == 1 || Phaser.Math.Between(0, 10) == 2) {
        this.addRadiationAbove(platform);
      }
      else   if (Phaser.Math.Between(0, 10) == 3 || Phaser.Math.Between(0, 10) == 7) {
        this.addLifeAbove(platform);
      }
      }
    });

    const touchingDown = this.player.body.touching.down;

    if (touchingDown) {
      this.player.setVelocityY(-325);
      this.player.setTexture("robot-jump");

      this.sound.play("jump");
    }

    const vy = this.player.body.velocity.y;
    if (vy > 0 && this.player.texture.key !== "robot-stand") {
      this.player.setTexture("robot-stand");
    }

    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    this.horizontalWrap(this.player);

    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start("game-over-fall");
    }
    if (this.numberOfLife == 0){
      this.scene.start("game-over-life");
    }
  }

  /**
   *
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  /**
   *
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  addGoldAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const gold = this.gold.get(sprite.x, y, "gold");

    gold.setActive(true);
    gold.setVisible(true);

    this.add.existing(gold);

    gold.body.setSize(gold.width, gold.height);

    this.physics.world.enable(gold);

    return gold;
  }

  /**
   *
   * @param {Phaser.GameObjects.Sprite} sprite
   */
  addRadiationAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const radiation = this.radiation.get(sprite.x, y, "radiation");

    radiation.setActive(true);
    radiation.setVisible(true);

    this.add.existing(radiation);

    radiation.body.setSize(radiation.width, radiation.height);

    this.physics.world.enable(radiation);

    return radiation;
  }
  addLifeAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const lifes = this.lifes.get(sprite.x, y, "lifes");

    lifes.setActive(true);
    lifes.setVisible(true);

    this.add.existing(lifes);

    lifes.body.setSize(lifes.width, lifes.height);

    this.physics.world.enable(lifes);

    return lifes;
  }

  /**
   *
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Gold} gold
   */
  handleCollectGold(player, gold) {
    this.gold.killAndHide(gold);

    this.physics.world.disableBody(gold.body);

    this.goldCollected++;

    this.goldCollectedText.text = `Знайдено золота: ${this.goldCollected}`;
  }

  /**
   *
   * @param {Phaser.Physics.Arcade.Sprite} player
   * @param {Gold} gold
   */
  handleCollectRadiation(player, radiation) {
    this.radiation.killAndHide(radiation);

    this.physics.world.disableBody(radiation.body);

    this.numberOfLife--;

    this.goldCollectedText.text = `Знайдено золота: ${this.goldCollected}`;
    this.LifesText.text = `Життя: ${this.numberOfLife}`
    
  }
  handleCollectLife(player, lifes) {
    this.lifes.killAndHide(lifes);

    this.physics.world.disableBody(lifes.body);

    this.numberOfLife++;

    this.goldCollectedText.text = `Знайдено золота: ${this.goldCollected}`;
    this.LifesText.text = `Життя: ${this.numberOfLife}`
  }
  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];

    for (let i = 1; i < platforms.length; ++i) {
      const platform = platforms[i];

      // discard any platforms that are above current
      if (platform.y < bottomPlatform.y) {
        continue;
      }

      bottomPlatform = platform;
    }

    return bottomPlatform;
  }
  
}
