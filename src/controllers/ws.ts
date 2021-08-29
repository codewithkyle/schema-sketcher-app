import cc from "~controllers/control-center";

let socket;
let connected = false;
declare var io;

function connect():Promise<void>{
    return new Promise(async (resolve, reject) => {
        if (typeof io === "undefined") {
            // @ts-ignore
            await import("/static/socket.js");
            console.log(io);
        }
        if (connected){
            return;
        }
        socket = io(location.origin, {
            forceNew: true,
            reconnection: false,
        });
        socket.on('message', (data) => {
            console.log(data);
            // try {
            //     const op = JSON.parse(event.data);
            //     cc.perform(op, true);
            // } catch (e) {
            //     console.error(e, event);
            // }
        });
        socket.on("disconnect", () => {
            disconnect(true);
            reject();
        });
        socket.on("connect", () => {
            connected = true;
            resolve();
        });
        socket.on("connect_error", (error) => {
            console.error(error);
            reject();
        });
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

function send(type, data){
    if (connected){
        socket.emit(type, data);
    }
}
export { connected, disconnect, connect, send };
