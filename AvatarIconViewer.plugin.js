//META{"name":"AvatarIconViewer","displayName":"User Avatar And Server Icon Viewer","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AvatarIconViewer.plugin.js"}*//
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

var AvatarIconViewer = (() => {
	const config = {
		info: {
			name: "AvatarIconViewer",
			authors: [{
				name: "Metalloriff",
				discord_id: "264163473179672576",
				github_username: "Metalloriff",
				twitter_username: "Metalloriff"
			}],
			version: "1.5.29",
			description: "Allows you to view server icons, user avatars, and emotes in fullscreen via the context menu. You may also directly copy the image URL or open the URL externally.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AvatarIconViewer.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/AvatarIconViewer.plugin.js"
		},
		changelog: [{
			title: "Fuck",
			type: "improved",
			items: ["I forgot the server icons in the rewrite."]
		}],
		main: "index.js",
		defaultConfig: []
	};

	return !global.ZeresPluginLibrary || !global.XenoLib ? class {
		getName() { return config.info.name; }
		getAuthor() { return config.info.authors.map(x => x.name).join(", "); }
		getDescription() { return config.info.description; }
		getVersion() { return config.info.version; }

		load() {
			const XenoLibMissing = !global.XenoLib;
			const zlibMissing = !global.ZeresPluginLibrary;
			const bothLibsMissing = XenoLibMissing && zlibMissing;
			const header = `Missing ${(bothLibsMissing && 'Libraries') || 'Library'}`;
			const content = `The ${(bothLibsMissing && 'Libraries') || 'Library'} ${(zlibMissing && 'ZeresPluginLibrary') || ''} ${(XenoLibMissing && (zlibMissing ? 'and XenoLib' : 'XenoLib')) || ''} required for ${this.name} ${(bothLibsMissing && 'are') || 'is'} missing.`;
			const ModalStack = BdApi.findModuleByProps('push', 'update', 'pop', 'popWithKey');
			const TextElement = BdApi.findModuleByProps('Sizes', 'Weights');
			const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() === 'confirm-modal');
			const onFail = () => BdApi.getCore().alert(header, `${content}<br/>Due to a slight mishap however, you'll have to download the libraries yourself. After opening the links, do CTRL + S to download the library.<br/>${(zlibMissing && '<br/><a href="https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js"target="_blank">Click here to download ZeresPluginLibrary</a>') || ''}${(zlibMissing && '<br/><a href="http://localhost:7474/XenoLib.js"target="_blank">Click here to download XenoLib</a>') || ''}`);
			if (!ModalStack || !ConfirmationModal || !TextElement) return onFail();
			ModalStack.push(props => {
			  return BdApi.React.createElement(
				ConfirmationModal,
				Object.assign(
				  {
					header,
					children: [TextElement({ color: TextElement.Colors.PRIMARY, children: [`${content} Please click Download Now to install ${(bothLibsMissing && 'them') || 'it'}.`] })],
					red: false,
					confirmText: 'Download Now',
					cancelText: 'Cancel',
					onConfirm: () => {
					  const request = require('request');
					  const fs = require('fs');
					  const path = require('path');
					  const waitForLibLoad = callback => {
						if (!global.BDEvents) return callback();
						const onLoaded = e => {
						  if (e !== 'ZeresPluginLibrary') return;
						  BDEvents.off('plugin-loaded', onLoaded);
						  callback();
						};
						BDEvents.on('plugin-loaded', onLoaded);
					  };
					  const onDone = () => {
						if (!global.pluginModule || (!global.BDEvents && !global.XenoLib)) return;
						if (!global.BDEvents || global.XenoLib) pluginModule.reloadPlugin(this.name);
						else {
						  const listener = () => {
							pluginModule.reloadPlugin(this.name);
							BDEvents.off('xenolib-loaded', listener);
						  };
						  BDEvents.on('xenolib-loaded', listener);
						}
					  };
					  const downloadXenoLib = () => {
						if (global.XenoLib) return onDone();
						request('https://raw.githubusercontent.com/1Lighty/BetterDiscordPlugins/master/Plugins/1XenoLib.plugin.js', (error, response, body) => {
						  if (error) return onFail();
						  onDone();
						  fs.writeFile(path.join(window.ContentManager.pluginsFolder, '1XenoLib.plugin.js'), body, () => {});
						});
					  };
					  if (!global.ZeresPluginLibrary) {
						request('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', (error, response, body) => {
						  if (error) return onFail();
						  waitForLibLoad(downloadXenoLib);
						  fs.writeFile(path.join(window.ContentManager.pluginsFolder, '0PluginLibrary.plugin.js'), body, () => {});
						});
					  } else downloadXenoLib();
					}
				  },
				  props
				)
			  );
			});
		}
  
		
		start() {}
		stop() {}
	} : (([Plugin, Api]) => {
		const plugin = (Plugin, Api) => {
			const {PluginUtilities, DiscordModules, DiscordSelectors, ReactTools, DOMTools, Utilities, WebpackModules} = Api;

			return class AvatarIconViewer extends Plugin {
				onStart() {
					XenoLib.patchContext(this.handleContextMenu);
				}
	
				onStop() {
					XenoLib.unpatchContext(this.handleContextMenu);
				}

				handleContextMenu(_this, returnValue) {
					if (_this.props.user) {
						const url = _this.props.user.avatarURL.replace("?size=128", "?size=2048");
						
						returnValue.props.children.push(XenoLib.createContextMenuGroup([
							XenoLib.createContextMenuItem("View Avatar", () => {
								DiscordModules.ModalStack.push(e => DiscordModules.React.createElement(WebpackModules.getByDisplayName("ImageModal"), {
									...e,
									src: url,
									placeholder: url,
									original: url,
									width: 2048,
									height: 2048,
									onClickUntrusted: e => e.openHref()
								}));
							}),
							XenoLib.createContextMenuItem("Copy Avatar Link", () => {
								ZeresPluginLibrary.WebpackModules.getByProps(["copy"]).copy(url);
								ZeresPluginLibrary.DiscordModules.ContextMenuActions.closeContextMenu();
							})
						]));
					}

					if (_this.props.guild) {
						const url = _this.props.guild.getIconURL().replace("?size=128", "?size=2048");

						returnValue.props.children.push(XenoLib.createContextMenuGroup([
							XenoLib.createContextMenuItem("View Icon", () => {
								DiscordModules.ModalStack.push(e => DiscordModules.React.createElement(WebpackModules.getByDisplayName("ImageModal"), {
									...e,
									src: url,
									placeholder: url,
									original: url,
									width: 2048,
									height: 2048,
									onClickUntrusted: e => e.openHref()
								}));
							}),
							XenoLib.createContextMenuItem("Copy Icon Link", () => {
								ZeresPluginLibrary.WebpackModules.getByProps(["copy"]).copy(url);
								ZeresPluginLibrary.DiscordModules.ContextMenuActions.closeContextMenu();
							})
						]))
					}
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
