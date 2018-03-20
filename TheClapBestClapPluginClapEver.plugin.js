//META{"name":"TheClapBestClapPluginClapEver"}*//

class TheClapBestClapPluginClapEver {
	
    getName() { return "The Clap Best Clap Plugin Clap Ever"; }
    getDescription() { return "Literally the most useless plugin ever. Put \"clapclap:\" at the first of your message to replace spaces with clap emojis."; }
    getVersion() { return "0.1.1"; }
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
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/TheClapBestClapPluginClapEver.plugin.js");
		this.attach();
	}
	
	onSwitch(){
		this.attach();
	}
	
	attach(){
		var chatboxJQ = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatboxJQ.length){
			var chatbox = chatboxJQ[0];
			chatboxJQ.on("keydown.ClapClap", e => {
				if(e.which == 13 && !e.shiftKey && chatbox.value){
					var chatboxValue = chatbox.value;
					if(chatboxValue.startsWith("clapclap")){
						var getClapClap = chatboxValue.substring(0, chatboxValue.indexOf(":") + 1), emote = "clap", definedEmote = getClapClap.substring(getClapClap.indexOf("(") + 1, getClapClap.indexOf(")"));
						if(definedEmote)
							emote = definedEmote;
						emote = " :" + emote  + ": ";
						chatboxValue = chatboxValue.replace(getClapClap, "").split(" ").join(emote);
						if(chatboxValue.startsWith(emote))
							chatboxValue += emote;
					}
					chatbox.focus();
					chatbox.select();
					document.execCommand("insertText", false, chatboxValue);
				}
			});
		}
	}
	
    stop() {
		var chatbox = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatbox)
			chatbox.off("keydown.ClapClap");
	}
	
}
