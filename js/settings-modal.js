import r from"./supercomponent.js";import{html as i,render as d}from"./lit-html.js";import o from"./env.js";import t from"./diagram-controller.js";import p from"./list-item-input.js";class s extends r{constructor(){super();this.noop=e=>{e.stopImmediatePropagation()};this.onAddRow=async e=>{this.addRow()};this.model={types:[]}}async connected(){window.addEventListener("wheel",this.noop,{passive:!1,capture:!0}),await o.css(["settings-modal"]);const e=t.getTypes();e.length<1?this.addRow():this.set({types:e})}disconnected(){window.removeEventListener("wheel",this.noop,{capture:!0})}addRow(){t.createType();const e=t.getTypes();this.set({types:e})}render(){const e=i`
            <list-component>
                <list-container>
                    <list-header>Column Types</list-header>
                    ${this.model.types.map(n=>new p(n,this))}
                </list-container>
                <button @click=${this.onAddRow} class="add-item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add column type
                </button>
            </list-component>
        `;d(e,this)}}o.bind("settings-modal",s);export{s as default};
