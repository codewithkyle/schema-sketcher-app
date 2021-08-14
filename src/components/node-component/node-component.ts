import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import { css, mount } from "~controllers/env";
import { Node } from "~types/diagram";

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
        this.render();
    }

    private confirmDelete(){
        const doDelete = confirm(`Are you sure you want to delete this node?`);
        if (doDelete){
            this.remove();
        }
    }

    private handleKeyboard:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent && document.activeElement === this){
            e.preventDefault();
            e.stopImmediatePropagation();
            let moveX = false;
            let moveY = false;
            let direction = 0;
            switch(e.key){
                case "ArrowUp":
                    moveY = true;
                    direction = -1;
                    break;
                case "ArrowDown":
                    moveY = true;
                    direction = 1;
                    break;
                case "ArrowLeft":
                    moveX = true;
                    direction = -1;
                    break;
                case "ArrowRight":
                    moveX = true;
                    direction = 1;
                    break;
                case "Delete":
                    this.confirmDelete();
                    break;
                case "d":
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
                this.style.transform = `translate(${x}px, ${y}px)`;
                this.style.transform = `translate(${x}px, ${y}px)`;
                this.dataset.top = `${y}`;
                this.dataset.left = `${x}`;
                this.prevX = x;
                this.prevY = y;
            }
            else if (moveY) {
                const x = parseInt(this.dataset.left);
                const y = parseInt(this.dataset.top) + direction;
                this.style.transform = `translate(${x}px, ${y}px)`;
                this.style.transform = `translate(${x}px, ${y}px)`;
                this.dataset.top = `${y}`;
                this.dataset.left = `${x}`;
                this.prevX = x;
                this.prevY = y;
            }
        }
    }

    private handleInput:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        const vlaue = target.value;
        const metrics = this.ctx.measureText(vlaue);
        let newWidth = metrics.width;
        if (newWidth < 100){
            newWidth = 100;
        }
        target.style.width = `${newWidth}px`;
    }

    private mouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = true;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    private mouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = false;
            this.prevX = parseInt(this.dataset.left);
            this.prevY = parseInt(this.dataset.top);
        }
    }

    private mouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            const moveX = this.prevX - e.clientX;
            const moveY = this.prevY - e.clientY;
            const x = parseInt(this.dataset.left) - moveX;
            const y = parseInt(this.dataset.top) - moveY;
            this.style.transform = `translate(${x}px, ${y}px)`;
            this.dataset.top = `${y}`;
            this.dataset.left = `${x}`;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    override render(){
        this.style.transform = `translate(${this.prevX}px, ${this.prevY}px)`;
        this.dataset.top = `${this.prevY}`;
        this.dataset.left = `${this.prevX}`;
        this.tabIndex = 0;
        this.setAttribute("aria-label", `use arrow keys to nudge node`);
        const view = html`
            <button color="${this.model.color}" class="font-${this.model.color}-600">
                <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="function" class="svg-inline--fa fa-function fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M288.73 320c0-52.34 16.96-103.22 48.01-144.95 5.17-6.94 4.45-16.54-2.15-22.14l-24.69-20.98c-7-5.95-17.83-5.09-23.38 2.23C246.09 187.42 224 252.78 224 320c0 67.23 22.09 132.59 62.52 185.84 5.56 7.32 16.38 8.18 23.38 2.23l24.69-20.99c6.59-5.61 7.31-15.2 2.15-22.14-31.06-41.71-48.01-92.6-48.01-144.94zM224 16c0-8.84-7.16-16-16-16h-48C102.56 0 56 46.56 56 104v64H16c-8.84 0-16 7.16-16 16v48c0 8.84 7.16 16 16 16h40v128c0 13.2-10.8 24-24 24H16c-8.84 0-16 7.16-16 16v48c0 8.84 7.16 16 16 16h16c57.44 0 104-46.56 104-104V248h40c8.84 0 16-7.16 16-16v-48c0-8.84-7.16-16-16-16h-40v-64c0-13.2 10.8-24 24-24h48c8.84 0 16-7.16 16-16V16zm353.48 118.16c-5.56-7.32-16.38-8.18-23.38-2.23l-24.69 20.98c-6.59 5.61-7.31 15.2-2.15 22.14 31.05 41.71 48.01 92.61 48.01 144.95 0 52.34-16.96 103.23-48.01 144.95-5.17 6.94-4.45 16.54 2.15 22.14l24.69 20.99c7 5.95 17.83 5.09 23.38-2.23C617.91 452.57 640 387.22 640 320c0-67.23-22.09-132.59-62.52-185.84zm-54.17 231.9L477.25 320l46.06-46.06c6.25-6.25 6.25-16.38 0-22.63l-22.62-22.62c-6.25-6.25-16.38-6.25-22.63 0L432 274.75l-46.06-46.06c-6.25-6.25-16.38-6.25-22.63 0l-22.62 22.62c-6.25 6.25-6.25 16.38 0 22.63L386.75 320l-46.06 46.06c-6.25 6.25-6.25 16.38 0 22.63l22.62 22.62c6.25 6.25 16.38 6.25 22.63 0L432 365.25l46.06 46.06c6.25 6.25 16.38 6.25 22.63 0l22.62-22.62c6.25-6.25 6.25-16.38 0-22.63z"></path></svg>
            </button>
            <input value="${this.model.text}" type="text" @input=${this.handleInput}>
        `;
        render(view, this);
    }
}
mount("node-component", NodeComponent);