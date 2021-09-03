import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import EditorHeader from "~components/editor-header/editor-header";
import diagramController from "~controllers/diagram-controller";
import { css, mount } from "~controllers/env";
import { Diagram } from "~types/diagram";
import ContextMenu from "~components/context-menu/context-menu";
import TableComponent from "~components/table-component/table-component";
import { navigateTo } from "@codewithkyle/router";
import EditorControls from "~components/editor-controls/editor-controls";
import { createSubscription, publish, subscribe } from "~lib/pubsub";
import NodeComponent from "~components/node-component/node-component";
import CanvasComponent from "~components/canvas-component/canvas-component";
import db from "@codewithkyle/jsql";
import cursorController from "~controllers/cursor-controller";

interface IEditorPage {
    diagram: Diagram,
}
export default class EditorPage extends SuperComponent<IEditorPage>{
    private uid:string;
    private isMoving: boolean;
    private canMove: boolean;
    private startX: number;
    private startY: number;
    private placeX: number;
    private placeY: number;
    private x: number;
    private y: number;
    private scale: number;
    private forceMove: boolean;
    private forceZoom: boolean;
    private isZooming: boolean;

    constructor(tokens, params){
        super();
        this.model = {
            diagram: null,
        };
        this.x = window.innerWidth / 2;
        this.y = (window.innerHeight - 64) / 2;
        this.scale = 1;
        this.uid = tokens.UID;
        this.isMoving = false;
        this.forceMove = false;
        this.forceZoom = false;
        this.isZooming = false;
        createSubscription("zoom");
        subscribe("sync", this.syncInbox.bind(this));
    }

    private syncInbox(e){
        const anchor = this.querySelector(".js-anchor");
        if (e.op === "INSERT"){
            switch(e.table){
                case "tables":
                    const table = new TableComponent(e.value, this.model.diagram.uid);
                    anchor.appendChild(table);
                    break;
                case "nodes":
                    const node = new NodeComponent(e.value, this.model.diagram.uid);
                    anchor.appendChild(node);
                    break;
                default:
                    break;
            }
        }
        else if (e.op === "DELETE"){
            switch(e.table){
                case "tables":
                    this.querySelector(`table-component[data-uid="${e.key}"]`)?.remove();
                    break;
                case "nodes":
                    this.querySelector(`node-component[data-uid="${e.key}"]`)?.remove();
                    break;
                default:
                    break;
            }
        }
    }

    override async connected(){
        window.addEventListener("mousewheel", this.handleScroll.bind(this), {passive: true});
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        await css(["editor-page"]);
        const diagram = await diagramController.loadDiagram(this.uid);
        if (!diagram){
            navigateTo("/");
        }
        this.update({
            diagram: diagram,
        });
    }

    private setCursor(type:"auto"|"hand"|"grabbing"|"zoom"){
        const canvas = this.querySelector(".js-canvas");
        canvas.setAttribute("cursor", type);
    }

    private handleKeyDown:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent){
            const key = e.key;
            if (key === " "){
                this.canMove = true;
                this.setCursor("hand");
            }
            else if (key === "Control"){
                this.isZooming = true;
                this.setCursor("zoom");
            }
        }
    }

    private handleKeyUp:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent){
            const key = e.key;
            if (key === " "){
                this.canMove = false;
                this.setCursor("auto");
            }
            else if (key === "Control"){
                this.isZooming = false;
                this.setCursor("auto");
            }
        }
    }

    private handleScroll:EventListener = (e:WheelEvent) => {
        if (this.isZooming || this.forceZoom){
            const target = e.target as HTMLElement;
            if (target.closest(".js-canvas") || target.classList.contains(".js-canvas")){
                const delta = e.deltaY * -1;
                const speed = 0.001;
                const scroll = delta * speed;
                const anchor = this.querySelector(".js-anchor") as HTMLElement;
                let scale = parseFloat(anchor.dataset.scale) + scroll;
                if (scale < 0.125){
                    scale = 0.125;
                } else if (scale > 2){
                    scale = 2;
                }
                anchor.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.x}px, ${this.y}px)`;
                anchor.dataset.scale = `${scale}`;
                this.scale = scale;
                publish("zoom", scale);
            }
        }
    }

    private handleMouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && (this.canMove || this.forceMove)){
            this.isMoving = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.setCursor("grabbing");
        }
    }

    private handleMouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            this.isMoving = false;
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            this.x = parseInt(anchor.dataset.left);
            this.y = parseInt(anchor.dataset.top);
            this.setCursor("hand");
        }
    }

    private handleMouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving && (this.canMove || this.forceMove)){
            console.log("moving");
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            const moveX = this.startX - e.clientX;
            const moveY = this.startY - e.clientY;
            const x = parseInt(anchor.dataset.left) - moveX;
            const y = parseInt(anchor.dataset.top) - moveY;
            anchor.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${this.x}px, ${this.y}px)`;
            anchor.dataset.top = `${y}`;
            anchor.dataset.left = `${x}`;
            this.startX = e.clientX;
            this.startY = e.clientY;
        }
    }

    private async spawn(type:"table"|"node"){
        switch(type){
            case "table":
                await diagramController.createTable(this.placeX, this.placeY);
                break;
            case "node":
                await diagramController.createNode(this.placeX, this.placeY);
                break;
            default:
                break;
        }
    }

    private handleContextMenu:EventListener = (e:MouseEvent) => {
        e.preventDefault();
        if (e instanceof MouseEvent){
            const x = e.clientX;
            const y = e.clientY;
            const anchor = this.querySelector(".js-anchor");
            const bounds = anchor.getBoundingClientRect();
            this.placeX = x - bounds.x;
            this.placeY = y - bounds.y;
            const menu = new ContextMenu(x, y, this.spawn.bind(this));
            document.body.appendChild(menu);
        }
    }

    private scaleCallback(scale:number){
        const anchor = this.querySelector(".js-anchor") as HTMLElement;
        if (scale < 0.125){
            scale = 0.125;
        } else if (scale > 2){
            scale = 2;
        }
        anchor.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.x}px, ${this.y}px)`;
        anchor.dataset.scale = `${scale}`;
        this.scale = scale;
    }

    private toggleMoveCallback(isMoving){
        this.forceMove = isMoving;
        if (isMoving){
            this.setCursor("hand");
        }
        else {
            this.setCursor("auto");
        }
    }
    
    private getCursorType(){
        let cursor = "auto";
        if (this.isMoving){
            cursor = "grab";
        }
        else if (this.forceMove) {
            cursor = "hand";   
        }
        else if (this.forceZoom){
            cursor = "zoom";   
        }
        return cursor;
    }
    
    override async render(){
        const tables = await diagramController.getTables();
        const nodes = await diagramController.getNodes();
        const view = html`
            ${new EditorHeader(this.model.diagram.name)}
            <div cursor="${this.getCursorType()}" class="canvas js-canvas" @mousedown=${this.handleMouseDown} @mouseup=${this.handleMouseUp} @mousemove=${this.handleMouseMove} @contextmenu=${this.handleContextMenu}>
                <div data-scale="${this.scale}" data-top="${this.y}" data-left="${this.x}" style="transform: matrix(${this.scale}, 0, 0, ${this.scale}, ${this.x}px, ${this.y}px);" class="diagram js-anchor"></div>
            </div>
            ${new EditorControls(this.isMoving, this.scale, this.toggleMoveCallback.bind(this), this.scaleCallback.bind(this))}
            ${new CanvasComponent()}
        `;
        render(view, this);
        setTimeout(()=>{
            const anchor = this.querySelector(".js-anchor");
            tables.map(table => {
                const el = new TableComponent(table, this.model.diagram.uid);
                anchor.appendChild(el);
            });
            nodes.map(node => {
                const el = new NodeComponent(node, this.model.diagram.uid);
                anchor.appendChild(el);
            });
        }, 80);
    }
}
mount("editor-page", EditorPage);
