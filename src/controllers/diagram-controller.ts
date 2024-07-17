import { UUID } from "@codewithkyle/uuid";
import { Connection, Diagram, Node, Table, Column, ColumnType } from "~types/diagram";
import { publish } from "@codewithkyle/pubsub";

const TYPES = ["int", "bigint", "binary", "blob", "boolean", "char", "date", "datetime", "decimal", "double", "enum", "float", "geometry", "json", "bson", "longtext", "mediumint", "mediumtext", "multipoint", "point", "smallint", "time", "text", "timestamp", "tinyint", "uuid", "varchar"];
const COLORS = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "light-blue", "indigo", "violet", "purple", "pink", "rose"];
const SHADES = ["200", "300", "400", "500", "600"];

class DiagramController {
    private diagram:Diagram;
    private movingColumnUID:string;
    public ID:string;

    constructor(){
        this.movingColumnUID = null;
        this.ID = null;
    }
    
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
    
    public createDiagram():Diagram{
        const uid = UUID();
        this.ID = uid;
        const types = {};
        TYPES.map(type => {
            types[UUID()] = type;
        });
        this.diagram = {
            uid: uid,
            name: "UNTITLED",
            timestamp: Date.now(),
        };
        return this.diagram;
    }

    public async createTable(placeX:number, placeY:number){
        const uid = UUID();
        const table:Table = {
            uid: uid,
            name: `table_${1 + 1}`,
            color: this.getRandomColor(),
            x: placeX,
            y: placeY,
            diagramID: this.diagram.uid,
        };
        this.createColumn(uid);
    }

    public async createColumn(tableID:string){
        const columnUid = UUID();
        const column:Column = {
            name: "id",
            type: "",
            isNullable: false,
            isUnique: false,
            isIndex: false,
            isPrimaryKey: true,
            weight: 0,
            uid: columnUid,
            tableID: tableID,
            diagramID: this.diagram.uid,
        };
    }
    
    public async createNode(placeX:number, placeY:number){
        const uid = UUID();
        const node:Node = {
            uid: uid,
            text: "New node",
            x: placeX,
            y: placeY,
            color: "grey",
            icon: "function",
            diagramID: this.diagram.uid,
        };
    }

    public createConnection(startNodeID:string, endNodeID:string, refs:Array<string>){
        const uid = UUID();
        const connection:Connection = {
            uid: uid,
            startNodeID: startNodeID,
            endNodeID: endNodeID,
            type: "one-one",
            refs: refs,
            diagramID: this.diagram.uid,
        };
    }

    public getConnections():Array<Connection>{
        return [];
    }

    public getTypes():Array<ColumnType>{
        return [];
    }

    public deleteType(uid:string){
    }

    public createType(value = ""){
        const uid = UUID();
        const type:ColumnType = {
            name: value,
            uid: uid,
            diagramID: this.diagram.uid,
        };
    }

    public getTables():Array<Table>{
        return [];
    }

    public getNodes():Array<Node>{
        return [];
    }

    public deleteTable(tableID:string){
        publish("canvas", {
            type: "reload",
        });
    }

    public deleteNode(nodeID:string){
        publish("canvas", {
            type: "reload",
        });
    }
}
const diagramController = new DiagramController();
export default diagramController;
