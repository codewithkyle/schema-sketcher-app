(async () => {
    if (window.location.hostname !== "localhost" && "serviceWorker" in navigator) {
        await new Promise<void>(resolve => {
            navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
            navigator.serviceWorker.addEventListener("message", (e) => {
                localStorage.setItem("version", e.data);
            });
            navigator.serviceWorker.ready.then(async (registration) => {
                try {
                    await import("/static/service-worker-assets.js?t=" + Date.now());
                    // @ts-expect-error
                    if (self.manifest.version !== localStorage.getItem("version")) {
                        localStorage.removeItem("version");
                    } else {
                        // @ts-expect-error
                        delete self.manifest.assets;
                    }
                    // @ts-expect-error
                    registration.active.postMessage(self.manifest);
                } catch (e) {
                    registration.active.postMessage({
                        version: localStorage.getItem("version") || "init",
                    });
                }
                resolve();
            });
        });
    }

    //@ts-ignore
    await import("/js/routes.js");
})();
