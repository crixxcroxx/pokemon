export const templates = {
	intro: function() {
		return `
			<div class="intro-form-img-wrapper">
        <div class="intro-forms">
          <form class="form-gender">
            <h3 class="form-title">Gender</h3>

						<div>
						  <div class="form-grp">
						    <input type="radio" id="male" name="gender" value="Male" checked>
						    <label for="male">Male</label><br>
						  </div>

						  <div class="form-grp">
						    <input type="radio" id="female" name="gender" value="Female">
						    <label for="female">Female</label><br>
						  </div>
						</div>

						
						<button class="submit-btn gender-btn">Submit</button>
					</form>
			
          <form class="form-nickname">
						<h3 class="form-title">Nickname</h3>
			
            <input type="text" id="nickname" required><br>
								
						<button class="submit-btn nickname-btn">Submit</button>
					</form>
						
					<form class="form-pokemon">
            <div>
              <div class="form-grp">
                <input type="radio" id="bulbasaur" name="pokemon" onchange="changeImg(this)" value="1" checked>
                <label for="bulbasaur">Bulbasaur</label><br>
              </div>

              <div class="form-grp">
                <input type="radio" id="charmander" name="pokemon" onchange="changeImg(this)" value="4">
                <label for="charmander">Charmander</label><br>
              </div>

              <div class="form-grp">
                <input type="radio" id="squirtle" name="pokemon" onchange="changeImg(this)" value="7">
                <label for="squirtle">Squirtle</label><br>
              </div>
            </div>

						<div class="preview">
						  <img id="prev-img" width="100px" height="100px" src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png" />
						</div>

						<button class="submit-btn pokemon-btn">Submit</button>
					</form>
				</div>
			
				<div class="intro-img">
				  <img width="150px" height="150px" src="img/prof-oak.png" />
				</div>
			</div>
			
			<div class="status-box pixel-box">
        <div class="pixel-box">
          <p id="intro-msg"></p>
          <button class="next"> >> </button>
        </div>
			</div>
    `
	},
	battle_ui: function(char, enemy) {
		return `
			<div class="image-wrapper">
				<div class="char">
					<div class="char-inf">
						<p>${char.name.toUpperCase()}<span> Lv${char.level}</span></p>
						<div class="hp-bar">
						  <label>HP:&nbsp;</label>
						  <div id="char-hp" style="width:${char.hp}%"></div>
						</div>
					</div>
					<img id  ="char-img" width="150px" height="150px" src="${char.img}"/>
				</div>
				<div class="enemy">
					<div class="enemy-inf">
						<p>${enemy.name.toUpperCase()} <span>Lv${enemy.level}</span></p>
						<div class="hp-bar">
						  <label>HP:&nbsp;</label>
							<div id="enemy-hp"></div>
						</div>
					</div>
					<img id="enemy-img" width="150px" height="150px" src="${enemy.img}"/>
				</div>
			</div>
			<div class="status-box pixel-box">
			 <div class="inf pixel-box-left">
					<p id="message"></p>
					<div class="skills"></div>
					<div class="bag"></div>
				</div>
				<div class="btn-grp pixel-box-right">
					<button id="btn-bag">Bag</button>
					<button id="btn-run">Run</button>
					<button id="btn-atk">Attack</button>
				</div>
			</div>
    `
	},
  game_over() {
    return `
      <div>
        <h2>Game Over</h2>
        <p>Your Pokemon has fainted!</p>
        <button id="new-game">New Game</button>
      </div>
    `
  },
  fetch_err() {
    return `
    <div>
    <h2>Internal Error</h2>
    <p>An error occurred while fetching data.</p>
    <p>Please refresh the page.</p>
    <button id="refresh">Refresh</button>
    </div>
    `
  }
}
