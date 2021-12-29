import Character from "../character.js";
import { setCharSprite, drawGame } from "../drawGame.js";

import templates from "../templates.js";
import utils from "../utils.js";

export default function stateIntro(data) {
  const { KEYFRAMES, MESSAGE, POKE_DB } = data
  let u_name = ""
  let u_gender = ""
  let u_pokemon = {}

  //welcome screen
  const welcome_screen = document.createElement("div")
  welcome_screen.className = "game-screen welcome"
  welcome_screen.innerHTML = templates.intro()
  utils.$(".container").insertBefore(welcome_screen, utils.$("#canvas"))

  utils.$(".intro-forms").style.display = "none"
  utils.animateElement(utils.$(".welcome"), KEYFRAMES.fadeIn, 300)

  utils.$("#intro-msg").innerText = MESSAGE.intro[0]

  //intro messages
  let numClick = 1
  utils.$(".next").addEventListener("click", () => {
    utils.$("#intro-msg").innerText = MESSAGE.intro[numClick]

    //set gender
    if(numClick == 10) {
      utils.$(".next").disabled = true

      utils.$(".intro-forms").style.display = "flex"
      utils.$(".form-gender").style.display = "flex"
      utils.animateElement(utils.$(".form-gender"), KEYFRAMES.fadeIn, 200)

      utils.$(".gender-btn").addEventListener("click", ev => {
        ev.preventDefault()

        let r_btns = document.querySelectorAll("input[name = 'gender']")
        for(let r_btn of r_btns) {
          if(r_btn.checked)
            u_gender = r_btn.value
        }

        utils.$(".form-gender").style.display = "none"
        utils.$(".form-nickname").style.display = "flex"
        utils.$("#intro-msg").innerText = MESSAGE.intro[numClick++]
      })

      //set nickname
      utils.$(".nickname-btn").addEventListener("click", ev => {
        ev.preventDefault()
        u_name = utils.$("#nickname").value

        if(u_name !== "") {
          utils.animateElement(utils.$(".intro-forms"), KEYFRAMES.fadeOut, 200).then(() => {
            utils.$(".intro-forms").style.display = "none"
          })
          utils.$(".intro-forms").removeChild(utils.$(".form-gender"))
          utils.$("#intro-msg").innerText = MESSAGE.intro[numClick++]

          utils.$(".next").disabled = false
        } else {
          utils.$("#nickname").style.setProperty("--placeholder-clr", "red");
          utils.$("#nickname").placeholder = "Required!"
          utils.$("#nickname").style.border = "2px solid red"
        }
      })
    }

    //choose pokemon
    else if(numClick == 16) {
      utils.$(".next").disabled = true
      utils.$(".intro-forms").removeChild(utils.$(".form-nickname"))
      utils.$(".intro-forms").style.display = "flex"
      utils.animateElement(utils.$(".intro-forms"), KEYFRAMES.fadeIn, 200)

      utils.$(".form-pokemon").style.display = "flex"

      utils.$(".pokemon-btn").addEventListener("click", ev => {
        ev.preventDefault()

        let r_btns = document.querySelectorAll("input[name = 'pokemon']")
        for(let r_btn of r_btns) {
          if(r_btn.checked) {
            u_pokemon = POKE_DB[POKE_DB.findIndex(idx => idx.id == r_btn.value)]
          }
        }

        utils.animateElement(utils.$(".intro-forms"), KEYFRAMES.fadeOut, 200).then(() => {
          utils.$(".intro-forms").style.display = "none"
        })
        utils.$("#intro-msg").innerText = MESSAGE.intro[numClick++]

        utils.$(".next").disabled = false
      })
    }

    //draw game
    else if(numClick == 21) {
      utils.$(".next").disabled = true

      //create new character
      const player = new Character({
        name: u_name,
        gender: u_gender,
        pokemon: u_pokemon
      })

      //set character sprite depending on gender
      setCharSprite(player.gender)

      //fade out welcome_screen and remove from DOM
      utils.delay(500).then(() => {
        utils.animateElement(utils.$(".welcome"), KEYFRAMES.fadeOut, 1000).then(() => {
        utils.$(".container").removeChild(utils.$(".welcome"))
        })
      })

      //draw world
      setInterval(() => {
        drawGame(player, POKE_DB)
      }, 45);
    } else {
      utils.$(".next").disabled = false
    }
    numClick++
  })
}