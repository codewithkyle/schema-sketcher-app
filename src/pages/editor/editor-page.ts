import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import EditorHeader from "~components/editor-header/editor-header";
import diagramController from "~controllers/diagram-controller";
import { css, mount } from "~controllers/env";
import { Diagram } from "~types/app";

interface IEditorPage {
    diagram: Diagram
}
export default class EditorPage extends SuperComponent<IEditorPage>{
    private uid:string;

    constructor(tokens, params){
        super();
        this.uid = tokens.UID;
        this.init();
    }

    private async init(){
        await css(["editor-page"]);
        const { ops, diagram } = await diagramController.loadDiagram(this.uid);
        this.update({
            diagram: diagram,
        });
    }

    private updateName(newName:string){
        diagramController.renameDiagram(this.uid, newName);
    }
    
    override render(){
        const view = html`
            ${new EditorHeader(this.model.diagram.name, this.updateName.bind(this))}
        `;
        render(view, this);
    }
}
mount("editor-page", EditorPage);