(async () => {
    if (window.location.hostname !== "localhost" && "serviceWorker" in navigator) {
        await navigator.serviceWorker.register(`${location.origin}/service-worker.js`);
    }

    //@ts-ignore
    await import("/js/routes.js");
})();
