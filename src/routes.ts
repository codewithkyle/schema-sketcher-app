import { router, mount } from "@codewithkyle/router";

(() => {
    router.add("/", "home-page");
    router.add("/*", "missing-page");

    const main = document.body;
    mount(main);
})();
