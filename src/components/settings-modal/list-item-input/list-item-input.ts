import SuperComponent from "@codewithkyle/supercomponent";
import env from "~brixi/controllers/env";
import { html, render } from "lit-html";
import { ColumnType } from "~types/diagram";
import diagramController from "~controllers/diagram-controller";
import notifications from "~brixi/controllers/alerts";
import SettingsModal from "../settings-modal";

interface IListItemInput extends ColumnType {}
export default class ListItemInput extends SuperComponent<IListItemInput>{
    private settings: SettingsModal;

    constructor(type:ColumnType, modal: SettingsModal){
        super();
        this.model = type;
        this.settings = modal;
    }

    override async connected(){
        await env.css(["list-item-input"]);
        this.render();
        const input = this.querySelector("input");
        if (input) input.focus();
    }

    private updateValue(value:string){
        diagramController.updateType(this.model.uid, value);
        notifications.toast(`Updated column type '${this.model.name}'`);
    }
    private debounceInput = this.debounce(this.updateValue.bind(this), 300);
    private handleInput:EventListener = (e:KeyboardEvent) => {
        switch (e.key.toLowerCase()) {
            case "enter":
                this.settings.addRow();
                return;
            case "delete":
                if (e.ctrlKey) {
                    const target = e.currentTarget as HTMLElement;
                    const uid = target.dataset.uid;
                    this.removeType(uid);
                    return;
                }
                break;
            default:
                break;
        }
        const input = e.currentTarget as HTMLInputElement;
        const value = input.value.trim();
        this.debounceInput(value);
    }

    private onRemove:EventListener = async (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const uid = target.dataset.uid;
        this.removeType(uid);
    }

    public removeType(uid:string) {
        if (diagramController.deleteType(uid)) {
            this.remove();
            notifications.toast(`Deleted column type '${this.model.name}'`);
            const newFocusedEl:HTMLInputElement = this.settings.querySelector("list-item-input:last-child input");
            if (newFocusedEl) {
                newFocusedEl.focus();
            }
        }
    }

    override render(){
        const view = html`
            <input type="text" data-uid="${this.model.uid}" value="${this.model.name}" @keyup=${this.handleInput}>
            <button data-uid="${this.model.uid}" @click=${this.onRemove}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        `;
        render(view, this);
    }
}
env.bind("list-item-input", ListItemInput);
