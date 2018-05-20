//META{"name":"OpenLinksInDiscord"}*//

class OpenLinksInDiscord {
	
    getName() { return "OpenLinksInDiscord"; }
    getDescription() { return "Opens all links in a new window in Discord, instead of in your web browser. Hold shift to open links normally."; }
    getVersion() { return "0.0.1"; }
	getAuthor() { return "Metalloriff"; }

    load() {}

    start() {

		var libraryScript = document.getElementById('zeresLibraryScript');
		if (!libraryScript) {
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
			libraryScript.setAttribute("id", "zeresLibraryScript");
			document.head.appendChild(libraryScript);
		}
		if (typeof window.ZeresLibrary !== "undefined") this.initialize();
		else libraryScript.addEventListener("load", () => { this.initialize(); });

	}
	
	initialize() {

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/OpenLinksInDiscord.plugin.js");
        
        this.$document = $(document);

        this.$document.on("click.OpenLinksInDiscord", e => {
            if(e.target.localName == "a" && e.target.href && e.target.href.startsWith("http") && !e.target.href.includes("/channels/") && !e.shiftKey) this.onClickLink(e);
        });

		this.electron = require("electron");
		
	}
    
    onClickLink(e) {

		let window = new this.electron.remote.BrowserWindow({ frame : true, resizeable : true, show : true });

		window.maximize();
		window.setMenu(null);
        window.loadURL(e.target.href);
        
        e.preventDefault();

    }
	
    stop() {
        this.$document.off("click.OpenLinksInDiscord");
	}
	
}