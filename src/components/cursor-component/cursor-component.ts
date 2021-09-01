import { css, mount } from "~controllers/env";

class CursorComponent extends HTMLElement{
    private x: number;
    private y: number;
    private uid: string;
    private name: string;

    constructor(cursor){
        css(["cursor-component"]);
        this.x = cursor.x;
        this.y = cursor.y;
        this.uid = cursor.uid;
        this.name = cursor.name;
    }
}
mount("cursor-component", CursorComponent);
