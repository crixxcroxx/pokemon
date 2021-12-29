import states from "../states.js";

import templates from "../templates.js";
import utils from "../utils.js";

export default function stateEncounter(data, player, enemy) {
  const { KEYFRAMES } = data

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
      if(key == "hp") {
        //add 10 HP per level
        enemy.stats.hp += (10 * (enemy.level - 1))
      } else {
        //and 3 points per level for other stats
        //(attack, defense, speed, SP-attack and SP-defense)
        enemy.stats[key] += (3 * (enemy.level - 1))
      }
    }

    //create battle_ui element
    const battle_ui = document.createElement("div")
    battle_ui.className = "game-screen battle-ui"
    battle_ui.innerHTML = templates.battle_ui(
      {
        name: player.pokemon.name,
        level: player.pokemon.level,
        hp: 100 / (player.MAX_HP / player.pokemon_hp),
        img: player.pokemon.sprites.back
      },
      {name: enemy.name, level: enemy.level, img: enemy.sprites.front})
    utils.$(".container").insertBefore(battle_ui, utils.$("#canvas"))

    //show battle_ui
    utils.animateElement(utils.$(".battle-ui"), KEYFRAMES.scaleUp, 250).then(() => {
      utils.animateElement(utils.$("#enemy-img"), KEYFRAMES.fadeIn, 500)
      utils.animateElement(utils.$("#enemy-img"), KEYFRAMES.moveLeft, 500).then(() => {
        utils.$(".enemy-inf").style.opacity = 1
        utils.$("#message").innerText = `A wild ${enemy.name.toUpperCase()} appeared! What will ${player.name.toUpperCase()} do?`
      })
    })

    states.roam = false

    //call battle() state
    states.battle(player, enemy)

    //flee from battle if run button is clicked
    utils.$("#btn-run").addEventListener("click", () => {
      document.querySelectorAll(".btn-grp button").forEach(elem => {
        elem.disabled = true;
      });
      utils.$(".inf").removeChild(utils.$(".skills"))
      utils.$(".inf").removeChild(utils.$(".bag"))
      utils.$("#message").innerText = "You have escaped the battle."

      //1s delay before closing battle_ui
      utils.delay(1000).then(() => {
        utils.animateElement(utils.$(".battle-ui"), KEYFRAMES.fadeOut, 500).then(() => {
          utils.$(".container").removeChild(utils.$(".battle-ui"))
          states.roam = true
        })
      })
    })
}
