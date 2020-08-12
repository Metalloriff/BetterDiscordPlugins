/**
 * @name AutoCorrect
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AutoCorrect.plugin.js
 */

/* BUGS AND TODO
	Implement DB's SpellChecker.
*/

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "AutoCorrect",
			authors:
			[
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				}
			],
			version: "2.0.1",
			description: "Gives you the options to automatically replace all mis-spelled words with Discord's first correction, automatically punctuate and/or capitalize your sentences, and set up override aliases for typing.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AutoCorrect.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/AutoCorrect.plugin.js"
		},
		changelog:
		[
			{
				title: "2.0 Rewrite",
				type: "fixed",
				items: [
					"AutoCorrect has been completely rewritten from the ground up, new bugs that I missed during development are likely to occur. If you experience any bugs, please report them to me.",
					"Fixed a settings save/load issue.",
					"Fixed spelling errors not auto replacing, I did big dumb."
				]
			}
		]
	};

	return !global.ZeresPluginLibrary ? class
	{
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load()
		{
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () =>
				{
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) =>
					{
						if (err) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}

		start() { }
		stop() { }
	} : (([Plugin, Api]) => {

		const plugin = (Plugin, Api) =>
		{
			const { WebpackModules, DiscordModules, ReactComponents, Patcher, PluginUtilities, Settings, Utilities } = Api;
			const { React } = DiscordModules;

			const process = require("process");
			const SlateModule = WebpackModules.find(m => m.deserialize && !m.add);
			const SpellChecker = WebpackModules.getByProps("isMisspelled");
			const ContextMenu = WebpackModules.getByProps("MenuItem");
			const Button = WebpackModules.find(m => m.Link && m.Link.displayName == "ButtonLink");

			const getSelectiontext = WebpackModules.getByProps("getSelectionText").getSelectionText;
			const formatToDict = s =>
			{
				if (s == null || s.toLowerCase == null)
					return "";
				const match = s.toLowerCase().match(/([a-z]|[0-9])/gi);
				return match == null ? "" : match.join("");
			};

			let lastRender = new Date();
			let lastError;
			let lastLength;
			let lastTextAreaEvent;

			return class AutoCorrect extends Plugin 
			{
				constructor()
				{
					super();

					this.defaultSettings =
					{
						autoReplace: true,
						punctuate: true,
						capitalize: true,
						bsUndo: true,
						overrides:
						[
							{
								key: "idk",
								value: "I don't know"
							},
							{
								key: "discord",
								value: "shitcord"
							}
						],
						dictionary: []
					};
				}

				async showChangelog(footer)
				{
					try { footer = (await WebpackModules.getByProps("getUser", "acceptAgreements").getUser("264163473179672576")).tag + " | https://discord.gg/yNqzuJa"; }
					finally { super.showChangelog(footer); }
				}

				loadSettings = () => this.settings = PluginUtilities.loadSettings(config.info.name, this.defaultSettings);
				saveSettings = () => PluginUtilities.saveSettings(config.info.name, this.settings);

				createSettingsSwitch(title, desc, setting)
				{
					return new Settings.Switch(title, desc, this.settings[setting], value =>
					{
						this.settings[setting] = value;
						this.saveSettings();
					}).getElement();
				}

				createSettingsOverrideItem(index)
				{
					const item = new Settings.SettingGroup("Override Item #" + (parseInt(index) + 1)).append(
						new Settings.Textbox("Key", null, this.settings.overrides[index].key, key =>
						{
							this.settings.overrides[index].key = key;
							this.saveSettings();
						}).getElement(),
						new Settings.Textbox("Value", null, this.settings.overrides[index].value, value =>
						{
							this.settings.overrides[index].value = value;
							this.saveSettings();
						}).getElement(),
						new Settings.SettingField(null, null, null, Button,
						{
							children: "Remove Override",
							onClick: () =>
							{
								this.settings.overrides.splice(index);
								this.saveSettings();
								document.getElementById("ac-oi-" + index).remove();
							}
						}).getElement()
					).getElement();

					item.id = "ac-oi-" + index;

					return item;
				}

				getSettingsPanel()
				{
					this.loadSettings();

					let overrideItems = [];
					for (let i in this.settings.overrides)
						overrideItems.push(this.createSettingsOverrideItem(i));

					return new Settings.SettingPanel(null,
						this.createSettingsSwitch("Auto Replace Spelling Errors", "Automatically replaces any spelling mistakes you make with the first available correction, if any.", "autoReplace"),
						this.createSettingsSwitch("Auto Punctuate", "Automatically punctuates your messages when you send them.", "punctuate"),
						this.createSettingsSwitch("Auto Capitalize", "Automatically capitlizes the first words after punctuations and at the start of your messages.", "capitalize"),
						this.createSettingsSwitch("Backspace Undo Correction", "Hitting backspace after a correction will undo it to the errored word.", "bsUndo"),
						new Settings.SettingGroup("Overrides").append(
							...overrideItems,
							new Settings.SettingField(null, null, null, Button,
							{
								children: "Add Override",
								onClick: () =>
								{
									this.settings.overrides.push(
									{
										key: "ex",
										value: "Example."	
									});
									this.saveSettings();

									const parent = document.querySelector("div.plugin-settings div.plugin-inputs");
									parent.insertBefore(this.createSettingsOverrideItem(this.settings.overrides.length - 1), parent.lastChild);
								}
							}).getElement()
						).getElement()
					).getElement();
				}
	
				async onStart()
				{
					this.loadSettings();

					const TextArea = await ReactComponents.getComponentByName("ChannelEditorContainer", "*");
					const SlateTextAreaContextMenu = WebpackModules.find(m => m.default && m.default.displayName == "SlateTextAreaContextMenu");

					SpellChecker.setLearnedWords(new Set(this.settings.dictionary));
					Patcher.after(SpellChecker, "setLearnedWords", (_, [set]) =>
					{
						for (let word of set)
						{
							if (this.settings.dictionary.indexOf(formatToDict(word)) == -1)
							{
								this.learnWord(formatToDict(word));
							}
						}
					});

					Patcher.after(SlateTextAreaContextMenu, "default", (_, [], re) =>
					{
						if (getSelectiontext().length == 0)
							return;

						let index = -1;
						for (let i = 0; i < this.settings.dictionary.length; i++)
							if (this.settings.dictionary[i] == formatToDict(getSelectiontext()))
								index = i;
								
						if (index == -1)
							return;

						const spellCheckGroup = Utilities.getNestedProp(re, "props.children.1.props.children.props.children");
						if (spellCheckGroup != null)
							spellCheckGroup.unshift(
								React.createElement(
									ContextMenu.MenuItem,
									{
										label: "Remove from Dictionary",
										id: "ac-removefromdict",
										action: () => this.forgetWord(index)
									}
								)
							);
						else
							console.warn("AutoCorrect: SpellCheckGroup nested prop could not be found!");
					});

					Patcher.instead(DiscordModules.MessageActions, "sendMessage", (_, args, sendMessage) =>
					{
						this.tryCorrect(args[1].content + "  ", true).then(correction =>
						{
							args[1].content = correction;
							sendMessage(...args);

							lastLength = -1;

							process.nextTick(() => this.setText(null, ""));
						});
					});

					Patcher.after(TextArea.component.prototype, "render", e =>
					{
						const now = new Date();

						if (now - lastRender > 10)
						{
							this.tryCorrect(e.props.textValue, false).then(correction =>
							{
								if (e.props.textValue != correction)
								{
									this.setText(e, correction);
								}
							});
						}

						lastRender = now;
					});
				}

				async tryCorrect(textValue, sending)
				{
					const words = textValue.split(" ");
					let lastWordIndex = words.length - 2;

					for (let i = words.length - 1; i > -1; i--)
					{
						if (words[i].trim().length > 0)
						{
							lastWordIndex = i;
							break;
						}
					}

					if (words.join(" ").length < lastLength)
					{
						if (this.settings.bsUndo)
							words[lastWordIndex] = lastError;
						lastLength = words.join(" ").length;

						return words.join(" ");
					}

					if (this.settings.autoReplace && (sending || textValue.endsWith(" ")) && words[lastWordIndex] != lastError)
					{
						let hasOverride = false;
						for (let o of this.settings.overrides)
							if (o.value.toLowerCase() == words[lastWordIndex].toLowerCase())
								hasOverride = true;

						const isMisspelled = !hasOverride && this.settings.dictionary.indexOf(formatToDict(words[lastWordIndex])) == -1 && await SpellChecker.isMisspelled(words[lastWordIndex]);

						if (isMisspelled)
						{
							const corrections = await SpellChecker.getCorrections(words[lastWordIndex]);

							if (corrections && corrections.length > 0)
							{
								words[lastWordIndex] = corrections[0];
								lastError = words[lastWordIndex];
							}
						}
					}
					else
						await Promise.resolve();

					if (words[lastWordIndex] != null)
					{
						for (let override of this.settings.overrides)
						{
							if (override.key.toLowerCase() == words[lastWordIndex].toLowerCase()
								&& override.value.toLowerCase() != words[lastWordIndex].toLowerCase() && words[lastWordIndex] != lastError)
							{
								lastError = words[lastWordIndex];
								words[lastWordIndex] = override.value;
							}
						}
					}

					let wasPunctuated = false;

					if (this.settings.capitalize && (sending || textValue.endsWith(" ")))
					{
						if (words[lastWordIndex] == "i")
							words[lastWordIndex] = "I";
						if (words[0].charAt(0) != words[0].charAt(0).toUpperCase() && !words[0].trim().startsWith("http"))
							words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
						
						for (let i = 0; i < words.length; i++)
						{
							if (wasPunctuated && words[i].trim().length > 1 && !words[i].trim().startsWith("http"))
							{
								words[i] = words[i].charAt(0).toUpperCase() + words[i].slice(1);
								wasPunctuated = false;
							}

							if (words[i].trim().match(/[.!?\\-]$/g))
								wasPunctuated = true;
						}
					}

					if (this.settings.punctuate && (sending || textValue.endsWith("  ")))
					{
						for (let i = words.length - 1; i > -1; i--)
						{
							if (words[i].trim().match(/[.!?\\-]$/g))
							{
								i = -1;
								continue;
							}

							if (words[i].trim().endsWith(">")
								|| words[i].trim().match(/(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g) || words[i].trim().startsWith("http"))
									continue;
							
							if (i > -1 && words[i].trim().length > 0)
							{
								words[i] += ".";
								break;
							}
						}
					}

					return words.join(" ");
				}

				setText(_e, text)
				{
					const e = _e == null ? lastTextAreaEvent : _e;

					if (e && e.ref.current)
					{
						e.ref.current.setValue(SlateModule.deserialize(text));
						e.focus();

						e.ref.current.editorRef.moveFocusToEndOfText();
						e.ref.current.editorRef.moveToFocus();

						lastTextAreaEvent = e;
					}
				}

				learnWord(word)
				{
					if (word.length == 0)
						return;

					this.settings.dictionary.push(formatToDict(word));
					this.saveSettings();

					SpellChecker.setLearnedWords(new Set(this.settings.dictionary));
				}

				forgetWord(index)
				{
					if (index != -1)
					{
						this.settings.dictionary.splice(index);
						this.saveSettings();
					}

					SpellChecker.setLearnedWords(new Set(this.settings.dictionary));
				}
	
				onStop()
				{
					Patcher.unpatchAll();
				}
			};
		}

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
