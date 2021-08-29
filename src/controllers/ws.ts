import cc from "~controllers/control-center";

let socket;
let connected = false;
declare var io;

async function connect(){
    if (typeof io === "undefined") {
        // @ts-ignore
        await import("/static/socket.js");
        console.log(io);
    }
    if (connected){
        return;
    }
    socket = io("wss://schemasketcher.com", {
        forceNew: true,
        reconnection: false,
    });
    socket.on('message', (event) => {
        try {
            const op = JSON.parse(event.data);
            cc.perform(op, true);
        } catch (e) {
            console.error(e, event);
        }
    });
    socket.on("disconnect", () => {
        console.log("WS disconnected");
        disconnect(true);
    });
    socket.on("connect", () => {
        console.log("WS connected");
        connected = true;
    });
    socket.on("connect_error", (error) => {
        console.error(error);
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
