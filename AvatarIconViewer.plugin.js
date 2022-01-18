/**
 * @name AvatarIconViewer
 * @invite yNqzuJa
 * @authorLink https://discord.com/users/264163473179672576
 * @donate https://www.paypal.me/israelboone
 * @website https://kinzoku.one/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AvatarIconViewer.plugin.js
 */

module.exports = (() => {
	const config =
	{
		info:
		{
			name: "AvatarIconViewer",
			authors:
				[
					{
						name: "Metalloriff",
						discord_id: "264163473179672576",
						github_username: "metalloriff",
						twitter_username: "Metalloriff"
					}
				],
			version: "2.0.2",
			description: "Allows you to view server icons, user avatars, and emotes in fullscreen via the context menu, or copy the link to them.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AvatarIconViewer.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/AvatarIconViewer.plugin.js"
		}
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
			const { DiscordModules, WebpackModules, Patcher } = Api;
			const { React } = DiscordModules
			const ModalStack = WebpackModules.getByProps("openModal", "hasModalOpen");
			const { ModalRoot } = WebpackModules.getByProps("ModalRoot");
			const { ModalSize } = WebpackModules.getByProps("ModalSize");

			const ImageModal = WebpackModules.getByDisplayName("ImageModal");
			const ContextMenu = WebpackModules.getByProps("MenuItem");
			const MaskedLink = WebpackModules.getByDisplayName("MaskedLink");

			const getChannelIconURL = WebpackModules.getByProps("getChannelIconURL").getChannelIconURL;
			const copyToClipboard = require("electron").clipboard.writeText;

			const formatURL = url =>
				url == null || url.length == 0
					? null
					: (url.includes("/a_")
						? url.replace(".webp", ".gif").replace(".png", ".gif")
						: url).split("?")[0] + "?size=2048";

			return class AvatarIconViewer extends Plugin {
				constructor() {
					super();
				}

				async onStart() {
					// I have no idea why, nor do I have the energy to figure out why,
					// but shitcord does not load the context menu modules until the context menu is opened.

					// Therefore, this shitty workaround was made, which requires the user to
					// open the context menu once before the plugin will work.

					// UPDATE: It's less spaghetti, but still spaghetti. I'm sorry.

					this.patched = [];
					document.getElementById("app-mount").addEventListener("contextmenu", this.contextMenuListener = e => {
						const modules = WebpackModules.findAll(
							m => m.default && m.default.displayName && (
								m.default.displayName.endsWith("UserContextMenu") || ~[
									"GroupDMContextMenu",
									"GuildContextMenu",
									"MessageContextMenu"
								].indexOf(m.default.displayName)
							)
						);

						for (const m of modules) {
							if (~this.patched.indexOf(m.default.displayName)) {
								continue;
							}

							switch (m.default.displayName) {
								default: {
									Patcher.after(m, "default", (_, [props], re) => {
										const type = props.user ? "Avatar" : props.channel && props.channel.type == 3 ? "Icon" : null;
										const url = formatURL(type == "Avatar" ? props.user.getAvatarURL() : type == "Icon" ? getChannelIconURL(props.channel) : null);

										if (type && url)
											re.props.children.props.children.push(this.createContext(url, type));
									});
								} break;

								case "GuildContextMenu": {
									Patcher.after(m, "default", (_, [props], re) => {
										const url = formatURL(props.guild.getIconURL());

										if (url)
											re.props.children.push(this.createContext(url, "Icon"));
									});
								} break;

								case "MessageContextMenu": {
									Patcher.after(m, "default", (_, [props], re) => {
										if (props.target && props.target.src) {
											re.props.children.push(this.createContext(props.target.src, "Emoji"));
										}
									});
								} break;
							}

							this.patched.push(m.default.displayName);
						}
					});
				}

				createContext(url, type) {
					const ClassModule = WebpackModules.getByProps("modal", "image");

					return React.createElement(ContextMenu.MenuGroup,
						{
							children:
								[
									React.createElement(
										ContextMenu.MenuItem,
										{
											label: "View " + type,
											id: "aiv-view",
											action: () =>
												ModalStack.openModal(
													props => (
														React.createElement(
															ModalRoot,
															{
																className: ClassModule.modal,
																...props,
																size: ModalSize.DYNAMIC
															},
															React.createElement(
																ImageModal,
																{
																	src: url,
																	placeholder: url,
																	original: url,
																	width: 2048,
																	height: 2048,
																	onClickUntrusted: e => e.openHref(),
																	renderLinkComponent: props => React.createElement(MaskedLink, props)
																}
															)
														)
													)
												)
										}
									),
									React.createElement(
										ContextMenu.MenuItem,
										{
											label: "Copy " + type + " Link",
											id: "aiv-copy",
											action: () => copyToClipboard(url)
										}
									)
								]
						});
				}

				onStop() {
					Patcher.unpatchAll();
					document.getElementById("app-mount").removeEventListener("contextmenu", this.contextMenuListener);
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
