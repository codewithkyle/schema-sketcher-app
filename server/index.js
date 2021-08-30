const express = require('express');
const app = express();
const path = require("path");
const fs = require("fs");
const { createServer } = require('https');
const Socket = require("./sockets");

const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/privkey.pem')
};
const server = createServer(options, app);
const { Server } = require("socket.io");
const io = new Server(server);
const publicDir = path.resolve(__dirname, "../public");

// Prep logging file
const log = path.join(__dirname, "404.log");
if (!fs.existsSync(log)){
    fs.writeFileSync(log, "");
}

// Prep collab sessions directory
const collabDir = path.join(__dirname, "sessions");
if (!fs.existsSync(collabDir)){
    fs.mkdirSync(collabDir);
}

// Prep cloud saving directory
const cloudDir = path.join(__dirname, "diagrams");
if (!fs.existsSync(cloudDir)){
    fs.mkdirSync(cloudDir);
}

// API
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
});

app.get("/session/:roomID", async (req, res) => {
    const { roomID } = req.params;
    const filePath = path.join(collabDir, roomID);
    if (fs.existsSync(filePath)){
        res.status(200).sendFile(filePath);
    }
    else {
        res.status(404).send("Invalid session ID.");   
    }
});

// 404 - keep at bottom
app.get('*', (req, res) => {
    const filePath = path.join(publicDir, req.path);
    if (fs.existsSync(filePath)){
        res.sendFile(filePath);
    } else {
        fs.writeFileSync(log, `[404] ${filePath}\n`, {flag: "a"});
        res.status(404).sendFile(path.join(publicDir, "404.html"));
    }
});

// Web Sockets
io.on('connection', (socket) => {
    new Socket(socket);
});

io.engine.on("connection_error", (err) => {
    console.log(err.req);
    console.log(err.code);
    console.log(err.message);
    console.log(err.context);
});

app.listen(8080);
server.listen(443);
