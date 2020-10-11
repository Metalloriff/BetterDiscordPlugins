/**
 * @name MentionAliases
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/MentionAliases.plugin.js
 */

module.exports = (() => {
	const config =
	{
		info: {
			name: "MentionAliases",
			authors: [{
				name: "Metalloriff",
				discord_id: "264163473179672576",
				github_username: "metalloriff",
				twitter_username: "Metalloriff"
			}, {
				name: "Strencher",
				discord_id: "415849376598982656",
				github_username: "Strencher",
				twitter_username: "Strencher3"
			}],
			version: "2.0.0",
			description: "Allows you to define custom aliases for users that you can @mention them with, with the option to display the alias next to their username.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/MentionAliases.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/MentionAliases.plugin.js"
		},
		defaultConfig: [{
			id: "general",
			title: "general settings",
			type: "category",
			collapsible: true,
			shown: false,
			settings: [{
				id: "displayTags",
				title: "Display Alias Tags",
				note: "Whether or not to display the alias tag next to the relevant username in chat.",
				type: "switch",
				value: true
			}]
		}],
		changelog: [{
			title: "2.0 rewrite",
			type: "fixed",
			items: [
				"MentionAliases has been rewritten and should work better in the long run. If you notice any bugs that are not listed below, please report them to me.",
			]
		}, {
			title: "known bugs",
			type: "progress",
			items: [
				"Tags will not refresh after modifying a user's alias until you switch channels."
			]
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
				WebpackModules,
				DiscordModules: { UserStore, UserStatusStore, React },
				PluginUtilities,
				Utilities,
				Patcher
			} = Api;

			const { getCurrentUser } = UserStore;

			var f = s => WebpackModules.find(s), d = s => WebpackModules.getByDisplayName(s), p = function() { return WebpackModules.getByProps(...arguments); };

			const { MenuItem, MenuGroup } = f(m => m.MenuItem && !m.default);
			const Popouts = p("openPopout");
			const Modals = p("openModal");
			const { ComponentDispatch } = p("ComponentDispatch");
			const insertText = content => ComponentDispatch.dispatchToLastSubscribed("INSERT_TEXT", { content });

			let fetchedModules = {};
			const Components = {
				...p("Title"),
				ModalRoot: p("ModalRoot").ModalRoot,
				AutocompletePopout: d("FluxContainer(AutocompletePopout)"),
				Avatar: p("AnimatedAvatar").default,
				Tooltip: d("Tooltip"),
				_input: d("TextInput"),
				Flex: d("Flex"),
				Button: p("DropdownSizes"),
				Icon: props => {
					if (!fetchedModules[props.name])
						fetchedModules[props.name] = WebpackModules.find(m => m.id && typeof m.keys === "function" && m.keys().includes("./Activity"))("./" + props.name);
					return React.createElement(fetchedModules[props.name].default, props);
				},
				Input: (props, ref) =>
					React.createElement(Components._input, {
						value: props.value,
						placeholder: props.placeholder,
						ref: e => e && (ref = e),
						onChange: val => {
							ref.props.value = val;
							ref.forceUpdate();
							props.onChange(val);
						}
					})
			};

			const classes = {
				...p("header", "botTag", "listAvatar"),
				...p("textAreaHeight", "channelTextArea", "highlighted"),
				...p("botTagRegular", "botTag")
			};
			
			f = d = p = null;

			const Item = ({ user, alias }) =>
				React.createElement(
					"div",
					{
						style: { display: "flex" },
						children: [
							React.createElement(
								Components.Avatar,
								{
									src: user.getAvatarURL(),
									isMobile: false,
									isTyping: false,
									size: "SIZE_40"
								}
							),
							React.createElement(
								"div",
								{
									className: classes.listRowContent,
									style: { marginLeft: 5 },
									children: [
										React.createElement(
											"div",
											{
												style: {
													textTransform: "none",
													marginTop: 12
												},
												className: classes.listName,
												children: alias
											}
										)
									]
								}
							)
						]
					}
				);
			
			class Popout extends React.Component {
				renderItem(item) {
					if (!item)
						return null;
					
					return React.createElement(
						Item,
						{
							user: item.user,
							alias: item.alias,
							onRemove: () => {
								this.items.splice(this.items.indexOf(item), 1);
								this.forceUpdate();
							}
						}
					);
				}

				render() {
					const { label, onClose, onSelect, placeholder, items } = this.props;

					return React.createElement(
						Components.AutocompletePopout,
						{
							label,
							onClose,
							onSelect,
							placeholder,
							keyboardModeEnabled: false,
							onFilterResults: filter =>
								this.items = items.filter(e =>
									(filter(e.alias.toLowerCase()) ||
									filter(e.user.username.toLowerCase()))),
							onRenderResult: item => this.renderItem(item),
							position: "top",
							sections: [null]
						}
					);
				}
			}

			const AliasTag = ({ alias }) =>
				React.createElement(
					"span",
					{
						className: [classes.botTagRegular, classes.botTag, classes.px].join(" "),
						children:
							React.createElement(
								"span",
								{
									className: classes.botText,
									children: alias.value
								}
							)
					}
				);

			return class MentionAliases extends Plugin {
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
	
				onStart() {
					if (!Array.isArray(this.settings.aliases))
						this.settings.aliases = [];
						
					this.patchAutoComplete();
					this.patchMessageHeader();
					this.patchUserContextMenu();
					this.patchMentions();
					this.patchTextAreaContainer();
				}

				patchAutoComplete() {
					const { MENTIONS } = WebpackModules.getByProps("AUTOCOMPLETE_OPTIONS").AUTOCOMPLETE_OPTIONS;

					Patcher.after(MENTIONS, "queryResults", (_, [, query], props) => {
						for (let alias of this.settings.aliases) {
							const user = UserStore.getUser(alias.userId);
							const renderer = props.users.find(u => u.user.id == alias.userId);

							if (user && query && alias.value.toLowerCase().includes(query.toLowerCase())) {
								if (renderer)
									renderer.nick = alias.value;
								else
									props.users.push({
										comparator: user.usernameNormalized,
										nick: alias.value,
										score: 10,
										status: UserStatusStore.getStatus(alias.userId),
										user
									});
							}
						}
					});
				}

				patchMessageHeader() {
					Patcher.after(WebpackModules.getByProps("MessageTimestamp"), "default", (_, [props], re) => {
						if (!this.settings.general.displayTags)
							return;
						
						const children = Utilities.getNestedProp(re, "props.children.1.props.children");
						const alias = this.settings.aliases.find(u => u.userId == props.message.author.id);
						if (!Array.isArray(children) || !alias)
							return;

						children.splice(
							2, 0,
							React.createElement(
								AliasTag,
								{ alias }
							)
						);
					});
				}

				patchUserContextMenu() {
					const menus = [
						WebpackModules.find(m => m.default && m.default.displayName == "GuildChannelUserContextMenu"),
						WebpackModules.find(m => m.default && m.default.displayName == "DMUserContextMenu")
					];

					for (let menu of menus)
						Patcher.after(menu, "default", (_, [args], re) => {
							const contextMenu = Utilities.getNestedProp(re, "props.children.props.children");
							const registered = this.settings.aliases.findIndex(u => u.userId == args.user.id);

							if (!Array.isArray(contextMenu))
								return;

							contextMenu.push(React.createElement(
								MenuGroup,
								{
									children:
										React.createElement(
											MenuItem,
											{
												label: "Mention Aliases",
												id: "ma-submenu",
												children: [
													registered > -1 ?
														React.createElement(
															MenuItem,
															{
																label: "Remove Alias",
																id: "ma-remove",
																color: "colorDanger",
																action: () => {
																	this.settings.aliases.splice(registered, 1);
																	this.saveSettings();
																}
															}
														) : null,
													React.createElement(
														MenuItem,
														{
															label: (registered > -1 ? "Edit" : "Set") + " Alias",
															id: "ma-edit-remove",
															action: () => this.openAliasModal(args.user)
														}
													)
												]
											}
										)
								}
							));
						});
				}

				patchMentions() {
					Patcher.after(WebpackModules.getByProps("UserMention"), "UserMention", (_, [args], re) => {
						const alias = this.settings.aliases.find(u => u.userId == args.id);

						if (alias) {
							const old = re.props.children;

							re.props.children = e => {
								const render = old(e);

								render.props.children = "@" + alias.value;

								return render;
							};

							return re;
						}
					});

					Patcher.after(WebpackModules.getByDisplayName("DeprecatedPopout").prototype, "render", (self, _, re) => {
						if (!re.props.className.includes("mention"))
							return re;

						const props = self.props.render();

						if (!props || !props.props.userId)
							return re;
						
						const alias = this.settings.aliases.find(u => u.userId == props.props.userId);
						
						if (alias)
							re.props.children = ["@", alias.value];
						
						return re;
					});
				}

				patchTextAreaContainer() {
					const TextAreaContainer = WebpackModules.find(m => m.type && m.type.render && m.type.render.displayName == "ChannelTextAreaContainer");

					Patcher.after(TextAreaContainer.type, "render", (_, [args], re) => {
						const children = Utilities.getNestedProp(re, "props.children.props.children.1.props.children.props.children.2.props.children");

						if (!Array.isArray(children))
							return;

						children.unshift(React.createElement(
							Components.Tooltip,
							{
								text: "Open Aliases Menu",
								position: "top",
								color: "black"
							},
							_props => React.createElement(
								"div",
								{
									className: classes.buttonContainer,
									children:
										React.createElement(
											Components.Icon,
											{
												..._props,
												className: classes.button,
												name: "At",
												style: {
													color: "var(--interactive-normal)",
													cursor: "pointer",
													marginTop: 6
												},
												onClick: e =>
													Popouts.openPopout(
														e.target.parentElement,
														{
															render: props =>
																React.createElement(
																	Popout,
																	{
																		onClose: () => props.onClose(),
																		onSelect: item => {
																			props.onClose();
																			insertText(`<@${item.user.id}>`);
																		},
																		label: "User:",
																		placeholder: "Search for user",
																		items: [
																			...this.settings.aliases.map(e => ({
																				user: UserStore.getUser(e.userId),
																				alias: e.value
																			}))
																		].filter(e => e && e.user)
																	}
																)
														},
														"mention-aliases"
													)
											}
										)
								}
							)
						));
					});
				}

				openAliasModal(user) {
					const settings = this.settings.aliases.find(u => u.userId == user.id);
					let value;

					Modals.openModal(props =>
						React.createElement(
							Components.ModalRoot,
							{
								...props,
								children: [
									React.createElement(
										"h1",
										{
											style: {
												fontWeight: "bold",
												textAlign: "center",
												color: "white",
												margin: 5
											}
										},
										"Define custom alias for " + user.username
									),
									React.createElement(
										"div",
										{ style: { alignSelf: "center" } },
										React.createElement(
											"div",
											{ style: { margin: 15 } },
											React.createElement(
												Components.Input, {
													value: settings ? settings.value : user.username,
													placeholder: "Set Alias",
													onChange: v => (value = v)
												}
											)
										)
									),
									React.createElement(
										"div",
										{
											style: {
												position: "absolute",
												bottom: 5,
												right: 5,
												display: "flex",
												flexDirection: "row"
											},
											children: [
												React.createElement(
													Components.Button,
													{
														children: "Save",
														onClick: () => {
															this.settings.aliases.push({
																value,
																userId: user.id
															});

															this.saveSettings();
															props.onClose();
														},
														style: { margin: 5 }
													}
												),
												React.createElement(
													Components.Button,
													{
														children: "Cancel",
														onClick: () => props.onClose(),
														style: { margin: 5 }
													}
												)
											]
										}
									)
								]
							}
						));
				}
	
				onStop() {
					Patcher.unpatchAll();
				}
			}
		} catch (e) { console.error(e); }};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
