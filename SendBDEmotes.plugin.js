//META{"name":"SendBDEmotes","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/SendBDEmotes.plugin.js"}*//

class SendBDEmotes {

  getName() { return "Send BD Emotes"; }
  getDescription() { return "Allows you to enclose Better Discord emotes in square brackets to send them as a higher resolution link that all users can see. Example: [forsenE]. You can also do [EmoteChannelName.EmoteName]. Example: [FrankerFaceZ.SeemsGood]. [EmoteName:size]. Example: [forsenE:1]. And [EmoteName_a] for animated emotes."; }
  getVersion() { return "1.6.11"; }
  getAuthor() { return "Metalloriff"; }

	load() {}

	start() {
		const libLoadedEvent = () => {
			try{ this.onLibLoaded(); }
			catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
		};

		let lib = document.getElementById("NeatoBurritoLibrary");
		if (!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}

		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
		if (typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}

	get settingFields() {
		return {
			emoteSize: { label: "Sent emote size", type: "radio", choices: {
				1: { label: "Small", description: "BetterDiscord Default" },
				2: { label: "Medium" },
				4: { label: "Large" }
			}},
			sendAsLink: { label: "Send emotes as links", description: "(faster)", type: "bool" },
			displayPreview: { label: "Display auto-complete", type: "bool" },
			forceGif: { label: "Send emotes as gif", type: "bool" },
			previewLimit: { label: "Maximum amount of emotes to display on auto-complete", type: "int" }
		};
	}

	get defaultSettings() {
		return {
			emoteSize: 4,
			sendAsLink: false,
			displayPreview: true,
			forceGif: false,
			previewLimit: 25
		};
	}

	getSettingsPanel() {
		return NeatoLib.Settings.createPanel(this);
	}

	saveSettings() {
		NeatoLib.Settings.save(this);
	}

	onLibLoaded() {
		NeatoLib.Updates.check(this);

		this.hasPermission = NeatoLib.Modules.get(["can"]).can;
		this.uploadFile = NeatoLib.Modules.get(["upload"]).upload;
		this.messageModule = NeatoLib.Modules.get(["sendMessage"]);

		this.settings = NeatoLib.Settings.load(this);

		this.keyDownEvent = e => this.onKeyDown(e);
		this.keyUpEvent = e => this.onKeyUp(e);

		NeatoLib.Events.attach("switch", this.switchEvent = () => this.switch());

		this.getEmotes();

		NeatoLib.Events.onPluginLoaded(this);

		this.switch();
	}

	onKeyDown(e) {
		if (!e.target.value) {
			if (document.getElementById("sbde-autocomplete")) document.getElementById("sbde-autocomplete").remove();
			return;
		}

		const words = e.target.value.split(" "), lastWord = words[words.length - 1];

		if (e.key == "Enter" && !e.shiftKey && lastWord.startsWith("[") && lastWord.endsWith("]")) {
			let emoteName = lastWord.substring(1, lastWord.length - 1), size = this.settings.emoteSize, animated = false;

			if (emoteName.includes(":")) {
				const trySize = parseInt(emoteName.substring(emoteName.indexOf(":") + 1, emoteName.length));
				if (!isNaN(trySize)) {
					size = trySize;
					emoteName = emoteName.substring(0, emoteName.indexOf(":"));
				}
			}

			if (emoteName.endsWith("_a")) {
				animated = true;
				emoteName = emoteName.replace("_a", "");
			}

			let emote = window.bdEmotes.TwitchGlobal[emoteName] || window.bdEmotes.TwitchSubscriber[emoteName] || window.bdEmotes.BTTV[emoteName] || window.bdEmotes.FrankerFaceZ[emoteName] || window.bdEmotes.BTTV2[emoteName];

			if (emoteName.includes(".")) {
				const sourceAndName = emoteName.split(".");
				emote = window.bdEmotes[sourceAndName[0]][sourceAndName[1]];
			}

			if (emote) {
				const message = e.target.value.split(lastWord).join("");

				NeatoLib.Chatbox.setText("");

				this.trySend(message, emoteName, emote, size, animated);
			} else if (emoteName == "RANDOM") {
				const randomEmote = this.emotes[this.emotes.length * Math.random() << 0], message = e.target.value.split(lastWord).join("");

				NeatoLib.Chatbox.setText("");

				this.trySend(message, randomEmote.name, randomEmote.url, size, animated);
			}

			if (document.getElementById("sbde-autocomplete")) document.getElementById("sbde-autocomplete").remove();

			return;
		}

		if (lastWord.endsWith("]")) {
			if (document.getElementById("sbde-autocomplete")) document.getElementById("sbde-autocomplete").remove();
			return;
		}
	}

	async onKeyUp(e) {
		if (!this.settings.displayPreview) return;

		const words = e.target.value.split(" "), lastWord = words[words.length - 1];
		let autocomplete = document.getElementById("sbde-autocomplete");

		if (lastWord.startsWith("[")) {
			const emoteName = lastWord.substring(1, lastWord.length);

			if (!autocomplete) {
				e.target.parentElement.insertAdjacentHTML("beforeend", `
					<div id="sbde-autocomplete" class="autocomplete-1vrmpx autocomplete-i9yVHs" style="width:inherit">
						<div class="autocompleteInner-zh20B_">
							<div class="autocompleteRowVertical-q1K4ky autocompleteRow-2OthDa">
								<div class="selector-2IcQBU">
									<div class="contentTitle-2tG_sM small-29zrCQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi"></div>
									<span class="material-icons" style="cursor:pointer;color:white">looks_one</span>
									<span class="material-icons" style="cursor:pointer;color:white">looks_two</span>
									<span class="material-icons" style="cursor:pointer;color:white">looks_3</span>
									<span class="material-icons" style="cursor:pointer;color:white">loop</span>
								</div>
							</div>
							<div id="sbde-autocomplete-list" class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 horizontalAutocompletes-x8hlrn scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="flex: 1 1 auto;">

							</div>
						</div>
					</div>
				`);

				autocomplete = document.getElementById("sbde-autocomplete");

				const buttons = autocomplete.getElementsByClassName("material-icons");

				const sizeButton = (button, size) => {
					if (this.settings.emoteSize == size) button.style.color = NeatoLib.Colors.DiscordDefaults.blue;
					else button.style.color = "white";

					button.onclick = () => {
						this.settings.emoteSize = size;
						this.saveSettings();
						update();
					};
				};

				const update = () => {
					for (let i = 0; i < buttons.length; i++) {
						const button = buttons[i];
						switch (button.textContent) {
							case "looks_one":
								sizeButton(button, 1);

								if (!button.tooltip) NeatoLib.Tooltip.attach("Small", button);
							break;

							case "looks_two":
								sizeButton(button, 2);

								if (!button.tooltip) NeatoLib.Tooltip.attach("Medium", button);
							break;

							case "looks_3":
								sizeButton(button, 4);

								if (!button.tooltip) NeatoLib.Tooltip.attach("Large", button);
							break;

							case "loop":
								if (this.settings.forceGif) button.style.color = NeatoLib.Colors.DiscordDefaults.blue;
								else button.style.color = "white";

								button.onclick = () => {
									this.settings.forceGif = !this.settings.forceGif;
									this.saveSettings();
									update();
								};

								if (!button.tooltip) NeatoLib.Tooltip.attach("Send as gif", button);
							break;
						}
					}
				};

				update();
			}

			const list = document.getElementById("sbde-autocomplete-list");
			list.innerHTML = "";

			let lim = 0;
			for (let i = 0; i < this.emotes.length; i++) {
				const emote = this.emotes[i];

				if (emote.name.startsWith(emoteName)) {
					if (lim >= this.settings.previewLimit) break;

					list.insertAdjacentHTML("beforeend", `
						<div class="horizontalAutocomplete-1DAQoM autocompleteRowHorizontal-32jwnH autocompleteRow-2OthDa">
							<div class="selectorSelected-1_M1WV selector-2IcQBU selectable-3dP3y-"><img src="${this.emotes[i].url}" width="50" height="50"></div>
						</div>
					`);

					const images = list.getElementsByTagName("img"), lastImage = images[images.length - 1];

					NeatoLib.Tooltip.attach(emote.name, lastImage);

					lastImage.addEventListener("click", ev => {
						if (ev.shiftKey) this.trySend("", emote.name, emote.url, this.settings.emoteSize);
						else {
							this.trySend(e.target.value.split(lastWord).join(""), emote.name, emote.url, this.settings.emoteSize);

							NeatoLib.Chatbox.setText("");

							autocomplete.remove();
						}
					});

					lim++;
				}
			}
		} else if (autocomplete) autocomplete.remove();
	}

	async getEmotes() {
		const channels = Object.keys(window.bdEmotes);

		this.emotes = [];

		for (let ec of channels) {
			const channel = window.bdEmotes[ec];

			for (let emote in channel) {
				this.emotes.push({
					name: emote,
					url: channel[emote]
				});
			}
		}

		this.emotes.sort((x, y) => x.name.length - y.name.length);
	}

	trySend(message, emoteName, emoteURL, size = 4, animated = false) {
		if (this.settings.forceGif) animated = true;

		const i = emoteURL.lastIndexOf("1"), url = emoteURL.substring(0, i) + size + emoteURL.substring(i + 1);

		if (this.settings.sendAsLink) this.messageModule.sendMessage(NeatoLib.getSelectedTextChannel().id, { content: message + " " + url });
		else NeatoLib.requestFile(url, emoteName + (animated ? ".gif" : ".png"), file => {
			if (file.size < 100) {
				if (size > 1) this.trySend(message, emoteName, emoteURL, size - 1, animated);
				return;
			}

			this.uploadFile(NeatoLib.getSelectedTextChannel().id, file, { content: message, tts: false });
		});
	}

	switch () {
		if (!this.ready) return;

		if (!this.emotes || this.emotes.length < 700000) this.getEmotes();

		const chatbox = NeatoLib.Chatbox.get();

		if (chatbox) {
			chatbox.addEventListener("keydown", this.keyDownEvent);
			chatbox.addEventListener("keyup", this.keyUpEvent);
		}
	}

	stop() {
		const chatbox = NeatoLib.Chatbox.get();

		if (chatbox) {
			chatbox.removeEventListener("keydown", this.keyDownEvent);
			chatbox.removeEventListener("keyup", this.keyUpEvent);
		}

		NeatoLib.Events.detach("switch", this.switchEvent);
	}

}
