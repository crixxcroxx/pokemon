import { states } from "./states.js";
import { utils } from "./utils.js"

//32px by 32px sprite sheet
const TILE_WIDTH = 32
const TILE_HEIGHT = 32

const key = {}
//key handlers
document.addEventListener('keydown', e => {
	key[e.keyCode] = true
})
document.addEventListener('keyup', e => {
	key[e.keyCode] = false
})

export function Character(attrib) {
	const canvas = utils.$(`#canvas`)
	const ctx = canvas.getContext(`2d`)

	const pokemon = attrib.pokemon

  Object.defineProperty(this, `name`, {
    get: function() {
      return attrib.name
    }
  })

  Object.defineProperty(this, `gender`, {
    get: function() {
      return attrib.gender
    }
  })

  //starting level is 5
  pokemon.level = 5

  //create custom id property for pokemon
  pokemon.customID = `pp-1`

  //change pokemon and move's stats depending on level
	pokemon.moves.map(move => move.power += (5 * (pokemon.level - 1)))
  for(let key in pokemon.stats) {
    if(key == `hp`) {
      pokemon.stats.hp += (15 * (pokemon.level - 1))
    } else {
      pokemon.stats[key] += (5 * (pokemon.level - 1))
    }
  }

  //getter function for pokemon
  Object.defineProperty(this, `pokemon`, {
    get: function() {
      return Object.freeze(pokemon)
    }
  })

  //getter function for MAX HP
  const MAX_HP = pokemon.stats.hp
  Object.defineProperty(this, `MAX_HP`, {
    get: function() {
      return MAX_HP
    }
  })

  this.pokemon_hp = pokemon.stats.hp
	
	/**/
	//initial state and position of the player on game start
	this.position = {x: 32, y: 320}
	this.frame = {x: 1, y: 0}
	this.tileFrom = {x: 1, y: 10}
	this.tileTo = {x: 1, y: 10}
	this.moveDirection = {
		up: 3, down: 0,
		left: 2, right: 1,
	}

	this.isMoving = false
	
	const framePattern = [2, 1, 0, 1]
	let frameCounter = 0

	//default inventory for new player
	this.bag = [
		{
			name: `Potion`,
			data: {
				effect: 10,
				desc: `Heals 10 HP`,
				pcs: 5
			}
			
		},
		{
			name: `Pokeball`,
			data: {
				effect: null,
				desc: `Used to catch wild Pokemon`,
				pcs: 0
			}
		}
	]

	//sprite walking animation
	const animate = () => {
		if(frameCounter < framePattern.length) {
			this.frame.x = framePattern[frameCounter]
			frameCounter++
		}
		else {
			frameCounter = 0
		}
	}
	
	//player movement
	this.processMovement = () => {
		if(states.roam == true) {
			if(
				this.position.y == this.tileTo.y * TILE_HEIGHT &&
				this.position.x == this.tileTo.x * TILE_WIDTH
			) {
				this.tileFrom.y = this.tileTo.y
				this.tileFrom.x = this.tileTo.x
				this.isMoving = false
				
				if(key[87] || key[83] || key[68] || key[65]) { 
					animate()
				} else { this.frame.x = 1 }
			}
			
			if(this.tileTo.y != this.tileFrom.y) {
				ctx.clearRect(this.position.x, this.position.y, TILE_WIDTH, TILE_HEIGHT);
				this.position.y += this.tileTo.y > this.tileFrom.y ? 2 : -2
				this.isMoving = true
				animate()
			}
			if(this.tileTo.x != this.tileFrom.x) {
				ctx.clearRect(this.position.x, this.position.y, TILE_WIDTH, TILE_HEIGHT);
				this.position.x += this.tileTo.x > this.tileFrom.x ? 2 : -2
				this.isMoving = true
				animate()
			}
			
			return true
		}
	}

	//method for calculating heal effect
	this.usePotion = hp => {
    let idx = this.bag.findIndex(item => item.name == `Potion`)
    let potion = this.bag[idx].data
    let { pcs, effect } = potion

    //check if there is potion in bag
		if(pcs > 0) {
			//check if HP is not full
			if(hp < MAX_HP) {
        //deduct one potion on bag
        this.bag[idx].data.pcs -= 1
				let parent = utils.$(`.bag`)

				//do not exceed heal to MAX_HP
				if((effect + hp) > MAX_HP) {
					let heal = effect - ((effect + hp) - MAX_HP)
          this.pokemon_hp += heal

          utils.removeChildren(parent)
					utils.$(`#message`).innerText = `Used potion and recovered ${heal} HP`
				}
				//normal heal
				else {
          this.pokemon_hp += effect

          utils.removeChildren(parent)
					utils.$(`#message`).innerText = `Used potion and recovered ${effect} HP`
				}

				//return 1 determines if heal is successful
				return 1
			} else {
				utils.$(`.bag`).style.display = `none`
				utils.$(`#message`).innerText = `Cannot use potion if POKEMON HP is full`

				utils.delay(2000).then(() => {
          utils.$(`#message`).innerText = ``
					utils.$(`.bag`).style.display = `flex`

					//enables all buttons back
					document.querySelectorAll('.btn-grp button').forEach(elem => {
						elem.disabled = false;
					});
				})
			}
		} //else no potion left
	}
}
