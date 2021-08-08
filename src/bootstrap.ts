import db from "@codewithkyle/jsql";

(async () => {
    await db.start();

    //@ts-ignore
    await import("/js/router.js");
})();