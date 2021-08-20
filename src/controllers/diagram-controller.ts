import { v4 as uuid } from "uuid";
import db from "@codewithkyle/jsql";
import { navigateTo } from "@codewithkyle/router";
import { Diagram } from "~types/diagram";
import cc from "~controllers/control-center";

const TYPES = ["int", "bigint", "binary", "blob", "boolean", "char", "date", "datetime", "decimal", "double", "enum", "float", "geometry", "json", "bson", "longtext", "mediumint", "mediumtext", "multipoint", "point", "smallint", "time", "text", "timestamp", "tinyint", "uuid", "varchar"];
const COLORS = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "light-blue", "indigo", "violet", "purple", "pink", "rose"];
const SHADES = ["200", "300", "400", "500", "600"];

class DiagramController {
    private diagram:Diagram;
    
    private getRandomColor():string{
        const color = this.getRandomInt(0, COLORS.length - 1);
        const shade = this.getRandomInt(0, SHADES.length - 1);
        return `var(--${COLORS[color]}-${SHADES[shade]})`;
    }

    private getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    public async createDiagram(type:"local"|"cloud"){
        const uid = uuid();
        const types = {};
        TYPES.map(type => {
            types[uuid()] = type;
        });
        this.diagram = {
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

    public async renameDiagram(newName:string){
        this.diagram.name = newName;
        const op = cc.set("diagrams", this.diagram.uid, "name", newName);
        cc.perform(op);
    }
    
    public async createTable(uid:string){
        const tableCount = Object.keys(this.diagram.tables).length + 1;
        const columnUid = uuid();
        // @ts-ignore
        const types = await db.query("SELECT UNIQUE types FROM diagrams WHERE uid = $uid LIMIT 1", {
            uid: this.diagram.uid,
        });
        const diagram:Diagram = {
            uid: uid,
            name: `table_${tableCount}`,
            color: this.getRandomColor(),
            x: this.placeX,
            y: this.placeY,
            columns: {
                [columnUid]: {
                    name: "id",
                    type: Object.keys(types[0].types)[0],
                    isNullable: false,
                    isUnique: false,
                    isIndex: false,
                    isPrimaryKey: true,
                    order: 0,
                    uid: columnUid,
                },
            },
        };
        this.diagram.tables[uid] = diagram;
        op = cc.set("diagrams", this.model.diagram.uid, ["tables", uid], diagram);
        cc.perform(op);
        return diagram
    }
    
    public async createNode(uid:string){
        const node = {
            uid: uid,
            text: "New node",
            x: this.placeX,
            y: this.placeY,
            color: "grey",
            icon: "function",
        };
        this.diagram.nodes[uid] = node;
        op = cc.set("diagrams", this.model.diagram.uid, ["nodes", uid], node);
        cc.perform(op);
        return node;
    }
}
const diagramController = new DiagramController();
export default diagramController;
