import cc from "~controllers/control-center";

let socket;
let connected = false;

function reconnect(){
    return;
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
        disconnect();
    });
    socket.addEventListener("open", () => {
        connected = true;
        cc.sync();
    });
}
reconnect();

function disconnect(){
    if (connected){
        console.warn("Network connection has been lost.");
        connected = false;
    }
    setTimeout(() => {
        reconnect();
    }, 5000);
}
export { connected, disconnect };
