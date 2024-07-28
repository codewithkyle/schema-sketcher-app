import { UUID } from "@codewithkyle/uuid";
import { Connection, Diagram, Node, Table, Column, ColumnType, ConnectionType, DatabaseType } from "~types/diagram";
import { publish } from "@codewithkyle/pubsub";
import { MYSQL_TYPES, POSTGRES_TYPES, SQLITE_TYPES, SQL_SERVER_TYPES } from "~utils/column-types";
import modals from "~brixi/controllers/modals";
import { html } from "lit-html";
import { COLORS, SHADES, COLOR_CODES } from "~utils/colors";

class DiagramController {
    private diagram:Diagram;
    public ID:string;
    private tableCount:number;
    private type:DatabaseType;
    private createDiagramCallback:Function;

    constructor(){
        this.ID = UUID();
        this.type = null;
        this.tableCount = 0;
        this.diagram = null;
        this.createDiagramCallback = () => {};
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

    private onSelect:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const type = target.dataset.type as DatabaseType;
        this.type = type;
        this.createDiagramCallback(type);
    }
    
    public async createDiagram():Promise<Diagram>{
        let modal;
        await new Promise((resolve) => {
            this.createDiagramCallback = resolve;
            modal = modals.raw({
                view: html`
                    <div class="databases">
                        <button @mousedown=${this.onSelect} data-type="mysql">
                            <img src="/assets/mysql.png" alt="MySQL" />
                            <span>MySQL</span>
                        </button>
                        <button @mousedown=${this.onSelect} data-type="postgresql">
                            <img src="/assets/postgresql.png" alt="PostgreSQL" />
                            <span>PostgreSQL</span>
                        </button>
                        <button @mousedown=${this.onSelect} data-type="sqlite">
                            <img src="/assets/sqlite.png" alt="SQLite" />
                            <span>SQLite</span>
                        </button>
                        <button @mousedown=${this.onSelect} data-type="mssql">
                            <img src="/assets/sql-server.png" alt="SQL Server" />
                            <span>SQL Server</span>
                        </button>
                    </div>
                `,
            });
        });
        if (modal) modal.remove();
        const uid = UUID();
        this.ID = uid;
        const types = {};
        switch (this.type){
            case "mysql":
                MYSQL_TYPES.map(type => {
                    const uid = UUID();
                    types[uid] = {
                        name: type,
                        uid: uid,
                    };
                });
                break;
            case "postgresql":
                POSTGRES_TYPES.map(type => {
                    const uid = UUID();
                    types[uid] = {
                        name: type,
                        uid: uid,
                    };
                });
                break;
            case "sqlite":
                SQLITE_TYPES.map(type => {
                    const uid = UUID();
                    types[uid] = {
                        name: type,
                        uid: uid,
                    };
                });
                break;
            case "mssql":
                SQL_SERVER_TYPES.map(type => {
                    const uid = UUID();
                    types[uid] = {
                        name: type,
                        uid: uid,
                    };
                });
                break;
            default:
                break;
        }
        this.diagram = {
            fileName: `Untitled-${Date.now()}`,
            uid: uid,
            timestamp: Date.now(),
            tables: {},
            columns: {},
            nodes: {},
            connections: {},
            types: types,
        };
        return this.diagram;
    }

    public async reset(){
        await this.createDiagram();
        publish("diagram", { type: "reset" });
    }

    public export():[Diagram, string]{
        return [this.diagram, JSON.stringify(this.diagram)];
    }

    public import(json:string){
        publish("diagram", { type: "reset" });
        this.diagram = JSON.parse(json);
        setTimeout(() => {
            publish("diagram", { type: "load" });
        }, 80);
    }

    public setFileName(value:string){
        this.diagram.fileName = value;
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

    public changeColumnType(uid:string, type:string){
        this.diagram.columns[uid].type = type;
    }

    public changeColumnNullable(uid:string, value:boolean){
        this.diagram.columns[uid].isNullable = value;
    }

    public changeColumnUnique(uid:string, value:boolean){
        this.diagram.columns[uid].isUnique = value;
    }

    public changeColumnIndex(uid:string, value:boolean){
        this.diagram.columns[uid].isIndex = value;
    }

    public changeColumnPrimaryKey(uid:string, value:boolean){
        this.diagram.columns[uid].isPrimaryKey = value;
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

    public updateConnectionType(uid:string, type:ConnectionType){
        this.diagram.connections[uid].type = type;
    }

    public deleteConnection(uid:string){
        delete this.diagram.connections[uid];
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

