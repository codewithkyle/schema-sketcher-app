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
}
export default class MainMenu extends SuperComponent<IBasicHeader>{
    private file:FileSystemFileHandle;

    constructor(){
        super();
        this.file = null;
        this.model = {
            open: false,
        };
        env.css(["main-menu", "button", "modals"]).then(() => {
            this.render();
        });
        subscribe("diagram", this.diagramInbox.bind(this));
    }

    private diagramInbox({type,data}){
        switch(type){
            case "load":
                this.file = null;
                break;
            case "reset":
                this.file = null;
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

    private onSave:EventListener = async (e:Event) => {
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
                    },
                }
            });
        }
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
            </nav>
        `;
    }

    override render(){
        const view = html`
            ${this.renderMenuButton()}
            ${this.renderMenu()}
        `;
        render(view, this);
    }
}
env.bind("main-menu", MainMenu);
