import { css, mount } from "~controllers/env";
import { publish } from "~lib/pubsub";
import { v4 as uuid } from "uuid";


export default class ConnectorComponent extends HTMLElement{
    private columnID:string;
    private tableID:string;
    private tableUID:string;
    private columnUID:string;
    private uid:string;
    
    constructor(style:string, columnID:string, side:string, tableID:string, tableUID:string, columnUID:string){
        super();
        this.uid = uuid();
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
        this.addEventListener("mouseenter", this.handleMouseEnter);
        this.addEventListener("mouseleave", this.handleMouseLeave);
    }
    
    private handleMouseEnter:EventListener = (e:Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        publish("canvas", {
            type: "highlight",
            ref: this.uid,
        });
    }
    
    private handleMouseLeave:EventListener = (e:Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        publish("canvas", {
            type: "clear-highlight",
            target: this.uid,
        });
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
            refs: [this.tableUID, this.columnUID, this.uid],
        });
    }

    private endDraw:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        publish("canvas", {
            type: "end",
            id: this.columnID,
            tableID: this.tableID,
            refs: [this.tableUID, this.columnUID, this.uid],
        });
    }
}
mount("connector-component", ConnectorComponent);
