console.log("In tutuorial")
console.log(Platform);
// Game Size: 1920 x 1080

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
			normalRight: await ImageTexture.create("assets/player/V3/rightNormalV3.svg"),
			normalLeft: await ImageTexture.create("assets/player/V3/leftNormalV3.svg"),
			normalEmpty: await ImageTexture.create("assets/player/V3/emptyNormalV3.svg"),
			invertedRight: await ImageTexture.create("assets/player/V3/rightInvertedV3.svg"),
			invertedLeft: await ImageTexture.create("assets/player/V3/leftInvertedV3.svg"),
			invertedEmpty: await ImageTexture.create("assets/player/V3/emptyInvertedV3.svg")
		}, "normalRight");
		const rocketTexture = await MultiStateTex.create({
			empty: await ImageTexture.create("assets/goal/rocketEmpty.svg"),
			full: await ImageTexture.create("assets/goal/rocketFull.svg")
		}, "empty");

		return [
			new CanvasLayer(new Transform(), "background")
				.addChild(new TextureRect(Vector2.zero(), new Vector2(Utils.gameWidth, Utils.gameHeight), backgroundTexture, "backgroundImage")),
			new StaticBody(new Vector2(-1, -1), new Vector2(1, Utils.gameHeight), 0, 0.8, "worldBoundary")
				.addChild(new AABB(Vector2.zero(), new Vector2(1, Utils.gameHeight), true, "worldBoundaryCOllider")),	
			// Beginning Section
			await this.platform(Vector2.levelPositionVector2(0, 2), Vector2.levelVector2(20, 2), "platform"),
			new Hologram(Vector2.levelPositionVector2(5, 6), "Use A/D to move, and Space to jump!", 45, "#fff", "movementHologram"),
			await this.platform(Vector2.levelPositionVector2(27, 5), Vector2.levelVector2(8, 5), "platform"),
			await this.platform(Vector2.levelPositionVector2(43, 8), Vector2.levelVector2(6, 8), "platform"),
			await this.platform(Vector2.levelPositionVector2(60, 2), Vector2.levelVector2(30, 2), "platform"),
			// First Inverted Section
			new Hologram(Vector2.levelPositionVector2(64, 5), "Press Shift to reverse gravity!", 45, "#fff", "reverseGravityHologram"),
			await this.platform(Vector2.levelPositionVector2(66, Utils.levelHeight), Vector2.levelVector2(39, 2), "platform"),
			await this.platform(Vector2.levelPositionVector2(86, Utils.levelHeight), Vector2.levelVector2(4, 5), "platform"),
			await this.platform(Vector2.levelPositionVector2(104, Utils.levelHeight), Vector2.levelVector2(6, 6), "platform"),
			await this.platform(Vector2.levelPositionVector2(121, Utils.levelHeight), Vector2.levelVector2(8, 5), "platform"),
			await this.platform(Vector2.levelPositionVector2(139, Utils.levelHeight), Vector2.levelVector2(8, 7), "platform"),
			await this.platform(Vector2.levelPositionVector2(155, Utils.levelHeight), Vector2.levelVector2(38, 9), "platform"),
			// Teleporter Section
			new Hologram(Vector2.levelPositionVector2(170, 5), "Make sure to walk through the teleporters!", 45, "#fff", "teleporterReminderHologram"),
			await this.platform(Vector2.levelPositionVector2(173, 2), Vector2.levelVector2(134, 2), "platform"),
			await this.checkpoint(Vector2.levelPositionVector2(191, 4), "checkpoint"),
			// Spike Section
			new Hologram(Vector2.levelPositionVector2(198, 6), "Avoid the spikes!", 45, "#fff", "spikeWarningHologram"),
			await this.spike(Vector2.levelPositionVector2(207, 3), Vector2.levelVector2(2, 1), false, "spike"),
			await this.spike(Vector2.levelPositionVector2(227, 3), Vector2.levelVector2(51, 1), false, "spike"),
			await this.platform(Vector2.levelPositionVector2(230, 7), Vector2.levelVector2(7, 1), "platform"),
			await this.platform(Vector2.levelPositionVector2(247, 9), Vector2.levelVector2(7, 1), "platform"),
			await this.platform(Vector2.levelPositionVector2(266, 7), Vector2.levelVector2(7, 1), "platform"),
			// Midair Reverse Gravity Section
			new Hologram(Vector2.levelPositionVector2(290, 6), "You can reverse gravity in midair one time before touching the ground.", 50, "#fff", "midairGravityFlipHologram"),
			await this.spike(Vector2.levelPositionVector2(306, 4), Vector2.levelVector2(1, 2), false, "spike"),
			await this.platform(Vector2.levelPositionVector2(306, Utils.levelHeight), Vector2.levelVector2(63, 4), "platform"),
			await this.spike(Vector2.levelPositionVector2(332, Utils.levelHeight - 4), Vector2.levelVector2(2, 2), true, "spike"),
			await this.platform(Vector2.levelPositionVector2(350, Utils.levelHeight - 4), Vector2.levelVector2(1, 1), "platform"),
			await this.platform(Vector2.levelPositionVector2(351, Utils.levelHeight - 4), Vector2.levelVector2(3, 2), "platform"),
			await this.spike(Vector2.levelPositionVector2(352, Utils.levelHeight - 6), Vector2.levelVector2(1, 1), true, "spike"),
			await this.platform(Vector2.levelPositionVector2(354, Utils.levelHeight - 4), Vector2.levelVector2(1, 1), "platform"),
			await this.spike(Vector2.levelPositionVector2(368, Utils.levelHeight - 4), Vector2.levelVector2(1, 3), true, "spike"),
			// Home stretch to Rocket
			await this.platform(Vector2.levelPositionVector2(372, 2), Vector2.levelVector2(50, 3), "platform"),
			new Goal(Vector2.levelPositionVector2(409, 10), "goal")
				.addChild(new AABB(Vector2.zero(), Goal.SIZE, true, "goalCollider"))
				.addChild(new TextureRect(Vector2.zero(), Goal.SIZE, rocketTexture, "goalTexture"))
				.addChild(new Region(Vector2.levelVector2(-3, -3), Goal.SIZE.addVec(Vector2.levelVector2(6, 6)), "vehicleChangeRange")
					.addChild(new AABB(Vector2.zero(), Goal.SIZE.addVec(Vector2.levelVector2(6, 6)), true, "vehicleChangeRange")))
				.addChild(new Hologram(new Vector2(0, -35), "Press E - Change Vehicle", 30, "#fff", "changeVehicleHint")),
			await this.platform(Vector2.levelPositionVector2(419, Utils.levelHeight), Vector2.levelVector2(3, Utils.levelHeight - 2), "platform"),
			new Player(Vector2.levelPositionVector2(6, 4), "player")
				.addChild(new AABB(Vector2.zero(), Player.SIZE))
				.addChild(new TextureRect(Vector2.zero(), Player.SIZE, playerTex, "playerTex"))
				.addChild(new Camera(Vector2.zero(), Vector2.levelPositionVector2(422, 0), 625, 750, 0, 0, false, true, true, "playerCamera"))
				.addChild(new Hologram(new Vector2(150, 30), "pos", 30, "#fff", "playerpos"))
				.addChild(new Hologram(new Vector2(150, 70), "pos", 30, "#fff", "lvlplayerpos"))
		];
	}
}



// =================================
// =========== Level One ===========
// =================================

class LevelOne extends Level {
	constructor() {
		super();
	}
	
	async platform(x, y, width, height, name="platform") {
		const size = Vector2.levelVector2(width, height);
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
			new Platform(Vector2.levelPositionVector2(x, y), size, name)
				.addChild(new AABB(Vector2.zero(), size, true, name + "Collider"))
				.addChild(new TextureRect(Vector2.zero(), size, texture, name))
		];
	}

	async spike(x, y, width, height, isInverted, name="spike") {
		const size = Vector2.levelVector2(width, height);
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
			new Spike(Vector2.levelPositionVector2(x, y), size, name)
				.addChild(new AABB(Vector2.zero(), size, true, name + "Collider"))
				.addChild(new TextureRect(Vector2.zero(), size, texture, name + "Texture"))
		]
	}

	async battery(x, y, name="power") {
		return [
			new Battery(Vector2.levelPositionVector2(x, y), new Vector2(64, 64), name)
				.addChild(new AABB(Vector2.zero(), new Vector2(64, 64), true, name + "Collider"))
				.addChild(new TextureRect(Vector2.zero(), new Vector2(64, 64), await ColorTexture.create(new Vector2(64, 64), "#00ff00", true)))
		];
	}

	async checkpoint(x, y, name="checkpoint") {
		const texture = await MultiStateTex.create(
			{
				inactive: await ImageTexture.create("assets/checkpoint/inactive.svg"),
				active: await ImageTexture.create("assets/checkpoint/active.svg")
			}, "inactive"
		);

		return [
			new Checkpoint(Vector2.levelPositionVector2(x, y), name)
				.addChild(new AABB(Vector2.zero(), Checkpoint.SIZE, true, name + "Collider"))
				.addChild(new TextureRect(Vector2.zero(), Checkpoint.SIZE, texture, name + "Texture"))
		]
	}

	async player() {
		const playerTex = await MultiStateTex.create({
			normalRight: await ImageTexture.create("assets/player/V3/rightNormalV3.svg"),
			normalLeft: await ImageTexture.create("assets/player/V3/leftNormalV3.svg"),
			normalEmpty: await ImageTexture.create("assets/player/V3/emptyNormalV3.svg"),
			invertedRight: await ImageTexture.create("assets/player/V3/rightInvertedV3.svg"),
			invertedLeft: await ImageTexture.create("assets/player/V3/leftInvertedV3.svg"),
			invertedEmpty: await ImageTexture.create("assets/player/V3/emptyInvertedV3.svg")
		}, "normalRight");

		const inventoryTexture = await ColorTexture.create(Vector2.levelVector2(8, 8), "#ff00ff", true);

		// return new Player(Vector2.levelPositionVector2(6, 4), "player")
		return new Player(new Vector2(23936, -191.99999999999997), "player")
			.addChild(new AABB(Vector2.zero(), Player.SIZE))
			.addChild(new TextureRect(Vector2.zero(), Player.SIZE, playerTex, "playerTex"))
			.addChild(new Camera(Vector2.levelVector2(0, -Utils.levelHeight), Vector2.levelVector2(669, 0), 625, 750, 400, 475, false, false, true, "playerCamera"))
			.addChild(new Hologram(new Vector2(150, 30), "pos", 30, "#fff", "playerpos"))
			.addChild(new Hologram(new Vector2(150, 70), "pos", 30, "#fff", "lvlplayerpos"))
			// .addChild(new InventoryGUI()
			// 	.addChild(new TextureRect(Vector2.zero(), Vector2.levelVector2(8, 8), inventoryTexture, "inventoryTexture")));
	}

	async root() {
		const backgroundTexture = await ImageTexture.create("assets/background/stars.svg");
		const rocketTexture = await MultiStateTex.create({
			empty: await ImageTexture.create("assets/goal/rocketEmpty.svg"),
			full: await ImageTexture.create("assets/goal/rocketFull.svg")
		}, "empty");
		const menuButton = await MultiStateTex.create({
			normal: await ImageTexture.create("assets/gui/pauseNormal.svg"),
			hot: await ImageTexture.create("assets/gui/pauseHot.svg"),
			active: await ImageTexture.create("assets/gui/pauseActive.svg"),
		}, "normal");
		
		return [ // IDEA: Make gravity locked to downwards
			new CanvasLayer(new Transform(), "background")
				.addChild(new TextureRect(Vector2.zero(), new Vector2(Utils.gameWidth, Utils.gameHeight), backgroundTexture, "backgroundImage")),
			new HUD()
				.addChild(new Button(new Vector2(30, 30), new Vector2(64, 64), menuButton, "relic1Use"))
				.addChild(new Hologram(new Vector2(55, 120), "0", 20, "#ffffff", "relic1Count")),
				// .addChild(new TextureRect(new Vector2(30, 30), new Vector2(64, 64), menuButton, "texture")),
				
			new StaticBody(new Vector2(-1, -1), new Vector2(1, Utils.gameHeight), 0, 0.8, "worldBoundary")
				.addChild(new AABB(Vector2.zero(), new Vector2(1, Utils.gameHeight), true, "worldBoundaryCOllider")),
			await this.platform(0, 2, 20, 2),
			new Hologram(Vector2.levelPositionVector2(5, 6), "Use A/D to move, and Space to jump!", 45, "#fff", "movementHologram"),
			await this.platform(27, 5, 8, 5),
			await this.platform(43, 7, 6, 7),
			await this.platform(60, 2, 40, 2),
			new Hologram(Vector2.levelPositionVector2(66, 6), "Collect 5 batteries to go into Overdrive!", 45, "#fff", "batteryHologram"),
			await this.spike(80, 3, 5, 1, false),
			await this.battery(82, 10),

			// Platform / Spike combo
			await this.platform(108, 3, 10, 3),
			await this.spike(117, 4, 1, 1, false),
			await this.platform(125, 5, 10, 5),
			await this.spike(134, 6, 1, 1, false),
			await this.platform(141, 7, 8, 7),
			// await this.spike(150, 9, 1, 2, false),
			await this.platform(149, 2, 41, 2),
			
			await this.platform(157, 7, 10, 1),
			// await this.platform(172, 34, 3, 29),
			await this.platform(161, 34, 14, 20),
			await this.battery(162, 11, "power"),
			await this.spike(162.25, 8, 0.5, 1, false),

			await this.platform(173, 14, 2, 4),

			await this.platform(190, 22, 18, 22),

			await this.platform(186, 6, 4, 4),
			await this.platform(175, 11, 4, 1),
			await this.platform(186, 14, 4, 1),
			await this.platform(175, 19, 4, 1),
			
			await this.platform(175, 34, 59, 4),
			await this.checkpoint(194, 24, "checkpoint1"),

			await this.platform(223, 30, 11, 21),
			// await this.platform(223, 30, 5, 12),
			// await this.platform(223, 12, 5, 3),
			
			await this.platform(208, 22, 4, 1),
			// await this.spike(209, 23, 2, 1, false),
			// await this.spike(211, 24, 1, 2, false),


			await this.platform(218, 19, 5, 1),
			// await this.spike(222, 21, 1, 2, false),
			await this.platform(208, 14, 5, 1),
			// await this.spike(208, 16, 1, 2, false),
			await this.platform(218, 10, 5, 1),
			await this.battery(219, 13),
			await this.spike(222, 12, 1, 2, false),
			await this.platform(208, 5, 5, 1),
			// await this.spike(208, 7, 1, 2, false),

			await this.platform(218, 2, 18, 2),
			await this.platform(236, 1, 15, 1),
			await this.platform(251, 2, 24, 2),

			await this.spike(236, 3, 2, 2, false),
			await this.battery(243, 2),
			await this.spike(249, 3, 2, 2, false),
			
			await this.platform(283, 6, 6, 6),
			await this.platform(299, 9, 6, 2),
			await this.platform(315, 12, 6, 2),
			await this.platform(331, 15, 6, 2),
			await this.platform(347, 18, 8, 2),
			await this.spike(354, 20, 1, 2),

			await this.platform(365, 18, 20, 2),
			
			await this.checkpoint(374, 20, "checkpoint2"),

			await this.platform(395, 16, 11, 2),
			await this.spike(395, 17, 1, 1, false),
			await this.spike(405, 17, 1, 1, false),

			await this.platform(415, 13, 11, 2),
			await this.spike(415, 14, 1, 1, false),
			await this.spike(425, 14, 1, 1, false),

			await this.platform(433, 9, 11, 2),
			await this.spike(433, 10, 1, 1, false),
			await this.spike(443, 10, 1, 1, false),

			await this.platform(450, 9, 11, 2),
			await this.spike(450, 10, 1, 1, false),
			await this.spike(460, 10, 1, 1, false),

			await this.platform(470, 5, 11, 2),
			await this.spike(470, 6, 1, 1, false),
			await this.spike(480, 6, 1, 1, false),

			await this.platform(488, 2, 179, 2),

			await this.spike(520, 3, 90, 1),
			await this.platform(526, 6, 8, 1),
			await this.platform(542, 10, 8, 1),
			await this.platform(558, 14, 8, 1),
			await this.battery(561.5, 20, "power"),
			await this.platform(576, 10, 8, 1),
			await this.platform(594, 6, 8, 1),

			await this.platform(633, 7, 7, 2),
			await this.platform(634, 5, 1, 3),
			await this.platform(638, 5, 1, 3),

			new Goal(Vector2.levelPositionVector2(660, 10), "goal")
				.addChild(new AABB(Vector2.zero(), Goal.SIZE, true, "goalCollider"))
				.addChild(new TextureRect(Vector2.zero(), Goal.SIZE, rocketTexture, "goalTexture"))
				.addChild(new Region(Vector2.levelVector2(-3, -3), Goal.SIZE.addVec(Vector2.levelVector2(6, 6)), "vehicleChangeRange")
					.addChild(new AABB(Vector2.zero(), Goal.SIZE.addVec(Vector2.levelVector2(6, 6)), true, "vehicleChangeRange")))
				.addChild(new Hologram(new Vector2(0, -35), "Press E - Change Vehicle", 30, "#fff", "changeVehicleHint")),
			
			await this.platform(667, 34, 2, 34),

			await this.player()
		];
	}
}