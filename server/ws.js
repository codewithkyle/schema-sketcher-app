const WebSocket = require('ws');

function noop() {}

class WSS {
    constructor(){
        this.wss = new WebSocket.Server({ noServer: true, });
        this.clients = [];

        this.wss.on('connection', (ws) => {
            console.log("WS connected");
            ws.isAlive = true;
            ws.on('pong', this.heartbeat.bind(ws));
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

        setInterval(this.ping.bind(this), 30000);
    }

    ping() {
        for (let i = this.clients.length - 1; i >= 0; i--){
            const ws = this.clients[i];
            if (ws.isAlive === false) {
                ws.terminate();
                this.clients.splice(i, 1);
            }
            ws.isAlive = false;
            ws.ping(noop);
        }
    }

    heartbeat() {
        this.isAlive = true;
    }

    broadcast(op){
        this.clients.map(ws => {
            ws.send(JSON.stringify(op));
        });
    }

    upgrade(request, socket, head) {
        this.wss.handleUpgrade(request, socket, head, (ws) => {
            console.log("WS upgrade");
        });
    }
}
module.exports = new WSS();
