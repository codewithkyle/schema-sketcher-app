import { UUID } from "@codewithkyle/uuid";
import { Connection, Diagram, Node, Table, Column, ColumnType } from "~types/diagram";
import { publish } from "@codewithkyle/pubsub";

const TYPES = ["int", "bigint", "binary", "blob", "boolean", "char", "date", "datetime", "decimal", "double", "enum", "float", "geometry", "json", "bson", "longtext", "mediumint", "mediumtext", "multipoint", "point", "smallint", "time", "text", "timestamp", "tinyint", "uuid", "varchar"];
const COLORS = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];
const SHADES = ["200", "300", "400", "500", "600"];

const COLOR_CODES = {
    red: {
        200: "#FECACA",
        300: "#FCA5A5",
        400: "#F87171",
        500: "#EF4444",
        600: "#DC2626",
    },
    orange: {
        200: "#FED7AA",
        300: "#FDBA74",
        400: "#FB923C",
        500: "#F97316",
        600: "#EA580C",
    },
    amber: {
        200: "#FDE68A",
        300: "#FCD34D",
        400: "#FBBF24",
        500: "#F59E0B",
        600: "#D97706",
    },
    yellow: {
        200: "#FEF08A",
        300: "#FDE047",
        400: "#FACC15",
        500: "#EAB308",
        600: "#CA8A04",
    },
    lime: {
        200: "#D9F99D",
        300: "#BEF264",
        400: "#A3E635",
        500: "#84CC16",
        600: "#65A30D",
    },
    green: {
        200: "#BBF7D0",
        300: "#86EFAC",
        400: "#4ADE80",
        500: "#22C55E",
        600: "#16A34A",
    },
    emerald: {
        200: "#A7F3D0",
        300: "#6EE7B7",
        400: "#34D399",
        500: "#10B981",
        600: "#059669",
    },
    teal: {
        200: "#99F6E4",
        300: "#5EEAD4",
        400: "#2DD4BF",
        500: "#14B8A6",
        600: "#0D9488",
    },
    cyan: {
        200: "#A5F3FC",
        300: "#67E8F9",
        400: "#22D3EE",
        500: "#06B6D4",
        600: "#0891B2",
    },
    sky: {
        200: "#BAE6FD",
        300: "#7DD3FC",
        400: "#38BDF8",
        500: "#0EA5E9",
        600: "#0284C7",
    },
    indigo: {
        200: "#C7D2FE",
        300: "#A5B4FC",
        400: "#818CF8",
        500: "#6366F1",
        600: "#4F46E5",
    },
    violet: {
        200: "#DDD6FE",
        300: "#C4B5FD",
        400: "#A78BFA",
        500: "#8B5CF6",
        600: "#7C3AED",
    },
    purple: {
        200: "#E9D5FF",
        300: "#D8B4FE",
        400: "#C084FC",
        500: "#A855F7",
        600: "#9333EA",
    },
    fuchsia: {
        200: "#F5D0FE",
        300: "#F0ABFC",
        400: "#E879F9",
        500: "#D946EF",
        600: "#C026D3",
    },
    pink: {
        200: "#FBCFE8",
        300: "#F9A8D4",
        400: "#F472B6",
        500: "#EC4899",
        600: "#DB2777",
    },
    rose: {
        200: "#FECDD3",
        300: "#FDA4AF",
        400: "#FB7185",
        500: "#F43F5E",
        600: "#E11D48",
    },
};

class DiagramController {
    private diagram:Diagram;
    private movingColumnUID:string;
    public ID:string;
    private tableCount:number;

    constructor(){
        this.movingColumnUID = null;
        this.ID = null;
        this.tableCount = 0;
    }
    
    private getRandomColor():string{
        const color = this.getRandomInt(0, COLORS.length - 1);
        const shade = this.getRandomInt(0, SHADES.length - 1);
        return COLOR_CODES[COLORS[color]][SHADES[shade]];
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
            const uid = UUID();
            types[uid] = {
                name: type,
                uid: uid,
            };
        });
        this.diagram = {
            uid: uid,
            name: "UNTITLED",
            timestamp: Date.now(),
            tables: {},
            columns: {},
            nodes: {},
            connections: {},
            types: types,
        };
        return this.diagram;
    }

    public createTable(placeX:number, placeY:number){
        const uid = UUID();
        const table:Table = {
            uid: uid,
            name: `table_${++this.tableCount}`,
            color: this.getRandomColor(),
            x: placeX,
            y: placeY,
        };
        this.diagram.tables[uid] = table;
        this.createColumn(uid, "id", true);
    }

    public createColumn(tableID:string, name = "", primaryKey = false){
        const columnUid = UUID();
        const column:Column = {
            name: name,
            type: this.diagram.types[Object.keys(this.diagram.types)[0]].uid,
            isNullable: false,
            isUnique: false,
            isIndex: false,
            isPrimaryKey: primaryKey,
            weight: 0,
            uid: columnUid,
            tableID: tableID,
        };
        this.diagram.columns[columnUid] = column;
    }

    public deleteColumn(columnID:string){
        const columns = Object.values(this.diagram.columns).filter(column => {
            return column.tableID === this.diagram.columns[columnID].tableID;
        });
        if (columns.length-1 === 0){
            this.deleteTable(this.diagram.columns[columnID].tableID);
        } else {
            this.deleteElement(columnID);
            delete this.diagram.columns[columnID];
        }
        publish("canvas", {
            type: "reload",
        });
    }

    public getColumnsByTable(tableID:string):Array<Column>{
        const columns = Object.values(this.diagram.columns).filter(column => {
            return column.tableID === tableID;
        });
        columns.sort((a, b) => {
            return a.weight - b.weight;
        });
        return columns;
    }

    public getColumn(uid:string):Column{
        return this.diagram.columns[uid];
    }

    public reorderColumns(columns:Array<Column>){
        columns.map((column, index) => {
            this.diagram.columns[column.uid].weight = index;
        });
    }

    public moveColumn(columnID:string, tableID:string){
        this.diagram.columns[columnID].tableID = tableID;
    }

    public renameColumn(uid:string, value:string){
        this.diagram.columns[uid].name = value;
    }

    public renameTable(uid:string, value:string){
        this.diagram.tables[uid].name = value;
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
        };
        this.diagram.nodes[uid] = node;
    }

    public createConnection(startNodeID:string, endNodeID:string, refs:Array<string>){
        const uid = UUID();
        const connection:Connection = {
            uid: uid,
            startNodeID: startNodeID,
            endNodeID: endNodeID,
            type: "one-one",
            refs: refs,
            color: this.randomRGBColor(),
        };
        this.diagram.connections[uid] = connection;
    }

    public getConnections():Array<Connection>{
        return Object.values(this.diagram.connections);
    }

    public getTypes():Array<ColumnType>{
        return Object.values(this.diagram.types);
    }

    public deleteType(uid:string){
        delete this.diagram.types[uid];
    }

    public createType(value = ""){
        const uid = UUID();
        const type:ColumnType = {
            name: value,
            uid: uid,
        };
    }

    public getTables():Array<Table>{
        return this.diagram ? Object.values(this.diagram.tables) : [];
    }

    public getTable(uid:string):Table{
        return this.diagram.tables[uid];
    }

    public getNodes():Array<Node>{
        return [];
    }

    public deleteTable(tableID:string){
        delete this.diagram.tables[tableID];
        this.deleteElement(tableID);
        const columnIDs = Object.keys(this.diagram.columns).filter(columnID => {
            return this.diagram.columns[columnID].tableID === tableID;
        });
        columnIDs.map(columnID => {
            delete this.diagram.columns[columnID];
        });
        publish("canvas", {
            type: "reload",
        });
    }

    public deleteNode(nodeID:string){
        publish("canvas", {
            type: "reload",
        });
    }

    private deleteElement(uid:string){
        document.body.querySelector(`[data-uid="${uid}"]`)?.remove();
    }

    private randomRGBColor(){
        return `rgb(${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)},${Math.floor(Math.random() * 255)})`;
    }
}
const diagramController = new DiagramController();
export default diagramController;
