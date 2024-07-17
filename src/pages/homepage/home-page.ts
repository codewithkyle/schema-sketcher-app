import SuperComponent from "~brixi/component";
import { render, html } from "lit-html";
import env from "~brixi/controllers/env";
import "~components/main-menu/main-menu";

interface IHomepage{
}
export default class Homepage extends SuperComponent<IHomepage>{
    constructor(){
        super();
        this.model = {
        };
    }

    override async connected(){
        await env.css(["homepage"]);
        this.render();
    }

    override render(){
        const view = html`
            <main-menu></main-menu>
        `;
        render(view, this);
    }
}
