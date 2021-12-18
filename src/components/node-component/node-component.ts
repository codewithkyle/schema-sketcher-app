import db from "@codewithkyle/jsql";
import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import { unsafeHTML } from "lit-html/directives/unsafe-html";
import IconModal from "~components/icon-modal/icon-modal";
import { css, mount } from "~controllers/env";
import { publish, subscribe } from "~lib/pubsub";
import { Node } from "~types/diagram";
import ConnectorComponent from "~components/connector-component/connector-component";
import cc from "~controllers/control-center";
import diagramController from "~controllers/diagram-controller";
import { setValueFromKeypath, unsetValueFromKeypath } from "~utils/sync";
import { send } from "~controllers/ws";

interface INodeComponent extends Node {

}
export default class NodeComponent extends SuperComponent<INodeComponent>{
    private diagramID: string;
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private prevX: number;
    private prevY: number;
    private isMoving: boolean;
    private wasMoved: boolean;
    private zoom: number;

    constructor(node:Node, diagramID:string){
        super();
        this.wasMoved = false;
        this.model = node;
        this.diagramID = diagramID;
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.ctx.font = "bold 16px Rubik";
        this.prevX = node.x;
        this.prevY = node.y;
        this.isMoving = false;
        this.zoom = 1;
        subscribe("sync", this.syncInbox.bind(this));
        subscribe("move", this.moveInbox.bind(this));
        subscribe("zoom", this.zoomInbox.bind(this));
    }
    
    private zoomInbox(zoom){
        this.zoom = zoom;
    }
    
    private moveInbox({x, y, uid}){
        if (uid === this.model.uid){
            this.move(x, y, true);   
        }
    }

    private handleOP(op){
        switch(op.op){
            case "UNSET":
                const updatedModel = {...this.model};
                unsetValueFromKeypath(updatedModel, op.keypath);
                this.update(updatedModel);
                break;
            case "SET":
                switch(op.keypath){
                    case "x":
                        this.move(op.value, parseInt(this.dataset.top));
                        this.prevX = op.value;
                        break;
                    case "y":
                        this.move(parseInt(this.dataset.left), op.value);
                        this.prevY = op.value;
                        break;
                    default:
                        const updatedModel = {...this.model};
                        setValueFromKeypath(updatedModel, op.keypath, op.value);
                        this.update(updatedModel);
                        break;
                }
                break;
            case "DELETE":
                this.remove();
                break;
            case "BATCH":
                for (const subOP of op.ops){
                    this.handleOP(subOP);
                }
                break;
            default:
                break;
        }
    }

    private syncInbox(op){
        if (op.table === "nodes" && op.key === this.model.uid){
            this.handleOP(op);
        }
    }

    override async connected(){
        await css(["node-component"]);
        this.addEventListener("mousedown", this.mouseDown);
        document.addEventListener("keydown", this.handleKeyboard);
        document.addEventListener("mousemove", this.mouseMove);
        document.addEventListener("mouseup", this.mouseUp);
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

    private async confirmDelete(){
        const doDelete = confirm(`Are you sure you want to delete this node?`);
        if (doDelete){
            await diagramController.deleteNode(this.model.uid);
            this.remove();
        }
    }

    private broadcastMove(x:number, y:number){
        if (this.wasMoved){
            const op1 = cc.set("nodes", this.model.uid, `x`, x);
            const op2 = cc.set("nodes", this.model.uid, `y`, y);
            const op = cc.batch("nodes", this.model.uid, [op1, op2]);
            cc.perform(op);
            cc.dispatch(op);
        }
    }

    private move(x:number, y:number, skipBroadcast = false){
        this.style.transform = `translate(${x}px, ${y}px)`;
        this.dataset.top = `${y}`;
        this.dataset.left = `${x}`;
        if (!skipBroadcast){
            send("move", {
                x: x,
                y: y,
                uid: this.model.uid,
            });   
        }
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
                this.wasMoved = true;
                this.broadcastMove(x, y);
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
            }
            else if (moveY) {
                const x = parseInt(this.dataset.left);
                const y = parseInt(this.dataset.top) + direction;
                this.wasMoved = true;
                this.broadcastMove(x, y);
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
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
                this.wasMoved = true;
                this.broadcastMove(x, y);
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
            }
            else if (moveY) {
                const x = parseInt(this.dataset.left);
                const y = parseInt(this.dataset.top) + direction;
                this.wasMoved = true;
                this.broadcastMove(x, y);
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
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

    private updateValue(value){
        const op = cc.set("nodes", this.model.uid, "text", value);
        cc.perform(op);
        cc.dispatch(op);
    }
    private debounceInput = this.debounce(this.updateValue.bind(this), 300);
    private handleInput:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        const value = target.value;
        const newWidth = this.calcWidth(value);
        target.style.width = `${newWidth}px`;
        this.debounceInput(value);
    }

    private mouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = true;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
            this.wasMoved = false;
            this.setAttribute("state", "moving");
        }
    }

    private mouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            if (this.isMoving){
                this.isMoving = false;
                this.prevX = parseInt(this.dataset.left);
                this.prevY = parseInt(this.dataset.top);
                this.broadcastMove(this.prevX, this.prevY);
                this.setAttribute("state", "idling");
                this.wasMoved = false;
            }
            else {
                publish("canvas", {
                    type: "end",
                    id: this.model.uid,
                    tableID: this.model.uid,
                    refs: [this.model.uid],
                });
            }
        }
    }

    private mouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            let x = parseInt(this.dataset.left) + (e.movementX / this.zoom);
            let y = parseInt(this.dataset.top) + (e.movementY / this.zoom);
            this.move(x, y);
            this.wasMoved = true;
        }
    }

    private updateIcon(color:string, icon:string){
        const updatedModel = {...this.model};
        if (color !== this.model.color){
            updatedModel.color = color;
            const op = cc.set("nodes", this.model.uid, "color", color);
            cc.perform(op);
            cc.dispatch(op);
        }
        if (icon !== this.model.icon){
            updatedModel.icon = icon;
            const op = cc.set("nodes", this.model.uid, "icon", icon);
            cc.perform(op);
            cc.dispatch(op);
        }
        this.update(updatedModel);
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
        this.dataset.uid = this.model.uid;
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
            <input style="width:${this.calcWidth(this.model.text)}px;" value="${this.model.text}" type="text" @input=${this.handleInput} @keydown=${this.handleInputKeyboard}>
            ${new ConnectorComponent(`top: -6px;left: 16px;`, this.model.uid, "top", this.model.uid, [this.model.uid])}
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: calc(100% - 6px);`, this.model.uid, "right", this.model.uid, [this.model.uid])}
            ${new ConnectorComponent(`top: calc(100% - 6px);left: 16px;`, this.model.uid, "bottom", this.model.uid, [this.model.uid])}
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: -6px;`, this.model.uid, "left", this.model.uid, [this.model.uid])}
        `;
        render(view, this);
    }
}
mount("node-component", NodeComponent);
