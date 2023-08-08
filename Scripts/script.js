/**
 * Game Mechanics:
 * -1 shot to the head, or 2 shots anywhere else
 * -Have to cock gun before each shot
 * -Can end in a draw
 * -Have to first move mouse to gun and press a button to equip
 * -3 buttons: shoot, cock, equip
 * -Target should be decently small, making headshots definitely small
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

    console.log(myId);
    console.log(myIndex);
    console.log(myRoom);
    console.log(players);
});

socket.on("sendChallengesList", function(challengesList) {
    challenges = challengesList;

    console.log("CHALLENGES:");
    console.log(challenges);
})