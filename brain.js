class Brain {
    constructor(isRed) {
        this.isRed = isRed;
        this.randomNumber = 999999999999;

        this.table = [
            [],
            []
        ];

        this.initHash();
        this.isYellowToMove = this.randomNumber * Math.random();

        this.transpositions = {};
        this.positions = 0;
        this.depth = 8;
    }

    evaluate(pos, isRed) {
        let gameover = this.isGameOver(pos.board, isRed);
        if (gameover === true) {
            let factor = isRed ? 1 : -1;

            return {score: factor * Infinity, move: pos.move};
        }
        
        return {score: this.getScore(gameover, isRed), move: pos.move};
    }

    initHash() {
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 6*7; j++) {
                this.table[i].push(this.randomNumber * Math.random());
            }
        }
    }

    hash(pos, isRed) {
        let h = 0;
        if (!isRed) h ^= this.isYellowToMove;

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 7; j++) {
                let type = pos.board[i][j] - 1;

                if (type < 0) continue;

                let index = 7*i + j;
                h ^= this.table[type][index];
            }
        }

        return h;
    }

    getPos(key) {
        if (this.transpositions[key]) return this.transpositions[key];
        return false;
    }

    getScore(checkies, isRed) {
        let score = 0;
        let factor = isRed ? 1 : -1;
        let tester = isRed ? /[^1]/ : /[^2]/;

        checkies.forEach(String => {
            let strings = String.split(tester);

            strings.forEach(string => {
                score += factor * Math.floor((string.length/strings.length) * 100);
            });
        });

        return score;
    }


    isGameOver(board, isRed) {
        let type = isRed ? 1 : 2;
        let horizontal = this.checkHorizontal(type, board);
        let vertical = this.checkVertical(type, board);
        let diagonal = this.checkDiagonal(type, board);


        if (horizontal === true) {
            //console.log("horizontal")
            return true;
        }
        if (vertical === true) {
            //console.log("vertical")
            return true;
        }
        if (diagonal === true) {
            //console.log("diagonal")
            return true;
        }

        return [...horizontal, ...vertical, ...diagonal];
    }

    checkHorizontal(type, board) {
        let checkies = [];
        let checker = new RegExp(`${type}${type}${type}${type}`);

        for (let row of board) {
            let string = ""

            row.forEach(box => {
                string += box;
            });

            if (checker.test(string)) return true;
            checkies.push(string);
        }

        return checkies;
    }

    checkVertical(type, board) {
        let checker = new RegExp(`${type}${type}${type}${type}`);
        let checkies = [];

        for (let j = 0; j < board[0].length; j++) {
            let string = "";

            for (let i = 0; i < board.length; i++) {
                string += board[i][j];
            }

            //console.log(string);
            if (checker.test(string)) return true;
            checkies.push(string);
        }

        return checkies; 
    }

    checkDiagonal(type, board) {
        let checker = new RegExp(`${type}${type}${type}${type}`);
        let checkies = [];

        for (let j = 0; j < 7; j++) {
            let marginX = j <= 3 ? 1 : -1;

            let stringFirst = "";
            let stringLast = "";

            stringFirst += board[0][j];
            stringLast += board[5][j];

            for (let i = 1; i < 4; i++) {
                stringFirst += board[i][j + i*marginX];
                stringLast += board[5 - i][j + i*marginX];
            }

            if (checker.test(stringFirst)) return true;
            if (checker.test(stringLast)) return true;

            checkies.push(stringFirst);
            checkies.push(stringLast);

            if (j === 3) {
                marginX = -1;
                let stringFirst = "";
                let stringLast = "";

                stringFirst += board[0][j];
                stringLast += board[5][j];

                for (let i = 1; i < 4; i++) {
                    stringFirst += board[i][j + i*marginX];
                    stringLast += board[5 - i][j + i*marginX];
                }

                if (checker.test(stringFirst)) return true;
                if (checker.test(stringLast)) return true;

                checkies.push(stringFirst);
                checkies.push(stringLast);
            }
        }


        for (let i = 0; i < board.length; i++) {
            let marginY = i <= 2 ? 1 : -1;

            let stringFirst = "";
            let stringLast = "";

            stringFirst += board[i][0];
            stringLast += board[i][6];

            for (let j = 1; j < 4; j++) {
                //console.log(i, j, stringFirst)
                stringFirst += board[i + j*marginY][j];
                stringLast += board[i + j*marginY][6 - j];
            }

            if (checker.test(stringFirst)) return true;
            if (checker.test(stringLast)) return true;

            checkies.push(stringFirst);
            checkies.push(stringLast);
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

            string += board[corner.y][corner.x];

            for (let i = 1; i < 4; i++) {
                string += board[corner.y + i*marginY][corner.x + i*marginX];
            }

            //console.log(string)
            if (checker.test(string)) return true;
            checkies.push(string);
        };

        return checkies;
    }

    getMoveScore(board, move, isRed) {
        let pos = {board: board};

        this.applyMove(move, pos, isRed, -1);

        let gameover = this.isGameOver(pos.board, isRed);
        this.unMakeMove(move, pos);

        if (gameover === true) {
            if (isRed) return Infinity;
            return -Infinity;
        }

        return this.getScore(gameover, isRed);
    }

    getMoves(board, isRed) {
        if (this.isGameOver(board, !isRed) === true) return [];

        let moves = [];

        for (let j = 0; j < 7; j++) {
            for (let i = 5; i > -1; i--) {
                if (board[i][j] !== 0) continue;

                //moves.push({move: `${i}${j}`});

                
                let move = `${i}${j}`;
                let score = this.getMoveScore(board, move, isRed);

                moves.push({score, move});
                
                this.positions += 1;
                break;
            }
        }

        
        moves.sort((move1, move2) => {
            let factor = isRed ? 1 : -1;
            //console.log(move2.score, move1.score)
            return factor * (move2.score - move1.score);
        });
        
        return moves;
    }

    applyMove(move, pos, isRed, depth) {
        let type = isRed ? 1 : 2;

        let y = Number(move[0]);
        let x = Number(move[1]);

        pos.board[y][x] = type;

        if (depth === this.depth) pos.move = move;
    }

    unMakeMove(move, pos) {
        let y = Number(move[0]);
        let x = Number(move[1]);

        pos.board[y][x] = 0;
    }

    minimax(pos, isRed, alpha, beta, depth) {
        if (depth === 0) {
            return this.evaluate(pos, isRed);
        }

        if (isRed) {
            let value = {score: -Infinity};
            for (let Move of this.getMoves(pos.board, isRed)) {
                let move = Move.move;
                //let move = Move;
    
                this.applyMove(move, pos, isRed, depth);
                let key = this.hash(pos, !isRed);
                let comparison = this.getPos(key);
                if (comparison) {
                    let comps = comparison.split(",");
                    if (Number(comps[0]) >= depth - 1) {
                        this.unMakeMove(move, pos)

                        let score = Number(comps[1]);
                        if (score > value.score) value = {score, move: pos.move};
                        if (value.score > beta) break;

                        alpha = Math.max(alpha, value.score);
                        continue;
                    }
                }

                let newValue = this.minimax(pos, !isRed, alpha, beta, depth - 1);
                this.unMakeMove(move, pos);
                this.transpositions[key] = `${depth - 1},${newValue.score}`;
                if (newValue.score > value.score) value = newValue;
                if (value.score > beta) break;

                alpha = Math.max(alpha, value.score);
            }
            if (!value.move) value.move = pos.move;

            return value;
        } else {
            let value = {score: Infinity};
            for (let Move of this.getMoves(pos.board, isRed)) {
                let move = Move.move;
                //let move = Move;

                this.applyMove(move, pos, isRed, depth);
                let key = this.hash(pos, !isRed);
                let comparison = this.getPos(key);
                if (comparison) {
                    let comps = comparison.split(",");
                    if (Number(comps[0]) >= depth - 1) {
                        this.unMakeMove(move, pos)

                        let score = Number(comps[1]);
                        if (score < value.score) value = {score, move: pos.move};
                        if (value.score < alpha) break;

                        beta = Math.min(beta, value.score);
                        continue;
                    }
                }

                let newValue = this.minimax(pos, !isRed, alpha, beta, depth - 1);
                this.unMakeMove(move, pos);
                this.transpositions[key] = `${depth - 1},${newValue.score}`;

                if (newValue.score < value.score) value = newValue;
                if (value.score < alpha) break;

                beta = Math.min(beta, value.score);
            }
            if (!value.move) value.move = pos.move;

            return value;
        }
    }

    makeMove(board, isRed) {
        if (isRed !== !this.isRed) return;
        this.positions = 0;
        let pos = {board};

        let value = this.minimax(pos, this.isRed, -Infinity, Infinity, this.depth);
        console.log(value);
        console.log(this.positions); 
        return value;
    }
}