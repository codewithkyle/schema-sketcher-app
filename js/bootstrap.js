(async()=>(window.location.hostname!=="localhost"&&"serviceWorker"in navigator&&await navigator.serviceWorker.register(`${location.origin}/service-worker.js`),await import("/js/routes.js")))();
