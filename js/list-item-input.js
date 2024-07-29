import u from"./supercomponent.js";import n from"./env.js";import{html as p,render as a}from"./lit-html.js";import i from"./diagram-controller.js";import o from"./alerts.js";class r extends u{constructor(t){super();this.debounceInput=this.debounce(this.updateValue.bind(this),300);this.handleInput=t=>{const e=t.currentTarget.value.trim();this.debounceInput(e)};this.removeType=async t=>{const e=t.currentTarget.dataset.uid;i.deleteType(e),this.remove(),o.toast(`Deleted column type '${this.model.name}'`)};this.model=t}async connected(){await n.css(["list-item-input"]),this.render()}updateValue(t){i.updateType(this.model.uid,t),o.toast(`Updated column type '${this.model.name}'`)}render(){const t=p`
            <input type="text" value="${this.model.name}" @input=${this.handleInput}>
            <button data-uid="${this.model.uid}" @click=${this.removeType}>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        `;a(t,this)}}n.bind("list-item-input",r);export{r as default};
