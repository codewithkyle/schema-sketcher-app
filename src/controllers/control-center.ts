import { v4 as uuid } from "uuid";
import { Delete, Insert, OPCode, Set, Unset } from "../types/ops";
import { createSubscription, publish } from "@codewithkyle/pubsub";

class ControlCenter {
    private syncing: boolean;

    constructor(){
        this.syncing = false;
        createSubscription("sync");
        this.flushOutbox();
    }

    private async flushOutbox(){
        // TODO: get pendings messages from outbox table
        const messages:Array<any> = [];
        const successes = [];
        if (messages.length){
            for (const message of messages){
                const success = await this.disbatch(message.opcode, true);
                if (success){
                    successes.push(message.uid);
                }
            }
        }
        for (const uid of successes){
            // TODO: delete successful messages from outbox table
        }
        setTimeout(this.flushOutbox.bind(this), 30000);
    }

    private async hardSync(incomingETag){
        // TODO: hard sync with cloud
    }

    private async softSync(id, incomingETag){
        // TODO: soft sync with cloud
    }

    public async sync(){
        if (this.syncing){
            return;
        }
        this.syncing = true;
        try {
            // TODO: figure out if we need to sync with a cloud diagram
        } catch (e) {
            console.error(e);
        }
        this.syncing = false;
    }

    private async runHistory(){
        // TODO: run though history
    }

    public insert(table:string, key:string, value:any):Insert{
        return {
            uid: uuid(),
            op: "INSERT",
            table: table,
            key: key,
            value: value,
            timestamp: new Date().getTime(),
        };
    }

    public async delete(table:string, key:string):Promise<Delete>{
        return {
            uid: uuid(),
            op: "DELETE",
            table: table,
            key: key,
            timestamp: new Date().getTime(),
        };
    }

    public set(table:string, key:string, keypath:string, value:any):Set{
        return {
            uid: uuid(),
            op: "SET",
            table: table,
            key: key,
            keypath: keypath,
            value: value,
            timestamp: new Date().getTime(),
        };
    }

    public unset(table:string, key:string, keypath:string):Unset{
        return {
            uid: uuid(),
            op: "UNSET",
            table: table,
            key: key,
            keypath: keypath,
            timestamp: new Date().getTime(),
        };
    }

    public async disbatch(op:OPCode, bypassOutbox = false){
        let success = true;
        try{
            // TODO: dispatch opcode to server via websocket
        } catch (e) {
            success = false;
            console.error(e);
            if (!bypassOutbox){
                // TODO: insert failures into outbox table
            }
            disconnect();
        }
        return success;
    }

    public async perform(operation:OPCode, disbatchToUI = false){
        try {
            // @ts-ignore
            const { op, id, table, key, value, keypath, timestamp, etag } = operation;

            // Ignore web socket OPs if they originated from this client
            const alreadyInLedger = false;
            // TODO: try to get op from oplog table
            
            if (alreadyInLedger){
                return;
            }

            // TODO: Insert OP into the ledger
            
            // TODO: Get all past operations & select ops to be performed based on new op timestamp
            const ops = [];

            // Perform ops
            for (const op of ops){
                await this.op(op);
                if (disbatchToUI){
                    publish("sync", op);
                }
            }
        } catch (e) {
            console.error(e);
        }
    }

    public setValueFromKeypath(object, keypath, value){
        const key = keypath[0];
        keypath.splice(0, 1);
        if (keypath.length){
            this.setValueFromKeypath(object[key], keypath, value);
        } else {
            object[key] = value;
        }
    }
    
    public unsetValueFromKeypath(object, keypath){
        const key = keypath[0];
        keypath.splice(0, 1);
        if (keypath.length){
            this.unsetValueFromKeypath(object[key], keypath);
        } else {
            delete object[key];
        }
    }

    private async op(operation):Promise<any>{
        try {
            // @ts-ignore
            const { op, id, table, key, value, keypath, timestamp } = operation;

            // TODO: try to get op from oplog table
            const existingModel = false;

            // Skip inserts when we already have the data && skip non-insert ops when we don't have the data
            if (existingModel && op === "INSERT" || !existingModel && op !== "INSERT"){
                return;
            }

            switch (op){
                case "INSERT":
                    return new Promise((resolve, reject) => {
                        // TODO: perform insert
                    });
                case "DELETE":
                    return new Promise((resolve, reject) => {
                        // TODO: perform delete
                    });
                case "SET":
                    return new Promise((resolve, reject) => {
                        // TODO: perform set
                    });
                case "UNSET":
                    return new Promise((resolve, reject) => {
                        // TODO: perform unset
                    });
                default:
                    console.error(`Unknown OP: ${op}`);
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    }
}
const cc = new ControlCenter();
export default cc;
