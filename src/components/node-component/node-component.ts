import db from "@codewithkyle/jsql";
import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import IconModal from "~components/icon-modal/icon-modal";
import { css, mount } from "~controllers/env";
import { publish } from "~lib/pubsub";
import { Node } from "~types/diagram";
import ConnectorComponent from "~components/connector-component/connector-component";
import cc from "~controllers/control-center";

interface INodeComponent extends Node {

}
export default class NodeComponent extends SuperComponent<INodeComponent>{
    private diagramID: string;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private prevX: number;
    private prevY: number;
    private isMoving: boolean;

    constructor(node:Node, diagramID:string){
        super();
        this.model = node;
        this.diagramID = diagramID;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "bold 16px Rubik";
        this.prevX = node.x;
        this.prevY = node.y;
        this.isMoving = false;
    }

    override async connected(){
        await css(["node-component"]);
        this.addEventListener("mousedown", this.mouseDown);
        this.addEventListener("mouseup", this.mouseUp);
        document.addEventListener("keydown", this.handleKeyboard);
        document.addEventListener("mousemove", this.mouseMove);
        this.addEventListener("mouseenter", this.handleMouseEnter);
        this.addEventListener("mouseleave", this.handleMouseLeave);
        this.render();
    }
    
    private handleMouseEnter:EventListener = (e:Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        publish("canvas", {
            type: "highlight",
            ref: this.model.uid,
        });
    }
    
    private handleMouseLeave:EventListener = (e:Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        publish("canvas", {
            type: "clear-highlight",
            ref: this.model.uid
        });
    }

    private confirmDelete(){
        const doDelete = confirm(`Are you sure you want to delete this node?`);
        if (doDelete){
            this.remove();
        }
    }

    private broadcastMove(){
        const x = parseInt(this.dataset.left);
        const y = parseInt(this.dataset.top);
        const op1 = cc.set("diagrams", this.diagramID, `nodes.${this.model.uid}.x`, x);
        cc.perform(op1, true);
        const op2 = cc.set("diagrams", this.diagramID, `nodes.${this.model.uid}.y`, y);
        cc.perform(op2, true);
    }

    private move(x:number, y:number){
        this.style.transform = `translate(${x}px, ${y}px)`;
        this.dataset.top = `${y}`;
        this.dataset.left = `${x}`;
    }

    private handleKeyboard:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent && document.activeElement === this){
            let moveX = false;
            let moveY = false;
            let direction = 0;
            switch(e.key){
                case "ArrowUp":
                    e.preventDefault();
                    moveY = true;
                    direction = -1;
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    moveY = true;
                    direction = 1;
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    moveX = true;
                    direction = -1;
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    moveX = true;
                    direction = 1;
                    break;
                case "Delete":
                    e.preventDefault();
                    this.confirmDelete();
                    break;
                case "d":
                    e.preventDefault();
                    if (e.ctrlKey || e.metaKey){
                        console.log("Duplicate node");
                    }
                    break;
                default:
                    break;
            }
            if (e.shiftKey){
                direction *= 10;
            }
            if (moveX){
                const x = parseInt(this.dataset.left) + direction;
                const y = parseInt(this.dataset.top);
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
                this.broadcastMove();
            }
            else if (moveY) {
                const x = parseInt(this.dataset.left);
                const y = parseInt(this.dataset.top) + direction;
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
                this.broadcastMove();
            }
        }
    }

    private handleInputKeyboard:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent && (e.metaKey || e.ctrlKey)){
            let moveX = false;
            let moveY = false;
            let direction = 0;
            switch(e.key){
                case "ArrowUp":
                    e.preventDefault();
                    moveY = true;
                    direction = -1;
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    moveY = true;
                    direction = 1;
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    moveX = true;
                    direction = -1;
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    moveX = true;
                    direction = 1;
                    break;
                case "Delete":
                    e.preventDefault();
                    this.confirmDelete();
                    break;
                case "d":
                    e.preventDefault();
                    if (e.ctrlKey || e.metaKey){
                        console.log("Duplicate node");
                    }
                    break;
                default:
                    break;
            }
            if (e.shiftKey){
                direction *= 10;
            }
            if (moveX){
                const x = parseInt(this.dataset.left) + direction;
                const y = parseInt(this.dataset.top);
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
                this.broadcastMove();
            }
            else if (moveY) {
                const x = parseInt(this.dataset.left);
                const y = parseInt(this.dataset.top) + direction;
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
                this.broadcastMove();
            }
        }
    }

    private calcWidth(value){
        const metrics = this.ctx.measureText(value);
        let newWidth = metrics.width;
        if (newWidth < 100){
            newWidth = 100;
        }
        return newWidth;
    }

    private handleInput:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        const value = target.value;
        const newWidth = this.calcWidth(value);
        target.style.width = `${newWidth}px`;
    }

    private handleBlur:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        if (target.value !== this.model.text){
            const op = cc.set("diagrams", this.diagramID, `nodes.${this.model.uid}.text`, target.value);
            cc.perform(op, true);
        }
    }

    private mouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = true;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
            this.setAttribute("state", "moving");
        }
    }

    private mouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            if (this.isMoving){
                this.isMoving = false;
                this.prevX = parseInt(this.dataset.left);
                this.prevY = parseInt(this.dataset.top);
                this.setAttribute("state", "idling");
                this.broadcastMove();
            }
            else {
                publish("canvas", {
                    type: "end",
                    id: this.id,
                    tableID: this.id,
                    refs: [this.model.uid],
                });
            }
        }
    }

    private mouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            const moveX = this.prevX - e.clientX;
            const moveY = this.prevY - e.clientY;
            const x = parseInt(this.dataset.left) - moveX;
            const y = parseInt(this.dataset.top) - moveY;
            this.move(x, y);
            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    private updateIcon(color:string, icon:string){
        this.update({
            color: color,
            icon: icon,
        });
        const op1 = cc.set("diagrams", this.diagramID, `nodes.${this.model.uid}.color`, color);
        cc.perform(op1, true);
        const op2 = cc.set("diagrams", this.diagramID, `nodes.${this.model.uid}.icon`, icon);
        cc.perform(op2, true);
    }

    private openIconMenu:EventListener = (e:Event) => {
        const modal = new IconModal(this.updateIcon.bind(this), this.model.color, this.model.icon);
        document.body.appendChild(modal);
    }

    private noop:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
    }

    override async render(){
        this.style.transform = `translate(${this.prevX}px, ${this.prevY}px)`;
        this.dataset.top = `${this.prevY}`;
        this.dataset.left = `${this.prevX}`;
        this.tabIndex = 0;
        this.id = `node_${this.model.uid}`;
        this.setAttribute("aria-label", `use arrow keys to nudge node`);
        // @ts-ignore
        const result = await db.query("SELECT svg FROM icons WHERE name = $name", {
            name: this.model.icon,
        });
        const icon = result[0].svg;
        const view = html`
            <button @mousedown=${this.noop} @click=${this.openIconMenu} class="font-${this.model.color}-600">
                <div class="bg-${this.model.color}-500"></div>
                ${unsafeHTML(icon)}
            </button>
            <input style="width:${this.calcWidth(this.model.text)}px;" value="${this.model.text}" type="text" @input=${this.handleInput} @keydown=${this.handleInputKeyboard} @blur=${this.handleBlur}>
            ${new ConnectorComponent(`top: -6px;left: 16px;`, this.id, "top", this.id, [this.model.uid])}
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: calc(100% - 6px);`, this.id, "right", this.id, [this.model.uid])}
            ${new ConnectorComponent(`top: calc(100% - 6px);left: 16px;`, this.id, "bottom", this.id, [this.model.uid])}
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: -6px;`, this.id, "left", this.id, [this.model.uid])}
        `;
        render(view, this);
    }
}
mount("node-component", NodeComponent);
