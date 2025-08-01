const cellElements = document.querySelectorAll("[data-cell]");
const board = document.querySelector("[data-board]");
const winningMessageTextElement = document.querySelector("[data-winning-message-text]");
const winningMessage = document.querySelector("[data-winning-message]");
const restartButton = document.querySelector("[data-restart-button]");
const resetButton = document.querySelector(".reset-button");
const xScoreBoardPoints = document.querySelectorAll(".point-x");
const oScoreBoardPoints = document.querySelectorAll(".point-o");
const maxScore = 5;

let currentXScore = JSON.parse(localStorage.getItem("currentXScore")) || 0;
let currentOScore = JSON.parse(localStorage.getItem("currentOScore")) || 0;
let lastWinner = null;

let audio = new Audio()
let isCircleTurn;

const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
]

const loadSavedGameState = () => {
    applySavedPoints(xScoreBoardPoints, currentXScore, "x")
    applySavedPoints(oScoreBoardPoints, currentOScore, "o")
    checkGameOver()
}

const applySavedPoints = (scoreBoardPoints, score, player) => {
    for (let i = 0; i < score; i++) {
        scoreBoardPoints[scoreBoardPoints.length - 1 - i].innerText = player;
        scoreBoardPoints[scoreBoardPoints.length - 1 - i].classList.add("winning")
    }
}

const saveGameState = () => {
    localStorage.setItem("currentXScore", JSON.stringify(currentXScore))
    localStorage.setItem("currentOScore", JSON.stringify(currentOScore))
}

const resetGame = () => {
    currentXScore = 0;
    currentOScore = 0;
    lastWinner = null;
    saveGameState()

    xScoreBoardPoints.forEach(point => point.classList.remove("winning"))
    oScoreBoardPoints.forEach(point => point.classList.remove("winning"))
    xScoreBoardPoints.forEach(point => point.innerText = "")
    oScoreBoardPoints.forEach(point => point.innerText = "")

    resetButton.classList.add("hidden")
    restartButton.classList.remove("hidden")
    startGame()
}

const startGame = () => {
    if (lastWinner === "circle") {
        isCircleTurn = true;
    } else if (lastWinner === "x") {
        isCircleTurn = false;
    } else {
        isCircleTurn = false;
    }

    audio = new Audio("sounds/start.mp3")
    audio.play()

    for (const cell of cellElements) {
        cell.classList.remove("circle", "x")
        cell.removeEventListener("click", handleClick)
        cell.addEventListener("click", handleClick, { once: true })
    }

    setBoardHoverClass()
    winningMessage.classList.remove("show-winning-message")
}


const endGame = (isDraw) => {
    if (isDraw) {
        winningMessageTextElement.innerText = "Draw!";
    } else {
        const winner = isCircleTurn ? "circle" : "x";
        winningMessageTextElement.innerText = winner === "circle" ? "O's Wins!" : "X's Wins!";
        updateScore(winner === "circle" ? oScoreBoardPoints : xScoreBoardPoints, winner === "circle" ? "o" : "x")
        
        lastWinner = winner;
        saveGameState()
    }

    winningMessage.classList.add("show-winning-message")
    checkGameOver()
}

const updateScore = (scoreBoardPoints, player) => {
    if (player === "x") {
        currentXScore++;
        if (currentXScore <= maxScore) {
            markWinningPoint(scoreBoardPoints, player)
        }
    } else {
        currentOScore++;
        if (currentOScore <= maxScore) {
            markWinningPoint(scoreBoardPoints, player)
        }
    }
}

const markWinningPoint = (scoreBoardPoints, player) => {
    for (const point of [...scoreBoardPoints].reverse()) {
        if (!point.innerText) {
            point.innerText = player;
            point.classList.add("winning")
            break;
        }
    }
}

const checkGameOver = () => {
    if (currentXScore >= maxScore || currentOScore >= maxScore) {
        restartButton.classList.add("hidden")
        resetButton.classList.remove("hidden")
    }
}

const checkForWin = (currentPlayer) => {
    return winningCombinations.some(combination => {
        return combination.every(index => cellElements[index].classList.contains(currentPlayer))
    })
}

const checkForDraw = () => {
    return [...cellElements].every(cell => cell.classList.contains("x") || cell.classList.contains("circle"))
}

const placeMark = (cell, classToAdd) => {
    cell.classList.add(classToAdd)
}

const setBoardHoverClass = () => {
    board.classList.remove("circle", "x")
    board.classList.add(isCircleTurn ? "circle" : "x")
}

const swapTurns = () => {
    isCircleTurn = !isCircleTurn;
    setBoardHoverClass()
}

const handleClick = (e) => {
    const cell = e.target;
    const classToAdd = isCircleTurn ? "circle" : "x";

    audio = new Audio(isCircleTurn ? "sounds/circle.mp3" : "sounds/x.mp3");
    audio.play()

    placeMark(cell, classToAdd)

    const isWin = checkForWin(classToAdd)
    const isDraw = checkForDraw()

    if (isWin) {
        endGame(false)
        playWinSound()
    } else if (isDraw) {
        endGame(true)
        playDrawSound()
    } else {
        swapTurns()
    }
}

const playWinSound = () => {
    setTimeout(() => {
        audio.pause()
        audio.currentTime = 0;
        audio = new Audio("sounds/win.mp3")
        audio.play()
    }, 600);
}

const playDrawSound = () => {
    setTimeout(() => {
        audio.pause()
        audio.currentTime = 0;
        audio = new Audio("sounds/draw.mp3")
        audio.play()
    }, 600)
}

restartButton.addEventListener("click", startGame)
resetButton.addEventListener("click", resetGame)

loadSavedGameState()
startGame()
