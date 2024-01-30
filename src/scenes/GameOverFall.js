import Phaser from '../lib/phaser.js'

export default class GameOverFall extends Phaser.Scene
{
	constructor()
	{
		super('game-over-fall')
	}

	create()
	{
		const width = this.scale.width
		const height = this.scale.height

		this.add.text(width * 0.5, height * 0.5, 'Ви впали!', {
			fontSize: 48
		})
        .setOrigin(0.5)
        this.add.text(width * 0.5, height * 0.5 +60, 'Натисніть SPACE!', {
			fontSize: 48
		})
		.setOrigin(0.5)

		this.input.keyboard.once('keydown-SPACE', () => {
			this.scene.start('game')
		})
	}
} 