module.exports = {
    src: [
        {
            files: "./public/js/*.js",
            publicDir: "/js"
        },
        {
            files: "./public/css/*.css",
            publicDir: "/css"
        },
        {
            files: "./public/assets/*.png",
            publicDir: "/assets"
        },
    ],
    output: "./public/service-worker-assets.js",
    static: ["/", "/404"]
};
