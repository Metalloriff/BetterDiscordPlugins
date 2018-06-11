//META{"name":"AutoCorrect"}*//

class AutoCorrect {
	
    getName() { return "AutoCorrect"; }
    getDescription() { return "Automatically replaces misspelled words with the first correction, with optional automatic capitalization and punctuation. Requires either Windows 8 or above, Mac, or DevilBro's SpellCheck plugin."; }
    getVersion() { return "1.1.4"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			
		};
	}

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

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("ac-toggle-group", "General options", [
				{ title : "Use DevilBro's SpellCheck", value : "useDevilsChecker", setValue : this.settings.useDevilsChecker },
				{ title : "Don't correct the same word twice", value : "dontCorrectTwice", setValue : this.settings.dontCorrectTwice },
				{ title : "Automatically capitalize the first letter of every sentence", value : "autoCapitalization", setValue : this.settings.autoCapitalization },
				{ title : "Automatically punctuate on send and on double space", value : "autoPunctuation", setValue : this.settings.autoPunctuation },
				{ title : "Automatically correct spelling errors", value : "autoCorrect", setValue : this.settings.autoCorrect },
				{ title : "Ignore messages beginning with a space", value : "ignoreEmptyStart", setValue : this.settings.ignoreEmptyStart },
				{ title : "Attach corrector to every text field (set this to false for just the chatbox)", value : "attachEverywhere", setValue : this.settings.attachEverywhere }
			], choice => {
				this.settings[choice.value] = !this.settings[choice.value];
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Ignored prefixes", this.settings.ignoredPrefixes, e => {
				this.settings.ignoredPrefixes = e.target.value;
				this.saveSettings();
			}, { description : "Any messages beginning with any of these prefixes will be ignored. Good for preventing bot commands from failing due to corrections. Separate with spaces." }), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createHint("Hint: You can stop a word from being corrected by selecting the word, right clicking, and clicking \"Learn Word\", or by adding it to your learned words list in the settings."), this.getName());

			let group = NeatoLib.Settings.Elements.createGroup("Override replacers", { style : "background-color:rgba(0,0,0,0.2);border-radius:5px;padding:10px;text-align:center;" }), list = group.lastChild;

			group.insertAdjacentHTML("afterbegin", `<style>.ac-selected{background-color:#7289da;border-radius:5px;}</style>`);

			let buildGroup = () => {

				list.innerHTML = "";

				this.selectedReplacer = -1;

				for(let i = 0; i < this.settings.overrideReplacers.length; i++) {

					list.insertAdjacentHTML("beforeend", `<div type="text" class="ac-replacer-field"><input value="${this.settings.overrideReplacers[i].word}" style="${NeatoLib.Settings.Styles.textField}width:45%;margin:2.5%;border:2px solid white;"><input value="${this.settings.overrideReplacers[i].replacement}" style="${NeatoLib.Settings.Styles.textField}width:45%;margin:2.5%;border:2px solid white;"></div>`);

					let added = document.getElementsByClassName("ac-replacer-field")[i];

					added.addEventListener("click", e => {
						for(let selected of group.getElementsByClassName("ac-replacer-field")) selected.classList.remove("ac-selected");
						this.selectedReplacer = i;
						e.currentTarget.classList.add("ac-selected");
					});

					let fields = added.getElementsByTagName("input");

					for(let ii = 0; ii < fields.length; ii++) fields[ii].addEventListener("focusout", e => {
						this.settings.overrideReplacers[i] = { word : fields[0].value, replacement : fields[1].value };
						this.saveSettings();
					});

				}

				list.insertAdjacentElement("beforeend", NeatoLib.Settings.Elements.createButton("Add New Replacer", () => {
					this.settings.overrideReplacers.push({ word : "", replacement : "" });
					this.saveSettings();
					buildGroup();
				}, "margin-right:20px"));

				list.insertAdjacentElement("beforeend", NeatoLib.Settings.Elements.createButton("Remove Selected", () => {
					if(this.selectedReplacer == -1) {
						NeatoLib.showToast("No replacer selected!");
						return;
					}
					this.settings.overrideReplacers.splice(this.selectedReplacer, 1);
					this.saveSettings();
					buildGroup();
					NeatoLib.showToast("Replacer removed!", "success");
				}, "margin-left:20px"));

			};

			NeatoLib.Settings.pushElement(group, this.getName());

			buildGroup();

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Learned words (separate with spaces)", this.settings.learnedWords.join(" "), e => {
				this.settings.learnedWords = Array.filter(e.target.value.trim().toLowerCase().split(" "), x => x != "");
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
		
	}

	saveSettings() {

		if(this.settings.useDevilsChecker) {

			this.devilsChecker = BdApi.getPlugin("SpellCheck");
			let toggle = document.getElementById("ac-toggle-group-0");
			if(toggle) toggle = toggle.getElementsByTagName("input")[0];

			if(this.devilsChecker) {

				if(window.pluginCookie["SpellCheck"] == false) {

					NeatoLib.showToast("DevilBro's SpellCheck is not enabled! Please enable it and re-enable this setting.", "error");
					if(toggle) toggle.click();

				}else for(let i = 0; i < this.settings.learnedWords.length; i++) this.devilsChecker.addToOwnDictionary(this.settings.learnedWords[i]);

			} else {

				NeatoLib.showToast("You do not have DevilBro's SpellCheck plugin installed!", "error");
				if(toggle) toggle.click();

			}

		} else this.spellChecker.setLearnedWords(new Set(this.settings.learnedWords));

		NeatoLib.Settings.save(this);
		
	}

	onLibLoaded() {
		
		//if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

		NeatoLib.Updates.check(this);
		
		this.settings = NeatoLib.Settings.load(this, {
			displayUpdateNotes : true,
			dontCorrectTwice : true,
			autoCapitalization : true,
			autoPunctuation : true,
			autoCorrect : true,
			ignoreEmptyStart : true,
			ignoredPrefixes : ". ! ? % ~> /",
			overrideReplacers : [
				{ word : "discord", replacement : "Discord" },
				{ word : "cant", replacement : "can't" },
				{ word : "youre", replacement : "you're" },
				{ word : "idk", replacement : "I don't know" },
				{ word : "btw", replacement : "by the way" },
				{ word : "hes", replacement : "he's" },
				{ word : "theyre", replacement : "they're" },
				{ word : "wont", replacement : "won't" }
			],
			useDevilsChecker : false,
			learnedWords : [],
			attachEverywhere : false
		});
		
		this.classes = NeatoLib.getClasses(["contextMenu"]);

		this.emoteNames = [];

		for(let emoteChannel in window.bdEmotes) {
			let keys = Object.keys(window.bdEmotes[emoteChannel]);
			for(let i = 0; i < keys.length; i++) this.emoteNames.push(keys[i]);
		}

		this.initialized = true;

		this.switch();

		this.switchEvent = () => this.switch();
		
		NeatoLib.Events.attach("switch", this.switchEvent);
		
		NeatoLib.Events.onPluginLoaded(this);

    }
    
    switch() {

		if(!this.initialized) return;

		this.spellChecker = NeatoLib.Modules.get("isMisspelled");
		this.devilsChecker = BdApi.getPlugin("SpellCheck");

		this.attach();

		if(this.chatObserver) this.chatObserver.disconnect();

		this.chatObserver = new MutationObserver(mutations => {
			for(let i = 0; i < mutations.length; i++) {
				if(mutations[i].addedNodes && mutations[i].addedNodes[0] && mutations[i].addedNodes[0].querySelector && mutations[i].addedNodes[0].querySelector(this.settings.attachEverywhere ? "textarea, input" : ".chat textarea")) this.attach();
			}
		});

		this.chatObserver.observe(this.settings.attachEverywhere ? document : document.getElementsByClassName("messages scroller")[0], { childList : true, subtree : true });

	}
	
	attach() {
		
		this.lastCorrectedWord = -1;

		let areas = $("textarea, input");
		areas.off("keydown.autocorrect");
		areas.off("contextmenu.autocorrect");

        let $chatbox = $(this.settings.attachEverywhere ? "textarea, input" : ".chat textarea");

        $chatbox.on("keydown.autocorrect", e => {

			let chatbox = e.currentTarget;

			if(this.settings.useDevilsChecker && this.devilsChecker == undefined) return;

			if(chatbox.value == "") this.lastCorrectedWord = -1;

			if(this.settings.ignoreEmptyStart && chatbox.value[0] == " ") return;

			let sending = e.which == 13 && !e.shiftKey, ignoredPrefixesSplit = Array.filter(this.settings.ignoredPrefixes.split(" "), prefix => prefix != "");

			for(let i = 0; i < ignoredPrefixesSplit.length; i++) if(chatbox.value.startsWith(ignoredPrefixesSplit[i])) return;

            if(e.which == 32 || sending) {

				let words, wordsWithoutSpaces, lastWordIDX, beforeLastWord, lastWord;

				let updateVars = () => {
					words = chatbox.value.split(" ");
					wordsWithoutSpaces = Array.filter(words, word => word != "");
					lastWordIDX = words.lastIndexOf(wordsWithoutSpaces[wordsWithoutSpaces.length - 1]);
					beforeLastWord = wordsWithoutSpaces[wordsWithoutSpaces.length - 2];
					lastWord = words[lastWordIDX];
				};

				updateVars();

				let isEmoteOrLink = word => word[0] == ":" && word[word.length - 1] == ":" || this.emoteNames.includes(word) || word.startsWith("http");

				if(words[words.length - 1] != "" && sending) words.push("");

				if(lastWord == undefined || chatbox.selectionStart != chatbox.value.length || (this.lastCorrectedWord == lastWordIDX && this.settings.dontCorrectTwice) || lastWord[0] == "#" || lastWord[0] == "@") {
					if(sending) this.lastCorrectedWord = -1;
					return;
				}

				if(sending) e.preventDefault();

				let trySendMessage = () => {

					if(beforeLastWord) beforeLastWord = beforeLastWord.trim();

					let beforeLastWordIDX = 2, lastSpacelessWord = wordsWithoutSpaces[wordsWithoutSpaces.length - beforeLastWordIDX + 1];

					while(beforeLastWord != undefined && lastSpacelessWord && isEmoteOrLink(lastSpacelessWord)) {
						beforeLastWordIDX++;
						beforeLastWord = wordsWithoutSpaces[wordsWithoutSpaces.length - beforeLastWordIDX];
						lastSpacelessWord = wordsWithoutSpaces[wordsWithoutSpaces.length - beforeLastWordIDX + 1];
					}

					if(this.settings.autoCapitalization && !isEmoteOrLink(lastSpacelessWord)) {

						words[0] = words[0].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());

						if(words[words.length - 1] == "i") words[words.length - 1] = words[words.length - 1].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());

						if(beforeLastWord && ".!?".indexOf(beforeLastWord[beforeLastWord.length - 1]) != -1 && !beforeLastWord.endsWith("...")) {
							if(sending) words[words.length - beforeLastWordIDX] = words[words.length - beforeLastWordIDX].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());
							else words[words.length - 1] = words[words.length - 1].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());
						}

					}

					let autoPunctuated = false;

					if(this.settings.autoPunctuation && !isEmoteOrLink(lastSpacelessWord)) {

						if(words[words.length - 1] == "" && ".!?".indexOf(lastSpacelessWord[lastSpacelessWord.length - 1]) == -1) {
							words[words.length - beforeLastWordIDX] += ".";
							autoPunctuated = true;
						}

					}

					let newValue = words.join(" ");
					
					if(!autoPunctuated) newValue += " ";

					if(chatbox.value != newValue) {
						if(sending) this.lastCorrectedWord = -1;
						chatbox.select();
						document.execCommand("insertText", false, newValue);
					}

					if(e.which == 13) NeatoLib.ReactData.getProps(chatbox).onKeyPress({ which : 13, preventDefault : function(){} });

				};

				if(isEmoteOrLink(lastWord)) {
					trySendMessage();
					return;
				}

				for(let i = 0; i < this.settings.overrideReplacers.length; i++) {

					let replacer = this.settings.overrideReplacers[i];

					if(lastWord == replacer.word) {
						
						e.preventDefault();

						if(sending) words.splice(words.length - 2, 2);
						else words.splice(words.length - 1, 1);

						let split = replacer.replacement.split(" ");
						for(let ii = 0; ii < split.length; ii++) if(split[ii].trim() != "") words.push(split[ii]);
						if(sending) words.push("");

						trySendMessage();

						this.lastCorrectedWord = lastWordIDX;

						return;

					}

				}

				let correctMisspelling = misspelled => {

                    if(!misspelled) {
						trySendMessage();
						return;
					}

					this.lastCorrectedWord = lastWordIDX;

					let attemptCorrect = corrections => {

						if(corrections.length == 0) return;

                        chatbox.selectionStart = chatbox.value.lastIndexOf(lastWord);
						chatbox.selectionEnd = chatbox.value.length;
	
						if(this.settings.useDevilsChecker) this.devilsChecker.replaceWord(chatbox, lastWord, corrections[0]);
						this.spellChecker.replaceWithCorrection(corrections[0]);

						setTimeout(() => {
							words = chatbox.value.split(" ");
							trySendMessage();
						}, 0);

                    };

					if(this.settings.useDevilsChecker) attemptCorrect(this.devilsChecker.getSimilarWords(lastWord.toLowerCase().trim()));
					else this.spellChecker.getCorrections(lastWord).then(attemptCorrect);

                };

				if(this.settings.autoCorrect) {
					if(this.settings.useDevilsChecker) correctMisspelling(this.devilsChecker.isWordNotInDictionary(lastWord));
					else this.spellChecker.isMisspelled(lastWord).then(correctMisspelling);
				} else trySendMessage();
				
				e.preventDefault();

            }

		});
		
		$chatbox.on("contextmenu.autocorrect", e => {

			let chatbox = e.currentTarget;

			setTimeout(() => {

				let itemGroup = document.getElementsByClassName(this.classes.itemGroup)[0];

				itemGroup.insertAdjacentElement("afterbegin",
					new PluginContextMenu.ToggleItem("Auto Correct", this.settings.autoCorrect, { onChange : newValue => {
						this.settings.autoCorrect = newValue;
						this.saveSettings();
					}}).element[0]
				);

				itemGroup.insertAdjacentElement("afterbegin",
					new PluginContextMenu.ToggleItem("Auto Capitalize", this.settings.autoCapitalization, { onChange : newValue => {
						this.settings.autoCapitalization = newValue;
						this.saveSettings();
					}}).element[0]
				);

				itemGroup.insertAdjacentElement("afterbegin",
					new PluginContextMenu.ToggleItem("Auto Punctuate", this.settings.autoPunctuation, { onChange : newValue => {
						this.settings.autoPunctuation = newValue;
						this.saveSettings();
					}}).element[0]
				);

				let selectedWords = chatbox.value.substring(chatbox.selectionStart, chatbox.selectionEnd).trim().toLowerCase().split(" ");
				
				if(selectedWords.length == 1 && selectedWords[0] != "") {

					itemGroup.insertAdjacentElement("afterbegin",

						this.settings.learnedWords.includes(selectedWords[0]) ? 

						new PluginContextMenu.TextItem("Forget Word", { callback : () => {
							this.settings.learnedWords.splice(this.settings.learnedWords.indexOf(selectedWords[0]), 1);
							this.saveSettings();
							NeatoLib.ContextMenu.close();
						}}).element[0] :

						new PluginContextMenu.TextItem("Learn Word", { callback : () => {
							this.settings.learnedWords.push(selectedWords[0]);
							this.saveSettings();
							NeatoLib.ContextMenu.close();
						}}).element[0]

					);

				}

				let oldLearnButton = document.getElementsByClassName(this.classes.itemGroup)[1].firstChild;

				if(oldLearnButton.firstChild.innerText.includes("Dictionary")) oldLearnButton.outerHTML = "";

				itemGroup.parentElement.style.top = (parseInt(itemGroup.parentElement.style.top) - 50) + "px";

			}, 0);

		});

	}
	
    stop() {

		let areas = $("textarea, input");
		areas.off("keydown.autocorrect");
		areas.off("contextmenu.autocorrect");

		if(this.chatObserver) this.chatObserver.disconnect();

		NeatoLib.Events.detach("switch", this.switchEvent);

	}
	
}
