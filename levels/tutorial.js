console.log("In tutuorial")
console.log(Platform);
// Game Size: 1920 x 1080

// const GW = 30;
// const GH = 17;

class Level {
	constructor() {
	}

	async root() {
	}
}

class TutorialLevel extends Level {
	constructor() {
		super();
	}
	
	async platform(position, size, name) {
		log(JSON.stringify(size));
		const texture = await TiledTexture.create(
			size,
			[
				"assets/platforms/moonGround0.svg",
				"assets/platforms/moonGround1.svg",
				"assets/platforms/moonGround2.svg",
				"assets/platforms/moonGround3.svg",
				"assets/platforms/moonGround4.svg",
				"assets/platforms/moonGround5.svg",
			],
			64,
			-1,
			true,
			true
		);
		log("Finished creating TiledTex");

		return [
			new Platform(position, size, name)
				.addChild(new AABB(Vector2.zero(), size, true, name + "Collider"))
				.addChild(new TextureRect(Vector2.zero(), size, texture, name))
		];
	}

	async spike(position, size, isInverted, name) {
		const texture = await TiledTexture.create(
			size,
			[
				"assets/spike/moonRock.svg"
			],
			64,
			isInverted * 180,
			true,
			false
		);

		return [
			new Spike(position, size, name)
				.addChild(new AABB(Vector2.zero(), size, true, name + "Collider"))
				.addChild(new TextureRect(Vector2.zero(), size, texture, name + "Texture"))
		]
	}

	async checkpoint(position, name) {
		const texture = await MultiStateTex.create(
			{
				inactive: await ImageTexture.create("assets/checkpoint/inactive.svg"),
				active: await ImageTexture.create("assets/checkpoint/active.svg")
			}, "inactive"
		);

		return [
			new Checkpoint(position, name)
				.addChild(new AABB(Vector2.zero(), Checkpoint.SIZE, true, name + "Collider"))
				.addChild(new TextureRect(Vector2.zero(), Checkpoint.SIZE, texture, name + "Texture"))
		]
	}

	async root() {
		const backgroundTexture = await ImageTexture.create("assets/background/stars.svg");
		// const playerTex = await ImageTexture.create("assets/player/restingNormalTest.svg");
		const playerTex = await MultiStateTex.create({
			normal: await ImageTexture.create("assets/player/restingNormalV2.svg"),
			inverted: await ImageTexture.create("assets/player/restingInvertedV2.svg"),
			levelFinish: await ImageTexture.create("assets/player/levelFinishNormalV2.svg")
		}, "normal");
		const rocketTexture = await ImageTexture.create("assets/goal/rocket.svg");

		return [
			new CanvasLayer(new Transform(), "background")
				.addChild(new TextureRect(Vector2.zero(), new Vector2(Utils.gameWidth, Utils.gameHeight), backgroundTexture, "backgroundImage")),
			// Beginning Section
			await this.platform(Vector2.levelPositionVector2(0, 2), Vector2.levelVector2(26, 2), "platform"),
			new Hologram(Vector2.levelPositionVector2(5, 6), "Use A/D to move, and Space to jump!", 50, "#fff", "movementHologram"),
			await this.platform(Vector2.levelPositionVector2(30, 5), Vector2.levelVector2(5, 5), "platform"),
			await this.platform(Vector2.levelPositionVector2(40, 8), Vector2.levelVector2(5, 8), "platform"),
			await this.platform(Vector2.levelPositionVector2(48, 1), Vector2.levelVector2(30, 1), "platform"),
			await this.platform(Vector2.levelPositionVector2(54, Utils.levelHeight), Vector2.levelVector2(41, 2), "platform"),
			// First Inverted Section
			new Hologram(Vector2.levelPositionVector2(57, 5), "Press Shift to reverse gravity!", 50, "#fff", "reverseGravityHologram"),
			await this.platform(Vector2.levelPositionVector2(74, Utils.levelHeight), Vector2.levelVector2(4, 5), "platform"),
			await this.platform(Vector2.levelPositionVector2(90, Utils.levelHeight - 2), Vector2.levelVector2(5, 4), "platform"),
			await this.platform(Vector2.levelPositionVector2(100, Utils.levelHeight), Vector2.levelVector2(5, 9), "platform"),
			await this.platform(Vector2.levelPositionVector2(110, Utils.levelHeight), Vector2.levelVector2(5, 9), "platform"),
			await this.platform(Vector2.levelPositionVector2(120, Utils.levelHeight), Vector2.levelVector2(33, 8), "platform"),
			// Teleporter Section
			new Hologram(Vector2.levelPositionVector2(126, 5), "Make sure to walk through the teleporters!", 50, "#fff", "teleporterReminderHologram"),
			await this.platform(Vector2.levelPositionVector2(135, 2), Vector2.levelVector2(100, 2), "platform"),
			await this.checkpoint(Vector2.levelPositionVector2(145, 4), "checkpoint"),
			// Spike Section
			new Hologram(Vector2.levelPositionVector2(158, 6), "Avoid the spikes!", 50, "#fff", "spikeWarningHologram"),
			await this.spike(Vector2.levelPositionVector2(163, 3), Vector2.levelVector2(2, 1), false, "spike"),
			await this.spike(Vector2.levelPositionVector2(179, 3), Vector2.levelVector2(30, 1), false, "spike"),
			await this.platform(Vector2.levelPositionVector2(180, 6), Vector2.levelVector2(7, 1), "platform"),
			await this.platform(Vector2.levelPositionVector2(191, 8), Vector2.levelVector2(7, 1), "platform"),
			await this.platform(Vector2.levelPositionVector2(202, 6), Vector2.levelVector2(6, 1), "platform"),
			// Midair Reverse Gravity Section
			new Hologram(Vector2.levelPositionVector2(215, 6), "You can reverse gravity in midair one time before touching the ground.", 50, "#fff", "midairGravityFlipHologram"),
			await this.spike(Vector2.levelPositionVector2(234, 4), Vector2.levelVector2(1, 2), false, "spike"),
			await this.platform(Vector2.levelPositionVector2(236, Utils.levelHeight), Vector2.levelVector2(55, 4), "platform"),
			await this.spike(Vector2.levelPositionVector2(250, Utils.levelHeight - 4), Vector2.levelVector2(2, 2), true, "spike"),
			await this.platform(Vector2.levelPositionVector2(262, Utils.levelHeight - 4), Vector2.levelVector2(1, 1), "platform"),
			await this.platform(Vector2.levelPositionVector2(263, Utils.levelHeight - 4), Vector2.levelVector2(3, 2), "platform"),
			await this.spike(Vector2.levelPositionVector2(264, Utils.levelHeight - 6), Vector2.levelVector2(1, 1), true, "spike"),
			await this.platform(Vector2.levelPositionVector2(266, Utils.levelHeight - 4), Vector2.levelVector2(1, 1), "platform"),
			await this.spike(Vector2.levelPositionVector2(290, Utils.levelHeight - 4), Vector2.levelVector2(1, 3), true, "spike"),
			// Home stretch to Rocket
			await this.platform(Vector2.levelPositionVector2(292, 2), Vector2.levelVector2(60, 3), "platform"),
			new Hologram(Vector2.levelPositionVector2(314, 4), "Get in the rocket to finish the level!", 50, "#fff", "rocketIndicatorHologram"),
			new Goal(Vector2.levelPositionVector2(326, 10), "goal")
				.addChild(new AABB(Vector2.zero(), Goal.SIZE, true, "goalCollider"))
				.addChild(new TextureRect(Vector2.zero(), Goal.SIZE, rocketTexture, "goalTexture")),
			await this.platform(Vector2.levelPositionVector2(336, Utils.levelHeight), Vector2.levelVector2(3, Utils.levelHeight - 2), "platform"),
			new Player(Vector2.levelPositionVector2(6, 4), "player")
				.addChild(new AABB(Vector2.zero(), Player.SIZE))
				.addChild(new TextureRect(Vector2.zero(), Player.SIZE, playerTex, "playerTex"))
				.addChild(new Camera(Vector2.zero(), Vector2.levelPositionVector2(339, 0), 625, 750, 0, 0, false, true, true, "playerCamera"))
		];
	}
}

/*
const tutorialLevel = {
	scenes: {
		platform: async (sceneData, scenes) => {
			log(JSON.stringify(sceneData.size));
			const texture = await TiledTexture.create(
				sceneData.size,
				[
					"assets/platforms/moonGround0.png",
					"assets/platforms/moonGround1.png",
					"assets/platforms/moonGround2.png",
					"assets/platforms/moonGround3.png",
					"assets/platforms/moonGround4.png",
					"assets/platforms/moonGround5.png",
			 	],
				64,
				-1,
				true,
				true
			);

			return [
				new Platform(sceneData.pos, sceneData.size, sceneData.name)
				  .addChild(new AABB(Vector2.zero(), sceneData.size))
					.addChild(new TextureRect(Vector2.zero(), sceneData.size, texture, sceneData.name))
			];
		},
		spike: async (sceneData, scenes) => {
			const texture = await TiledTexture.create(
				sceneData.size,
				[
					"assets/spike/moonRock.svg"
				],
				64,
				0,
				true,
				false
			);

			return [
				new Spike(sceneData.pos, sceneData.size, sceneData.name)
					.addChild(new AABB(Vector2.zero(), sceneData.size, true, sceneData.name + "Collider"))
					.addChild(new TextureRect(Vector2.zero(), sceneData.size, texture, sceneData.name + "Texture"))
			]
		},
		checkpoint: async (sceneData, scenes) => {
			const texture = await MultiStateTex.create(
				{
					inactive: await ImageTexture.create("assets/checkpoint/inactive.svg", new Vector2(128, 128)),
					active: await ImageTexture.create("assets/checkpoint/active.svg", new Vector2(128, 128))
				}, "inactive"
			);

			return [
				new Checkpoint(sceneData.pos, sceneData.name)
					.addChild(new AABB(Vector2.zero(), Checkpoint.SIZE, true, sceneData.name + "Collider"))
					.addChild(new TextureRect(Vector2.zero(), Checkpoint.SIZE, texture, sceneData.name + "Texture"))
			]
		},
		root: async (sceneData, scenes) => {
			const backgroundTexture = await ImageTexture.create("assets/background/stars.png", new Vector2(Utils.gameWidth, Utils.gameHeight));
			// const playerTex = await ImageTexture.create("assets/player/restingNormalTest.svg");
			const playerTex = await MultiStateTex.create({
				normal: await ImageTexture.create("assets/player/restingNormalTest.svg"),
				inverted: await ImageTexture.create("assets/player/restingNormalTest.svg")
			}, "normal");

			return [
				new CanvasLayer(new Transform(), "background")
					.addChild(new TextureRect(Vector2.zero(), new Vector2(Utils.gameWidth, Utils.gameHeight), backgroundTexture, "backgroundImage")),
				await scenes.platform({
					pos: new Vector2(0, Utils.gameHeight - 128),
					size: new Vector2(1664, 128),
					name: "platform"
				}),
				new Hologram(new Vector2(320, Utils.gameHeight - 384), "Use A/D to move, and Space to jump!", 50, "#fff", "movementHologram"),
				await scenes.platform({
					pos: new Vector2(1920, Utils.gameHeight - 320),
					size: new Vector2(320, 320),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(2560, Utils.gameHeight - 512),
					size: new Vector2(320, 512),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(3072, Utils.gameHeight - 64),
					size: new Vector2(1920, 64),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(3456, 0),
					size: new Vector2(2624, 128),
					name: "topRoofPlatform"
				}),
				new Hologram(new Vector2(3648, Utils.gameHeight - 320), "Press Shift to reverse gravity!", 50, "#fff", "reverseGravityHelp"),
				await scenes.platform({
					pos: new Vector2(4736, 0),
					size: new Vector2(256, 320),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(5760, 128),
					size: new Vector2(320, 256),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(6400, 0),
					size: new Vector2(320, 576),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(7040, 0),
					size: new Vector2(320, 756),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(7680, 0),
					size: new Vector2(2112, Math.round(Utils.gameHeight / 2)),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(4736, Utils.gameHeight),
					size: new Vector2(256, 320),
					name: "platform"
				}),
				new Hologram(new Vector2(8064, Utils.gameHeight - 256), "Make sure to walk through the teleporters!", 50, "#fff", "checkpointInstructions"),
				await scenes.platform({
					pos: new Vector2(8640, Utils.gameHeight - 128),
					size: new Vector2(6400, 128),
					name: "platform"
				}),
				await scenes.checkpoint({
					pos: new Vector2(9280, Utils.gameHeight - 256),
					name: "checkpoint"
				}),
				new Hologram(new Vector2(10112, Utils.gameHeight - 384), "Avoid the spikes!", 50, "#fff", "spikeWarning"),
				await scenes.spike({
					pos: new Vector2(10432, Utils.gameHeight - 192),
					size: new Vector2(128, 64),
					name: "spike"
				}),
				await scenes.spike({
					pos: new Vector2(11456, Utils.gameHeight - 192),
					size: new Vector2(1920, 64),
					name: "spike"
				}),
				await scenes.platform({
					pos: new Vector2(11520, Utils.gameHeight - 384),
					size: new Vector2(448, 64),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(12288, Utils.gameHeight - 512),
					size: new Vector2(448, 64),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(12928, Utils.gameHeight - 384),
					size: new Vector2(384, 64),
					name: "platform"
				}),
				new Hologram(new Vector2(14976, Utils.gameHeight - 256), "You can reverse gravity in midair one time before touching the ground.", 50, "#fff", "midairReverseGravityAlert"),
				await scenes.spike({
					pos: new Vector2(14976, Utils.gameHeight - 256),
					size: new Vector2(64, 128),
					name: "spike"
				}),
				await scenes.platform({
					pos: new Vector2(15104, 0),
					size: new Vector2(3200, 256),
					name: "platform"
				}),
				await scenes.spike({
					pos: new Vector2(16000, 256),
					size: new Vector2(128, 128),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(16768, 256),
					size: new Vector2(64, 64),
					name: "platform"
				}),
				await scenes.platform({
					pos: new Vector2(16832, 256),
					size: new Vector2(192, 128),
					name: "platform"
				}),
				await scenes.spike({
					pos: new Vector2(16896, 384),
					size: new Vector2(64, 64),
					name: "spike"
				}),
				await scenes.platform({
					pos: new Vector2(17024, 256),
					size: new Vector2(64, 64),
					name: "platform"
				}),
				await scenes.spike({
					pos: new Vector2(18240, 256),
					size: new Vector2(64, 192),
					name: "spike"
				}),
				await scenes.platform({
					pos: new Vector2(18688, Utils.gameHeight - 128),
					size: new Vector2(3840, 192),
					name: "platform"
				}),
				new Hologram(new Vector2(200096, 256), "Get in the rocket to finish the level!", 50, "#fff", "rocketHologram"),
				new Player(new Vector2(6*64, Utils.gameHeight - 4*64), "player")
					.addChild(new AABB(Vector2.zero(), Player.SIZE))
					.addChild(new TextureRect(Vector2.zero(), Player.SIZE, playerTex, "playerTex"))
					.addChild(new Camera(Vector2.zero(), new Vector2(21696, 0), 625, 750, 0, 0, false, true, true, "playerCamera"))
			];
		}
	},
	lvl: {
		minScroll: 0,
		maxScroll: 21696
	}
}*/

/*
const lvlTutorial = {
	sprites: [ // TODO: Make this use regular constructors, no defaults
		{
			type: CanvasLayer,
			data: {
				name: "background"
			},
			children: [
				{
					type: ImgTexture,
					data: {
						pos: new Vector2(0, GH),
						size: new Vector2(GW, GH),
						src: "assets/background/stars.svg"
					}
				}
			]
		},
		{
			type: Player,
			data: {
				pos: new Vector2(6, 4),
			},
			children: [
				{
					type: AABB,
					data: {
						pos: Vector2.zero(),
						size: Player.SIZE
					}
				},
				{
					type: MultiStateTex,
					data: {
						pos: Vector2.zero(),
						size: Player.SIZE,
						states: {
							normal: {
								type: ImgTexture,
								pos: Vector2.zero(),
								size: Player.SIZE,
								src: "assets/player/restingNormal.svg"
							},
							inverted: {
								type: ImgTexture,
								pos: Vector2.zero(),
								size: Player.SIZE,
								src: "assets/player/restingInverted.svg"
							}
						}
					}
				}
			]
		},
		{
			type: Platform,
			data: {
				pos: new Vector2(0, 2),
				size: new Vector2(26, 2)
			},
			children: [
				{
					type: AABB,
					data: {
						pos: Vector2.zero(),
						size: new Vector2(26, 2)
					}
				},
				{
					type: TiledTexture,
					data: {
						pos: Vector2.zero(),
						size: new Vector2(26, 2),
						sources: [
							"assets/platforms/moonGround0.svg",
							"assets/platforms/moonGround1.svg",
							"assets/platforms/moonGround2.svg",
							"assets/platforms/moonGround3.svg",
							"assets/platforms/moonGround4.svg",
							"assets/platforms/moonGround5.svg",
						],
						tileSize: Vector2.one(),
						rotation: -1,
						tileDirection: "all",
					}
				}
			]
		},
		{
			type: Platform,
			data: {
				pos: new Vector2(30, 5),
				size: new Vector2(5, 5)
			},
			children: [
				{
					type: AABB,
					data: {
						pos: Vector2.zero(),
						size: new Vector2(5, 5)
					}
				},
				{
					type: TiledTextureRect,
					data: {
						pos: Vector2.zero(),
						size: new Vector2(5, 5),
						sources: [
							"assets/platforms/moonGround0.svg",
							"assets/platforms/moonGround1.svg",
							"assets/platforms/moonGround2.svg",
							"assets/platforms/moonGround3.svg",
							"assets/platforms/moonGround4.svg",
							"assets/platforms/moonGround5.svg",
						],
						tileSize: Vector2.one(),
						rotation: -1,
						tileDirection: "all",
					}
				}
			]
		}
	],
	lvl: {
		minScroll: 0,
		maxScroll: 339
	},
	meta: {
		version: 1.0
	}
};*/

/*const GAME_WIDTH = 30;
const GAME_HEIGHT = 17;

// ---===[BOTTOM LEFT CORNER IS 0, 0, AND POSITIONS ARE TOP LEFT BASED]===---
const lvlTutorial = {
	background: "stars",
	sprites: [
		{
			type: Player, ===
			data: {
				spawn: {
					x: 6,
					y: 4
				},
				texture: "normal"
			}
		},
		{
			type: Platform; ===
			data: {
				x: 0,
				y: 2,
				w: 26,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Hologram, ===
			data: {
				x: 5,
				y: 6,
				fontSize: 34,
				text: "Use WASD and Space or the arrow keys to move."
			}
		},
		{
			type: Platform, ===
			data: {
				x: 30,
				y: 5,
				w: 5,
				h: 5,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 40,
				y: 8,
				w: 5,
				h: 8,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 48,
				y: 1,
				w: 30,
				h: 1,
				texture: "moon"
			}
		},
		{ // Top Roof
			type: Platform, ===
			data: {
				x: 54,
				y: GAME_HEIGHT,
				w: 41,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Hologram, ===
			data: {
				x: 57,
				y: 5,
				fontSize: 34,
				text: "Press Shift to reverse gravity!"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 74,
				y: GAME_HEIGHT,
				w: 4,
				h: 5,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 90,
				y: GAME_HEIGHT - 2,
				w: 5,
				h: 4,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 100,
				y: GAME_HEIGHT,
				w: 5,
				h: 9,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 110,
				y: GAME_HEIGHT,
				w: 5,
				h: 9,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 120,
				y: GAME_HEIGHT,
				w: 33,
				h: Math.round(GAME_HEIGHT / 2),
				texture: "moon"
			}
		},
		{
			type: Hologram, ===
			data: {
				x: 126,
				y: 4,
				fontSize: 34,
				text: "Make sure to walk through the teleporters!"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 135,
				y: 2,
				w: 100,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Checkpoint, ===
			data: {
				x: 145,
				y: 4,
				texture: "teleporter"
			}
		},
		{
			type: Hologram, ===
			data: {
				x: 158,
				y: 6,
				fontSize: 34,
				text: "Avoid the spikes!"
			}
		},
		{
			type: Spike, ===
			data: {
				x: 163,
				y: 3,
				w: 2,
				h: 1,
				texture: "stalagmite"
			}
		},
		{
			type: Spike, ===
			data: {
				x: 179,
				y: 3,
				w: 30,
				h: 1,
				texture: "stalagmite"	
			}
		},
		{
			type: Platform, ===
			data: {
				x: 180,
				y: 6,
				w: 7,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 192,
				y: 8,
				w: 7,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 202,
				y: 6,
				w: 6,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Hologram, ===
			data: {
				x: 215,
				y: 6,
				fontSize: 34,
				text: "You can reverse gravity in midair one time before touching the ground."
			}
		},
		{
			type: Spike, ===
			data: {
				x: 234,
				y: 4,
				w: 1,
				h: 2,
				texture: "stalagmite"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 236,
				y: GAME_HEIGHT,
				w: 50,
				h: 4,
				texture: "moon"
			}
		},
		{
			type: Spike, ===
			data: {
				x: 250,
				y: GAME_HEIGHT - 4,
				w: 2,
				h: 2,
				texture: "stalactite"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 262,
				y: GAME_HEIGHT - 4,
				w: 1,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 263,
				y: GAME_HEIGHT - 4,
				w: 3,
				h: 2,
				texture: "moon"
			}
		},
		{
			type: Spike, ===
			data: {
				x: 264,
				y: GAME_HEIGHT - 6,
				w: 1,
				h: 1,
				texture: "stalactite"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 266,
				y: GAME_HEIGHT - 4,
				w: 1,
				h: 1,
				texture: "moon"
			}
		},
		{
			type: Spike, ===
			data: {
				x: 285,
				y: GAME_HEIGHT - 4,
				w: 1,
				h: 3,
				texture: "stalactite"
			}
		},
		{
			type: Platform, ===
			data: {
				x: 292,
				y: 2,
				w: 60,
				h: 3,
				texture: "moon"
			}
		},
		{
			type: Hologram, ===
			data: {
				x: 314,
				y: 4,
				fontSize: 34,
				text: "Get in the rocket to finish the level!"
			}
		},
		{
			type: Goal, ===
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
				type: MultiStateTex,
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
};*/