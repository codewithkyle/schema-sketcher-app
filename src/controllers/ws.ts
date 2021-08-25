import cc from "~controllers/control-center";

let socket;
let connected = false;

function connect(){
    socket = new WebSocket('ws://3.22.114.84:5004');
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
        connected = true;
        cc.sync();
    });
}
reconnect();

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
