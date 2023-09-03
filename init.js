const restart = document.getElementById("restart");
const menu = document.getElementById("menu");

restart.addEventListener('click', () => {
    board.innerHTML = "";
    [...document.querySelectorAll(".piece")].forEach(piece => piece.remove());

    game = new Game(game.mode, game.color);
});