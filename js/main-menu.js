import w from"./supercomponent.js";import{render as f,html as o}from"./lit-html.js";import v from"./env.js";import r from"./modals.js";import a from"./diagram-controller.js";import c from"./save-file.js";import"./input.js";import g from"./open-file.js";import l from"./alerts.js";import{subscribe as k}from"./pubsub.js";import b from"./settings-modal.js";import M from"./help-modal.js";class m extends w{constructor(){super();this.toggle=e=>{this.set({open:!this.model.open})};this.onReset=e=>{r.dangerous({title:"Reset the canvas?",message:"This will remove all of your work and cannot be undone.",confirm:"Reset",cancel:"Cancel",callbacks:{confirm:()=>{a.reset()}}})};this.onSave=e=>{this.save()};this.onOpen=e=>{if(window?.showOpenFilePicker)g({description:"Schema Sketcher Diagram",mimeTypes:["application/json"],extensions:[".json"]}).then(t=>{const i=new FileReader;i.onload=n=>{const s=n.target.result;a.import(s),l.toast("File opened")},i.readAsText(t)});else{const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=i=>{const n=t.files[0],s=new FileReader;s.onload=d=>{const p=d.target.result;a.import(p),l.toast("File opened")},s.readAsText(n)},t.click()}};this.onSettings=e=>{r.raw({view:o`${new b}`,closeable:!0})};this.onHelp=e=>{r.raw({view:o`${new M}`,width:769,closeable:!0})};this.file=null,this.model={open:!1,unsaved:!1},k("diagram",this.diagramInbox.bind(this))}async connected(){await v.css(["main-menu","button","modals"]).then(()=>{this.render()}),window.addEventListener("beforeunload",e=>{if(this.model.unsaved){var t="Are you sure you want to exit? You have unsaved changes.";return(e||window.event).returnValue=t,t}})}diagramInbox({type:e,data:t}){switch(e){case"dirty":this.set({unsaved:!0});break;case"load":this.file=null,this.set({unsaved:!1});break;case"reset":this.file=null,this.set({unsaved:!1});break;default:break}}async save(){const[e,t]=a.export(),i=e.fileName||"untitled";this.file!==null?(this.file=await c(new Blob([t],{type:"application/json"}),{fileName:`${e.fileName}.json`,mimeTypes:["application/json"],extensions:[".json"],id:e.uid.replace(/-/g,"")},this.file),l.toast("File saved"),this.set({unsaved:!1})):r.form({title:"Save diagram",view:o`
                    <brixi-input
                        data-value="${i}"
                        data-name="fileName"
                        data-required="true"
                    ></brixi-input>
                `,submit:"Save",callbacks:{submit:async(n,s,d)=>{if(a.setFileName(n.fileName),window?.showSaveFilePicker)this.file=await c(new Blob([t],{type:"application/json"}),{fileName:`${n.fileName}.json`,mimeTypes:["application/json"],extensions:[".json"],id:e.uid.replace(/-/g,"")},this.file);else{const p=new Blob([t],{type:"application/json"}),u=URL.createObjectURL(p),h=document.createElement("a");h.href=u,h.download=`${n.fileName}.json`,h.click(),URL.revokeObjectURL(u)}d.remove(),l.toast("File saved"),this.set({unsaved:!1})}}})}renderMenuButton(){return this.model.open?o`
                <button @mousedown=${this.toggle} tooltip aria-label="Close">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                </button>
            `:o`
                <button @mousedown=${this.toggle} tooltip aria-label="Open">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
                </button>
            `}renderMenu(){return this.model.open?o`
            <nav>
                <button @mousedown=${this.onOpen}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" /></svg>
                    <span>Open</span>
                </button>
                <button @mousedown=${this.onSave}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                    <span>Save to...</span>
                </button>
                <button @mousedown=${this.onHelp}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 17l0 .01" /><path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" /></svg>
                    <span>Help</span>
                </button>
                <button @mousedown=${this.onSettings}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
                    <span>Settings</span>
                </button>
                <button @mousedown=${this.onReset}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                    <span>Reset the canvas</span>
                </button>
            </nav>
        `:""}render(){const e=o`
            ${this.renderMenuButton()}
            ${this.renderMenu()}
            <div class="unsaved-warning ${this.model.unsaved?"visible":""}">
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9v4" /><path d="M12 16v.01" /></svg>
                <span>Unsaved changes</span>
            </div>
        `;f(e,this)}}v.bind("main-menu",m);export{m as default};
