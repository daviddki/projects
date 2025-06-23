let mode = localStorage.getItem("mode") || "light";

window.onload = function() {
    const button = document.getElementById("modeButton");
    if (mode == "dark") {
        darkMode(button);
    } else {
        lightMode(button);
    }
}

function changeMode() {
    const button = document.getElementById("modeButton");
    if (mode == "light") {
        darkMode(button);
    } else {
        lightMode(button);
    }

    localStorage.setItem("mode", mode);
}

function darkMode(button) {
    mode = "dark";
    document.body.style.backgroundColor = "black";
    document.getElementById("header").style.color = "white";
    button.textContent = "Light Mode";
}

function lightMode(button) {
    mode = "light";
    document.body.style.backgroundColor = 'white';
    document.getElementById("header").style.color = "black";
    button.textContent = "Dark Mode";
}