/**
 * @name GuildAndFriendRemovalAlerts
 * @version 3.2.0
 * @description Displays alerts when you are kicked/banned from a server, a server is deleted, and when a friend removes you.
 * @author Metalloriff
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/GuildAndFriendRemovalAlerts
 * @updateUrl https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/GuildAndFriendRemovalAlerts/GuildAndFriendRemovalAlerts.plugin.js
 * @website https://metalloriff.github.io/toms-discord-stuff/#/
 * @donate https://paypal.me/israelboone
 * @invite yNqzuJa
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
/* Generated Code */
const config = {
	"info": {
		"name": "GuildAndFriendRemovalAlerts",
		"version": "3.2.0",
		"description": "Displays alerts when you are kicked/banned from a server, a server is deleted, and when a friend removes you.",
		"authors": [{
			"name": "Metalloriff",
			"discord_id": "264163473179672576",
			"github_username": "Metalloriff"
		}],
		"github": "https://github.com/Metalloriff/BetterDiscordPlugins/GuildAndFriendRemovalAlerts",
		"github_raw": "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/GuildAndFriendRemovalAlerts/GuildAndFriendRemovalAlerts.plugin.js",
		"website": "https://metalloriff.github.io/toms-discord-stuff/#/",
		"donate": "https://paypal.me/israelboone",
		"invite": "yNqzuJa"
	},
	"changelog": [{
		"title": "3.0 rewrite",
		"type": "fixed",
		"items": [
			"This plugin has been rewritten. Functionality is simliar, and settings and data should still be valid.",
			"If you experience any bugs, please contact me."
		]
	}],
	"build": {
		"zlibrary": true,
		"copy": true,
		"production": false,
		"scssHash": false,
		"alias": {
			"components": "components/index.js"
		},
		"release": {
			"source": true,
			"readme": true,
			"public": true,
			"contributors": null
		}
	}
};
function buildPlugin([BasePlugin, PluginApi]) {
	const module = {
		exports: {}
	};
	(() => {
		"use strict";
		class StyleLoader {
			static styles = "";
			static element = null;
			static append(module, css) {
				this.styles += `/* ${module} */\n${css}`;
			}
			static inject(name = config.info.name) {
				if (this.element) this.element.remove();
				this.element = document.head.appendChild(Object.assign(document.createElement("style"), {
					id: name,
					textContent: this.styles
				}));
			}
			static remove() {
				if (this.element) {
					this.element.remove();
					this.element = null;
				}
			}
		}
		function ___createMemoize___(instance, name, value) {
			value = value();
			Object.defineProperty(instance, name, {
				value,
				configurable: true
			});
			return value;
		};
		const Modules = {
			get 'react-spring'() {
				return ___createMemoize___(this, 'react-spring', () => BdApi.findModuleByProps('useSpring'))
			},
			'@discord/utils': {
				get 'joinClassNames'() {
					return ___createMemoize___(this, 'joinClassNames', () => BdApi.findModule(e => e.toString().indexOf('return e.join(" ")') > 200))
				},
				get 'useForceUpdate'() {
					return ___createMemoize___(this, 'useForceUpdate', () => BdApi.findModuleByProps('useForceUpdate')?.useForceUpdate)
				},
				get 'Logger'() {
					return ___createMemoize___(this, 'Logger', () => BdApi.findModuleByProps('setLogFn')?.default)
				},
				get 'Navigation'() {
					return ___createMemoize___(this, 'Navigation', () => BdApi.findModuleByProps('replaceWith', 'currentRouteIsPeekView'))
				}
			},
			'@discord/components': {
				get 'Tooltip'() {
					return ___createMemoize___(this, 'Tooltip', () => BdApi.findModuleByDisplayName('Tooltip'))
				},
				get 'TooltipContainer'() {
					return ___createMemoize___(this, 'TooltipContainer', () => BdApi.findModuleByProps('TooltipContainer')?.TooltipContainer)
				},
				get 'TextInput'() {
					return ___createMemoize___(this, 'TextInput', () => BdApi.findModuleByDisplayName('TextInput'))
				},
				get 'SlideIn'() {
					return ___createMemoize___(this, 'SlideIn', () => BdApi.findModuleByDisplayName('SlideIn'))
				},
				get 'SettingsNotice'() {
					return ___createMemoize___(this, 'SettingsNotice', () => BdApi.findModuleByDisplayName('SettingsNotice'))
				},
				get 'TransitionGroup'() {
					return ___createMemoize___(this, 'TransitionGroup', () => BdApi.findModuleByDisplayName('TransitionGroup'))
				},
				get 'Button'() {
					return ___createMemoize___(this, 'Button', () => BdApi.findModuleByProps('DropdownSizes'))
				},
				get 'Popout'() {
					return ___createMemoize___(this, 'Popout', () => BdApi.findModuleByDisplayName('Popout'))
				},
				get 'Flex'() {
					return ___createMemoize___(this, 'Flex', () => BdApi.findModuleByDisplayName('Flex'))
				},
				get 'Text'() {
					return ___createMemoize___(this, 'Text', () => BdApi.findModuleByDisplayName('Text'))
				},
				get 'Card'() {
					return ___createMemoize___(this, 'Card', () => BdApi.findModuleByDisplayName('Card'))
				}
			},
			'@discord/modules': {
				get 'Dispatcher'() {
					return ___createMemoize___(this, 'Dispatcher', () => BdApi.findModuleByProps('dirtyDispatch', 'subscribe'))
				},
				get 'ComponentDispatcher'() {
					return ___createMemoize___(this, 'ComponentDispatcher', () => BdApi.findModuleByProps('ComponentDispatch')?.ComponentDispatch)
				},
				get 'EmojiUtils'() {
					return ___createMemoize___(this, 'EmojiUtils', () => BdApi.findModuleByProps('uploadEmoji'))
				},
				get 'PermissionUtils'() {
					return ___createMemoize___(this, 'PermissionUtils', () => BdApi.findModuleByProps('computePermissions', 'canManageUser'))
				},
				get 'DMUtils'() {
					return ___createMemoize___(this, 'DMUtils', () => BdApi.findModuleByProps('openPrivateChannel'))
				}
			},
			'@discord/stores': {
				get 'Messages'() {
					return ___createMemoize___(this, 'Messages', () => BdApi.findModuleByProps('getMessage', 'getMessages'))
				},
				get 'Channels'() {
					return ___createMemoize___(this, 'Channels', () => BdApi.findModuleByProps('getChannel', 'getDMFromUserId'))
				},
				get 'Guilds'() {
					return ___createMemoize___(this, 'Guilds', () => BdApi.findModuleByProps('getGuild'))
				},
				get 'SelectedGuilds'() {
					return ___createMemoize___(this, 'SelectedGuilds', () => BdApi.findModuleByProps('getGuildId', 'getLastSelectedGuildId'))
				},
				get 'SelectedChannels'() {
					return ___createMemoize___(this, 'SelectedChannels', () => BdApi.findModuleByProps('getChannelId', 'getLastSelectedChannelId'))
				},
				get 'Info'() {
					return ___createMemoize___(this, 'Info', () => BdApi.findModuleByProps('getSessionId'))
				},
				get 'Status'() {
					return ___createMemoize___(this, 'Status', () => BdApi.findModuleByProps('getStatus', 'getActivities', 'getState'))
				},
				get 'Users'() {
					return ___createMemoize___(this, 'Users', () => BdApi.findModuleByProps('getUser', 'getCurrentUser'))
				},
				get 'SettingsStore'() {
					return ___createMemoize___(this, 'SettingsStore', () => BdApi.findModuleByProps('afkTimeout', 'status'))
				},
				get 'UserProfile'() {
					return ___createMemoize___(this, 'UserProfile', () => BdApi.findModuleByProps('getUserProfile'))
				},
				get 'Members'() {
					return ___createMemoize___(this, 'Members', () => BdApi.findModuleByProps('getMember'))
				},
				get 'Activities'() {
					return ___createMemoize___(this, 'Activities', () => BdApi.findModuleByProps('getActivities'))
				},
				get 'Games'() {
					return ___createMemoize___(this, 'Games', () => BdApi.findModuleByProps('getGame', 'games'))
				},
				get 'Auth'() {
					return ___createMemoize___(this, 'Auth', () => BdApi.findModuleByProps('getId', 'isGuest'))
				},
				get 'TypingUsers'() {
					return ___createMemoize___(this, 'TypingUsers', () => BdApi.findModuleByProps('isTyping'))
				}
			},
			'@discord/actions': {
				get 'ProfileActions'() {
					return ___createMemoize___(this, 'ProfileActions', () => BdApi.findModuleByProps('fetchProfile'))
				},
				get 'GuildActions'() {
					return ___createMemoize___(this, 'GuildActions', () => BdApi.findModuleByProps('requestMembersById'))
				}
			},
			get '@discord/i18n'() {
				return ___createMemoize___(this, '@discord/i18n', () => BdApi.findModule(m => m.Messages?.CLOSE && typeof(m.getLocale) === 'function'))
			},
			get '@discord/constants'() {
				return ___createMemoize___(this, '@discord/constants', () => BdApi.findModuleByProps('API_HOST'))
			},
			get '@discord/contextmenu'() {
				return ___createMemoize___(this, '@discord/contextmenu', () => {
					const ctx = Object.assign({}, BdApi.findModuleByProps('openContextMenu'), BdApi.findModuleByProps('MenuItem'));
					ctx.Menu = ctx.default;
					return ctx;
				})
			},
			get '@discord/forms'() {
				return ___createMemoize___(this, '@discord/forms', () => BdApi.findModuleByProps('FormItem'))
			},
			get '@discord/scrollbars'() {
				return ___createMemoize___(this, '@discord/scrollbars', () => BdApi.findModuleByProps('ScrollerAuto'))
			},
			get '@discord/native'() {
				return ___createMemoize___(this, '@discord/native', () => BdApi.findModuleByProps('requireModule'))
			},
			get '@discord/flux'() {
				return ___createMemoize___(this, '@discord/flux', () => Object.assign({}, BdApi.findModuleByProps('useStateFromStores').default, BdApi.findModuleByProps('useStateFromStores')))
			},
			get '@discord/modal'() {
				return ___createMemoize___(this, '@discord/modal', () => Object.assign({}, BdApi.findModuleByProps('ModalRoot'), BdApi.findModuleByProps('openModal', 'closeAllModals')))
			},
			get '@discord/connections'() {
				return ___createMemoize___(this, '@discord/connections', () => BdApi.findModuleByProps('get', 'isSupported', 'map'))
			},
			get '@discord/sanitize'() {
				return ___createMemoize___(this, '@discord/sanitize', () => BdApi.findModuleByProps('stringify', 'parse', 'encode'))
			},
			get '@discord/icons'() {
				return ___createMemoize___(this, '@discord/icons', () => BdApi.findAllModules(m => m.displayName && ~m.toString().indexOf('currentColor')).reduce((icons, icon) => (icons[icon.displayName] = icon, icons), {}))
			},
			'@discord/classes': {
				get 'Timestamp'() {
					return ___createMemoize___(this, 'Timestamp', () => BdApi.findModuleByPrototypes('toDate', 'month'))
				},
				get 'Message'() {
					return ___createMemoize___(this, 'Message', () => BdApi.findModuleByPrototypes('getReaction', 'isSystemDM'))
				},
				get 'User'() {
					return ___createMemoize___(this, 'User', () => BdApi.findModuleByPrototypes('tag'))
				},
				get 'Channel'() {
					return ___createMemoize___(this, 'Channel', () => BdApi.findModuleByPrototypes('isOwner', 'isCategory'))
				}
			}
		};
		var __webpack_modules__ = {
			86: (module, __webpack_exports__, __webpack_require__) => {
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(246);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
				var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()((function(i) {
					return i[1];
				}));
				___CSS_LOADER_EXPORT___.push([module.id, ".GuildAndFriendRemovalAlerts-item-item{display:flex;margin:5px;padding:10px;cursor:pointer;border-radius:5px}.GuildAndFriendRemovalAlerts-item-item:hover{background-color:var(--background-modifier-hover)}.GuildAndFriendRemovalAlerts-item-item .GuildAndFriendRemovalAlerts-item-image{width:60px;height:60px;border-radius:5px}.GuildAndFriendRemovalAlerts-item-item .GuildAndFriendRemovalAlerts-item-inner{display:flex;flex-direction:column;padding:5px;margin-left:10px}.GuildAndFriendRemovalAlerts-item-item .GuildAndFriendRemovalAlerts-item-inner .GuildAndFriendRemovalAlerts-item-title{margin:auto 0;max-width:400px;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;font-weight:bolder;font-size:1.1rem}.GuildAndFriendRemovalAlerts-item-item .GuildAndFriendRemovalAlerts-item-inner .GuildAndFriendRemovalAlerts-item-description{margin:auto 0}", ""]);
				___CSS_LOADER_EXPORT___.locals = {
					item: "GuildAndFriendRemovalAlerts-item-item",
					image: "GuildAndFriendRemovalAlerts-item-image",
					inner: "GuildAndFriendRemovalAlerts-item-inner",
					title: "GuildAndFriendRemovalAlerts-item-title",
					description: "GuildAndFriendRemovalAlerts-item-description"
				};
				StyleLoader.append(module.id, ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = Object.assign(___CSS_LOADER_EXPORT___, ___CSS_LOADER_EXPORT___.locals);
			},
			377: (module, __webpack_exports__, __webpack_require__) => {
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(246);
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__);
				var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0___default()((function(i) {
					return i[1];
				}));
				___CSS_LOADER_EXPORT___.push([module.id, ".GuildAndFriendRemovalAlerts-styles-modal{color:#fff}.GuildAndFriendRemovalAlerts-styles-modal .GuildAndFriendRemovalAlerts-styles-itemContainer .GuildAndFriendRemovalAlerts-styles-title{margin:20px;font-size:1.2rem;font-weight:bolder}.GuildAndFriendRemovalAlerts-styles-modal .GuildAndFriendRemovalAlerts-styles-nothingHere{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%);font-size:2rem;font-weight:bolder;opacity:.5}.GuildAndFriendRemovalAlerts-styles-modal .GuildAndFriendRemovalAlerts-styles-clearButton{margin-top:20px;background-color:rgba(237,66,69,.1);color:#f66;border-radius:5px;padding:15px 10px;text-align:center;cursor:pointer}.GuildAndFriendRemovalAlerts-styles-floatRight{margin-left:auto}", ""]);
				___CSS_LOADER_EXPORT___.locals = {
					modal: "GuildAndFriendRemovalAlerts-styles-modal",
					itemContainer: "GuildAndFriendRemovalAlerts-styles-itemContainer",
					title: "GuildAndFriendRemovalAlerts-styles-title",
					nothingHere: "GuildAndFriendRemovalAlerts-styles-nothingHere",
					clearButton: "GuildAndFriendRemovalAlerts-styles-clearButton",
					floatRight: "GuildAndFriendRemovalAlerts-styles-floatRight"
				};
				StyleLoader.append(module.id, ___CSS_LOADER_EXPORT___.toString());
				const __WEBPACK_DEFAULT_EXPORT__ = Object.assign(___CSS_LOADER_EXPORT___, ___CSS_LOADER_EXPORT___.locals);
			},
			234: (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
				__webpack_require__.r(__webpack_exports__);
				__webpack_require__.d(__webpack_exports__, {
					default: () => GuildAndFriendRemovalAlerts
				});
				const external_BasePlugin_namespaceObject = BasePlugin;
				var external_BasePlugin_default = __webpack_require__.n(external_BasePlugin_namespaceObject);
				const external_PluginApi_namespaceObject = PluginApi;
				var external_BdApi_React_ = __webpack_require__(832);
				var external_BdApi_React_default = __webpack_require__.n(external_BdApi_React_);
				var React = __webpack_require__(832);
				function _extends() {
					_extends = Object.assign || function(target) {
						for (var i = 1; i < arguments.length; i++) {
							var source = arguments[i];
							for (var key in source)
								if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
						}
						return target;
					};
					return _extends.apply(this, arguments);
				}
				const createUpdateWrapper = (Component, valueProp = "value", changeProp = "onChange", valueIndex = 0) => props => {
					const [value, setValue] = React.useState(props[valueProp]);
					return React.createElement(Component, _extends({}, props, {
						[valueProp]: value,
						[changeProp]: (...args) => {
							const value = args[valueIndex];
							if ("function" === typeof props[changeProp]) props[changeProp](value);
							setValue(value);
						}
					}));
				};
				const hooks_createUpdateWrapper = createUpdateWrapper;
				const package_namespaceObject = JSON.parse('{"um":{"u2":"GuildAndFriendRemovalAlerts"}}');
				function _defineProperty(obj, key, value) {
					if (key in obj) Object.defineProperty(obj, key, {
						value,
						enumerable: true,
						configurable: true,
						writable: true
					});
					else obj[key] = value;
					return obj;
				}
				class Settings {}
				_defineProperty(Settings, "settings", external_PluginApi_namespaceObject.PluginUtilities.loadSettings(package_namespaceObject.um.u2, {}));
				_defineProperty(Settings, "get", ((key, defaultValue) => Settings.settings[key] ?? defaultValue));
				_defineProperty(Settings, "set", ((key, value) => {
					Settings.settings[key] = value;
					Settings.save();
				}));
				_defineProperty(Settings, "save", (() => external_PluginApi_namespaceObject.PluginUtilities.saveSettings(package_namespaceObject.um.u2, Settings.settings)));
				const Switch = hooks_createUpdateWrapper(external_PluginApi_namespaceObject.WebpackModules.getByDisplayName("SwitchItem"));
				function SettingsPanel() {
					return external_BdApi_React_default().createElement("div", {
						className: "gafSettingsPanel"
					}, external_BdApi_React_default().createElement(Switch, {
						note: "Whether or not to automatically show the modal when a guild/friend is removed.",
						value: Settings.get("showModal", true),
						onChange: value => Settings.set("showModal", value)
					}, "Auto Show Modal"), external_BdApi_React_default().createElement(Switch, {
						note: "Whether or not to show desktop notifications when a guild/friend is removed.",
						value: Settings.get("showDeskNotifs", false),
						onChange: value => Settings.set("showDeskNotifs", value)
					}, "Show Desktop Notifications"));
				}
				const stores_namespaceObject = Modules["@discord/stores"];
				var stores_default = __webpack_require__.n(stores_namespaceObject);
				const modal_namespaceObject = Modules["@discord/modal"];
				const external_StyleLoader_namespaceObject = StyleLoader;
				var external_StyleLoader_default = __webpack_require__.n(external_StyleLoader_namespaceObject);
				var styles = __webpack_require__(377);
				var item = __webpack_require__(86);
				const utils_namespaceObject = Modules["@discord/utils"];
				const PrivateModule = external_PluginApi_namespaceObject.WebpackModules.getByProps("openPrivateChannel");
				function Item({
					title,
					description,
					icon,
					clickId,
					closeModal
				}) {
					return external_BdApi_React_default().createElement("div", {
						className: (0, utils_namespaceObject.joinClassNames)(item.Z.item, item.Z.userItem),
						onClick: () => {
							PrivateModule.openPrivateChannel(clickId);
							closeModal();
						}
					}, external_BdApi_React_default().createElement("img", {
						className: item.Z.image,
						src: icon || "/assets/485a854d5171c8dc98088041626e6fea.png",
						alt: "image"
					}), external_BdApi_React_default().createElement("div", {
						className: item.Z.inner
					}, external_BdApi_React_default().createElement("div", {
						className: item.Z.title
					}, title), description?.length ? external_BdApi_React_default().createElement("div", {
						className: item.Z.description
					}, description) : null));
				}
				const contextmenu_namespaceObject = Modules["@discord/contextmenu"];
				var contextmenu_default = __webpack_require__.n(contextmenu_namespaceObject);
				const constants_namespaceObject = Modules["@discord/constants"];
				const modules_namespaceObject = Modules["@discord/modules"];
				var GuildAndFriendRemovalAlerts_React = __webpack_require__(832);
				function GuildAndFriendRemovalAlerts_extends() {
					GuildAndFriendRemovalAlerts_extends = Object.assign || function(target) {
						for (var i = 1; i < arguments.length; i++) {
							var source = arguments[i];
							for (var key in source)
								if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
						}
						return target;
					};
					return GuildAndFriendRemovalAlerts_extends.apply(this, arguments);
				}
				function GuildAndFriendRemovalAlerts_defineProperty(obj, key, value) {
					if (key in obj) Object.defineProperty(obj, key, {
						value,
						enumerable: true,
						configurable: true,
						writable: true
					});
					else obj[key] = value;
					return obj;
				}
				const {
					getFriendIDs
				} = external_PluginApi_namespaceObject.WebpackModules.getByProps("getFriendIDs");
				const HomeButton = external_PluginApi_namespaceObject.WebpackModules.getByProps("HomeButton");
				const events = [constants_namespaceObject.ActionTypes.GUILD_CREATE, constants_namespaceObject.ActionTypes.GUILD_DELETE, constants_namespaceObject.ActionTypes.GUILD_UPDATE, constants_namespaceObject.ActionTypes.RELATIONSHIP_ADD, constants_namespaceObject.ActionTypes.RELATIONSHIP_REMOVE, constants_namespaceObject.ActionTypes.RELATIONSHIP_UPDATE, constants_namespaceObject.ActionTypes.FRIEND_REQUEST_ACCEPTED];
				class GuildAndFriendRemovalAlerts extends(external_BasePlugin_default()) {
					constructor(...args) {
						super(...args);
						GuildAndFriendRemovalAlerts_defineProperty(this, "history", {
							guilds: Settings.get("removedGuildHistory", []),
							friends: Settings.get("removedFriendHistory", []),
							update: () => {
								Settings.set("removedGuildHistory", this.history.guilds);
								Settings.set("removedFriendHistory", this.history.friends);
							},
							clear: () => {
								Object.assign(this.history, {
									guilds: [],
									friends: []
								});
								this.history.update();
							}
						});
						GuildAndFriendRemovalAlerts_defineProperty(this, "snapshots", {
							guilds: Settings.get("guildsSnapshot", []),
							friends: Settings.get("friendsSnapshot", []),
							update: ({
								guilds,
								friends
							}) => {
								Settings.set("guildsSnapshot", this.snapshots.guilds = guilds);
								Settings.set("friendsSnapshot", this.snapshots.friends = friends);
							}
						});
						GuildAndFriendRemovalAlerts_defineProperty(this, "getSettingsPanel", (() => GuildAndFriendRemovalAlerts_React.createElement(SettingsPanel, null)));
						GuildAndFriendRemovalAlerts_defineProperty(this, "main", (() => {
							console.log("main()");
							const guilds = Object.keys(stores_default().Guilds.getGuilds()).map((guildId => this.serializeGuild(guildId)));
							const friends = getFriendIDs().map((uid => this.serializeUser(uid)));
							const removedGuilds = this.snapshots.guilds.filter((snapshot => !guilds.some((guild => snapshot.id === guild.id))));
							const removedFriends = this.snapshots.friends.filter((snapshot => !friends.some((friend => snapshot.id === friend.id))));
							if (removedGuilds.length || removedFriends.length) {
								if (Settings.get("showModal", true)) this.openModal(removedGuilds, removedFriends);
								removedGuilds.forEach((guild => this.history.guilds.unshift(guild)));
								removedFriends.forEach((friend => this.history.friends.unshift(friend)));
								if (Settings.get("showDeskNotifs", false)) {
									removedGuilds.forEach((guild => new Notification(guild.name, {
										silent: true,
										body: "Server removed",
										icon: guild.iconUrl
									})));
									removedFriends.forEach((friend => new Notification(friend.name, {
										silent: true,
										body: "Friend removed",
										icon: friend.avatarUrl
									})));
								}
							}
							if (guilds.length !== this.snapshots.guilds.length || friends.length !== this.snapshots.friends.length) {
								this.history.update();
								this.snapshots.update({
									guilds,
									friends
								});
								console.log("update");
							}
						}));
					}
					onStart() {
						const PatchedHomeButton = ({
							originalType,
							...props
						}) => {
							const returnValue = Reflect.apply(originalType, this, [props]);
							try {
								returnValue.props.onContextMenu = e => {
									(0, contextmenu_namespaceObject.openContextMenu)(e, (() => GuildAndFriendRemovalAlerts_React.createElement(contextmenu_default().default, {
										navId: package_namespaceObject.um.u2,
										onClose: contextmenu_namespaceObject.closeContextMenu
									}, GuildAndFriendRemovalAlerts_React.createElement(contextmenu_namespaceObject.MenuItem, {
										label: "View GFR Logs",
										action: () => this.openModal(this.history.guilds, this.history.friends, true),
										id: package_namespaceObject.um.u2 + "-logs"
									}), GuildAndFriendRemovalAlerts_React.createElement(contextmenu_namespaceObject.MenuItem, {
										label: "View All Guilds and Friends",
										action: () => this.openModal(),
										id: package_namespaceObject.um.u2 + "-view-all"
									}))));
								};
							} catch (error) {
								external_PluginApi_namespaceObject.Logger.error("Error in DefaultHomeButton patch:", error);
							}
							return returnValue;
						};
						external_PluginApi_namespaceObject.Patcher.after(HomeButton, "HomeButton", ((_, __, component) => {
							const originalType = component.type;
							component.type = PatchedHomeButton;
							Object.assign(component.props, {
								originalType
							});
						}));
						external_StyleLoader_default().inject();
						events.forEach((eventType => modules_namespaceObject.Dispatcher.subscribe(eventType, this.main)));
					}
					serializeGuild(guildId) {
						const serialized = {
							id: guildId,
							invalid: true,
							name: "Unknown Guild",
							iconUrl: "/assets/1531b79c2f2927945582023e1edaaa11.png"
						};
						try {
							const guild = stores_default().Guilds.getGuild(guildId);
							if (guild) Object.assign(serialized, {
								invalid: false,
								name: guild.name,
								ownerId: guild.ownerId,
								iconUrl: "function" === typeof guild.getIconURL ? guild.getIconURL("webp") : serialized.iconUrl
							});
						} finally {}
						return serialized;
					}
					serializeUser(userId) {
						const serialized = {
							id: userId,
							invalid: true,
							tag: "Unknown User",
							avatarURL: "/assets/1cbd08c76f8af6dddce02c5138971129.png"
						};
						try {
							const user = stores_default().Users.getUser(userId);
							if (user) Object.assign(serialized, {
								invalid: false,
								tag: user.tag,
								avatarUrl: "function" === typeof user.getAvatarURL ? user.getAvatarURL("webp") : serialized.avatarUrl
							});
						} finally {}
						return serialized;
					}
					openModal(guilds, friends, showClearButton = false) {
						if (!guilds && !friends) {
							guilds = this.snapshots.guilds;
							friends = this.snapshots.friends;
						}
						const clearLogs = () => BdApi.showConfirmationModal("Are you sure?", "Do you really want to clear the logs?\nThis action cannot be undone.", {
							danger: true,
							onConfirm: () => {
								this.history.clear();
								(0, modal_namespaceObject.closeModal)(modalId);
							},
							confirmText: "Clear"
						});
						const modalId = (0, modal_namespaceObject.openModal)((props => GuildAndFriendRemovalAlerts_React.createElement(modal_namespaceObject.ModalRoot, GuildAndFriendRemovalAlerts_extends({}, props, {
							size: "large",
							className: styles.Z.modal
						}), GuildAndFriendRemovalAlerts_React.createElement(modal_namespaceObject.ModalHeader, null, "Guild And Friend Removal Alerts ", GuildAndFriendRemovalAlerts_React.createElement(modal_namespaceObject.ModalCloseButton, {
							className: styles.Z.floatRight,
							onClick: props.onClose
						})), GuildAndFriendRemovalAlerts_React.createElement(modal_namespaceObject.ModalContent, props, guilds?.length || friends?.length ? GuildAndFriendRemovalAlerts_React.createElement(GuildAndFriendRemovalAlerts_React.Fragment, null, showClearButton ? GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.clearButton,
							onClick: clearLogs
						}, "Clear Logs") : null, guilds?.length ? GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.itemContainer
						}, GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.title
						}, "Guilds - ", GuildAndFriendRemovalAlerts_React.createElement("span", {
							style: {
								color: "var(--control-brand-foreground-new)"
							}
						}, guilds.length)), GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.items
						}, guilds.map(((guild, i) => GuildAndFriendRemovalAlerts_React.createElement(Item, {
							key: i,
							title: guild.name,
							description: "Owner ID - " + guild.ownerId,
							icon: guild.iconUrl,
							clickId: guild.ownerId,
							closeModal: props.onClose
						}))))) : null, friends?.length ? GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.itemContainer
						}, GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.title
						}, "Friends - ", GuildAndFriendRemovalAlerts_React.createElement("span", {
							style: {
								color: "var(--control-brand-foreground-new)"
							}
						}, friends.length)), GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.items
						}, friends.map(((friend, i) => GuildAndFriendRemovalAlerts_React.createElement(Item, {
							key: i,
							title: friend.tag,
							icon: friend.avatarUrl,
							clickId: friend.id,
							closeModal: props.onClose
						}))))) : null) : GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.nothingHere
						}, "No logs to show.")))));
					}
					onStop() {
						external_PluginApi_namespaceObject.Patcher.unpatchAll();
						external_StyleLoader_default().remove();
						events.forEach((eventType => modules_namespaceObject.Dispatcher.unsubscribe(eventType, this.main)));
					}
				}
			},
			246: module => {
				module.exports = function(cssWithMappingToString) {
					var list = [];
					list.toString = function() {
						return this.map((function(item) {
							var content = cssWithMappingToString(item);
							if (item[2]) return "@media ".concat(item[2], " {").concat(content, "}");
							return content;
						})).join("");
					};
					list.i = function(modules, mediaQuery, dedupe) {
						if ("string" === typeof modules) modules = [
							[null, modules, ""]
						];
						var alreadyImportedModules = {};
						if (dedupe)
							for (var i = 0; i < this.length; i++) {
								var id = this[i][0];
								if (null != id) alreadyImportedModules[id] = true;
							}
						for (var _i = 0; _i < modules.length; _i++) {
							var item = [].concat(modules[_i]);
							if (dedupe && alreadyImportedModules[item[0]]) continue;
							if (mediaQuery)
								if (!item[2]) item[2] = mediaQuery;
								else item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
							list.push(item);
						}
					};
					return list;
				};
			},
			832: module => {
				module.exports = BdApi.React;
			}
		};
		var __webpack_module_cache__ = {};
		function __webpack_require__(moduleId) {
			var cachedModule = __webpack_module_cache__[moduleId];
			if (void 0 !== cachedModule) return cachedModule.exports;
			var module = __webpack_module_cache__[moduleId] = {
				id: moduleId,
				exports: {}
			};
			__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
			return module.exports;
		}
		(() => {
			__webpack_require__.n = module => {
				var getter = module && module.__esModule ? () => module["default"] : () => module;
				__webpack_require__.d(getter, {
					a: getter
				});
				return getter;
			};
		})();
		(() => {
			__webpack_require__.d = (exports, definition) => {
				for (var key in definition)
					if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) Object.defineProperty(exports, key, {
						enumerable: true,
						get: definition[key]
					});
			};
		})();
		(() => {
			__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
		})();
		(() => {
			__webpack_require__.r = exports => {
				if ("undefined" !== typeof Symbol && Symbol.toStringTag) Object.defineProperty(exports, Symbol.toStringTag, {
					value: "Module"
				});
				Object.defineProperty(exports, "__esModule", {
					value: true
				});
			};
		})();
		var __webpack_exports__ = __webpack_require__(234);
		module.exports.LibraryPluginHack = __webpack_exports__;
	})();
	const PluginExports = module.exports.LibraryPluginHack;
	return PluginExports?.__esModule ? PluginExports.default : PluginExports;
}
module.exports = window.hasOwnProperty("ZeresPluginLibrary") ?
	buildPlugin(window.ZeresPluginLibrary.buildPlugin(config)) :
	class {
		getName() {
			return config.info.name;
		}
		getAuthor() {
			return config.info.authors.map(a => a.name).join(", ");
		}
		getDescription() {
			return `${config.info.description}. __**ZeresPluginLibrary was not found! This plugin will not work!**__`;
		}
		getVersion() {
			return config.info.version;
		}
		load() {
			BdApi.showConfirmationModal(
				"Library plugin is needed",
				[`The library plugin needed for ${config.info.name} is missing. Please click Download to install it.`], {
					confirmText: "Download",
					cancelText: "Cancel",
					onConfirm: () => {
						require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
							if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
							await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
						});
					}
				}
			);
		}
		start() {}
		stop() {}
	};
/*@end@*/
