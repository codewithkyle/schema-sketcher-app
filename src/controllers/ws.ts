import cc from "~controllers/control-center";

let socket;
let connected = false;
let io = null;

async function connect(){
    if (!io) {
        // @ts-ignore
        const module = await import("/static/socket.js");
        io = module.default;
        console.log(io);
    }
    if (connected){
        return;
    }
    socket = io();
    socket.on('message', (event) => {
        try {
            const op = JSON.parse(event.data);
            cc.perform(op, true);
        } catch (e) {
            console.error(e, event);
        }
    });
    socket.on("disconnect", () => {
        disconnect(true);
    });
    socket.on("connect", () => {
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
    setTimeout(async () => {
        await connect();
    }, 5000);
}

function send(message){
    if (connected){
        socket.emit("message", JSON.stringify(message));
    }
}
export { connected, disconnect, connect, send };
