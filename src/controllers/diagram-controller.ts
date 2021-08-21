import { v4 as uuid } from "uuid";
import db from "@codewithkyle/jsql";
import { navigateTo } from "@codewithkyle/router";
import { Connection, Diagram, Node, Table } from "~types/diagram";
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
    
    public async createTable(uid:string, placeX:number, placeY:number){
        const tableCount = Object.keys(this.diagram.tables).length + 1;
        const columnUid = uuid();
        // @ts-ignore
        const types = await db.query("SELECT types FROM diagrams WHERE uid = $uid LIMIT 1", {
            uid: this.diagram.uid,
        });
        const diagram:Table = {
            uid: uid,
            name: `table_${tableCount}`,
            color: this.getRandomColor(),
            x: placeX,
            y: placeY,
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
        const op = cc.set("diagrams", this.diagram.uid, ["tables", uid], diagram);
        cc.perform(op);
        return diagram
    }
    
    public async createNode(uid:string, placeX:number, placeY:number){
        const node:Node = {
            uid: uid,
            text: "New node",
            x: placeX,
            y: placeY,
            color: "grey",
            icon: "function",
        };
        this.diagram.nodes[uid] = node;
        const op = cc.set("diagrams", this.diagram.uid, ["nodes", uid], node);
        cc.perform(op);
        return node;
    }

    public createConnection(startNodeID:string, endNodeID:string, refs:Array<string>):Connection{
        const uid = uuid();
        const connection:Connection = {
            uid: uid,
            startNodeID: startNodeID,
            endNodeID: endNodeID,
            type: "one-one",
            refs: refs,
        };
        this.diagram.connections[uid] = connection;
        const op = cc.set("diagrams", this.diagram.uid, ["connections", uid], connection);
        cc.perform(op);
        return connection;
    }

    public getConnections():Array<Connection>{
        const connections = [];
        for (const key in this.diagram.connections){
            connections.push(this.diagram.connections[key]);
        }
        return connections;
    }
}
const diagramController = new DiagramController();
export default diagramController;
