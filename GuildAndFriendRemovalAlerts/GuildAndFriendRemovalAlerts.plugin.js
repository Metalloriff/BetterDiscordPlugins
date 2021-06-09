/**
 * @name GuildAndFriendRemovalAlerts
 * @version 3.0.0
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
		"version": "3.0.0",
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
		let __plugin_styles__ = "";
		let __style_element__ = null;
		var __webpack_modules__ = {
			714: (module, __webpack_exports__, __webpack_require__) => {
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(645);
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
				__plugin_styles__ += `\n/* ${module.id} */\n${___CSS_LOADER_EXPORT___}\n`;
				const __WEBPACK_DEFAULT_EXPORT__ = Object.assign(___CSS_LOADER_EXPORT___, ___CSS_LOADER_EXPORT___.locals);
			},
			631: (module, __webpack_exports__, __webpack_require__) => {
				__webpack_require__.d(__webpack_exports__, {
					Z: () => __WEBPACK_DEFAULT_EXPORT__
				});
				var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(645);
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
				__plugin_styles__ += `\n/* ${module.id} */\n${___CSS_LOADER_EXPORT___}\n`;
				const __WEBPACK_DEFAULT_EXPORT__ = Object.assign(___CSS_LOADER_EXPORT___, ___CSS_LOADER_EXPORT___.locals);
			},
			645: module => {
				module.exports = function(cssWithMappingToString) {
					var list = [];
					list.toString = function toString() {
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
			698: module => {
				module.exports = window["BdApi"]["React"];
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
		var __webpack_exports__ = {};
		(() => {
			__webpack_require__.r(__webpack_exports__);
			__webpack_require__.d(__webpack_exports__, {
				default: () => GuildAndFriendRemovalAlerts
			});
			const external_BasePlugin_namespaceObject = BasePlugin;
			var external_BasePlugin_default = __webpack_require__.n(external_BasePlugin_namespaceObject);
			const external_PluginApi_namespaceObject = PluginApi;
			var external_BdApi_React_ = __webpack_require__(698);
			var external_BdApi_React_default = __webpack_require__.n(external_BdApi_React_);
			var React = __webpack_require__(698);
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
			const createUpdateWrapper = (Component, valueProp = "value", changeProp = "onChange") => props => {
				const [value, setValue] = React.useState(props[valueProp]);
				return React.createElement(Component, _extends({}, props, {
					[valueProp]: value,
					[changeProp]: value => {
						if ("function" === typeof props[changeProp]) props[changeProp](value);
						setValue(value);
					}
				}));
			};
			const hooks_createUpdateWrapper = createUpdateWrapper;
			const GuildAndFriendRemovalAlerts_package = {
				info: {
					name: "GuildAndFriendRemovalAlerts",
					version: "3.0.0",
					description: "Displays alerts when you are kicked/banned from a server, a server is deleted, and when a friend removes you.",
					authors: [{
						name: "Metalloriff",
						discord_id: "264163473179672576",
						github_username: "Metalloriff"
					}],
					github: "https://github.com/Metalloriff/BetterDiscordPlugins/GuildAndFriendRemovalAlerts",
					github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/GuildAndFriendRemovalAlerts/GuildAndFriendRemovalAlerts.plugin.js",
					website: "https://metalloriff.github.io/toms-discord-stuff/#/",
					donate: "https://paypal.me/israelboone",
					invite: "yNqzuJa"
				},
				changelog: [{
					title: "3.0 rewrite",
					type: "fixed",
					items: ["This plugin has been rewritten. Functionality is simliar, and settings and data should still be valid.", "If you experience any bugs, please contact me."]
				}],
				build: {
					zlibrary: true,
					copy: true,
					production: false,
					scssHash: false,
					alias: {
						components: "components/index.js"
					},
					release: {
						source: true,
						readme: true,
						public: true,
						contributors: null
					}
				}
			};
			var info = {
				name: "GuildAndFriendRemovalAlerts",
				version: "3.0.0",
				description: "Displays alerts when you are kicked/banned from a server, a server is deleted, and when a friend removes you.",
				authors: [{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "Metalloriff"
				}],
				github: "https://github.com/Metalloriff/BetterDiscordPlugins/GuildAndFriendRemovalAlerts",
				github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/GuildAndFriendRemovalAlerts/GuildAndFriendRemovalAlerts.plugin.js",
				website: "https://metalloriff.github.io/toms-discord-stuff/#/",
				donate: "https://paypal.me/israelboone",
				invite: "yNqzuJa"
			};
			var changelog = [{
				title: "3.0 rewrite",
				type: "fixed",
				items: ["This plugin has been rewritten. Functionality is simliar, and settings and data should still be valid.", "If you experience any bugs, please contact me."]
			}];
			var build = {
				zlibrary: true,
				copy: true,
				production: false,
				scssHash: false,
				alias: {
					components: "components/index.js"
				},
				release: {
					source: true,
					readme: true,
					public: true,
					contributors: null
				}
			};
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
			_defineProperty(Settings, "settings", external_PluginApi_namespaceObject.PluginUtilities.loadSettings(GuildAndFriendRemovalAlerts_package.info.name, {}));
			_defineProperty(Settings, "get", ((key, defaultValue) => Settings.settings[key] ?? defaultValue));
			_defineProperty(Settings, "set", ((key, value) => {
				Settings.settings[key] = value;
				Settings.save();
			}));
			_defineProperty(Settings, "save", (() => external_PluginApi_namespaceObject.PluginUtilities.saveSettings(GuildAndFriendRemovalAlerts_package.info.name, Settings.settings)));
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
			const external_get_Messages_n_const_value_BdApi_findModuleByProps_getMessage_getMessages_n_Object_defineProperty_this_Messages_n_value_n_configurable_true_n_n_return_value_n_nget_Channels_n_const_value_BdApi_findModuleByProps_getChannel_n_Object_defineProperty_this_Channels_n_value_n_configurable_true_n_n_return_value_n_nget_Guilds_n_const_value_BdApi_findModuleByProps_getGuild_n_Object_defineProperty_this_Guilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedGuilds_n_const_value_BdApi_findModuleByProps_getGuildId_getLastSelectedGuildId_n_Object_defineProperty_this_SelectedGuilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedChannels_n_const_value_BdApi_findModuleByProps_getChannelId_getLastSelectedChannelId_n_Object_defineProperty_this_SelectedChannels_n_value_n_configurable_true_n_n_return_value_n_nget_Info_n_const_value_BdApi_findModuleByProps_getCurrentUser_n_Object_defineProperty_this_Info_n_value_n_configurable_true_n_n_return_value_n_nget_Status_n_const_value_BdApi_findModuleByProps_getStatus_n_Object_defineProperty_this_Status_n_value_n_configurable_true_n_n_return_value_n_nget_Users_n_const_value_BdApi_findModuleByProps_getUser_n_Object_defineProperty_this_Users_n_value_n_configurable_true_n_n_return_value_n_nget_Settings_n_const_value_BdApi_findModuleByProps_afkTimeout_status_n_Object_defineProperty_this_Settings_n_value_n_configurable_true_n_n_return_value_n_nget_UserProfile_n_const_value_BdApi_findModuleByProps_getUserProfile_n_Object_defineProperty_this_UserProfile_n_value_n_configurable_true_n_n_return_value_n_nget_Members_n_const_value_BdApi_findModuleByProps_getMember_n_Object_defineProperty_this_Members_n_value_n_configurable_true_n_n_return_value_n_nget_Activities_n_const_value_BdApi_findModuleByProps_getActivities_n_Object_defineProperty_this_Activities_n_value_n_configurable_true_n_n_return_value_n_nget_Games_n_const_value_BdApi_findModuleByProps_getGame_n_Object_defineProperty_this_Games_n_value_n_configurable_true_n_n_return_value_n_nget_Auth_n_const_value_BdApi_findModuleByProps_getId_isGuest_n_Object_defineProperty_this_Auth_n_value_n_configurable_true_n_n_return_value_n_nget_TypingUsers_n_const_value_BdApi_findModuleByProps_isTyping_n_Object_defineProperty_this_TypingUsers_n_value_n_configurable_true_n_n_return_value_n_namespaceObject = {
				get Messages() {
					const value = BdApi.findModuleByProps("getMessage", "getMessages");
					Object.defineProperty(this, "Messages", {
						value,
						configurable: true
					});
					return value;
				},
				get Channels() {
					const value = BdApi.findModuleByProps("getChannel");
					Object.defineProperty(this, "Channels", {
						value,
						configurable: true
					});
					return value;
				},
				get Guilds() {
					const value = BdApi.findModuleByProps("getGuild");
					Object.defineProperty(this, "Guilds", {
						value,
						configurable: true
					});
					return value;
				},
				get SelectedGuilds() {
					const value = BdApi.findModuleByProps("getGuildId", "getLastSelectedGuildId");
					Object.defineProperty(this, "SelectedGuilds", {
						value,
						configurable: true
					});
					return value;
				},
				get SelectedChannels() {
					const value = BdApi.findModuleByProps("getChannelId", "getLastSelectedChannelId");
					Object.defineProperty(this, "SelectedChannels", {
						value,
						configurable: true
					});
					return value;
				},
				get Info() {
					const value = BdApi.findModuleByProps("getCurrentUser");
					Object.defineProperty(this, "Info", {
						value,
						configurable: true
					});
					return value;
				},
				get Status() {
					const value = BdApi.findModuleByProps("getStatus");
					Object.defineProperty(this, "Status", {
						value,
						configurable: true
					});
					return value;
				},
				get Users() {
					const value = BdApi.findModuleByProps("getUser");
					Object.defineProperty(this, "Users", {
						value,
						configurable: true
					});
					return value;
				},
				get Settings() {
					const value = BdApi.findModuleByProps("afkTimeout", "status");
					Object.defineProperty(this, "Settings", {
						value,
						configurable: true
					});
					return value;
				},
				get UserProfile() {
					const value = BdApi.findModuleByProps("getUserProfile");
					Object.defineProperty(this, "UserProfile", {
						value,
						configurable: true
					});
					return value;
				},
				get Members() {
					const value = BdApi.findModuleByProps("getMember");
					Object.defineProperty(this, "Members", {
						value,
						configurable: true
					});
					return value;
				},
				get Activities() {
					const value = BdApi.findModuleByProps("getActivities");
					Object.defineProperty(this, "Activities", {
						value,
						configurable: true
					});
					return value;
				},
				get Games() {
					const value = BdApi.findModuleByProps("getGame");
					Object.defineProperty(this, "Games", {
						value,
						configurable: true
					});
					return value;
				},
				get Auth() {
					const value = BdApi.findModuleByProps("getId", "isGuest");
					Object.defineProperty(this, "Auth", {
						value,
						configurable: true
					});
					return value;
				},
				get TypingUsers() {
					const value = BdApi.findModuleByProps("isTyping");
					Object.defineProperty(this, "TypingUsers", {
						value,
						configurable: true
					});
					return value;
				}
			};
			var external_get_Messages_n_const_value_BdApi_findModuleByProps_getMessage_getMessages_n_Object_defineProperty_this_Messages_n_value_n_configurable_true_n_n_return_value_n_nget_Channels_n_const_value_BdApi_findModuleByProps_getChannel_n_Object_defineProperty_this_Channels_n_value_n_configurable_true_n_n_return_value_n_nget_Guilds_n_const_value_BdApi_findModuleByProps_getGuild_n_Object_defineProperty_this_Guilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedGuilds_n_const_value_BdApi_findModuleByProps_getGuildId_getLastSelectedGuildId_n_Object_defineProperty_this_SelectedGuilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedChannels_n_const_value_BdApi_findModuleByProps_getChannelId_getLastSelectedChannelId_n_Object_defineProperty_this_SelectedChannels_n_value_n_configurable_true_n_n_return_value_n_nget_Info_n_const_value_BdApi_findModuleByProps_getCurrentUser_n_Object_defineProperty_this_Info_n_value_n_configurable_true_n_n_return_value_n_nget_Status_n_const_value_BdApi_findModuleByProps_getStatus_n_Object_defineProperty_this_Status_n_value_n_configurable_true_n_n_return_value_n_nget_Users_n_const_value_BdApi_findModuleByProps_getUser_n_Object_defineProperty_this_Users_n_value_n_configurable_true_n_n_return_value_n_nget_Settings_n_const_value_BdApi_findModuleByProps_afkTimeout_status_n_Object_defineProperty_this_Settings_n_value_n_configurable_true_n_n_return_value_n_nget_UserProfile_n_const_value_BdApi_findModuleByProps_getUserProfile_n_Object_defineProperty_this_UserProfile_n_value_n_configurable_true_n_n_return_value_n_nget_Members_n_const_value_BdApi_findModuleByProps_getMember_n_Object_defineProperty_this_Members_n_value_n_configurable_true_n_n_return_value_n_nget_Activities_n_const_value_BdApi_findModuleByProps_getActivities_n_Object_defineProperty_this_Activities_n_value_n_configurable_true_n_n_return_value_n_nget_Games_n_const_value_BdApi_findModuleByProps_getGame_n_Object_defineProperty_this_Games_n_value_n_configurable_true_n_n_return_value_n_nget_Auth_n_const_value_BdApi_findModuleByProps_getId_isGuest_n_Object_defineProperty_this_Auth_n_value_n_configurable_true_n_n_return_value_n_nget_TypingUsers_n_const_value_BdApi_findModuleByProps_isTyping_n_Object_defineProperty_this_TypingUsers_n_value_n_configurable_true_n_n_return_value_n_default = __webpack_require__.n(external_get_Messages_n_const_value_BdApi_findModuleByProps_getMessage_getMessages_n_Object_defineProperty_this_Messages_n_value_n_configurable_true_n_n_return_value_n_nget_Channels_n_const_value_BdApi_findModuleByProps_getChannel_n_Object_defineProperty_this_Channels_n_value_n_configurable_true_n_n_return_value_n_nget_Guilds_n_const_value_BdApi_findModuleByProps_getGuild_n_Object_defineProperty_this_Guilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedGuilds_n_const_value_BdApi_findModuleByProps_getGuildId_getLastSelectedGuildId_n_Object_defineProperty_this_SelectedGuilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedChannels_n_const_value_BdApi_findModuleByProps_getChannelId_getLastSelectedChannelId_n_Object_defineProperty_this_SelectedChannels_n_value_n_configurable_true_n_n_return_value_n_nget_Info_n_const_value_BdApi_findModuleByProps_getCurrentUser_n_Object_defineProperty_this_Info_n_value_n_configurable_true_n_n_return_value_n_nget_Status_n_const_value_BdApi_findModuleByProps_getStatus_n_Object_defineProperty_this_Status_n_value_n_configurable_true_n_n_return_value_n_nget_Users_n_const_value_BdApi_findModuleByProps_getUser_n_Object_defineProperty_this_Users_n_value_n_configurable_true_n_n_return_value_n_nget_Settings_n_const_value_BdApi_findModuleByProps_afkTimeout_status_n_Object_defineProperty_this_Settings_n_value_n_configurable_true_n_n_return_value_n_nget_UserProfile_n_const_value_BdApi_findModuleByProps_getUserProfile_n_Object_defineProperty_this_UserProfile_n_value_n_configurable_true_n_n_return_value_n_nget_Members_n_const_value_BdApi_findModuleByProps_getMember_n_Object_defineProperty_this_Members_n_value_n_configurable_true_n_n_return_value_n_nget_Activities_n_const_value_BdApi_findModuleByProps_getActivities_n_Object_defineProperty_this_Activities_n_value_n_configurable_true_n_n_return_value_n_nget_Games_n_const_value_BdApi_findModuleByProps_getGame_n_Object_defineProperty_this_Games_n_value_n_configurable_true_n_n_return_value_n_nget_Auth_n_const_value_BdApi_findModuleByProps_getId_isGuest_n_Object_defineProperty_this_Auth_n_value_n_configurable_true_n_n_return_value_n_nget_TypingUsers_n_const_value_BdApi_findModuleByProps_isTyping_n_Object_defineProperty_this_TypingUsers_n_value_n_configurable_true_n_n_return_value_n_namespaceObject);
			const external_Object_assign_BdApi_findModuleByProps_ModalRoot_BdApi_findModuleByProps_openModal_namespaceObject = Object.assign({}, BdApi.findModuleByProps("ModalRoot"), BdApi.findModuleByProps("openModal"));
			const external_n_inject_name_config_info_name_n_if_style_element_style_element_remove_n_style_element_document_head_appendChild_Object_assign_document_createElement_style_id_name_textContent_plugin_styles_n_n_remove_n_if_style_element_n_style_element_remove_n_style_element_null_n_n_n_namespaceObject = {
				inject: (name = config.info.name) => {
					if (__style_element__) __style_element__.remove();
					__style_element__ = document.head.appendChild(Object.assign(document.createElement("style"), {
						id: name,
						textContent: __plugin_styles__
					}));
				},
				remove: () => {
					if (__style_element__) {
						__style_element__.remove();
						__style_element__ = null;
					}
				}
			};
			var external_n_inject_name_config_info_name_n_if_style_element_style_element_remove_n_style_element_document_head_appendChild_Object_assign_document_createElement_style_id_name_textContent_plugin_styles_n_n_remove_n_if_style_element_n_style_element_remove_n_style_element_null_n_n_n_default = __webpack_require__.n(external_n_inject_name_config_info_name_n_if_style_element_style_element_remove_n_style_element_document_head_appendChild_Object_assign_document_createElement_style_id_name_textContent_plugin_styles_n_n_remove_n_if_style_element_n_style_element_remove_n_style_element_null_n_n_n_namespaceObject);
			var styles = __webpack_require__(631);
			var item = __webpack_require__(714);
			const external_get_joinClassNames_n_const_value_BdApi_findModule_m_typeof_m_default_default_function_default_n_Object_defineProperty_this_joinClassNames_n_value_n_configurable_true_n_n_return_value_n_nget_useForceUpdate_n_const_value_BdApi_findModuleByProps_useForceUpdate_useForceUpdate_n_Object_defineProperty_this_useForceUpdate_n_value_n_configurable_true_n_n_return_value_n_nget_Logger_n_const_value_BdApi_findModuleByProps_setLogFn_default_n_Object_defineProperty_this_Logger_n_value_n_configurable_true_n_n_return_value_n_nget_Navigation_n_const_value_BdApi_findModuleByProps_replaceWith_n_Object_defineProperty_this_Navigation_n_value_n_configurable_true_n_n_return_value_n_namespaceObject = {
				get joinClassNames() {
					const value = BdApi.findModule((m => "function" === typeof m?.default?.default))?.default;
					Object.defineProperty(this, "joinClassNames", {
						value,
						configurable: true
					});
					return value;
				},
				get useForceUpdate() {
					const value = BdApi.findModuleByProps("useForceUpdate")?.useForceUpdate;
					Object.defineProperty(this, "useForceUpdate", {
						value,
						configurable: true
					});
					return value;
				},
				get Logger() {
					const value = BdApi.findModuleByProps("setLogFn")?.default;
					Object.defineProperty(this, "Logger", {
						value,
						configurable: true
					});
					return value;
				},
				get Navigation() {
					const value = BdApi.findModuleByProps("replaceWith");
					Object.defineProperty(this, "Navigation", {
						value,
						configurable: true
					});
					return value;
				}
			};
			const PrivateModule = external_PluginApi_namespaceObject.WebpackModules.getByProps("openPrivateChannel");
			function Item({
				title,
				description,
				icon,
				clickId,
				closeModal
			}) {
				return external_BdApi_React_default().createElement("div", {
					className: (0, external_get_joinClassNames_n_const_value_BdApi_findModule_m_typeof_m_default_default_function_default_n_Object_defineProperty_this_joinClassNames_n_value_n_configurable_true_n_n_return_value_n_nget_useForceUpdate_n_const_value_BdApi_findModuleByProps_useForceUpdate_useForceUpdate_n_Object_defineProperty_this_useForceUpdate_n_value_n_configurable_true_n_n_return_value_n_nget_Logger_n_const_value_BdApi_findModuleByProps_setLogFn_default_n_Object_defineProperty_this_Logger_n_value_n_configurable_true_n_n_return_value_n_nget_Navigation_n_const_value_BdApi_findModuleByProps_replaceWith_n_Object_defineProperty_this_Navigation_n_value_n_configurable_true_n_n_return_value_n_namespaceObject.joinClassNames)(item.Z.item, item.Z.userItem),
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
				}, title), null !== description && void 0 !== description && description.length ? external_BdApi_React_default().createElement("div", {
					className: item.Z.description
				}, description) : null));
			}
			const external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_namespaceObject = Object.assign({}, BdApi.findModuleByProps("openContextMenu"), BdApi.findModuleByProps("MenuItem"));
			var external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_default = __webpack_require__.n(external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_namespaceObject);
			const external_BdApi_findModuleByProps_API_HOST_namespaceObject = BdApi.findModuleByProps("API_HOST");
			const external_get_Dispatcher_n_const_value_BdApi_findModuleByProps_dirtyDispatch_subscribe_n_Object_defineProperty_this_Dispatcher_n_value_n_configurable_true_n_n_return_value_n_nget_EmojiUtils_n_const_value_BdApi_findModuleByProps_uploadEmoji_n_Object_defineProperty_this_EmojiUtils_n_value_n_configurable_true_n_n_return_value_n_nget_PermissionUtils_n_const_value_BdApi_findModuleByProps_computePermissions_n_Object_defineProperty_this_PermissionUtils_n_value_n_configurable_true_n_n_return_value_n_namespaceObject = {
				get Dispatcher() {
					const value = BdApi.findModuleByProps("dirtyDispatch", "subscribe");
					Object.defineProperty(this, "Dispatcher", {
						value,
						configurable: true
					});
					return value;
				},
				get EmojiUtils() {
					const value = BdApi.findModuleByProps("uploadEmoji");
					Object.defineProperty(this, "EmojiUtils", {
						value,
						configurable: true
					});
					return value;
				},
				get PermissionUtils() {
					const value = BdApi.findModuleByProps("computePermissions");
					Object.defineProperty(this, "PermissionUtils", {
						value,
						configurable: true
					});
					return value;
				}
			};
			function createStore(state) {
				const listeners = new Set;
				const api = {
					getState() {
						return state;
					},
					setState(partial) {
						const partialState = "function" === typeof partial ? partial(state) : partial;
						state = Object.assign({}, state, partialState);
						listeners.forEach((listener => {
							listener(state);
						}));
					},
					get listeners() {
						return listeners;
					},
					on(listener) {
						if (listeners.has(listener)) return;
						listeners.add(listener);
						return () => listeners.delete(listener);
					},
					off(listener) {
						return listeners.delete(listener);
					}
				};
				return [function(collector = (_ => _)) {
					const forceUpdate = useReducer((e => e + 1), 0)[1];
					useEffect((() => {
						const handler = () => forceUpdate();
						listeners.add(handler);
						return () => listeners.delete(handler);
					}), []);
					return collector(api.getState());
				}, api];
			}
			var GuildAndFriendRemovalAlerts_React = __webpack_require__(698);
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
			const HomeButton = external_PluginApi_namespaceObject.WebpackModules.getByProps("DefaultHomeButton");
			const events = [external_BdApi_findModuleByProps_API_HOST_namespaceObject.ActionTypes.GUILD_CREATE, external_BdApi_findModuleByProps_API_HOST_namespaceObject.ActionTypes.GUILD_DELETE, external_BdApi_findModuleByProps_API_HOST_namespaceObject.ActionTypes.GUILD_UPDATE, external_BdApi_findModuleByProps_API_HOST_namespaceObject.ActionTypes.RELATIONSHIP_ADD, external_BdApi_findModuleByProps_API_HOST_namespaceObject.ActionTypes.RELATIONSHIP_REMOVE, external_BdApi_findModuleByProps_API_HOST_namespaceObject.ActionTypes.RELATIONSHIP_UPDATE, external_BdApi_findModuleByProps_API_HOST_namespaceObject.ActionTypes.FRIEND_REQUEST_ACCEPTED];
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
						const guilds = Object.keys(external_get_Messages_n_const_value_BdApi_findModuleByProps_getMessage_getMessages_n_Object_defineProperty_this_Messages_n_value_n_configurable_true_n_n_return_value_n_nget_Channels_n_const_value_BdApi_findModuleByProps_getChannel_n_Object_defineProperty_this_Channels_n_value_n_configurable_true_n_n_return_value_n_nget_Guilds_n_const_value_BdApi_findModuleByProps_getGuild_n_Object_defineProperty_this_Guilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedGuilds_n_const_value_BdApi_findModuleByProps_getGuildId_getLastSelectedGuildId_n_Object_defineProperty_this_SelectedGuilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedChannels_n_const_value_BdApi_findModuleByProps_getChannelId_getLastSelectedChannelId_n_Object_defineProperty_this_SelectedChannels_n_value_n_configurable_true_n_n_return_value_n_nget_Info_n_const_value_BdApi_findModuleByProps_getCurrentUser_n_Object_defineProperty_this_Info_n_value_n_configurable_true_n_n_return_value_n_nget_Status_n_const_value_BdApi_findModuleByProps_getStatus_n_Object_defineProperty_this_Status_n_value_n_configurable_true_n_n_return_value_n_nget_Users_n_const_value_BdApi_findModuleByProps_getUser_n_Object_defineProperty_this_Users_n_value_n_configurable_true_n_n_return_value_n_nget_Settings_n_const_value_BdApi_findModuleByProps_afkTimeout_status_n_Object_defineProperty_this_Settings_n_value_n_configurable_true_n_n_return_value_n_nget_UserProfile_n_const_value_BdApi_findModuleByProps_getUserProfile_n_Object_defineProperty_this_UserProfile_n_value_n_configurable_true_n_n_return_value_n_nget_Members_n_const_value_BdApi_findModuleByProps_getMember_n_Object_defineProperty_this_Members_n_value_n_configurable_true_n_n_return_value_n_nget_Activities_n_const_value_BdApi_findModuleByProps_getActivities_n_Object_defineProperty_this_Activities_n_value_n_configurable_true_n_n_return_value_n_nget_Games_n_const_value_BdApi_findModuleByProps_getGame_n_Object_defineProperty_this_Games_n_value_n_configurable_true_n_n_return_value_n_nget_Auth_n_const_value_BdApi_findModuleByProps_getId_isGuest_n_Object_defineProperty_this_Auth_n_value_n_configurable_true_n_n_return_value_n_nget_TypingUsers_n_const_value_BdApi_findModuleByProps_isTyping_n_Object_defineProperty_this_TypingUsers_n_value_n_configurable_true_n_n_return_value_n_default().Guilds.getGuilds()).map((guildId => this.serializeGuild(guildId)));
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
					external_PluginApi_namespaceObject.Patcher.after(HomeButton, "DefaultHomeButton", ((_, [props], component) => {
						component.props.onContextMenu = e => {
							(0, external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_namespaceObject.openContextMenu)(e, (() => GuildAndFriendRemovalAlerts_React.createElement(external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_default().default, {
								navId: GuildAndFriendRemovalAlerts_package.info.name,
								onClose: external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_namespaceObject.closeContextMenu
							}, GuildAndFriendRemovalAlerts_React.createElement(external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_namespaceObject.MenuItem, {
								label: "View GFR Logs",
								action: () => this.openModal(this.history.guilds, this.history.friends, true),
								id: GuildAndFriendRemovalAlerts_package.info.name + "-logs"
							}), GuildAndFriendRemovalAlerts_React.createElement(external_Object_assign_BdApi_findModuleByProps_openContextMenu_BdApi_findModuleByProps_MenuItem_namespaceObject.MenuItem, {
								label: "View All Guilds and Friends",
								action: () => this.openModal(),
								id: GuildAndFriendRemovalAlerts_package.info.name + "-view-all"
							}))));
						};
					}));
					external_n_inject_name_config_info_name_n_if_style_element_style_element_remove_n_style_element_document_head_appendChild_Object_assign_document_createElement_style_id_name_textContent_plugin_styles_n_n_remove_n_if_style_element_n_style_element_remove_n_style_element_null_n_n_n_default().inject();
					events.forEach((eventType => external_get_Dispatcher_n_const_value_BdApi_findModuleByProps_dirtyDispatch_subscribe_n_Object_defineProperty_this_Dispatcher_n_value_n_configurable_true_n_n_return_value_n_nget_EmojiUtils_n_const_value_BdApi_findModuleByProps_uploadEmoji_n_Object_defineProperty_this_EmojiUtils_n_value_n_configurable_true_n_n_return_value_n_nget_PermissionUtils_n_const_value_BdApi_findModuleByProps_computePermissions_n_Object_defineProperty_this_PermissionUtils_n_value_n_configurable_true_n_n_return_value_n_namespaceObject.Dispatcher.subscribe(eventType, this.main)));
				}
				serializeGuild(guildId) {
					const serialized = {
						id: guildId,
						invalid: true,
						name: "Unknown Guild",
						iconUrl: "/assets/1531b79c2f2927945582023e1edaaa11.png"
					};
					try {
						const guild = external_get_Messages_n_const_value_BdApi_findModuleByProps_getMessage_getMessages_n_Object_defineProperty_this_Messages_n_value_n_configurable_true_n_n_return_value_n_nget_Channels_n_const_value_BdApi_findModuleByProps_getChannel_n_Object_defineProperty_this_Channels_n_value_n_configurable_true_n_n_return_value_n_nget_Guilds_n_const_value_BdApi_findModuleByProps_getGuild_n_Object_defineProperty_this_Guilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedGuilds_n_const_value_BdApi_findModuleByProps_getGuildId_getLastSelectedGuildId_n_Object_defineProperty_this_SelectedGuilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedChannels_n_const_value_BdApi_findModuleByProps_getChannelId_getLastSelectedChannelId_n_Object_defineProperty_this_SelectedChannels_n_value_n_configurable_true_n_n_return_value_n_nget_Info_n_const_value_BdApi_findModuleByProps_getCurrentUser_n_Object_defineProperty_this_Info_n_value_n_configurable_true_n_n_return_value_n_nget_Status_n_const_value_BdApi_findModuleByProps_getStatus_n_Object_defineProperty_this_Status_n_value_n_configurable_true_n_n_return_value_n_nget_Users_n_const_value_BdApi_findModuleByProps_getUser_n_Object_defineProperty_this_Users_n_value_n_configurable_true_n_n_return_value_n_nget_Settings_n_const_value_BdApi_findModuleByProps_afkTimeout_status_n_Object_defineProperty_this_Settings_n_value_n_configurable_true_n_n_return_value_n_nget_UserProfile_n_const_value_BdApi_findModuleByProps_getUserProfile_n_Object_defineProperty_this_UserProfile_n_value_n_configurable_true_n_n_return_value_n_nget_Members_n_const_value_BdApi_findModuleByProps_getMember_n_Object_defineProperty_this_Members_n_value_n_configurable_true_n_n_return_value_n_nget_Activities_n_const_value_BdApi_findModuleByProps_getActivities_n_Object_defineProperty_this_Activities_n_value_n_configurable_true_n_n_return_value_n_nget_Games_n_const_value_BdApi_findModuleByProps_getGame_n_Object_defineProperty_this_Games_n_value_n_configurable_true_n_n_return_value_n_nget_Auth_n_const_value_BdApi_findModuleByProps_getId_isGuest_n_Object_defineProperty_this_Auth_n_value_n_configurable_true_n_n_return_value_n_nget_TypingUsers_n_const_value_BdApi_findModuleByProps_isTyping_n_Object_defineProperty_this_TypingUsers_n_value_n_configurable_true_n_n_return_value_n_default().Guilds.getGuild(guildId);
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
						const user = external_get_Messages_n_const_value_BdApi_findModuleByProps_getMessage_getMessages_n_Object_defineProperty_this_Messages_n_value_n_configurable_true_n_n_return_value_n_nget_Channels_n_const_value_BdApi_findModuleByProps_getChannel_n_Object_defineProperty_this_Channels_n_value_n_configurable_true_n_n_return_value_n_nget_Guilds_n_const_value_BdApi_findModuleByProps_getGuild_n_Object_defineProperty_this_Guilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedGuilds_n_const_value_BdApi_findModuleByProps_getGuildId_getLastSelectedGuildId_n_Object_defineProperty_this_SelectedGuilds_n_value_n_configurable_true_n_n_return_value_n_nget_SelectedChannels_n_const_value_BdApi_findModuleByProps_getChannelId_getLastSelectedChannelId_n_Object_defineProperty_this_SelectedChannels_n_value_n_configurable_true_n_n_return_value_n_nget_Info_n_const_value_BdApi_findModuleByProps_getCurrentUser_n_Object_defineProperty_this_Info_n_value_n_configurable_true_n_n_return_value_n_nget_Status_n_const_value_BdApi_findModuleByProps_getStatus_n_Object_defineProperty_this_Status_n_value_n_configurable_true_n_n_return_value_n_nget_Users_n_const_value_BdApi_findModuleByProps_getUser_n_Object_defineProperty_this_Users_n_value_n_configurable_true_n_n_return_value_n_nget_Settings_n_const_value_BdApi_findModuleByProps_afkTimeout_status_n_Object_defineProperty_this_Settings_n_value_n_configurable_true_n_n_return_value_n_nget_UserProfile_n_const_value_BdApi_findModuleByProps_getUserProfile_n_Object_defineProperty_this_UserProfile_n_value_n_configurable_true_n_n_return_value_n_nget_Members_n_const_value_BdApi_findModuleByProps_getMember_n_Object_defineProperty_this_Members_n_value_n_configurable_true_n_n_return_value_n_nget_Activities_n_const_value_BdApi_findModuleByProps_getActivities_n_Object_defineProperty_this_Activities_n_value_n_configurable_true_n_n_return_value_n_nget_Games_n_const_value_BdApi_findModuleByProps_getGame_n_Object_defineProperty_this_Games_n_value_n_configurable_true_n_n_return_value_n_nget_Auth_n_const_value_BdApi_findModuleByProps_getId_isGuest_n_Object_defineProperty_this_Auth_n_value_n_configurable_true_n_n_return_value_n_nget_TypingUsers_n_const_value_BdApi_findModuleByProps_isTyping_n_Object_defineProperty_this_TypingUsers_n_value_n_configurable_true_n_n_return_value_n_default().Users.getUser(userId);
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
							(0, external_Object_assign_BdApi_findModuleByProps_ModalRoot_BdApi_findModuleByProps_openModal_namespaceObject.closeModal)(modalId);
						},
						confirmText: "Clear"
					});
					const modalId = (0, external_Object_assign_BdApi_findModuleByProps_ModalRoot_BdApi_findModuleByProps_openModal_namespaceObject.openModal)((props => {
						var _guilds, _friends, _guilds2, _friends2;
						return GuildAndFriendRemovalAlerts_React.createElement(external_Object_assign_BdApi_findModuleByProps_ModalRoot_BdApi_findModuleByProps_openModal_namespaceObject.ModalRoot, GuildAndFriendRemovalAlerts_extends({}, props, {
							size: "large",
							className: styles.Z.modal
						}), GuildAndFriendRemovalAlerts_React.createElement(external_Object_assign_BdApi_findModuleByProps_ModalRoot_BdApi_findModuleByProps_openModal_namespaceObject.ModalHeader, null, "Guild And Friend Removal Alerts ", GuildAndFriendRemovalAlerts_React.createElement(external_Object_assign_BdApi_findModuleByProps_ModalRoot_BdApi_findModuleByProps_openModal_namespaceObject.ModalCloseButton, {
							className: styles.Z.floatRight,
							onClick: props.onClose
						})), GuildAndFriendRemovalAlerts_React.createElement(external_Object_assign_BdApi_findModuleByProps_ModalRoot_BdApi_findModuleByProps_openModal_namespaceObject.ModalContent, props, null !== (_guilds = guilds) && void 0 !== _guilds && _guilds.length || null !== (_friends = friends) && void 0 !== _friends && _friends.length ? GuildAndFriendRemovalAlerts_React.createElement(GuildAndFriendRemovalAlerts_React.Fragment, null, showClearButton ? GuildAndFriendRemovalAlerts_React.createElement("div", {
							className: styles.Z.clearButton,
							onClick: clearLogs
						}, "Clear Logs") : null, null !== (_guilds2 = guilds) && void 0 !== _guilds2 && _guilds2.length ? GuildAndFriendRemovalAlerts_React.createElement("div", {
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
						}))))) : null, null !== (_friends2 = friends) && void 0 !== _friends2 && _friends2.length ? GuildAndFriendRemovalAlerts_React.createElement("div", {
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
						}, "No logs to show.")));
					}));
				}
				onStop() {
					external_PluginApi_namespaceObject.Patcher.unpatchAll();
					external_n_inject_name_config_info_name_n_if_style_element_style_element_remove_n_style_element_document_head_appendChild_Object_assign_document_createElement_style_id_name_textContent_plugin_styles_n_n_remove_n_if_style_element_n_style_element_remove_n_style_element_null_n_n_n_default().remove();
					events.forEach((eventType => external_get_Dispatcher_n_const_value_BdApi_findModuleByProps_dirtyDispatch_subscribe_n_Object_defineProperty_this_Dispatcher_n_value_n_configurable_true_n_n_return_value_n_nget_EmojiUtils_n_const_value_BdApi_findModuleByProps_uploadEmoji_n_Object_defineProperty_this_EmojiUtils_n_value_n_configurable_true_n_n_return_value_n_nget_PermissionUtils_n_const_value_BdApi_findModuleByProps_computePermissions_n_Object_defineProperty_this_PermissionUtils_n_value_n_configurable_true_n_n_return_value_n_namespaceObject.Dispatcher.unsubscribe(eventType, this.main)));
				}
			}
		})();
		module.exports.LibraryPluginHack = __webpack_exports__;
	})();
	const PluginExports = module.exports.LibraryPluginHack;
	const plugin = PluginExports?.__esModule ? PluginExports.default : PluginExports;
	const showChangelog = plugin.prototype.showChangelog;
	plugin.prototype.showChangelog = async function(footer) {
		try {
			footer = (await PluginApi.WebpackModules.getByProps("getUser", "acceptAgreements").getUser("264163473179672576")).tag + " | https://discord.gg/yNqzuJa";
		} finally {
			showChangelog.call(this, footer);
		}
	};
	return plugin;
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