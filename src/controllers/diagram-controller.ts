import { v4 as uuid } from "uuid";
import db from "@codewithkyle/jsql";
import { navigateTo } from "@codewithkyle/router";
import { Diagram } from "~types/diagram";

const TYPES = ["int", "bigint", "binary", "blob", "boolean", "char", "date", "datetime", "decimal", "double", "enum", "float", "geometry", "json", "bson", "longtext", "mediumint", "mediumtext", "multipoint", "point", "smallint", "time", "text", "timestamp", "tinyint", "uuid", "varchar"];

class DiagramController {
    public async createDiagram(type:"local"|"cloud"){
        const uid = uuid();
        const types = {};
        TYPES.map(type => {
            types[uuid()] = type;
        });
        const diagram:Diagram = {
            uid: uid,
            name: "UNTITLED",
            timestamp: Date.now(),
            tables: {},
            types: types,
            connections: {},
        };
        // @ts-ignore
        await db.query("INSERT INTO diagrams VALUES ($diagram)", {
            diagram: diagram,
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
            diagram: diagram?.[0] ?? null,
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