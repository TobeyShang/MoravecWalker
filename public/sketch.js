
let socket;
let myRole = "Connecting...";
let currentState = null;

const MATRIX_GREEN = [0, 255, 65];
const BODY_SCALE = 1.2;

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    textFont('Courier New');
    textStyle(BOLD);
    
    socket = io();

    socket.on("assignRole", (role) => {
        myRole = role;
    });

    socket.on("stateUpdate", (state) => {
        currentState = state;
    });
}

function draw() {
    background(0, 30);

    if (!currentState) {
        return;
    }
    if (myRole === "full") {
        fill(255, 0, 0); 
        textSize(30);
        text("ACCESS DENIED", width/2, height/2 - 20);
        textSize(14);
        text("SYSTEM FULL: 2/2 CONNECTED", width/2, height/2 + 20);
        return; 
    }


    push();
    translate(width / 2, height / 2);
    scale(BODY_SCALE);

    fill(MATRIX_GREEN);
    noStroke();

    drawHead(0, -120);
    drawTorso(0, -40);
    drawArms(0, -60);

    drawLeg(-30, 60, currentState.leftEnergy);
    drawLeg(30, 60, currentState.rightEnergy);

    pop();

    drawUI();
}


function drawHead(x, y) {
    let size = 50;
    for(let r = 0; r < size; r += 10) {
        let steps = max(1, r * 0.8);
        for(let i = 0; i < steps; i++) {
            let angle = map(i, 0, steps, 0, TWO_PI);
            text("0", x + cos(angle)*r, y + sin(angle)*r);
        }
    }
}

function drawTorso(x, y) {
    let w = 40, h = 100;
    for(let i = x - w/2; i <= x + w/2; i += 10) {
        for(let j = y - h/2; j <= y + h/2; j += 12) {
            text("0", i, j);
        }
    }
}

function drawArms(x, y) {
    let armLen = 90, offset = 45;
    for(let j = 0; j < armLen; j += 10) {
        text("0", x - offset, y + j);
        text("0", x + offset, y + j);
    }
}

function drawLeg(x, basePos, energy) {
    push();
    let jumpY = map(energy, 0, 100, 0, -50); 
    let scaleFactor = map(energy, 0, 100, 1, 1.3);
    
    translate(x, basePos + jumpY);
    scale(scaleFactor);

    if (energy > 50) fill(220, 255, 220); 
    else fill(MATRIX_GREEN);

    let w = 20, h = 90;
    for(let i = -w/2; i <= w/2; i += 10) {
        for(let j = 0; j <= h; j += 12) {
            text("0", i, j);
        }
    }
    pop();
}

function drawUI() {
    fill(MATRIX_GREEN);
    noStroke();
    
    textSize(60);
    text(currentState.distance, width/2, 80); 
    
    textSize(16);
    text("METERS", width/2, 120);

    textSize(20);
    let roleText = "";
    
    if (myRole === "left") {
        roleText = "LEFT LEG";
    } else if (myRole === "right") {
        roleText = "RIGHT LEG";
    }
    
    let alpha = map(sin(frameCount * 0.1), -1, 1, 100, 255);
    fill(0, 255, 65, alpha);
    
    text(roleText, width/2, height - 50);
}

function mousePressed() {
    if (myRole === "left" || myRole === "right") {
        socket.emit("step");
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}