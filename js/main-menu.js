import m from"./supercomponent.js";import{render as f,html as o}from"./lit-html.js";import u from"./env.js";import l from"./modals.js";import a from"./diagram-controller.js";import w from"./save-file.js";import"./input.js";import g from"./open-file.js";import r from"./alerts.js";import{subscribe as k}from"./pubsub.js";import b from"./settings-modal.js";import M from"./help-modal.js";class c extends m{constructor(){super();this.toggle=e=>{this.set({open:!this.model.open})};this.onReset=e=>{l.dangerous({title:"Reset the canvas?",message:"This will remove all of your work and cannot be undone.",confirm:"Reset",cancel:"Cancel",callbacks:{confirm:()=>{a.reset()}}})};this.onSave=e=>{this.save()};this.onOpen=e=>{if(window?.showOpenFilePicker)g({description:"Schema Sketcher Diagram",mimeTypes:["application/json"],extensions:[".json"]}).then(t=>{const s=new FileReader;s.onload=n=>{const i=n.target.result;a.import(i),r.toast("File opened")},s.readAsText(t)});else{const t=document.createElement("input");t.type="file",t.accept=".json",t.onchange=s=>{const n=t.files[0],i=new FileReader;i.onload=d=>{const h=d.target.result;a.import(h),r.toast("File opened")},i.readAsText(n)},t.click()}};this.onSettings=e=>{l.raw({view:o`${new b}`,closeable:!0})};this.onHelp=e=>{l.raw({view:o`${new M}`,width:769,closeable:!0})};this.onInstall=e=>{window?.deferredInstallPrompt?(window.deferredInstallPrompt.prompt(),window.deferredInstallPrompt.userChoice.then(()=>{window.deferredInstallPrompt=null})):r.snackbar("Your browser does not support installation of web applications.")};this.file=null,this.model={open:!1,unsaved:!1},k("diagram",this.diagramInbox.bind(this))}async connected(){await u.css(["main-menu","button","modals"]).then(()=>{this.render()}),window.addEventListener("beforeunload",e=>{if(this.model.unsaved){var t="Are you sure you want to exit? You have unsaved changes.";return(e||window.event).returnValue=t,t}})}diagramInbox({type:e,data:t}){switch(e){case"dirty":this.set({unsaved:!0});break;case"load":this.file=null,this.set({unsaved:!1});break;case"reset":this.file=null,this.set({unsaved:!1});break;default:break}}async save(){const[e,t]=a.export(),s=e.fileName||"untitled";this.file!==null?(this.file=await w(new Blob([t],{type:"application/json"}),{fileName:`${e.fileName}.json`,mimeTypes:["application/json"],extensions:[".json"],id:e.uid.replace(/-/g,"")},this.file),r.toast("File saved"),this.set({unsaved:!1})):l.form({title:"Save diagram",view:o`
                    <brixi-input
                        data-value="${s}"
                        data-name="fileName"
                        data-required="true"
                    ></brixi-input>
                `,submit:"Save",callbacks:{submit:async(n,i,d)=>{if(a.setFileName(n.fileName),window?.showSaveFilePicker)this.file=await w(new Blob([t],{type:"application/json"}),{fileName:`${n.fileName}.json`,mimeTypes:["application/json"],extensions:[".json"],id:e.uid.replace(/-/g,"")},this.file);else{const h=new Blob([t],{type:"application/json"}),v=URL.createObjectURL(h),p=document.createElement("a");p.href=v,p.download=`${n.fileName}.json`,p.click(),URL.revokeObjectURL(v)}d.remove(),r.toast("File saved"),this.set({unsaved:!1})}}})}renderMenuButton(){return this.model.open?o`
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
                <hr>
                <a href="https://github.com/codewithkyle/schema-sketcher-app">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" /></svg>
                    <span>Github</span>
                </a>
                <button @mousedown=${this.onInstall}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 16.5v-7.5a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v3.5" /><path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h8" /><path d="M19 16v6" /><path d="M22 19l-3 3l-3 -3" /><path d="M16 9h2" /></svg>
                    <span>Install app</span>
                </button>
            </nav>
        `:""}render(){const e=o`
            ${this.renderMenuButton()}
            ${this.renderMenu()}
            <div class="unsaved-warning ${this.model.unsaved?"visible":""}">
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9v4" /><path d="M12 16v.01" /></svg>
                <span>Unsaved changes</span>
            </div>
        `;f(e,this)}}u.bind("main-menu",c);export{c as default};
