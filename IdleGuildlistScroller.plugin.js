//META{"name":"IdleGuildlistScroller"}*//

class IdleGuildlistScroller {
	
    getName() { return "Idle Guildlist Scroller"; }
    getDescription() { return "Automatically scrolls to the top of the guilds list after the specified amount of time that your mouse isn't over it."; }
    getVersion() { return "0.0.1"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		return "Delay (ms):<br><input id='gas-delay' type='number' value='" + IdleGuildlistScroller.delay + "'>ms<br><br><button onclick='IdleGuildlistScroller.saveSettings();'>Save</button>";
	}
	
	static saveSettings(){
		IdleGuildlistScroller.delay = document.getElementById("gas-delay").value;
		PluginUtilities.saveData("IdleGuildlistScroller", "settings", {delay : IdleGuildlistScroller.delay});
	}

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
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/IdleGuildlistScroller.plugin.js");
		IdleGuildlistScroller.delay = PluginUtilities.loadData("IdleGuildlistScroller", "settings", {delay : 1000})["delay"];
		this.guildsList.addEventListener("mouseenter", this.onHover, false);
		this.guildsList.addEventListener("mouseleave", this.offHover, false);
	}
	
	onHover(){
		if(IdleGuildlistScroller.sttFunc)
			clearTimeout(IdleGuildlistScroller.sttFunc);
	}
	
	offHover(){
		IdleGuildlistScroller.sttFunc = setTimeout(function(){
			$(document.getElementsByClassName("guilds scroller")[0]).animate({scrollTop : 0}, "fast");
		}, IdleGuildlistScroller.delay);
	}
	
    stop() {
		this.guildsList.removeEventListener("mouseenter", this.onHover);
		this.guildsList.removeEventListener("mouseleave", this.offHover);
	}

	get guildsList(){
		return document.getElementsByClassName("guilds-wrapper")[0];
	}
	
}