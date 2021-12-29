import stateIntro from "./states/stateIntro.js";
import stateEncounter from "./states/stateEncounter.js";
import stateBattle from "./states/stateBattle.js";

import utils from "./utils.js";

const data = {}

const states = {
  /* initialize */
  init: (d) => {
    //store in data object
    data.KEYFRAMES = d.jsonData.keyframes
    data.MESSAGE = d.jsonData.message
    data.POKE_DB = d.poke_list
    data.POKE_TYPES = d.poke_types

    Object.freeze(data)

    utils.animateElement(utils.$(".loader"), data.KEYFRAMES.fadeOut, 500).then(() => {
      utils.$(".container").removeChild(utils.$(".loader"))
      states.intro(data)
    })
  },
  intro: data => stateIntro(data),
  /* player can move when states.roam is true */
  roam: true,
  encounter: (player, enemy) => stateEncounter(data, player, enemy),
  battle: (player, enemy) => stateBattle(data, player, enemy)
}

export default states