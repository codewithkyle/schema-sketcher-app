import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import EditorHeader from "~components/editor-header/editor-header";
import diagramController from "~controllers/diagram-controller";
import { css, mount } from "~controllers/env";
import { Diagram } from "~types/diagram";
import ContextMenu from "~components/context-menu/context-menu";
import { v4 as uuid} from "uuid";
import TableComponent from "~components/table-component/table-component";

const COLORS = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "light-blue", "indigo", "violet", "purple", "pink", "rose"];
const SHADES = ["200", "300", "400", "500", "600"];

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
    }

    override async connected(){
        window.addEventListener("mousewheel", this.handleScroll.bind(this), {capture: true, passive: true});
        window.addEventListener("keydown", this.handleKeyDown);
        window.addEventListener("keyup", this.handleKeyUp);
        await css(["editor-page"]);
        const { ops, diagram } = await diagramController.loadDiagram(this.uid);
        this.update({
            diagram: diagram,
        });
    }

    private getRandomColor():string{
        const color = this.getRandomInt(0, COLORS.length - 1);
        const shade = this.getRandomInt(0, SHADES.length - 1);
        return `var(--${COLORS[color]}-${SHADES[shade]})`;
    }

    private getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
    }

    private updateName(newName:string){
        diagramController.renameDiagram(this.uid, newName);
        const updatedModel = {...this.model};
        updatedModel.diagram.name = newName;
        this.update(updatedModel);
    }

    private handleMouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.canMove){
            this.isMoving = true;
            this.startX = e.clientX;
            this.startY = e.clientY;
            this.setCursor("grabbing");
        }
    }

    private handleMouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = false;
            const anchor = this.querySelector(".js-anchor") as HTMLElement;
            this.x = parseInt(anchor.dataset.left);
            this.y = parseInt(anchor.dataset.top);
        }
    }

    private handleMouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving && this.canMove){
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

    private spawn(type:"table"|"node"){
        const uid = uuid();
        const updatedModel = {...this.model};
        switch(type){
            case "table":
                const tableCount = Object.keys(updatedModel.diagram.tables).length + 1;
                const columnUid = uuid();
                updatedModel.diagram.tables[uid] = {
                    name: `table_${tableCount}`,
                    color: this.getRandomColor(),
                    x: this.placeX,
                    y: this.placeY,
                    columns: {
                        [columnUid]: {
                            name: "id",
                            type: "int",
                            isNullable: false,
                            isUnique: false,
                            isIndex: false,
                            isPrimaryKey: true,
                            order: 0,
                            uid: columnUid,
                        },
                    },
                };
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
    
    override render(){
        const view = html`
            ${new EditorHeader(this.model.diagram.name, this.updateName.bind(this))}
            <div class="canvas js-canvas" @mousedown=${this.handleMouseDown} @mouseup=${this.handleMouseUp} @mousemove=${this.handleMouseMove} @contextmenu=${this.handleContextMenu}>
                <div data-scale="${this.scale}" data-top="${this.y}" data-left="${this.x}" style="transform: translate(${this.x}px, ${this.y}px) scale(${this.scale});" class="diagram js-anchor">
                    ${Object.keys(this.model.diagram.tables).map((key:string, index:number) => {
                        return new TableComponent(this.model.diagram.tables[key]);
                    })}
                </div>
            </div>
        `;
        render(view, this);
    }
}
mount("editor-page", EditorPage);