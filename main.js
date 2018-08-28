let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

const CURRENT_X = 0;
const CURRENT_Y = 1;
const TARGET_X = 2;
const TARGET_Y = 3;
const PRIMARY_COLOR = 4;
const SECONDARY_COLOR = 5;
const CONTAINER_X = 6;
const CONTAINER_Y = 7;
const OWNER = 8;
const FLASH_RATE = 9;

const LEFT = 0;
const RIGHT = 1;
const NONE = 2;

const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const containerRadius = 140;
const containerXMargin = 22.5;
const containerYMargin = 50;
const containerYOffset = 600 - (containerRadius * 2) - containerYMargin;
const canvasResolutionMultiplier = 2;

const pebbleRadius = 30;
const pebbleShimmy = 3;

let pebbles = [];
let containers = [];
let turn = RIGHT;
let tick = 0;


init();
draw();


function init() {
    canvas.style.backgroundColor = "#222222";
    canvas.style.left = "calc(50% - (" + canvas.style.width + " / 2))";
    canvas.style.top = "calc(50% - (" + canvas.style.height + " / 2))";
    ctx.fillStyle = "#FFFFFF";

    for(let y = 0; y < 2; y++)
    {
        let containerLevel = [];
        for(let x = 0; x < 6; x++) {
            containerLevel.push(createContainer(x, y));
            for(let i = 0; i < 4; i++) {
                pebbles.push(createPebble(x, y));
            }
        }
        containers.push(containerLevel);
    }
    scheduleDraw();
}

function scheduleDraw() {
    window.requestAnimationFrame(scheduleDraw);
    tick++;
    draw();
    setTimeout(logic, 0);
}

function logic() {
    for(let i = 0; i < pebbles.length; i++) {
        pebbles[i][TARGET_X] += (Math.random() * 2 * pebbleShimmy) - pebbleShimmy;
        pebbles[i][TARGET_Y] += (Math.random() * 2 * pebbleShimmy) - pebbleShimmy;
        pebbles[i] = fixPebbleCoordinates(pebbles[i]);

        pebbles[i][CURRENT_X] += (pebbles[i][TARGET_X] - pebbles[i][CURRENT_X]) / 15;
        pebbles[i][CURRENT_Y] += (pebbles[i][TARGET_Y] - pebbles[i][CURRENT_Y]) / 15;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    for(let y = 0; y < 2; y++)
    {
        for(let x = 0; x < 6; x++) {
            drawContainer(x, y);
        }
        drawEndzone(y);
    }

    for(let i = 0; i < pebbles.length; i++)
    {
        drawPebble(i);
    }
}


function createContainer(x, y) {
    let container = [];
    container[CURRENT_X] = ((x + 1) * ((containerRadius * 2) + containerXMargin)) + containerRadius;
    container[CURRENT_Y] = (y * ((containerRadius * 2) + containerYMargin)) + containerYOffset + containerRadius;
    return container;
}

function drawContainer(x, y) {
    let container = containers[y][x];
    let xCoord = container[CURRENT_X];
    let yCoord = container[CURRENT_Y];

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

function setRadialPebbleGradient(x, y, innerColor, outerColor) {
    let grd = ctx.createRadialGradient(
        x,
        y,
        1,
        x,
        y,
        pebbleRadius);
    grd.addColorStop(0, innerColor);
    grd.addColorStop(1, outerColor);
    ctx.fillStyle = grd;
}

function createPebble(containerX, containerY) {
    let newPebble = [];
    newPebble[CURRENT_X] = Math.random() * canvasWidth;
    newPebble[CURRENT_Y] = Math.random() * canvasHeight;
    newPebble[TARGET_X] = Math.random() * canvasWidth;
    newPebble[TARGET_Y] = Math.random() * canvasHeight;
    newPebble[PRIMARY_COLOR] = getRandomCSSColor();
    newPebble[SECONDARY_COLOR] = getRandomCSSColor();
    newPebble[CONTAINER_X] = containerX;
    newPebble[CONTAINER_Y] = containerY;
    newPebble[OWNER] = NONE;
    newPebble[FLASH_RATE] = (Math.random() * 100) + 20;
    return newPebble;
}

function fixPebbleCoordinates(pebble)
{
    let pebbleX = pebble[TARGET_X];
    let pebbleY = pebble[TARGET_Y];

    if(pebble[OWNER] === NONE) {
        let container = containers[pebble[CONTAINER_Y]][pebble[CONTAINER_X]];
        let containerX = container[CURRENT_X];
        let containerY = container[CURRENT_Y];

        pebble = returnPebbleToSphere(pebble, containerX, containerY);
    } else {
        let containerX = (pebble[OWNER] * 7 * ((containerRadius * 2) + containerXMargin)) + containerRadius;
        let containerYTop = containerYOffset + containerRadius;
        let containerYBottom = (containerRadius * 2) + containerYMargin + containerYOffset + containerRadius;

        // check if it is above or below the rectangular axis
        if(pebbleY < containerYTop) {
            pebble = returnPebbleToSphere(pebble, containerX, containerYTop);
        } else if (pebbleY > containerYBottom) {
            pebble = returnPebbleToSphere(pebble, containerX, containerYBottom);
        } else {
            let difference = pebbleX - containerX;
            if(difference > 0) {
                if(difference > (containerRadius - pebbleRadius)) {
                    pebble[TARGET_X] -= difference - (containerRadius - pebbleRadius);
                }
            } else {
                if(difference < -(containerRadius - pebbleRadius)) {
                    pebble[TARGET_X] -= difference + (containerRadius - pebbleRadius);
                }
            }
        }
    }
    return pebble;
}

function returnPebbleToSphere(pebble, containerX, containerY) {
    let polarData = polarDistanceAndAngle(pebble[TARGET_X], pebble[TARGET_Y], containerX, containerY);
    let distance = polarData[0];
    let angle = polarData[1];
    let diff = distance - (containerRadius - pebbleRadius);
    if(diff > 0) {
        pebble[TARGET_X] += (diff * Math.cos(angle));
        pebble[TARGET_Y] += (diff * Math.sin(angle));
    }
    return pebble;
}

function polarDistanceAndAngle(x1, y1, x2, y2) {
    let dX = x2 - x1;
    let dY = y2 - y1;

    let distance = Math.sqrt(dX * dX + dY * dY);
    let angle = Math.atan2(dY, dX);
    return [distance, angle];
}

function drawPebble(index) {
    let pebble = pebbles[index];
    let alpha = (tick % (2 * pebble[FLASH_RATE])) / pebble[FLASH_RATE];
    if(alpha > 1) {
        alpha = 2 - alpha;
    }

    let primaryColors = pebble[PRIMARY_COLOR];
    let secondaryColors = pebble[SECONDARY_COLOR];

    let modifiedPrimaryColors = [];
    for(let i = 0; i < 3; i++) {
        modifiedPrimaryColors[i] = (primaryColors[i] * alpha) + (secondaryColors[i] * (1 - alpha));
    }

    let x = pebble[CURRENT_X];
    let y = pebble[CURRENT_Y];

    let primaryColor = "rgb(" + modifiedPrimaryColors[0] + "," + modifiedPrimaryColors[1] + "," + modifiedPrimaryColors[2] + ")";
    let secondaryColor = "rgb(" + secondaryColors[0] + "," + secondaryColors[1] + "," + secondaryColors[2] + ")";

    setRadialPebbleGradient(x, y, primaryColor, secondaryColor);
    ctx.shadowBlur = 25;
    ctx.shadowColor = "rgb(" + primaryColors[0] + "," + primaryColors[1] + "," + primaryColors[2] + ")";
    ctx.beginPath();
    ctx.arc(x, y, pebbleRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
}

function getRandomCSSColor()
{
    let r = Math.random() * 256;
    let g = Math.random() * 256;
    let b = Math.random() * 256;
    return [r, g, b];
}

canvas.addEventListener("click", function(event) {
    let mouseX = (event.clientX - canvas.offsetLeft) * canvasResolutionMultiplier;
    let mouseY = (event.clientY - canvas.offsetTop) * canvasResolutionMultiplier;

    let possibleContainerX =
        Math.round(((mouseX - containerRadius) / ((containerRadius * 2) + containerXMargin)) - 1);
    let possibleContainerY =
        Math.round((mouseY - containerYOffset - containerRadius) / ((containerRadius * 2) + containerYMargin));

    if(possibleContainerY >= 0 && possibleContainerY < 2 &&
        possibleContainerX >= 0 && possibleContainerX < 6) {
        let container = containers[possibleContainerY][possibleContainerX];

        if(polarDistanceAndAngle(mouseX, mouseY, container[CURRENT_X], container[CURRENT_Y])[0] < containerRadius) {
            // Clicked the container sphere
            let myPebbles = [];
            for(let i = 0; i < pebbles.length; i++) {
                if(pebbles[i][CONTAINER_X] === possibleContainerX &&
                    pebbles[i][CONTAINER_Y] === possibleContainerY) {
                    myPebbles.push(i);
                }
            }

            for(let i = 0; i < myPebbles.length; i++) {
                let p = pebbles[myPebbles[i]];
                if(p[CONTAINER_Y] === 0) {
                    p[CONTAINER_X] -= (i + 1);
                } else {
                    p[CONTAINER_X] += (i + 1);
                }
            }

            for(let i = 0; i < myPebbles.length; i++) {
                let p = pebbles[myPebbles[i]];
                if(p[CONTAINER_Y] === 0) {
                    if(p[CONTAINER_X] === -1) {
                        p[OWNER] = LEFT;
                    } else if (p[CONTAINER_X] < 0) {
                        p[CONTAINER_Y] = 1;
                        p[CONTAINER_X] = (-p[CONTAINER_X]) - 2;
                        i--;
                    }
                } else {
                    if(p[CONTAINER_X] === 6) {
                        p[OWNER] = RIGHT;
                    } else if (p[CONTAINER_X] > 6) {
                        p[CONTAINER_Y] = 0;
                        p[CONTAINER_X] = (-p[CONTAINER_X]) + 12;
                        i--;
                    }
                }
            }
            draw();
        }
    }
});