let socket = io();
let players = [];
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