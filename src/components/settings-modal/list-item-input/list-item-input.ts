import SuperComponent from "@codewithkyle/supercomponent";
import env from "~brixi/controllers/env";
import { html, render } from "lit-html";
import { ColumnType } from "~types/diagram";
import diagramController from "~controllers/diagram-controller";

interface IListItemInput extends ColumnType {}
export default class ListItemInput extends SuperComponent<IListItemInput>{

    constructor(type:ColumnType){
        super();
        this.model = type;
    }

    override async connected(){
        await env.css(["list-item-input"]);
        this.render();
    }

    private updateValue(value:string){
        diagramController.updateType(this.model.uid, value);
    }
    private debounceInput = this.debounce(this.updateValue.bind(this), 300);
    private handleInput:EventListener = (e:Event) => {
        const input = e.currentTarget as HTMLInputElement;
        const value = input.value.trim();
        this.debounceInput(value);
    }

    private removeType:EventListener = async (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const uid = target.dataset.uid;
        diagramController.deleteType(uid);
        this.remove();
    }

    override render(){
        const view = html`
            <input type="text" value="${this.model.name}" @input=${this.handleInput}>
            <button data-uid="${this.model.uid}" @click=${this.removeType}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        `;
        render(view, this);
    }
}
env.bind("list-item-input", ListItemInput);
