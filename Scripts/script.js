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