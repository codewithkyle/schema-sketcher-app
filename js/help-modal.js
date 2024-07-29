import i from"./supercomponent.js";import{html as c,render as t}from"./lit-html.js";import d from"./env.js";class o extends i{constructor(){super();this.noop=e=>{e.stopImmediatePropagation()};this.model={}}async connected(){window.addEventListener("wheel",this.noop,{passive:!1,capture:!0}),await d.css(["help-modal"]),this.render()}disconnected(){window.removeEventListener("wheel",this.noop,{capture:!0})}render(){const e=c`
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
            </div>
        `;t(e,this)}}d.bind("help-modal",o);export{o as default};
