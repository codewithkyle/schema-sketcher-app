(async () => {
    //if (env === "production") {
        //await navigator.serviceWorker.register(`${location.origin}/service-worker.js`);
    //}

    //@ts-ignore
    await import("/js/routes.js");
})();
