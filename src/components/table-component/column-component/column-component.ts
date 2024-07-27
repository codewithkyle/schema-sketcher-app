import { html, render } from "lit-html";
import ConnectorComponent from "~components/connector-component/connector-component";
import diagramController from "~controllers/diagram-controller";
import env from "~brixi/controllers/env";
import { publish, subscribe } from "~lib/pubsub";
import type { Column } from "~types/diagram";
import Component from "~brixi/component";
import { parseDataset } from "~brixi/utils/general";
import TableComponent from "../table-component";

interface IColumnComponent extends Column{}
export default class ColumnComponent extends Component<IColumnComponent>{
    constructor(){
        super();
        this.model = {
            name: "",
            type: "",
            isNullable: false,
            isUnique: false,
            isIndex: false,
            isPrimaryKey: false,
            weight: 0,
            uid: "",
            tableID: "",
        };
    }

    static get observedAttributes() {
        return ["data-uid"];
    }

    override async connected(){
        this.addEventListener("mouseenter", this.handleMouseEnter);
        this.addEventListener("mouseleave", this.handleMouseLeave);
        this.addEventListener("keydown", this.handleKeyboard, { passive: false, capture: true });
        await env.css(["column-component"]);
        const settings = parseDataset(this.dataset, this.model);
        const col = diagramController.getColumn(settings.uid);
        this.set(col);
    }

    private handleMouseEnter:EventListener = (e:Event) => {
        publish("canvas", {
            type: "highlight",
            ref: this.model.uid,
        });
    }
    
    private handleMouseLeave:EventListener = (e:Event) => {
        publish("canvas", {
            type: "clear-highlight",
            ref: this.model.uid,
        });
    }

    private updateName(value){
        this.set({
            name: value,
        });
        diagramController.renameColumn(this.model.uid, value);
    }
    private debounceName = this.debounce(this.updateName.bind(this), 300);
    private handleNameInput:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        this.debounceName(target.value);
    }

    private handleKeyboard:EventListener = (e:KeyboardEvent) => {
        if (e instanceof KeyboardEvent && e.metaKey || e.ctrlKey){
            const table = this.closest("table-component") as TableComponent;
            switch(e.key){
                case "Enter":
                    e.preventDefault();
                    diagramController.createColumn(this.model.tableID);
                    table.render();
                    table.focusLastColumn();
                    break;
                case "Delete":
                    e.preventDefault();
                    diagramController.deleteColumn(this.model.uid);
                    this.remove();
                    table.focusLastColumn();
                    break;
                case "p":
                    e.preventDefault();
                    const isPrimaryKey = this.model.isPrimaryKey ? false : true;
                    this.set({
                        isPrimaryKey: isPrimaryKey,
                    });
                    break;
                case "u":
                    e.preventDefault();
                    const isUnique = this.model.isUnique ? false : true;
                    this.set({
                        isUnique: isUnique,
                    });
                    break;
                case "i":
                    e.preventDefault();
                    const isIndex = this.model.isIndex ? false : true;
                    this.set({
                        isIndex: isIndex,
                    });
                    break;
                case "k":
                    e.preventDefault();
                    const isNullable = this.model.isNullable ? false : true;
                    this.set({
                        isNullable: isNullable,
                    });
                    break;
                default:
                    break;
            }
        }
    }

    private renderPrimaryKey(){
        let output;
        if (this.model.isPrimaryKey){
            output = html`
                <i tooltip aria-label="Primary key">
                    <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M336 32c79.529 0 144 64.471 144 144s-64.471 144-144 144c-18.968 0-37.076-3.675-53.661-10.339L240 352h-48v64h-64v64H32v-80l170.339-170.339C195.675 213.076 192 194.968 192 176c0-79.529 64.471-144 144-144m0-32c-97.184 0-176 78.769-176 176 0 15.307 1.945 30.352 5.798 44.947L7.029 379.716A24.003 24.003 0 0 0 0 396.686V488c0 13.255 10.745 24 24 24h112c13.255 0 24-10.745 24-24v-40h40c13.255 0 24-10.745 24-24v-40h19.314c6.365 0 12.47-2.529 16.971-7.029l30.769-30.769C305.648 350.055 320.693 352 336 352c97.184 0 176-78.769 176-176C512 78.816 433.231 0 336 0zm48 108c11.028 0 20 8.972 20 20s-8.972 20-20 20-20-8.972-20-20 8.972-20 20-20m0-28c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z"></path></svg>
                </i>
            `;
        }
        else {
            output = "";
        }
        return output;
    }

    private renderUnique(){
        let output;
        if (this.model.isUnique){
            output = html`
                <i tooltip aria-label="Unique" >
                    <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M388.1 333.5l52.7-14.3c4.2-1.1 6.7-5.5 5.6-9.8l-4.1-15.5c-1.1-4.3-5.5-6.8-9.7-5.7l-83.2 22.6-93.8-54.8 93.8-54.8 83.2 22.6c4.2 1.1 8.6-1.4 9.7-5.7l4.1-15.5c1.1-4.3-1.4-8.7-5.6-9.8l-52.7-14.3 55.9-32.7c3.8-2.2 5.1-7.1 2.9-10.9L439 121c-2.2-3.8-7-5.1-10.8-2.9l-55.9 32.7 14.1-53.3c1.1-4.3-1.4-8.7-5.6-9.8l-15.3-4.1c-4.2-1.1-8.6 1.4-9.7 5.7l-22.3 84.2-93.8 54.8V118.6l61-61.6c3.1-3.1 3.1-8.2 0-11.3l-11.2-11.3c-3.1-3.1-8.1-3.1-11.2 0l-38.6 39V8c0-4.4-3.5-8-7.9-8H216c-4.4 0-7.9 3.6-7.9 8v65.4l-38.6-39c-3.1-3.1-8.1-3.1-11.2 0l-11.2 11.3c-3.1 3.1-3.1 8.2 0 11.3l60.9 61.7v109.7l-93.8-54.8-22.1-84.4c-1.1-4.3-5.5-6.8-9.7-5.7l-15.3 4.1c-4.2 1.1-6.7 5.5-5.6 9.8l14.1 53.3L19.7 118c-3.8-2.2-8.6-.9-10.8 2.9L1 134.8c-2.2 3.8-.9 8.7 2.9 10.9l55.9 32.7-52.6 14.4c-4.2 1.1-6.7 5.5-5.6 9.8l4.1 15.5c1.1 4.3 5.5 6.8 9.7 5.7l83.2-22.6 93.8 54.8-93.8 54.8-83.2-22.6c-4.2-1.1-8.6 1.4-9.7 5.7l-4.1 15.5c-1.1 4.3 1.4 8.7 5.6 9.8l52.7 14.3L4 366.1c-3.8 2.2-5.1 7.1-2.9 10.9L9 390.9c2.2 3.8 7 5.1 10.8 2.9l55.9-32.7-14.1 53.3c-1.1 4.3 1.4 8.7 5.6 9.8l15.3 4.1c4.2 1.1 8.6-1.4 9.7-5.7l22.3-84.2 93.8-54.8v109.7l-61 61.7c-3.1 3.1-3.1 8.2 0 11.3l11.2 11.3c3.1 3.1 8.1 3.1 11.2 0l38.6-39V504c0 4.4 3.5 8 7.9 8H232c4.4 0 7.9-3.6 7.9-8v-65.4l38.6 39c3.1 3.1 8.1 3.1 11.2 0l11.2-11.3c3.1-3.1 3.1-8.2 0-11.3L240 393.3V283.7l93.8 54.8 22.3 84.2c1.1 4.3 5.5 6.8 9.7 5.7l15.3-4.1c4.2-1.1 6.7-5.5 5.6-9.8l-14.1-53.3 55.9 32.7c3.8 2.2 8.6.9 10.8-2.9l7.9-13.9c2.2-3.8.9-8.7-2.9-10.9l-56.2-32.7z"></path></svg>
                </i>
            `;
        }
        else {
            output = "";
        }
        return output;
    }

    private renderIndex(){
        let output;
        if (this.model.isIndex){
            output = html`
                <i tooltip aria-label="Index">
                    <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 512"><path fill="currentColor" d="M144 0C64.47 0 0 64.47 0 144c0 74.05 56.1 134.33 128 142.39v206.43l11.01 16.51c2.38 3.56 7.61 3.56 9.98 0L160 492.82V286.39c71.9-8.05 128-68.34 128-142.39C288 64.47 223.53 0 144 0zm0 256c-61.76 0-112-50.24-112-112S82.24 32 144 32s112 50.24 112 112-50.24 112-112 112zm0-192c-44.12 0-80 35.89-80 80 0 8.84 7.16 16 16 16s16-7.16 16-16c0-26.47 21.53-48 48-48 8.84 0 16-7.16 16-16s-7.16-16-16-16z"></path></svg>
                </i>
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
        this.set({
            type: value,  
        });
    }

    private endDraw:EventListener = (e:Event) => {
        publish("canvas", {
            type: "end",
            id: this.model.uid,
            tableID: this.model.tableID,
            refs: [this.model.tableID, this.model.uid],
        });
    }

    override render(){
        this.dataset.uid = this.model.uid;
        const view = html`
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: -6px;`, this.model.uid, "left", this.model.tableID, [this.model.tableID, this.model.uid])}
            <div @mouseup=${this.endDraw} tabindex="0" class="w-full" flex="row nowrap items-center">
                <div flex="row nowrap items-center" style="flex:1;width:100%">
                    ${this.renderPrimaryKey()}
                    ${this.renderIndex()}
                    ${this.renderUnique()}
                    <input type="text" .value="${this.model.name}" @input=${this.handleNameInput}>
                </div>
                <div flex="row nowrap items-center">
                    <select @change=${this.changeType}>
                        ${diagramController.getTypes().map(type => {
                            return html`<option value="${type.uid}" ?selected=${this.model.type === type.uid}>${type.name}${this.model.isNullable ? "?" : ""}</option>`;
                        })}
                    </select>
                </div>
            </div>
            ${new ConnectorComponent(`top: 50%;transform: translateY(-50%);left: calc(100% - 6px);`, this.model.uid, "right", this.model.tableID, [this.model.tableID, this.model.uid])}
        `;
        render(view, this);
    }
}
env.bind("column-component", ColumnComponent);
