import Phaser from './lib/phaser.js'

import Game from './scenes/Game.js'
import GameOverFall from './scenes/GameOverFall.js'
import GameOverLife from './scenes/GameOverLife.js'

export default new Phaser.Game({
	type: Phaser.AUTO,
	width: 480,
	height: 640,
	scene: [Game, GameOverFall, GameOverLife],
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				y: 200
			},
			debug: false
		}
	}
})