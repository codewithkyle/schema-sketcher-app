import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import diagramController from "~controllers/diagram-controller";
import { css, mount } from "~controllers/env";

interface IEditorPage {}
export default class EditorPage extends SuperComponent<IEditorPage>{
    private uid:string;

    constructor(tokens, params){
        super();
        this.uid = tokens.UID;
        this.init();
    }

    private async init(){
        await css(["editor-page"]);
        const ops = await diagramController.loadDiagram(this.uid);
        console.log(ops);
        this.render();
    }
    
    override render(){
        const view = html``;
        render(view, this);
    }
}
mount("editor-page", EditorPage);