//META{"name":"SendBDEmotes"}*//

class SendBDEmotes {
	
    getName() { return "Send BD Emotes"; }
    getDescription() { return "Allows you to enclose Better Discord emotes in square brackets to send them as a higher resolution link that all users can see."; }
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
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SendBDEmotes.plugin.js");
        this.onSwitch();
	}

    onSwitch(){
		var chatboxJQ = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatboxJQ.length){
			var chatbox = chatboxJQ[0];
			chatboxJQ.on("keydown.SendBDEmotes", e => {
				if(e.which == 13 && !e.shiftKey && chatbox.value){
                    var chatboxValue = chatbox.value, words = chatboxValue.split(" "), lastWord = words[words.length - 1];
                    if(lastWord.startsWith("[") && lastWord.endsWith("]")){
                        var emoteName = lastWord.substring(1, lastWord.length - 1), emote = window.bdEmotes.TwitchSubscriber[emoteName] || window.bdEmotes.BTTV[emoteName] || window.bdEmotes.BTTV2[emoteName] || window.bdEmotes.FrankerFaceZ[emoteName] || window.bdEmotes.TwitchGlobal[emoteName];
                        if(emote != undefined){
                            var i = emote.lastIndexOf("1");

							words[words.length - 1] = emote.substring(0, i) + (emote.includes("cdn.frankerfacez.com") ? "4" : "3") + emote.substring(i + 1);
							
							chatboxValue = words.join(" ");

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
