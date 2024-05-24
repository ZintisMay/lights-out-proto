console.log("starting");
const DIRECTIONS = {
  n: [0, -1],
  s: [0, 1],
  e: [1, 0],
  w: [-1, 0],
  ne: [1, -1],
  se: [1, 1],
  sw: [-1, 1],
  nw: [-1, -1],
};
let gameSize = 5;
let grid = {
  "0-1": true,
  "1-4": true,
  "3-4": true,
};
const gameSizeInput = document.getElementById("gameSizeInput");
const gameArea = document.getElementById("gameArea");

gameSizeInput.addEventListener("change", function (e) {
  let newSize = e.target.value;
  if (newSize !== gameSize) {
    gameSize = newSize;
  }
  renderGame();
});

gameArea.addEventListener("click", function (e) {
  // renderGame();
  console.log(e.target);
  let coord = e.target.dataset.coord;
  // let [x, y] = coord.split("-");
  console.log(coord);

  let cellsToFlip = [];
  cellsToFlip.push(getAdjacentCellCoords(coord, "n"));
  cellsToFlip.push(getAdjacentCellCoords(coord, "e"));
  cellsToFlip.push(getAdjacentCellCoords(coord, "s"));
  cellsToFlip.push(getAdjacentCellCoords(coord, "w"));
  cellsToFlip = cellsToFlip
    .filter((c) => !!c)
    .map((coord) => {
      console.log(coord);
      flipCell(coord);
      return coord;
    });
  console.log(cellsToFlip);
  console.log(grid);
  renderGame();
});

renderGame();

function renderGame() {
  gameArea.innerHTML = "";
  gameHTML = "";
  for (let y = 0; y < gameSize; y++) {
    for (let x = 0; x < gameSize; x++) {
      let coordStr = makeCoord(x, y);
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

function makeCoord(a, b) {
  return `${a}-${b}`;
}

function flipCell(coord) {
  grid[coord] = !grid[coord];
}

function getAdjacentCellCoords(coord, dir) {
  let [xMod, yMod] = DIRECTIONS[dir];
  let [x, y] = coord.split("-").map((n) => Number(n));
  let newX = x + xMod,
    newY = y + yMod;
  console.log(x, y, typeof x, typeof y);
  console.log(newX, newY, typeof newX, typeof newY);
  if (newX < 0 || newX >= gameSize || newY < 0 || newY >= gameSize) return "";

  return `${newX}-${newY}`;
}
