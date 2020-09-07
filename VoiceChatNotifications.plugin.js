/**
 * @name VoiceChatNotifications
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/VoiceChatNotifications.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "VoiceChatNotifications",
			authors:
			[
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				}
			],
			version: "3.0.0",
			description: "Displays notifications when users join/leave, mute/unmute, deafen/undeafen, or are moved in the voice channel you're in.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/VoiceChatNotifications.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/VoiceChatNotifications.plugin.js"
		},
		defaultConfig:
		[
			{
				type: "category",
				id: "log",
				name: "notification settings",
				collapsible: true,
				shown: true,
				settings:
				[
					{
						type: "switch",
						id: "connections",
						name: "Show join/leave notifications",
						value: true
					},
					{
						type: "switch",
						id: "selfMute",
						name: "Show mute/unmute notifications",
						value: true
					},
					{
						type: "switch",
						id: "selfDeafen",
						name: "Show deafen/undeafen notifications",
						value: true
					},
					{
						type: "switch",
						id: "moved",
						name: "Show user channel move notifications",
						value: true
					},
					{
						type: "switch",
						id: "mute",
						name: "Show server mute/unmute notifications",
						value: true
					},
					{
						type: "switch",
						id: "deafen",
						name: "Show server deafen/undeafen notifications",
						value: true
					},
					{
						type: "switch",
						id: "selfVideo",
						name: "Show user video notifications",
						value: true
					},
					{
						type: "switch",
						id: "selfStream",
						name: "Show user stream notifications",
						value: true
					},
					{
						type: "switch",
						id: "supressInDnd",
						name: "Disable notifications while in do not disturb",
						value: true
					}
				]
			}
		],
		changelog:
		[
			{
				type: "fixed",
				title: "3.0 rewrite",
				items:
				[
					"This plugin has been rewritten, if you experience any new bugs, please contact me.",
					"Please note that all settings have been reset and you will have to reconfigure them."
				]
			},
			{
				type: "added",
				title: "new features",
				items:
				[
					"Added user video notifications.",
					"Added user stream notifications."
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
			const { WebpackModules, DiscordModules } = Api;
			const { UserStore, ChannelStore, SelectedChannelStore, UserStatusStore } = DiscordModules;

			const { getVoiceStates } = WebpackModules.getByProps("getVoiceState");

			return class VoiceChatNotifications extends Plugin
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
					this.loop = setInterval(() => this.main(), 500);
				}

				main()
				{
					const vcid = SelectedChannelStore.getVoiceChannelId();
					const vc = vcid == null ? null : ChannelStore.getChannel(vcid);

					if (vc == null)
						return;

					const me = UserStore.getCurrentUser();
					const states = getVoiceStates();

					if (UserStatusStore.getStatus(me.id) != "dnd" || !this.settings.log.supressInDnd)
					{
						for (let state of Object.values(states))
						{
							const user = UserStore.getUser(state.userId);
							const channel = ChannelStore.getChannel(state.channelId);
							
							if (state.userId == me.id || this.states == null || user == null || channel == null)
								continue;
							
							const o = { silent: true, icon: user.getAvatarURL() };

							if (this.states[state.userId] == null)
							{
								if (this.settings.log.connections)
								{
									new Notification(`${user.username} joined ${channel.name == "" ? "the call" : channel.name}`, o);
								}
							}
							else
							{
								const lastState = this.states[state.userId];
								const diff = Object.keys(state).filter(k => state[k] != lastState[k]);

								if (this.settings.log.moves && lastState.channelId != state.channelId)
								{
									new Notification(`${user.username} moved to ${channel.name}`, o);
									continue;
								}

								for (let d of diff)
								{
									const v = state[d];
									let m = null;

									switch (d)
									{
										case "selfMute":
											m = `${user.username} ${v ? "muted" : "unmuted"} themselves`;
											break;
										case "selfDeafen":
											m = `${user.username} ${v ? "deafened" : "undeafened"} themselves`;
											break;
										case "mute":
											m = `${user.username} was ${v ? "muted" : "unmuted"}`;
											break;
										case "deafen":
											m = `${user.username} was ${v ? "deafened" : "undeafened"}`;
											break;
										case "selfVideo":
											m = `${user.username} ${v ? "enabled" : "disabled"} their video`;
											break;
										case "selfStream":
											m = `${user.username} ${v ? "started a" : "stopped their"} stream`;
											break;
									}

									if (m != null && this.settings.log[d] == true)
									{
										new Notification(m, o);
									}
								}
							}
						}

						if (this.states != null)
						{
							for (let state of Object.values(this.states))
							{
								const user = UserStore.getUser(state.userId);
								const channel = ChannelStore.getChannel(state.channelId);
								
								if (state.userId == me.id || this.states == null || user == null || channel == null)
									continue;
							
								const o = { silent: true, icon: user.getAvatarURL() };

								if (states[state.userId] == null && this.settings.log.connections)
								{
									new Notification(`${user.username} disconnected from ${channel.name == "" ? "the call" : channel.name}`, o);
								}
							}
						}
					}

					this.states = states;
				}
	
				onStop()
				{
					clearInterval(this.loop);
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
