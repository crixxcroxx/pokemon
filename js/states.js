import { templates } from "./templates.js";
import { utils } from "./utils.js";

let player = {}
let data = {}

export const states = {
  //** INITIALIZE **//
  init: (d) => {
    //store in data object
    data.KEYFRAMES = d.jsonData.keyframes
    data.MESSAGE = d.jsonData.message
    data.POKE_DB = d.poke_list
    data.POKE_TYPES = d.poke_types

    Object.freeze(data)

    utils.animateElement(utils.$(`.loader`), data.KEYFRAMES.fadeOut, 500).then(() => {
      utils.$(`.container`).removeChild(utils.$(`.loader`))
      states.intr(data.POKE_DB)
    })
  },

  //** INTRO **//
  intr: (p_data) => {
    let u_name = ``
    let u_gender = ``
    let u_pokemon = {}

    //welcome screen
    const welcome_screen = document.createElement(`div`)
    welcome_screen.className = `game-screen welcome`
    welcome_screen.innerHTML = templates.intro()
    utils.$(`.container`).insertBefore(welcome_screen, utils.$(`#canvas`))
    
    utils.$(`.intro-forms`).style.display = `none`
    utils.animateElement(utils.$(`.welcome`), data.KEYFRAMES.fadeIn, 300)

    utils.$(`#intro-msg`).innerText = data.MESSAGE.intro[0]

    //intro messages
    let numClick = 1
    utils.$(`.next`).addEventListener(`click`, () => {
      utils.$(`#intro-msg`).innerText = data.MESSAGE.intro[numClick]
      
      //set gender
      if(numClick == 10) { 
        utils.$(`.next`).disabled = true

        utils.$(`.intro-forms`).style.display = `flex`
        utils.$(`.form-gender`).style.display = `flex`
        utils.animateElement(utils.$(`.form-gender`), data.KEYFRAMES.fadeIn, 200)

        utils.$(`.gender-btn`).addEventListener(`click`, ev => {
          ev.preventDefault()

          let r_btns = document.querySelectorAll(`input[name = "gender"]`)
          for(let r_btn of r_btns) {
            if(r_btn.checked) 
              u_gender = r_btn.value
          }

          utils.$(`.form-gender`).style.display = `none`
          utils.$(`.form-nickname`).style.display = `flex`
          utils.$(`#intro-msg`).innerText = data.MESSAGE.intro[numClick++]
        })
        
        //set nickname
        utils.$(`.nickname-btn`).addEventListener(`click`, ev => {
          ev.preventDefault()
          u_name = utils.$(`#nickname`).value

          if(u_name !== ``) {
            utils.animateElement(utils.$(`.intro-forms`), data.KEYFRAMES.fadeOut, 200).then(() => {
              utils.$(`.intro-forms`).style.display = `none`
            })
            utils.$(`.intro-forms`).removeChild(utils.$(`.form-gender`))
            utils.$(`#intro-msg`).innerText = data.MESSAGE.intro[numClick++]

            utils.$(`.next`).disabled = false
          } else {
            utils.$(`#nickname`).style.setProperty(`--placeholder-clr`, `red`);
            utils.$(`#nickname`).placeholder = `Required!`
            utils.$(`#nickname`).style.border = `2px solid red`
          }

        })
      }

      //choose pokemon
      else if(numClick == 16) { 
        utils.$(`.next`).disabled = true
        utils.$(`.intro-forms`).removeChild(utils.$(`.form-nickname`))
        utils.$(`.intro-forms`).style.display = `flex`
        utils.animateElement(utils.$(`.intro-forms`), data.KEYFRAMES.fadeIn, 200)

        utils.$(`.form-pokemon`).style.display = `flex`

        utils.$(`.pokemon-btn`).addEventListener(`click`, ev => {
          ev.preventDefault()
          
          let r_btns = document.querySelectorAll(`input[name = "pokemon"]`)
          for(let r_btn of r_btns) {
            if(r_btn.checked) {
              u_pokemon = p_data[p_data.findIndex(idx => idx.id == r_btn.value)]
            }
          }

          utils.animateElement(utils.$(`.intro-forms`), data.KEYFRAMES.fadeOut, 200).then(() => {
            utils.$(`.intro-forms`).style.display = `none`
          })
          utils.$(`#intro-msg`).innerText = data.MESSAGE.intro[numClick++]

          utils.$(`.next`).disabled = false
        })
      } 

      //draw game
      else if(numClick == 21) {
        utils.$(`.next`).disabled = true

        import(`./character.js`).then(({Character}) => {
          //create new character
          player = new Character(
            {
              name: u_name,
              gender: u_gender,
              pokemon: u_pokemon
            }
          )

          import(`./drawGame.js`).then(({setCharSprite, drawGame}) => {
            //set character sprite depending on gender
            setCharSprite(player.gender)
            
            //fade out welcome_screen and remove from DOM
            utils.delay(500).then(() => {
              utils.animateElement(utils.$(`.welcome`), data.KEYFRAMES.fadeOut, 1000).then(() => {
                utils.$(`.container`).removeChild(utils.$(`.welcome`))
              })
            })
            
            //draw world
            setInterval(() => {
              drawGame(player, p_data)
            }, 45);
          }).catch(err => console.error(err))
        }).catch(err => console.error(err))
      } else {
        utils.$(`.next`).disabled = false
      }
      
      numClick++
    })
  },

  //** ROAM STATE **//
  //player can move when states.roam is true
  roam: true,

  //** ENCOUNTER STATE **//
  encounter: (enemy) => {
    //pokemon ditto(pokemon id = 132) has no original attack moves,
    //refer to https://pokeapi.co/api/v2/pokemon/132,
    //so just copy player's pokemon moves
    //then reduce move's power stat to original values
    if (enemy.id == 132) {
      enemy.moves = player.pokemon.moves
      //5 is the additional power stat per level
      //for player's pokemon, see character.js
      enemy.moves.map(move => move.power -= (5 * (enemy.level - 1)))
    }

    //change enemy stats depending on level
    //only adding 3 points for move's power stat per level
    //compared to player's pokemon which is 5
    enemy.moves.map(move => move.power += (3 * (enemy.level - 1)))
    for(let key in enemy.stats) {
      if(key == `hp`) {
        //add 10 HP per level
        enemy.stats.hp += (10 * (enemy.level - 1))
      } else {
        //and 3 points per level for other stats
        //(attack, defense, speed, SP-attack and SP-defense)
        enemy.stats[key] += (3 * (enemy.level - 1))
      }
    }

    //create battle_ui element
    const battle_ui = document.createElement(`div`)
    battle_ui.className = `game-screen battle-ui`
    battle_ui.innerHTML = templates.battle_ui(
      {
        name: player.pokemon.name,
        level: player.pokemon.level,
        hp: 100 / (player.MAX_HP / player.pokemon_hp),
        img: player.pokemon.sprites.back
      },
      {name: enemy.name, level: enemy.level, img: enemy.sprites.front})
    utils.$(`.container`).insertBefore(battle_ui, utils.$(`#canvas`))

    //show battle_ui
    utils.animateElement(utils.$(`.battle-ui`), data.KEYFRAMES.scaleUp, 250).then(() => {
      utils.animateElement(utils.$(`#enemy-img`), data.KEYFRAMES.fadeIn, 500)
      utils.animateElement(utils.$(`#enemy-img`), data.KEYFRAMES.moveLeft, 500).then(() => {
        utils.$(`.enemy-inf`).style.opacity = 1
        utils.$(`#message`).innerText = `A wild ${enemy.name.toUpperCase()} appeared! What will ${player.name.toUpperCase()} do?`
      })
    })

    states.roam = false

    //call battle() state
    states.battle(enemy)
    
    //flee from battle if run button is clicked
    utils.$(`#btn-run`).addEventListener(`click`, () => {
      document.querySelectorAll('.btn-grp button').forEach(elem => {
        elem.disabled = true;
      });
      utils.$(`.inf`).removeChild(utils.$(`.skills`))
      utils.$(`.inf`).removeChild(utils.$(`.bag`))
      utils.$(`#message`).innerText = `You have escaped the battle.`

      //1s delay before closing battle_ui
      utils.delay(1000).then(() => {
        utils.animateElement(utils.$(`.battle-ui`), data.KEYFRAMES.fadeOut, 500).then(() => {
          utils.$(`.container`).removeChild(utils.$(`.battle-ui`))
          states.roam = true
        })
      })
    })
  },

  //** BATTLE STATE **//
  battle: (enemy) => {
    import(`./attk.js`).then(({attk}) => {
      //create copy of enemy hp
      let current_hp = {
        enemy: enemy.stats.hp
      }
      const MAX_HP = {
        enemy: enemy.stats.hp,
        char: player.MAX_HP
      }
      Object.freeze(MAX_HP)

      //map moves
      utils.$(`.skills`).style.display = `none`
      player.pokemon.moves.map(move => {
        const btn = document.createElement(`button`)
        btn.innerText = move.name.toUpperCase()
        btn.id = move.name
        utils.$(`.skills`).appendChild(btn)

        utils.$(`#${move.name}`).addEventListener(`click`, () => {
          //disables all button to prevent multiple commands at the same time
          utils.disableButtons('.btn-grp button', true)

          utils.$(`.skills`).style.display = `none`
          utils.$(`#message`).innerText = `${player.pokemon.name.toUpperCase()} used ${move.name.toUpperCase()}`

          utils.animateElement(utils.$(`#char-img`), data.KEYFRAMES.pAttk, 300).then(() => {
            battle_seq(1, move)

            //during battle, if the enemy dies, battle-ui will close
            if(current_hp.enemy <= 0) {
              utils.$(`#message`).innerText = `${enemy.name.toUpperCase()} fainted`
              utils.$(`.inf`).removeChild(utils.$(`.skills`))

              //1s delay before closing battle-ui
              utils.delay(1000).then(() => {
                utils.$(`#enemy-img`).style.marginLeft = `4.1rem`
                utils.animateElement(utils.$(`#enemy-img`), data.KEYFRAMES.moveDown, 500)
                utils.animateElement(utils.$(`.battle-ui`), data.KEYFRAMES.fadeOut, 500).then(() => {
                  utils.$(`.container`).removeChild(utils.$(`.battle-ui`))
                  states.roam = true
                })
              })
            }
          })

        })
      })

      //show moves when attack button is clicked
      utils.$(`#btn-atk`).addEventListener(`click`, () => {
        utils.$(`#message`).innerText = ``
        utils.$(`.skills`).style.display = `flex`

        //when skill is displayed, .bag will be removed from the DOM
        //so whenever the bag button is clicked the buttons that corresponds
        //on each items will be updated(will be mapped again /* player.bag.map() */)
        let parent = utils.$(`.bag`)
        utils.removeChildren(parent)
      })

      //show items in bag when bag button is clicked
      utils.$(`#btn-bag`).addEventListener(`click`, () => {
        utils.$(`#message`).innerText = ``
        utils.$(`.bag`).style.display = `flex`

        //when bag is displayed, skills will be hidden
        utils.$(`.skills`).style.display = `none`

        //checks if bag is already displayed
        if(!utils.$(`.bag`).firstChild) {
          player.bag.map(item => {
            const btn = document.createElement(`button`)
            btn.innerText = item.name.toUpperCase()
            btn.id = item.name
            btn.title = item.data.desc
            utils.$(`.bag`).appendChild(btn)

            //checks if item pcs is greater than 0
            //if not, disables the button
            if(item.data.pcs > 0) {
              utils.$(`#${item.name}`).addEventListener(`click`, () => {
                //disables all button to prevent multiple commands at the same time
                utils.disableButtons('.btn-grp button', true)

                //enemy will attack after using potion
                if(player.usePotion(player.pokemon_hp) == 1) battle_seq(0, null)
                  utils.$(`#char-hp`).style.width = `${100 / (player.MAX_HP / player.pokemon_hp)}%`
              })
            } else { btn.disabled = true }
          })
        }
      })

      /*****************************/
      /* helper battle() functions */
      /*****************************/

      //battle sequence
      function battle_seq(token, move) {
        //user used potion so enemy will attack
        if(token == 0) {
          enemy_turn()
        }

        //normal battle sequence,
        //player's turn
        else {
          if(current_hp.enemy > 0) {
            //player's turn
            current_hp.enemy -=
            attk(
              {move: move, pokemon: player.pokemon},
              {hp: {max_hp: MAX_HP.enemy, current_hp: current_hp.enemy}, pokemon: enemy},
              data.POKE_TYPES
            )

            //enemy's turn
            if(current_hp.enemy > 0) {
              enemy_turn()
            }
          }
        }
      } //!end battle_seq()

      //enemy turn function
      function enemy_turn() {
        let e_move = enemy.moves[Math.floor(Math.random() * enemy.moves.length)]

        //1.5s delay before enemy attack
        utils.delay(2000).then(() => {
          utils.$(`#enemy-img`).style.marginLeft = `4.1rem`

          utils.animateElement(utils.$(`#enemy-img`), data.KEYFRAMES.eAttk, 300).then(() => {
            utils.$(`#message`).innerText = `${enemy.name.toUpperCase()} used ${e_move.name.toUpperCase()}`

            player.pokemon_hp -=
            attk(
              {move: e_move, pokemon: enemy},
              {hp: {max_hp: MAX_HP.char, current_hp: player.pokemon_hp}, pokemon: player.pokemon},
              data.POKE_TYPES
            )

            //resets message-box
            utils.delay(2000).then(() => {
              utils.$(`#message`).innerText = ``
              utils.$(`.skills`).style.display = `flex`

              //enables all buttons back
              utils.disableButtons('.btn-grp button', false)

              //if player's pokemon fainted during battle
              //display gameover ui
              if(player.pokemon_hp <= 0) {
                let parent = utils.$(`.status-box`)
                utils.removeChildren(parent)

                const g_over_screen = document.createElement(`div`)
                g_over_screen.className = `screen-overlay game-over`
                g_over_screen.innerHTML = templates.game_over()
                utils.$(`.container`).insertBefore(g_over_screen, utils.$(`.battle-ui`))

                utils.$(`#new-game`).addEventListener(`click`, () => { location.reload() })

                utils.animateElement(utils.$(`.game-over`), data.KEYFRAMES.fadeIn, 500)
              }
            })
          })
        })
      } //!end enemy_turn()
    }).catch(err => console.error(err))

  } //!end battle()
}
