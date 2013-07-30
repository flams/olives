({
    baseUrl: "../src",
    include: ["Bind.plugin", "DomUtils", "Event.plugin", "LocalStore", "OObject", "Place.plugin", "Plugins", "SocketIOTransport", "Stack", "LocationRouter"],
    paths: {
    	"Store": "empty:",
    	"Tools": "empty:",
    	"Observable": "empty:",
    	"StateMachine": "empty:",
    	"Promise": "empty:",
    	"Transport": "empty:",
    	"Router": "empty:"
    },
    optimize: "none",
    out: "../temp.js"
})
