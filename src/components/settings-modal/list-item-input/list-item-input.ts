import SuperComponent from "@codewithkyle/supercomponent";
import { css, mount } from "~controllers/env";
import { html, render } from "lit-html";
import { ColumnType } from "~types/diagram";
import diagramController from "~controllers/diagram-controller";
import { subscribe } from "~lib/pubsub";
import cc from "~controllers/control-center";

interface IListItemInput extends ColumnType {}
export default class ListItemInput extends SuperComponent<IListItemInput>{

    constructor(type:ColumnType){
        super();
        this.model = type;
        subscribe("sync", this.syncInbox.bind(this));
    }

    private syncInbox(e){
        if (e.table === "types" && e.key === this.model.uid){
            switch(e.op){
                case "SET":
                    this.update({
                        name: e.value,
                    });
                    break;
                case "DELETE":
                    this.remove();
                    break;
                default:
                    break;
            }
        }
    }

    override async connected(){
        await css(["list-item-input"]);
        this.render();
    }

    private updateValue(value:string){
        const op = cc.set("types", this.model.uid, "name", value);
        cc.perform(op);
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
        await diagramController.deleteType(uid);
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
mount("list-item-input", ListItemInput);