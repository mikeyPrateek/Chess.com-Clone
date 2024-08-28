const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
//varibles
let draggedPiece = null;                   //Line 5-7 are variable which is declare because when you enter the game so you don't know whaich side is your either white or black 
let sourceSquare = null;
let playerRole = null;

//Function clinet side
const renderBoard = () => {
    const board = chess.board();
    boardElement.innerHTML = "";
    board.forEach((row, rowindex) => {
        row.forEach((square,squareindex)=>{
            const squareElement = document.createElement("div");
            squareElement.classList.add("square",(rowindex + squareindex) % 2 === 0 ? "light" : "dark");

            squareElement.dataset.row = rowindex;
            squareElement.dataset.col = squareindex;

            if (square) {
                const pieceElement= document.createElement("div");
                pieceElement.classList.add("piece", square.color === "w" ? "white" : "black");
                pieceElement.innerText = getPieceUnicode(square);
                pieceElement.draggable = playerRole === square.color;

                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        draggedPiece = pieceElement;
                        sourceSquare = { row: rowindex, col: squareindex};
                        e.dataTransfer.setData("text/plain", ""); 
                    }
                });
                pieceElement.addEventListener("dragend", (e) => {
                    draggedPiece = null;
                    sourceSquare = null;
                });
                squareElement.appendChild(pieceElement);
            }

            squareElement.addEventListener("dragover", function (e){
                e.preventDefault();
            });

            squareElement.addEventListener("drop", function(e){
                e.preventDefault();
                if (draggedPiece){
                    const targetSource = {
                        row: parseInt(squareElement.dataset.row),col: parseInt(squareElement.dataset.col),
                    };

                    handleMove(sourceSquare, targetSource);
                }
            });
            boardElement.appendChild(squareElement);
        });
    });
};

const handleMove = () => {
    const move = {
        from: '${String.fromCharCode(97+source.col)}${8 - source.row}',
        to: '${String.fromCharCode(97+source.col)}${8 - source.row}',
        promotion: 'q'
    };

    socket.emit("move" , move);
};
const getPieceUnicode = (piece) => {
    const unicodePieces = {
        p:"♙",
        r:"♖",
        n:"♘",
        b:"♗",
        q:"♕",
        k:"♔",
        P:"♟",
        R:"♜",
        N:"♝",
        B:"♞",
        Q:"♛",
        K:"♚",  
    };

    return unicodePieces[piece.type]  || "";
};
socket.on("PlayerRole",function(role) {
    playerRole = role;
    renderBoard();
});

socket.on("spectatorRole", function(){
    playerRole = null;
    renderBoard();
});

socket.on("boardState", function(fen) {
    chess.load(fen);
    renderBoard();
});

socket.on("move", function(fen) {
    chess.move(move);
    renderBoard();
});

renderBoard();