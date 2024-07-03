const SIZE = 9;
let delay = 100; // Initial delay set to 100ms

window.onload = function () {
  createBoard();
};

function createBoard() {
  const table = document.getElementById("sudoku-board");
  for (let row = 0; row < SIZE; row++) {
    let tr = document.createElement("tr");
    for (let col = 0; col < SIZE; col++) {
      let td = document.createElement("td");
      let input = document.createElement("input");
      input.setAttribute("type", "number");
      input.setAttribute("min", "1");
      input.setAttribute("max", "10");
      td.appendChild(input);
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
}

function getBoard() {
  const table = document.getElementById("sudoku-board");
  let board = [];
  for (let row of table.rows) {
    let rowArray = [];
    for (let cell of row.cells) {
      let value = cell.firstChild.value;
      rowArray.push(value ? parseInt(value) : 0);
    }
    board.push(rowArray);
  }
  return board;
}

function setBoard(board) {
  const table = document.getElementById("sudoku-board");
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      table.rows[row].cells[col].firstChild.value =
        board[row][col] === 0 ? "" : board[row][col];
    }
  }
}

function clearBoard() {
  const table = document.getElementById("sudoku-board");
  for (let row of table.rows) {
    for (let cell of row.cells) {
      cell.firstChild.value = "";
    }
  }
  displayError("");
}

function updateSpeed(value) {
  delay = value;
  document.getElementById("speed-value").innerText = `${value}ms`;
}

function solveSudoku(quickSolve) {
  let board = getBoard();
  if (isValidBoard(board)) {
    displayError("");
    if (quickSolve) {
      if (solve(board)) {
        setBoard(board);
      } else {
        displayError("No solution exists");
      }
    } else {
      solveWithVisualization(board);
    }
  } else {
    displayError(
      "Invalid input detected. Please enter numbers between 1 and 10."
    );
  }
}

function isValidBoard(board) {
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      let num = board[row][col];
      if (num !== 0) {
        board[row][col] = 0;
        if (!isValidMove(board, row, col, num)) {
          return false;
        }
        board[row][col] = num;
      }
    }
  }
  return true;
}

async function solveWithVisualization(board) {
  let dp = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  await solveHelperWithVisualization(board, 0, 0, dp);
}

async function solveHelperWithVisualization(board, row, col, dp) {
  if (row === SIZE) return true;
  if (col === SIZE)
    return await solveHelperWithVisualization(board, row + 1, 0, dp);
  if (board[row][col] !== 0)
    return await solveHelperWithVisualization(board, row, col + 1, dp);

  for (let num = 1; num <= SIZE + 1; num++) {
    if (isValidMove(board, row, col, num)) {
      board[row][col] = num;
      setBoard(board);
      await new Promise((resolve) => setTimeout(resolve, delay)); // Delay to visualize the process

      if (await solveHelperWithVisualization(board, row, col + 1, dp)) {
        dp[row][col] = true;
        return true;
      }
      board[row][col] = 0;
      setBoard(board);
      await new Promise((resolve) => setTimeout(resolve, delay)); // Delay to visualize the process
    }
  }
  return false;
}

function solve(board) {
  let dp = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  return solveHelper(board, 0, 0, dp);
}

function solveHelper(board, row, col, dp) {
  if (row === SIZE) return true;
  if (col === SIZE) return solveHelper(board, row + 1, 0, dp);
  if (board[row][col] !== 0) return solveHelper(board, row, col + 1, dp);

  for (let num = 1; num <= SIZE + 1; num++) {
    if (isValidMove(board, row, col, num)) {
      board[row][col] = num;
      if (solveHelper(board, row, col + 1, dp)) {
        dp[row][col] = true;
        return true;
      }
      board[row][col] = 0;
    }
  }
  return false;
}

function isValidMove(board, row, col, num) {
  return (
    !usedInRow(board, row, num) &&
    !usedInCol(board, col, num) &&
    !usedInBox(board, row - (row % 3), col - (col % 3), num)
  );
}

function usedInRow(board, row, num) {
  for (let col = 0; col < SIZE; col++) {
    if (board[row][col] === num) return true;
  }
  return false;
}

function usedInCol(board, col, num) {
  for (let row = 0; row < SIZE; row++) {
    if (board[row][col] === num) return true;
  }
  return false;
}

function usedInBox(board, startRow, startCol, num) {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (board[row + startRow][col + startCol] === num) return true;
    }
  }
  return false;
}

function displayError(message) {
  document.getElementById("error-message").innerText = message;
}
