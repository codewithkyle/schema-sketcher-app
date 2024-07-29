import SuperComponent from "@codewithkyle/supercomponent";
import { render, html, TemplateResult } from "lit-html";
import env from "~brixi/controllers/env";
import modals from "~brixi/controllers/modals";
import diagramController from "~controllers/diagram-controller";
import saveFile from "~utils/save-file";
import "~brixi/components/input/input";
import openFile from "~utils/open-file";
import notifications from "~brixi/controllers/alerts";
import { subscribe } from "~lib/pubsub";
import SettingsModal from "~components/settings-modal/settings-modal";
import HelpModal from "~components/help-modal/help-modal";

interface IBasicHeader {
    open: boolean;
    unsaved: boolean;
}
export default class MainMenu extends SuperComponent<IBasicHeader>{
    private file:FileSystemFileHandle;

    constructor(){
        super();
        this.file = null;
        this.model = {
            open: false,
            unsaved: false,
        }; 
        subscribe("diagram", this.diagramInbox.bind(this));
    }

    override async connected(){
        await env.css(["main-menu", "button", "modals"]).then(() => {
            this.render();
        });
        window.addEventListener("beforeunload",  (e) => {
            if (this.model.unsaved) {
                var confirmationMessage = 'Are you sure you want to exit? You have unsaved changes.';
                (e || window.event).returnValue = confirmationMessage; //Gecko + IE
                return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
            }
        });
    }

    private diagramInbox({type,data}){
        switch(type){
            case "dirty":
                this.set({
                    unsaved: true,
                });
                break;
            case "load":
                this.file = null;
                this.set({
                    unsaved: false,
                });
                break;
            case "reset":
                this.file = null;
                this.set({
                    unsaved: false,
                });
                break;
            default:
                break;
        }
    }

    private toggle:EventListener = (e:Event) => {
        this.set({
            open: !this.model.open,
        });
    }

    private onReset:EventListener = (e:Event) => {
        modals.dangerous({
            title: "Reset the canvas?",
            message: "This will remove all of your work and cannot be undone.",
            confirm: "Reset",
            cancel: "Cancel",
            callbacks: {
                confirm: () => {
                    diagramController.reset();
                }
            }
        });
    }

    public async save() {
        const [diagram, json] = diagramController.export();
        const fileName = diagram.fileName || "untitled";
        if (this.file !== null) {
            this.file = await saveFile(new Blob([json], {type: "application/json"}), {
                fileName: `${diagram.fileName}.json`,
                mimeTypes: ["application/json"],
                extensions: [".json"],
                id: diagram.uid.replace(/-/g, ""),
            }, this.file);
            notifications.toast("File saved");
            this.set({
                unsaved: false,
            });
        } else {
            modals.form({
                title: "Save diagram",
                view: html`
                    <brixi-input
                        data-value="${fileName}"
                        data-name="fileName"
                        data-required="true"
                    ></brixi-input>
                `,
                submit: "Save",
                callbacks: {
                    submit: async (data, form, modal) => {
                        diagramController.setFileName(data.fileName);
                        if (window?.showSaveFilePicker) {
                            this.file = await saveFile(new Blob([json], {type: "application/json"}), {
                                fileName: `${data.fileName}.json`,
                                mimeTypes: ["application/json"],
                                extensions: [".json"],
                                id: diagram.uid.replace(/-/g, ""),
                            }, this.file);
                        } else {
                            const blob = new Blob([json], {type: "application/json"});
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${data.fileName}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }
                        modal.remove();
                        notifications.toast("File saved");
                        this.set({
                            unsaved: false,
                        });
                    },
                }
            });
        }
    }

    private onSave:EventListener = (e:Event) => {
        this.save();
    }

    private onOpen:EventListener = (e:Event) => {
        if (window?.showOpenFilePicker) {
            openFile({
                description: "Schema Sketcher Diagram",
                mimeTypes: ["application/json"],
                extensions: [".json"],
            }).then((file) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const json = e.target.result as string;
                    diagramController.import(json);
                    notifications.toast("File opened");
                };
                reader.readAsText(file);
            });
        } else {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".json";
            input.onchange = (e) => {
                const file = input.files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                    const json = e.target.result as string;
                    diagramController.import(json);
                    notifications.toast("File opened");
                };
                reader.readAsText(file);
            };
            input.click();
        }
    }

    private onSettings:EventListener = (e:Event) => {
        modals.raw({
            view: html`${new SettingsModal()}`,
            closeable: true,
        });
    }

    private onHelp:EventListener = (e:Event) => {
        modals.raw({
            view: html`${new HelpModal()}`,
            width: 769,
            closeable: true,
        });
    }

    private onInstall:EventListener = (e:Event) => {
        console.log(window?.deferredInstallPrompt);
        if (window?.deferredInstallPrompt) {
            window.deferredInstallPrompt.prompt();
            window.deferredInstallPrompt.userChoice.then(() => {
                window.deferredInstallPrompt = null;
            });
        } else {
            notifications.snackbar("Your browser does not support installation of web applications.");
        }
    }

    private renderMenuButton(): TemplateResult {
        if (this.model.open) {
            return html`
                <button @mousedown=${this.toggle} tooltip aria-label="Close">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
                </button>
            `;
        } else {
            return html`
                <button @mousedown=${this.toggle} tooltip aria-label="Open">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 6l16 0" /><path d="M4 12l16 0" /><path d="M4 18l16 0" /></svg>
                </button>
            `;
        }
    }

    private renderMenu(): TemplateResult | string {
        if (!this.model.open) return "";
        return html`
            <nav>
                <button @mousedown=${this.onOpen}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" /></svg>
                    <span>Open</span>
                </button>
                <button @mousedown=${this.onSave}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                    <span>Save to...</span>
                </button>
                <button @mousedown=${this.onHelp}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 17l0 .01" /><path d="M12 13.5a1.5 1.5 0 0 1 1 -1.5a2.6 2.6 0 1 0 -3 -4" /></svg>
                    <span>Help</span>
                </button>
                <button @mousedown=${this.onSettings}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" /><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>
                    <span>Settings</span>
                </button>
                <button @mousedown=${this.onReset}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 7l16 0" /><path d="M10 11l0 6" /><path d="M14 11l0 6" /><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12" /><path d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3" /></svg>
                    <span>Reset the canvas</span>
                </button>
                <hr>
                <a href="https://github.com/codewithkyle/schema-sketcher-app">
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" /></svg>
                    <span>Github</span>
                </a>
                <button @mousedown=${this.onInstall}>
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M13 16.5v-7.5a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1v3.5" /><path d="M18 8v-3a1 1 0 0 0 -1 -1h-13a1 1 0 0 0 -1 1v12a1 1 0 0 0 1 1h8" /><path d="M19 16v6" /><path d="M22 19l-3 3l-3 -3" /><path d="M16 9h2" /></svg>
                    <span>Install app</span>
                </button>
            </nav>
        `;
    }

    override render(){
        const view = html`
            ${this.renderMenuButton()}
            ${this.renderMenu()}
            <div class="unsaved-warning ${this.model.unsaved ? 'visible' : ''}">
                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" /><path d="M12 9v4" /><path d="M12 16v.01" /></svg>
                <span>Unsaved changes</span>
            </div>
        `;
        render(view, this);
    }
}
env.bind("main-menu", MainMenu);
