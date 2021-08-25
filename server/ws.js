const WebSocket = require('ws');
const { createServer } = require("https");
const fs = require("fs");
const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/schemasketcher.com/privkey.pem')
};

function noop() {}

class WSS {
    constructor(){
        const server = createServer(options);
        this.wss = new WebSocket.Server({ server });
        server.listen(8081, "0.0.0.0");
        this.clients = [];

        setInterval(function ping() {
            for (let i = this.clients.length - 1; i >= 0; i--){
                const ws = this.clients[i];
                if (ws.isAlive === false) {
                    ws.terminate();
                    this.clients.splice(i, 1);
                }
                ws.isAlive = false;
                ws.ping(noop);
            }
        }, 30000);

        this.wss.on('connection', (ws) => {
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
            this.clients.push(ws);
        });
    }

    heartbeat() {
        this.isAlive = true;
    }

    broadcast(op){
        this.clients.map(ws => {
            ws.send(JSON.stringify(op));
        });
    }
}
const wss = new WSS();
module.exports = wss;

