let socket = io();
let myId = "";
let players = [];
// index of players array
let myIndex = -1;

socket.on("sendId", function(id) {
    myId = id;
});

socket.on("sendPlayerList", function(playerList) {
    players = playerList;

    for(let i = 0; i < players.length; i++) {
        if(players[i].id == myId) {
            myIndex = i;
            
            break;
        }
    }
});