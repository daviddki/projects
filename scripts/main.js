function changeMode() {
    var mode = document.getElementById("modeButton");
    if (mode.value == "light") {
        mode.value = "dark";
        document.body.style.backgroundColor = "black";
        document.getElementById("header").style.color = "white";
        mode.textContent = "Light Mode";
    } else {
        mode.value = "light";
        document.body.style.backgroundColor = 'white';
        document.getElementById("header").style.color = "black";
        mode.textContent = "Dark Mode";
    }
}