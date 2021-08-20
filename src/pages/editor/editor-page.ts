import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import EditorHeader from "~components/editor-header/editor-header";
import diagramController from "~controllers/diagram-controller";
import { css, mount } from "~controllers/env";
import { Diagram } from "~types/diagram";
import ContextMenu from "~components/context-menu/context-menu";
import { v4 as uuid} from "uuid";
import TableComponent from "~components/table-component/table-component";
import { navigateTo } from "@codewithkyle/router";
import db from "@codewithkyle/jsql";
import EditorControls from "~components/editor-controls/editor-controls";
import { createSubscription, publish } from "~lib/pubsub";
import NodeComponent from "~components/node-component/node-component";
import CanvasComponent from "~components/canvas-component/canvas-component";
import cc from "~controllers/control-center";

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
        createSubscription("zoom");
    }

    override async connected(){
        window.addEventListener("mousewheel", this.handleScroll.bind(this), {passive: true});
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        await css(["editor-page"]);
        const { ops, diagram } = await diagramController.loadDiagram(this.uid);
        if (!diagram){
            navigateTo("/");
        }
        this.update({
            diagram: diagram,
        });
    }

    private setCursor(type:"auto"|"hand"|"grabbing"){
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
            } else if (scale > 2){
                scale = 2;
            }
            anchor.style.transform = `translate(${this.x}px, ${this.y}px) scale(${scale})`;
            anchor.dataset.scale = `${scale}`;
            this.scale = scale;
            publish("zoom", scale);
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
            anchor.style.transform = `translate(${x}px, ${y}px) scale(${this.scale})`;
            anchor.dataset.top = `${y}`;
            anchor.dataset.left = `${x}`;
            this.startX = e.clientX;
            this.startY = e.clientY;
        }
    }

    private async spawn(type:"table"|"node"){
        const uid = uuid();
        const updatedModel = {...this.model};
        let op;
        switch(type){
            case "table":
                updatedModel.diagram.tables[uid] = await diagramController.createTable(uid, this.placeX, this.placeY);
                break;
            case "node":
                updatedModel.diagram.nodes[uid] = await diagramController.createNode(uid, this.placeX, this.placeY);
                break;
            default:
                break;
        }
        this.update(updatedModel);
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
        anchor.style.transform = `translate(${this.x}px, ${this.y}px) scale(${scale})`;
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
        return cursor;
    }
    
    override render(){
        const view = html`
            ${new EditorHeader(this.model.diagram.name, this.model.diagram.uid)}
            <div cursor="${this.getCursorType()}" class="canvas js-canvas" @mousedown=${this.handleMouseDown} @mouseup=${this.handleMouseUp} @mousemove=${this.handleMouseMove} @contextmenu=${this.handleContextMenu}>
                <div data-scale="${this.scale}" data-top="${this.y}" data-left="${this.x}" style="transform: translate(${this.x}px, ${this.y}px) scale(${this.scale});" class="diagram js-anchor">
                    ${Object.keys(this.model.diagram.tables).map((key:string, index:number) => {
                        return new TableComponent(this.model.diagram.tables[key], this.model.diagram.uid);
                    })}
                    ${Object.keys(this.model.diagram.nodes).map(key => {
                        return new NodeComponent(this.model.diagram.nodes[key], this.model.diagram.uid);
                    })}
                </div>
            </div>
            ${new EditorControls(this.isMoving, this.scale, this.toggleMoveCallback.bind(this), this.scaleCallback.bind(this))}
            ${new CanvasComponent()}
        `;
        render(view, this);
    }
}
mount("editor-page", EditorPage);
