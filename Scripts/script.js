let socket = io();
let players = [];

socket.on("sendPlayerList", function(playerList) {
    players = playerList;

    console.log(players);
});