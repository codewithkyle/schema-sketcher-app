import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import EditorHeader from "~components/editor-header/editor-header";
import diagramController from "~controllers/diagram-controller";
import { css, mount } from "~controllers/env";
import { Diagram } from "~types/app";

interface IEditorPage {
    diagram: Diagram,
    x: number,
    y: number,
    scale: number,
}
export default class EditorPage extends SuperComponent<IEditorPage>{
    private uid:string;
    private isMoving: boolean;
    private startX: number;
    private startY: number;

    constructor(tokens, params){
        super();
        this.model = {
            diagram: null,
            x: window.innerWidth / 2,
            y: (window.innerHeight - 64) / 2,
            scale: 1,
        };
        this.uid = tokens.UID;
        this.isMoving = false;
    }

    override async connected(){
        window.addEventListener("mousewheel", this.handleScroll.bind(this), {capture: true});
        await css(["editor-page"]);
        const { ops, diagram } = await diagramController.loadDiagram(this.uid);
        this.update({
            diagram: diagram,
        });
    }

    private handleScroll:EventListener = (e:WheelEvent) => {
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
        anchor.style.transform = `translate(${this.model.x}px, ${this.model.y}px) scale(${scale})`;
        anchor.dataset.scale = `${scale}`;
        this.update({
            scale: scale,
        });
    }

    private updateName(newName:string){
        diagramController.renameDiagram(this.uid, newName);
    }

    private handleMouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
        }
    }

    private handleMouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = false;
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            this.update({
                x: parseInt(anchor.dataset.left),
                y: parseInt(anchor.dataset.top),
            });
        }
    }

    private handleMouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            const moveX = this.startX - e.clientX;
            const moveY = this.startY - e.clientY;
            const x = parseInt(anchor.dataset.left) - moveX;
            const y = parseInt(anchor.dataset.top) - moveY;
            anchor.style.transform = `translate(${x}px, ${y}px) scale(${this.model.scale})`;
            anchor.dataset.top = `${y}`;
            anchor.dataset.left = `${x}`;
            this.startX = e.clientX;
            this.startY = e.clientY;
        }
    }

    private handleContextMenu:EventListener = (e:MouseEvent) => {
        e.preventDefault();
        if (e instanceof MouseEvent){
            const x = e.clientX;
            const y = e.clientY;
        }
    }
    
    override render(){
        const view = html`
            ${new EditorHeader(this.model.diagram.name, this.updateName.bind(this))}
            <div class="canvas" @mousedown=${this.handleMouseDown} @mouseup=${this.handleMouseUp} @mousemove=${this.handleMouseMove} @contextmenu=${this.handleContextMenu}>
                <div data-scale="${this.model.scale}" data-top="${this.model.y}" data-left="${this.model.x}" style="transform: translate(${this.model.x}px, ${this.model.y}px) scale(${this.model.scale});" class="diagram js-anchor">
                    <div class="bg-white shadow-md" style="width:100px;height:100px;"></div>
                </div>
            </div>
        `;
        render(view, this);
    }
}
mount("editor-page", EditorPage);