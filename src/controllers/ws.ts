import cc from "~controllers/control-center";
import diagramController from "./diagram-controller";
import db from "~lib/jsql";
import { navigateTo } from "@codewithkyle/router";

let socket;
let connected = false;
declare var io;
let suspendOPs = false;
let opsQueue = [];

function connect():Promise<void>{
    return new Promise(async (resolve, reject) => {
        if (typeof io === "undefined") {
            // @ts-ignore
            await import("/static/socket.js");
        }
        if (connected){
            resolve();
        }
        socket = io(location.origin, {
            forceNew: true,
            reconnection: false,
        });
        socket.on('on', (op) => {
            if (suspendOPs){
                opsQueue.push(op);
            }
            else {
                cc.perform(op, true);
            }
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
            const { room, diagram, requirePassword } = data;
            await diagramController.sendOPcodesToSession();
            prompt("Collaboration URL", `${location.origin}/session/${diagram}/${room}${requirePassword ? "?auth=pwd" : ""}`);
        });
        socket.on("room-joined", async (data) => {
            const { room, diagram } = data;
            suspendOPs = true;
            await db.ingest(`${location.origin}/session/${room}`, "ledger");
            const results = await db.query("SELECT * FROM ledger WHERE diagramID = $uid ORDER BY timestamp", {
                uid: diagram,
            });
            console.log(results);
            const ops = [];
            for (const op of results){
                await cc.perform(op);
            }
            suspendOPs = false;
            for (const op of opsQueue){
                await cc.perform(op);
            }
            await diagramController.loadDiagram(diagram);
            navigateTo(`/diagram/${diagram}`);
        });
        socket.on("room-error", (data) => {
            console.error(data.error);
            navigateTo("/");
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
