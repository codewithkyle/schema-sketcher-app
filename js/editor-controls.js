import i from"./component.js";import o from"./env.js";import{html as n,render as r}from"./lit-html.js";import{subscribe as l}from"./pubsub.js";class s extends i{constructor(t,e){super();this.toggleMove=t=>{const e=!this.model.isMoving;this.set({isMoving:e}),this.dispatchEvent(new CustomEvent("move",{detail:{isMoving:e}}))};this.zoomOut=t=>{let e=this.model.scale-.0125;e<.125?e=0:e>1&&(e=1),this.set({scale:e}),this.dispatchEvent(new CustomEvent("zoom",{detail:e,bubbles:!0}))};this.zoomIn=t=>{let e=this.model.scale+.0125;e<.125?e=0:e>1&&(e=1),this.set({scale:e}),this.dispatchEvent(new CustomEvent("zoom",{detail:e,bubbles:!0}))};this.model={isMoving:t,scale:e},l("zoom",this.zoomInbox.bind(this))}static get observedAttributes(){return["data-is-moving","data-scale"]}zoomInbox(t){this.set({scale:t})}async connected(){await o.css(["editor-controls"]),this.render()}render(){const t=n`
            <button tooltip aria-label="${this.model.isMoving?"Disable":"Enable"} panning" @mousedown=${this.toggleMove} class="move ${this.model.isMoving?"is-active":""}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
            </button>
            <div class="scale">
                <button tooltip aria-label="Zoom out" @mousedown=${this.zoomOut}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                </button>
                <span>${(this.model.scale*100).toFixed(2)}%</span>
                <button tooltip aria-label="Zoom in" @mousedown=${this.zoomIn}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
        `;r(t,this)}}o.bind("editor-controls",s);export{s as default};
