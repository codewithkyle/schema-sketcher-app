import SuperComponent from "@codewithkyle/supercomponent";
import { render, html } from "lit-html";
import { css, mount } from "../../controllers/env";
import BasicHeader from "~components/basic-header/basic-header";
import NewDiagramModal from "~components/new-diagram-modal/new-diagram-modal";
import db from "@codewithkyle/jsql";
import dayjs_min from "~lib/dayjs";
import { navigateTo } from "@codewithkyle/router";
import { Diagram } from "~types/diagram";

type Tabs = "all" | "cloud" | "local";

interface IHomepage{
    activeTab: Tabs,
    diagrams: Array<Diagram>
}
export default class Homepage extends SuperComponent<IHomepage>{
    constructor(){
        super();
        this.model = {
            activeTab: "all",
            diagrams: []
        };
    }

    override async connected(){
        await css(["homepage", "overflow-menu"]);
        // @ts-ignore
        this.model.diagrams = await db.query("SELECT * FROM diagrams ORDER BY timestamp DESC");
        this.render();
    }

    private switchTabClick:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        this.update({
            activeTab: target.dataset.tab,
        });
    }

    private openNewDiagramModal:EventListener = (e:Event) => {
        if (e instanceof KeyboardEvent){
            const key = e.key;
            if (key !== " "){
                return;
            }
        }
        const modal = new NewDiagramModal();
        document.body.appendChild(modal);
    }

    private loadDiagram:EventListener = (e:Event) => {
        if (e instanceof KeyboardEvent){
            const key = e.key;
            if (key !== " "){
                return;
            }
        }
        const target = e.currentTarget as HTMLElement;
        navigateTo(`/diagram/${target.dataset.uid}`);
    }

    private noop:EventListener = (e:Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
    }

    private renameDiagram:EventListener = async (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const newName = prompt("Rename diagram", target.dataset.name);
        // @ts-ignore
        await db.query("UPDATE diagrams SET name = $name WHERE uid = $uid", {
            name: newName,
            uid: target.dataset.uid,
        });
        // @ts-ignore
        const diagrams = await db.query("SELECT * FROM diagrams ORDER BY timestamp DESC");
        this.update({
            diagrams: diagrams,
        });
    }

    private deleteDiagram:EventListener = async (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        const doDelete = confirm(`Are you sure you want to delete ${target.dataset.name}?`);
        if (doDelete){
            // @ts-ignore
            await db.query("DELETE FROM diagrams WHERE uid = $uid", {
                uid: target.dataset.uid,
            });
        }
        // @ts-ignore
        const diagrams = await db.query("SELECT * FROM diagrams ORDER BY timestamp DESC");
        this.update({
            diagrams: diagrams,
        });
    }

    private renderNewDiagramButton() {
        return html`
            <diagram-button tabindex="0" class="new-diagram" @click=${this.openNewDiagramModal} @keypress=${this.openNewDiagramModal}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="block text-center w-full font-sm font-medium text-uppercase mt-1">New diagram</span>
            </diagram-button>
        `;
    }

    private renderDiagramButtons(){
        return html`
            ${this.model.diagrams.map((diagram) => {
                return html`
                    <diagram-button tabindex="0" @click=${this.loadDiagram} @keypress=${this.loadDiagram} data-uid="${diagram.uid}" aria-label="load diagram ${diagram.name}">
                        <div @click=${this.noop} class="absolute t-0 r-0" style="z-index:10;">
                            <overflow-button>
                                <button>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                                <overflow-menu>
                                    <a href="/diagram/${diagram.uid}">Load diagram</a>
                                    <button @click=${this.renameDiagram} data-uid="${diagram.uid}" data-name="${diagram.name}">Rename diagram</button>
                                    <button @click=${this.deleteDiagram} color="danger" data-uid="${diagram.uid}" data-name="${diagram.name}">Delete diagram</button>
                                </overflow-menu>
                            </overflow-button>
                        </div>
                        <h3 class="block font-medium line-snug">${diagram.name}</h3>
                        <span class="block font-xs font-grey-600 line-snug">Last edited at ${dayjs_min(diagram.timestamp).format("MM/DD/YY hh:mma")}</span>
                    </diagram-button>
                `;
            })}
        `;
    }

    private renderDiagrams(){
        switch(this.model.activeTab){
            case "all":
                return html`
                    <div id="diagram-grid">
                        ${this.renderNewDiagramButton()}
                        ${this.renderDiagramButtons()}
                    </div>
                `;
            case "cloud":
                return html`<p class="py-2 block text-center font-grey-700 font-sm">Sign in to view or create cloud documents.</p>`;
            case "local":
                return html`
                    <div id="diagram-grid">
                        ${this.renderNewDiagramButton()}
                        ${this.renderDiagramButtons()}
                    </div>
                    `;
        }
    }

    override render(){
        const view = html`
            ${new BasicHeader()}
            <div class="px-2 py-4">
                <div id="diagram-table" class="bg-white shadow-md radius-0.5 border-1 border-solid border-grey-300 mx-auto max-w-1024">
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