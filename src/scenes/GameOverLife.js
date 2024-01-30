import Phaser from '../lib/phaser.js'

export default class GameOverLife extends Phaser.Scene
{
	constructor()
	{
		super('game-over-life')
	}

	create()
	{
		const width = this.scale.width
		const height = this.scale.height

		this.add.text(width * 0.5, height * 0.5, 'Життя закінчилися!', {
			fontSize: 44
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