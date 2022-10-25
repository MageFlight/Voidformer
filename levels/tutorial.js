console.log("In tutuorial")
console.log(Platform);
// Game Size: 1920 x 1080
const GAME_WIDTH = 30;
const GAME_HEIGHT = 17;

// ---===[BOTTOM LEFT CORNER IS 0, 0, AND POSITIONS ARE TOP LEFT BASED]===---
const lvlTutorial = {
	background: "stars",
	sprites: [
		{
			type: Player,
			data: {
				spawn: {
					x: 6,
					y: 4
				},
				texture: "normal"
			}
		},
		{
			type: Platform,
			data: {
				x: 0,
				y: 2,
				w: 26,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Hologram,
			data: {
				x: 5,
				y: 6,
				fontSize: 34,
				text: "Use WASD and Space or the arrow keys to move."
			}
		},
		{
			type: Platform,
			data: {
				x: 30,
				y: 5,
				w: 5,
				h: 5,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 40,
				y: 8,
				w: 5,
				h: 8,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 48,
				y: 1,
				w: 30,
				h: 1,
				texture: "moon"
			}
		},
		{ // Top Roof
			type: Platform,
			data: {
				x: 54,
				y: GAME_HEIGHT,
				w: 41,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Hologram,
			data: {
				x: 57,
				y: 5,
				fontSize: 34,
				text: "Press Shift to reverse gravity!"
			}
		},
		{
			type: Platform,
			data: {
				x: 74,
				y: GAME_HEIGHT,
				w: 4,
				h: 5,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 90,
				y: GAME_HEIGHT - 2,
				w: 5,
				h: 4,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 100,
				y: GAME_HEIGHT,
				w: 5,
				h: 9,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 110,
				y: GAME_HEIGHT,
				w: 5,
				h: 9,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 120,
				y: GAME_HEIGHT,
				w: 33,
				h: Math.round(GAME_HEIGHT / 2),
				texture: "moon"
			}
		},
		{
			type: Hologram,
			data: {
				x: 126,
				y: 4,
				fontSize: 34,
				text: "Make sure to walk through the teleporters!"
			}
		},
		{
			type: Platform,
			data: {
				x: 135,
				y: 2,
				w: 100,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Checkpoint,
			data: {
				x: 145,
				y: 4,
				texture: "teleporter"
			}
		},
		{
			type: Hologram,
			data: {
				x: 158,
				y: 6,
				fontSize: 34,
				text: "Avoid the spikes!"
			}
		},
		{
			type: Spike,
			data: {
				x: 163,
				y: 3,
				w: 2,
				h: 1,
				texture: "stalagmite"
			}
		},
		{
			type: Spike,
			data: {
				x: 179,
				y: 3,
				w: 30,
				h: 1,
				texture: "stalagmite"	
			}
		},
		{
			type: Platform,
			data: {
				x: 180,
				y: 6,
				w: 7,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 192,
				y: 8,
				w: 7,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 202,
				y: 6,
				w: 6,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Hologram,
			data: {
				x: 215,
				y: 6,
				fontSize: 34,
				text: "You can reverse gravity in midair one time before touching the ground."
			}
		},
		{
			type: Spike,
			data: {
				x: 234,
				y: 4,
				w: 1,
				h: 2,
				texture: "stalagmite"
			}
		},
		{
			type: Platform,
			data: {
				x: 236,
				y: GAME_HEIGHT,
				w: 50,
				h: 4,
				texture: "moon"
			}
		},
		{
			type: Spike,
			data: {
				x: 250,
				y: GAME_HEIGHT - 4,
				w: 2,
				h: 2,
				texture: "stalactite"
			}
		},
		{
			type: Platform,
			data: {
				x: 262,
				y: GAME_HEIGHT - 4,
				w: 1,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Platform,
			data: {
				x: 263,
				y: GAME_HEIGHT - 4,
				w: 3,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Spike,
			data: {
				x: 264,
				y: GAME_HEIGHT - 6,
				w: 1,
				h: 1,
				texture: "stalactite"
			}
		},
		{
			type: Platform,
			data: {
				x: 266,
				y: GAME_HEIGHT - 4,
				w: 1,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Spike,
			data: {
				x: 285,
				y: GAME_HEIGHT - 4,
				w: 1,
				h: 3,
				texture: "stalactite"
			}
		},
		{
			type: Platform,
			data: {
				x: 292,
				y: 2,
				w: 60,
				h: 3,
				texture: "moon"
			}
		},
		{
			type: Hologram,
			data: {
				x: 314,
				y: 4,
				fontSize: 34,
				text: "Get in the rocket to finish the level!"
			}
		},
		{
			type: Goal,
			data: {
				x: 326,
				y: 10,
				texture: "rocket"
			}
		},
		{
			type: Platform,
			data: {
				x: 336,
				y: GAME_HEIGHT,
				w: 3,
				h: GAME_HEIGHT - 2,
				texture: "moon"
			}
		},
	],
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
				},
				default: "normal"
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
				tileSize: 64
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
				tileSize: 64
			},
			stalactite: {
				type: "tiledTex",
				src: [
					"assets/spike/moonRock.svg"
				],
				rotation: 180, // rotation is measured in degrees
				tileDir: 'hor',
				tileSize: 64
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
				},
				default: "inactive"
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