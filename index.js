let currentAction = null;
let gameSize = 4;
let gameDifficulty = 3;
let moves = 0;
let allCoords = [];
let actionCount = {};
let history = [];
let grid = {};
const gameDifficultyInput = document.getElementById("gameDifficultyInput");
const gameSizeInput = document.getElementById("gameSizeInput");
const gameArea = document.getElementById("gameArea");
const gameButtons = document.getElementById("gameButtons");
const moveBox = document.getElementById("moveBox");
const newGameButton = document.getElementById("newGameButton");
const resetGameButton = document.getElementById("resetGameButton");
gameSizeInput.value = gameSize;
gameDifficultyInput.value = gameDifficulty;

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
    ["e", "se", "s"].forEach((dir) =>
      cellsToFlip.push(getAdjacentCellCoords(coord, dir))
    );
    flipCells(cellsToFlip);
  },
  line: function (coord) {
    let cellsToFlip = [coord];
    ["n", "s"].forEach((dir) =>
      cellsToFlip.push(getAdjacentCellCoords(coord, dir))
    );
    flipCells(cellsToFlip);
  },
  bar: function (coord) {
    let cellsToFlip = [coord];
    ["e", "w"].forEach((dir) =>
      cellsToFlip.push(getAdjacentCellCoords(coord, dir))
    );
    flipCells(cellsToFlip);
  },
  row: function (coord) {
    let cellsToFlip = [coord];
    ["e", "w"].forEach((dir) =>
      cellsToFlip.push(...getXAdjacentCellCoords(coord, dir, gameSize))
    );
    flipCells(cellsToFlip);
  },
  column: function (coord) {
    let cellsToFlip = [coord];
    ["n", "s"].forEach((dir) =>
      cellsToFlip.push(...getXAdjacentCellCoords(coord, dir, gameSize))
    );
    flipCells(cellsToFlip);
  },
};

// Adds logger to track name and coord of each setup move
applyLogWrapper();
function applyLogWrapper() {
  for (let action in GAME_ACTIONS) {
    let originalFunction = GAME_ACTIONS[action];
    GAME_ACTIONS[action] = function (coord) {
      console.log(action, coord);
      originalFunction(coord);
    };
  }
}

newGameButton.addEventListener("click", newGame);
resetGameButton.addEventListener("click", resetGame);

// change game settings
gameSizeInput.addEventListener("change", function (e) {
  let newSize = e.target.value;
  if (newSize !== gameSize) {
    gameSize = newSize;
  }
});
gameDifficultyInput.addEventListener("change", function (e) {
  let newDifficulty = e.target.value;
  if (newDifficulty !== gameDifficulty) {
    gameDifficulty = newDifficulty;
  }
});

// click box
gameArea.addEventListener("click", function (e) {
  if (!currentAction) alert("Please pick an action");
  let coord = e.target.dataset.coord;
  GAME_ACTIONS[currentAction](coord);
  actionCount[currentAction]--;
  incrementMoves();
  saveGameStartState();
  if (isVictorious()) setTimeout(() => alert("you win!"), 10);
  if (actionCount[currentAction] <= 0) {
    currentAction = null;
  }
  renderGame();
});

// click button
gameButtons.addEventListener("click", function (e) {
  let action = e.target.dataset.action;
  currentAction = action;
  renderGame();
});

function newGame() {
  console.log(
    `starting new game with difficulty (${gameDifficulty}) and size (${gameSize})`
  );
  actionCount = {};
  resetMoves();
  createEmptyGrid();
  for (let x = 0; x < gameDifficulty; x++) {
    let coords = chooseRandomCell();
    let action = chooseRandomAction();
    GAME_ACTIONS[action](coords);
    actionCount[action] = actionCount[action] ? actionCount[action] + 1 : 1;
  }
  console.log(actionCount);
  clearHistory();
  saveGameStartState();
  renderGame();
}

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
        <div style="height:${widthHeight};width:${widthHeight};" class="${classes}" data-coord="${coordStr}">${coordStr}</div>
      `;
      gameHTML += cell;
    }
  }
  gameArea.innerHTML = gameHTML;

  let buttonHTML = "";
  for (let action in actionCount) {
    let count = actionCount[action];
    let selected = action === currentAction ? "selected" : "";
    let zeroCount = count === 0 ? "grayOut" : "";
    let classes = `button ${selected} ${zeroCount}`;
    let dotRowHTML = "";
    for (let x = 0; x < count; x++) {
      dotRowHTML += `<div class="dot"></div>`;
    }
    buttonHTML += `<button class="${classes}" data-action="${action}"><img src="./images/${action}.png" /><div class="dotRow">${dotRowHTML}</div></button>`;
  }
  gameButtons.innerHTML = buttonHTML;
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
function isDefeated() {
  if (actionSum() == 0) return true;
  return false;
}
function actionSum() {
  let actionTotal = 0;
  for (let action in actionCount) {
    actionTotal += actionCount[action];
  }
  return actionTotal;
}
function isVictorious() {
  // any elements in grid are true...
  for (let key in grid) {
    if (grid[key]) return false;
  }
  return true;
}

function createEmptyGrid() {
  //Make arr
  let arr = [];
  // make all coords
  for (let x = 0; x < gameSize; x++) {
    for (let y = 0; y < gameSize; y++) {
      arr.push(makeCoord(x, y));
    }
  }

  allCoords = [...arr];
  shuffleArrayInPlace(arr);
  grid = {};
}

function shuffleArrayInPlace(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
}

function chooseRandomAction() {
  let actionList = Object.keys(GAME_ACTIONS);
  return actionList[rand(actionList.length)];
}
function chooseRandomCell() {
  return allCoords[rand(allCoords.length)];
}

function rand(max) {
  return Math.floor(Math.random() * max);
}

function incrementMoves() {
  moves++;
  moveBox.textContent = moves;
}
function resetMoves() {
  moves = 0;
  moveBox.textContent = moves;
}
function saveGameStartState() {
  let chapter = {
    grid: { ...grid },
    moves: moves,
    actionCount: { ...actionCount },
  };
  history.push(chapter);
}
function clearHistory() {
  history = [];
}
function resetGame() {
  history.length = 1;
  let chapter = history[0];
  grid = { ...chapter.grid };
  moves = chapter.moves;
  actionCount = { ...chapter.actionCount };
  renderGame();
  resetMoves();
}
