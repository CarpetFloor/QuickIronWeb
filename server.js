const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const path = require("path");

// add static file
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/Pages/index.html");
});

function getNextStrangerNum() {
    if(players.length == 0) {
        return 1;
    }
    else {
        let nums = [];
    
        // get numbers
        for(let i = 0; i < players.length; i++) {
            if(players[i].name.length > 8) {
                if(players[i].name.substring(0, 8) == "stranger") {
                    let num = parseInt(
                        players[i].name.substring(8, players[i].name.length)
                        );

                    nums.push(num);
                }
            }
        }

        // find smallest available
        let num = 1 ;

        while(nums.includes(num)) {
            ++num;
        }
        
        return num;

    }

}

function Player(id) {
    this.id = id;
    this.name = "stranger" + getNextStrangerNum();
    this.room = "lobby";
}
let players = []

// handle users
io.on("connection", (socket) => {
    let player = new Player(socket.id);
    players.push(player);
    socket.join("lobby");

    // give client their id
    socket.emit("sendId", socket.id);
    /**
     * All players are sent and sorted client-side to make sure that the server
     * only has to deal with handling games
     */
    io.to("lobby").emit("sendPlayerList", players);

    socket.on("disconnect", () => {
        for(let i = 0; i < players.length; i++) {
            if(players[i].id == socket.id) {         
                players.splice(i, 1);
                io.to("lobby").emit("sendPlayerList", players);

                break;
            }
        }

    });

});

// start server
server.listen(3000, () => {
  console.log("server started");
});