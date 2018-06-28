//META{"name":"AutoCorrect","website":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/README.md","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AutoCorrect.plugin.js"}*//

class AutoCorrect {
	
    getName() { return "AutoCorrect"; }
    getDescription() { return "Automatically replaces misspelled words with the first correction, with optional automatic capitalization and punctuation. Requires either Windows 8 or above, Mac, or DevilBro's SpellCheck plugin."; }
    getVersion() { return "1.3.4"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			"1.2.4" :
			`
				Fixed learned words.
				Words ending with any non-alphanumeric character will no longer be automatically punctuated, instead of only words ending with punctuation.
				Added a "prevent multiple spaces between words" setting.
				Fixed auto-completes not completing when sending.
				Fixed auto-emojis.
				Fixed a bunch of little bugs, and probably created some.
				Code blocks are no longer corrected.
			`,
			"1.3.4" :
			`
				Fixed the plugin failing to load for the first time if attach to all fields was disabled.
				Fixed newlines putting random spaces.
				Fixed the inability to put spaces in code blocks.
				Added a "minimum auto-punctuate word count" setting.
			`
		};
	}

    load() {}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
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
				{ title : "Attach corrector to every text field (set this to false for just the chatbox)", value : "attachEverywhere", setValue : this.settings.attachEverywhere },
				{ title : "Prevent multiple spaces between words", value : "preventDoubleSpaces", setValue : this.settings.preventDoubleSpaces }
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

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Auto-punctuation: minimum word count", this.settings.autoPunctuationMin, e => {
				this.settings.autoPunctuationMin = e.target.value;
				this.saveSettings();
			}), this.getName(), { tooltip : "If this is above 0, this many or more words will be required before auto-punctuating" });

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

		} else this.updateLearned();

		NeatoLib.Settings.save(this);
		
	}

	updateLearned() {
		this.spellChecker.setLearnedWords(new Set(this.settings.learnedWords));
	}

	onLibLoaded() {

		NeatoLib.Updates.check(this);

		if(!NeatoLib.hasRequiredLibVersion(this, "0.2.15")) return;
		
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
			attachEverywhere : false,
			preventDoubleSpaces : false,
			autoPunctuationMin : 0
		});
		
		this.classes = NeatoLib.getClasses(["contextMenu"]);

		this.emoteNames = [];

		for(let emoteChannel in window.bdEmotes) {
			let keys = Object.keys(window.bdEmotes[emoteChannel]);
			for(let i = 0; i < keys.length; i++) this.emoteNames.push(keys[i]);
		}

		this.keyDownEvent = e => {

			let chatbox = e.currentTarget;

			if(this.settings.useDevilsChecker && !this.devilsChecker) return;

			if(!chatbox.value) this.lastCorrectedWord = -1;

			if(this.settings.ignoreEmptyStart && chatbox.value[0] == " ") return;

			let sending = e.which == 13 && !e.shiftKey, ignoredPrefixesSplit = Array.filter(this.settings.ignoredPrefixes.split(" "), prefix => prefix);

			for(let i = 0; i < ignoredPrefixesSplit.length; i++) if(chatbox.value.startsWith(ignoredPrefixesSplit[i])) return;

            if(e.which == 32 || e.which == 13) {

				let lines = chatbox.value.split("\n"), isInCode = false, selectedLine = chatbox.value.substring(0, chatbox.selectionStart).match(/\n/g);

				if(selectedLine) selectedLine = selectedLine.length;
				else selectedLine = 0;

				for(let ln = 0; ln < lines.length; ln++) {

					if(selectedLine != ln) continue;

					let words, wordsWithoutSpaces, lastWordIDX, beforeLastWord, lastWord;

					let updateVars = () => {
						words = lines[ln].split(" ");
						wordsWithoutSpaces = Array.filter(words, word => word != "");
						lastWordIDX = words.lastIndexOf(wordsWithoutSpaces[wordsWithoutSpaces.length - 1]);
						beforeLastWord = wordsWithoutSpaces[wordsWithoutSpaces.length - 2];
						lastWord = words[lastWordIDX];
					};

					updateVars();

					if(isInCode) {
						if(lines[ln].indexOf("```") != -1) isInCode = false;
						continue;
					} else if(lines[ln].indexOf("```") != -1) {
						isInCode = true;
						continue;
					}

					let isEmoteOrLink = word => word[0] == ":" || this.emoteNames.includes(word) || word.split("\n")[word.split("\n").length - 1].startsWith("http");

					if(words[words.length - 1] != "" && sending) words.push("");

					if(lastWord == undefined || chatbox.selectionStart != chatbox.value.length || (this.lastCorrectedWord == lastWordIDX && this.settings.dontCorrectTwice) || lastWord[0] == "#" || lastWord[0] == "@") {
						if(sending) this.lastCorrectedWord = -1;
						continue;
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

							if(!lines[ln - 1] || ".!?".indexOf(lines[ln - 1]) != -1 && !lines[ln - 1].endsWith("...")) words[0] = words[0].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());

							if(words[words.length - 1] == "i") words[words.length - 1] = words[words.length - 1].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());

							if(beforeLastWord && ".!?".indexOf(beforeLastWord[beforeLastWord.length - 1]) != -1 && !beforeLastWord.endsWith("...") || lines[ln - 1] && ".!?".indexOf(lines[ln - 1]) != -1 && !lines[ln - 1].endsWith("...")) {
								if(sending) words[words.length - beforeLastWordIDX] = words[words.length - beforeLastWordIDX].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());
								else words[words.length - 1] = words[words.length - 1].replace(/(?:^|\s)\S/g, letter => letter.toUpperCase());
							}

						}

						let autoPunctuated = false;

						if(this.settings.autoPunctuation && !isEmoteOrLink(lastSpacelessWord) && (!this.settings.autoPunctuationMin || words.length > this.settings.autoPunctuationMin)) {

							if(words[words.length - 1] == "" && !lastSpacelessWord[lastSpacelessWord.length - 1].match(/[^a-zA-Z0-9 ]/)) {
								if(!this.settings.preventDoubleSpaces || e.which == 13) {
									words[words.length - beforeLastWordIDX] += ".";
									autoPunctuated = true;
								}
							}

						}

						let newValue = words.join(" ");
						
						if(!autoPunctuated && !isEmoteOrLink(lastSpacelessWord) && !(this.settings.preventDoubleSpaces && newValue.endsWith(" "))) newValue += e.shiftKey && e.which == 13 ? "\n" : " ";

						lines[ln] = newValue;
						newValue = lines.join("\n");

						if(chatbox.value != newValue) {
							if(sending) {
								this.lastCorrectedWord = -1;
								newValue = newValue.trim();
							}
							chatbox.select();
							document.execCommand("insertText", false, newValue);
						}

						if(sending && typeof NeatoLib.ReactData.getEvents(chatbox).onKeyPress == "function" && ln + 1 == lines.length) {
							setTimeout(() => {
								NeatoLib.ReactData.getEvents(chatbox).onKeyPress({ which : 13, preventDefault : function(){} });
							}, 0);
						}

					};

					if(isEmoteOrLink(lastWord)) {
						trySendMessage();
						continue;
					}

					let wasReplaced;

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

							wasReplaced = true;
							break;

						}

					}

					if(wasReplaced) continue;

					let correctMisspelling = misspelled => {

						if(!misspelled) {
							trySendMessage();
							return;
						}

						this.lastCorrectedWord = lastWordIDX;

						let attemptCorrect = corrections => {

							if(corrections.length == 0) {
								trySendMessage();
								return;
							}

							chatbox.selectionStart = chatbox.value.lastIndexOf(lastWord);
							chatbox.selectionEnd = chatbox.value.length;
		
							lines[ln] = lines[ln].substring(0, lines[ln].lastIndexOf(lastWord)) + corrections[0];
							if(sending) lines[ln] += " ";
							updateVars();

							trySendMessage();

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

            }

		};

		this.contextMenuEvent = e => {

			let chatbox = e.currentTarget;

			setTimeout(() => {

				let itemGroup = document.getElementsByClassName(this.classes.itemGroup)[0];

				itemGroup.insertAdjacentElement("afterbegin",
					NeatoLib.ContextMenu.createToggle("Auto Correct", this.settings.autoCorrect, nv => {
						this.settings.autoCorrect = nv;
						this.saveSettings();
					})
				);

				itemGroup.insertAdjacentElement("afterbegin",
					NeatoLib.ContextMenu.createToggle("Auto Capitalize", this.settings.autoCapitalization, nv => {
						this.settings.autoCapitalization = nv;
						this.saveSettings();
					})
				);

				itemGroup.insertAdjacentElement("afterbegin",
					NeatoLib.ContextMenu.createToggle("Auto Punctuate", this.settings.autoPunctuation, nv => {
						this.settings.autoPunctuation = nv;
						this.saveSettings();
					})
				);

				let selectedWords = chatbox.value.substring(chatbox.selectionStart, chatbox.selectionEnd).trim().toLowerCase().split(" ");
				
				if(selectedWords.length == 1 && selectedWords[0] != "") {

					itemGroup.insertAdjacentElement("afterbegin",

						this.settings.learnedWords.includes(selectedWords[0]) ?

						NeatoLib.ContextMenu.createItem("Forget Word", () => {
							this.settings.learnedWords.splice(this.settings.learnedWords.indexOf(selectedWords[0]), 1);
							this.saveSettings();
							this.updateLearned();
							NeatoLib.ContextMenu.close();
						}) :

						NeatoLib.ContextMenu.createItem("Learn Word", () => {
							this.settings.learnedWords.push(selectedWords[0]);
							this.saveSettings();
							this.updateLearned();
							NeatoLib.ContextMenu.close();
						})

					);

				}

				let oldLearnButton = document.getElementsByClassName(this.classes.itemGroup)[1].firstChild;

				if(oldLearnButton.firstChild.innerText.includes("Dictionary")) oldLearnButton.outerHTML = "";

				itemGroup.parentElement.style.top = (parseInt(itemGroup.parentElement.style.top) - 50) + "px";

			}, 0);

		};

		this.initialized = true;

		this.switch();

		this.switchEvent = () => this.switch();
		
		NeatoLib.Events.attach("switch", this.switchEvent);
		
		if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());
		
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

		(async () => {
			while(!document.getElementsByClassName("messages scroller").length) await new Promise(p => setTimeout(p, 500));
			this.chatObserver.observe(this.settings.attachEverywhere ? document : document.getElementsByClassName("messages scroller")[0], { childList : true, subtree : true });
		})();

	}
	
	attach() {
		
		this.lastCorrectedWord = -1;

		let allFields = Array.from(document.getElementsByTagName("textarea")).concat(Array.from(document.getElementsByTagName("input")));

		for(let i = 0; i < allFields.length; i++) {
			allFields[i].removeEventListener("keydown", this.keyDownEvent);
			allFields[i].removeEventListener("contextmenu", this.contextMenuEvent);
		}

		let fields = this.settings ? allFields : [NeatoLib.Chatbox.get()];
		
		for(let i = 0; i < fields.length; i++) {
			if(!fields[i]) continue;
			fields[i].addEventListener("keydown", this.keyDownEvent);
			fields[i].addEventListener("contextmenu", this.contextMenuEvent);
		}

	}
	
    stop() {

		let allFields = Array.from(document.getElementsByTagName("textarea")).concat(Array.from(document.getElementsByTagName("input")));

		for(let i = 0; i < allFields.length; i++) {
			allFields[i].removeEventListener("keydown", this.keyDownEvent);
			allFields[i].removeEventListener("contextmenu", this.contextMenuEvent);
		}

		if(this.chatObserver) this.chatObserver.disconnect();

		NeatoLib.Events.detach("switch", this.switchEvent);

	}
	
}
