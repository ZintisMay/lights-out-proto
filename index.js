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
const GAME_ACTIONS = {
  cross: function (coord) {
    let cellsToFlip = [coord];
    ["n", "e", "s", "w"].forEach((dir) =>
      cellsToFlip.push(getAdjacentCellCoords(coord, dir))
    );
    flipCells(cellsToFlip);
  },
  diagonals: function (coord) {
    let cellsToFlip = [coord];
    ["ne", "se", "sw", "nw"].forEach((dir) =>
      cellsToFlip.push(getAdjacentCellCoords(coord, dir))
    );
    flipCells(cellsToFlip);
  },
  crossToEnd: function (coord) {
    let cellsToFlip = [coord];
    ["n", "e", "s", "w"].forEach((dir) =>
      cellsToFlip.push(...getXAdjacentCellCoords(coord, dir, gameSize))
    );
    flipCells(cellsToFlip);
  },
  diagonalsToEnd: function (coord) {
    let cellsToFlip = [coord];
    ["ne", "se", "sw", "nw"].forEach((dir) =>
      cellsToFlip.push(...getXAdjacentCellCoords(coord, dir, gameSize))
    );
    flipCells(cellsToFlip);
  },
  box: function (coord) {
    let cellsToFlip = [coord];
    cellsToFlip.push(getAdjacentCellCoords(coord, "s"));
    cellsToFlip.push(getAdjacentCellCoords(coord, "se"));
    cellsToFlip.push(getAdjacentCellCoords(coord, "e"));
    flipCells(cellsToFlip);
  },
};
let currentAction = null;
let gameSize = 5;
let grid = {
  "0-1": true,
  "1-4": true,
  "3-4": true,
};
const gameSizeInput = document.getElementById("gameSizeInput");
const gameArea = document.getElementById("gameArea");
const gameButtons = document.getElementById("gameButtons");

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
  console.log(coord);
  GAME_ACTIONS[currentAction](coord);
  // GAME_ACTIONS.diagonals(coord);
  renderGame();
});

gameButtons.addEventListener("click", function (e) {
  let action = e.target.dataset.action;
  currentAction = action;
});

function renderButtons() {
  let buttonHTML = "";
  for (let action in GAME_ACTIONS) {
    let selected = action === currentAction ? "selected" : "";
    let classes = `button ${selected}`;
    buttonHTML += `<button class="${classes}" data-action="${action}">${action}</button>`;
  }
  gameButtons.innerHTML = buttonHTML;
}

renderGame();
renderButtons();

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

function coordToXY(coord) {
  return coord.split("-").map((n) => Number(n));
}

function flipCell(coord) {
  grid[coord] = !grid[coord];
}

function flipCells(coords) {
  console.log(coords);
  coords
    .filter((c) => !!c)
    .forEach((c) => {
      flipCell(c);
    });
}

function getAdjacentCellCoords(coord, dir) {
  let [xMod, yMod] = DIRECTIONS[dir];
  let [x, y] = coordToXY(coord);
  let newX = x + xMod,
    newY = y + yMod;
  if (numOutsideGameArea(newX) || numOutsideGameArea(newY)) return "";
  return makeCoord(newX, newY);
}

function getXAdjacentCellCoords(coord, dir, x) {
  let result = [];
  while (x >= 0) {
    x--;
    coord = getAdjacentCellCoords(coord, dir);
    if (coordNotInGameArea(coord)) {
      break;
    }
    result.push(coord);
  }
  return result;
}

function coordInGameArea(coord) {
  let [x, y] = coordToXY(coord);
  return numInGameArea(x) && numInGameArea(y);
}
function coordNotInGameArea(coord) {
  return !coordInGameArea(coord);
}
function numInGameArea(n) {
  return n >= 0 && n < gameSize;
}
function numOutsideGameArea(n) {
  return !numInGameArea(n);
}
