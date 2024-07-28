import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import "~components/main-menu/main-menu";
import diagramController from "~controllers/diagram-controller";
import env from "~brixi/controllers/env";
import TableComponent from "~components/table-component/table-component";
import "~components/editor-controls/editor-controls";
import { createSubscription, publish, subscribe } from "~lib/pubsub";
import "~components/canvas-component/canvas-component";
import ContextMenu from "~brixi/components/context-menu/context-menu";

interface IEditorPage {}
export default class EditorPage extends SuperComponent<IEditorPage>{
    private uid:string;
    private isMoving: boolean;
    private canMove: boolean;
    private placeX: number;
    private placeY: number;
    private x: number;
    private y: number;
    private scale: number;
    private forceMove: boolean;

    constructor(){
        super();
        this.x = window.innerWidth / 2;
        this.y = (window.innerHeight - 64) / 2;
        this.scale = 1;
        this.isMoving = false;
        this.forceMove = false;
        createSubscription("zoom");
        subscribe("diagram", this.diagramInbox.bind(this));
    }

    override async connected(){
        window.addEventListener("wheel", this.handleScroll, { passive: true, capture: true });
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        window.addEventListener("mousedown", this.handleMouseDown);
        window.addEventListener("mouseup", this.handleMouseUp);
        window.addEventListener("mousemove", this.handleMouseMove);
        this.addEventListener("zoom", this.onScale);
        this.addEventListener("move", this.handleMove);
        await env.css(["editor-page"]);
        const diagram = diagramController.createDiagram();
        this.uid = diagram.uid;
        this.render();
    }

    private diagramInbox({type,data}){
        switch(type){
            case "load":
                this.render();
                break;
            default:
                break;
        }
    }

    private handleKeyDown:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent){
            const key = e.key;
            if (key === " "){
                this.canMove = true;
                this.setCursor("hand");
            } else if (key === "Escape"){
                document.activeElement?.blur();
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
        }
    }

    private handleScroll:EventListener = (e:WheelEvent) => {
        const delta = e.deltaY * -1;
        const speed = 0.001;
        const scroll = delta * speed;
        const anchor = this.querySelector(".anchor") as HTMLElement;
        let scale = this.scale + scroll;
        if (scale < 0.125){
            scale = 0.125;
        } else if (scale > 1){
            scale = 1;
        }
        anchor.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.x}, ${this.y})`;
        this.scale = scale;
        publish("zoom", scale);
    }

    private handleMouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && (this.canMove || this.forceMove)){
            this.isMoving = true;
            this.setCursor("hand");
        }
    }

    private handleMouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            this.isMoving = false;
            this.setCursor("hand");
        }
    }

    private handleMouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving && (this.canMove || this.forceMove)){
            const anchor = this.querySelector(".anchor") as HTMLElement;
            this.setCursor("grabbing");
            const x = this.x + e.movementX;
            const y = this.y + e.movementY;
            anchor.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${x}, ${y})`;
            this.x = x;
            this.y = y;
        }
    }

    private handleMove:EventListener = (e:CustomEvent) => {
        if (e.detail?.isMoving){
            this.isMoving = true;
            this.forceMove = true;
            this.setCursor("hand");
        } else {
            this.isMoving = false;
            this.forceMove = false;
            this.setCursor("auto");
        }
    }

    private setCursor(type:"auto"|"hand"|"grabbing"|"zoom"){
        const canvas = this.querySelector("canvas-component");
        canvas.setAttribute("cursor", type);
    }

    private spawn(type:"table"|"node"){
        switch(type){
            case "table":
                diagramController.createTable(this.placeX, this.placeY);
                this.render();
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
            const anchor = this.querySelector(".anchor");
            const bounds = anchor.getBoundingClientRect();
            this.placeX = x - bounds.x;
            this.placeY = y - bounds.y;
            document.body.querySelectorAll("brixi-context-menu").forEach((el) => el.remove());
            new ContextMenu({
                items: [
                    {
                        label: "Create table",
                        callback: () => {
                            this.spawn("table");
                        }
                    },
                    null,
                    {
                        label: "Save",
                        hotkey: "Ctrl+S",
                        callback: () => {
                            //diagramController.saveDiagram();
                        },
                    },
                    {
                        label: "Reload",
                        hotkey: "Ctrl+R",
                        callback: () => {
                            location.reload();
                        },
                    },
                ],
                x: x, 
                y: y,
            });
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
        return cursor;
    }

    private onScale:EventListener = (e:CustomEvent) => {
        const anchor = this.querySelector(".anchor") as HTMLElement;
        let scale = e.detail;
        if (scale < 0.125){
            scale = 0.125;
        } else if (scale > 1){
            scale = 1;
        }
        anchor.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.x}, ${this.y})`;
        this.scale = scale;
    }
    
    override async render(){
        const view = html`
            <canvas-component @contextmenu=${this.handleContextMenu}></canvas-component>
            <div class="anchor" style="transform: ${`matrix(${this.scale}, 0, 0, ${this.scale}, ${this.x}, ${this.y})`}"></div>
            <main-menu></main-menu>
            <editor-controls @move=${this.handleMove} data-is-moving="${this.isMoving}" data-scale="${this.scale}"></editor-controls>
        `;
        render(view, this);
        const anchor = this.querySelector(".anchor");
        diagramController.getTables().map(table => {
            const el:HTMLElement = anchor.querySelector(`[data-uid="${table.uid}"]`) || new TableComponent();
            if (!el.isConnected){
                el.dataset.uid = table.uid;
                anchor.appendChild(el);
            }
        });
    }
}
env.bind("editor-page", EditorPage);
