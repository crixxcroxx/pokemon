const poke_list = [];
const poke_types = {};
const jsonData = {};

async function fetchData() {
  //only fetch pokemon from Kanto region
  let url = `https://pokeapi.co/api/v2/pokedex/2/`
  let data = await (await fetch(url).catch(handleErr)).json()

  if(data.code && data.code == 404) {
    return;
  }

  await getPokemon(data)
  await fetchPokeTypes()
  await fJson()

  return {poke_list, poke_types, jsonData}
}

//fetch keyframes.json and message.json
async function fJson() {
  const [kfRes, mRes] = await Promise.all([
    fetch('../data/keyframes.json'),
    fetch('../data/message.json')
  ]);

  jsonData.keyframes = await kfRes.json()
  jsonData.message = await mRes.json()

  return jsonData
}

//fetch pokemon types for reference of move effectiveness
//(super effective, not very effective and no damage)
async function fetchPokeTypes() {
  let url = `https://pokeapi.co/api/v2/type`
  let data = await (await fetch(url).catch(handleErr)).json()

  const t = data.results.map(async type => {
    let d = await (await fetch(type.url).catch(handleErr)).json()
    let d_dmg = d.damage_relations.double_damage_to.map(m => m.name)
    let h_dmg = d.damage_relations.half_damage_to.map(m => m.name)
    let n_dmg = d.damage_relations.no_damage_to.map(m => m.name)

    poke_types[type.name] = {
      double_damage_to: d_dmg,
      half_damage_to: h_dmg,
      no_damage_to: n_dmg
    }
  })
}

async function getPokemon(data) {
  const p = data.pokemon_entries.map(async pokemon => {
    let p_sp = await (await fetch(pokemon.pokemon_species.url).catch(handleErr)).json()

    //only filter pokemons from specified habitat
    //and also not the evolved form
    //for full list of habitat refer to https://pokeapi.co/api/v2/pokemon-habitat/
    if(
      (p_sp.habitat.name == `forest` && p_sp.evolves_from_species == null) ||
      (p_sp.habitat.name == `grassland` && p_sp.evolves_from_species == null) ||
      (p_sp.habitat.name == `mountain` && p_sp.evolves_from_species == null) ||
      (p_sp.habitat.name == `urban` && p_sp.evolves_from_species == null) ||
      (p_sp.habitat.name == `waters-edge` && p_sp.evolves_from_species == null)
    ) {
      let poke_data = await (await
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.entry_number}/`).catch(handleErr)).json()

      //get moves
      getMoves(poke_data).then(move_list => {
        //get stats
        let stats = {}
        for (let i = 0; i < poke_data.stats.length; i++) {
          if(poke_data.stats[i].stat.name == `special-attack`) {
            stats.special_attack = poke_data.stats[i].base_stat
          } else if(poke_data.stats[i].stat.name == `special-defense`) {
            stats.special_defense = poke_data.stats[i].base_stat
          } else {
            stats[poke_data.stats[i].stat.name] = poke_data.stats[i].base_stat
          }
        }

        //get types
        let types = []
        for (let i = 0; i < poke_data.types.length; i++) {
          types.push(poke_data.types[i].type.name)
        }

        //after getting moves, stats and types
        //add pokemon to poke_list
        poke_list.push({
          id: poke_data.id,
          name: poke_data.name,
          type: types,
          stats: stats,
          base_exp: poke_data.base_experience,
          moves: move_list,
          sprites: {
            front: poke_data.sprites.front_default,
            back: poke_data.sprites.back_default,
          }
        })
      }).catch(err => handleErr(err))
    }
  })
}

async function getMoves(data) {
  let { moves } = data
  let move_list = []

  //get first four moves
  for (let i = 0; i < 4; i++) {
    if(moves[i] != undefined) {
      let poke_move = await (await fetch(moves[i].move.url).catch(handleErr)).json()

      //filter only damage type moves
      if(poke_move.meta.category.name == `damage`) {
        //add to move_list
        move_list.push({
          name: poke_move.name,
          class: poke_move.damage_class.name,
          type: poke_move.type.name,
          power: poke_move.power,
          accuracy: poke_move.accuracy,
          pp: poke_move.pp,
          desc: poke_move.effect_entries[0].effect
        })
      }
    }
  }

  return move_list
}

function handleErr(err) {
  console.warn(err)
  let res = new Response(
    JSON.stringify({
      code: 404,
      message: `Network Error`
    })
  )
}

/**/
document.addEventListener('DOMContentLoaded', () => {
  fetchData().then(data => {
    import(`./states.js`).then(({states}) => {
      states.init(data)
    })
  }).catch(err => {
    //fetch error
    //dislay error message
    import(`./utils.js`).then(({utils}) => {
      import(`./templates.js`).then(({templates}) => {
        let parent = utils.$(`.container`)
        utils.removeChildren(parent)

        const fetchErr = document.createElement(`div`)
        fetchErr.className = `fetch_err`
        fetchErr.innerHTML = templates.fetch_err(err)

        utils.$(`.container`).appendChild(fetchErr)
        utils.$(`#refresh`).style.padding = `0.5rem 1rem`
        utils.$(`#refresh`).style.fontSize = `16px`
        utils.$(`#refresh`).style.margin = `16px 0`

        utils.$(`#refresh`).addEventListener(`click`, () => { location.reload() })
      })
    })

  })
})
