({
    baseUrl: "../src",
    include: ["Bind.plugin", "DomUtils", "Event.plugin", "LocalStore", "OObject", "Place.plugin", "Plugins", "SocketIOTransport"],
    paths: {
    	lib: "../lib"
    },
    deps: ["lib/Emily"],
    optimize: "none",
    out: "../temp.js"
})
