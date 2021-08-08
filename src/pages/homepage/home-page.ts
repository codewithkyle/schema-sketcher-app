import SuperComponent from "@codewithkyle/supercomponent";
import { render, html } from "lit-html";
import { css, mount } from "../../controllers/env";

import BasicHeader from "~components/basic-header/basic-header";
mount("basic-header", BasicHeader);

type Tabs = "all" | "cloud" | "local";
interface IHomepage{
    activeTab: Tabs,
}
export default class Homepage extends SuperComponent<IHomepage>{
    constructor(){
        super();
        this.model = {
            activeTab: "all",
        };
        css(["homepage"]).then(() => {
            this.render();
        });
    }

    private switchTabClick:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        this.update({
            activeTab: target.dataset.tab,
        });
    }

    private renderNewDiagramButton() {
        return html`
            <div id="diagram-grid">
                <button class="new-diagram">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span class="block text-center w-full font-sm font-medium text-uppercase mt-1">New diagram</span>
                </button>
            </div>
        `;
    }

    private renderDiagrams(){
        switch(this.model.activeTab){
            case "all":
                return html`${this.renderNewDiagramButton()}`;
            case "cloud":
                return html`<p class="py-2 block text-center font-grey-700 font-sm">Sign in to view or create cloud documents.</p>`;
            case "local":
                return html`${this.renderNewDiagramButton()}`;
        }
    }

    override render(){
        const view = html`
            ${new BasicHeader()}
            <div class="px-2 py-4">
                <div id="diagram-table" class="bg-white shadow-md radius-0.5 border-1 border-solid border-grey-200 mx-auto max-w-1024">
                    <div class="border-r-1 border-r-solid border-r-grey-200 p-1">
                        <button data-tab="all" @click=${this.switchTabClick} class="bttn w-full ${this.model.activeTab === "all" ? "is-active-tab" : ""}" kind="text" color="grey" icon="left" flex="justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            All
                        </button>
                        <button data-tab="cloud" @click=${this.switchTabClick} class="bttn w-full ${this.model.activeTab === "cloud" ? "is-active-tab" : ""}" kind="text" color="grey" icon="left" flex="justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                            </svg>
                            Cloud
                        </button>
                        <button data-tab="local" @click=${this.switchTabClick} class="bttn w-full ${this.model.activeTab === "local" ? "is-active-tab" : ""}" kind="text" color="grey" icon="left" flex="justify-start">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Local
                        </button>
                    </div>
                    <div>
                        <h2 class="block w-full mt-1 px-1 pb-1 border-b-1 border-b-solid border-b-grey-200 font-md font-medium font-grey-700 text-capitalize">${this.model.activeTab} Diagrams</h2>
                        ${this.renderDiagrams()}
                    </div>
                </div>
            </div>
        `;
        render(view, this);
    }
}