import cc from "~controllers/control-center";

let socket;
let connected = false;

function connect(){
    if (connected){
        return;
    }
    socket = new WebSocket('wss://schemasketcher.com');
    socket.addEventListener('message', (event) => {
        try {
            const op = JSON.parse(event.data);
            cc.perform(op, true);
        } catch (e) {
            console.error(e, event);
        }
    });
    socket.addEventListener("close", () => {
        disconnect(true);
    });
    socket.addEventListener("open", () => {
        console.log("WS Connected");
        connected = true;
    });
}

function disconnect(reconnect = false){
    if (!reconnect){
        return;
    }
    if (connected){
        console.warn("Network connection has been lost.");
        connected = false;
    }
    setTimeout(() => {
        reconnect();
    }, 5000);
}

function send(message){
    if (connected){
        socket.send(JSON.stringify(message));
    }
}
export { connected, disconnect, connect, send };
