console.log("In tutuorial")
console.log(Platform);
// Game Size: 1920 x 1080

class Level {
	constructor() {
	}

	async root() {
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

	async relic(x, y, name) {
		return [
			new Collectable(Vector2.levelPositionVector2(x, y), new Vector2(64, 64), name, name)
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

	/**
	 * @param {Camera} camera camera
	 */
	async player(spawnpoint, camera) {
		const playerTex = await MultiStateTex.create({
			normalRight: await ImageTexture.create("assets/player/V3/rightNormalV3.svg"),
			normalLeft: await ImageTexture.create("assets/player/V3/leftNormalV3.svg"),
			normalEmpty: await ImageTexture.create("assets/player/V3/emptyNormalV3.svg"),
			invertedRight: await ImageTexture.create("assets/player/V3/rightInvertedV3.svg"),
			invertedLeft: await ImageTexture.create("assets/player/V3/leftInvertedV3.svg"),
			invertedEmpty: await ImageTexture.create("assets/player/V3/emptyInvertedV3.svg")
		}, "normalRight");

		const inventoryTexture = await ColorTexture.create(Vector2.levelVector2(8, 8), "#ff00ff", true);

		// Original spawn: 6, 4
		return new Player(spawnpoint, "player")
			.addChild(new AABB(Vector2.zero(), Player.SIZE))
			.addChild(new TextureRect(Vector2.zero(), Player.SIZE, playerTex, "playerTex"))
			.addChild(camera)
			.addChild(new Hologram(new Vector2(150, 30), "pos", 30, "#fff", "playerpos"))
			.addChild(new Hologram(new Vector2(150, 70), "pos", 30, "#fff", "lvlplayerpos"))
			// .addChild(new InventoryGUI()
			// 	.addChild(new TextureRect(Vector2.zero(), Vector2.levelVector2(8, 8), inventoryTexture, "inventoryTexture")));
	}

	async inventory(items) {
		let buttonX = 32;
		const buttonY = 32;
		const buttonSize = 64;
		const fontSize = 20;
		const labelY = buttonY + buttonSize * 1.5;

		let inventoryChildren = [];
		for (const label in items) {
			const texture = items[label];
			inventoryChildren.push(new Button(
				new Vector2(buttonX, buttonY),
				new Vector2(buttonSize, buttonSize),
				texture,
				label + "Use"
			));
			const labelX = buttonX + buttonSize / 2;
			inventoryChildren.push(new Hologram(
				new Vector2(labelX, labelY),
				"0", // This represents the default count of the HUD
				fontSize,
				"#ffffff",
				label + "Count",
				true
			));
			buttonX += buttonSize * 1.5;
		}

		return new HUD().addChildren(inventoryChildren);
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
			this.inventory({
				battery: menuButton,
				ancientShield: menuButton,
				feather: menuButton
			}),				
			new StaticBody(new Vector2(-1, -1), new Vector2(1, Utils.gameHeight), 0, 0.8, "worldBoundary")
				.addChild(new AABB(Vector2.zero(), new Vector2(1, Utils.gameHeight), true, "worldBoundaryCOllider")),
			this.platform(0, 2, 20, 2),
			new Hologram(Vector2.levelPositionVector2(5, 6), "Use A/D to move, and Space to jump!", 45, "#fff", "movementHologram"),
			this.platform(27, 5, 8, 5),
			this.platform(43, 7, 6, 7),
			this.platform(60, 2, 40, 2),
			this.spike(80, 3, 5, 1, false),
			this.relic(82, 10, "feather"),

			// Platform / Spike combo
			this.platform(108, 3, 10, 3),
			this.spike(117, 4, 1, 1, false),
			this.platform(125, 5, 10, 5),
			this.spike(134, 6, 1, 1, false),
			this.platform(141, 7, 8, 7),
			this.relic(144.5, 9, "feather"),
			this.platform(149, 2, 41, 2),
			
			this.platform(157, 7, 10, 1),
			this.platform(161, 34, 14, 9),
			this.platform(170, 25, 5, 3),
			this.platform(161, 22, 14, 8),
			this.relic(168, 24, "battery"),
			this.relic(162, 11, "ancientShield"),
			this.spike(162.25, 8, 0.5, 1, false),

			this.platform(173, 14, 2, 4),

			this.platform(190, 22, 18, 22),

			this.platform(186, 6, 4, 4),
			this.platform(175, 11, 4, 1),
			this.platform(186, 14, 4, 1),
			this.platform(175, 19, 4, 1),
			
			this.platform(175, 34, 59, 4),
			this.checkpoint(194, 24, "checkpoint1"),

			this.platform(223, 30, 11, 21),
			
			this.platform(208, 22, 4, 1),


			this.platform(218, 19, 5, 1),
			this.platform(208, 14, 5, 1),
			this.platform(218, 10, 5, 1),
			this.relic(219, 13, "feather"),
			this.spike(222, 12, 1, 2, false),
			this.platform(208, 5, 5, 1),

			this.platform(218, 2, 18, 2),
			this.platform(236, 1, 15, 1),
			this.platform(251, 2, 24, 2),

			this.spike(236, 3, 2, 2, false),
			this.relic(243, 2, "ancientShield"),
			this.spike(249, 3, 2, 2, false),

			this.platform(257, 17, 11, 1),
			this.spike(257, 16, 11, 1, true),
			this.platform(246, 20, 5, 1),
			this.platform(234, 19, 4, 1),
			this.relic(246, 31, "battery"),
			this.spike(246, 26, 4, 1, false),
			this.platform(246, 25, 4, 1),
			
			this.platform(283, 6, 6, 6),
			this.platform(299, 9, 6, 2),
			this.platform(315, 12, 6, 2),
			this.platform(331, 15, 6, 2),
			this.platform(347, 18, 8, 2),
			this.spike(354, 20, 1, 2),

			this.platform(365, 18, 20, 2),
			
			this.checkpoint(374, 20, "checkpoint2"),

			this.platform(395, 16, 11, 2),
			this.spike(395, 17, 1, 1, false),
			this.spike(405, 17, 1, 1, false),

			this.platform(415, 13, 11, 2),
			this.spike(415, 14, 1, 1, false),
			this.spike(425, 14, 1, 1, false),

			this.platform(433, 9, 11, 2),
			this.spike(433, 10, 1, 1, false),
			this.spike(443, 10, 1, 1, false),

			this.platform(450, 9, 11, 2),
			this.spike(450, 10, 1, 1, false),
			this.spike(460, 10, 1, 1, false),

			this.platform(470, 5, 11, 2),
			this.spike(470, 6, 1, 1, false),
			this.spike(480, 6, 1, 1, false),

			this.platform(488, 2, 179, 2),

			this.spike(520, 3, 90, 1),
			this.platform(526, 6, 8, 1),
			this.platform(542, 10, 8, 1),
			this.platform(558, 14, 8, 1),
			this.relic(561.5, 8, "battery"),
			this.platform(576, 10, 8, 1),
			this.platform(594, 6, 8, 1),

			this.platform(633, 7, 7, 2),
			this.platform(634, 5, 1, 3),
			this.platform(638, 5, 1, 3),

			this.platform(633, 21, 7, 1),
			this.spike(633, 20, 7, 1, true),
			this.platform(619, 26, 7, 1),
			this.platform(647, 26, 7, 1),
			this.platform(633, 31, 7, 1),
			this.spike(633, 30, 7, 1, true),
			this.relic(636, 33, "ancientShield"),

			new Goal(Vector2.levelPositionVector2(660, 10), "goal")
				.addChild(new AABB(Vector2.zero(), Goal.SIZE, true, "goalCollider"))
				.addChild(new TextureRect(Vector2.zero(), Goal.SIZE, rocketTexture, "goalTexture"))
				.addChild(new Region(Vector2.levelVector2(-3, -3), Goal.SIZE.addVec(Vector2.levelVector2(6, 6)), "vehicleChangeRange")
					.addChild(new AABB(Vector2.zero(), Goal.SIZE.addVec(Vector2.levelVector2(6, 6)), true, "vehicleChangeRange")))
				.addChild(new Hologram(new Vector2(0, -35), "Press E - Change Vehicle", 30, "#fff", "changeVehicleHint")),
			
			this.platform(667, 34, 2, 34),

			this.player(Vector2.levelPositionVector2(6, 4), new Camera(
				Vector2.levelVector2(0, -Utils.levelHeight),
				Vector2.levelVector2(669, 0),
				625,
				750,
				400,
				475,
				false,
				false,
				true,
				"playerCamera"
			))
		];
	}
}