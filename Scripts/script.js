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
const FPS = Math.round(1000 / 60);

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

    console.log("CHALLENGES:");
    console.log(challenges);
})

function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;;
}

let c;
let w = 0;
let h = 0;
let r;
let gameInterval;

function startPractice() {
    drawBackground();

    gameInterval = window.setInterval(practice, FPS);
}

function practice() {
    r.clearRect(0, 0, w, h);
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

    let originalGroundHeight = 150;
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
    console.log(extrasCount);
    for(let i = 0; i < extrasCount; i++) {
        let x = random(0, w);
        let y = random(h - originalGroundHeight, h);

        // r.drawImage(bgExtras[random(0, bgExtras.length)], x, y);
        let image = bgExtras[random(0, bgExtras.length - 1)];
        r.drawImage(image, x, y, image.width, image.height);
        console.log(w, h, originalGroundHeight)
        console.log(x, y);
    }

    r = c.getContext("2d");
}