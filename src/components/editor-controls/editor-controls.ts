import SuperComponent from "@codewithkyle/supercomponent";
import env from "~brixi/controllers/env";
import { html, render } from "lit-html";
import { subscribe } from "~lib/pubsub";

interface IEditorControls {
    isMoving: boolean,
    scale: number,
}
export default class EditorControls extends SuperComponent<IEditorControls>{
    private toggleMoveCallback:Function;
    private scaleCallback:Function;

    constructor(isMoving: boolean, scale:number, toggleMoveCallback:Function, scaleCallback:Function){
        super();
        this.model = {
            isMoving: isMoving,
            scale: scale,
        };
        this.toggleMoveCallback = toggleMoveCallback;
        this.scaleCallback = scaleCallback;
        subscribe("zoom", this.zoomInbox.bind(this));
    }

    private zoomInbox(e){
        this.set({
            scale: e,
        });
    }

    override async connected(){
        await env.css(["editor-controls"]);
        this.render();
    }

    private toggleMove:EventListener = (e:Event) => {
        const doMove = this.model.isMoving ? false : true;
        this.toggleMoveCallback(doMove);
        this.set({
            isMoving: doMove,
        });
    }

    private zoomOut:EventListener = (e:Event) => {
        let newValue = this.model.scale - 0.0125;
        if (newValue < 0.125){
            newValue = 0;
        }
        else if (newValue > 1) {
            newValue = 1;
        }
        this.scaleCallback(newValue);
        this.set({
            scale: newValue,
        });
    }

    private zoomIn:EventListener = (e:Event) => {
        let newValue = this.model.scale + 0.0125;
        if (newValue < 0.125){
            newValue = 0;
        }
        else if (newValue > 1) {
            newValue = 1;
        }
        this.scaleCallback(newValue);
        this.set({
            scale: newValue,
        });
    }

    override render(){
        const view = html`
            <button @click=${this.toggleMove} class="move ${this.model.isMoving ? "is-active" : ""}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" /></svg>
            </button>
            <div class="scale">
                <button @click=${this.zoomOut}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" /></svg>
                </button>
                <span>${(this.model.scale * 100).toFixed(2)}%</span>
                <button @click=${this.zoomIn}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>
        `;
        render(view, this);
    }
}
env.bind("editor-controls", EditorControls);
