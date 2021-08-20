import { v4 as uuid } from "uuid";
import db from "@codewithkyle/jsql";
import { navigateTo } from "@codewithkyle/router";
import { Diagram } from "~types/diagram";
import cc from "~controllers/control-center";

const TYPES = ["int", "bigint", "binary", "blob", "boolean", "char", "date", "datetime", "decimal", "double", "enum", "float", "geometry", "json", "bson", "longtext", "mediumint", "mediumtext", "multipoint", "point", "smallint", "time", "text", "timestamp", "tinyint", "uuid", "varchar"];

class DiagramController {
    private diagram:Diagram;
    
    public async createDiagram(type:"local"|"cloud"){
        const uid = uuid();
        const types = {};
        TYPES.map(type => {
            types[uuid()] = type;
        });
        this.diagram:Diagram = {
            uid: uid,
            name: "UNTITLED",
            timestamp: Date.now(),
            tables: {},
            types: types,
            connections: {},
            nodes: {},
        };
        const op = cc.insert("diagrams", uid, this.diagram);
        await cc.perform(op);
        navigateTo(`/diagram/${uid}`);
    }

    public async loadDiagram(uid:string){
        // @ts-ignore
        await db.query("UPDATE diagrams SET timestamp = $timestamp WHERE uid = $uid", {
            uid: uid,
            timestamp: Date.now(),
        });
        // @ts-ignore
        const ops = await db.query("SELECT * FROM ledger WHERE diagramID = $uid", {
            uid: uid,
        });
        // @ts-ignore
        const results = await db.query("SELECT * FROM diagrams WHERE uid = $uid", {
            uid: uid,
        });
        this.diagram = results?.[0] ?? null;
        return {
            ops: ops,
            diagram: this.diagram,
        };
    }

    public async renameDiagram(uid:string, newName:string){
        const op = cc.set("diagrams", uid, "name", newName);
        cc.perform(op);
    }
}
const diagramController = new DiagramController();
export default diagramController;
