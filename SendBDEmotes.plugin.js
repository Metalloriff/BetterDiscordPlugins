//META{"name":"SendBDEmotes"}*//

class SendBDEmotes {
	
    getName() { return "Send BD Emotes"; }
    getDescription() { return "Allows you to enclose Better Discord emotes in square brackets to send them as a higher resolution link that all users can see. Example: [forsenE]. You can also do [EmoteChannelName.EmoteName]. Example: [FrankerFaceZ.SeemsGood]."; }
    getVersion() { return "0.3.4"; }
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

	getSettingsPanel() {

		setTimeout(() => {
			
			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createRadioGroup("sbde-size", "Emote size:", [
				{ title : "Small", description : "BD default", value : 1 },
				{ title : "Medium", value : 2 },
				{ title : "Large", value : 4 }
			], this.settings.emoteSize, (e, choice) => {
				this.settings.emoteSize = choice.value;
				this.saveSettings();
			}), this.getName());

		}, 0);

		return Metalloriff.Settings.Elements.pluginNameLabel(this.getName());

	}

	saveSettings() { PluginUtilities.saveSettings("SendBDEmotes", this.settings); }
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SendBDEmotes.plugin.js");

		var lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://www.dropbox.com/s/cxhekh6y9y3wqvo/NeatoBurritoLibrary.js?raw=1");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			document.head.appendChild(lib);
		}
		
		this.hasPermission = InternalUtilities.WebpackModules.findByUniqueProperties(["can"]).can;
		this.uploadFile = InternalUtilities.WebpackModules.findByUniqueProperties(["upload"]).upload;

		this.settings = PluginUtilities.loadSettings("SendBDEmotes", {
			emoteSize : 4
		});

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
							var i = emote.lastIndexOf("1"), size = this.settings.emoteSize, selectedChannelId = Metalloriff.getSelectedChannel().id;

                            chatbox.focus();
                            chatbox.select();
							document.execCommand("insertText", false, chatbox.value.split(lastWord).join(""));
							
							var request = () => Metalloriff.requestFile(emote.substring(0, i) + size + emote.substring(i + 1), emoteName + ".png", file => {
								if(file.size < 100) {
									if(size > 1) {
										size--;
										request();
									}
									return;
								}
								this.uploadFile(selectedChannelId, file);
							});

							request();
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
