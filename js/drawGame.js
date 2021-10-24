import { utils } from "./utils.js";
import { states } from "./states.js";

//fetch world-map.json for canvas postion of sprites
//and map-frames.json for image frames
let data = {}
let f = (async function () {
  const [wm, wf] = await Promise.all([
    fetch('data/world-map.json'),
    fetch('data/map-frames.json')
  ]);

  data.WORLD_MAP = await wm.json()
  data.MAP_FRAMES = await wf.json()
})()

const canvas = utils.$(`#canvas`)
const ctx = canvas.getContext(`2d`)
canvas.width = 576
canvas.height = 448

const image = {}
image.mainTileset = new Image()
image.mainTileset.src = `img/main-tileset.png`
image.waterTileset = new Image()
image.waterTileset.src = `img/water-tileset.png`
image.grassTileset = new Image()
image.grassTileset.src = `img/grass-tileset.png`
image.pokeTileset = new Image()
image.pokeTileset.src = `img/chaoticcherrycake.png`
image.bushSprite = new Image()
image.bushSprite.src = `img/bush.png`
image.charSprite = new Image()
image.charSprite.src = ``

//set image according to gender
export const setCharSprite = gender => {
	if(gender == `Male`) {
		return image.charSprite.src = `img/c_male1.png`
	} else if (gender == `Female`) {
		return image.charSprite.src = `img/c_female1.png`
	}
}

//this app uses 32px by 32px sprite sheets thus the TILE_WIDTH & TILE_HEIGHT is 32
//MAP_WIDTH & MAP_HEIGHT is computed by dividing the canvas width by TILE_WIDTH
//and canvas height by TILE_HEIGHT
const TILE_WIDTH = 32
const TILE_HEIGHT = 32
const MAP_WIDTH = 18
const MAP_HEIGHT = 14

//key handlers
const key = {}
// w = keyCode[87] > move up
// a = keyCode[65] > move left
// s = keyCode[83] > move down
// d = keyCode[68] > move right
document.addEventListener('keydown', e => {
  key[e.keyCode] = true
})
document.addEventListener('keyup', e => {
  key[e.keyCode] = false
})

//function to draw all the sprites on canvas
//and key event handlers for player movement
export const drawGame = (player, pokeDB) => {
	//character movement
	if(player.processMovement()) {
		if(key[87] && player.isMoving == false) {
			if(
				data.WORLD_MAP.collision[utils.getIndex(player.tileFrom.x, player.tileFrom.y) - MAP_WIDTH] == 0
				&& player.tileTo.y > 0
			) {
				player.tileTo.y -= 1
			
				//bush collision
				if(data.WORLD_MAP.bush[utils.getIndex(player.tileFrom.x, player.tileFrom.y)] != 0) {
					//pokemon encounter
					let chance_enc = Math.floor(Math.random() * 5)
          if(chance_enc == 1) {
            let idx = Math.floor(Math.random() * pokeDB.length)
            if(idx == player.pokemon.id) idx += 1
            let enemy = pokeDB[idx]
            let e_lvl = Math.floor((Math.random() * 5) + 1)
            enemy.level = e_lvl

						states.encounter(enemy)
          }
				}
			}
			if(player.frame.y != 3) player.frame.y = player.moveDirection.up
		}
		else if(key[83] && player.isMoving == false) { 
			if(
				data.WORLD_MAP.collision[utils.getIndex(player.tileFrom.x, player.tileFrom.y) + MAP_WIDTH] == 0
				&& player.tileTo.y < MAP_HEIGHT - 1
			) {
				player.tileTo.y += 1

				//bush collision
				if(data.WORLD_MAP.bush[utils.getIndex(player.tileFrom.x, player.tileFrom.y)] != 0) {
          //pokemon encounter
					let chance_enc = Math.floor(Math.random() * 5)
          if(chance_enc == 1) {
            let idx = Math.floor(Math.random() * pokeDB.length)
            if(idx == player.pokemon.id) idx += 1
            let enemy = pokeDB[idx]
            let e_lvl = Math.floor((Math.random() * 5) + 1)
            enemy.level = e_lvl

						states.encounter(enemy)
          }
				}
			}
			if(player.frame.y != 0) player.frame.y = player.moveDirection.down
		}
		else if(key[65] && player.isMoving == false) { 
			if(
				data.WORLD_MAP.collision[utils.getIndex(player.tileFrom.x, player.tileFrom.y) - 1] == 0
				&& player.tileTo.x > 0
			) {
				player.tileTo.x -= 1

				//bush collision
				if(data.WORLD_MAP.bush[utils.getIndex(player.tileFrom.x, player.tileFrom.y)] != 0) {
					//pokemon encounter
					let chance_enc = Math.floor(Math.random() * 5)
          if(chance_enc == 1) {
            let idx = Math.floor(Math.random() * pokeDB.length)
            if(idx == player.pokemon.id) idx += 1
            let enemy = pokeDB[idx]
            let e_lvl = Math.floor((Math.random() * 5) + 1)
            enemy.level = e_lvl

						states.encounter(enemy)
          }
				}
			}
			if(player.frame.y != 1) player.frame.y = player.moveDirection.right
		}
		else if(key[68] && player.isMoving == false) { 
			if(
				data.WORLD_MAP.collision[utils.getIndex(player.tileFrom.x, player.tileFrom.y) + 1] == 0
				&& player.tileTo.x <  MAP_WIDTH - 1
			) {
				player.tileTo.x += 1

				//bush collision
				if(data.WORLD_MAP.bush[utils.getIndex(player.tileFrom.x, player.tileFrom.y)] != 0) {
					//pokemon encounter
					let chance_enc = Math.floor(Math.random() * 5)
          if(chance_enc == 1) {
            let idx = Math.floor(Math.random() * pokeDB.length)
            if(idx == player.pokemon.id) idx += 1
            let enemy = pokeDB[idx]
            let e_lvl = Math.floor((Math.random() * 5) + 1)
            enemy.level = e_lvl

						states.encounter(enemy)
          }
				}
			}
			if(player.frame.y != 2) player.frame.y = player.moveDirection.left
		}
	}//!end processMovement()
	
	//draw sprites
	//z is for layering of sprites on canvas 
	//z == 0 appears at the very bottom
	for (let z = 0; z < 6; z++) {
		//x and y are coordinates x and y and are used for plotting
		//the positions of the sprites on canvas
    for (let y = 0; y < MAP_HEIGHT; y++) {
      for (let x = 0; x < MAP_WIDTH; x++) {
        //base
        if (z == 0) {
          drawImg(image.mainTileset, {x: x, y: y}, data.MAP_FRAMES.base[1])
        }

        //river and hill
        if (z == 1) {
          let val = data.WORLD_MAP.river_hill[utils.getIndex(x, y)]

          if(val >= 295 && val <= 325) {
            drawImg(image.waterTileset, {x: x, y: y}, data.MAP_FRAMES.river_hill[val])
          } else if(val >= 75 && val <= 147) {
            drawImg(image.mainTileset, {x: x, y: y}, data.MAP_FRAMES.river_hill[val])
          }
        }

        //bridge and biome
        if (z == 2) {
          //bridge
          let bridge_val = data.WORLD_MAP.bridge[utils.getIndex(x, y)]

          if(bridge_val != 0) {
            drawImg(image.mainTileset, {x: x, y: y}, data.MAP_FRAMES.bridge[bridge_val])
          }

          //biome
          let biome_val = data.WORLD_MAP.biome[utils.getIndex(x, y)]

          if(biome_val >= 50 && biome_val <= 53) {
            drawImg(image.mainTileset, {x: x, y: y}, data.MAP_FRAMES.biome[biome_val])
          } else if(biome_val >= 392 && biome_val <= 424) {
            drawImg(image.pokeTileset, {x: x, y: y}, data.MAP_FRAMES.biome[biome_val])
          } else if(biome_val >= 457 && biome_val <= 528) {
            drawImg(image.grassTileset, {x: x, y: y}, data.MAP_FRAMES.biome[biome_val])
          }
        }

        //bush(background), house and tree_trunk
        if (z == 3) {
          //bush(background)
          let bush_val = data.WORLD_MAP.bush[utils.getIndex(x, y)]

          if(bush_val != 0) {
            drawImg(image.bushSprite, {x: x, y: y}, data.MAP_FRAMES.bush.bg[bush_val])
          }

          //house
          let house_val = data.WORLD_MAP.house[utils.getIndex(x, y)]

          if(house_val >= 117 && house_val <= 237) {
            drawImg(image.mainTileset, {x: x, y: y}, data.MAP_FRAMES.house[house_val])
          } else if(house_val >= 388 && house_val <= 447) {
            drawImg(image.pokeTileset, {x: x, y: y}, data.MAP_FRAMES.house[house_val])
          }

          //tree_trunk
          let tree_val = data.WORLD_MAP.tree_trunk[utils.getIndex(x, y)]

          if(tree_val != 0) {
            drawImg(image.mainTileset, {x: x, y: y}, data.MAP_FRAMES.tree_trunk[tree_val])
          }
        }

        //bush(foreground) and tree_top
        if (z == 5) {
          //bush(foreground)
          let bush_val = data.WORLD_MAP.bush[utils.getIndex(x, y)]

          if(bush_val != 0) {
            drawImg(image.bushSprite, {x: x, y: y}, data.MAP_FRAMES.bush.fg[bush_val])
          }

          //tree_top
          let tree_val = data.WORLD_MAP.tree_top[utils.getIndex(x, y)]

          if(tree_val != 0) {
            drawImg(image.mainTileset, {x: x, y: y}, data.MAP_FRAMES.tree_top[tree_val])
          }
        }

      }//!end x
    }//!end y

    //character sprite
    if (z == 4) {
      drawImg(
        image.charSprite,
        {x: player.position.x / TILE_WIDTH,
          y: player.position.y / TILE_HEIGHT},
          {x: player.frame.x, y: player.frame.y}
      )
    }
  }//!end draw sprites
}

//draw image function
//requires 3 parameters
//1. image source(full image),
//2. position on canvas where the image will be drawn
//3. frame from image source which will be displayed
const drawImg = (imgSrc, pos, fr) => {
	const frame = { x: fr.x, y: fr.y }
	const position = {
		x: pos.x * TILE_WIDTH,
		y: pos.y * TILE_HEIGHT
	}
	const source = {
		x: frame.x * TILE_WIDTH,
		y: frame.y * TILE_HEIGHT
	}
	
	//canvas method to draw image
	//for more info about ctx.drawImage() refer to
	//https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
	ctx.drawImage(
		imgSrc,
		source.x,
		source.y,
		TILE_WIDTH,
		TILE_HEIGHT,
		position.x,
		position.y,
		TILE_WIDTH,
		TILE_HEIGHT
	);
}

