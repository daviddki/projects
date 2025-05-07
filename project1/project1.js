let mode = localStorage.getItem("mode") || "light";

window.onload = function() {
    if (mode == "dark") {
        darkMode();
    } else {
        lightMode();
    }
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