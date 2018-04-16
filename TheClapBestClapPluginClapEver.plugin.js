//META{"name":"TheClapBestClapPluginClapEver"}*//

class TheClapBestClapPluginClapEver {
	
    getName() { return "The Clap Best Clap Plugin Clap Ever"; }
	getDescription() { return "Literally the most useless plugin ever. Put \"clapclap:\" at the first of your message to replace spaces with clap emojis. You can also do \"clapclap(some_emote_name):\" to use custom emotes, \"ra:\" to replace all characters with regional indicators, and \"reverse:\" to reverse the message."; }
    getVersion() { return "0.3.1"; }
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
					if(chatboxValue.startsWith("ra:")){
						var alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", temp = chatboxValue;
						temp = temp.split(" ").join("\t");
						for(var i = 0; i < alphabet.length; i++)
							temp = temp.replace("ra:", "").split(alphabet[i]).join("[a" + i + "]");
						for(var i = 0; i < alphabet.length; i++)
							temp = temp.split("[a" + i + "]").join(":regional_indicator_" + alphabet[i].toLowerCase() + ": ");
						temp = temp.split("?").join(":question:");
						chatboxValue = temp;
					}
					if(chatboxValue.startsWith("reverse:"))
						chatboxValue = chatboxValue.replace("reverse:", "").split("").reverse().join("");
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
