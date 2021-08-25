const WebSocket = require('ws');
const { createServer } = require("https");
const fs = require("fs");
const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/privkey.pem')
};
const server = createServer(options);
const wss = new WebSocket.Server({ server });

const clients = [];

function heartbeat() {
    this.isAlive = true;
}
function noop() {}

setInterval(function ping() {
    for (let i = clients.length - 1; i >= 0; i--){
        const ws = clients[i];
        if (ws.isAlive === false) {
            ws.terminate();
            clients.splice(i, 1);
        }
        ws.isAlive = false;
        ws.ping(noop);
    }
}, 30000);

wss.on('connection', (ws) => {
    ws.isAlive = true;
    ws.on('pong', heartbeat.bind(ws));
    ws.on("message", (event) => {
        switch (event){
            case "ping":
                ws.send("pong");
                break;
            default:
                break;
        }
    });
    clients.push(ws);
});

function broadcast(op){
    clients.map(ws => {
        ws.send(JSON.stringify(op));
    });
}
server.listen(5004, "3.22.114.84");
module.exports = { broadcast };
