import { configure, mount } from "@codewithkyle/router";

(() => {
    const main = document.body;
    mount(main);

    configure({
        "/": "home-page",
        "/diagram/{UID}": "editor-page",
        "/session/{diagram}/{room}": "collab-page",
        "404": "missing-page",
    });
})();
