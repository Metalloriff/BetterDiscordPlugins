/**
 * @name DoubleClickVoiceChannels
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/DoubleClickVoiceChannels.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "DoubleClickVoiceChannels",
			authors:
			[
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				}
			],
			version: "2.0.0",
			description: "Requires you to double click voice channels to join them.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/DoubleClickVoiceChannels.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/DoubleClickVoiceChannels.plugin.js"
		}
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
			const { WebpackModules, Patcher } = Api;

			const ChannelItem = WebpackModules.getByDisplayName("ChannelItem");

			return class DoubleClickVoiceChannels extends Plugin
			{
				constructor()
				{
					super();
				}
	
				onStart()
				{
					if (ChannelItem)
					{
						Patcher.after(ChannelItem.prototype, "render", (r, _, el) =>
						{
							if (r.props.channel.type == 2)
							{
								const onClick = el.props.onClick;
								el.props.onDoubleClick = onClick;
								el.props.onClick = () => {};
							}
						});
					}
				}
	
				onStop()
				{
					Patcher.unpatchAll();
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
