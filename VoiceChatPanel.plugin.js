/**
 * @name VoiceChatPanel
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/VoiceChatPanel.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "VoiceChatPanel",
			authors:
			[
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				}
			],
			version: "0.0.1",
			description: "Adds user voice db beside their name, and adds a history graph for user volumes.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/VoiceChatPanel.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/VoiceChatPanel.plugin.js"
		},
		defaultConfig:
		[
			{
				id: "hideSilentUsers",
				type: "switch",
				name: "Hide Silent Users",
				value: true
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
			const { WebpackModules, Patcher, DiscordModules, PluginUtilities } = Api;
			const { React, UserStore, ChannelStore, SelectedChannelStore } = DiscordModules;
			
			const MediaEngine = WebpackModules.getByProps("getMediaEngine").getMediaEngine();
			const { TimelineDataSeries, TimelineGraphView } = WebpackModules.getByProps("TimelineDataSeries");
			const ModalStack = WebpackModules.getByProps("openModal");
			
			const VoiceUser = WebpackModules.getByDisplayName("VoiceUser");
			const { default: ScrollWrapper } = WebpackModules.getByProps("ScrollerAuto");
			const { ModalRoot } = WebpackModules.getByProps("ModalRoot");
			const RTCDebugItem = WebpackModules.getByDisplayName("RTCDebugItem");
			const PanelButton = WebpackModules.getByDisplayName("PanelButton");
			const SwitchItem = WebpackModules.getByDisplayName("SwitchItem");

			const icon = e => React.createElement((WebpackModules.find(m => m.id != null && typeof m.keys == "function" && m.keys().includes("./Activity"))(e) || {}).default);
			const db = l => l.toLocaleString({}, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
			const getVoiceStates = () => WebpackModules.getByProps("getVoiceStatesForChannel").getVoiceStatesForChannel(ChannelStore.getChannel(SelectedChannelStore.getVoiceChannelId()));

			let components = [];
			let timeline = {};

			class Graph extends React.Component
			{
				constructor()
				{
					super();
					this.state = { dataSeries: new TimelineDataSeries() };
				}

				componentDidMount()
				{
					this.interval = setInterval(() => {
						if (timeline[this.props.user.id] != null)
						{
							this.setState({ dataSeries: timeline[this.props.user.id] });
						}
					}, 500);
				}

				componentWillUnmount()
				{
					clearInterval(this.interval);
				}

				handleRenderGraph(e)
				{
					if (e != null)
					{
						this.state.graphView = new TimelineGraphView(e);
						this.state.graphView.backgroundColor = "black";
						this.state.graphView.textColor = "white";
						this.state.graphView.timeOptions = { timeStyle: "short" };
						this.state.graphView.addDataSeries(this.state.dataSeries);
						this.state.graphView.updateEndDate();
					}
				}

				render()
				{
					return React.createElement(
						"canvas",
						{
							key: "canvas",
							height: 100,
							style: { width: "100%" },
							ref: e => this.handleRenderGraph(e)
						}
					);
				}
			}

			class Panel extends React.Component
			{
				constructor()
				{
					super();
					this.state = BdApi.getPlugin("VoiceChatPanel").settings
				}

				render()
				{
					return React.createElement(
						"div",
						{
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
													style: { margin: 10 }
												},
												React.createElement(
													SwitchItem,
													{
														children: "Hide Silent Users",
														note: "",
														onChange: e =>
														{
															const plugin = BdApi.getPlugin("VoiceChatPanel");
															plugin.settings.hideSilentUsers = !plugin.settings.hideSilentUsers;
															plugin.saveSettings();

															this.setState(plugin.settings);
														},
														value: this.state.hideSilentUsers
													}
												)
											),
											...this.props.users.map(user =>
												React.createElement(
													"div",
													{
														style: { margin: "5%" },
														children:
														[
															React.createElement(
																RTCDebugItem,
																{
																	children: user.username,
																	renderGraph: () =>
																		React.createElement(
																			Graph,
																			{ user }
																		),
																	valueRendered: "timeline"
																},
															)
														]
													}
												))
										]
									}
								)
							]
						}
					);
				}
			}

			class UserVolumeLabel extends React.Component
			{
				constructor()
				{
					super();
					this.state = { volume: 0 };
				}

				componentDidMount()
				{
					components.push(this);
				}

				componentWillUnmount()
				{
					components.splice(components.indexOf(this));
				}

				render()
				{
					return this.props.serverMute || this.props.mute
						? React.createElement("span")
						: React.createElement(
							"span",
							{
								style:
								{
									fontSize: "14px",
									lineHeight: "18px",
									fontWeight: 500,
									color: this.state.volume > 0.5 ? "red" : "white",
									whiteSpace: "nowrap",
								},
								children: db(this.state.volume)
							}
						);
				}
			}

			return class VoiceChatPanel extends Plugin
			{
				constructor()
				{
					super();
				}

				async showChangelog(footer)
				{
					try { footer = (await WebpackModules.getByProps("getUser", "acceptAgreements").getUser("264163473179672576")).tag + " | https://discord.gg/yNqzuJa"; }
					finally { super.showChangelog(footer); }
				}
				
				getSettingsPanel = () => this.buildSettingsPanel().getElement();
	
				onStart()
				{
					this.localUserId = UserStore.getCurrentUser().id;

					PluginUtilities.addStyle(this.getName(), `
						.draggable-1KoBzC { height: auto }

						.vcp-button
						{
							position: absolute;
							top: 7px;
							left: 135px;
						}
					`);

					Patcher.instead(VoiceUser.prototype, "render", ({ props }, _, e) =>
					{
						if (!props.speaking && this.settings.hideSilentUsers)
						{
							return React.createElement("div");
						}

						const re = e(props);

						if (props.user.id != this.localUserId)
						{
							re.props.children.props.children.splice(3, 0, React.createElement(UserVolumeLabel, props));
						}

						return re;
					});

					Patcher.after(WebpackModules.getByDisplayName("RTCConnectionStatus").prototype, "render", ({ props }, _, re) =>
					{
						re.props.children.push(
							React.createElement(
								"div",
								{ className: "vcp-button" },
								React.createElement(
									PanelButton,
									{
										icon: () => icon("./TrendingUp.tsx"),
										onClick: () =>
											ModalStack.openModal(
												props =>
													React.createElement(
														ModalRoot,
														{
															...props
														},
														React.createElement(
															Panel,
															{
																...props,
																users: getVoiceStates().filter(user => user.userId != this.localUserId).map(s => UserStore.getUser(s.userId))
															}
														)
													)
											),
										tooltipText: "Open Audio Graph"
									}
								)
							)
						);
					});

					this.interval = setInterval(() =>
					{
						let i = 0;
						MediaEngine.eachConnection(e =>
						{
							if (i == 0)
								this.tick(e);
							i++;
						});
					}, 500);
				}

				tick(e)
				{
					e.getStats().then(stats =>
					{
						const volumeStates = {};

						for (let uid in stats.rtp.inbound)
							if (uid != this.localUserId)
							{
								volumeStates[uid] = stats.rtp.inbound[uid][0].audioLevel;

								if (timeline[uid] == null)
									timeline[uid] = new TimelineDataSeries();
								
								timeline[uid].addPoint(Date.now(), volumeStates[uid]);
							}

						for (let component of components)
							if (volumeStates[component.props.user.id] != null)
								component.setState({ volume: volumeStates[component.props.user.id] });
					});
				}
	
				onStop()
				{
					clearInterval(this.interval);
					Patcher.unpatchAll();
					PluginUtilities.removeStyle(this.getName());
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();