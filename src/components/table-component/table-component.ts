import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import { v4 as uuid } from "uuid";
import ColumnComponent from "~components/column-component/column-component";
import { css, mount } from "~controllers/env";
import type { Table } from "~types/diagram";


export default class TableComponent extends SuperComponent<Table>{
    constructor(data:Table){
        super();
        this.model = data;
    }

    override async connected(){
        await css(["table-component"]);
        this.render();
    }

    override render(){
        this.style.transform = `translate(${this.model.x}px, ${this.model.y}px)`;
        this.dataset.top = `${this.model.y}`;
        this.dataset.left = `${this.model.x}`;
        this.tabIndex = 0;
        this.setAttribute("aria-label", `use arrow keys to nudge table ${this.model.name}`);
        const view = html`
            <header style="border-top-color: ${this.model.color};">
                <h4 title="${this.model.name}">${this.model.name}</h4>
                <button>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
            </header>
            <columns-container>
                ${Object.keys(this.model.columns).map((key:string, index:number) => {
                    return new ColumnComponent(this.model.columns[key]);
                })}
            </columns-container>
        `;
        render(view, this);
    }
}
mount("table-component", TableComponent);