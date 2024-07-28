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
        await env.css(["settings-modal", "tabs"]);
        const types = diagramController.getTypes();
        this.set({
            types: types,
        });
    }

    private close:EventListener = (e:Event) => {
        this.closest("brixi-modal").remove();
    }

    private addRow:EventListener = async (e:Event) => {
        diagramController.createType();
        const types = diagramController.getTypes();
        this.set({
            types: types,
        });
    }

    private renderTabContent(){
        return html`
            <list-component>
                <list-container>
                    <list-header>Column Types</list-header>
                    ${this.model.types.map(type => {
                        return new ListItemInput(type);
                    })}
                </list-container>
                <button @click=${this.addRow} class="add-item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add column type
                </button>
            </list-component>
        `;
    }

    override render(){
        const view = html`
            <button @click=${this.close} class="bttn absolute t-0 r-0" kind="text" icon="center" color="grey" shape="round">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            ${this.renderTabContent()}
        `;
        render(view, this);
    }
}
env.bind("settings-modal", SettingsModal);
