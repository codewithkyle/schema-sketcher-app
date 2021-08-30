import SuperComponent from "@codewithkyle/supercomponent";
import { html, render } from "lit-html";
import { css, mount } from "~controllers/env";

interface ICollabPage {
    diagram: Diagram,
}
export default class CollabPage extends SuperComponent<ICollabPage>{
    constructor(tokens, params){
        super();
    }
}
mount("collab-page", CollabPage);
