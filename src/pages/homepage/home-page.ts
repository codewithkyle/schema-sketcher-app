import SuperComponent from "@codewithkyle/supercomponent";
import { render, html } from "lit-html";
import env from "~brixi/controllers/env";
import BasicHeader from "~components/basic-header/basic-header";


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
            ${new BasicHeader()}
        `;
        render(view, this);
    }
}
