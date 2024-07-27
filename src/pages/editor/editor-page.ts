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
    }

    override async connected(){
        window.addEventListener("mousewheel", this.handleScroll.bind(this), { passive: false });
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        await env.css(["editor-page"]);
        const diagram = diagramController.createDiagram();
        this.uid = diagram.uid;
        this.render();
    }

    private handleKeyDown:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent){
            const key = e.key;
            if (key === " "){
                this.canMove = true;
                this.setCursor("hand");
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
        const target = e.target as HTMLElement;
        if (target.closest(".js-canvas") || target.classList.contains(".js-canvas")){
            const delta = e.deltaY * -1;
            const speed = 0.001;
            const scroll = delta * speed;
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            let scale = parseFloat(anchor.dataset.scale) + scroll;
            if (scale < 0.125){
                scale = 0.125;
            } else if (scale > 1){
                scale = 1;
            }
            anchor.style.transform = `matrix(${scale}, 0, 0, ${scale}, ${this.x}, ${this.y})`;
            anchor.dataset.scale = `${scale}`;
            this.scale = scale;
            publish("zoom", scale);
        }
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
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            this.x = parseInt(anchor.dataset.left);
            this.y = parseInt(anchor.dataset.top);
            this.setCursor("hand");
        }
    }

    private handleMouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving && (this.canMove || this.forceMove)){
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            this.setCursor("grabbing");
            const x = parseInt(anchor.dataset.left) + e.movementX;
            const y = parseInt(anchor.dataset.top) + e.movementY;
            anchor.style.transform = `matrix(${this.scale}, 0, 0, ${this.scale}, ${x}, ${y})`;
            anchor.dataset.top = `${y}`;
            anchor.dataset.left = `${x}`;
        }
    }

    private handleMove:EventListener = (e:CustomEvent) => {
        console.log(e.detail);
        if (e.detail.isMoving){
            this.isMoving = true;
            this.setCursor("hand");
        } else {
            this.isMoving = false;
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
    
    override async render(){
        const view = html`
            <canvas-component @contextmenu=${this.handleContextMenu}></canvas-component>
            <div class="anchor"></div>
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
