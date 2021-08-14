import db from "@codewithkyle/jsql";

(async () => {
    // @ts-ignore
    const { env } = await import("/config.js");
    if (env === "production"){
        await navigator.serviceWorker.register('service-worker.js');
    }

    // @ts-ignore
    await db.start();

    // @ts-ignore
    const items = await db.query("SELECT name FROM icons");
    if (items.length !== 2681){
        // @ts-ignore
        db.ingest(`${location.origin}/icons.ndjson`, "icons");
    }

    //@ts-ignore
    await import("/js/routes.js");
})();