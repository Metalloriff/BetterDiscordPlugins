//META{"name":"PreventSpotifyAutoPause","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/PreventSpotifyAutoPause.plugin.js"}*//

class PreventSpotifyAutoPause {
	
    getName() { return "PreventSpotifyAutoPause"; }
    getDescription() { return "Prevents Discord from automatically pausing Spotify after transmitting your microphone for 30 seconds."; }
    getVersion() { return "0.0.2"; }
	getAuthor() { return "Metalloriff"; }

    load() {}

    start() {
        const libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}

	onLibLoaded() {
		NeatoLib.Updates.check(this);

		this.unpatch = NeatoLib.monkeyPatchInternal(NeatoLib.Modules.get(["SpotifyResourceTypes", "pause"]), "pause", () => {});
		
		NeatoLib.Events.onPluginLoaded(this);
	}
	
    stop() {
		this.unpatch();
	}
	
}
