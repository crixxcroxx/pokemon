import states from "../states.js";

import templates from "../templates.js";
import utils from "../utils.js";
import attk from "../attk.js";

export default function stateBattle(data, player, enemy) {
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
  utils.$(".skills").style.display = "none"
  player.pokemon.moves.map(move => {
    //create button for each move
    const btn = document.createElement("button")
    btn.innerText = move.name.toUpperCase()
    btn.id = move.name
    utils.$(".skills").appendChild(btn)

    utils.$(`#${move.name}`).addEventListener("click", () => {
      //disables all button to prevent multiple commands at the same time
      utils.disableButtons('.btn-grp button', true)

      utils.$(".skills").style.display = "none"
      utils.$("#message").innerText = `${player.pokemon.name.toUpperCase()} used ${move.name.toUpperCase()}`

      utils.animateElement(utils.$("#char-img"), data.KEYFRAMES.pAttk, 300).then(() => {
        battle_seq(1, move)

        //during battle, if the enemy dies, battle-ui will close
        if(current_hp.enemy <= 0) {
          utils.delay(500).then(() => {
            utils.$("#message").innerText = `${enemy.name.toUpperCase()} fainted`
            utils.$(".inf").removeChild(utils.$(".skills"))
          })

          //1s delay before closing battle-ui
          utils.delay(1500).then(() => {
            utils.$("#enemy-img").style.marginLeft = "4.1rem"
            utils.animateElement(utils.$("#enemy-img"), data.KEYFRAMES.moveDown, 500)

            utils.animateElement(utils.$(".battle-ui"), data.KEYFRAMES.fadeOut, 500).then(() => {
              utils.$(".container").removeChild(utils.$(".battle-ui"))
              states.roam = true
            })
          })
        }
      })

    })
  })

  //show moves when attack button is clicked
  utils.$("#btn-atk").addEventListener("click", () => {
    utils.$("#message").innerText = ""
    utils.$(".skills").style.display = "flex"

    //when skill is displayed, .bag will be removed from the DOM
    //so whenever the bag button is clicked the buttons that corresponds
    //on each items will be updated(will be mapped again /* player.bag.map() */)
    const parent = utils.$(".bag")
    utils.removeChildren(parent)
  })

  //show items in bag when bag button is clicked
  utils.$("#btn-bag").addEventListener("click", () => {
    utils.$("#message").innerText = ""
    utils.$(".bag").style.display = "flex"

    //when bag is displayed, skills will be hidden
    utils.$(".skills").style.display = "none"

    //checks if bag is already displayed
    if(!utils.$(".bag").firstChild) {
      player.bag.map(item => {
        const btn = document.createElement("button")
        btn.innerText = item.name.toUpperCase()
        btn.id = item.name
        btn.title = item.data.desc
        utils.$(".bag").appendChild(btn)

        //checks if item pcs is greater than 0
        //if not, disables the button
        if(item.data.pcs > 0) {
          utils.$(`#${item.name}`).addEventListener("click", () => {
            //disables all button to prevent multiple commands at the same time
            utils.disableButtons('.btn-grp button', true)

            //enemy will attack after using potion
            if(player.usePotion(player.pokemon_hp) == 1) battle_seq(0, null)

            utils.$("#char-hp").style.width = `${100 / (player.MAX_HP / player.pokemon_hp)}%`
          })
        } else { btn.disabled = true }

      })
    }

  })

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
  }

  //enemy turn
  function enemy_turn() {
    let e_move = enemy.moves[Math.floor(Math.random() * enemy.moves.length)]

    //1.5s delay before enemy attack
    utils.delay(2000).then(() => {
      utils.$("#enemy-img").style.marginLeft = "4.1rem"

      utils.animateElement(utils.$("#enemy-img"), data.KEYFRAMES.eAttk, 300).then(() => {
        utils.$("#message").innerText = `${enemy.name.toUpperCase()} used ${e_move.name.toUpperCase()}`

        player.pokemon_hp -=
        attk(
          {move: e_move, pokemon: enemy},
          {hp: {max_hp: MAX_HP.char, current_hp: player.pokemon_hp}, pokemon: player.pokemon},
          data.POKE_TYPES
        )

        //resets message-box
        utils.delay(2000).then(() => {
          utils.$("#message").innerText = ""
          utils.$(".skills").style.display = "flex"

          //enables all buttons back
          utils.disableButtons('.btn-grp button', false)

          //if player's pokemon fainted during battle
          //display gameover ui
          if(player.pokemon_hp <= 0) {
            let parent = utils.$(".status-box")
            utils.removeChildren(parent)

            const g_over_screen = document.createElement("div")
            g_over_screen.className = "screen-overlay game-over"
            g_over_screen.innerHTML = templates.game_over()
            utils.$(".container").insertBefore(g_over_screen, utils.$(".battle-ui"))

            utils.$("#new-game").addEventListener("click", () => { location.reload() })

            utils.animateElement(utils.$(".game-over"), data.KEYFRAMES.fadeIn, 500)
          }
        })

      })
    })
  } //!end enemy_turn()
}