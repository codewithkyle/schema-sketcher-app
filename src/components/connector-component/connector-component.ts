import { css, mount } from "~controllers/env";
import { publish } from "~lib/pubsub";


export default class ConnectorComponent extends HTMLElement{
    private columnID:string;

    constructor(style:string, columnID:string, side:string){
        super();
        this.style.cssText = style;
        this.columnID = columnID;
        this.id = `${columnID}_${side}`;
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
        });
    }

    private endDraw:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        publish("canvas", {
            type: "end",
            id: this.columnID,
        });
    }
}
mount("connector-component", ConnectorComponent);