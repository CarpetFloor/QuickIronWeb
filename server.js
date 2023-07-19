const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

// add static file(s)
app.use(express.static(__dirname));
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// handle users
io.on("connection", (socket) => {
    console.log(socket.id + " connected");

    socket.on("disconnect", () => {
        console.log(socket.id + " disconnected");
    });
});

// start server
server.listen(3000, () => {
  console.log("server started on *:3000");
});