import SuperComponent from "@codewithkyle/supercomponent";;
import { html, render } from "lit-html";
import { css, mount } from "~controllers/env";

const COLORS = ["grey", "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "light-blue", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose"];

interface IIconModal{
    color:string,
    icon:string,
}
export default class IconModal extends SuperComponent<IIconModal>{
    private callback:Function;
    
    constructor(callback:Function, color:string, icon:string){
        super();
        this.callback = callback;
        this.model = {
            color: color,
            icon: icon,
        };
    }

    override async connected(){
        await css(["icon-modal"]);
        this.render();
    }

    private close:EventListener = (e:Event) => {
        this.remove();
        this.callback(this.model.color, this.model.icon);
    }

    private handleChange:EventListener = (e:Event) => {
        const target = e.currentTarget as HTMLInputElement;
        this.update({
            color: target.value,
        });
    }

    override render(){
        const view = html`
            <div @click=${this.close} class="backdrop"></div>
                <div class="modal">
                    <button @click=${this.close} class="bttn absolute t-0 r-0" kind="text" icon="center" color="grey" shape="round">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <h2 class="block w-full font-md font-medium mb-1 pb-0.75 border-b-1 border-b-solid border-b-grey-200">Color Options</h2>
                    <div class="colors">
                        ${COLORS.map(color => {
                            return html`
                                <div class="relative inline-block">
                                    <input @change=${this.handleChange} ?checked=${color === this.model.color} id="${color}" type="radio" name="color" value="${color}">
                                    <label for="${color}" class="bg-${color}-500 color"></label>
                                </div>
                            `;
                        })}
                    </div>
                    <h2 class="block w-full font-md font-medium mb-1 pb-0.75 border-b-1 border-b-solid border-b-grey-200">Icon Options</h2>
                </div>
        `;
        render(view, this);
    }
}
mount("icon-modal", IconModal);