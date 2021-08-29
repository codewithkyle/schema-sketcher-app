const express = require('express');
const app = express();
const cwd = process.cwd();
const path = require("path");
const server = createServer(options, app);
const { Server } = require("socket.io");
const io = new Server(server);
const fs = require("fs");
const { createServer } = require('https');
const { addSocket } = require("./sockets");

const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/privkey.pem')
};

const log = path.join(__dirname, "404.log");
if (!fs.existsSync(log)){
    fs.writeFileSync(log, "");
}

const publicDir = path.resolve(__dirname, "../public");

app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
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

io.on('connection', (socket) => {
    addSocket(socket); 
});

app.listen(8080);
server.listen(443);
