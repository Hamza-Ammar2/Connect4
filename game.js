const board = document.querySelector(".game");
const body = document.querySelector("body");
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
//const opponent = new Brain(false);

class Game {
    constructor(mode, color) {
        this.board = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0]
        ];

        this.turn = true;
        this.gameover = false;
        this.mode = mode;
        this.color = color;
        this.opponent = mode === "1" ? new Brain(color === "red" ? false : true) : null;
        this.createHoles();

        if (mode === "1" && color === "yellow") {
            setTimeout(() => this.robotMove(this.opponent.makeMove(this.board, !this.turn)), 0);
        }
    }


    createHoles() {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                const mask = document.createElement("div");
                const hole = document.createElement("div");

                mask.classList.add("mask");
                hole.classList.add("hole");

                mask.append(hole);
                hole.addEventListener('click',() => this.createBall(hole));
                hole.setAttribute("id", `${i}${j}`);

                board.append(mask);
            }
        }
    }

    applyGravity (id) {
        let x = Number(id[1]);
        let Y = null;

        for (let y = this.board.length - 1; y > -1; y--) {
            if (this.board[y][x] !== 0) continue;

            Y = y;
            break;
        }

        if (Y === null) return false;

        return document.getElementById(`${Y}${x}`);
    }

    createBall(element) {
        if (this.gameover) return;

        let child = this.applyGravity(element.getAttribute("id"));

        if (child === false) return;

        const piece = document.createElement("div");
        let pos = child.parentElement.getBoundingClientRect();
        let parentPos = child.parentElement.parentElement.getBoundingClientRect();


        let margin = (pos.width - pos.width * 0.9)/2;

        let y = pos.y + margin;
        let x = pos.x + margin;

        let initY = parentPos.y - 20 - pos.height * 0.9;

        let diffY = initY - y;

        if (this.turn) {
            piece.classList.add("pink")
        } else piece.classList.add("yellow");

        
        piece.style.position = "absolute";
        piece.style.top = `${y}px`;
        piece.style.left = `${x}px`;
        piece.style.height = `${pos.height * 0.9}px`;
        piece.style.width = `${pos.height * 0.9}px`;
        
        piece.style.transform = `translateY(${diffY}px)`;
        piece.classList.add("piece");
        
        body.append(piece);

        this.updateBoard(child.getAttribute("id"));
        this.turn = !this.turn;
        if (this.opponent)
            setTimeout(() => this.robotMove(this.opponent.makeMove(this.board, !this.turn)), 0);
    }


    robotMove(Move) {
        if (!Move) return;
        let move = Move.move;
        
        this.createBall(document.getElementById(move));
    }

    updateBoard(id) {
        let y = Number(id[0]);
        let x = Number(id[1]);

        let value = this.turn ? 1 : 2;

        this.board[y][x] = value;

        if (this.isGameOver()) {
            this.gameover = true;
            console.log('game ended');
            this.endGame();
        }
    }

    isGameOver() {
        let type = this.turn ? 1 : 2;

        if (this.checkHorizontal(type)) {
            console.log("horizontal")
            return true;
        }
        if (this.checkVertical(type)) {
            console.log("vertical")
            return true;
        }
        if (this.checkDiagonal(type)) {
            console.log("diagonal")
            return true;
        }
        return false;
    }

    checkHorizontal(type) {
        let checker = new RegExp(`${type}${type}${type}${type}`);

        for (let row of this.board) {
            let string = ""

            row.forEach(box => {
                string += box;
            });

            if (checker.test(string)) {
                //console.log(string);
                return true;}
        }

        return false;
    }

    checkVertical(type) {
        let checker = new RegExp(`${type}${type}${type}${type}`);

        for (let j = 0; j < this.board[0].length; j++) {
            let string = "";

            for (let i = 0; i < this.board.length; i++) {
                string += this.board[i][j];
            }

            //console.log(string);
            if (checker.test(string)) return true;
        }

        return false; 
    }

    checkDiagonal(type) {
        let checker = new RegExp(`${type}${type}${type}${type}`);

        for (let j = 0; j < 7; j++) {
            let marginX = j <= 3 ? 1 : -1;

            let stringFirst = "";
            let stringLast = "";

            stringFirst += this.board[0][j];
            stringLast += this.board[5][j];

            for (let i = 1; i < 4; i++) {
                stringFirst += this.board[i][j + i*marginX];
                stringLast += this.board[5 - i][j + i*marginX];
            }

            if (checker.test(stringFirst)) return true;
            if (checker.test(stringLast)) return true;

            if (j === 3) {
                marginX = -1;
                let stringFirst = "";
                let stringLast = "";

                stringFirst += this.board[0][j];
                stringLast += this.board[5][j];

                for (let i = 1; i < 4; i++) {
                    stringFirst += this.board[i][j + i*marginX];
                    stringLast += this.board[5 - i][j + i*marginX];
                }

                if (checker.test(stringFirst)) return true;
                if (checker.test(stringLast)) return true;
            }
        }


        for (let i = 0; i < this.board.length; i++) {
            let marginY = i <= 2 ? 1 : -1;

            let stringFirst = "";
            let stringLast = "";

            stringFirst += this.board[i][0];
            stringLast += this.board[i][6];

            for (let j = 1; j < 4; j++) {
                //console.log(i, j, stringFirst)
                stringFirst += this.board[i + j*marginY][j];
                stringLast += this.board[i + j*marginY][6 - j];
            }

            if (checker.test(stringFirst)) return true;
            if (checker.test(stringLast)) return true;
        }

        let extras = [
            {y: 1, x: 1},
            {y: 1, x: 2},
            {y: 1, x: 5},
            {y: 1, x: 4},
            {y: 5, x: 1},
            {y: 5, x: 2},
            {y: 5, x: 5},
            {y: 5, x: 4}
        ]

        for (let corner of extras) {
            let marginY = corner.y < 3 ? 1 : -1;
            let marginX = corner.x < 3 ? 1 : -1;

            let string = "";

            string += this.board[corner.y][corner.x];

            for (let i = 1; i < 4; i++) {
                string += this.board[corner.y + i*marginY][corner.x + i*marginX];
            }

            //console.log(string)
            if (checker.test(string)) return true;
        };

        return false;
    }

    endGame() {
        if (this.turn) {
            let score = Number(player1.innerText);

            player1.innerText = score + 1;
        } else {
            let score = Number(player2.innerText);

            player2.innerText = score + 1;
        }

        const cont = document.createElement("div");
        const div = document.createElement("div");
        const head = document.createElement("h1");
        const p = document.createElement("p");
        const btn = document.createElement("button");
        const img = document.createElement("img");

        img.setAttribute("src", "assets/icon-close.svg");
        btn.append(img);
        head.innerText = "Game Over!";
        p.innerText = `Player${this.turn ? "1" : "2"} wins!`;
        cont.classList.add("contain");
        div.classList.add("end-box");

        btn.addEventListener('click', () => cont.remove());

        div.append(head);
        div.append(p);
        cont.append(btn);
        cont.append(div);
        body.append(cont);
    }
}