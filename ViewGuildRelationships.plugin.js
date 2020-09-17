/**
 * @name ViewGuildRelationships
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/ViewGuildRelationships.plugin.js.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
	const config = {
		info: {
			name: 'View Guild Relationships',
			authors: [
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				},
			],
			version: '0.0.1',
			description:
				'Adds a View Relationships button to the guild dropdown and context menu that opens a list of all friends, requested friends, and blocked users in the server.',
			github:
				'https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/ViewGuildRelationships.plugin.js',
			github_raw:
				'https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/ViewGuildRelationships.plugin.js',
		},
		changelog: [
			{
				title: 'rewrite',
				type: 'added',
				items: ['The plugin got rewritten.'],
			},
		],
	};

	return !global.ZeresPluginLibrary
		? class {
			constructor() {
				this._config = config;
			}
			getName() {
				return config.info.name;
			}
			getAuthor() {
				return config.info.authors.map((a) => a.name).join(', ');
			}
			getDescription() {
				return config.info.description;
			}
			getVersion() {
				return config.info.version;
			}
			load() {
				BdApi.showConfirmationModal(
					'Library plugin is needed',
					[
						`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
					],
					{
						confirmText: 'Download',
						cancelText: 'Cancel',
						onConfirm: () => {
							require('request').get(
								'https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js',
								async (error, response, body) => {
									if (error)
										return require('electron').shell.openExternal(
											'https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js'
										);
									await new Promise((r) =>
										require('fs').writeFile(
											require('path').join(
												BdApi.Plugins.folder,
												'0PluginLibrary.plugin.js'
											),
											body,
											r
										)
									);
								}
							);
						},
					}
				);
			}
			start() { }
			stop() { }
		}
		: (([Plugin, Api]) => {
			const plugin = (Plugin, Api) => {
				const {
					WebpackModules,
					PluginUtilities,
					DiscordModules,
					ReactComponents,
					Patcher,
					Utilities,
					DiscordModules: { React },
				} = Api;
				const {
					listRow,
					listRowContent,
					listName,
				} = WebpackModules.getByProps('header', 'botTag', 'listAvatar');
				const Avatar = WebpackModules.getByProps('AnimatedAvatar').default;
				const TabComponent = WebpackModules.getByDisplayName('TabBar');
				const Modal = WebpackModules.getByProps('CloseButton');
				const { MenuItem, MenuGroup } = WebpackModules.getModule(
					(m) => m.MenuRadioItem && !m.default
				);
				const
					{
						default: ScrollWrapper
					} = WebpackModules.getByProps('ScrollerAuto');
				const {
					tabBarContainer,
					tabBarItem,
					tabBar,
				} = WebpackModules.getByProps(
					'root',
					'topSectionStreaming',
					'topSectionSpotify'
				);
				const { sizeMedium } = WebpackModules.getByProps(
					'responsiveWidthMobile',
					'modal',
					'sizeSmall'
				);
				const Item = ({ user, guild, onClose }) => {
					return React.createElement('div', {
						className: listRow,
						onClick: () => {
							WebpackModules.getByProps(
								'openPrivateChannel'
							).openPrivateChannel(user.id);
							onClose();
						},
						children: [
							React.createElement(Avatar, {
								src: user.getAvatarURL(),
								isMobile: false,
								isTyping: false,
								size: 'SIZE_40',
							}),
							React.createElement('div', {
								className: listRowContent,
								style: {
									marginLeft: '5px',
								},
								children: [
									React.createElement('div', {
										className: listName,
										children: user.username,
									}),
								],
							}),
						],
					});
				};
				const Tabs = [
					{
						label: 'Blocked Users',
						id: 'BLOCKED_USERS',
						element: (props, onClose) => {
							var blockedUsers = [];
							Object.entries(
								DiscordModules.RelationshipStore.getRelationships()
							).forEach(([key, value]) => {
								if (value == 2)
									blockedUsers.push(DiscordModules.UserStore.getUser(key));
							});
							const blocked = blockedUsers.filter(
								(e) =>
									!!DiscordModules.GuildMemberStore.getMember(props.id, e.id)
							);
							return blocked.length == 0
								? React.createElement(
									'p',
									{
										style: {
											color: 'white',
											fontWeight: 'bold',
											textAlign: 'center',
										},
									},
									'No Mutual Blocked Users'
								)
								: blocked.map((e) =>
									React.createElement(Item, {
										user: e,
										guild: props,
										onClose,
									})
								);
						},
					},
					{
						label: 'Incoming Friends',
						id: 'INCOMING_FRIENDS',
						element: (props, onClose) => {
							var icomingFriends = [];
							Object.entries(
								DiscordModules.RelationshipStore.getRelationships()
							).forEach(([key, value]) => {
								if (value == 3)
									icomingFriends.push(DiscordModules.UserStore.getUser(key));
							});
							const inc = icomingFriends.filter(
								(e) =>
									!!DiscordModules.GuildMemberStore.getMember(props.id, e.id)
							);
							return inc.length == 0
								? React.createElement(
									'p',
									{
										style: {
											color: 'white',
											fontWeight: 'bold',
											textAlign: 'center',
										},
									},
									'No Mutual Incoming Friends'
								)
								: inc.map((e) =>
									React.createElement(Item, {
										user: e,
										guild: props,
										onClose,
									})
								);
						},
					},
					{
						label: 'Outgoing Friends',
						id: 'OUTGOING_FRIENDS',
						element: (props, onClose) => {
							var outgoingFriends = [];
							Object.entries(
								DiscordModules.RelationshipStore.getRelationships()
							).forEach(([key, value]) => {
								if (value == 4)
									outgoingFriends.push(DiscordModules.UserStore.getUser(key));
							});
							const out = outgoingFriends.filter(
								(e) =>
									!!DiscordModules.GuildMemberStore.getMember(props.id, e.id)
							);
							return out.length == 0
								? React.createElement(
									'p',
									{
										style: {
											color: 'white',
											fontWeight: 'bold',
											textAlign: 'center',
										},
									},
									'No Mutual Outgoing Friends'
								)
								: out.map((e) =>
									React.createElement(Item, {
										user: e,
										guild: props,
										onClose,
									})
								);
						},
					},
					{
						label: 'Mutual Friends',
						id: 'MUTUAL_FRIENDS',
						element: (props, onClose) => {
							var friends = [];
							Object.entries(
								DiscordModules.RelationshipStore.getRelationships()
							).forEach(([key, value]) => {
								if (value == 1)
									friends.push(DiscordModules.UserStore.getUser(key));
							});
							const friend = friends.filter(
								(e) =>
									!!DiscordModules.GuildMemberStore.getMember(props.id, e.id)
							);
							return friend.length == 0
								? React.createElement(
									'p',
									{
										style: {
											color: 'white',
											fontWeight: 'bold',
											textAlign: 'center',
										},
									},
									'No Mutual Friends'
								)
								: friend.map((e) =>
									React.createElement(Item, {
										user: e,
										guild: props,
										onClose,
									})
								);
						},
					},
				];
				class Menu extends React.Component {
					constructor(props) {
						super(props);
						this.state = { selected: Tabs[0].id };
					}
					render() {
						return React.createElement(Modal, {
							className: [sizeMedium, 'modal'],
							children: [
								React.createElement(
									'div',
									{
										className: tabBarContainer,
									},
									React.createElement(TabComponent.Header, {
										className: [TabComponent.Types.TOP, tabBar].join(' '),
										children: Tabs.map((e) =>
											Object.assign({}, { id: e.id, label: e.label })
										).map((e) =>
											React.createElement(TabComponent.Item, {
												id: e.id,
												onClick: () => this.setTab(e.id),
												onItemSelect: () => this.setTab(e.id),
												children: e.label,
												className: tabBarItem,
												selectedItem: this.state.selected,
											})
										),
									})
								),
								React.createElement('div', {
									style: {
										marginTop: '10px',
									},
									children: React.createElement(ScrollWrapper, {
										style: {
											maxHeight: "333px",
										},
										children: Tabs.find(
											(e) => e.id == this.state.selected
										).element(this.props.guild, this.props.onClose),
									}),
								}),
							],
						});
					}
					setTab(e) {
						this.setState({ selected: e });
					}
				}
				return class ViewGuildRelationships extends Plugin {
					constructor() {
						super();
					}
					get css() {
						return `.modal {
							width: 630px;
						}`;
					}
					onStart() {
						PluginUtilities.addStyle(config.info.name, this.css);
						const GuildContextMenu = WebpackModules.getModule(
							(m) => m.default.displayName === 'GuildContextMenu'
						);
						if (GuildContextMenu)
							Patcher.after(
								GuildContextMenu,
								'default',
								(_, [props], ret) => {
									ret.props.children.unshift(
										React.createElement(
											MenuGroup,
											{},
											React.createElement(MenuItem, {
												id: 'view-guild-relationships',
												action: () => {
													DiscordModules.ModalStack.push(Menu, {
														guild: props.guild,
													});
												},
												label: 'View GuildRelationships',
											})
										)
									);
								}
							);
					}
					onStop() {
						PluginUtilities.removeStyle(config.info.name);
						Patcher.unpatchAll();
					}
				};
			};
			return plugin(Plugin, Api);
		})(global.ZeresPluginLibrary.buildPlugin(config));
})();
