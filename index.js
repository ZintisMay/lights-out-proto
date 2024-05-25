// Setup Values
let currentAction = null;
let gameSize = 4;
const MIN_GAME_SIZE = 3;
const MIN_GAME_DIFFICULTY = 1;
const MAX_GAME_SIZE = 10;
const MAX_GAME_DIFFICULTY = 20;
let gameDifficulty = 3;
let moves = 0;
let allCoords = [];
let actionCount = {};
let history = [];
let grid = {};
const gameDifficultyInput = document.getElementById("gameDifficultyInput");
const gameSizeInput = document.getElementById("gameSizeInput");
const gameAreaDiv = document.getElementById("gameArea");
const gameButtons = document.getElementById("gameButtons");
const moveBoxDiv = document.getElementById("moveBox");
const newGameButton = document.getElementById("newGameButton");
const resetGameButton = document.getElementById("resetGameButton");
gameSizeInput.value = gameSize;
gameSizeInput.max = MAX_GAME_SIZE;
gameSizeInput.min = MIN_GAME_SIZE;
gameDifficultyInput.value = gameDifficulty;
gameDifficultyInput.max = MAX_GAME_DIFFICULTY;
gameDifficultyInput.min = MIN_GAME_DIFFICULTY;

const SOUNDS = {
  animeWow: new Audio("./audio/anime-wow-sound-effect.mp3"),
  duckToy: new Audio("./audio/duck-toy-sound.mp3"),
  punch: new Audio("./audio/punch_u4LmMsr.mp3"),
  sadTrombone: new Audio("./audio/sadtrombone.swf.mp3"),
};

// This sets up n, s, e, w as coordinate modifier pairs. Makes it easy to encode directions
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

// Sets up all possible moves, the key is the name of the image file
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

// Game Buttons
newGameButton.addEventListener("click", newGame);
resetGameButton.addEventListener("click", resetGame);

// change game settings
gameSizeInput.addEventListener("change", function (e) {
  let newSize = e.target.value;
  if (newSize >= MIN_GAME_SIZE) {
    gameSize = newSize;
  }
});
gameDifficultyInput.addEventListener("change", function (e) {
  let newDifficulty = e.target.value;
  if (newDifficulty >= MIN_GAME_DIFFICULTY) {
    gameDifficulty = newDifficulty;
  }
});

// Play the game
gameAreaDiv.addEventListener("click", function (e) {
  if (!currentAction) alert("Please pick an action button below");
  // Get the coord from cell
  let coord = e.target.dataset.coord;
  // Take the action
  GAME_ACTIONS[currentAction](coord);
  // Play a sound
  if (rand(2) === 1) {
    SOUNDS.duckToy.play();
  } else {
    SOUNDS.punch.play();
  }
  // Decrement action count (cannot take move again)
  actionCount[currentAction]--;
  incrementMoves();
  saveGameStartState();

  // check for win
  if (isVictorious()) {
    setTimeout(() => {
      alert("you win!");
      SOUNDS.animeWow.play();
    }, 10);
  } else if (isDefeated()) {
    setTimeout(() => {
      alert("out of moves!");
      SOUNDS.sadTrombone.play();
    }, 10);
  }

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
  let setOfMoves = new Set();
  let accidentalRepeatCount = 0;
  for (let x = 0; x < gameDifficulty && accidentalRepeatCount < 10; x++) {
    let coords = chooseRandomCell();
    let action = chooseRandomAction();
    let actionCoordStr = coords + "-" + action;
    // If the same move has been placed to the same coords, try again
    if (setOfMoves.has(actionCoordStr)) {
      x--;
      continue;
    } else {
      setOfMoves.add(actionCoordStr);
    }
    GAME_ACTIONS[action](coords);
    actionCount[action] = actionCount[action] ? actionCount[action] + 1 : 1;
  }
  console.log(actionCount);
  clearHistory();
  saveGameStartState();
  renderGame();
}

function renderGame() {
  gameAreaDiv.innerHTML = "";
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
  gameAreaDiv.innerHTML = gameHTML;

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
  moveBoxDiv.textContent = moves;
}
function resetMoves() {
  moves = 0;
  moveBoxDiv.textContent = moves;
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
