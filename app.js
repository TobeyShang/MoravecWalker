
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.static("public"));

let worldState = {
    distance: 0,       
    lastFoot: null,     
    lastStepTime: 0,    
    leftEnergy: 0,      
    rightEnergy: 0,
    
    leftPlayer: null,
    rightPlayer: null
};

const MIN_STEP_INTERVAL = 150; 

io.on("connection", (socket) => {
    console.log("New connection: " + socket.id);

    let role = "full"; 

    if (!worldState.leftPlayer) {
        worldState.leftPlayer = socket.id;
        role = "left";
    } else if (!worldState.rightPlayer) {
        worldState.rightPlayer = socket.id;
        role = "right";
    }

    socket.emit("assignRole", role);

    if (role === "full") {
        console.log("Room full, rejecting: " + socket.id);
        return; 
    }

    socket.on("step", () => {
        let currentFoot = "";
        
        if (socket.id === worldState.leftPlayer) {
            currentFoot = "left";
            worldState.leftEnergy = 100; 
        } else if (socket.id === worldState.rightPlayer) {
            currentFoot = "right";
            worldState.rightEnergy = 100;
        } else {
            return; 
        }

        let now = Date.now();
        let timeDiff = now - worldState.lastStepTime;

        if (timeDiff > MIN_STEP_INTERVAL) {
            if (currentFoot !== worldState.lastFoot) {
                worldState.distance += 1;
                worldState.lastFoot = currentFoot;
                worldState.lastStepTime = now;
            } 
        } 
    });

    socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.id);
        if (socket.id === worldState.leftPlayer) {
            worldState.leftPlayer = null; 
        }
        if (socket.id === worldState.rightPlayer) {
            worldState.rightPlayer = null; 
        }
    });
});

setInterval(() => {
    worldState.leftEnergy *= 0.85; 
    worldState.rightEnergy *= 0.85;
    io.emit("stateUpdate", worldState);
}, 50);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});