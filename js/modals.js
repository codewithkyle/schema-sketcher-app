import{html as a,render as f}from"./lit-html.js";import{unsafeHTML as o}from"./unsafe-html.js";import"./button.js";import"./submit-button.js";import"./form.js";import{noop as n}from"./general.js";import d from"./env.js";class u{raw(l){const e=Object.assign({view:a``,width:512,closeable:!1},l),t=new c(e.view,e.width,e.closeable);return document.body.appendChild(t),t}form(l){const e=Object.assign({title:"",message:"",view:a``,width:512,callbacks:{onSubmit:n,onCancel:n},cancel:"Cancel",submit:"Submit"},l);let t;const i=a`
            <brixi-form
                class="w-full"
                @submit=${s=>{s.preventDefault();const r=s.currentTarget;if(r.checkValidity()){const m=r.serialize();e.callbacks.submit(m,r,t)}}}
            >
                <div class="block w-full py-1.5 px-2">
                    ${e.title?.length?a`<h2 class="font-lg font-medium font-grey-800 dark:font-grey-300 line-snug block mb-1">${e.title}</h2>`:""} ${e.message?.length?a`<p class="font-grey-700 dark:font-grey-300 font-sm line-normal mb-1.5 block">${o(e.message)}</p>`:""} ${e.view}
                </div>
                <div class="w-full px-1 pb-1">
                    <div class="w-full py-0.75 px-1 bg-grey-50 dark:bg-grey-950/60 radius-0.5" flex="row nowrap items-center justify-end">
                        <brixi-button
                            data-label="${e.cancel}"
                            data-type="button"
                            data-color="grey"
                            data-kind="solid"
                            class="mr-0.5"
                            @click=${()=>{"cancel"in e.callbacks&&typeof e.callbacks.cancel=="function"&&e.callbacks.cancel(),t.remove()}}
                        ></brixi-button>
                        <brixi-submit-button data-label="${e.submit}"></brixi-submit-button>
                    </div>
                </div>
            </brixi-form>
        `;t=new c(i,e.width),document.body.appendChild(t)}passive(l){const e=Object.assign({title:"",message:"",actions:[{label:"Close",callback:n}],width:512},l);let t;const i=a`
            <div class="block w-full py-1.5 px-2">
                <h2 class="font-lg font-medium font-grey-800 dark:font-grey-300 line-snug block mb-1">${e.title}</h2>
                <p class="font-grey-700 dark:font-grey-300 font-sm line-normal block">${o(e.message)}</p>
            </div>
            <div class="w-full px-1 pb-1">
                <div class="w-full py-0.75 px-1 bg-grey-50 dark:bg-grey-950/60 radius-0.5" flex="row nowrap items-center justify-end">
                    ${e.actions.map(s=>a`
                            <brixi-button
                                data-label="${s.label}"
                                data-type="button"
                                data-color="grey"
                                data-kind="solid"
                                @click=${()=>{typeof s?.callback=="function"&&s.callback(),t.remove()}}
                                class="ml-0.5"
                            ></brixi-button>
                        `)}
                </div>
            </div>
        `;t=new c(i,e.width),document.body.appendChild(t)}confirm(l){const e=Object.assign({title:"",message:"",confirm:"Submit",cancel:"Cancel",callbacks:{cancel:n,confirm:n},width:512},l);let t;const i=a`
            <div class="block w-full py-1.5 px-2">
                <h2 class="font-lg font-medium font-grey-800 dark:font-grey-300 line-snug block mb-1">${e.title}</h2>
                <p class="font-grey-700 dark:font-grey-300 font-sm line-normal block">${o(e.message)}</p>
            </div>
            <div class="w-full px-1 pb-1">
                <div class="w-full py-0.75 px-1 bg-grey-50 dark:bg-grey-950/60 radius-0.5" flex="row nowrap items-center justify-end">
                    <brixi-button
                        data-label="${e.cancel}"
                        data-type="button"
                        data-color="grey"
                        data-kind="solid"
                        @click=${()=>{"cancel"in e.callbacks&&typeof e.callbacks.cancel=="function"&&e.callbacks.cancel(),t.remove()}}
                        class="mr-0.5"
                    ></brixi-button>
                    <brixi-button
                        data-label="${e.confirm}"
                        data-type="button"
                        data-color="primary"
                        data-kind="solid"
                        @click=${()=>{"confirm"in e.callbacks&&typeof e.callbacks.confirm=="function"&&e.callbacks.confirm(),t.remove()}}
                    ></brixi-button>
                </div>
            </div>
        `;t=new c(i,e.width),document.body.appendChild(t)}dangerous(l){const e=Object.assign({title:"",message:"",confirm:"Delete",cancel:"Cancel",callbacks:{cancel:n,confirm:n},width:512},l);let t;const i=a`
            <div class="block w-full py-1.5 px-2">
                <h2 class="font-lg font-medium font-grey-800 dark:font-grey-300 line-snug block mb-1">${e.title}</h2>
                <p class="font-grey-700 dark:font-grey-300 font-sm line-normal block">${o(e.message)}</p>
            </div>
            <div class="w-full px-1 pb-1">
                <div class="w-full py-0.75 px-1 bg-grey-150 dark:bg-grey-950/60 radius-0.5" flex="row nowrap items-center justify-end">
                    <brixi-button
                        data-label="${e.cancel}"
                        data-type="button"
                        data-color="grey"
                        data-kind="solid"
                        @click=${()=>{"cancel"in e.callbacks&&typeof e.callbacks.cancel=="function"&&e.callbacks.cancel(),t.remove()}}
                        class="mr-0.5"
                    ></brixi-button>
                    <brixi-button
                        data-label="${e.confirm}"
                        data-type="button"
                        data-color="danger"
                        data-kind="solid"
                        @click=${()=>{"confirm"in e.callbacks&&typeof e.callbacks.confirm=="function"&&e.callbacks.confirm(),t.remove()}}
                    ></brixi-button>
                </div>
            </div>
        `;t=new c(i,e.width),document.body.appendChild(t)}}const g=new u;var C=g;class c extends HTMLElement{constructor(e,t,i=!1){super();this.onClose=e=>{this.closeable&&this.remove()};this.view=e,this.width=t,this.closeable=i,d.css(["modals","button"]).then(()=>this.render())}render(){this.tabIndex=0,this.focus();const e=a`
            <div @click=${this.onClose} class="backdrop"></div>
            <div class="modal" style="width:${this.width}px;">${this.view}</div>
        `;f(e,this)}}d.bind("brixi-modal",c);export{C as default};
