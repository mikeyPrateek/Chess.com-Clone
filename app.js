const express = require("express");
const socket = require("socket.io"); // socket can help to connect real time whatever where are we
const http = require("http");
const {Chess} = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app); // http or socket server are linked by this 
const io = socket(server);  // whatever socket can do that can be import to io by this 

const chess = new Chess(); // import chess by new game all rules were implament by chess also tell us which one is move black or white
let player = {};
let currentPlayer = "W";

app.set("view engine", "ejs"); // we can use ejs which is simailar to html
app.use(express.static(path.join(__dirname,"public"))); // we can use static files by this line like :: css,images,videos, fonts etc.

app.get("/",(req, res) =>{
    res.render("index");
});

io.on("connection", function(uniquesocket){   // each and every player should connected
    console.log("connected");

if (!player.white) {                         // line 26-34 means is that both player should know there color or assign an unique id or other players are in spectors only
    player.white = uniquesocket.id;
    uniquesocket.emit("playerRole", "w");
} else if (!player.black){
    player.black = uniquesocket.id;
    uniquesocket.emit("playerRole", "b");
} else {
    uniquesocket.emit("spectatorRole");
}

uniquesocket.on("disconnect", function(){    //line 36-42 if any player leave then delete his unique id
    if (uniquesocket.id == player.white){
        delete player.white;
    }else if (uniquesocket.id == player.black){
        delete player.black
    }
});

uniquesocket.on("move", (move) => {            //line 44 to 49 means any one player can move if anotherone is try to move fallback to same state
    try{
        if(chess.turn() === "w" && uniquesocket.id !== player.white) return;
        if(chess.turn() === "b" && uniquesocket.id !== player.black) return;

        const result = chess.move(move);
        if (result) {
            currentPlayer = chess.turn();
            io.emit("move" , move);
            io.emit("boardState" , chess.fen());
        }else {
            console.log("InvalidMove", move);
            uniquesocket.emit("InvalidMove", move);
        }
    } catch(err) {
        console.log(err);
        uniquesocket.emit("InvalidMove", move);
    }

    });
});

server.listen(3000, function () {
    console.log("listening on port 3000");
});
