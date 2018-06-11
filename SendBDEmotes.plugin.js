//META{"name":"SendBDEmotes"}*//

class SendBDEmotes {
	
    getName() { return "Send BD Emotes"; }
    getDescription() { return "Allows you to enclose Better Discord emotes in square brackets to send them as a higher resolution link that all users can see. Example: [forsenE]. You can also do [EmoteChannelName.EmoteName]. Example: [FrankerFaceZ.SeemsGood]. [EmoteName:size]. Example: [forsenE:1]. And [EmoteName_a] for animated emotes."; }
    getVersion() { return "1.5.11"; }
    getAuthor() { return "Metalloriff"; }
	
    load() {}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
		
	}

	getSettingsPanel() {

		setTimeout(() => {
			
			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createRadioGroup("sbde-size", "Emote size:", [
				{ title : "Small", description : "BD default", value : 1 },
				{ title : "Medium", value : 2 },
				{ title : "Large", value : 4 }
			], this.settings.emoteSize, (e, choice) => {
				this.settings.emoteSize = choice.value;
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("sbde-toggle-group", "Settings", [
				{ title : "Send emotes as links (faster)", value : "sendAsLink", setValue : this.settings.sendAsLink },
				{ title : "Display emote auto-complete preview", value : "displayPreview", setValue : this.settings.displayPreview }
			], choice => {
				this.settings[choice.value] = !this.settings[choice.value];
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createTextField("Maximum amount of emotes to preview", "number", this.settings.previewLimit, e => {
				this.settings.previewLimit = e.target.value;
				this.saveSettings();
			}), this.getName());

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());

	}

	saveSettings() { NeatoLib.Settings.save(this); }

	onLibLoaded() {

		NeatoLib.Updates.check(this);
		
		this.hasPermission = NeatoLib.Modules.get(["can"]).can;
		this.uploadFile = NeatoLib.Modules.get(["upload"]).upload;
		this.messageModule = NeatoLib.Modules.get(["sendMessage"]);

		this.settings = NeatoLib.Settings.load(this, {
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

		NeatoLib.Events.onPluginLoaded(this);

		this.switch();

		this.switchEvent = () => this.switch();

		NeatoLib.Events.attach("switch", this.switchEvent);

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

        this.emotes.sort((a, b) => a.name.length - b.name.length);

	}

	trySend(message, emoteName, emoteURL, size = 4, animated = false) {

		let i = emoteURL.lastIndexOf("1"), url = emoteURL.substring(0, i) + size + emoteURL.substring(i + 1);

		if(this.settings.sendAsLink) this.messageModule.sendMessage(NeatoLib.getSelectedTextChannel().id, { content : message + " " + url });
		else NeatoLib.requestFile(url, emoteName + (animated ? ".gif" : ".png"), file => {

			if(file.size < 100) {
				if(size > 1) this.trySend(message, emoteName, emoteURL, size - 1, animated);
				return;
			}

			this.uploadFile(NeatoLib.getSelectedTextChannel().id, file, { content : message, tts : false });

		});

	}

    switch(){

		if(!this.ready) return;

		if(this.emotes == undefined || this.emotes[0] == undefined) this.getEmotes();

		let chatbox = NeatoLib.Chatbox.get();

		if(chatbox) {
			chatbox.addEventListener("keydown", this.onKeyDown);
			chatbox.addEventListener("keyup", this.onKeyUp)
		}

    }
	
    stop() {

		let chatbox = NeatoLib.Chatbox.get();
		
		if(chatbox) {
			chatbox.removeEventListener("keydown", this.onKeyDown);
			chatbox.removeEventListener("keyup", this.onKeyUp);
		}

		NeatoLib.Events.detach("switch", this.switchEvent);

    }
	
}
