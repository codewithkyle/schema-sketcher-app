import { css, mount } from "~controllers/env";
import { publish } from "~lib/pubsub";


export default class ConnectorComponent extends HTMLElement{
    private columnID:string;
    private tableID:string;
    private tableUID:string;
    private columnUID:string;

    constructor(style:string, columnID:string, side:string, tableID:string, tableUID:string, columnUID:string){
        super();
        this.style.cssText = style;
        this.columnID = columnID;
        this.id = `${columnID}_${side}`;
        this.tableID = tableID;
        this.tableUID = tableUID;
        this.columnUID = columnUID;
        css(["connector-component"]);
    }

    connectedCallback(){
        this.addEventListener("mousedown", this.startDraw);
        this.addEventListener("mouseup", this.endDraw);
    }

    private startDraw:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        const bounds = this.getBoundingClientRect();
        publish("canvas", {
            type: "start",
            x: bounds.x,
            y: bounds.y,
            id: this.columnID,
            tableID: this.tableID,
            refs: [this.tableUID, this.columnUID],
        });
    }

    private endDraw:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        publish("canvas", {
            type: "end",
            id: this.columnID,
            tableID: this.tableID,
            refs: [this.tableUID, this.columnUID],
        });
    }
}
mount("connector-component", ConnectorComponent);
