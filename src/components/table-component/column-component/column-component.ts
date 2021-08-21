import db from "@codewithkyle/jsql";
import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import ConnectorComponent from "~components/connector-component/connector-component";
import { css, mount } from "~controllers/env";
import { publish } from "~lib/pubsub";
import type { Column } from "~types/diagram";
import type { SelectOption } from "~types/general";


interface IColumnComponent extends Column{
    renderAllOptions: boolean,
    columnTypes: Array<SelectOption>,
}
export default class ColumnComponent extends SuperComponent<IColumnComponent>{
    private moveCallback:Function;
    private startMoveCallback:Function;
    private addColumnCallback:Function;
    private diagramID: string;
    private tableUID: string;

    constructor(data:Column, moveCallback:Function, startMoveCallback:Function, renderAllOptions:boolean, addColumnCallback:Function, diagramID:string, tableUID:string){
        super();
        this.moveCallback = moveCallback;
        this.startMoveCallback = startMoveCallback;
        this.addColumnCallback = addColumnCallback;
        this.diagramID = diagramID;
        this.tableUID = tableUID;
        this.model = {...data, ...{
            renderAllOptions: renderAllOptions,
            columnTypes: [],
        }};
    }

    override async connected(){
        this.addEventListener("mouseenter", this.handleMouseEnter);
        this.addEventListener("mouseleave", this.handleMouseLeave);
        await css(["column-component"]);
        // @ts-ignore
        const types = await db.query("SELECT types FROM diagrams WHERE uid = $uid", {
            uid: this.diagramID,
        });
        Object.keys(types[0].types).map(key => {
            this.model.columnTypes.push({
                label: types[0].types[key],
                value: key
            });
        });
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

    private handleDragStart:EventListener = (e:DragEvent) => {
        if (e instanceof DragEvent){
            e.preventDefault();
            this.classList.add("is-disabled");
            this.startMoveCallback(this.model.uid);
        }
    }

    private handleDragEnd:EventListener = (e:DragEvent) => {
        if (e instanceof DragEvent){
            e.preventDefault();
            this.classList.remove("is-disabled");
        }
    }

    private handleDragOver:EventListener = (e:DragEvent) => {
        if (e instanceof DragEvent){
            e.preventDefault();
            this.classList.add("is-drop-target");
        }
    }

    private handleDragLeave:EventListener = (e:DragEvent) => {
        if (e instanceof DragEvent){
            e.preventDefault();
            this.classList.remove("is-drop-target");
        }
    }

    private handleDrop:EventListener = (e:DragEvent) => {
        if (e instanceof DragEvent){
            e.preventDefault();
            this.moveCallback(this.model.uid);
        }
    }

    private handleNameInput:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        if (target.value){
            this.update({
                name: target.value,
            });
        }
    }

    private toggleOption:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        switch(target.dataset.type){
            case "primary":
                this.update({
                    isPrimaryKey: this.model.isPrimaryKey ? false : true,
                });
                break;
            case "unique":
                this.update({
                    isUnique: this.model.isUnique ? false : true,
                });
                break;
            case "index":
                this.update({
                    isIndex: this.model.isIndex ? false : true,
                });
                break;
        }
    }

    private deleteColumn:EventListener = (e:Event) => {
        this.remove();
    }

    private handleKeyboard:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent && e.metaKey || e.ctrlKey){
            switch(e.key){
                case "Enter":
                    e.preventDefault();
                    this.addColumnCallback(true);
                    return false;
                case "Delete":
                    e.preventDefault();
                    this.remove();
                    return false;
                case "p":
                    e.preventDefault();
                    this.update({
                        isPrimaryKey: this.model.isPrimaryKey ? false : true,
                    });
                    return false;
                case "u":
                    e.preventDefault();
                    this.update({
                        isUnique: this.model.isUnique ? false : true,
                    });
                    return false;
                case "i":
                    e.preventDefault();
                    this.update({
                        isIndex: this.model.isIndex ? false : true,
                    });
                    return false;
                default:
                    break;
            }
        }
    }

    private renderPrimaryKey(){
        let output;
        if (this.model.renderAllOptions || this.model.isPrimaryKey){
            output = html`
                <button @click=${this.toggleOption} data-type="primary" ?disabled=${!this.model.renderAllOptions} class="${this.model.isPrimaryKey && this.model.renderAllOptions ? "is-active" : ""}">
                    <svg tooltip="Primary key" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M336 32c79.529 0 144 64.471 144 144s-64.471 144-144 144c-18.968 0-37.076-3.675-53.661-10.339L240 352h-48v64h-64v64H32v-80l170.339-170.339C195.675 213.076 192 194.968 192 176c0-79.529 64.471-144 144-144m0-32c-97.184 0-176 78.769-176 176 0 15.307 1.945 30.352 5.798 44.947L7.029 379.716A24.003 24.003 0 0 0 0 396.686V488c0 13.255 10.745 24 24 24h112c13.255 0 24-10.745 24-24v-40h40c13.255 0 24-10.745 24-24v-40h19.314c6.365 0 12.47-2.529 16.971-7.029l30.769-30.769C305.648 350.055 320.693 352 336 352c97.184 0 176-78.769 176-176C512 78.816 433.231 0 336 0zm48 108c11.028 0 20 8.972 20 20s-8.972 20-20 20-20-8.972-20-20 8.972-20 20-20m0-28c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z"></path></svg>
                </button>
            `;
        }
        else {
            output = "";
        }
        return output;
    }

    private renderUnique(){
        let output;
        if (this.model.renderAllOptions || this.model.isUnique){
            output = html`
                <button @click=${this.toggleOption} data-type="unique" ?disabled=${!this.model.renderAllOptions} class="${this.model.isUnique && this.model.renderAllOptions ? "is-active" : ""}">
                    <svg tooltip="Unique" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M388.1 333.5l52.7-14.3c4.2-1.1 6.7-5.5 5.6-9.8l-4.1-15.5c-1.1-4.3-5.5-6.8-9.7-5.7l-83.2 22.6-93.8-54.8 93.8-54.8 83.2 22.6c4.2 1.1 8.6-1.4 9.7-5.7l4.1-15.5c1.1-4.3-1.4-8.7-5.6-9.8l-52.7-14.3 55.9-32.7c3.8-2.2 5.1-7.1 2.9-10.9L439 121c-2.2-3.8-7-5.1-10.8-2.9l-55.9 32.7 14.1-53.3c1.1-4.3-1.4-8.7-5.6-9.8l-15.3-4.1c-4.2-1.1-8.6 1.4-9.7 5.7l-22.3 84.2-93.8 54.8V118.6l61-61.6c3.1-3.1 3.1-8.2 0-11.3l-11.2-11.3c-3.1-3.1-8.1-3.1-11.2 0l-38.6 39V8c0-4.4-3.5-8-7.9-8H216c-4.4 0-7.9 3.6-7.9 8v65.4l-38.6-39c-3.1-3.1-8.1-3.1-11.2 0l-11.2 11.3c-3.1 3.1-3.1 8.2 0 11.3l60.9 61.7v109.7l-93.8-54.8-22.1-84.4c-1.1-4.3-5.5-6.8-9.7-5.7l-15.3 4.1c-4.2 1.1-6.7 5.5-5.6 9.8l14.1 53.3L19.7 118c-3.8-2.2-8.6-.9-10.8 2.9L1 134.8c-2.2 3.8-.9 8.7 2.9 10.9l55.9 32.7-52.6 14.4c-4.2 1.1-6.7 5.5-5.6 9.8l4.1 15.5c1.1 4.3 5.5 6.8 9.7 5.7l83.2-22.6 93.8 54.8-93.8 54.8-83.2-22.6c-4.2-1.1-8.6 1.4-9.7 5.7l-4.1 15.5c-1.1 4.3 1.4 8.7 5.6 9.8l52.7 14.3L4 366.1c-3.8 2.2-5.1 7.1-2.9 10.9L9 390.9c2.2 3.8 7 5.1 10.8 2.9l55.9-32.7-14.1 53.3c-1.1 4.3 1.4 8.7 5.6 9.8l15.3 4.1c4.2 1.1 8.6-1.4 9.7-5.7l22.3-84.2 93.8-54.8v109.7l-61 61.7c-3.1 3.1-3.1 8.2 0 11.3l11.2 11.3c3.1 3.1 8.1 3.1 11.2 0l38.6-39V504c0 4.4 3.5 8 7.9 8H232c4.4 0 7.9-3.6 7.9-8v-65.4l38.6 39c3.1 3.1 8.1 3.1 11.2 0l11.2-11.3c3.1-3.1 3.1-8.2 0-11.3L240 393.3V283.7l93.8 54.8 22.3 84.2c1.1 4.3 5.5 6.8 9.7 5.7l15.3-4.1c4.2-1.1 6.7-5.5 5.6-9.8l-14.1-53.3 55.9 32.7c3.8 2.2 8.6.9 10.8-2.9l7.9-13.9c2.2-3.8.9-8.7-2.9-10.9l-56.2-32.7z"></path></svg>
                </button>
            `;
        }
        else {
            output = "";
        }
        return output;
    }

    private renderIndex(){
        let output;
        if (this.model.renderAllOptions || this.model.isIndex){
            output = html`
                <button @click=${this.toggleOption} data-type="index" ?disabled=${!this.model.renderAllOptions} class="${this.model.isIndex && this.model.renderAllOptions ? "is-active" : ""}">
                    <svg tooltip="Index" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 512"><path fill="currentColor" d="M144 0C64.47 0 0 64.47 0 144c0 74.05 56.1 134.33 128 142.39v206.43l11.01 16.51c2.38 3.56 7.61 3.56 9.98 0L160 492.82V286.39c71.9-8.05 128-68.34 128-142.39C288 64.47 223.53 0 144 0zm0 256c-61.76 0-112-50.24-112-112S82.24 32 144 32s112 50.24 112 112-50.24 112-112 112zm0-192c-44.12 0-80 35.89-80 80 0 8.84 7.16 16 16 16s16-7.16 16-16c0-26.47 21.53-48 48-48 8.84 0 16-7.16 16-16s-7.16-16-16-16z"></path></svg>
                </button>
            `;
        }
        else {
            output = "";
        }
        return output;
    }

    private renderDelete(){
        let output;
        if (this.model.renderAllOptions){
            output = html`
                <button @click=${this.deleteColumn} aria-label="Delete column ${this.model.name}" tooltip="Delete column">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            `;
        }
        else {
            output = "";
        }
        return output;
    }

    private changeType:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLSelectElement;
        const value = target.value;
        this.update({
            type: value,  
        });
    }

    private endDraw:EventListener = (e:Event) => {
        publish("canvas", {
            type: "end",
            id: this.model.uid,
            tableID: this.tableUID,
            refs: [this.tableUID, this.model.uid],
        });
    }

    override render(){
        this.draggable = true;
        this.tabIndex = 0;
        this.dataset.uid = this.model.uid;
        const view = html`
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: -6px;`, this.model.uid, "left", this.tableUID, [this.tableUID, this.model.uid])}
            <div @mouseup=${this.endDraw} tabindex="0" draggable="true" class="w-full" flex="row nowrap items-center" @drag=${this.handleDragStart} @dragover=${this.handleDragOver} @dragend=${this.handleDragEnd} @drop=${this.handleDrop} @dragleave=${this.handleDragLeave}>
                <div flex="row nowrap items-center" style="flex:1;width:100%">
                    ${this.renderPrimaryKey()}
                    ${this.renderIndex()}
                    ${this.renderUnique()}
                    <input type="text" value="${this.model.name}" @input=${this.handleNameInput} @keydown=${this.handleKeyboard}>
                </div>
                <div flex="row nowrap items-center">
                    <select @change=${this.changeType}>
                        ${this.model.columnTypes.map(type => {
                            return html`<option ?selected=${this.model.type === type.value}>${type.label}</option>`;
                        })}
                    </select>
                    ${this.renderDelete()}
                </div>
            </div>
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: calc(100% - 6px);`, this.model.uid, "right", this.tableUID, [this.tableUID, this.model.uid])}
        `;
        render(view, this);
    }
}
mount("column-component", ColumnComponent);
