import { css, mount } from "~controllers/env";
import { html, render } from "lit-html";

export default class CursorComponent extends HTMLElement{
    private x: number;
    private y: number;
    private uid: string;
    private name: string;
    private zoom: number;

    constructor(cursor){
        super();
        this.zoom = 1;
        this.x = cursor.x;
        this.y = cursor.y;
        this.uid = cursor.uid;
        this.name = cursor.name;
        this.dataset.uid = this.uid;
        css(["cursor-component"]).then(this.render.bind(this));
        subscribe("zoom", this.zoomInbox.bind(this));
    }
    
    private zoomInbox(zoom){
        this.zoom = zoom;
        this.style.transform = `translate(${this.x}px, ${this.y}px) scale(${1 + (1 - this.zoom)})`;
    }
    
    public move(x:number, y:number){
        this.x = x;
        this.y = y;
        this.render();
    }
    
    public render(){
        this.style.transform = `translate(${this.x}px, ${this.y}px) scale(${1 + (1 - this.zoom)})`;
        const view = html`
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="mouse-pointer" class="svg-inline--fa fa-mouse-pointer fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M302.189 329.126H196.105l55.831 135.993c3.889 9.428-.555 19.999-9.444 23.999l-49.165 21.427c-9.165 4-19.443-.571-23.332-9.714l-53.053-129.136-86.664 89.138C18.729 472.71 0 463.554 0 447.977V18.299C0 1.899 19.921-6.096 30.277 5.443l284.412 292.542c11.472 11.179 3.007 31.141-12.5 31.141z"></path></svg>
            <span>${this.name}</span>
        `;
        render(view, this);
    }
}
mount("cursor-component", CursorComponent);
