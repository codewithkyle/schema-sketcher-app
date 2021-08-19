import db from "@codewithkyle/jsql";

(async () => {
    // @ts-ignore
    const { env } = await import("/config.js");
    if (env === "production"){
        await navigator.serviceWorker.register(`${location.origin}/service-worker.js`);
    }

    await db.start({
        schema: `${location.origin}/static/schema.json`,
        dbWorker: `${location.origin}/static/jsql.worker.js`,
        streamWorker: `${location.origin}/static/stream.worker.js`,
    });

    // @ts-ignore
    const items = await db.query("SELECT name FROM icons");
    if (items.length !== 2681){
        // @ts-ignore
        db.ingest(`${location.origin}/static/icons.ndjson`, "icons");
    }

    //@ts-ignore
    await import("/js/routes.js");
})();