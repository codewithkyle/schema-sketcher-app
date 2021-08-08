import { configure, mount } from "@codewithkyle/router";

(() => {
    const main = document.body;
    mount(main);

    configure({
        "/": "home-page",
        "/diagram/{UID}": "editor-page",
        "404": "missing-page",
    });
})();