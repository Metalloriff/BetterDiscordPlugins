/**
 * @name ReactionImages
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/ReactionImages.plugin.js
 */

module.exports = (() => {
	const config = {
		info: {
			name: "ReactionImages",
			authors: [{
				name: "Metalloriff",
				discord_id: "264163473179672576",
				github_username: "metalloriff",
				twitter_username: "Metalloriff"
			}],
			version: "2.0.1",
			description: "Allows you to define custom reaction image folders and send images with 'foldername/imagesearch'. Example: 'reactions/goodmeme'",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/ReactionImages.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/ReactionImages.plugin.js"
		},
		changelog: [{
			type: "fixed",
			title: "Shitcord patch",
			items: [
				"Shitcord broke, I fixed. Thanks Strencher for letting me know."
			]
		}],
		defaultConfig: [{
			type: "category",
			id: "general",
			name: "general settings",
			collapsible: true,
			shown: true,
			settings: [{
				type: "textbox",
				id: "paths",
				name: "Folder Sources",
				note: "Note: Separate folder paths with commas.",
				placeholder: "Example: C:/Folder1, C:/Folder2/Some Other Folder, C:/Folder3",
				value: ""
			}, {
				type: "slider",
				id: "acSize",
				name: "Autocomplete Image Size",
				value: 200, min: 50, max: 500
			}, {
				type: "slider",
				id: "acCap",
				name: "Autocomplete Result Cap",
				note: "The maximum number of images that will be displayed at the same time. Reduce this if you experience freezes when searching.",
				value: 20, min: 5, max: 100
			}]
		}]
	};

	return !global.ZeresPluginLibrary ? class {
		constructor() { this._config = config; }

		getName = () => config.info.name;
		getAuthor = () => config.info.description;
		getVersion = () => config.info.version;

		load() {
			BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
				confirmText: "Download Now",
				cancelText: "Cancel",
				onConfirm: () => {
					require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (err, res, body) => {
						if (err) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
						await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
					});
				}
			});
		}

		start() { }
		stop() { }
	} : (([Plugin, Api]) => {

		const plugin = (Plugin, Api) => {
			const { WebpackModules, DiscordModules, PluginUtilities, Toasts, Patcher, ReactTools } = Api;
			const { UserStore, React } = DiscordModules;

			const { getCurrentUser } = UserStore;

			const Autocomplete = WebpackModules.getByDisplayName("Autocomplete");
			const { AUTOCOMPLETE_OPTIONS } = WebpackModules.getByProps("AUTOCOMPLETE_OPTIONS");
			const { upload } = WebpackModules.getByProps("cancel", "upload");

			const fs = require("fs");
			const path = require("path");

			const classes = {
				...WebpackModules.getByProps("horizontalAutocomplete"),
				...WebpackModules.getByProps("horizontal", "directionRowReverse", "noWrap"),
				...WebpackModules.getByProps("justifyStart", "alignStretch", "noWrap")
			};

			class AutocompleteItem extends React.Component {
				render() {
					const { fp, data, onClick, selected, index, height } = this.props;

					return React.createElement(
						"div",
						{},
						React.createElement(
							"div",
							{
								style: {
									color: "white",
									textAlign: "center"
								}
							},
							path.basename(fp).split(".")[0],
						),
						React.createElement(
							Autocomplete.GIFIntegration,
							{
								className: classes.horizontalAutocomplete,
								src: `data:image/${path.extname(fp)};base64, ${data}`,
								height, onClick, selected, index
							}
						)
					);
				}
			}

			return class ReactionImages extends Plugin {
				folders = {};

				constructor() {
					super();
				}

				getDataName = () => this.getName() + "." + getCurrentUser().id;
				loadSettings = s => PluginUtilities.loadSettings(this.getDataName(), this.defaultSettings || s);
				saveSettings = s => PluginUtilities.saveSettings(this.getDataName(), this.settings || s);

				async showChangelog(footer) {
					try { footer = (await WebpackModules.getByProps("getUser", "acceptAgreements").getUser("264163473179672576")).tag + " | https://discord.gg/yNqzuJa"; }
					finally { super.showChangelog(footer); }
				}
				
				getSettingsPanel() {
					const panel = this.buildSettingsPanel();

					panel.addListener(() => {
						this.term();
						this.init();
					});

					return panel.getElement();
				}
				
				async init() {
					this.fetchAllFolders();
				}

				async fetchAllFolders() {
					Toasts.show("ReactionImages: Loading folder data...");

					this.folders = {};

					const folderPaths = this.settings.general.paths.split(",").map(p => p.trim());

					for (let folder of folderPaths) {
						const folderName = path.basename(folder).toLowerCase().replace(/ /g, "");

						fs.readdir(folder, async (err, fileNames) => {
							if (err) {
								Toasts.show("ReactionImages: Failed to load folder named '" + folderName + "'!", { type: "error" });

								return console.error(err);
							}

							this.folders[folderName] = [];

							for (let fileName of fileNames) {
								const ext = fileName.split(".")[fileName.split(".").length - 1];

								if (!fileName.includes(".") || !["jpg", "jpeg", "png", "gif", "bmp"].includes(ext))
									continue;
								
								const fp = path.join(folder, fileName);
								const data = await new Promise(r => fs.readFile(fp, "base64", (_, d) => r(d)));

								this.folders[folderName].push({
									data,
									fp,
									size: data.length
								});
							}

							Toasts.show("ReactionImages: Successfully loaded folder named '" + folderName + "'.", { type: "success" });
						});
					}
				}

				getFolders() {
					return this.settings.general.paths.split(",").map(fp => ([ fp.trim(), path.basename(fp.trim()) ]));
				}

				term() {

				}

				holdingShift = false;
				updateHoldingShift = e => this.holdingShift = e.shiftKey;

				async onStart() {
					this.init();

					document.addEventListener("keydown", this.updateHoldingShift);
					document.addEventListener("keyup", this.updateHoldingShift);

					AUTOCOMPLETE_OPTIONS.REACTION_IMAGES = {
						autoSelect: true,

						getPlainText: () => "",
						getRawText: () => "",
						getSentinel: () => "",

						matches: (channel, {}, query, {}, config, queryRaw) => {
							for (const [ fp, dirName ] of this.getFolders()) {
								if (query.split("/")[0] == dirName.toLowerCase()) {
									return true;
								}
							}

							return false;
						},

						queryResults: (channel, query, config, queryRaw) => {
							const [ folderName, reactionQuery ] = query.split("/");
							const results = [];
							const folder = this.folders[folderName];

							if (folder && folder.length) {
								for (const file of folder) {
									const fn = path.basename(file.fp);

									if (fn.toLowerCase().replace(/ /g, "").startsWith(reactionQuery)) {
										results.push(file);
									}
								}
							}

							return { results };
						},

						renderResults: (channel, query, selectedIndex, select, choose, config, _, { results }) => {
							const strong = c => React.createElement("strong", {}, c);

							return [
								React.createElement(
									Autocomplete.Title,
									{ title: [ "Searching ", strong(`"${query.split("/")[1]}"`), " in ", strong(query.split("/")[0]) ] }
								),
								React.createElement(
									"div",
									{ className: [ classes.flex, classes.horizontal, classes.justifyStart, classes.alignStretch, classes.noWrap, classes.horizontalAutocompletes ].join(" ") },
									results.map(({ data, fp, size }, index) => React.createElement(
										AutocompleteItem,
										{
											fp, data,
											onClick: () => {
												const { deserialize } = WebpackModules.getByProps("serialize", "deserialize");
												const { channelTextArea } = WebpackModules.getByProps("channelTextArea", "channelTextAreaDisabled");
												const [ cta ] = document.getElementsByClassName(channelTextArea);
												const owner = ReactTools.getOwnerInstance(cta);
												const { state: { textValue } } = owner;

												upload(channel.id, new File([ fs.readFileSync(fp) ], path.basename(fp)), {
													content: textValue.split(" ").splice(0, textValue.split(" ").length - 1).join(" ")
												});

												if (!this.holdingShift) {
													owner.setState({ textValue: "", richValue: deserialize("") });

													if (!this.settings.hasShownShiftNotice) {
														Toasts.show("Note: You can hold shift to prevent the menu from closing when sending a reaction!", { type: "success" });

														this.settings.hasShownShiftNotice = true;
														this.saveSettings();
													}
												}
											},
											selected: selectedIndex == index,
											height: this.settings.general.acSize,
											index,
										}
									)).slice(0, this.settings.general.acCap)
								)
							];
						}
					};
				}

				onStop() {
					this.term();

					document.removeEventListener("keydown", this.updateHoldingShift);
					document.removeEventListener("keyup", this.updateHoldingShift);

					delete AUTOCOMPLETE_OPTIONS.REACTION_IMAGES;

					Patcher.unpatchAll();
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
