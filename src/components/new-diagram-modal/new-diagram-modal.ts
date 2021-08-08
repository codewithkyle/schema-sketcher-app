import { css, mount } from "~controllers/env";
import { html, render } from "lit-html";

export default class NewDiagramModal extends HTMLElement {
    constructor(){
        super();
        css(["new-diagram-modal"]).then(() => {
            this.render();
        });
    }

    private closeClick:EventListener = (e:Event) => {
        this.remove();
    }

    private newLocalDiagram:EventListener = (e:Event) => {

    }

    private newCloudDiagram:EventListener = (e:Event) => {
        
    }

    private render(){
        const view = html`
            <div class="backdrop" @click=${this.closeClick}></div>
            <div class="modal">
                <h3 class="block font-md font-bold mb-1 pb-1 border-b-1 border-b-solid border-b-grey-200">New Diagram</h3>
                <p class="block line-normal font-sm font-grey-700 mb-1">
                    <a class="link" href="/login">Log in</a> or <a class="link" href="/register">sign up</a> to create cloud diagrams. You can always upload a diagram to the cloud at any time.
                </p>
                <div class="w-full" grid="columns 2 gap-1">
                    <button @click=${this.newLocalDiagram} class="choice">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h4 class="block w-full font-sm font-medium font-grey-700 text-capitalize mb-0.25">New local diagram</h4>
                        <p class="block w-full font-xs font-grey-700">Local diagrams will be saved to this computer.</p>
                    </button>
                    <button @click=${this.newCloudDiagram} disabled class="choice">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                        </svg>
                        <h4 class="block w-full font-sm font-medium font-grey-700 text-capitalize mb-0.25">New cloud diagram</h4>
                        <p class="block w-full font-xs font-grey-700">Cloud diagrams will be saved to the cloud and can be accessed by your account at any time on any device.</p>
                    </button>
                </div>
                <button @click=${this.closeClick} class="bttn absolute t-0 r-0" shape="round" icon="center" kind="text" color="grey">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        `;
        render(view, this);
    }
}
mount("new-diagram-modal", NewDiagramModal);