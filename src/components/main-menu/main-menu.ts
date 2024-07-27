import SuperComponent from "@codewithkyle/supercomponent";
import { render, html, TemplateResult } from "lit-html";
import env from "~brixi/controllers/env";


interface IBasicHeader {
    open: boolean;
}
export default class MainMenu extends SuperComponent<IBasicHeader>{
    constructor(){
        super();
        this.model = {
            open: false,
        };
        env.css(["main-menu", "button"]).then(() => {
            this.render();
        });
    }

    private toggle:EventListener = (e:Event) => {
        this.set({
            open: !this.model.open,
        });
    }

    private renderMenuButton(): TemplateResult {
        if (this.model.open) {
            return html`
                <button @mousedown=${this.toggle} tooltip aria-label="Close">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                </button>
            `;
        } else {
            return html`
                <button @mousedown=${this.toggle} tooltip aria-label="Open">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
                </button>
            `;
        }
    }

    override render(){
        const view = html`
            ${this.renderMenuButton()}
        `;
        render(view, this);
    }
}
env.bind("main-menu", MainMenu);
