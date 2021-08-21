import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import ColumnComponent from "./column-component/column-component";
import { css, mount } from "~controllers/env";
import { publish, subscribe } from "~lib/pubsub";
import type { Column, Table } from "~types/diagram";
import cc from "~controllers/control-center";
import diagramController from "~controllers/diagram-controller";
import db from "~lib/jsql";
import { setValueFromKeypath, unsetValueFromKeypath } from "~utils/sync";

interface ITableComponent extends Table {
    showAllColumnOptions: boolean;
}
export default class TableComponent extends SuperComponent<ITableComponent>{
    private prevX: number;
    private prevY: number;
    private isMoving: boolean;
    private movingColumnUID: string;
    private focusLastColumn: boolean;
    private diagramID: string;
    private wasMoved: boolean;

    constructor(data:Table, diagramID:string){
        super();
        this.wasMoved = false;
        this.focusLastColumn = false;
        this.prevX = data.x;
        this.prevY = data.y;
        this.isMoving = false;
        this.diagramID = diagramID;
        this.model = {...data, ...{
            showAllColumnOptions: false,
        }};
        subscribe("sync", this.syncInbox.bind(this));
    }

    private syncInbox(e){
        if (e.table === "tables" && e.key === this.model.uid){
            const updatedModel = {...this.model};
            let doUpdate = false;
            switch(e.op){
                case "UNSET":
                    unsetValueFromKeypath(updatedModel, e.keypath);
                    doUpdate = true;
                    break;
                case "SET":
                    setValueFromKeypath(updatedModel, e.keypath, e.value);
                    doUpdate = true;
                    break;
                case "DELETE":
                    this.remove();
                    break;
                default:
                    break;
            }
            if (doUpdate){
                this.update(updatedModel);
            }
        }
        else if (e.table === "columns" && e.op === "INSERT"){
            const column = new ColumnComponent(e.value, this.model.showAllColumnOptions, this.model.uid);
            const container = this.querySelector("columns-container");
            container.appendChild(column);
        }
    }

    override async connected(){
        this.tabIndex = 0;
        this.setAttribute("aria-label", `use arrow keys to nudge table ${this.model.name}`);
        document.addEventListener("keydown", this.handleKeyboard);
        document.addEventListener("mousemove", this.mouseMove);
        await css(["table-component", "overflow-menu"]);
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
            ref: this.model.uid,
        });
    }

    private async confirmDelete(){
        const doDelete = confirm(`Are you sure you want to delete table ${this.model.name}?`);
        if (doDelete){
            await diagramController.deleteTable(this.model.uid);
            this.remove();
        }
    }

    private broadcastMove(x:number, y: number){
        if (this.wasMoved){
            const op1 = cc.set("tables", this.model.uid, "x", x);
            const op2 = cc.set("tables", this.model.uid, "y", y);
            const op = cc.batch("tables", this.model.uid, [op1, op2]);
            cc.perform(op);
        }
    }

    private move(x:number, y:number){
        this.style.transform = `translate(${x}px, ${y}px)`;
        this.dataset.top = `${y}`;
        this.dataset.left = `${x}`;
    }

    private mouseDown:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent){
            this.isMoving = true;
            this.wasMoved = false;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
        }
    }

    private mouseUp:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            this.prevX = parseInt(this.dataset.left);
            this.prevY = parseInt(this.dataset.top);
            this.broadcastMove(this.prevX, this.prevY);
            this.isMoving = false;
            this.wasMoved = false;
        }
    }

    private mouseMove:EventListener = (e:MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving){
            const moveX = this.prevX - e.clientX;
            const moveY = this.prevY - e.clientY;
            const x = parseInt(this.dataset.left) - moveX;
            const y = parseInt(this.dataset.top) - moveY;
            this.move(x, y);
            this.wasMoved = true;
            this.prevX = e.clientX;
            this.prevY = e.clientY;
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
                        console.log("Duplicate table");
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
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
                this.broadcastMove(x, y);
            }
            else if (moveY) {
                const x = parseInt(this.dataset.left);
                const y = parseInt(this.dataset.top) + direction;
                this.wasMoved = true;
                this.move(x, y);
                this.prevX = x;
                this.prevY = y;
                this.broadcastMove(x, y);
            }
        }
    }

    private renameTable:EventListener = (e:Event) => {
        // @ts-ignore
        document.activeElement?.blur();
        const newName = prompt(`New name for table ${this.model.name}?`);
        if (newName.length){
            this.update({
                name: newName,
            });
            const op = cc.set("tables", this.model.uid, "name", newName);
            cc.perform(op);
        }
    }

    private deleteTable:EventListener = (e:Event) => {
        // @ts-ignore
        document.activeElement?.blur();
        this.confirmDelete();
    }

    private addColumn = async (focusColumn) => {
        await diagramController.createColumn(this.model.uid);
        // @ts-ignore
        document.activeElement?.blur();
        if (typeof focusColumn === "boolean" && focusColumn === true){
            this.focusLastColumn = true;
        }
    }

    private noop:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
    }

    private startMoveCallback(uid:string){
        this.movingColumnUID = uid;
    }

    private moveCallback(toUID: string){
        // if (!this.movingColumnUID || !toUID){
        //     return;
        // }
        // const updatedModel = {...this.model};
        // let newIndex = updatedModel.columns[toUID].order;
        // if (newIndex >= Object.keys(updatedModel.columns).length - 1){
        //     newIndex = Object.keys(updatedModel.columns).length;
        // } else if (newIndex === updatedModel.columns[this.movingColumnUID].order + 1){
        //     newIndex = newIndex + 1;
        // } else if (newIndex < 0) {
        //     newIndex = 0;
        // }
        // let columns = new Array(Object.keys(updatedModel.columns).length).fill(null);
        // for (const key in updatedModel.columns){
        //     if (key !== this.movingColumnUID){
        //         columns.splice(updatedModel.columns[key].order, 1, key);
        //     }
        // }
        // columns.splice(newIndex, 0, this.movingColumnUID);
        // for (let i = columns.length - 1; i >= 0; i--){
        //     if (columns[i] === null){
        //         columns.splice(i, 1);
        //     }
        // }
        // const ops = [];
        // for (let i = 0; i < columns.length; i++){
        //     updatedModel.columns[columns[i]].order = i;
        //     const op = cc.set("diagrams", this.diagramID, `tables.${this.model.uid}.columns.${columns[i]}.order`, i);
        //     ops.push(op);
        // }
        // const op = cc.batch("diagrams", this.diagramID, ops);
        // cc.perform(op);
        // this.movingColumnUID = null;
        // this.update(updatedModel);
    }

    private toggleColumnSettings:EventListener = () => {
        // @ts-ignore
        document.activeElement?.blur();
        if (this.model.showAllColumnOptions){
            this.update({
                showAllColumnOptions: false,
            });
        }
        else {
            this.update({
                showAllColumnOptions: true,
            });
        }
    }

    override async render(){
        this.style.transform = `translate(${this.prevX}px, ${this.prevY}px)`;
        this.dataset.top = `${this.prevY}`;
        this.dataset.left = `${this.prevX}`;
        this.dataset.uid = this.model.uid;
        const orderedColumns = await db.query("SELECT * FROM columns WHERE diagramID = $diagramID AND tableID = $tableID ORDER BY weight", {
            diagramID: this.diagramID,
            tableID: this.model.uid,
        });
        const view = html`
            <header style="border-top-color: ${this.model.color};" @mousedown=${this.mouseDown} @mouseup=${this.mouseUp} @mouseenter=${this.handleMouseEnter} @mouseleave=${this.handleMouseLeave}>
                <h4 title="${this.model.name}">${this.model.name}</h4>
                <overflow-button @mousedown=${this.noop}>
                    <button>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                    <overflow-menu>
                        <button @click=${this.renameTable}>
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </i>
                            Rename table
                        </button>
                        <button @click=${this.addColumn}>
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </i>
                            Add column
                        </button>
                        <button @click=${this.toggleColumnSettings}>
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </i>
                            Column settings
                        </button>
                        <hr>
                        <button color="danger" @click=${this.deleteTable}>
                            <i>
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </i>
                            Delete table
                        </button>
                    </overflow-menu>
                </overflow-button>
            </header>
            <columns-container>
                ${orderedColumns.map((column) => {
                    return new ColumnComponent(column, this.model.showAllColumnOptions, this.model.uid);
                })}
            </columns-container>
        `;
        render(view, this);
    }

    override updated(){
        setTimeout(()=>{
            if (this.focusLastColumn){
                this.focusLastColumn = false;
                // @ts-ignore
                this.querySelector("column-component:last-of-type input")?.focus();
            }
        }, 80);
    }
}
mount("table-component", TableComponent);
