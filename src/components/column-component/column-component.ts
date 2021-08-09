import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import { css, mount } from "~controllers/env";
import type { Column } from "~types/diagram";


export default class ColumnComponent extends SuperComponent<Column>{
    constructor(data:Column){
        super();
        this.model = data;
    }

    override async connected(){
        await css(["column-component"]);
        this.render();
    }

    private handleNameInput:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        console.log(target.value);
    }

    private renderPrimaryKey(){
        let output;
        if (this.model.isPrimaryKey){
            output = html`<svg tooltip="Primary key" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M336 32c79.529 0 144 64.471 144 144s-64.471 144-144 144c-18.968 0-37.076-3.675-53.661-10.339L240 352h-48v64h-64v64H32v-80l170.339-170.339C195.675 213.076 192 194.968 192 176c0-79.529 64.471-144 144-144m0-32c-97.184 0-176 78.769-176 176 0 15.307 1.945 30.352 5.798 44.947L7.029 379.716A24.003 24.003 0 0 0 0 396.686V488c0 13.255 10.745 24 24 24h112c13.255 0 24-10.745 24-24v-40h40c13.255 0 24-10.745 24-24v-40h19.314c6.365 0 12.47-2.529 16.971-7.029l30.769-30.769C305.648 350.055 320.693 352 336 352c97.184 0 176-78.769 176-176C512 78.816 433.231 0 336 0zm48 108c11.028 0 20 8.972 20 20s-8.972 20-20 20-20-8.972-20-20 8.972-20 20-20m0-28c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48z"></path></svg>`;
        }
        else {
            output = "";
        }
        return output;
    }

    private renderUnique(){
        let output;
        if (this.model.isUnique){
            output = html`<svg tooltip="Unique" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M388.1 333.5l52.7-14.3c4.2-1.1 6.7-5.5 5.6-9.8l-4.1-15.5c-1.1-4.3-5.5-6.8-9.7-5.7l-83.2 22.6-93.8-54.8 93.8-54.8 83.2 22.6c4.2 1.1 8.6-1.4 9.7-5.7l4.1-15.5c1.1-4.3-1.4-8.7-5.6-9.8l-52.7-14.3 55.9-32.7c3.8-2.2 5.1-7.1 2.9-10.9L439 121c-2.2-3.8-7-5.1-10.8-2.9l-55.9 32.7 14.1-53.3c1.1-4.3-1.4-8.7-5.6-9.8l-15.3-4.1c-4.2-1.1-8.6 1.4-9.7 5.7l-22.3 84.2-93.8 54.8V118.6l61-61.6c3.1-3.1 3.1-8.2 0-11.3l-11.2-11.3c-3.1-3.1-8.1-3.1-11.2 0l-38.6 39V8c0-4.4-3.5-8-7.9-8H216c-4.4 0-7.9 3.6-7.9 8v65.4l-38.6-39c-3.1-3.1-8.1-3.1-11.2 0l-11.2 11.3c-3.1 3.1-3.1 8.2 0 11.3l60.9 61.7v109.7l-93.8-54.8-22.1-84.4c-1.1-4.3-5.5-6.8-9.7-5.7l-15.3 4.1c-4.2 1.1-6.7 5.5-5.6 9.8l14.1 53.3L19.7 118c-3.8-2.2-8.6-.9-10.8 2.9L1 134.8c-2.2 3.8-.9 8.7 2.9 10.9l55.9 32.7-52.6 14.4c-4.2 1.1-6.7 5.5-5.6 9.8l4.1 15.5c1.1 4.3 5.5 6.8 9.7 5.7l83.2-22.6 93.8 54.8-93.8 54.8-83.2-22.6c-4.2-1.1-8.6 1.4-9.7 5.7l-4.1 15.5c-1.1 4.3 1.4 8.7 5.6 9.8l52.7 14.3L4 366.1c-3.8 2.2-5.1 7.1-2.9 10.9L9 390.9c2.2 3.8 7 5.1 10.8 2.9l55.9-32.7-14.1 53.3c-1.1 4.3 1.4 8.7 5.6 9.8l15.3 4.1c4.2 1.1 8.6-1.4 9.7-5.7l22.3-84.2 93.8-54.8v109.7l-61 61.7c-3.1 3.1-3.1 8.2 0 11.3l11.2 11.3c3.1 3.1 8.1 3.1 11.2 0l38.6-39V504c0 4.4 3.5 8 7.9 8H232c4.4 0 7.9-3.6 7.9-8v-65.4l38.6 39c3.1 3.1 8.1 3.1 11.2 0l11.2-11.3c3.1-3.1 3.1-8.2 0-11.3L240 393.3V283.7l93.8 54.8 22.3 84.2c1.1 4.3 5.5 6.8 9.7 5.7l15.3-4.1c4.2-1.1 6.7-5.5 5.6-9.8l-14.1-53.3 55.9 32.7c3.8 2.2 8.6.9 10.8-2.9l7.9-13.9c2.2-3.8.9-8.7-2.9-10.9l-56.2-32.7z"></path></svg>`;
        }
        else {
            output = "";
        }
        return output;
    }

    private renderIndex(){
        let output;
        if (this.model.isIndex){
            output = html`<svg tooltip="Index" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 288 512"><path fill="currentColor" d="M144 0C64.47 0 0 64.47 0 144c0 74.05 56.1 134.33 128 142.39v206.43l11.01 16.51c2.38 3.56 7.61 3.56 9.98 0L160 492.82V286.39c71.9-8.05 128-68.34 128-142.39C288 64.47 223.53 0 144 0zm0 256c-61.76 0-112-50.24-112-112S82.24 32 144 32s112 50.24 112 112-50.24 112-112 112zm0-192c-44.12 0-80 35.89-80 80 0 8.84 7.16 16 16 16s16-7.16 16-16c0-26.47 21.53-48 48-48 8.84 0 16-7.16 16-16s-7.16-16-16-16z"></path></svg>`;
        }
        else {
            output = "";
        }
        return output;
    }

    override render(){
        const view = html`
            <div flex="row nowrap items-center" style="flex:1;width:100%">
                ${this.renderPrimaryKey()}
                ${this.renderIndex()}
                ${this.renderUnique()}
                <input type="text" value="${this.model.name}" @input=${this.handleNameInput}>
            </div>
            <select>
                <option ?selected=${this.model.type === "int"}>int</option>
            </select>
        `;
        render(view, this);
    }
}
mount("column-component", ColumnComponent);