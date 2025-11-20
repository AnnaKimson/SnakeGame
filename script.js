const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const messageDiv = document.getElementById('message');
const restartButton = document.getElementById('restartButton');
const scoreDisplay = document.getElementById('score');

let box = 20;
let canvasSize = 400;
let snake, direction, food;
let score = 0;
let gameEnded = false;
let game;
let startX = 0;
let startY = 0;

function resizeCanvas() {
    const container = document.getElementById('container');
    if (!container) return;

    const availableWidth = container.clientWidth - 40;
    canvasSize = Math.min(availableWidth, 400, Math.max(canvasSize, 200));

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    box = canvasSize / 20;
}

function initGame() {
    resizeCanvas();
    snake = [{ x: 9 * box, y: 9 * box }];
    direction = 'RIGHT';
    food = generateFood();
    score = 0;
    gameEnded = false;
    updateUI();
    clearInterval(game);
    game = setInterval(draw, 100);
    canvas.focus();
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / box)) * box,
            y: Math.floor(Math.random() * (canvas.height / box)) * box
        };
    } while (collision(newFood, snake)); // Проверка на нахождение еды в теле змеи

    return newFood;
}

function updateUI() {
    messageDiv.classList.add('hidden');
    restartButton.classList.add('hidden');
    scoreDisplay.textContent = score;
}

canvas.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', (e) => {
    if (gameEnded) return;
    handleSwipe(e.changedTouches[0]);
});

function handleSwipe(touchEnd) {
    const endX = touchEnd.clientX;
    const endY = touchEnd.clientY;
    const diffX = endX - startX;
    const diffY = endY - startY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        direction = diffX > 0 && direction !== 'LEFT' ? 'RIGHT' : 
                    diffX < 0 && direction !== 'RIGHT' ? 'LEFT' : direction;
    } else {
        direction = diffY > 0 && direction !== 'UP' ? 'DOWN' : 
                    diffY < 0 && direction !== 'DOWN' ? 'UP' : direction;
    }
}

window.addEventListener('resize', () => {
    if (!gameEnded) initGame();
});

document.addEventListener('keydown', (event) => {
    if (gameEnded) return;
    const keyDirection = {
        ArrowLeft: 'LEFT',
        ArrowUp: 'UP',
        ArrowRight: 'RIGHT',
        ArrowDown: 'DOWN'
    };

    if (keyDirection[event.key] && 
        (keyDirection[event.key] !== 'LEFT' || direction !== 'RIGHT') &&
        (keyDirection[event.key] !== 'UP' || direction !== 'DOWN') &&
        (keyDirection[event.key] !== 'RIGHT' || direction !== 'LEFT') &&
        (keyDirection[event.key] !== 'DOWN' || direction !== 'UP')) {
        direction = keyDirection[event.key];
    }
});

function collision(head, array) {
    return array.some(part => head.x === part.x && head.y === part.y);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameEnded) {
        messageDiv.textContent = `Игра окончена! Вы набрали ${score} очков.`;
        messageDiv.classList.remove('hidden');
        restartButton.classList.remove('hidden');
        return;
    }

    // Рисуем змею
        snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? 'green' : 'white'; // Змея: голова - зелёная, тело - белое
        ctx.fillRect(part.x, part.y, box, box);
        ctx.strokeStyle = 'black'; // Обводка
        ctx.strokeRect(part.x, part.y, box, box);
    });

    // Рисуем еду
    ctx.fillStyle = 'red'; // Цвет еды
    ctx.fillRect(food.x, food.y, box, box);

    // Текущие координаты головы змеи
    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    // Меняем координаты в зависимости от направления
    switch (direction) {
        case 'LEFT': snakeX -= box; break;
        case 'UP': snakeY -= box; break;
        case 'RIGHT': snakeX += box; break;
        case 'DOWN': snakeY += box; break;
    }

    // Если змея съела еду
    if (Math.abs(snakeX - food.x) < box && Math.abs(snakeY - food.y) < box) {
        food = generateFood(); // Генерируем новую еду
        score++;
        scoreDisplay.textContent = score;
    } else {
        // Иначе удаляем последний сегмент (змея движется)
        snake.pop();
    }

    // Создаём новую голову
    const newHead = { x: snakeX, y: snakeY };

    // Проверяем столкновения (со стеной или собой)
    if (
        snakeX < 0 ||
        snakeY < 0 ||
        snakeX >= canvas.width ||
        snakeY >= canvas.height ||
        collision(newHead, snake)
    ) {
        gameEnded = true;
        return;
    }

    // Добавляем новую голову
    snake.unshift(newHead);
}

function restartGame() {
    initGame();
}

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    initGame();
});

