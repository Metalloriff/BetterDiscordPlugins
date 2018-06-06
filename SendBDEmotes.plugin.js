//META{"name":"SendBDEmotes"}*//

class SendBDEmotes {
	
    getName() { return "Send BD Emotes"; }
    getDescription() { return "Allows you to enclose Better Discord emotes in square brackets to send them as a higher resolution link that all users can see. Example: [forsenE]. You can also do [EmoteChannelName.EmoteName]. Example: [FrankerFaceZ.SeemsGood]. [EmoteName:size]. Example: [forsenE:1]. And [EmoteName_a] for animated emotes."; }
    getVersion() { return "0.5.8"; }
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

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleGroup("sbde-toggle-group", "Settings", [
				{ title : "Send emotes as links (faster)", value : "sendAsLink", setValue : this.settings.sendAsLink },
				{ title : "Display emote auto-complete preview", value : "displayPreview", setValue : this.settings.displayPreview }
			], choice => {
				this.settings[choice.value] = !this.settings[choice.value];
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createTextField("Maximum amount of emotes to preview", "number", this.settings.previewLimit, e => {
				this.settings.previewLimit = e.target.value;
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
		this.messageModule = InternalUtilities.WebpackModules.findByUniqueProperties(["sendMessage"]);

		this.settings = PluginUtilities.loadSettings("SendBDEmotes", {
			emoteSize : 4,
			sendAsLink : false,
			displayPreview : true,
			previewLimit : 25
		});

		this.getEmotes();
		
		this.onKeyDown = e => {

			if(!e.target.value) {
				if(document.getElementById("sbde-autocomplete")) document.getElementById("sbde-autocomplete").outerHTML = "";
				return;
			}

			let words = e.target.value.split(" "), lastWord = words[words.length - 1];

			if(e.key == "Enter" && !e.shiftKey && lastWord.startsWith("[") && lastWord.endsWith("]")){

				let emoteName = lastWord.substring(1, lastWord.length - 1), size = this.settings.emoteSize, animated = false;

				if(emoteName.includes(":")) {
					let trySize = parseInt(emoteName.substring(emoteName.indexOf(":") + 1, emoteName.length));
					if(trySize != NaN) {
						size = trySize;
						emoteName = emoteName.substring(0, emoteName.indexOf(":"));
					}
				}

				if(emoteName.endsWith("_a")) {
					animated = true;
					emoteName = emoteName.replace("_a", "");
				}

				let emote = window.bdEmotes.TwitchGlobal[emoteName] || window.bdEmotes.TwitchSubscriber[emoteName] || window.bdEmotes.BTTV[emoteName] || window.bdEmotes.FrankerFaceZ[emoteName] || window.bdEmotes.BTTV2[emoteName];

				if(emoteName.includes(".")){
					let sourceAndName = emoteName.split(".");
					emote = window.bdEmotes[sourceAndName[0]][sourceAndName[1]];
				}

				if(emote != undefined){

					let message = e.target.value.split(lastWord).join("");

					e.target.select();
					document.execCommand("delete");

					this.trySend(message, emoteName, emote, size, animated);
					
				} else if(emoteName == "RANDOM") {

					let randomEmote = this.emotes[this.emotes.length * Math.random() << 0], message = e.target.value.split(lastWord).join("");

					e.target.select();
					document.execCommand("delete");

					this.trySend(message, randomEmote.name, randomEmote.url, size, animated);

				}

				if(document.getElementById("sbde-autocomplete")) document.getElementById("sbde-autocomplete").outerHTML = "";

				return;

			}

			if(lastWord.endsWith("]")) {
				if(document.getElementById("sbde-autocomplete")) document.getElementById("sbde-autocomplete").outerHTML = "";
				return;
			}

		};

		this.onKeyUp = e => {

			if(!this.settings.displayPreview) return;

			let words = e.target.value.split(" "), lastWord = words[words.length - 1], autocomplete = document.getElementById("sbde-autocomplete");
			
			if(lastWord.startsWith("[")){

				let emoteName = lastWord.substring(1, lastWord.length);

				if(!autocomplete) {

					e.target.parentElement.insertAdjacentHTML("beforeend", `
						<div id="sbde-autocomplete" class="autocomplete-1vrmpx autocomplete-i9yVHs" style="width:inherit">
							<div class="autocompleteInner-zh20B_">
								<div class="autocompleteRowVertical-q1K4ky autocompleteRow-2OthDa">
									<div class="selector-2IcQBU">
										<div class="contentTitle-2tG_sM small-29zrCQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi"></div>
									</div>
								</div>
								<div id="sbde-autocomplete-list" class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 horizontalAutocompletes-x8hlrn scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="flex: 1 1 auto;">
									
								</div>
							</div>
						</div>
					`);

					autocomplete = document.getElementById("sbde-autocomplete");

				}

				let list = document.getElementById("sbde-autocomplete-list");

				list.innerHTML = "";

				let lim = 0;
				for(let i = 0; i < this.emotes.length; i++) {
					if(this.emotes[i].name.startsWith(emoteName)) {

						if(lim >= this.settings.previewLimit) break;

						list.insertAdjacentHTML("beforeend", `
							<div class="horizontalAutocomplete-1DAQoM autocompleteRowHorizontal-32jwnH autocompleteRow-2OthDa">
								<div class="selectorSelected-1_M1WV selector-2IcQBU selectable-3dP3y-"><img src="${this.emotes[i].url}" width="50" height="50"></div>
							</div>
						`);

						let images = list.getElementsByTagName("img"), lastImage = images[images.length - 1];

						new PluginTooltip.Tooltip($(lastImage), this.emotes[i].name, { side : "top" });

						lastImage.addEventListener("click", ee => {

							if(ee.shiftKey) this.trySend("", this.emotes[i].name, this.emotes[i].url, this.settings.emoteSize);
							else {

								this.trySend(e.target.value.split(lastWord).join(""), this.emotes[i].name, this.emotes[i].url, this.settings.emoteSize);

								e.target.select();
								document.execCommand("delete");

								autocomplete.outerHTML = "";

							}

						});

						lim++;

					}
				}
			} else if(autocomplete) autocomplete.outerHTML = "";

		};

		this.onSwitch();

	}

	getEmotes() {

		let emoteChannels = Object.keys(window.bdEmotes);

		this.emotes = [];

		for(let ec of emoteChannels) {
			let emoteChannel = window.bdEmotes[ec];
			for(let emote in emoteChannel) {
				this.emotes.push({ name : emote, url : emoteChannel[emote] });
			}
		}

	}

	trySend(message, emoteName, emoteURL, size = 4, animated = false) {

		let i = emoteURL.lastIndexOf("1"), url = emoteURL.substring(0, i) + size + emoteURL.substring(i + 1);

		if(this.settings.sendAsLink) this.messageModule.sendMessage(Metalloriff.getSelectedChannel().id, { content : message + " " + url });
		else Metalloriff.requestFile(url, emoteName + (animated ? ".gif" : ".png"), file => {

			if(file.size < 100) {
				if(size > 1) this.trySend(message, emoteName, emoteURL, size - 1, animated);
				return;
			}

			this.uploadFile(Metalloriff.getSelectedChannel().id, file, { content : message, tts : false });

		});

	}

    onSwitch(){

		if(this.emotes.length == 0) this.getEmotes();

		let chatbox = Metalloriff.Chatbox.get();

		if(chatbox) {
			chatbox.addEventListener("keydown", this.onKeyDown);
			chatbox.addEventListener("keyup", this.onKeyUp)
		}

    }
	
    stop() {

		let chatbox = Metalloriff.Chatbox.get();
		
		if(chatbox) {
			chatbox.removeEventListener("keydown", this.onKeyDown);
			chatbox.removeEventListener("keyup", this.onKeyUp);
		}

    }
	
}
