/**
 * @name DoubleClickVoiceChannels
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/DoubleClickVoiceChannels.plugin.js
 */

module.exports = (() => {
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
			version: "2.0.4",
			description: "Requires you to double click voice channels to join them.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/DoubleClickVoiceChannels.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/DoubleClickVoiceChannels.plugin.js"
		},
		changelog:
			[
				{
					title: "Patched",
					type: "fixed",
					items: ["Fixed again. Thanks cmd430 for the help!"]
				}
			]
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
			const { WebpackModules, Patcher, Utilities, ReactComponents } = Api;

			return class DoubleClickVoiceChannels extends Plugin {
				constructor() {
					super();
				}

				async showChangelog(footer) {
					try { footer = (await WebpackModules.getByProps("getUser", "acceptAgreements").getUser("264163473179672576")).tag + " | https://discord.gg/yNqzuJa"; }
					finally { super.showChangelog(footer); }
				}

				async onStart() {
					const { component: ChannelItem } = await ReactComponents.getComponentByName("VoiceChannel", "*");
				
					if (ChannelItem) {
						Patcher.after(ChannelItem.prototype, "render", (r, _, el) => {
					  const children_type0 = Utilities.getNestedProp(el, "props.children.props.children.0.props.children.props.children");
					  const children_type1 = Utilities.getNestedProp(el, "props.children.0.props.children.props.children");
				
							if (children_type0 || children_type1) {
						const handleClick = (children) => {
						  const c = children();
				
									const handler = c.props.children;
									c.props.children = () => {
										const h = handler({});
				
										if (!h.props.connected) {
											// for whatever reason, onDoubleClick stopped working, so here's a dumb workaround
											const onClick = h.props.onClick;
											let t = performance.now() - 200;
				
											h.props.onClick = () => {
												if (performance.now() - t < 200)
													onClick();
				
												t = performance.now();
											};
										}
				
										return h;
									};
				
									return c;
						};
						
						if (children_type0) {
						  el.props.children.props.children[0].props.children.props.children = () => {
							return handleClick(children_type0);
						  };
						} 
						if (children_type1) {
						  el.props.children[0].props.children.props.children = () => {
							return handleClick(children_type1);
						  };
								};
				
							}
							else {
								console.warn("DoubleClickVoiceChannel: Failed to get nested props!");
							}
						});
					}
				}

				onStop() {
					Patcher.unpatchAll();
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
