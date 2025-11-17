import { html, render } from "lit-html";
import ColumnComponent from "./column-component/column-component";
import env from "~brixi/controllers/env";
import { publish, subscribe } from "~lib/pubsub";
import type { Column, Table } from "~types/diagram";
import diagramController from "~controllers/diagram-controller";
import Component from "~brixi/component";
import { parseDataset } from "~brixi/utils/general";
import "~/brixi/components/overflow-button/overflow-button";
import Sortable from "sortablejs";
import ContextMenu from "~brixi/components/context-menu/context-menu";

interface ITableComponent extends Table {
}
export default class TableComponent extends Component<ITableComponent> {
    private firstRender: boolean;
    private isMoving: boolean;
    private diagramID: string;
    private wasMoved: boolean;
    private zoom: number;
    private pos1: number;
    private pos2: number;
    private pos3: number;
    private pos4: number;

    constructor() {
        super();
        this.firstRender = true;
        this.zoom = 1;
        this.wasMoved = false;
        this.pos1 = 0;
        this.pos2 = 0;
        this.pos3 = 0;
        this.pos4 = 0;
        this.isMoving = false;
        this.model = {
            uid: "",
            name: "",
            color: "",
            x: 0,
            y: 0,
        };
        subscribe("move", this.moveInbox.bind(this));
        subscribe("zoom", this.zoomInbox.bind(this));
        subscribe("diagram", this.diagramInbox.bind(this));
    }

    private diagramInbox({type,data}){
        switch(type){
            case "reset":
                this.remove();
                break;
            default:
                break;
        }
    }

    static get observedAttributes() {
        return ["data-uid"];
    }

    private zoomInbox(zoom) {
        this.zoom = zoom;
    }

    private moveInbox({ x, y, uid }) {
        if (uid === this.model.uid) {
            this.move(x, y);
        }
    }

    override async connected() {
        this.tabIndex = 0;
        this.setAttribute("aria-label", `use arrow keys to nudge table ${this.model.name}`);
        window.addEventListener("keydown", this.handleKeyboard, { passive: false, capture: true });
        window.addEventListener("mousemove", this.mouseMove, { passive: false, capture: true });
        window.addEventListener("mouseup", this.mouseUp, { passive: true, capture: true });
        await env.css(["table-component", "overflow-menu"]);
        const settings = parseDataset(this.dataset, this.model);
        const table = diagramController.getTable(settings.uid);
        this.pos1 = table.x;
        this.pos2 = table.y;
        this.dataset.left = `${this.pos1}`;
        this.dataset.top = `${this.pos2}`;
        this.firstRender = true;
        this.set(table);
    }

    private handleMouseEnter: EventListener = (e: Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        publish("canvas", {
            type: "highlight",
            ref: this.model.uid,
        });
    };

    private handleMouseLeave: EventListener = (e: Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        publish("canvas", {
            type: "clear-highlight",
            ref: this.model.uid,
        });
    };

    private move(x: number, y: number) {
        this.style.transform = `translate(${x}px, ${y}px)`;
        this.dataset.top = `${y}`;
        this.dataset.left = `${x}`;
        diagramController.updateTablePosition(this.model.uid, x, y);
    }

    private mouseDown: EventListener = (e: MouseEvent | TouchEvent) => {
        this.isMoving = true;
        if (e instanceof MouseEvent) {
            this.pos3 = e.clientX;
            this.pos4 = e.clientY;
        } else if (e instanceof TouchEvent) {
            this.pos3 = e.touches[0].clientX;
            this.pos4 = e.touches[0].clientY;
        }
    };

    private mouseUp: EventListener = (e: MouseEvent) => {
        if (e instanceof MouseEvent && this.isMoving) {
            this.isMoving = false;
            this.wasMoved = false;
        }
    };

    private mouseMove: EventListener = (e: MouseEvent | TouchEvent) => {
        if (this.isMoving) {
            e.preventDefault();
            if (e instanceof MouseEvent) {
                this.pos1 = this.pos3 - e.clientX;
                this.pos2 = this.pos4 - e.clientY;
                this.pos3 = e.clientX;
                this.pos4 = e.clientY;
            } else if (e instanceof TouchEvent) {
                this.pos1 = this.pos3 - e.touches[0].clientX;
                this.pos2 = this.pos4 - e.touches[0].clientY;
                this.pos3 = e.touches[0].clientX;
                this.pos4 = e.touches[0].clientY;
            } else {
                return;
            }
            this.wasMoved = true;
            let left = Math.round(parseInt(this.dataset.left) - this.pos1 / this.zoom);
            let top = Math.round(parseInt(this.dataset.top) - this.pos2 / this.zoom);
            this.move(left, top);
        }
    };

    private handleKeyboard: EventListener = (e: KeyboardEvent) => {
        if (e instanceof KeyboardEvent && document.activeElement === this) {
            e.preventDefault();
            let moveX = false;
            let moveY = false;
            let direction = 0;
            switch (e.key) {
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
                    diagramController.deleteTable(this.model.uid);
                    this.remove();
                    break;
                case "d":
                    if (e.ctrlKey || e.metaKey) {
                        diagramController.cloneTable(this.model.uid);
                    }
                    break;
                default:
                    break;
            }
            if (e.shiftKey) {
                direction *= 10;
            }
            if (moveX) {
                const x = parseInt(this.dataset.left) + direction;
                const y = parseInt(this.dataset.top);
                this.wasMoved = true;
                this.move(x, y);
                this.pos1 = x;
                this.pos2 = y;
            } else if (moveY) {
                const x = parseInt(this.dataset.left);
                const y = parseInt(this.dataset.top) + direction;
                this.wasMoved = true;
                this.move(x, y);
                this.pos1 = x;
                this.pos2 = y;
            }
        }
    };

    private renameTable: EventListener = (e: Event) => {
        // @ts-ignore
        document.activeElement?.blur();
        const newName = prompt(`New name for table ${this.model.name}?`);
        if (newName.length) {
            this.set({
                name: newName,
            });
            diagramController.renameTable(this.model.uid, newName);
        }
    };

    private handleContextMenu:EventListener = (e:MouseEvent) => {
        e.preventDefault();
        if (e instanceof MouseEvent){
            const x = e.clientX;
            const y = e.clientY;
            document.body.querySelectorAll("brixi-context-menu").forEach((el) => el.remove());
            new ContextMenu({
                items: [
                    {
                        label: "Rename",
                        callback: () => {
                            const newName = prompt(`New name for table ${this.model.name}?`);
                            if (newName.length) {
                                this.set({
                                    name: newName,
                                });
                                diagramController.renameTable(this.model.uid, newName);
                            }
                        }
                    },
                    {
                        label: "Duplicate",
                        hotkey: "Ctrl+d",
                        callback: () => {
                            diagramController.cloneTable(this.model.uid);
                        },
                    },
                    {
                        label: "Add column",
                        callback: () => {
                            diagramController.createColumn(this.model.uid);
                            this.render();
                            this.focusLastColumn();
                        },
                    },
                    {
                        label: "Change color",
                        callback: () => {
                            const colorInput = document.createElement("input");
                            colorInput.type = "color";
                            colorInput.value = this.model.color;
                            colorInput.onchange = (e) => {
                                this.set({
                                    color: colorInput.value,
                                });
                                diagramController.changeTableColor(this.model.uid, colorInput.value);
                            };
                            colorInput.click();
                        },
                    },
                    null,
                    {
                        label: "Delete",
                        hotkey: "delete",
                        callback: () => {
                            diagramController.deleteTable(this.model.uid);
                            this.remove();
                        },
                    },
                ],
                x: x, 
                y: y,
            });
        }
    }

    public focusLastColumn() {
        setTimeout(() => {
            const input = this.querySelector('column-component:last-of-type input') as HTMLInputElement;
            if (input){
                // @ts-ignore
                document.activeElement?.blur();
                input.focus();
            }
        }, 80);
    }

    override async render() {
        this.style.transform = `translate(${this.dataset.left}px, ${this.dataset.top}px)`;
        const view = html`
            <header style="border-top-color: ${this.model.color};" @mousedown=${this.mouseDown} @mouseenter=${this.handleMouseEnter} @mouseleave=${this.handleMouseLeave} @contextmenu=${this.handleContextMenu}>
            <h4 @dblclick=${this.renameTable} title="${this.model.name}">${this.model.name}</h4>
            </header>
            <columns-container></columns-container>
        `;
        render(view, this);
        if (this.firstRender) {
            this.firstRender = false;
            new Sortable(this.querySelector("columns-container"), {
                animation: 150,
                group: "columns",
                ghostClass: "is-disabled",
                onUpdate: (e) => {
                    //let columns = diagramController.getColumnsByTable(this.model.uid);
                    //const column = columns.splice(e.oldIndex, 1)[0];
                    //columns.splice(e.newIndex, 0, column);
                    diagramController.reorderColumns(this.model.uid);
                },
                onAdd: (e) => {
                    diagramController.moveColumn(e.item.dataset.uid, this.model.uid);
                    e.item.updateData();
                },
                onRemove: (e) => {
                    if (Array.from(this.querySelectorAll("column-component")).length === 0) {
                        diagramController.deleteTable(this.model.uid);
                        this.remove();
                    }
                }
            });
        }
        const columnsContainer = this.querySelector("columns-container");
        diagramController.getColumnsByTable(this.model.uid).map((column: Column) => {
            const el:ColumnComponent = columnsContainer.querySelector(`column-component[data-uid="${column.uid}"]`) || new ColumnComponent();
            if (!el.isConnected) {
                el.dataset.uid = column.uid;
                columnsContainer.appendChild(el);
            }
        });
    }
}
env.bind("table-component", TableComponent);
