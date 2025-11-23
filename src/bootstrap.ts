import notifications from "~brixi/controllers/alerts";

(async () => {
    if (window.location.hostname !== "localhost" && "serviceWorker" in navigator) {
        new Promise<void>(async (res) => {
            let updated = false;
            await new Promise<void>(resolve => {
                navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
                navigator.serviceWorker.addEventListener("message", (e) => {
                    localStorage.setItem("version", e.data);
                    resolve();
                });
                navigator.serviceWorker.ready.then(async (registration) => {
                    try {
                        await import("/service-worker-assets.js?t=" + Date.now());
                        // @ts-expect-error
                        if (self.manifest.version !== localStorage.getItem("version")) {
                            localStorage.removeItem("version");
                            updated = true;
                            // @ts-expect-error
                            registration.active.postMessage(self.manifest);
                        } else {
                            resolve();
                        }
                    } catch (e) {
                        resolve();
                        //registration.active.postMessage({
                            //version: localStorage.getItem("version") || "init",
                        //});
                    }
                });
            });
            if (updated) {
                notifications.snackbar("Schema Sketcher is ready to work offline");
            }
            res();
        });
    }

    const hash = location.hash;
    if (hash.indexOf("#data:") === 0) {
        const data = hash.slice("#data:".length);
        sessionStorage.setItem("data", data);
    }
    history.replaceState(null, "", "/");

    //@ts-ignore
    import("/js/routes.js");
})();
