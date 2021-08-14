import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import { css, mount } from "~controllers/env";
import { Diagram } from "~types/diagram";
import db from "@codewithkyle/jsql";
import { v4 as uuid } from "uuid";

interface ISettingsModal {
    diagram: Diagram,
    activeTab: "storage" | "column-types";
}
export default class SettingsModal extends SuperComponent<ISettingsModal>{
    private diagramID: string;

    constructor(diagramID:string){
        super();
        this.model = {
            diagram: null,
            activeTab: "storage",
        };
        this.diagramID = diagramID;
    }

    override async connected(){
        await css(["settings-modal", "tabs"]);
        console.log(this.diagramID);
        // @ts-ignore
        const results = await db.query("SELECT * FROM diagrams WHERE uid = $uid", {
            uid: this.diagramID,
        });
        this.model.diagram = results[0];
        this.render();
    }

    private close:EventListener = (e:Event) => {
        this.remove();
    }

    private switchTab:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const tab = target.dataset.type;
        this.update({
            activeTab: tab,
        });
    }

    private removeType:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const uid = target.dataset.uid;
        const updatedModel = {...this.model};
        delete updatedModel.diagram.types[uid];
        this.update(updatedModel);
    }

    private addRow:EventListener = (e:Event) => {
        const updatedModel = {...this.model};
        updatedModel.diagram.types[uuid()] = "";
        this.update(updatedModel);
    }

    private renderTabContent(){
        switch(this.model.activeTab){
            case "storage":
                return html`
                    <div class="w-full" grid="columns 2 gap-1">
                        <button class="choice is-selected">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <h4 class="block w-full font-sm font-medium font-grey-700 text-capitalize mb-0.25">New local diagram</h4>
                            <p class="block w-full font-xs font-grey-700">Local diagrams will be saved to this computer.</p>
                        </button>
                        <button disabled class="choice">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                            <h4 class="block w-full font-sm font-medium font-grey-700 text-capitalize mb-0.25">New cloud diagram</h4>
                            <p class="block w-full font-xs font-grey-700">Cloud diagrams will be saved to the cloud and can be accessed by your account at any time on any device.</p>
                        </button>
                    </div>
                `;
            case "column-types":
                return html`
                    <list-component>
                        <list-container>
                            <list-header>Column Types</list-header>
                            ${Object.keys(this.model.diagram.types).map(key => {
                                return html`
                                    <list-item>
                                        <input type="text" value="${this.model.diagram.types[key]}">
                                        <button data-uid="${key}" @click=${this.removeType}>
                                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </list-item>
                                `;
                            })}
                        </list-container>
                        <button @click=${this.addRow} class="add-item">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            Add column type
                        </button>
                    </list-component>
                `;
            default:
                return "";   
        }
    }

    override render(){
        console.log(this.model.diagram);
        const view = html`
            <div @click=${this.close} class="backdrop"></div>
            <div class="modal">
                <button @click=${this.close} class="bttn absolute t-0 r-0" kind="text" icon="center" color="grey" shape="round">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <tabs-container>
                    <button @click=${this.switchTab} data-type="storage" class="${this.model.activeTab === "storage" ? "is-selected" : ""}">
                        Storage
                    </button>
                    <button @click=${this.switchTab} data-type="column-types" class="${this.model.activeTab === "column-types" ? "is-selected" : ""}">
                        Column Types
                    </button>
                </tabs-container>
                ${this.renderTabContent()}
            </div>
        `;
        render(view, this);
    }
}
mount("settings-modal", SettingsModal);