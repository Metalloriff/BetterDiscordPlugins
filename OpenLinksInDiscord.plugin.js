//META{"name":"OpenLinksInDiscord"}*//

class OpenLinksInDiscord {
	
    getName() { return "OpenLinksInDiscord"; }
    getDescription() { return "Opens links in a new window in Discord, instead of in your web browser. Hold shift to open links normally."; }
    getVersion() { return "1.0.1"; }
	getAuthor() { return "Metalloriff"; }

    load() {}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
        else lib.addEventListener("load", libLoadedEvent);

	}
	
	onLibLoaded() {
		
		NeatoLib.Updates.check(this);

		this.event = e => {
            if(e.target.localName == "a" && e.target.href && e.target.href.startsWith("http") && !e.target.href.includes("/channels/") && !e.shiftKey) this.onClickLink(e);
		};
		
		document.addEventListener("click", this.event);

		this.electron = require("electron");

		NeatoLib.Events.onPluginLoaded(this);
		
	}
    
    onClickLink(e) {

		let window = new this.electron.remote.BrowserWindow({ frame : true, resizeable : true, show : true });

		window.maximize();
		window.setMenu(null);
        window.loadURL(e.target.href);
        
        e.preventDefault();

    }
	
    stop() {
        document.removeEventListener("click", this.event);
	}
	
}
