import SuperComponent from "@codewithkyle/supercomponent";
import { render, html } from "lit-html";
import { css, mount } from "~controllers/env";

interface IEditorHeader {
    name: string,
    callback: Function,
}
export default class EditorHeader extends SuperComponent<IEditorHeader>{
    constructor(name:string, callback:Function){
        super();
        this.model = {
            name: name,
            callback: callback,
        };
        css(["editor-header", "buttons"]).then(() => {
            this.render();
        });
    }

    private updateName(value:string) {
        if (value.length){
            this.model.callback(value);
        }
    }
    private inputDebounce = this.debounce(this.updateName.bind(this), 600);
    // @ts-ignore
    private handleInput:EventListener = (e) => {
        const target = e.currentTarget as HTMLInputElement;
        let value = target.value.trim();
        this.inputDebounce(value);
    }

    private handleBlur:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        if (!target.value.trim().length){
            const value = "UNTITLED";
            this.update({
                name: value,
            });
            this.model.callback(value);
        }
    }

    override render(){
        const view = html`
            <div flex="items-center row nowrap">
                <a href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                    </svg>
                </a>
                <input @blur=${this.handleBlur} @input=${this.handleInput} type="text" value="${this.model.name}">
            </div>
            <div flex="row nowrap items-center">
                <button class="bttn ml-1" kind="outline" color="white" icon="left">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Log in
                </button>
                <button class="bttn ml-1" kind="outline" color="white">
                    Sign up
                </button>
            </div>
        `;
        render(view, this);
    }
}
mount("editor-header", EditorHeader);