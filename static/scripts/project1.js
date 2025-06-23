let mode = localStorage.getItem("mode") || "light";

window.onload = function() {
    
    if (mode == "dark") {
        darkMode();
    } else {
        lightMode();
    }
    

    document.addEventListener('keydown', updateFaller);
}

function darkMode() {
    mode = "dark";
    document.body.style.backgroundColor = "black";
    document.getElementById("progress").style.color = "white";
}

function lightMode() {
    mode = "light";
    document.body.style.backgroundColor = 'white';
    document.getElementById("progress").style.color = "black";
}

function updateFaller(event) {
    switch(event.code){
        case "ArrowRight":
            //move right
            break;
        case "ArrowLeft":
            //move left
            break;
        case "ArrowDown":
            //move down
            break;
        case "ArrowUp":
            //rotate faller
            break;
        case "Space":
            //drop faller
            event.preventDefault();
            break;
    }
}

const grid = document.getElementById('gameGrid');

for (let i = 0; i < 12 * 5; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.textContent = ''; //No text content

  grid.appendChild(cell);
}