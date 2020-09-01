/**
 * @name GuildAndFriendRemovalAlerts
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/GuildAndFriendRemovalAlerts.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "GuildAndFriendRemovalAlerts",
			authors:
			[
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				}
			],
			version: "2.1.1",
			description: "Displays alerts when you are kicked/banned from a server, a server is deleted, and when a friend removes you.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/GuildAndFriendRemovalAlerts.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/GuildAndFriendRemovalAlerts.plugin.js"
		},
		changelog:
		[
			{
				title: "2.0 rewrite",
				type: "fixed",
				items:
				[
					"Guild and Friend Removal Alerts has been rewritten. As with the old plugin, a modal will show when a server or friend is removed, and you may right click the home button to view the history.",
					"If you experience any bugs, please report them to me."
				]
			},
			{
				title: "new features",
				items:
				[
					"GFRA's data is now local user ID based. This will prevent issues when using multiple accounts and switching between them.",
					"If you click a removed friend item, it will open a DM channel with the user.",
					"If you click a removed guild item, it will open a DM channel with the owner of the guild, if available."
				]
			}
		],
		defaultConfig:
		[
			{
				id: "showModal",
				type: "switch",
				name: "Auto Show Modal",
				note: "Whether or not to automatically show the modal when a guild/friend is removed.",
				value: true
			},
			{
				id: "showDeskNotifs",
				type: "switch",
				name: "Show Desktop Notifications",
				note: "Whether or not to show desktop notifications when a guild/friend is removed.",
				value: false
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
			const { WebpackModules, DiscordModules, DiscordClasses, PluginUtilities, ReactComponents, Patcher } = Api;
			const { React, ContextMenuActions } = DiscordModules;

			const { getUser: fetchUser } = WebpackModules.getByProps("getUser", "acceptAgreements");
			const { getUser, getCurrentUser } = DiscordModules.UserStore;
			const { getGuild, getGuilds } = DiscordModules.GuildStore;
			const { getFriendIDs } = WebpackModules.getByProps("getFriendIDs");

			const getSerializableGuild = gid =>
			{
				const r = { id: gid, invalid: true, name: "Unknown Guild", iconURL: "/assets/1531b79c2f2927945582023e1edaaa11.png" };
				const guild = getGuild(gid);
				
				try
				{
					if (guild != null)
					{
						r.invalid = false;
						r.name = guild.name;
						r.ownerId = guild.ownerId;
						if (guild.getIconURL != null)
							r.iconURL = guild.getIconURL();
					}
				} finally { }

				return r;
			};

			const getSerializableUser = uid =>
			{
				const r = { id: uid, invalid: true, tag: "Unknown User", avatarURL: "/assets/1cbd08c76f8af6dddce02c5138971129.png" };
				const user = getUser(uid);

				try
				{
					if (user != null)
					{
						r.invalid = false;
						r.tag = user.tag;
						if (user.getAvatarURL != null)
							r.avatarURL = user.getAvatarURL();
					}
				} finally { }

				return r;
			};

			const PrivateModule = WebpackModules.getByProps("openPrivateChannel");

			const { ModalRoot } = WebpackModules.getByProps("ModalRoot");
			const ModalStack = WebpackModules.getByProps("openModal");

			const { default: ScrollWrapper } = WebpackModules.getByProps("ScrollerAuto");
			const { default: Avatar } = WebpackModules.getByProps("AnimatedAvatar");
			const { default: ContextMenu } = WebpackModules.getByProps("MenuStyle", "default");
			const { MenuGroup: CtxMenuGroup, MenuItem: CtxMenuItem } = WebpackModules.find(m => m.MenuRadioItem && !m.default);

			const { listRow, listRowContent, listName } = WebpackModules.getByProps("header", "botTag", "listAvatar");

			class GuildItem extends React.Component
			{
				constructor(props)
				{
					super(props);
					this.state = { owner: "" };
				}

				async componentDidMount()
				{
					if (this.props.guild.ownerId != null)
					{
						let owner = getUser(this.props.guild.ownerId);
						if (owner == null || owner.tag == null)
						{
							fetchUser(this.props.guild.ownerId).then(owner =>
							{
								this.setState({ owner: owner.tag }); // TODO: add interactable user object for guild owners.
							}).catch(console.warn);
						}
						else
						{
							this.setState({ owner: owner.tag });
						}
					}
				}

				render()
				{
					return React.createElement(
						"div",
						{
							className: listRow,
							onClick: () =>
							{
								if (this.props.guild.ownerId != null)
								{
									PrivateModule.openPrivateChannel(this.props.guild.ownerId);
									this.props.onClose();
								}
							},
							children:
							[
								React.createElement(
									Avatar,
									{
										src: this.props.guild.iconURL,
										isMobile: false,
										isTyping: false,
										size: "SIZE_40"
									}
								),
								React.createElement(
									"div",
									{
										className: listRowContent,
										style: { marginLeft: "5px" },
										children:
										[
											React.createElement(
												"div",
												{
													className: listName,
													children:
													[
														this.props.guild.name,
														React.createElement(
															"span",
															{
																style: { opacity: 0.5, marginLeft: 10 },
																children: "Owner: " + this.state.owner
															}
														)
													]
												}
											)
										]
									}
								)
							]
						}
					)
				}
			}

			class UserItem extends React.Component
			{
				constructor(props)
				{
					super(props);
					this.state = { user: props.user };
				}

				async componentDidMount()
				{
					if (this.state.user.invalid == true)
					{
						fetchUser(this.state.user.id).then(u => this.setState({ user: u })).catch(console.warn);
					}
				}

				render()
				{
					return React.createElement(
						"div",
						{
							className: listRow,
							onClick: () =>
							{
								if (this.state.user.id != null)
								{
									PrivateModule.openPrivateChannel(this.state.user.id);
									this.props.onClose();
								}
							},
							children:
							[
								React.createElement(
									Avatar,
									{
										src: this.state.user.avatarURL,
										isMobile: false,
										isTyping: false,
										size: "SIZE_40"
									}
								),
								React.createElement(
									"div",
									{
										className: listRowContent,
										style: { marginLeft: "5px" },
										children:
										[
											React.createElement(
												"div",
												{
													className: listName,
													children: this.state.user.tag
												}
											)
										]
									}
								)
							]
						}
					)
				}
			}

			class Menu extends React.Component
			{
				constructor(props)
				{
					super(props);
				}

				render()
				{
					return React.createElement(
						"div",
						{
							style: { marginTop: 10 },
							children:
							[
								React.createElement(
									ScrollWrapper,
									{
										style: { maxHeight: 600 },
										children:
										[
											React.createElement(
												"div",
												{
													className: DiscordClasses.Changelog.fixed.value,
													style: { margin: 10 },
													children:
													[
														React.createElement(
															"div",
															{ children: `removed guilds (${this.props.removedGuilds.length})` }
														)
													]
												}
											),
											this.props.removedGuilds.length > 0
												? this.props.removedGuilds.map(
													guild =>
														React.createElement(
															GuildItem,
															{
																guild: guild || getSerializableGuild(null),
																onClose: this.props.onClose
															}
														)
													)
												: React.createElement(
													"div",
													{
														className: listRow,
														children:
															React.createElement(
																"div",
																{
																	className: listRowContent,
																	children: "No removed guilds."
																}
															)
													}
												),
											React.createElement(
												"div",
												{
													className: DiscordClasses.Changelog.fixed.value,
													style: { margin: 10 },
													children:
													[
														React.createElement(
															"div",
															{ children: `removed friends (${this.props.removedFriends.length})` }
														)
													]
												}
											),
											this.props.removedFriends.length > 0
												? this.props.removedFriends.map(
													user =>
														React.createElement(
															UserItem,
															{
																user: user || getSerializableUser(null),
																onClose: this.props.onClose
															}
														)
												)
												: React.createElement(
													"div",
													{
														className: listRow,
														children:
															React.createElement(
																"div",
																{
																	className: listRowContent,
																	children: "No removed friends."
																}
															)
													}
												)
										]
									}
								)
							]
						}
					);
				}
			}

			return class GuildAndFriendRemovalAlerts extends Plugin
			{
				constructor()
				{
					super();
				}

				async showChangelog(footer)
				{
					try { footer = (await fetchUser("264163473179672576")).tag + " | https://discord.gg/yNqzuJa"; }
					finally { super.showChangelog(footer); }
				}

				getSettingsPanel = () => this.buildSettingsPanel().getElement();

				getDataName = () => this.getName() + "_" + getCurrentUser().id;
	
				onStart()
				{
					this.loop = setInterval(() => this.tick(), 5000);

					this.removedGuildHistory = PluginUtilities.loadData(this.getDataName(), "removedGuildHistory", []);
					this.removedFriendHistory = PluginUtilities.loadData(this.getDataName(), "removedFriendHistory", []);

					ReactComponents.getComponentByName("DefaultHomeButton", "*").then(r =>
					{
						Patcher.after(r.component.prototype, "render", (props, args, re) =>
						{
							re.props.onContextMenu = e =>
							{
								ContextMenuActions.openContextMenu(e, () =>
									React.createElement(
										ContextMenu,
										{
											navId: "HomeContextMenu",
											onClose: ContextMenuActions.closeContextMenu,
											children:
											[
												React.createElement(
													CtxMenuGroup,
													{
														children:
															React.createElement(
																CtxMenuItem,
																{
																	label: "View GFR History",
																	id: "view-gfr-history",
																	action: () => this.openModal(this.removedGuildHistory, this.removedFriendHistory)
																}
															)
													}
												)
											]
										}
									)
								);
							};
						});
					}).catch(exc => console.warn(this.getName() + ": Failed to patch react component 'DefaultHomeButton'. Reason: " + exc));
				}

				tick()
				{
					const guilds = Object.values(getGuilds()).map(g => ({ id: g.id, name: g.name, iconURL: g.getIconURL(), ownerId: g.ownerId }));
					const friends = getFriendIDs().map(uid => getSerializableUser(uid));

					const lastGuilds = PluginUtilities.loadData(this.getDataName(), "guildCache", []);
					const lastFriends = PluginUtilities.loadData(this.getDataName(), "friendCache", []);

					const removedGuilds = lastGuilds.filter(g => !guilds.some(l => l.id == g.id));
					const removedFriends = lastFriends.filter(u => !friends.some(l => l.id == u.id));

					if (lastGuilds.length != guilds.length || lastFriends.length != friends.length)
					{
						if (removedGuilds.length > 0 || removedFriends.length > 0)
						{
							if (this.settings.showModal)
								this.openModal(removedGuilds, removedFriends);

							if (this.settings.showDeskNotifs)
							{
								for (let guild of removedGuilds)
									new Notification(
										guild.name,
										{
											silent: true,
											body: "Server removed",
											icon: guild.iconURL
										}
									);

								for (let friend of removedFriends)
									new Notification(
										friend.tag,
										{
											silent: true,
											body: "Friend removed",
											icon: friend.avatarURL
										}
									);
							}

							this.removedGuildHistory.push(...removedGuilds);
							this.removedFriendHistory.push(...removedFriends);

							PluginUtilities.saveData(this.getDataName(), "removedGuildHistory", this.removedGuildHistory);
							PluginUtilities.saveData(this.getDataName(), "removedFriendHistory", this.removedFriendHistory);
						}

						PluginUtilities.saveData(this.getDataName(), "guildCache", guilds);
						PluginUtilities.saveData(this.getDataName(), "friendCache", friends);
					}
				}

				openModal(removedGuilds, removedFriends)
				{
					removedGuilds = removedGuilds.filter(g => typeof(g) == "object").reverse();
					removedFriends = removedFriends.filter(u => typeof(u) == "object").reverse();

					if (this.activeModalKey != null && ModalStack.hasModalOpen(this.activeModalKey))
					{
						ModalStack.closeModal(this.activeModalKey);
						this.activeModalKey = null;
					}

					this.activeModalKey = ModalStack.openModal(
						props =>
							React.createElement(
								ModalRoot,
								{
									...props,
									size: "medium"
								},
								React.createElement(
									Menu,
									{
										...props,
										removedGuilds,
										removedFriends
									}
								)
							)
					);
				}
	
				onStop()
				{
					clearInterval(this.loop);
					Patcher.unpatchAll();
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
