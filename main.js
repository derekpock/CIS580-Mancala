let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const containerRadius = 140;
const containerXMargin = 22.5;
const containerYMargin = 50;
const containerYOffset = 600 - (containerRadius * 2) - containerYMargin;

const pebbleRadius = 20;

canvas.style.backgroundColor = "#222222";
canvas.style.left = "calc(50% - (" + canvas.style.width + " / 2))";
canvas.style.top = "calc(50% - (" + canvas.style.height + " / 2))";
ctx.fillStyle = "#FFFFFF";

for(let x = 1; x < 7; x++) {
    for(let y = 0; y < 2; y++)
    {
        drawContainer(x, y);
    }
}
drawEndzone(0);
drawEndzone(1);

function drawContainer(x, y) {
    let xCoord = (x * ((containerRadius * 2) + containerXMargin)) + containerRadius;
    let yCoord = (y * ((containerRadius * 2) + containerYMargin)) + containerYOffset + containerRadius;
    setRadialContainerGradient(xCoord, yCoord);
    ctx.beginPath();
    ctx.arc(xCoord, yCoord, containerRadius, 0, 2*Math.PI);
    ctx.fill();
}

function drawEndzone(side) {
    let xCoord = (side * 7 * ((containerRadius * 2) + containerXMargin)) + containerRadius;
    let yCoordTop = containerYOffset + containerRadius;
    let yCoordBottom = (containerRadius * 2) + containerYMargin + containerYOffset + containerRadius;

    setRadialContainerGradient(xCoord, yCoordTop);
    ctx.beginPath();
    ctx.arc(xCoord, yCoordTop, containerRadius, Math.PI, 0);
    ctx.fill();

    setRadialContainerGradient(xCoord, yCoordBottom);
    ctx.beginPath();
    ctx.arc(xCoord, yCoordBottom, containerRadius, 0, Math.PI);
    ctx.fill();

    setLinearEndzoneGradient(xCoord - containerRadius, yCoordTop);
    ctx.fillRect(xCoord - containerRadius, yCoordTop, containerRadius * 2, yCoordBottom - yCoordTop);
}

function setRadialContainerGradient(x, y) {
    let grd = ctx.createRadialGradient(
        x,
        y,
        1,
        x,
        y,
        containerRadius);
    grd.addColorStop(0, "#222222");
    grd.addColorStop(1, "#666666");
    ctx.fillStyle = grd;
}

function setLinearEndzoneGradient(x, y) {
    let grd = ctx.createLinearGradient(
        x,
        y,
        x + (containerRadius * 2),
        y);
    grd.addColorStop(0,   "#666666");
    grd.addColorStop(0.5, "#222222");
    grd.addColorStop(1,   "#666666");
    ctx.fillStyle = grd;
}

function drawPebble(x, y) {

}