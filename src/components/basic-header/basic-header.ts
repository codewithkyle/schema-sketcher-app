import SuperComponent from "@codewithkyle/supercomponent";
import { render, html } from "lit-html";
import { css, mount } from "~controllers/env";

interface IBasicHeader {

}
export default class BasicHeader extends SuperComponent<IBasicHeader>{
    constructor(){
        super();
        css(["basic-header", "buttons"]).then(() => {
            this.render();
        });
    }

    override render(){
        const view = html`
            <a id="logo" class="font-xl font-bold" href="/">Schema Sketcher</a>
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
mount("basic-header", BasicHeader);