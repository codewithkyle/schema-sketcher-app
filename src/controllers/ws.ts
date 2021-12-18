import cc from "~controllers/control-center";
import diagramController from "./diagram-controller";
import db from "~lib/jsql";
import { navigateTo } from "@codewithkyle/router";
import { publish } from "~lib/pubsub";
import cursorController from "~controllers/cursor-controller";
import session from "~controllers/session-controller";

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
        socket.on('op', (op) => {
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
            session.set(room, diagram, requirePassword);
            prompt("Collaboration URL", session.getURL());
        });
        socket.on("room-joined", async (data) => {
            const { room, diagram, requirePassword } = data;
            session.set(room, diagram, requirePassword);
            suspendOPs = true;
            await db.ingest(`${location.origin}/session/${room}`, "ledger");
            const results = await db.query("SELECT * FROM ledger WHERE diagramID = $uid ORDER BY timestamp", {
                uid: diagram,
            });
            for (const op of results){
                await cc.op(op);
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
        socket.on("move", (data) => {
            publish("move", data);
        });
        socket.on("user-connected", (data) => {
            cursorController.addCursor({
                name: data.name,
                x: 0,
                y: 0,
                uid: data.uid,
            });
            // TODO: notify user that someone connected
        });
        socket.on("user-disconnect", (data) => {
            cursorController.removeCursor(data.uid);
            // TODO: notify user that someone disconnected
        });
        socket.on("mouse-move", (data) => {
            cursorController.moveCursor(data);
        });
        socket.on("close-room", () => {
            navigateTo("/");
            // TODO: notify user the room was closed
        });
    });
}

function disconnect(reconnect = false){
    if (connected){
        socket.disconnect();
        connected = false;
    }
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
