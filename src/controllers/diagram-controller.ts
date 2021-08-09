import { v4 as uuid } from "uuid";
import db from "@codewithkyle/jsql";
import { navigateTo } from "@codewithkyle/router";

class DiagramController {
    public async createDiagram(type:"local"|"cloud"){
        const uid = uuid();
        // @ts-ignore
        await db.query("INSERT INTO diagrams VALUES ($diagram)", {
            diagram: {
                uid: uid,
                name: "UNTITLED",
                timestamp: Date.now(),
                tables: {},
                type: {},
                connections: {},
            },
        });
        navigateTo(`/diagram/${uid}`);
    }

    public async loadDiagram(uid:string){
        // @ts-ignore
        await db.query("UPDATE diagrams SET timestamp = $timestamp WHERE uid = $uid", {
            uid: uid,
            timestamp: Date.now(),
        });
        // @ts-ignore
        const ops = await db.query("SELECT * FROM oplog WHERE diagramID = $uid", {
            uid: uid,
        });
        // @ts-ignore
        const diagram = await db.query("SELECT * FROM diagrams WHERE uid = $uid", {
            uid: uid,
        });
        return {
            ops: ops,
            diagram: diagram[0],
        };
    }

    public async renameDiagram(uid:string, newName:string){
        // @ts-ignore
        await db.query("UPDATE diagrams SET name = $name WHERE uid = $uid", {
            uid: uid,
            name: newName,
        });
    }
}
const diagramController = new DiagramController();
export default diagramController;