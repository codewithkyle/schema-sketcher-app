import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import env from "~brixi/controllers/env";

interface IHelpModal {
}
export default class HelpModal extends SuperComponent<IHelpModal>{
    constructor(){
        super();
        this.model = {};
    }

    override async connected(){
        window.addEventListener("wheel", this.noop, { passive: false, capture: true});
        await env.css(["help-modal"]);
        this.render();
    }

    override disconnected(){
        window.removeEventListener("wheel", this.noop, { capture: true});
    }

    private noop:EventListener = (e:Event) => {
        e.stopImmediatePropagation();
    }

    override render(){
        const view = html`
            <div class="sections">
                <div class="section">
                    <h4>Tables</h4>
                    <div class="hotkeys">
                        <div class="hotkey">
                            <h5>Duplicate</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>d</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Delete</h5>
                            <div flex="row nowrap items-center">
                                <code>Delete</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Nudge Up</h5>
                            <div flex="row nowrap items-center">
                                <code>Up arrow</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Nudge Down</h5>
                            <div flex="row nowrap items-center">
                                <code>Down arrow</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Nudge Left</h5>
                            <div flex="row nowrap items-center">
                                <code>Left arrow</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Nudge Right</h5>
                            <div flex="row nowrap items-center">
                                <code>Right arrow</code>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h4>Column</h4>
                    <div class="hotkeys">
                        <div class="hotkey">
                            <h5>New column</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>Enter</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Delete</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>Delete</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Toggle nullable</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>k</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Toggle index</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>i</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Toggle primary key</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>p</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Toggle unique</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>u</code>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h4>Editor</h4>
                    <div class="hotkeys">
                        <div class="hotkey">
                            <h5>Move canvas</h5>
                            <div flex="row nowrap items-center">
                                <code>Space</code>
                                <code>drag</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Zoom canvas</h5>
                            <div flex="row nowrap items-center">
                                <code>Scroll</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Create table</h5>
                            <div flex="row nowrap items-center">
                                <code>Right click</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Save</h5>
                            <div flex="row nowrap items-center">
                                <code>Ctrl</code>
                                <code>s</code>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="section">
                    <h4>Connections</h4>
                    <div class="hotkeys">
                        <div class="hotkey">
                            <h5>Change type</h5>
                            <div flex="row nowrap items-center">
                                <code>Right click</code>
                            </div>
                        </div>
                        <div class="hotkey">
                            <h5>Delete</h5>
                            <div flex="row nowrap items-center">
                                <code>Delete</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        render(view, this);
    }
}
env.bind("help-modal", HelpModal);
