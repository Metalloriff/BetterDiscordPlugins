//META{"name":"SendBDEmotes"}*//

class SendBDEmotes {
	
	constructor() {
		this.emotes;
	}
	
    getName() { return "Send BD Emotes"; }
    getDescription() { return "Allows you to enclose Better Discord emotes in square brackets to send them as a higher resolution link that all users can see."; }
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
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SendBDEmotes.plugin.js");
        this.emotes = InternalUtilities.WebpackModules.findByUniqueProperties(["bdEmotes"]).bdEmotes;
        this.onSwitch();
	}

    onSwitch(){
		var chatboxJQ = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatboxJQ.length){
			var chatbox = chatboxJQ[0];
			chatboxJQ.on("keydown.SendBDEmotes", e => {
				if(e.which == 13 && !e.shiftKey && chatbox.value){
                    var chatboxValue = chatbox.value;
                    if(chatboxValue.startsWith("[") && chatboxValue.endsWith("]")){
                        var emoteName = chatboxValue.substring(1, chatboxValue.length - 1), emote = this.emotes.TwitchSubscriber[emoteName] || this.emotes.BTTV[emoteName] || this.emotes.BTTV2[emoteName] || this.emotes.FrankerFaceZ[emoteName] || this.emotes.TwitchGlobal[emoteName];
                        if(emote != undefined){
                            var i = emote.lastIndexOf("1");

                            chatboxValue = emote.substring(0, i) + "3" + emote.substring(i + 1);

                            chatbox.focus();
                            chatbox.select();
                            document.execCommand("insertText", false, chatboxValue);
                        }
                    }
				}
			});
		}
    }
	
    stop() {
		var chatbox = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatbox)
			chatbox.off("keydown.SendBDEmotes");
    }
	
}
