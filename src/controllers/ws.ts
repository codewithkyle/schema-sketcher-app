import cc from "~controllers/control-center";
import diagramController from "./diagram-controller";
import db from "~lib/jsql";

let socket;
let connected = false;
declare var io;

function connect():Promise<void>{
    return new Promise(async (resolve, reject) => {
        if (typeof io === "undefined") {
            // @ts-ignore
            await import("/static/socket.js");
        }
        if (connected){
            return;
        }
        socket = io(location.origin, {
            forceNew: true,
            reconnection: false,
        });
        socket.on('on', (op) => {
            cc.perform(op, true);
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
        socket.on("room-created", async (data) => {
            const { room } = data;
            await diagramController.sendOPcodesToSession();
            // TODO: provide room ID to UI
        });
        socket.on("room-joined", async (data) => {
            const { room, diagramID } = data;
            await db.ingest(`${location.origin}/session/${room}`, "ledger");
            if (diagram){
                navigateTo(`/collaborate/${diagramID}`);
            }
            else {
                navigateTo("/");
            }
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
