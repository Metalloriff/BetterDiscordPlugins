//META{"name":"ReactionImages","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/ReactionImages.plugin.js"}*//

class ReactionImages {

	getName() { return "ReactionImages"; }
	getDescription() { return "Allows you to set reaction image folders and send reaction images with 'Folder Name/reaction image name'."; }
	getVersion() { return "1.1.3"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {

		};
	}

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
			folderPaths: { label: "Reaction image folders", description: "Use them by typing 'Folder Name/' or 'Folder Name/image name' in chat.", type: "string", array: true, callback: e => {
				const applyChanges = () => {
					setTimeout(() => {
						this.settings.folders = {};

						for (let i = 0; i < this.settings.folderPaths.length; i++) {
							const splitPath = this.settings.folderPaths[i].split("/");

							this.settings.folders[splitPath[splitPath.length - 1]] = {
								path: this.settings.folderPaths[i],
								files: []
							};
						}

						this.refreshFolderDatas();
					}, 0);
				};

				if (e.type == "add") {
					NeatoLib.browseForFile(folder => {
						e.array.lastChild.getElementsByTagName("input")[0].value = this.settings.folderPaths[this.settings.folderPaths.length - 1] = folder.path.split("\\").join("/");
						applyChanges();
					}, { directory: true });
				} else applyChanges();
			}},
			resultCap: { label: "Image result cap", tooltip: "The maximum amount of images that will be displayed on the autocomplete.", type: "int" }
		};
	}

	get defaultSettings() {
		return {
			displayUpdateNotes: true,
			folders: {},
			resultCap: 15
		};
	}

	getSettingsPanel() {
		this.settings.folderPaths = Array.from(Object.values(this.settings.folders), folder => folder.path);
		return NeatoLib.Settings.createPanel(this);
	}

	saveSettings() {
		NeatoLib.Settings.save(this);
	}

	onLibLoaded() {
		if (!NeatoLib.hasRequiredLibVersion(this, "0.8.19")) return;

		NeatoLib.Updates.check(this);

		this.settings = NeatoLib.Settings.load(this);

		//if (this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

		this.fs = require("fs");

		this.onChatInput = async (e, shuffle) => {
			if (e.key.includes("Arrow")) return;

			let noneFound = true, autocomplete = document.getElementById("ri-autocomplete");

			const chatbox = e.target;

			for (let folderName in this.folders) {
				const idx = chatbox.value.lastIndexOf(folderName + "/");

				if (idx == -1) continue;
				else noneFound = false;

				const folder = this.folders[folderName];

				if (folder) {
					if (!autocomplete) {
						chatbox.parentElement.insertAdjacentHTML("beforeend", `
							<div id="ri-autocomplete" class="autocomplete-1vrmpx autocomplete-i9yVHs" style="width:inherit">
								<div class="autocompleteInner-zh20B_">
									<div class="autocompleteRowVertical-q1K4ky autocompleteRow-2OthDa">
										<div class="selector-2IcQBU">
											<div class="contentTitle-2tG_sM small-29zrCQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi">Files in ${folderName}</div>
										</div>
									</div>
									<div id="ri-autocomplete-list" class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 horizontalAutocompletes-x8hlrn scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="flex: 1 1 auto;">

									</div>
								</div>
							</div>
						`);

						autocomplete = document.getElementById("ri-autocomplete");

						const buttons = document.getElementsByClassName("selector-2IcQBU")[0], shuffleButton = document.createElement("div");

						shuffleButton.className = "material-icons";
						shuffleButton.textContent = "shuffle"
						shuffleButton.style = "color:white;opacity:0.4;cursor:pointer";

						shuffleButton.addEventListener("click", () => this.onChatInput(e, true));

						buttons.appendChild(shuffleButton);

						NeatoLib.Tooltip.attach("Shuffle", shuffleButton);
					}

					const list = document.getElementById("ri-autocomplete-list"), searchFilter = chatbox.value.substring(idx + folderName.length + 1, chatbox.length);
					let filteredResults = searchFilter ? folder.files.filter(file => file.fileName.toLowerCase().includes(searchFilter)) : folder.files;

					list.innerHTML = "";

					if (shuffle) filteredResults = NeatoLib.shuffleArray(filteredResults);

					let i = 0;

					for (let file of filteredResults) {
						if (i >= this.settings.resultCap) break;

						list.insertAdjacentHTML("beforeend", `
							<div class="horizontalAutocomplete-1DAQoM autocompleteRowHorizontal-32jwnH autocompleteRow-2OthDa">
								<div class="selectorSelected-1_M1WV selector-2IcQBU selectable-3dP3y-"><img src="${file.iconData}" onmouseenter="this.src = 'data:image/${file.type};base64, ${file.data}'" onmouseleave="this.src = '${file.iconData}'" width="100" height="100"></div>
							</div>
						`);

						const images = list.getElementsByTagName("img");

						NeatoLib.Tooltip.attach(file.fileName, images[images.length - 1]);

						images[images.length - 1].addEventListener("click", e => {
							const channel = NeatoLib.getSelectedTextChannel();

							if (e.shiftKey) NeatoLib.Modules.get("upload").upload(channel.id, new File([this.fs.readFileSync(file.path)], file.fileName));
							else {
								NeatoLib.Modules.get("upload").upload(channel.id, new File([this.fs.readFileSync(file.path)], file.fileName), { content: chatbox.value.substring(0, idx), tts: false });
								NeatoLib.Chatbox.setText("");
								autocomplete.remove();
							}
						});

						i++;
					}
				} else if (autocomplete) autocomplete.remove();
			}

			if (noneFound && autocomplete) autocomplete.remove();
		};

		this.switch();
		NeatoLib.Events.attach("switch", this.switchEvent = () => this.switch());

		setTimeout(() => this.refreshFolderDatas(), 10000);

		NeatoLib.Events.onPluginLoaded(this);
	}

	async refreshFolderDatas() {
		NeatoLib.showToast("ReactionImages: Loading reaction data and generating icons.");
		this.folders = JSON.parse(JSON.stringify(this.settings.folders));

		let completed = 0;

		for (let i in this.folders) {
			if (!this.settings.folders[i].path) continue;

			this.folders[i].files = [];

			this.fs.readdir(this.settings.folders[i].path, async (err, list) => {
				if (err) return console.error(err);

				for (let ii = 0; ii < list.length; ii++) {
					if (!list[ii].includes(".")) continue;

					const ext = list[ii].split(".")[list[ii].split(".").length - 1];
					if (!["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) continue;

					const data = await new Promise(resolve => this.fs.readFile(this.settings.folders[i].path + "/" + list[ii], "base64", (err, res) => resolve(res)));
					if (!data) continue;

					const generatedFile = this.settings.folders[i].files.find(x => x.fileName == list[ii] && x.size == data.length);

					if (generatedFile) {
						this.folders[i].files.push({
							fileName: list[ii],
							type: ext,
							size: data.length,
							data: data,
							iconData: generatedFile.iconData,
							path: this.settings.folders[i].path + "/" + list[ii]
						});
						continue;
					}

					const existing = this.settings.folders[i].files.findIndex(f => f.fileName == list[ii]);
					if (existing != -1) delete this.settings.folders[i].files[existing];

					let icon = new Image();

					icon.onload = () => {
						const iconData = this.compressImageToIcon(icon);

						this.settings.folders[i].files.push({
							fileName: list[ii],
							size: data.length,
							iconData: iconData
						});

						this.folders[i].files.push({
							fileName: list[ii],
							type: ext,
							size: data.length,
							data: data,
							iconData: iconData,
							path: this.settings.folders[i].path + "/" + list[ii]
						});

						icon = null;
					}

					icon.src = `data:image/${ext};base64,${data}`;
				}

				completed++;
			});
		}

		while (completed < Object.keys(this.folders).length) await NeatoLib.Thread.sleep(100);

		NeatoLib.showToast("ReactionImages: Finished loading files and generating icons.", "success");
		setTimeout(() => this.saveSettings(), 100);
	}

	compressImageToIcon(unconverted) {
		const canvas = document.createElement("canvas"), context = canvas.getContext("2d");

		canvas.width = 100;
		canvas.height = 100;

		context.drawImage(unconverted, 0, 0, 100, 100);

		return canvas.toDataURL("image/jpeg", 0.3);
	}

	switch () {
		if (!this.ready) return;

		this.chatbox = NeatoLib.Chatbox.get();

		if (this.chatbox) this.chatbox.addEventListener("keyup", this.onChatInput);
	}

	stop() {
		if (this.chatbox) this.chatbox.removeEventListener("keyup", this.onChatInput);
		NeatoLib.Events.detach("switch", this.switchEvent);
	}

}
