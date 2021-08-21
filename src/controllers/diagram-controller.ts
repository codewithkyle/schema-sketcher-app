import { v4 as uuid } from "uuid";
import db from "~lib/jsql";
import { navigateTo } from "@codewithkyle/router";
import { Connection, Diagram, Node, Table, Column, ColumnType } from "~types/diagram";
import cc from "~controllers/control-center";
import { publish } from "@codewithkyle/pubsub";

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
        };
        const op1 = cc.insert("diagrams", uid, this.diagram);
        await cc.perform(op1);
        for (const type of TYPES){
            await this.createType(type);
        }
        
        navigateTo(`/diagram/${uid}`);
    }

    public async loadDiagram(uid:string){
        // @ts-ignore
        await db.query("UPDATE diagrams SET timestamp = $timestamp WHERE uid = $uid", {
            uid: uid,
            timestamp: Date.now(),
        });
        // @ts-ignore
        const results = await db.query("SELECT * FROM diagrams WHERE uid = $uid", {
            uid: uid,
        });
        this.diagram = results?.[0] ?? null;
        return this.diagram;
    }

    public async renameDiagram(newName:string){
        this.diagram.name = newName;
        const op = cc.set("diagrams", this.diagram.uid, "name", newName);
        cc.perform(op);
    }
    
    public async createTable(placeX:number, placeY:number){
        const uid = uuid();
        const tableCount = await db.query("SELECT COUNT(*) FROM tables WHERE diagramID = $uid", {
            uid: this.diagram.uid,
        });
        const table:Table = {
            uid: uid,
            name: `table_${tableCount + 1}`,
            color: this.getRandomColor(),
            x: placeX,
            y: placeY,
            diagramID: this.diagram.uid,
        };
        const op = cc.insert("tables", uid, table);
        cc.perform(op, true);
        this.createColumn(uid);
    }

    public async createColumn(tableID:string){
        const columnUid = uuid();
        // @ts-ignore
        const types = await db.query("SELECT * FROM types WHERE diagramID = $uid ORDER BY name DESC", {
            uid: this.diagram.uid,
        });
        const existingColumns = await db.query("SELECT * FROM columns WHERE diagramID = $diagramID AND tableID = $tableID", {
            diagramID: this.diagram.uid,
            tableID: tableID,
        });
        const column:Column = {
            name: existingColumns.length ? `column_${existingColumns.length}` : "id",
            type: types[0].uid,
            isNullable: false,
            isUnique: false,
            isIndex: false,
            isPrimaryKey: existingColumns.length ? false : true,
            weight: existingColumns.length,
            uid: columnUid,
            tableID: tableID,
            diagramID: this.diagram.uid,
        };
        const op = cc.insert("columns", columnUid, column);
        cc.perform(op, true);
    }
    
    public async createNode(placeX:number, placeY:number){
        const uid = uuid();
        const node:Node = {
            uid: uid,
            text: "New node",
            x: placeX,
            y: placeY,
            color: "grey",
            icon: "function",
            diagramID: this.diagram.uid,
        };
        const op = cc.insert("nodes", uid, node);
        cc.perform(op, true);
    }

    public createConnection(startNodeID:string, endNodeID:string, refs:Array<string>){
        const uid = uuid();
        const connection:Connection = {
            uid: uid,
            startNodeID: startNodeID,
            endNodeID: endNodeID,
            type: "one-one",
            refs: refs,
            diagramID: this.diagram.uid,
        };
        const op = cc.insert("connections", uid, connection);
        cc.perform(op, true);
    }

    // @ts-expect-error
    public async getConnections():Array<Connection>{
        return await db.query("SELECT * FROM connections WHERE diagramID = $uid", {
            uid: this.diagram.uid,
        });
    }

    // @ts-expect-error
    public async getTypes():Array<ColumnType>{
        return await db.query("SELECT * FROM types WHERE diagramID = $uid ORDER BY name DESC", {
            uid: this.diagram.uid,
        });
    }

    public async deleteType(uid:string){
        const op = cc.delete("types", uid);
        cc.perform(op);
    }

    public async createType(value = ""){
        const uid = uuid();
        const type:ColumnType = {
            name: value,
            uid: uid,
            diagramID: this.diagram.uid,
        };
        const op = cc.insert("types", uid, type);
        cc.perform(op);
    }

    // @ts-expect-error
    public async getTables():Array<Table>{
        return await db.query("SELECT * FROM tables WHERE diagramID = $uid", {
            uid: this.diagram.uid,
        });
    }

    // @ts-expect-error
    public async getNodes():Array<Node>{
        return await db.query("SELECT * FROM nodes WHERE diagramID = $uid", {
            uid: this.diagram.uid,
        });
    }

    public async deleteTable(tableID:string){
        const connections = await db.query("SELECT * FROM connections WHERE diagramID = $diagramID AND refs INCLUDES $id", {
            id: tableID,
            diagramID: this.diagram.uid,
        });
        for (const connection of connections){
            const op = cc.delete("connections", connection.uid);
            cc.perform(op);
        }
        const op = cc.delete("tables", tableID);
        cc.perform(op);
        publish("canvas", {
            type: "reload",
        });
    }

    public async deleteNode(nodeID:string){
        const connections = await db.query("SELECT * FROM connections WHERE diagramID = $diagramID AND refs INCLUDES $id", {
            id: nodeID,
            diagramID: this.diagram.uid,
        });
        for (const connection of connections){
            const op = cc.delete("connections", connection.uid);
            cc.perform(op);
        }
        const op = cc.delete("nodes", nodeID);
        cc.perform(op);
        publish("canvas", {
            type: "reload",
        });
    }
}
const diagramController = new DiagramController();
export default diagramController;
