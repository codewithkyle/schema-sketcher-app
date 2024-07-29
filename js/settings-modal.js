import r from"./supercomponent.js";import{html as i,render as p}from"./lit-html.js";import s from"./env.js";import o from"./diagram-controller.js";import a from"./list-item-input.js";class n extends r{constructor(){super();this.noop=e=>{e.stopImmediatePropagation()};this.addRow=async e=>{o.createType();const t=o.getTypes();this.set({types:t})};this.model={types:[]}}async connected(){window.addEventListener("wheel",this.noop,{passive:!1,capture:!0}),await s.css(["settings-modal"]);const e=o.getTypes();this.set({types:e})}disconnected(){window.removeEventListener("wheel",this.noop,{capture:!0})}render(){const e=i`
            <list-component>
                <list-container>
                    <list-header>Column Types</list-header>
                    ${this.model.types.map(t=>new a(t))}
                </list-container>
                <button @click=${this.addRow} class="add-item">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    Add column type
                </button>
            </list-component>
        `;p(e,this)}}s.bind("settings-modal",n);export{n as default};
