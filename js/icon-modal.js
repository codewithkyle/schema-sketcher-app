import n from"./jsql.js";import i from"./supercomponent.js";import{html as a,render as o}from"./lit-html.js";import{css as c,mount as l}from"./env.js";import{unsafeHTML as d}from"./unsafe-html.js";const h=["grey","red","orange","amber","yellow","lime","green","emerald","teal","cyan","light-blue","blue","indigo","violet","purple","fuchsia","pink","rose"];class r extends i{constructor(t,e,s){super();this.close=t=>{this.remove(),this.callback(this.model.color,this.model.icon)};this.colorChange=t=>{const e=t.currentTarget;this.update({color:e.value})};this.changeIcon=t=>{const e=t.currentTarget;this.update({icon:e.value})};this.switchTab=t=>{const s=t.currentTarget.dataset.type;this.update({activeTab:s})};this.deboucneSearch=this.debounce(this.search.bind(this),600);this.handleSearch=t=>{const e=t.currentTarget;this.deboucneSearch(e.value.trim())};this.changePage=t=>{const e=t.currentTarget;this.update({offset:parseInt(e.dataset.offset)})};this.callback=t,this.model={color:e,icon:s,activeTab:"colors",query:"",offset:0,totalPages:0},this.state="LOADING",this.stateMachine={LOADING:{DONE:"ILDING"}},this.render()}async connected(){await c(["icon-modal","tabs"]);const t=await n.query("SELECT COUNT(name) FROM icons");this.update({totalPages:Math.ceil(t[0]/50)}),this.trigger("DONE")}async search(t){const e=await n.query("SELECT COUNT(name) FROM icons WHERE name LIKE $query",{query:t});this.update({query:t,offset:0,totalPages:Math.ceil(e/50)})}async renderTabContent(){const t=await n.query(`SELECT * FROM icons ${this.model.query.length?"WHERE name LIKE $query":""} LIMIT 50 OFFSET ${this.model.offset}`,{query:this.model.query});switch(this.model.activeTab){case"colors":return a`
                    <div class="colors">
                        ${h.map(e=>a`
                                <div class="relative inline-block">
                                    <input @change=${this.colorChange} ?checked=${e===this.model.color} id="${e}" type="radio" name="color" value="${e}">
                                    <label for="${e}" class="bg-${e}-500 color"></label>
                                </div>
                            `)}
                    </div>
                `;case"icons":return a`
                    <input type="search" @input=${this.handleSearch} placeholder="Search icons...">
                    ${t.length?a`
                        <div class="icons">
                            ${t.map(e=>a`
                                    <div class="relative inline-block mb-auto">
                                        <input @change=${this.changeIcon} ?checked=${e.name===this.model.icon} id="${e.name}" type="radio" name="icon" value="${e.name}">
                                        <label for="${e.name}" class="icon" title="${e.name}">
                                            ${d(e.svg)}
                                        </label>
                                    </div>
                                `)}
                        </div>
                        <div class="pages">
                            ${new Array(this.model.totalPages).fill(null).map((e,s)=>a`
                                    <button @click=${this.changePage} class="${s*50===this.model.offset?"is-active":""}" data-offset="${s*50}">${s+1}</button>
                                `)}
                        </div>
                    `:a`
                        <p class="block text-center font-sm font-grey-700 p-1">No icons found.</p>
                    `}
                    
                `}}async renderIdling(){return a`
            <div class="modal">
                <button @click=${this.close} class="bttn absolute t-0 r-0" kind="text" icon="center" color="grey" shape="round">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <tabs-container class="mb-1">
                    <button @click=${this.switchTab} data-type="colors" class="${this.model.activeTab==="colors"?"is-selected":""}">
                        Colors
                    </button>
                    <button @click=${this.switchTab} data-type="icons" class="${this.model.activeTab==="icons"?"is-selected":""}">
                        Icons
                    </button>
                </tabs-container>
                ${await this.renderTabContent()}
            </div>
        `}renderLoading(){return a`
            <svg style="width:36px;height:36px;animation: spinner 900ms linear infinite;color: var(--grey-600);" aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g class="fa-group"><path class="fa-secondary" fill="currentColor" d="M478.71 364.58zm-22 6.11l-27.83-15.9a15.92 15.92 0 0 1-6.94-19.2A184 184 0 1 1 256 72c5.89 0 11.71.29 17.46.83-.74-.07-1.48-.15-2.23-.21-8.49-.69-15.23-7.31-15.23-15.83v-32a16 16 0 0 1 15.34-16C266.24 8.46 261.18 8 256 8 119 8 8 119 8 256s111 248 248 248c98 0 182.42-56.95 222.71-139.42-4.13 7.86-14.23 10.55-22 6.11z" opacity="0.4"></path><path class="fa-primary" fill="currentColor" d="M271.23 72.62c-8.49-.69-15.23-7.31-15.23-15.83V24.73c0-9.11 7.67-16.78 16.77-16.17C401.92 17.18 504 124.67 504 256a246 246 0 0 1-25 108.24c-4 8.17-14.37 11-22.26 6.45l-27.84-15.9c-7.41-4.23-9.83-13.35-6.2-21.07A182.53 182.53 0 0 0 440 256c0-96.49-74.27-175.63-168.77-183.38z"></path></g></svg>
        `}async render(){let t;switch(this.state){case"LOADING":t=this.renderLoading();break;default:t=await this.renderIdling();break}const e=a`
            <div @click=${this.close} class="backdrop"></div>
            ${t}
        `;o(e,this)}}l("icon-modal",r);export{r as default};
