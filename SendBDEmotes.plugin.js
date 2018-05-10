//META{"name":"SendBDEmotes"}*//

class SendBDEmotes {
	
    getName() { return "Send BD Emotes"; }
    getDescription() { return "Allows you to enclose Better Discord emotes in square brackets to send them as a higher resolution link that all users can see. Example: [forsenE]. You can also do [EmoteChannelName.EmoteName]. Example: [FrankerFaceZ.SeemsGood]."; }
    getVersion() { return "0.3.3"; }
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
		this.hasPermission = InternalUtilities.WebpackModules.findByUniqueProperties(["can"]).can;
		this.uploadFile = InternalUtilities.WebpackModules.findByUniqueProperties(["upload"]).upload;
		this.onSwitch();
	}

    onSwitch(){
		var chatboxJQ = $(".chat textarea");
		if(chatboxJQ.length){
			var chatbox = chatboxJQ[0];
			chatboxJQ.on("keydown.SendBDEmotes", e => {
				if(e.which == 13 && !e.shiftKey && chatbox.value){
                    var words = chatbox.value.split(" "), lastWord = words[words.length - 1];
                    if(lastWord.startsWith("[") && lastWord.endsWith("]")){
                        var emoteName = lastWord.substring(1, lastWord.length - 1), emote = window.bdEmotes.TwitchGlobal[emoteName] || window.bdEmotes.TwitchSubscriber[emoteName] || window.bdEmotes.BTTV[emoteName] || window.bdEmotes.FrankerFaceZ[emoteName] || window.bdEmotes.BTTV2[emoteName];
						if(emoteName.includes(".")){
							var sourceAndName = emoteName.split(".");
							emote = window.bdEmotes[sourceAndName[0]][sourceAndName[1]];
						}

                        if(emote != undefined){
							var i = emote.lastIndexOf("1"), url = emote.substring(0, i) + "4" + emote.substring(i + 1), selectedChannelId = Metalloriff.getSelectedChannel().id;

                            chatbox.focus();
                            chatbox.select();
							document.execCommand("insertText", false, chatbox.value.split(lastWord).join(""));
							
							Metalloriff.requestFile(url, emoteName + ".png", file => {
								this.uploadFile(selectedChannelId, file);
							});
                        }
                    }
				}
			});
		}
    }
	
    stop() {
		var chatbox = $(".chat textarea");
		if(chatbox)
			chatbox.off("keydown.SendBDEmotes");
    }
	
}
