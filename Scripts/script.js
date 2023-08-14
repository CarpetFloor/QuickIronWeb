/**
 * Game Mechanics:
 * -Have to complete a random 4-key sequence of arrow keys correctly before the other player
 */

/**
 * Player frames are 640x640 px
 */

let socket = io();
let players = [];
// note that players in challenges are stored as ids, but can get name through players list
let challenges = [];
let myId = "";
let myIndex = -1;
let myRoom = "";
const FPS = Math.round(1000 / 30);

let deathFramesPerSheet = 10;
let deathAnimationSpritesheets = 17;
let maxDeathFrames = deathFramesPerSheet * deathAnimationSpritesheets;
let deathAnimations = [];
let deathPlayerAnimations = [];

// init death animation
// split up into many small spritesheets because had issues with one large spritesheet
for(let i = 1; i <= deathAnimationSpritesheets; i++) {
    let image = new Image();
    image.src = "../Assets/Death/death" + i + ".png";

    deathAnimations.push(image);

    image = new Image();
    image.src = "../Assets/Death/death" + i + "player.png";

    deathPlayerAnimations.push(image);
}

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
            myName = players[i].name;
            
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

function getName(id) {
    for(let i = 0; i < players.length; i++) {
        if(players[i].id == id) {
            return players[i].name;
        }
    }
}

let c;
let w = 0;
let h = 0;
let r;
let gameInterval;
let startTime;
let endTime;

function startPractice() {
    multiplayer = false;
    
    drawBackground();
    
    reset();
    
    getSequence();

    startTimer();
}

function reset() {
    if(!(multiplayer)) {
        sequence = [];
    }
    sequenceProgress = 0;
    frame = 0
    frameOther = 0;
    deathFrame = 0;
    completed = false;

    timeFrame = 0;
    secondsLeft = 3;
    timeX = w / 4;
    timeXvelocity = 25;
}

function getSequence() {
    let possible = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

    for(let i = 0; i < 4; i++) {
        sequence.push(possible[random(0, possible.length - 1)]);
    }
}

// stuff gets set in reset function
let timeFrame = -1;
let secondsLeft = -1;
let timeX = -1;
let timeXvelocity = -1;

function startTimer() {
    r.clearRect(0, 0, w, h);

    drawPlayer();

    r.fillStyle = "#F7DC6F";
    r.font = "200px Neucha";
    r.fillText(secondsLeft + "...", timeX, h / 2);
    
    if(timeFrame > FPS / 3) {
        timeXvelocity = 10;
    }

    timeX += timeXvelocity;
    
    ++timeFrame;
    let callAgain = true;

    if(timeFrame == FPS) {
        if(secondsLeft == 1) {
            callAgain = false;

            if(multiplayer) {
                gameInterval = window.setInterval(duel, FPS);
                document.getElementById("iframe").contentWindow.document.addEventListener("keydown", keyDown);
            }
            else {
                gameInterval = window.setInterval(practice, FPS);
                document.getElementById("iframe").contentWindow.document.addEventListener("keydown", keyDown);
                startTime = new Date();
            }
        }
        else {
            timeFrame = 0;
            --secondsLeft;
            timeX = w / 4;
            timeXvelocity = 25;
        }
    }

    if(callAgain) {
        window.setTimeout(startTimer, FPS);
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

let otherPlayerImage = new Image();
otherPlayerImage.src = "../Assets/OtherPlayer.png";

let frame = 0;
let frameOther = 0;
let deathFrame = 0;
let maxFrames = 50;
let frameSize = 640;
let playerSpacing = 500;
let playerSize = frameSize / 3;
let originalGroundHeight = 150;
let sequence = [];
let completed = false;
let myName = "";
let otherName = "";

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
    if(multiplayer) {
        // player
        if(completed && !(won)) {
            r.drawImage(
                deathAnimations[Math.floor(frame / deathFramesPerSheet)],
                deathFrame * frameSize, // clip start x
                0, // clip start y 
                frameSize, // clip size x
                frameSize, // clip size y
                (w / 2) - (playerSpacing / 2) - (playerSize / 2), // position x
                h - originalGroundHeight - playerSize + 50, // position y
                playerSize, // image width
                playerSize // image height
            );
        }
        else {
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

        // other player
        if(completed && won) {
            r.drawImage(
                deathPlayerAnimations[Math.floor(frameOther / deathFramesPerSheet)], 
                deathFrame * frameSize, // clip start x
                0, // clip start y 
                frameSize, // clip size x
                frameSize, // clip size y
                (w / 2) + (playerSpacing / 2) - (playerSize / 2), // position x
                h - originalGroundHeight - playerSize + 50, // position y
                playerSize, // image width
                playerSize // image height
            );
        }
        else {
            r.drawImage(
                otherPlayerImage, 
                frameOther * frameSize, // clip start x
                0, // clip start y 
                frameSize, // clip size x
                frameSize, // clip size y
                (w / 2) + (playerSpacing / 2) - (playerSize / 2), // position x
                h - originalGroundHeight - playerSize + 50, // position y
                playerSize, // image width
                playerSize // image height
            );
        }

        drawNamesText();
    }
    else {
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
}

function drawNamesText() {
    let offset = 35;
    let y = h - originalGroundHeight + 50 + offset;

    r.font = "bold 20px Neucha";
    r.fillStyle = "black";

    // player name

    let text = "you";
    let textWidth = r.measureText(text).width;

    r.fillText(
        text, 
        (w / 2) - (playerSpacing / 2)  - (textWidth / 2), 
        y
    );

    // other player name
    
    text = otherName;
    textWidth = r.measureText(text).width;

    r.fillText(
        text, 
        (w / 2) + (playerSpacing / 2) - (textWidth / 2), 
        y
    );

    // vs text in middle

    text = "vs";
    textWidth = r.measureText(text).width;

    r.fillText(
        text, 
        (w / 2) - (textWidth / 2), 
        y
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
    let totalWidth = arrowSize * sequence.length;
    let startX = (w / 2) - (totalWidth / 2);

    for(let i = 0; i < sequence.length; i++) {
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

            if(sequenceProgress == sequence.length) {
                if(!(multiplayer)) {
                    endTime = new Date();
                }

                window.removeEventListener("keydown", keyDown);
                completed = true;

                if(multiplayer) {
                    socket.emit("sequenceCompleted", myId);
                }
            }
        }
        else {
            sequenceProgress = 0;
        }
    }
}

function showTime() {
    let time = (endTime - startTime) / 1000;

    r.font = "70px Neucha";
    r.fillStyle = "black";
    let text = time + "s";
    let textWidth = r.measureText(text).width;
    r.fillText(text, (w / 2) - (textWidth / 2), h / 2);

    // show back to main menu button
    let ref = document.getElementById("iframe").contentWindow;
    ref.document.getElementById("practiceMainMenuButton").style.display = "block";
}

let multiplayer = false;

socket.on("duelHasStarted", function(sequence_, bothPlayers){
    multiplayer = true;
    sequence = sequence_;
    
    // get name of other player
    if(bothPlayers[0] == myId) {
        otherName = getName(bothPlayers[1]);
    }
    else {
        otherName = getName(bothPlayers[0]);
    }
    
    document.getElementById("iframe").src = "../Pages/duel.html";
});

function startDuel() {
    drawBackground();
    
    reset();

    startTimer();
}

function duel() {
    r.clearRect(0, 0, w, h);

    drawArrows();

    drawPlayer();

    if(completed) {
        let frameCount = -1;

        if(won) {
            if(frame < maxFrames) {
                ++frame;
            }
            
            ++frameOther;
            ++deathFrame
            frameCount = frameOther;

            if((frameOther % deathFramesPerSheet == 0) && (frameOther != 0)) {
                deathFrame = 0;
            }
        }
        else {
            if(frameOther < maxFrames) {
                ++frameOther;
            }
            
            ++frame;
            ++deathFrame;
            frameCount = frame;

            if((frame % deathFramesPerSheet == 0) && (frame != 0)) {
                deathFrame = 0;
            }
        }

        if(frameCount == maxDeathFrames) {
            window.clearInterval(gameInterval);
            
            // show back to main menu button
            let ref = document.getElementById("iframe").contentWindow;
            ref.document.getElementById("duelMainMenuButton").style.display = "block";
        }
    }
}

let won = false;

socket.on("duelFinished", function(winnerId) {
    won = (winnerId == myId);
    completed = true;
});

socket.on("otherPlayerLeft", function() {
    multiplayer = false;
    window.removeEventListener("keydown", keyDown);
    window.clearInterval(gameInterval);

    // go back to main menu
    document.getElementById("iframe").src = "../Pages/home.html";
})