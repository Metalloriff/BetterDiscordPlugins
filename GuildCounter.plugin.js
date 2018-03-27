//META{"name":"GuildCounter"}*//

class GuildCounter {
	
    getName() { return "Guild Counter"; }
    getDescription() { return "Displays a guild counter below the online friend counter."; }
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
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/GuildCounter.plugin.js");
		this.count();
		$(".guilds-wrapper > div.scroller-wrap > div").on("DOMNodeInserted.GuildCounter", e => { this.count(e); });
	}
	
	count(){
		var label = $("#sc-counter"), count = Object.keys(ZeresLibrary.InternalUtilities.WebpackModules.findByUniqueProperties(["getGuilds"]).getGuilds()).length;
		if(label.length)
			label[0].innerText = count + " Guilds";
		else
			label = $(`<div id="sc-counter" class="friends-online">` + count + ` Guilds</div>`).insertAfter(".friends-online");
	}
	
    stop() {
		$(".guilds-wrapper > div.scroller-wrap > div").off("DOMNodeInserted.GuildCounter");
	}
	
}