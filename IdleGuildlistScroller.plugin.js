//META{"name":"IdleGuildlistScroller"}*//

class IdleGuildlistScroller {
	
    getName() { return "Idle Guildlist Scroller"; }
    getDescription() { return "Automatically scrolls to the top of the guilds list after the specified amount of time that your mouse isn't over it."; }
    getVersion() { return "0.1.1"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		return "Delay (ms):<br><input id='igs-delay' type='number' value='" +  IdleGuildlistScroller.delay + "'>ms<br><br><input id='igs-includeChannels' type='checkbox' class='ui-switch-checkbox'" + (IdleGuildlistScroller.includeChannels ? " checked" : "") + ">Check if mouse is over channel list</input><br><br><button onclick='IdleGuildlistScroller.resetSettings();'>Reset Settings</button><br><br><button onclick='IdleGuildlistScroller.saveSettings();'>Save & Update</button>";
	}
	
	static saveSettings(){
		IdleGuildlistScroller.delay = document.getElementById("igs-delay").value;
		IdleGuildlistScroller.includeChannels = document.getElementById("igs-includeChannels").checked;
		PluginUtilities.saveData("IdleGuildlistScroller", "settings", {delay : IdleGuildlistScroller.delay, includeChannels : IdleGuildlistScroller.includeChannels});
		PluginUtilities.showToast("Settings saved! You will need to switch channels for them to take effect.");
	}
	
	static resetSettings(){
		IdleGuildlistScroller.delay = 1000;
		IdleGuildlistScroller.includeChannels = true;
		PluginUtilities.showToast("Settings reset! You will still have to save and update.");
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
		IdleGuildlistScroller.resetSettings();
		var data = PluginUtilities.loadData("IdleGuildlistScroller", "settings", {delay : 1000, includeChannels : true});
		IdleGuildlistScroller.delay = data["delay"];
		IdleGuildlistScroller.includeChannels = data["includeChannels"];
		this.guildsList.addEventListener("mouseenter", this.onHover, false);
		this.guildsList.addEventListener("mouseleave", this.offHover, false);
		this.onSwitch();
	}
	
	onSwitch(){
		if(IdleGuildlistScroller.includeChannels && this.channelList){
			this.channelList.addEventListener("mouseenter", this.onHover, false);
			this.channelList.addEventListener("mouseleave", this.offHover, false);
		}else if(this.channelList){
			this.channelList.removeEventListener("mouseenter", this.onHover);
			this.channelList.removeEventListener("mouseleave", this.offHover);
		}
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
		if(this.channelList){
			this.channelList.removeEventListener("mouseenter", this.onHover);
			this.channelList.removeEventListener("mouseleave", this.offHover);
		}
	}

	get guildsList(){
		return document.getElementsByClassName("guilds-wrapper")[0];
	}
	
	get channelList(){
		return document.getElementsByClassName("scroller-fzNley scroller-NXV0-d")[0];
	}
	
}
