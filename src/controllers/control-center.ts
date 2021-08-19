import { v4 as uuid } from "uuid";
import { Delete, Insert, OPCode, Set, Unset } from "../types/ops";
import { createSubscription, publish } from "@codewithkyle/pubsub";
import db from "@codewithkyle/jsql";

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

    public delete(table:string, key:string):Promise<Delete>{
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
            const { op, uid, table, key, value, keypath, timestamp } = operation;

            // Ignore web socket OPs if they originated from this client
            const results = await db.query("SELECT * FROM ledger WHERE uid = $uid", {
                uid: uid,
            });
            const alreadyInLedger = results.length > 0;
            if (alreadyInLedger){
                return;
            }

            // Insert OP into the ledger
            await db.query("INSERT INTO ledger VALUES ($op)", {
                op: operation,
            });
            
            // Get all past operations & select ops to be performed based on new op timestamp
            const ops = await db.query("SELECT * FROM ledger WHERE table = $table AND key = $key AND timestamp > $timestamp ORDER BY timestamp", {
                table: table,
                key: key,
                timestamp: timestamp,
            });

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
            const { op, uid, table, key, value, keypath, timestamp } = operation;

            const results = await db.query("SELECT * FROM $table WHERE uid = $uid", {
                uid: uid,
                table: table,
            });
            const existingModel = results.length > 0;

            // Skip inserts when we already have the data && skip non-insert ops when we don't have the data
            if (existingModel && op === "INSERT" || !existingModel && op !== "INSERT"){
                return;
            }

            switch (op){
                case "INSERT":
                    return db.query("INSERT INTO $table VALLUES ($value)", {
                        value: value,
                        table: table,
                    });
                case "DELETE":
                    return db.query("DELETE FROM $table WHERE uid = $uid", {
                        uid: key,
                        table: table,
                    });
                case "SET":
                    return new Promise(async (resolve, reject) => {
                        const results = await db.query("SELECT * FROM $table WHERE uid = $uid", {
                            uid: key,
                            table: table,
                        });
                        const obj = results?.[0] ?? null;
                        if (obj === null){
                            reject();
                        }
                        this.setValueFromKeypath(obj, keypath, value);
                        await db.query("UPDATE $table SET $value WHERE uid = $uid", {
                            table: table,
                            uid: key,
                            value: obj,
                        });
                        resolve();
                    });
                case "UNSET":
                    return new Promise(async (resolve, reject) => {
                        const results = await db.query("SELECT * FROM $table WHERE uid = $uid", {
                            uid: key,
                            table: table,
                        });
                        const obj = results?.[0] ?? null;
                        if (obj === null){
                            reject();
                        }
                        this.unsetValueFromKeypath(obj, keypath);
                        await db.query("UPDATE $table SET $value WHERE uid = $uid", {
                            table: table,
                            uid: key,
                            value: obj,
                        });
                        resolve();
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
