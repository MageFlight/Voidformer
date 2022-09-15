// Game Size: 1920 x 1080
const GAME_WIDTH = 1920;
const GAME_HEIGHT = 1080;

// ---===[BOTTOM LEFT CORNER IS 0, 0, AND POSITIONS ARE TOP LEFT BASED]===---
const lvl1_1 = {
	background: '#dbfeff',
	spawn: {
		x: 300,
		y: 200
	},
	platforms: [
		{ // 0
			x: 0,
			y: 100,
			width: 650,
			height: 100
		},
		{
			x: 950,
			y: 250,
			width: 200,
			height: 250
		},
		{
			x: 1350,
			y: 400,
			width: 200,
			height: 400
		},
		{
			x: 1800,
			y: 300,
			width: 500,
			height: 300
		},
		{ // First seperator
			x: 2225,
			y: GAME_HEIGHT - 200,
			width: 75,
			height: GAME_HEIGHT - 200 - 300 + 1 // 300 gotten from platform 3, 1 for buffer in intersection
		},
		{ // 5 - First Inverted part
			x: 1800,
			y: GAME_HEIGHT,
			width: 1000,
			height: 50
		},
		{
			x: 3100,
			y: GAME_HEIGHT - 200,
			width: 200,
			height: 30
		},
		{
			x: 3600,
			y: GAME_HEIGHT - 300,
			width: 200,
			height: 30
		},
		{ // Cave enterance
			x: 4200,
			y: GAME_HEIGHT - 360,
			width: 60,
			height: 245
		},
		{ // Cave roof
			x: 4000,
			y: GAME_HEIGHT,
			width: 3000,
			height: 360
		},
		{ // Cave floor
			x: 4000,
			y: 360,
			width: 3000,
			height: 360
		},
		{
			x: 6500,
			y: GAME_HEIGHT - 360,
			width: 100,
			height: 70
		}
	],
	spikes: [
		{ // Cave spike
			x: 4700,
			y: 390,
			width: 250,
			height: 30
		},
		{
			x: 5600,
			y: 600,
			width: 40,
			height: 240
		},
		{
			x: 6500,
			y: 380,
			width: 100,
			height: 20
		}
	]
};