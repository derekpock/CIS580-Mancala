let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

/// Indexes for lists
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

const PEBBLE_COUNT = 2;

/// Ownership options
const LEFT = 0;
const RIGHT = 1;
const NONE = 2;

/// Constants
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;
const containerRadius = 140;
const containerXMargin = 22.5;
const containerYMargin = 50;
const containerYOffset = 600 - (containerRadius * 2) - containerYMargin;
const canvasResolutionMultiplier = 2;
const endzoneYTop = containerYOffset + containerRadius;
const endzoneYBottom = (containerRadius * 2) + containerYMargin + containerYOffset + containerRadius;

const pebbleRadius = 30;
const pebbleShimmy = 3;

/// Data structures
let pebbles = [];
let containers = [];
let numberXPositions = [];
let scores = [];
let turn = RIGHT;
let tick = 0;

init();

/// Initialize and start drawing/logic loops.
function init() {
    canvas.style.backgroundColor = "#222222";
    // Center the canvas in the screen.
    canvas.style.left = "calc(50% - (" + canvas.style.width + " / 2))";
    canvas.style.top = "calc(50% - (" + canvas.style.height + " / 2))";

    // Create container and pebble objects. (4 pebbles per container)
    for(let y = 0; y < 2; y++) {
        let containerLevel = [];
        for(let x = 0; x < 6; x++) {
            containerLevel.push(createContainer(x, y));
            for(let i = 0; i < 4; i++) {
                pebbles.push(createPebble(x, y));
            }
        }
        containers.push(containerLevel);
        scores.push(0);
    }

    for(let i = -1; i < 7; i++) {
        numberXPositions.push(((i + 1) * ((containerRadius * 2) + containerXMargin)) + containerRadius);
    }
    scheduleDraw();
}

/// Recursive-safe drawing loop.
function scheduleDraw() {
    window.requestAnimationFrame(scheduleDraw); // Call this again next animation frame.
    tick++;
    draw();
    setTimeout(logic, 0);   // Do logic separately.
}

/// Calculate pebble locations.
function logic() {
    for(let y = 0; y < 2; y++)
    {
        for(let x = 0; x < 6; x++) {
            containers[y][x][PEBBLE_COUNT] = 0;
        }
    }

    for(let i = 0; i < pebbles.length; i++) {
        // Shimmy the pebbles a little bit
        pebbles[i][TARGET_X] += (Math.random() * 2 * pebbleShimmy) - pebbleShimmy;
        pebbles[i][TARGET_Y] += (Math.random() * 2 * pebbleShimmy) - pebbleShimmy;

        // Verify the pebbles are in a valid position.
        pebbles[i] = fixPebbleCoordinates(pebbles[i]);

        // Move the pebbles a little bit of the way to their target.
        pebbles[i][CURRENT_X] += (pebbles[i][TARGET_X] - pebbles[i][CURRENT_X]) / 15;
        pebbles[i][CURRENT_Y] += (pebbles[i][TARGET_Y] - pebbles[i][CURRENT_Y]) / 15;
    }
}

/// Draw frame called by animation loop.
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

/// Create a new container with logical coordinate x and y.
function createContainer(x, y) {
    let container = [];
    container[CURRENT_X] = ((x + 1) * ((containerRadius * 2) + containerXMargin)) + containerRadius;
    container[CURRENT_Y] = (y * ((containerRadius * 2) + containerYMargin)) + containerYOffset + containerRadius;
    container[PEBBLE_COUNT] = 4;
    return container;
}

/// Draw container at logical coordinates x and y.
function drawContainer(x, y) {
    let container = containers[y][x];
    let xCoord = container[CURRENT_X];
    let yCoord = container[CURRENT_Y];

    setRadialContainerGradient(xCoord, yCoord);
    ctx.beginPath();
    ctx.arc(xCoord, yCoord, containerRadius, 0, 2*Math.PI);
    ctx.fill();
}

/// Draw number above/below container or endzone. Coordinates are logical.
/// x=0 refers to left endzone, x=7 refers to right endzone.
function drawPebbleCountNumber(x, y) {

}


/// Draw end zone (either LEFT or RIGHT).
function drawEndzone(side) {
    let xCoord = getEndzoneXCoordinate(side);

    setRadialContainerGradient(xCoord, endzoneYTop);
    ctx.beginPath();
    ctx.arc(xCoord, endzoneYTop, containerRadius, Math.PI, 0);
    ctx.fill();

    setRadialContainerGradient(xCoord, endzoneYBottom);
    ctx.beginPath();
    ctx.arc(xCoord, endzoneYBottom, containerRadius, 0, Math.PI);
    ctx.fill();

    setLinearEndzoneGradient(xCoord - containerRadius, endzoneYTop);
    ctx.fillRect(xCoord - containerRadius, endzoneYTop, containerRadius * 2, endzoneYBottom - endzoneYTop);
}

/// Set the ctx to a radial gradient for containers.
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

/// Set the ctx to a linear gradient for the endzone rectangle.
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

/// Set the ctx to a radial gradient for pebbles.
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

/// Create a new pebble which will belong to the container at the provided logical coordinates.
function createPebble(containerX, containerY) {
    let newPebble = [];
    newPebble[CURRENT_X] = Math.random() * canvasWidth;
    newPebble[CURRENT_Y] = Math.random() * canvasHeight;
    newPebble[TARGET_X] = Math.random() * canvasWidth;
    newPebble[TARGET_Y] = Math.random() * canvasHeight;
    newPebble[PRIMARY_COLOR] = getRandomColor();
    newPebble[SECONDARY_COLOR] = getRandomColor();
    newPebble[CONTAINER_X] = containerX;
    newPebble[CONTAINER_Y] = containerY;
    newPebble[OWNER] = NONE;
    newPebble[FLASH_RATE] = (Math.random() * 100) + 20;
    return newPebble;
}

/// Adjust a pebble's target coordinates to be legally in bounds of their container / endzone.
function fixPebbleCoordinates(pebble)
{
    let pebbleX = pebble[TARGET_X];
    let pebbleY = pebble[TARGET_Y];

    if(pebble[OWNER] === NONE) {
        // Pebble is in one of the containers.
        let container = containers[pebble[CONTAINER_Y]][pebble[CONTAINER_X]];
        let containerX = container[CURRENT_X];
        let containerY = container[CURRENT_Y];

        pebble = returnPebbleToSphere(pebble, containerX, containerY);
    } else {
        // Pebble is in one of the endzones.
        let containerX = (pebble[OWNER] * 7 * ((containerRadius * 2) + containerXMargin)) + containerRadius;
        let containerYTop = containerYOffset + containerRadius;
        let containerYBottom = (containerRadius * 2) + containerYMargin + containerYOffset + containerRadius;

        // check if it is above or below the rectangular part of the endzone.
        if(pebbleY < containerYTop) {
            // Pebble above the rectangle, return it to the upper sphere.
            pebble = returnPebbleToSphere(pebble, containerX, containerYTop);
        } else if (pebbleY > containerYBottom) {
            // Pebble is below the rectangle, return it to the lower sphere.
            pebble = returnPebbleToSphere(pebble, containerX, containerYBottom);
        } else {
            // Pebble might be outside the rectangle, bring it back in if so.
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

/// Bounce a pebble back inside the container at the physical coordinates provided.
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

/// Get the polar distance and angle between two points.
/// Distance is [0] returned item.
/// Angle is [1] returned item.
function polarDistanceAndAngle(x1, y1, x2, y2) {
    let dX = x2 - x1;
    let dY = y2 - y1;

    let distance = Math.sqrt(dX * dX + dY * dY);
    let angle = Math.atan2(dY, dX);
    return [distance, angle];
}

/// Draw the pebble at the provided index.
function drawPebble(index) {
    let pebble = pebbles[index];

    // Calculate a "shining" alpha based on the tick.
    // Each pebble has its own flash rate.
    let alpha = (tick % (2 * pebble[FLASH_RATE])) / pebble[FLASH_RATE];
    if(alpha > 1) {
        // Alpha is now decreasing.
        alpha = 2 - alpha;
    }
    // Max-min values of alpha for the shining is 0.7 to 1.0.
    alpha = (alpha * 0.3) + 0.7;

    let primaryColors = pebble[PRIMARY_COLOR];
    let secondaryColors = pebble[SECONDARY_COLOR];

    // Apply the alpha shine to the primary colors.
    let modifiedPrimaryColors = [];
    for(let i = 0; i < 3; i++) {
        modifiedPrimaryColors[i] = (primaryColors[i] * alpha) + (secondaryColors[i] * (1 - alpha));
    }

    let x = pebble[CURRENT_X];
    let y = pebble[CURRENT_Y];

    // Create CSS color strings for the two colors.
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

/// Return a random color [r, g, b].
function getRandomColor()
{
    let r = Math.random() * 256;
    let g = Math.random() * 256;
    let b = Math.random() * 256;
    return [r, g, b];
}

/// Listen for a click event on the canvas.
canvas.addEventListener("click", function(event) {
    // Get mouse position on canvas.
    let mouseX = (event.clientX - canvas.offsetLeft) * canvasResolutionMultiplier;
    let mouseY = (event.clientY - canvas.offsetTop) * canvasResolutionMultiplier;

    // Estimate the possible container (this is accurate - reverse of settings).
    let possibleContainerX =
        Math.round(((mouseX - containerRadius) / ((containerRadius * 2) + containerXMargin)) - 1);
    let possibleContainerY =
        Math.round((mouseY - containerYOffset - containerRadius) / ((containerRadius * 2) + containerYMargin));

    if(possibleContainerY >= 0 && possibleContainerY < 2 &&
        possibleContainerX >= 0 && possibleContainerX < 6) {
        let container = containers[possibleContainerY][possibleContainerX];

        // Verify the click is within the container circle, and mark it clicked if so.
        if(polarDistanceAndAngle(mouseX, mouseY, container[CURRENT_X], container[CURRENT_Y])[0] < containerRadius) {
            containerClicked(possibleContainerX, possibleContainerY);
        }
    }
});

/// Called when a container is clicked (by player or AI). Provide the logical container coords.
function containerClicked(containerX, containerY) {
    // Gather all the pebble in the clicked container.
    let myPebbles = [];
    for(let i = 0; i < pebbles.length; i++) {
        if(pebbles[i][CONTAINER_X] === containerX &&
            pebbles[i][CONTAINER_Y] === containerY &&
            pebbles[i][OWNER] === NONE) {
            myPebbles.push(i);
        }
    }

    // Increment positions for each pebble as necessary.
    for(let i = 0; i < myPebbles.length; i++) {
        let p = pebbles[myPebbles[i]];
        if(p[CONTAINER_Y] === 0) {
            p[CONTAINER_X] -= (i + 1);
        } else {
            p[CONTAINER_X] += (i + 1);
        }
    }

    containers[containerY][containerX][PEBBLE_COUNT] = 0;

    // Previous increment didn't account for changing rows (some indexes are out of bounds).
    // Fix the bounds to the correct row.
    for(let i = 0; i < myPebbles.length; i++) {
        let p = pebbles[myPebbles[i]];
        if(p[CONTAINER_Y] === 0) {  // Currently upper row.
            if(p[CONTAINER_X] === -1) { // Goes into left zone.
                let xCoord = getEndzoneXCoordinate(LEFT);
                p[OWNER] = LEFT;
                p[TARGET_X] = xCoord + (Math.random() * (containerRadius * 2)) - containerRadius;
                p[TARGET_Y] = (endzoneYTop - containerRadius) + (Math.random() * (endzoneYBottom - endzoneYTop + (containerRadius * 2)));
                scores[LEFT]++;
            } else if (p[CONTAINER_X] < 0) {    // Goes to lower row.
                p[CONTAINER_Y] = 1;
                p[CONTAINER_X] = (-p[CONTAINER_X]) - 2;
                i--;    // Might need to go back up if too large.
            }
        } else {    // Currently lower row.
            if(p[CONTAINER_X] === 6) {  // Goes into right zone.
                let xCoord = getEndzoneXCoordinate(RIGHT);
                p[OWNER] = RIGHT;
                p[TARGET_X] = xCoord + (Math.random() * (containerRadius * 2)) - containerRadius;
                p[TARGET_Y] = (endzoneYTop - containerRadius) + (Math.random() * (endzoneYBottom - endzoneYTop + (containerRadius * 2)));
                scores[RIGHT]++;
            } else if (p[CONTAINER_X] > 6) {    // Goes to upper row.
                p[CONTAINER_Y] = 0;
                p[CONTAINER_X] = (-p[CONTAINER_X]) + 12;
                i--;    // Might need to go back down if too large.
            }
        }
    }

    for(let i = 0; i < myPebbles.length; i++) {
        let p = pebbles[myPebbles[i]];
        if(p[OWNER] === NONE) {
            containers[p[CONTAINER_Y]][p[CONTAINER_X]][PEBBLE_COUNT]++;
        }
    }
}

function getEndzoneXCoordinate(side) {
    return (side * 7 * ((containerRadius * 2) + containerXMargin)) + containerRadius;
}