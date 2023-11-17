//definicija kanvasa
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//definicija igrača
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 20,
    height: 20,
    color: "red",
    speed: 15
};

//inicijalizacija varijabli
const asteroids = [];
const asteroidFrequency = 1000;
const minAsteroidSpeed = 1;
const maxAsteroidSpeed = 4;

let startTime = 0;
let bestTime = parseFloat(localStorage.getItem("bestTime")) || 0;

let isKeyPressed = false;
let timerInterval;
let timerCount = 0;

//crtanje igrača na canvasu
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}

//crtanje asteroida na canvasu
function drawAsteroids() {
    for (const asteroid of asteroids) {
        ctx.fillStyle = "gray";
        ctx.fillRect(asteroid.x - asteroid.width / 2, asteroid.y - asteroid.height / 2, asteroid.width, asteroid.height);
    }
}

//ažuriranje položaja igrača kad se kreće
function updatePlayer() {
    window.addEventListener("keydown", function (event) {
        if (!isKeyPressed) {
            isKeyPressed = true;

            switch (event.key) {
                case "ArrowUp":
                    player.y -= player.speed;
                    break;
                case "ArrowDown":
                    player.y += player.speed;
                    break;
                case "ArrowLeft":
                    player.x -= player.speed;
                    break;
                case "ArrowRight":
                    player.x += player.speed;
                    break;
            }
        }
    });

    window.addEventListener("keyup", function () {
        isKeyPressed = false;
    });

    //ako se izađe izvan granica
    if (player.x < 0) player.x = canvas.width;
    if (player.x > canvas.width) player.x = 0;
    if (player.y < 0) player.y = canvas.height;
    if (player.y > canvas.height) player.y = 0;
}

//ažuriranje položaja asteroida
function updateAsteroids() {
    const currentTime = new Date().getTime();

    if (currentTime - startTime > asteroidFrequency) {
        const newAsteroid = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            width: 30,
            height: 30,
            speed: Math.random() * (maxAsteroidSpeed - minAsteroidSpeed) + minAsteroidSpeed
        };

        asteroids.push(newAsteroid);
        startTime = currentTime;
    }

    for (const asteroid of asteroids) {
        asteroid.x -= asteroid.speed;

        //wrap around za asteriude
        if (asteroid.x + asteroid.width / 2 < 0) {
            asteroid.x = canvas.width + asteroid.width / 2;
            asteroid.y = Math.random() * canvas.height;
            asteroid.speed = Math.random() * (maxAsteroidSpeed - minAsteroidSpeed) + minAsteroidSpeed; //postavi novu brzinu od 1 do 4
        }
    }
}

//provjera kolizije
function checkCollision() {
    for (const asteroid of asteroids) {
        if (
            player.x < asteroid.x + asteroid.width / 2 &&
            player.x + player.width / 2 > asteroid.x &&
            player.y < asteroid.y + asteroid.height / 2 &&
            player.y + player.height / 2 > asteroid.y
        ) {
            //ako se dogodi kolizija zapamti vrijeme
            const currentTime = new Date().getTime();
            const playedTime = (currentTime - startTime + timerCount * 1000) / 1000;

            //ažuriraj najbolje vrijeme
            if (playedTime > bestTime) {
                bestTime = playedTime;
                localStorage.setItem("bestTime", bestTime.toFixed(3));
            }

            //prikazivanje rezultata
            alert(`Game Over!\nYour time: ${playedTime.toFixed(3)} seconds\nBest time: ${bestTime.toFixed(3)} seconds`);

            //game reset
            resetGame();
        }
    }
}

//timer
function startTimer() {
    timerInterval = setInterval(function () {
        timerCount++; 
        document.getElementById("timer").innerText = `Time: ${timerCount.toFixed(3)} seconds`;
    }, 1000);
}

//resetiranje igre, postavke na početne
function resetGame() {
    clearInterval(timerInterval);
    document.getElementById("timer").innerText = "Time: 0.000 seconds";
    timerCount = 0; 
    startTimer();

    startTime = new Date().getTime();
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    asteroids.length = 0;
    displayBestTime(); 
}

//prikazivanje najbolje vremenea
function displayBestTime() {
    const bestTimeElement = document.getElementById("bestTime");
    bestTimeElement.innerText = `Best Time: ${bestTime.toFixed(3)} seconds`;
}

//petlja koja pokreće igru
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updatePlayer();
    drawPlayer();

    updateAsteroids();
    drawAsteroids();

    checkCollision();

    requestAnimationFrame(gameLoop);
}

//pokretanje igre nakon što se učita stranica
function startGame() {
    startTimer();

    window.addEventListener("keydown", function (event) {
        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
                // spriječava pomicanje stranice prilikom pritiska na tipke sa strelicama
                event.preventDefault();
                break;
        }
    });

    gameLoop();
}

window.addEventListener("load", startGame);
