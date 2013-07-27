({
    baseUrl: "../src",
    include: ["Bind.plugin", "DomUtils", "Event.plugin", "LocalStore", "OObject", "Place.plugin", "Plugins", "SocketIOTransport", "Router"],
    paths: {
    	"Store": "empty:",
    	"Tools": "empty:",
    	"Observable": "empty:",
    	"StateMachine": "empty:",
    	"Promise": "empty:",
    	"Transport": "empty:"
    },
    optimize: "none",
    out: "../temp.js"
})
