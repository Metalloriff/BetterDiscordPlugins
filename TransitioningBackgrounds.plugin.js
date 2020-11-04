/**
 * @name TransitioningBackgrounds
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TransitioningBackgrounds.plugin.js
 */

 /* TODO
	Add server-based images.
	Slow zoom option.
 */

module.exports = (() =>
{
	const ImageSource =
	{
		Folder: 1
	};

	const TransitionMethod =
	{
		FadeInOut: 1,
		SlideLeft: 2,
		SlideRight: 3,
		SlideUp: 4,
		SlideDown: 5,
		Shrink: 6,
		RotateX: 7,
		RotateY: 8,
		ZoomFade: 9
	};

	const SortType =
	{
		Shuffle: 1,
		AZ: 2
	};

	const ImageSizeMode =
	{
		Auto: "auto",
		Cover: "cover",
		Contain: "contain",
		Initial: "initial",
		Stretch: "100% 100%"
	};

	const config =
	{
		info:
		{
			name: "TransitioningBackgrounds",
			authors:
			[
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				}
			],
			version: "2.2.2",
			description: "Allows you to set a list of background images, or pick a source, to transitioning between using various animations and sort modes.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TransitioningBackgrounds.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/TransitioningBackgrounds.plugin.js"
		},
		defaultConfig:
		[
			{
				type: "category",
				name: "General Settings",
				id: "general",
				collapsible: true,
				shown: false,
				settings:
				[
					{
						type: "slider",
						name: "Image Life (seconds)",
						id: "imageLife",
						value: 30,
						min: 0,
						max: 601,
						renderValue: v =>
							v <= 600
								? Math.round(v) + " seconds"
								: "on startup"
					},
					{
						type: "dropdown",
						name: "Image Size Mode",
						id: "imageSizeMode",
						value: ImageSizeMode.Cover,
						options:
						[
							{ label: "Auto", value: ImageSizeMode.Auto },
							{ label: "Cover", value: ImageSizeMode.Cover },
							{ label: "Contain", value: ImageSizeMode.Contain },
							{ label: "Initial", value: ImageSizeMode.Initial },
							{ label: "Stretch", value: ImageSizeMode.Stretch }
						]
					},
					{
						type: "switch",
						name: "Force Transparency",
						note: "For use without a theme.",
						id: "forceTransparency",
						value: false
					},
					{
						type: "slider",
						name: "Background Brightness",
						id: "backgroundBrightness",
						value: 0.5,
						min: 0,
						max: 1
					}
				]
			},
			{
				type: "category",
				name: "Image Source Settings",
				id: "imageSource",
				collapsible: true,
				shown: false,
				settings:
				[
					{
						type: "dropdown",
						name: "Image Source",
						id: "source",
						value: ImageSource.Folder,
						options: [
							{ label: "Folder", value: ImageSource.Folder }
						]
					},
					{
						type: "textbox",
						name: "Source Path",
						id: "folder",
						value: ""
					}
				]
			},
			{
				type: "category",
				name: "Transition Settings",
				id: "transition",
				collapsible: true,
				shown: false,
				settings:
				[
					{
						type: "dropdown",
						name: "Transition Method",
						id: "method",
						value: TransitionMethod.FadeInOut,
						options:
						[
							{ label: "Fade In/Out", value: TransitionMethod.FadeInOut },
							{ label: "Slide Left", value: TransitionMethod.SlideLeft },
							{ label: "Slide Right", value: TransitionMethod.SlideRight },
							{ label: "Slide Up", value: TransitionMethod.SlideUp },
							{ label: "Slide Down", value: TransitionMethod.SlideDown },
							{ label: "Shrink", value: TransitionMethod.Shrink },
							{ label: "Rotate X", value: TransitionMethod.RotateX },
							{ label: "Rotate Y", value: TransitionMethod.RotateY },
							{ label: "Zoom In And Fade Out", value: TransitionMethod.ZoomFade }
						]
					},
					{
						type: "slider",
						name: "Transition Time (seconds)",
						id: "time",
						value: 3,
						min: 0,
						max: 60,
						renderValue: v => Math.round(v) + " seconds"
					},
					{
						type: "dropdown",
						name: "Sort Method",
						id: "sort",
						value: SortType.Shuffle,
						options: [
							{ label: "Shuffle On Start", value: SortType.Shuffle },
							{ label: "Alphabetically", value: SortType.AZ }
						]
					}
				]
			}
		],
		changelog:
		[
			{
				title: "changes and bug fixes",
				type: "fixed",
				items:
				[
					"Your settings are now based on your user ID."
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
			const { WebpackModules, DiscordModules: { UserStore: { getCurrentUser } }, PluginUtilities } = Api;

			const fs = require("fs");
			const path = require("path");

			return class TransitioningBackgrounds extends Plugin
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

				getDataName = () => this.getName() + "." + getCurrentUser().id;
				loadSettings = s => PluginUtilities.loadSettings(this.getDataName(), PluginUtilities.loadSettings(this.getName(), s || this.defaultSettings));
				saveSettings = s => PluginUtilities.saveSettings(this.getDataName(), this.settings || s);

				getSettingsPanel() {
					const panel = this.buildSettingsPanel();

					panel.addListener(() => {
						this.term();
						this.init();
					});

					return panel.getElement();
				}

				createElement(type, options)
				{
					const e = document.createElement(type);
	
					for (let o in options)
					{
						e[o] = options[o];
					}
	
					return e;
				}

				get CSS()
				{
					return `
						.tb-image
						{
							display: none;
							background-size: ${this.settings.general.imageSizeMode};
							background-position: center;
							background-repeat: no-repeat;
							width: 100%;
							height: 100%;
							position: absolute;
							filter: brightness(${this.settings.general.backgroundBrightness});
						}

						.tb-active .tb-image
						{
							display: block;
						}

						.tb-transition-${TransitionMethod.FadeInOut} { transition: opacity ${this.settings.transition.time}s; opacity: 0 }
						.tb-transition-${TransitionMethod.SlideLeft} { transition: transform ${this.settings.transition.time}s; transform: translateX(-100%) }
						.tb-transition-${TransitionMethod.SlideRight} { transition: transform ${this.settings.transition.time}s; transform: translateX(100%) }
						.tb-transition-${TransitionMethod.SlideUp} { transition: transform ${this.settings.transition.time}s; transform: translateY(-100%) }
						.tb-transition-${TransitionMethod.SlideDown} { transition: transform ${this.settings.transition.time}s; transform: translateY(100%) }
						.tb-transition-${TransitionMethod.Shrink} { transition: transform ${this.settings.transition.time}s; transform: scale(0) }
						.tb-transition-${TransitionMethod.RotateX} { transition: transform ${this.settings.transition.time}s; transform: rotateX(180deg) }
						.tb-transition-${TransitionMethod.RotateY} { transition: transform ${this.settings.transition.time}s; transform: rotateY(180deg) }
						.tb-transition-${TransitionMethod.ZoomFade} { transition: transform ${this.settings.transition.time}s, opacity ${this.settings.transition.time}s; transform: scale(5); opacity: 1 }
					`;
				}

				get ForceTransparencyCSS()
				{
					if (!this.settings.general.forceTransparency)
						return "";

					const opacity = 0.3;

					return `
						:root
						{
							--background-primary: rgba(0,0,0,${opacity});
							--background-secondary: rgba(0,0,0,${opacity});
							--background-secondary-alt: rgba(0,0,0,${opacity});
							--background-tertiary: rgba(0,0,0,${opacity});
							--background-accent: rgba(0,0,0,${opacity});
							--background-floating: rgba(0,0,0,${opacity});

							--background-modifier-hover: rgba(0,0,0,0.1);
							--background-modifier-selected: rgba(0,0,0,0.3);
							--channeltextarea-background: rgba(0,0,0,${opacity});
						}
						
						.theme-dark .container-1D34oG
						{
							background: var(--background-primary);
						}

						.typeWindows-1za-n7
						{
							background: black;
							margin: 0;
							border: 3px solid black;
						}
						
						`;
				}

				onStart = () => this.init();
				onStop = () => this.term();
	
				init()
				{
					if (this.settings.forceTransparency != undefined)
						this.settings = this.defaultSettings;

					PluginUtilities.addStyle("tb-css", this.CSS);
					PluginUtilities.addStyle("tb-ft-css", this.ForceTransparencyCSS);

					this.el = this.createElement("div", { id: "tb-container", className: "tb-active" });
					this.image0 = this.createElement("div", { id: "tb-image-0", className: "tb-image" });
					this.image1 = this.createElement("div", { id: "tb-image-1", className: "tb-image" });

					this.el.appendChild(this.image0);
					this.el.appendChild(this.image1);

					document.getElementsByTagName("html")[0].prepend(this.el);

					this.activeImage = this.image1;
					this.inactiveImage = this.image0;

					this.index = 0;

					this.loadedImageNames = null;

					if (this.settings.general.imageLife <= 600)
						this.loop = setInterval(() => this.main(), this.settings.general.imageLife * 1000);
					this.main();
					this.updateNextImage();

					this.onVisibilityChanged = () =>
					{
						const container = document.getElementById("tb-container");
						container.classList[document.hidden ? "remove" : "add"]("tb-active");
					};

					document.addEventListener("visibilitychange", this.onVisibilityChanged);
				}

				set nextImageURL(url)
				{
					this.inactiveImage.style.backgroundImage = `url(${url})`;
				}

				shuffle(arr)
				{
					for (let i = arr.length - 1; i > 0; i--)
					{
						let r = Math.floor(Math.random() * (i + 1));
						let t = arr[i];

						arr[i] = arr[r];
						arr[r] = t;
					}
				}

				async main()
				{
					this.activeImage = this.activeImage == this.image0 ? this.image1 : this.image0;
					this.inactiveImage = this.activeImage == this.image0 ? this.image1 : this.image0;

					this.inactiveImage.classList.remove("tb-transition-" + this.settings.transition.method);
					this.activeImage.classList.add("tb-transition-" + this.settings.transition.method);

					await new Promise(r => setTimeout(r, this.settings.transition.time));

					this.updateNextImage();
				}

				updateNextImage()
				{
					switch (this.settings.imageSource.source)
					{
						case ImageSource.Folder:
							if (this.loadedImageNames == null)
							{
								try
								{
									this.loadedImageNames = [];

									if (this.settings.imageSource.folder != null && this.settings.imageSource.folder.length > 0)
									{
										const files = fs.readdirSync(this.settings.imageSource.folder, { withFileTypes: true });

										for (let { name } of files)
										{
											if (name.match(/(\.jpg|\.jpeg|\.png|\.gif|\.webp)$/g) != null)
											{
												this.loadedImageNames.push(name);
											}
										}
									}

									switch (this.settings.transition.sort)
									{
										case SortType.Shuffle:
											this.shuffle(this.loadedImageNames);
											break;
										case SortType.AZ:
											this.loadedImageNames = this.loadedImageNames.sort()
											break;
									}
								}
								catch (exc)
								{
									console.error(exc);
									BdApi.showConfirmationModal("TransitioningBackgrounds: Error reading files from directory.", exc.toString());

									this.loadedImageNames = [];
								}
							}

							if (this.loadedImageNames.length > 0)
							{
								const fp = path.join(this.settings.imageSource.folder, this.loadedImageNames[this.index]);
								fs.readFile(fp, (exc, data) =>
								{
									if (exc != null)
									{
										console.error(exc);
	
										return;
									}
	
									const ext = path.extname(fp);
									const b64 = Buffer.from(data, "binary").toString("base64");
									const src = `data:image/${ext.split(".")[1]};base64,${b64}`;
	
									this.nextImageURL = src;
								});
							}

							this.index++;

							if (this.index >= this.loadedImageNames.length)
								this.index = 0;
							break;
					}
				}
	
				term()
				{
					this.el.remove();

					PluginUtilities.removeStyle("tb-css");
					PluginUtilities.removeStyle("tb-ft-css");

					document.removeEventListener("visibilitychange", this.onVisibilityChanged);

					if (this.loop != null)
						clearTimeout(this.loop);
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
