/* -------- DOM ELEMENTS ------- */

// Game board
const board = document.querySelector(".board");

// Buttons and modal
const startButton = document.querySelector(".btn-start");
const restartButton = document.querySelector(".btn-restart");

const modal = document.querySelector(".modal");
const startGameModal = document.querySelector(".start-game");
const gameOverModal = document.querySelector(".game-over");

const highScoreElement = document.querySelector("#high-score");
const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");


/* -------- GAME CONFIGURATION -------- */

// Size of each block in the game board
const blockHeight = 50;
const blockWidth = 50;

// Number of rows and columns that can fit inside the board
const cols = Math.floor(board.clientWidth/blockWidth);
const rows = Math.floor(board.clientHeight/blockHeight);


/* -------- GAME STATE -------- */

// High score is stored in localStorage so it remains
// even after refreshing the browser
let highScore = localStorage.getItem("highScore") || 0;

// Current score
let score = 0;

// Game timer
let time = "00:00";

// Current direction of the snake
let direction = "right";

// Snake body
// The first element is always the head
let snake = [{
    x : 1,y : 3
}]

// IDs of the running intervals
let intervalId = null;
let timerIntervalId = null;


/* ------- INITIAL GAME DATA ------- */

// Display saved high score
highScoreElement.innerText = highScore;

// Store every board block
const blocks = [];


/* ------- FOOD GENERATION ------- */

// Generates a random position for the food
// and makes sure it does not appear on the snake
function generateFood() {
    let newFood;
    do {
        newFood = {
            x : Math.floor(Math.random() * rows),
            y : Math.floor(Math.random() * cols)
        };
    } while (
        snake.some(segment =>
            segment.x === newFood.x &&
            segment.y === newFood.y
        )
    );
    return newFood;
}

// Generate the first food position
let food = generateFood();


/* ------- CREATE GAME BOARD ------- */

// Create all blocks required for the game board
for(let row = 0 ; row < rows ; row++) {
    for(let col = 0 ; col < cols ; col++) {
        const block = document.createElement("div");
        block.classList.add("block");
        board.appendChild(block);
        blocks[`${row}-${col}`] = block;
    }
}


/* ------- MAIN GAME FUNCTION ------- */

// render() runs repeatedly while the game is running
function render() {
    let head = null;
    
    //show food
    blocks[`${food.x}-${food.y}`].classList.add("food");

    //CALCULATE NEW HEAD POSITION
    if(direction === "left") {
        head = {
            x : snake[0].x , 
            y : snake[0].y - 1
        };
    }else if(direction === "right") {
        head = {
            x : snake[0].x , 
            y : snake[0].y + 1
        };
    }else if(direction === "down") {
        head = {
            x : snake[0].x + 1 , 
            y : snake[0].y};
    }else if(direction === "up") {
        head = {
            x : snake[0].x - 1 , 
            y : snake[0].y
        };
    }

    // wall collision logic
    // Game ends if the head goes outside the board
    if(head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        clearInterval(intervalId);
        clearInterval(timerIntervalId);

        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex";

        return;
    }

    // self collision logic
    // Check whether the new head position is already
    // occupied by any part of the snake
    const isColliding = snake.some(segment => 
        segment.x === head.x && segment.y === head.y
    );

    if(isColliding) {
        clearInterval(intervalId);
        clearInterval(timerIntervalId);

        modal.style.display = "flex";
        startGameModal.style.display = "none";
        gameOverModal.style.display = "flex";

        return;
    }

    // food consume logic
    const ateFood = head.x === food.x && head.y === food.y;
    if(ateFood) {
        blocks[`${food.x}-${food.y}`].classList.remove("food");
        food = generateFood();
        score += 10;
        scoreElement.innerText = score;
        if(score > highScore) {
            highScore = score;
            localStorage.setItem("highScore", highScore.toString());
            highScoreElement.innerText = highScore;
        }
    }

    //MOVE SNAKE
    // Remove the current snake body from the board
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    });

    // Add new head
    snake.unshift(head);

    // If food was NOT eaten, remove the tail.
    // If food was eaten, keep the tail so the snake grows.
    if(!ateFood) {
        snake.pop();
    }

    // Draw Snake
    snake.forEach(segment => {
        blocks[`${segment.x}-${segment.y}`].classList.add("fill");
    });
}


/* ------- START GAME ------- */

startButton.addEventListener("click",()=> {

    // Hide start modal
    modal.style.display = "none";

    // Start snake movement
    intervalId = setInterval(() => {render()},300);

    // Start timer
    timerIntervalId = setInterval(() => {
        let [min , sec] = time.split(":").map(Number);

        if(sec === 59) {
            min += 1;
            sec = 0;
        }else {
            sec += 1;
        }

        time = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        timeElement.innerText = time;
    },1000)
})


/* ------- RESTART GAME ------- */

restartButton.addEventListener("click",restartGame);

function restartGame() {

    // Remove old food
    blocks[`${food.x}-${food.y}`].classList.remove("food");

    // Remove old snake
    snake.forEach((segment)=> {
        blocks[`${segment.x}-${segment.y}`].classList.remove("fill");
    });

    //RESET GAME VALUES
    score = 0;
    time = `00:00`;

    highScoreElement.innerText = highScore;
    scoreElement.innerText = score;
    timeElement.innerText = time;

    //RESET SNAKE
    direction = "down";
    snake = [{x : 1,y : 3}];

    //GENERATE NEW FOOD
    food = generateFood();

    //START NEW GAME
    modal.style.display = "none";
    intervalId = setInterval(() => {render()},300);

    // Start timer again
    timerIntervalId = setInterval(() => {
        let [min, sec] = time.split(":").map(Number);
        if(sec === 59) {
            min += 1;
            sec = 0;
        } else {
            sec += 1;
        }
        time = `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
        timeElement.innerText = time;
    }, 1000);
}


/* ------- KEYBOARD CONTROLS ------- */

addEventListener("keydown", (evt) => {

    // Prevent the snake from immediately moving
    // in the opposite direction

    if(evt.key === "ArrowUp" && direction !== "down") {
        direction = "up";
    } else if(evt.key === "ArrowDown" && direction !== "up") {
        direction = "down";
    } else if(evt.key === "ArrowRight" && direction !== "left") {
        direction = "right";
    } else if(evt.key === "ArrowLeft" && direction !== "right") {
        direction = "left";
    }
});