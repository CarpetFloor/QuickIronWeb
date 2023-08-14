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

function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;;
}

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
    this.gameIndex = -1;
}
let players = [];
let challenges = [];
let sequenceLength = 4;

function Game(players_) {
    this.startTime = null;
    this.playersInGame = [...players_];
    this.sequence = [];

    this.generateSequence = function() {
        // generate sequence
        let possible = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];

        for(let i = 0; i < sequenceLength; i++) {
            this.sequence.push(possible[random(0, possible.length - 1)]);
        }

        this.startTime = new Date();
    }
}
let games = [];
let start = false;

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
        // check if user was in an active duel
        let gameIndex = -1;
        for(let i = 0; i < games.length; i++) {
            if(games[i].playersInGame.includes(socket.id)) {
                gameIndex = i;
                break;
            }
        }

        if(gameIndex != -1) {
            // disconnect other player
            if(games[gameIndex].playersInGame[0] == socket.id) {
                io.to(String(games[gameIndex].playersInGame[1])).emit("otherPlayerLeft");
            }
            else {
                io.to(String(games[gameIndex].playersInGame[0])).emit("otherPlayerLeft");
            }

            // close game
            games.splice(gameIndex, 1);
        }

        // remove user from players list
        for(let i = 0; i < players.length; i++) {
            if(players[i].id == socket.id) {         
                players.splice(i, 1);
                io.to("lobby").emit("sendPlayerList", players);

                break;
            }
        }

        let involvedInChallenge = false;
        // remove all challenges involving user
        for(let i = 0; i < challenges.length; i++) {
            if(challenges[i].includes(socket.id)) {
                challenges.splice(i, 1);

                involvedInChallenge = true;
            }
        }

        if(involvedInChallenge) {
            io.to("lobby").emit("sendChallengesList", challenges);
        }
    });

    socket.on("challenge", (name) => {
        // find challenged user
        for(let i = 0; i < players.length; i++) {
            if(players[i].name == name) {
                let challenge = [];

                // add player who sent challenge
                challenge.push(socket.id);
                // add player who recieved challenge
                challenge.push(players[i].id);

                challenges.push(challenge);

                break;
            }
        }

        io.to("lobby").emit("sendChallengesList", challenges);
    });

    socket.on("startDuel", (challenge) => {
        // remove challenge from the list of open challenges
        for(let i = 0; i < challenges.length; i++) {
            if(challenges[i][0] == challenge[0] && challenges[i][1] == challenge[1]) {
                challenges.splice(i, 1);

                break;
            }
        }

        // create game
        let gameCreated = new Game(challenge);
        games.push(gameCreated);

        // update gameIndex of players in game
        for(let i = 0; i < players.length; i++) {
            if(players[i].id == challenge[0]) {
                players[i].gameIndex = games.length - 1;

                break;
            }
        }
        for(let i = 0; i < players.length; i++) {
            if(players[i].id == challenge[1]) {
                players[i].gameIndex = games.length - 1;

                break;
            }
        }

        // generate sequence
        gameCreated.generateSequence();

        // start the game
        queuePlayer(String(challenge[0]), gameCreated.sequence, false);
        queuePlayer(String(challenge[1]), gameCreated.sequence, true);

        start = true;
    });

    socket.on("sequenceCompleted", (playerFirstDone) => {
        // get players in challenge
        let index = -1;

        for(let i = 0; i < games.length; i++) {
            if(games[i].playersInGame.includes(socket.id)) {
                index = i;
                break;
            }
        }

        // let players know game is over
        /**
         * Don't really need to synchronize across players like with start, just make sure that the 
         * defeated player recieves the emit first so that they don't try to tell the server they have 
         * just won
         */
        let defeatedIndex = 0;
        let wonIndex = 1;

        if(games[index].playersInGame[0] == playerFirstDone) {
            defeatedIndex = 1;
            wonIndex = 0;
        }

        io.to(String(games[index].playersInGame[defeatedIndex])).emit("duelFinished", playerFirstDone);
        io.to(String(games[index].playersInGame[wonIndex])).emit("duelFinished", playerFirstDone);

        // remove game from list of active games
        games.splice(index, 1);
    });

});

function queuePlayer(player_, sequence_, secondPlayer) {
    if(start) {
        if(secondPlayer) {
            start = false;
        }

        io.to(player_).emit("duelHasStarted", sequence_);
    }
    else {
        setTimeout(function() {
            queuePlayer(player_, sequence_, secondPlayer);
        }, 10);
    }
}

// start server
server.listen(3000, () => {
  console.log("server started");
});