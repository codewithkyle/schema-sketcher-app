import SuperComponent from "@codewithkyle/supercomponent";
import { render, html } from "lit-html";
import SettingsModal from "~components/settings-modal/settings-modal";
import { css, mount } from "~controllers/env";
import diagramController from "~controllers/diagram-controller";
import { connect, send } from "~controllers/ws";

interface IEditorHeader {
    name: string,
}
export default class EditorHeader extends SuperComponent<IEditorHeader>{
    constructor(name:string){
        super();
        this.model = {
            name: name,
        };
        css(["editor-header", "buttons"]).then(() => {
            this.render();
        });
    }

    private handleBlur:EventListener = (e:Event) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        const target = e.currentTarget as HTMLInputElement;
        let value = target.value.trim();
        if (!value.length){
            value = "UNTITLED";
        }
        diagramController.renameDiagram(value);
        this.update({
            name: value,
        });
    }

    private openSettingsModal:EventListener = (e:Event) => {
        const modal = new SettingsModal();
        document.body.appendChild(modal);
    }
    
    private openCollabModal:EventListener = async (e:Event) => {
        await connect();
        send("create-room", {
            password: "password",
            allowAnon: true,
            diagramID: diagramController.ID,
        });
    }

    override render(){
        const view = html`
            <div flex="items-center row nowrap">
                <a href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
                </a>
                <input @blur=${this.handleBlur} type="text" .value=${this.model.name}>
            </div>
            <div flex="row nowrap items-center">
                <button class="bttn ml-0.5" kind="text" color="white" icon="left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    Share
                </button>
                <button @click=${this.openCollabModal} class="bttn ml-0.5" kind="text" color="white" icon="left">
                    <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="currentColor" d="M304 192c-41.7 0-76 32-79.7 72.8-25.2-1.3-61.6-7.9-88.8-31.7-20.3-17.8-32.8-43-37.5-75.1 35.5-8.2 62-40 62-77.9 0-44.2-35.8-80-80-80S0 35.8 0 80c0 38.7 27.5 71 64 78.4v195.2C27.5 361 0 393.3 0 432c0 44.2 35.8 80 80 80s80-35.8 80-80c0-38.7-27.5-71-64-78.4V237.4c5.5 7.2 11.7 13.9 18.6 19.9C151 289 197.9 296.1 228 297c10.5 31.9 40.5 55 76 55 44.2 0 80-35.8 80-80s-35.8-80-80-80zM32 80c0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48-48-21.5-48-48zm96 352c0 26.5-21.5 48-48 48s-48-21.5-48-48 21.5-48 48-48 48 21.5 48 48zm176-112c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z"></path></svg>
                    Collaborate
                </button>
                <button @click=${this.openSettingsModal} class="bttn ml-0.5" kind="text" color="white" icon="left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Settings
                </button>
                <button class="bttn ml-1" kind="outline" color="white" icon="left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Log in
                </button>
                <button class="bttn ml-1" kind="outline" color="white" icon="left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Sign up
                </button>
            </div>
        `;
        render(view, this);
    }
}
mount("editor-header", EditorHeader);
