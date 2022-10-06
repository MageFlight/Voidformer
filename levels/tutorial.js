// Game Size: 1920 x 1080
const GAME_WIDTH = 30;
const GAME_HEIGHT = 17;

// ---===[BOTTOM LEFT CORNER IS 0, 0, AND POSITIONS ARE TOP LEFT BASED]===---
const lvlTutorial = {
	background: "stars",
	spawn: {
		x: 6, // Default is 6
		y: 4
	},
	platforms: [
		{ // 0
			x: 0,
			y: 2,
			width: 26,
			height: 2,
			texture: "moon"
		},
		{
			x: 30,
			y: 5,
			width: 5,
			height: 5,
			texture: "moon"
		},
		{
			x: 40,
			y: 8,
			width: 5,
			height: 8,
			texture: "moon"
		},
		{
			x: 48,
			y: 1,
			width: 30,
			height: 1,
			texture: "moon"
		},
		{ // Top roof
			x: 54,
			y: GAME_HEIGHT,
			width: 41,
			height: 2,
			texture: "moon"
		},
		{
			x: 74,
			y: GAME_HEIGHT,
			width: 4,
			height: 5,
			texture: "moon"
		},
		{ // 5 - First Inverted part
			x: 90,
			y: GAME_HEIGHT - 2,
			width: 5,
			height: 4,
			texture: "moon"
		},
		{
			x: 100,
			y: GAME_HEIGHT,
			width: 5,
			height: 9,
			texture: "moon"
		},
		{
			x: 110,
			y: GAME_HEIGHT,
			width: 5,
			height: 9,
			texture: "moon"
		},
		{
			x: 120,
			y: GAME_HEIGHT,
			width: 33,
			height: Math.round(GAME_HEIGHT / 2),
			texture: "moon"
		},
		{
			x: 135,
			y: 2,
			width: 100,
			height: 2,
			texture: "moon"
		},
		{
			x: 180,
			y: 6,
			width: 7,
			height: 1,
			texture: "moon"
		},
		{
			x: 192,
			y: 8,
			width: 7,
			height: 1,
			texture: "moon"
		},
		{
			x: 202,
			y: 6,
			width: 6,
			height: 1,
			texture: "moon"
		},
		{
			x: 236,
			y: GAME_HEIGHT,
			width: 50,
			height: 4,
			texture: "moon"
		},
		{
			x: 262,
			y: GAME_HEIGHT - 4,
			width: 1,
			height: 1,
			texture: "moon"
		},
		{
			x: 263,
			y: GAME_HEIGHT - 4,
			width: 3,
			height: 2,
			texture: "moon"
		},
		{
			x: 266,
			y: GAME_HEIGHT - 4,
			width: 1,
			height: 1,
			texture: "moon"
		},
		{
			x: 292,
			y: 2,
			width: 60,
			height: 3,
			texture: "moon"
		},
		{
			x: 336,
			y: GAME_HEIGHT,
			width: 3,
			height: GAME_HEIGHT - 2,
			texture: "moon"
		}
	],
	spikes: [
		{
			x: 163,
			y: 3,
			width: 2,
			height: 1,
			texture: "stalagmite"
		},
		{
			x: 179,
			y: 3,
			width: 30,
			height: 1,
			texture: "stalagmite"
		},
		{
			x: 234,
			y: 4,
			width: 1,
			height: 2,
			texture: "stalagmite"
		},
		{
			x: 250,
			y: GAME_HEIGHT - 4,
			width: 2,
			height: 2,
			texture: "stalactite"
		},
		{
			x: 264,
			y: GAME_HEIGHT - 6,
			width: 1,
			height: 1,
			texture: "stalactite"
		},
		{
			x: 285,
			y: GAME_HEIGHT - 4,
			width: 1,
			height: 3,
			texture: "stalactite"
		}
	],
	holograms: [
		{
			x: 5,
			y: 6,
			fontSize: 34,
			text: "Use WASD and Space or the arrow keys to move."
		},
		{
			x: 57,
			y: 5,
			fontSize: 34,
			text: "Press Shift to reverse gravity!"
		},
		{
			x: 158,
			y: 6,
			fontSize: 34,
			text: "Avoid the spikes!"
		}, {
			x: 215,
			y: 6,
			fontSize: 34,
			text: "You can reverse gravity in midair one time before touching the ground."
		},
		{
			x: 126,
			y: 4,
			fontSize: 34,
			text: "Make sure to walk through the teleporters!"
		},
		{
			x: 314,
			y: 4,
			fontSize: 34,
			text: "Get in the rocket to finish the level!"
		}
	],
	checkpoints: [ // Checkpoints are 2x2
		{
			x: 145,
			y: 4,
			texture: "teleporter"
		}
	],
	goal: { // Goal is 8x8
		x: 326,
		y: 10,
		texture: "rocket"
	},
	maxScroll: 339,

	textures: {
		player: {
			normal: {
				type: "multiStateTex",
				states: {
					normal: {
						type: "staticTex",
						src: "assets/player/restingNormal.svg"
					},
					inverted: {
						type: "staticTex",
						src: "assets/player/restingInverted.svg"
					}
				}
			}
		},
		platform: {
			moon: {
				type: "tiledTex",
				src: [
					"assets/platforms/moonGround0.svg",
					"assets/platforms/moonGround1.svg",
					"assets/platforms/moonGround2.svg",
					"assets/platforms/moonGround3.svg",
					"assets/platforms/moonGround4.svg",
					"assets/platforms/moonGround5.svg"
				],
				rotation: -1, // rotation -1 means random rotation
				tileDir: "all",
				tileSize: 1
			}
		},
		spike: {
			stalagmite: {
				type: "tiledTex",
				src: [
					"assets/spike/moonRock.svg"
				],
				rotation: 0,
				tileDir: 'hor',
				tileSize: 1
			},
			stalactite: {
				type: "tiledTex",
				src: [
					"assets/spike/moonRock.svg"
				],
				rotation: 180, // rotation is measured in degrees
				tileDir: 'hor',
				tileSize: 1
			}
		},
		checkpoint: {
			teleporter: {
				type: "multiStateTex",
				states: {
					inactive: {
						type: "staticTex",
						src: "assets/checkpoint/inactive.svg"
					},
					active: {
						type: "staticTex",
						src: "assets/checkpoint/active.svg"
					}
				}
			}
		},
		goal: {
			rocket: {
				type: "staticTex",
				src: "assets/goal/rocket.svg"
			}
		},
		background: {
			stars: {
				type: "staticTex",
				src: "assets/background/stars.svg"
			}	
		}
	}
};