const cellElements = document.querySelectorAll("[data-cell]");
const board = document.querySelector("[data-board]");
const winningMessageTextElement = document.querySelector("[data-winning-message-text]");
const winningMessage = document.querySelector("[data-winning-message]");
const restartButton = document.querySelector("[data-restart-button]");
const xScore = document.querySelector(".X-score");
const oScore = document.querySelector(".O-score");
let currentXScore = localStorage.getItem("currentXScore") || 0;
let currentOScore = localStorage.getItem("currentOScore") || 0;
const maxScore = 5;
const oScoreBoardPoints = document.querySelectorAll(".O-score")[0].children;
const xScoreBoardPoints = document.querySelectorAll(".X-score")[0].children;

if (currentOScore > 0 || currentXScore > 0) {
    let oldOScore = currentOScore
    let oldXScore = currentXScore
    for (let index in oScoreBoardPoints) {
        if (index < currentOScore) {
            const scoreboardPointPosition = oScoreBoardPoints.length - oldOScore
            oScoreBoardPoints[scoreboardPointPosition].innerText = "o"
            oldOScore--
        }
    }
    for (let index in xScoreBoardPoints) {
        if (index < currentXScore) {
            const scoreboardPointPosition = xScoreBoardPoints.length - oldXScore
            xScoreBoardPoints[scoreboardPointPosition].innerText = "x"
            oldXScore--
        }
    }
}
    
let audio = new Audio();

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
];

const reset = () => {
    currentXScore = 0
    currentOScore = 0
    localStorage.setItem("currentXScore", currentXScore)
    localStorage.setItem("currentOScore", currentOScore)
    restartButton.classList.remove("hidden")
    Array.from(oScoreBoardPoints).forEach(point => {
        point.innerText = ""
    });
    Array.from(xScoreBoardPoints).forEach(point => {
        point.innerText = ""
    });
    startGame()
}

const startGame = () => {
    isCircleTurn = false;
    audio = new Audio('sounds/start.mp3')
    audio.play();

    for (const cell of cellElements) {
        cell.classList.remove("circle");
        cell.classList.remove("x");
        cell.removeEventListener("click", handleClick);
        cell.addEventListener("click", handleClick, { once: true });
    }

    setBoardHoverClass()
    winningMessage.classList.remove("show-winning-message");
};

const endGame = (isDraw) => {
   if (isDraw) {
    winningMessageTextElement.innerText = "Draw!"
   } else {
    winningMessageTextElement.innerText = isCircleTurn ? "O's Wins!" : "X's Wins!";
    if(isCircleTurn) {
        currentOScore++
        const scoreboardPointPosition = oScoreBoardPoints.length - currentOScore
        oScoreBoardPoints[scoreboardPointPosition].innerText = "o"
        localStorage.setItem("currentOScore", currentOScore)
    } else {
        currentXScore++
        const scoreboardPointPosition = oScoreBoardPoints.length - currentXScore
        xScoreBoardPoints[scoreboardPointPosition].innerText = "x"
        localStorage.setItem("currentXScore", currentXScore)
    }

    if(currentXScore >= maxScore || currentOScore >= maxScore) {
        restartButton.classList.add("hidden")
    }

   }

   winningMessage.classList.add("show-winning-message")
}

const checkForWin = (currentPlayer) => {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentPlayer);
        })
    })
}

const checkForDraw = () => {
    return [ ... cellElements].every(cell => {
       return cell.classList.contains("x") || cell.classList.contains("circle")
    })
}

const placeMark = (cell, classToAdd) => {
    cell.classList.add(classToAdd);
};

const setBoardHoverClass = () => {
    board.classList.remove("circle");
    board.classList.remove("x");
    
    if (isCircleTurn) {
        board.classList.add("circle");
    } else {
        board.classList.add("x");
    }
}

const swapTurns = () => {
    isCircleTurn = !isCircleTurn;

    setBoardHoverClass();
}

const handleClick = (e) => {
    // Colocar a marca (X or circulo)
    const cell = e.target;
    const classToAdd = isCircleTurn ? "circle" : "x";

    if (isCircleTurn) {
        audio = new Audio('sounds/circle.mp3')
        audio.play()
    } else { 
        audio = new Audio('sounds/x.mp3')
        audio.play();
    }

    placeMark(cell, classToAdd);    

    // Verificar por vitoria
    const isWin = checkForWin(classToAdd);
    
    // Verificar por empate
    const isDraw = checkForDraw();

    if (isWin) {
        endGame(false)
        setTimeout(() => {
            audio.pause()
            audio.currentTime = 0
            audio = new Audio('sounds/win.mp3')
            return audio.play()
        }, 600)  

    } else if (isDraw) {
        endGame(true)
        setTimeout(() => {
            audio.pause()
            audio.currentTime = 0
            audio = new Audio('sounds/draw.mp3')
            return audio.play()
        }, 600)  
    } else {
    // Mudar o simbolo
        swapTurns();
    }
};

startGame();

restartButton.addEventListener("click", startGame);