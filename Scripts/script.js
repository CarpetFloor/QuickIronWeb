/**
 * Game Mechanics:
 * -Have to complete a random 4-key sequence of arrow keys correctly before the other player
 */

/**
 * Player frames are 640x640 px
 */

let sequenceLength = 4;

let socket = io();
let players = [];
// note that players in challenges are stored as ids, but can get name through players list
let challenges = [];
let myId = "";
let myIndex = -1;
let myRoom = "";
const FPS = Math.round(1000 / 30);

socket.on("sendId", function(id) {
    myId = id;
});

socket.on("sendPlayerList", function(playerList) {
    players = playerList;

    // find client
    for(let i = 0; i < players.length; i++) {
        if(players[i].id == myId) {
            myIndex = i;
            myRoom = players[i].room;
            
            break;
        }
    }
});

socket.on("sendChallengesList", function(challengesList) {
    challenges = challengesList;
})

function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;;
}

let c;
let w = 0;
let h = 0;
let r;
let gameInterval;
let startTime;
let endTime;

function startPractice() {
    getSequence();

    drawBackground();

    gameInterval = window.setInterval(practice, FPS);
    document.getElementById("iframe").contentWindow.document.addEventListener("keydown", keyDown);
    startTime = new Date();
}

function getSequence() {
    let possible = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

    for(let i = 0; i < sequenceLength; i++) {
        sequence.push(possible[random(0, possible.length - 1)]);
    }
}

let bgExtras = [];

let cactus1 = new Image();
cactus1.src = "../Assets/Extras/Cactus1.png";
bgExtras.push(cactus1)

let cactus2 = new Image();
cactus2.src = "../Assets/Extras/Cactus2.png";
bgExtras.push(cactus2)

let grass1 = new Image();
grass1.src = "../Assets/Extras/Grass1.png";
bgExtras.push(grass1)

let grass2 = new Image();
grass2.src = "../Assets/Extras/Grass2.png";
bgExtras.push(grass2)

let rock1 = new Image();
rock1.src = "../Assets/Extras/Rock1.png";
bgExtras.push(rock1)

let rock2 = new Image();
rock2.src = "../Assets/Extras/Rock2.png";
bgExtras.push(rock2)

function drawBackground() {
    c = document.getElementById("iframe").contentWindow.document.getElementById("canvas");

    let bgc = document.getElementById("iframe").contentWindow.document.getElementById("bgcanvas");
    bgc.width = window.innerWidth - 40;
    bgc.height = window.innerHeight - 70;
    w = bgc.width;
    h = bgc.height;

    c.width = w;
    c.height = h;
    
    r = bgc.getContext("2d");
    // sky
    r.fillStyle = "#7FB3D5";
    r.fillRect(0, 0, w, h);

    let groundHeight = originalGroundHeight;
    
    let red = 200;
    let green = 174;
    let blue = 125;

    let segments = 3;
    let increment = 7;

    red += increment * segments;
    green += increment * segments;
    blue += increment * segments;

    // draw ground with shading-ish
    for(let i = 0; i < segments; i++) {
        r.fillStyle = "rgb(" + red + ", " + green + ", " + blue +")";
        r.fillRect(0, h - groundHeight, w, groundHeight);
        
        red -= increment;
        green -= increment;
        blue -= increment;
        groundHeight -= groundHeight / segments;
    }

    // place extras
    let extrasCount = random(4, 8);
    for(let i = 0; i < extrasCount; i++) {
        let x = random(0, w);
        let y = random(h - originalGroundHeight, h);

        // r.drawImage(bgExtras[random(0, bgExtras.length)], x, y);
        let image = bgExtras[random(0, bgExtras.length - 1)];
        r.drawImage(image, x, y, image.width, image.height);
    }

    r = c.getContext("2d");
}

let playerImage = new Image();
playerImage.src = "../Assets/Player.png";
let frame = 0;
let maxFrames = 50;
let frameSize = 640;
let playerSpacing = 500;
let playerSize = frameSize / 3;
let originalGroundHeight = 150;
let sequence = [];
let completed = false;

function practice() {
    r.clearRect(0, 0, w, h);

    drawArrows();

    drawPlayer();

    if(completed) {
        ++frame;

        if(frame == maxFrames) {
            window.clearInterval(gameInterval);
            showTime();
        }
    }
}

function drawPlayer() {
    r.drawImage(
        playerImage, 
        frame * frameSize, // clip start x
        0, // clip start y 
        frameSize, // clip size x
        frameSize, // clip size y
        (w / 2) - (playerSpacing / 2) - (playerSize / 2), // position x
        h - originalGroundHeight - playerSize + 50, // position y
        playerSize, // image width
        playerSize // image height
    );
}

let arrowSize = 100 ;

let arrowLeft = new Image();
arrowLeft.src = "../Assets/Arrows/ArrowLeft.png";
let arrowRight = new Image();
arrowRight.src = "../Assets/Arrows/ArrowRight.png";
let arrowUp = new Image();
arrowUp.src = "../Assets/Arrows/ArrowUp.png";
let arrowDown = new Image();
arrowDown.src = "../Assets/Arrows/ArrowDown.png";

let arrowLeftCompleted = new Image();
arrowLeftCompleted.src = "../Assets/Arrows/ArrowLeftCompleted.png";
let arrowRightCompleted = new Image();
arrowRightCompleted.src = "../Assets/Arrows/ArrowRightCompleted.png";
let arrowUpCompleted = new Image();
arrowUpCompleted.src = "../Assets/Arrows/ArrowUpCompleted.png";
let arrowDownCompleted = new Image();
arrowDownCompleted.src = "../Assets/Arrows/ArrowDownCompleted.png";

function drawArrows() {
    let totalWidth = arrowSize * sequenceLength;
    let startX = (w / 2) - (totalWidth / 2);

    for(let i = 0; i < sequenceLength; i++) {
        let image;

        switch(sequence[i]) {
            case "ArrowLeft":
                image = arrowLeft;

                if(i < sequenceProgress) {
                    image = arrowLeftCompleted;
                }

                break;
            case "ArrowRight":
                image = arrowRight;

                if(i < sequenceProgress) {
                    image = arrowRightCompleted;
                }

                break;
            case "ArrowUp":
                image = arrowUp;

                if(i < sequenceProgress) {
                    image = arrowUpCompleted;
                }

                break;
            case "ArrowDown":
                image = arrowDown;

                if(i < sequenceProgress) {
                    image = arrowDownCompleted;
                }

                break;
        }

        r.drawImage(image, startX + (i * arrowSize), 200, arrowSize, arrowSize);
    }
}

let sequenceProgress = 0;

function keyDown(e) {
    if(!(completed)) {
        if(e.key == sequence[sequenceProgress]) {
            ++sequenceProgress;

            if(sequenceProgress == sequenceLength) {
                endTime = new Date();

                window.removeEventListener("keydown", keyDown);
                completed = true;
            }
        }
        else {
            sequenceProgress = 0;
        }
    }
}

function showTime() {
    let time = (endTime - startTime) / 1000;

    r.font = "70px Alegreya SC";
    r.fillStyle = "black";
    let text = time + "s";
    let textWidth = r.measureText(text).width;
    r.fillText(text, (w / 2) - (textWidth / 2), h / 2);

    // show back to main menu button
    iframeRef.document.getElementById("practiceMainMenuButton").style.display = "block";

    console.log(time);
}