import t from"./alerts.js";(async()=>(window.location.hostname!=="localhost"&&"serviceWorker"in navigator&&new Promise(async o=>{let a=!1;await new Promise(e=>{navigator.serviceWorker.register("/service-worker.js",{scope:"/"}),navigator.serviceWorker.addEventListener("message",r=>{localStorage.setItem("version",r.data),e()}),navigator.serviceWorker.ready.then(async r=>{try{await import("/service-worker-assets.js?t="+Date.now()),self.manifest.version!==localStorage.getItem("version")?(localStorage.removeItem("version"),a=!0,r.active.postMessage(self.manifest)):e()}catch{e()}})}),a&&t.snackbar("Schema Sketcher is ready to work offline"),o()}),import("/js/routes.js")))();