import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import env from "~brixi/controllers/env";
import { ColumnType } from "~types/diagram";
import diagramController from "~controllers/diagram-controller";
import ListItemInput from "./list-item-input/list-item-input";

interface ISettingsModal {
    types: Array<ColumnType>,
}
export default class SettingsModal extends SuperComponent<ISettingsModal>{
    constructor(){
        super();
        this.model = {
            types: [],
        };
    }

    override async connected(){
        window.addEventListener("wheel", this.noop, { passive: false, capture: true});
        await env.css(["settings-modal"]);
        const types = diagramController.getTypes();
        if (types.length < 1) {
            this.addRow();
        } else {
            this.set({
                types: types,
            });
        }
    }

    override disconnected(){
        window.removeEventListener("wheel", this.noop, { capture: true});
    }

    private noop:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
    }

    private onAddRow:EventListener = async (e:Event) => {
        this.addRow();
    }

    public addRow() {
        diagramController.createType();
        const types = diagramController.getTypes();
        this.set({
            types: types,
        });
    }

    override render(){
        const view = html`
            <list-component>
                <list-container>
                    <list-header>Column Types</list-header>
                    ${this.model.types.map(type => {
                        return new ListItemInput(type, this);
                    })}
                </list-container>
                <button @click=${this.onAddRow} class="add-item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add column type
                </button>
            </list-component>
        `;
        render(view, this);
    }
}
env.bind("settings-modal", SettingsModal);
