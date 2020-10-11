/**
 * @name Bruh
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/Bruh.plugin.js
 */

module.exports = (() => {
	const config =
	{
		info: {
			name: "Bruh",
			authors: [{
				name: "Metalloriff",
				discord_id: "264163473179672576",
				github_username: "metalloriff",
				twitter_username: "Metalloriff"
			}],
			version: "0.0.2",
			description: "bruh",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/Bruh.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/Bruh.plugin.js"
		},
		defaultConfig: [{
			id: "general",
			name: "general settings",
			type: "category",
			collapsible: true,
			shown: false,
			settings: [{
				id: "onlyCur",
				name: "Current channel only",
				note: "When this is enabled, the bruh sound effect will only play when a bruh is found in the selected channel.",
				type: "switch",
				value: true
			}, {
				id: "delay",
				name: "Delay between each bruh (ms)",
				note: "The amount of milliseconds to wait between each bruh when multiple bruhs are found within the same message.",
				type: "slider",
				value: 200,
				min: 10,
				max: 1000,
				renderValue: v => Math.round(v) + "ms"
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

		const plugin = (Plugin, Api) => { try {
			const {
				DiscordModules: { Dispatcher, SelectedChannelStore }
			} = Api;

			const audio = new Audio();

			return class Bruh extends Plugin {
				constructor() {
					super();
				}

				getSettingsPanel() {
					return this.buildSettingsPanel().getElement();
				}
	
				onStart() {
					Dispatcher.subscribe("MESSAGE_CREATE", this.messageEvent);
				}
				
				messageEvent = async ({ channelId, message, optimistic }) => {
					if (this.settings.general.onlyCur && channelId != SelectedChannelStore.getChannelId())
						return;

					if (!optimistic) {
						const count = (message.content.match(/bruh/gmi) || []).length;
				
						for (let i = 0; i < count; i++) {
							this.playBruh();

							await new Promise(r => setTimeout(r, this.settings.general.delay));
						}
					}
				};
				
				playBruh() {
					audio.src = "https://www.myinstants.com/media/sounds/movie_1.mp3";
					audio.play();
				}
				
				onStop() {
					Dispatcher.unsubscribe("MESSAGE_CREATE", this.messageEvent);
				}
			}
		} catch (e) { console.error(e); }};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
