console.log("starting");

const gameSizeInput = document.getElementById("gameSizeInput");
const gameArea = document.getElementById("gameArea");
gameArea.addEventListener("click", function (e) {
  // renderGame();
  console.log(e.target);
  let coordStr = e.target.dataset.coord;
  console.log(coordStr);
});

let gameSize = 3;
let grid = {
  "0-1": true,
  "1-4": true,
  "3-4": true,
};

renderGame();
// function buildGrid(){
//   iterateXY(function(x,y){

//   })
// }

function renderGame() {
  gameArea.innerHTML = "";
  gameHTML = "";
  for (let y = 0; y < gameSize; y++) {
    for (let x = 0; x < gameSize; x++) {
      let coordStr = c(x, y);
      let isLit = grid[coordStr];
      let widthHeight = `calc(100% /${gameSize})`;
      let classes = isLit ? "cell lit" : "cell";
      let cell = `
        <div style="height:${widthHeight};width:${widthHeight};" class="${classes}" data-coord="${coordStr}"></div>
      `;
      gameHTML += cell;
    }
  }
  gameArea.innerHTML = gameHTML;
}

// function iterateXY(f) {
//   for (let y = 0; y < gameSize; y++) {
//     for (let x = 0; x < gameSize; x++) {
//       f(x, y);
//     }
//   }
// }

function c(a, b) {
  return `${a}-${b}`;
}
