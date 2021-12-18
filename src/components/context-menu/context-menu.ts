import { html, render } from "lit-html";
import { css, mount } from "~controllers/env";

export default class ContextMenu extends HTMLElement{
    private callback:Function;

    constructor(x:number, y:number, callback:Function){
        super();
        this.callback = callback;
        this.style.top = `${y}px`;
        this.style.left = `${x}px`;
        css(["context-menu"]).then(() => {
            this.render();
        });
        document.body.addEventListener("click", this.handleRemove);
    }

    private handleRemove:EventListener = () => {
        this.remove();
    }

    disconnectedCallback(){
        document.body.removeEventListener("click", this.handleRemove);
    }

    private handleClick:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLElement;
        this.callback(target.dataset.type);
    }

    private render():void{
        const view = html`
            <button @click=${this.handleClick} data-type="table" class="bttn" kind="text" color="grey" shape="square" icon="left">
                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM160 448H48c-8.837 0-16-7.163-16-16v-80h128v96zm0-128H32v-96h128v96zm0-128H32V96h128v96zm160 256H192v-96h128v96zm0-128H192v-96h128v96zm0-128H192V96h128v96zm160 160v80c0 8.837-7.163 16-16 16H352v-96h128zm0-32H352v-96h128v96zm0-128H352V96h128v96z"></path></svg>
                Create table
            </button>
            <button @click=${this.handleClick} data-type="node" class="bttn" kind="text" color="grey" shape="square" icon="left">
                <svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><path fill="currentColor" d="M128 256c0 10.8.9 21.5 2.6 32H12c-6.6 0-12-5.4-12-12v-40c0-6.6 5.4-12 12-12h118.6c-1.7 10.5-2.6 21.2-2.6 32zm500-32H509.4c1.8 10.5 2.6 21.2 2.6 32s-.9 21.5-2.6 32H628c6.6 0 12-5.4 12-12v-40c0-6.6-5.4-12-12-12zm-308-80c-29.9 0-58 11.7-79.2 32.8C219.6 198 208 226.1 208 256s11.6 58 32.8 79.2C262 356.3 290.1 368 320 368s58-11.7 79.2-32.8C420.4 314 432 285.9 432 256s-11.6-58-32.8-79.2C378 155.7 349.9 144 320 144m0-48c88.4 0 160 71.6 160 160s-71.6 160-160 160-160-71.6-160-160S231.6 96 320 96z"></path></svg>
                Create node
            </button>
        `;
        render(view, this);
    }
}
mount("context-menu", ContextMenu);