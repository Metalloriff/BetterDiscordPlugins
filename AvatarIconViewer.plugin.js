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
      name: 'AvatarIconViewer',
      authors: [
        {
          name: 'Metalloriff',
          discord_id: '264163473179672576',
          github_username: 'Metalloriff',
          twitter_username: 'Metalloriff'
        }
      ],
      version: '1.6.2',
      description: 'Allows you to view server icons, user avatars, and emotes in fullscreen via the context menu. You may also directly copy the image URL or open the URL externally.',
      github: 'https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AvatarIconViewer.plugin.js',
      github_raw: 'https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/AvatarIconViewer.plugin.js'
    },
    changelog: [
      {
        title: 'REEE',
        type: 'fixed',
        items: ['Fixed plugin not working, again']
      }
    ],
    main: 'index.js',
    defaultConfig: []
  };

  let ZeresPluginLibraryOutdated = false;
  let XenoLibOutdated = false;
  try {
    if (global.BdApi && 'function' == typeof BdApi.getPlugin) {
      const i = (i, n) => ((i = i.split('.').map(i => parseInt(i))), (n = n.split('.').map(i => parseInt(i))), !!(n[0] > i[0]) || !!(n[0] == i[0] && n[1] > i[1]) || !!(n[0] == i[0] && n[1] == i[1] && n[2] > i[2])),
        n = (n, e) => n && n._config && n._config.info && n._config.info.version && i(n._config.info.version, e),
        e = BdApi.getPlugin('ZeresPluginLibrary'),
        o = BdApi.getPlugin('XenoLib');
      n(e, '1.2.17') && (ZeresPluginLibraryOutdated = !0), n(o, '1.3.20') && (XenoLibOutdated = !0);
    }
  } catch (i) {
    console.error('Error checking if libraries are out of date', i);
  }

  return !global.ZeresPluginLibrary || !global.XenoLib || ZeresPluginLibraryOutdated || XenoLibOutdated
    ? class {
        constructor() {
          this._XL_PLUGIN = true;
          this.start = this.load = this.handleMissingLib;
        }
        getName() {
          return config.info.name;
        }
        getAuthor() {
          return config.info.authors.map(x => x.name).join(', ');
        }
        getDescription() {
          return config.info.description;
        }
        getVersion() {
          return config.info.version;
        }
        stop() {}
        handleMissingLib() {
          const a = BdApi.findModuleByProps('openModal', 'hasModalOpen');
          if (a && a.hasModalOpen(`${this.getName()}_DEP_MODAL`)) return;
          const b = !global.XenoLib,
            c = !global.ZeresPluginLibrary,
            d = (b && c) || ((b || c) && (XenoLibOutdated || ZeresPluginLibraryOutdated)),
            e = (() => {
              let a = '';
              return b || c ? (a += `Missing${XenoLibOutdated || ZeresPluginLibraryOutdated ? ' and outdated' : ''} `) : (XenoLibOutdated || ZeresPluginLibraryOutdated) && (a += `Outdated `), (a += `${d ? 'Libraries' : 'Library'} `), a;
            })(),
            f = (() => {
              let a = `The ${d ? 'libraries' : 'library'} `;
              return b || XenoLibOutdated ? ((a += 'XenoLib '), (c || ZeresPluginLibraryOutdated) && (a += 'and ZeresPluginLibrary ')) : (c || ZeresPluginLibraryOutdated) && (a += 'ZeresPluginLibrary '), (a += `required for ${this.getName()} ${d ? 'are' : 'is'} ${b || c ? 'missing' : ''}${XenoLibOutdated || ZeresPluginLibraryOutdated ? (b || c ? ' and/or outdated' : 'outdated') : ''}.`), a;
            })(),
            g = BdApi.findModuleByDisplayName('Text'),
            h = BdApi.findModuleByDisplayName('ConfirmModal'),
            i = () => BdApi.alert(e, BdApi.React.createElement('span', {}, BdApi.React.createElement('div', {}, f), `Due to a slight mishap however, you'll have to download the libraries yourself. This is not intentional, something went wrong, errors are in console.`, c || ZeresPluginLibraryOutdated ? BdApi.React.createElement('div', {}, BdApi.React.createElement('a', { href: 'https://betterdiscord.net/ghdl?id=2252', target: '_blank' }, 'Click here to download ZeresPluginLibrary')) : null, b || XenoLibOutdated ? BdApi.React.createElement('div', {}, BdApi.React.createElement('a', { href: 'https://betterdiscord.net/ghdl?id=3169', target: '_blank' }, 'Click here to download XenoLib')) : null));
          if (!a || !h || !g) return console.error(`Missing components:${(a ? '' : ' ModalStack') + (h ? '' : ' ConfirmationModalComponent') + (g ? '' : 'TextElement')}`), i();
          class j extends BdApi.React.PureComponent {
            constructor(a) {
              super(a), (this.state = { hasError: !1 }), (this.componentDidCatch = a => (console.error(`Error in ${this.props.label}, screenshot or copy paste the error above to Lighty for help.`), this.setState({ hasError: !0 }), 'function' == typeof this.props.onError && this.props.onError(a))), (this.render = () => (this.state.hasError ? null : this.props.children));
            }
          }
          let k = !1,
            l = !1;
          const m = a.openModal(
            b => {
              if (l) return null;
              try {
                return BdApi.React.createElement(
                  j,
                  { label: 'missing dependency modal', onError: () => (a.closeModal(m), i()) },
                  BdApi.React.createElement(
                    h,
                    Object.assign(
                      {
                        header: e,
                        children: BdApi.React.createElement(g, { size: g.Sizes.SIZE_16, children: [`${f} Please click Download Now to download ${d ? 'them' : 'it'}.`] }),
                        red: !1,
                        confirmText: 'Download Now',
                        cancelText: 'Cancel',
                        onCancel: b.onClose,
                        onConfirm: () => {
                          if (k) return;
                          k = !0;
                          const b = require('request'),
                            c = require('fs'),
                            d = require('path'),
                            e = BdApi.Plugins && BdApi.Plugins.folder ? BdApi.Plugins.folder : window.ContentManager.pluginsFolder,
                            f = () => {
                              (global.XenoLib && !XenoLibOutdated) ||
                                b('https://raw.githubusercontent.com/1Lighty/BetterDiscordPlugins/master/Plugins/1XenoLib.plugin.js', (b, f, g) => {
                                  try {
                                    if (b || 200 !== f.statusCode) return a.closeModal(m), i();
                                    c.writeFile(d.join(e, '1XenoLib.plugin.js'), g, () => {});
                                  } catch (b) {
                                    console.error('Fatal error downloading XenoLib', b), a.closeModal(m), i();
                                  }
                                });
                            };
                          !global.ZeresPluginLibrary || ZeresPluginLibraryOutdated
                            ? b('https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js', (b, g, h) => {
                                try {
                                  if (b || 200 !== g.statusCode) return a.closeModal(m), i();
                                  c.writeFile(d.join(e, '0PluginLibrary.plugin.js'), h, () => {}), f();
                                } catch (b) {
                                  console.error('Fatal error downloading ZeresPluginLibrary', b), a.closeModal(m), i();
                                }
                              })
                            : f();
                        }
                      },
                      b,
                      { onClose: () => {} }
                    )
                  )
                );
              } catch (b) {
                return console.error('There has been an error constructing the modal', b), (l = !0), a.closeModal(m), i(), null;
              }
            },
            { modalKey: `${this.getName()}_DEP_MODAL` }
          );
        }
      }
    : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
          const { DiscordModules, WebpackModules, Logger, Utilities } = Api;
          const { React } = DiscordModules;
          const Patcher = XenoLib.createSmartPatcher(Api.Patcher);

          const ModalStack = WebpackModules.getByProps('openModal', 'hasModalOpen');

          const ImageModal = WebpackModules.getByDisplayName('ImageModal');
          const AvatarModule = WebpackModules.getByProps('getChannelIconURL');
          const ElectronModule = require('electron');

          const MaskedLink = WebpackModules.getByDisplayName('MaskedLink');
          const renderLinkComponent = props => React.createElement(MaskedLink, props);
          const Modals = WebpackModules.getByProps('ModalRoot');
          const ImageModalClasses = WebpackModules.getByProps('modal', 'image');

          return class AvatarIconViewer extends Plugin {
            constructor() {
              super();
              XenoLib.changeName(__filename, 'AvatarIconViewer');
              const oOnStart = this.onStart.bind(this);
              this.onStart = () => {
                try {
                  oOnStart();
                } catch (e) {
                  Logger.stacktrace('Failed to start!', e);
                  PluginUpdater.checkForUpdate(this.getName(), this.version, this._config.info.github_raw);
                  XenoLib.Notifications.error(`[**${this.getName()}**] Failed to start! Please update it, press CTRL + R, or ${GuildStore.getGuild('324014796980617247') ? 'go to <#443198947452911617>' : '[join my support server](https://discord.gg/yNqzuJa)'} for further assistance.`, { timeout: 0 });
                  try {
                    this.onStop();
                  } catch (e) {}
                }
              };
              try {
                ModalStack.closeModal(`${this.getName()}_DEP_MODAL`);
              } catch (e) {}
            }
            onStart() {
              const CTXs = WebpackModules.findAll(({ default: { displayName } }) => displayName && (displayName.endsWith('UserContextMenu') || displayName === 'GroupDMContextMenu'));
              for (const CTX of CTXs) {
                Patcher.after(CTX, 'default', (_, [props], ret) => {
                  const menu = Utilities.getNestedProp(
                    Utilities.findInReactTree(ret, e => e && e.type && e.type.displayName === 'Menu'),
                    'props.children'
                  );
                  if (!Array.isArray(menu)) return;
                  let url;
                  let type;
                  if (props.user && props.user.getAvatarURL) {
                    type = 'Avatar';
                    url = props.user.getAvatarURL().split('?')[0] + '?size=2048';
                  } else if (props.channel && props.channel.type === 3 /* group DM */) {
                    type = 'Icon';
                    url = AvatarModule.getChannelIconURL(props.channel);
                  } else return Logger.warn('Uknonwn context menu') /* hurr durr? */;
                  if (!url.indexOf('/assets/')) url = 'https://discordapp.com' + url;
                  if (url.indexOf('/a_') !== -1) url = url.replace('.webp', '.gif').replace('.png', '.gif');
                  menu.push(this.constructMenu(url, 2048, 2048, type));
                });
              }
              const handleCTXPatch = (props, ret) => {
                if (!props.target || typeof props.target.className !== 'string' || props.target.className.indexOf('emoji') === -1) return;
                const menu = Utilities.getNestedProp(
                  Utilities.findInReactTree(ret, e => e && e.type && e.type.displayName === 'Menu'),
                  'props.children'
                );
                if (!Array.isArray(menu)) return;
                let width = 2048;
                let height = 2048;
                const nWidth = props.target.naturalWidth;
                const nHeight = props.target.naturalHeight;
                if (nWidth > nHeight) {
                  const scale = 2048 / nWidth;
                  width = 2048;
                  height = Math.ceil(nHeight * scale);
                } else {
                  const scale = 2048 / nHeight;
                  height = 2048;
                  width = Math.ceil(nWidth * scale);
                }
                menu.push(this.constructMenu(props.target.src, width, height, 'Emoji', false));
              };
              Patcher.after(
                WebpackModules.find(({ default: { displayName } }) => displayName === 'MessageContextMenu'),
                'default',
                (_, [props], ret) => handleCTXPatch(props, ret)
              );
              Patcher.after(
                WebpackModules.find(({ default: { displayName } }) => displayName === 'NativeImageContextMenu'),
                'default',
                (_, [props], ret) => handleCTXPatch(props, ret)
              );
              Patcher.after(
                WebpackModules.find(({ default: { displayName } }) => displayName === 'GuildContextMenu'),
                'default',
                (_, [props], ret) => {
                  const menu = Utilities.getNestedProp(
                    Utilities.findInReactTree(ret, e => e && e.type && e.type.displayName === 'Menu'),
                    'props.children'
                  );
                  if (!Array.isArray(menu)) return;
                  let url = props.guild.getIconURL();
                  if (!url) return;
                  url = url.split('?')[0] + '?size=2048';
                  if (url.indexOf('/a_') !== -1) url = url.replace('.webp', '.gif').replace('.png', '.gif');
                  menu.push(this.constructMenu(url, 2048, 2048, 'Icon'));
                }
              );
            }
            onStop() {
              Patcher.unpatchAll();
            }
            constructMenu(url, width, height, type, canCopy = true) {
              return XenoLib.createContextMenuGroup([
                XenoLib.createContextMenuItem(
                  `View ${type}`,
                  () => {
                    ModalStack.openModal(e =>
                      React.createElement(
                        Modals.ModalRoot,
                        { className: ImageModalClasses.modal, ...e, size: Modals.ModalSize.DYNAMIC },
                        React.createElement(ImageModal, {
                          ...e,
                          src: url,
                          placeholder: url,
                          original: url,
                          width: width,
                          height: height,
                          onClickUntrusted: e => e.openHref(),
                          renderLinkComponent,
                          className: ImageModalClasses.image,
                          shouldAnimate: true
                        })
                      )
                    );
                  },
                  'aiv-view'
                ),
                canCopy ? XenoLib.createContextMenuItem(`Copy ${type} Link`, () => ElectronModule.clipboard.writeText(url), 'aiv-copy') : null
              ]);
            }
          };
        };

        return plugin(Plugin, Api);
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
