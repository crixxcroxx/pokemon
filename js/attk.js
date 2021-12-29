import utils from "./utils.js"

//refer to https://bulbapedia.bulbagarden.net/wiki/Damage
//for damage calculation

export default function attk(caster, target, types) {
  const { move, pokemon } = caster

  //checks if the attacker is the user or enemy
  let hp_bar = ""
  if("customID" in pokemon) {
    hp_bar = "#enemy-hp"
  } else {
    hp_bar = "#char-hp"
  }

  let attack = 0
  let defense = 0
  let total_dmg = 0

  //physical attack will be reduced depending on target's physical defense
  //and special attack will be reduced depending on target's special defense
  if (move.class == "physical") {
    attack = pokemon.stats.attack
    defense = target.pokemon.stats.defense
  } else if (move.class == "special"){
    attack = pokemon.stats.special_attack
    defense = target.pokemon.stats.special_defense
  }

  //total damage formula based on bulbapedia.net
  total_dmg = Math.round((1000 * /**/(((((2 * pokemon.level) / 5) + 2 ) * move.power * (attack / defense) / 50) + 2)/**/) / 1000)

  //checks the damage type for effectiveness of the attack
  //before calculating the final damage
  let dmg_type = ""
  target.pokemon.type.map(t => {
    let mov = types[move.type]

    for(let key in mov) {
      let idx = mov[key].findIndex(i => i == t)
      if(idx != -1) { dmg_type = key; break; }
    }
  })

  //attack is super effective
  //damage is doubled
  if(dmg_type == "double_damage_to") {
    const message = "It's super effective!"
    target.hp.current_hp -= (total_dmg * 2)

    battleEvent({
      current_hp: target.hp.current_hp,
      max_hp: target.hp.max_hp
    }, hp_bar, message)

    return (total_dmg * 2)
  }

  //attack is not very effective
  //damage is halved
  else if(dmg_type == "half_damage_to") {
    const message = "It's not very effective."
    target.hp.current_hp -= (total_dmg / 2)

    battleEvent({
      current_hp: target.hp.current_hp,
      max_hp: target.hp.max_hp
    }, hp_bar, message)

    return (total_dmg / 2)
  }

  //attack has no damage
  else if (dmg_type == "no_damage_to") {
    const message = "Dealt no damage."
    target.hp.current_hp -= 0

    battleEvent({
      current_hp: target.hp.current_hp,
      max_hp: target.hp.max_hp
    }, hp_bar, message)

    return 0
  }

  //attack inflicts normal damage
  else {
    target.hp.current_hp -= total_dmg

    battleEvent({
      current_hp: target.hp.current_hp,
      max_hp: target.hp.max_hp
    }, hp_bar, false)

    return total_dmg
  }

}

//helper function
const battleEvent = (hp, hp_bar, message) => {
  const {current_hp, max_hp} = hp

  if(current_hp <= 0) {
    utils.$(hp_bar).style.width = 0
  } else {
    utils.$(hp_bar).style.width = `${100 / (max_hp / current_hp)}%`
  }

  if(message) {
    utils.delay(1000).then(() => {
      utils.$("#message").innerText = message
    })
  }
}