//META{"name":"AvatarIconViewer","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/AvatarIconViewer.plugin.js"}*//

class AvatarIconViewer {

	getName() { return "User Avatar And Server Icon Viewer"; }
	getDescription() { return "Allows you to view server icons, user avatars, and emotes in fullscreen via the context menu. You may also directly copy the image URL or open the URL externally."; }
	getVersion() { return "0.5.26"; }
	getAuthor() { return "Metalloriff"; }

	load() {}

	start() {
		let libLoadedEvent = () => {
			try{ this.onLibLoaded(); }
			catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
		};

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
		if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}

	onLibLoaded() {
		if(!NeatoLib.hasRequiredLibVersion(this, "0.0.3")) return;

		NeatoLib.Updates.check(this, "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/AvatarIconViewer.plugin.js");

		this.classes = NeatoLib.getClasses(["maskProfile", "guildIconImage", "member", "reactor", "iconSizeSmall", "listAvatar"], false);

		this.contextEvent = e => this.onContextMenu(e);

		this.keyUpEvent = e => {
			if(e.keyCode == 27) {
				this.destroyPreview();
				document.removeEventListener("keyup", this.keyUpEvent);
			}
		};

		document.addEventListener("contextmenu", this.contextEvent);

		NeatoLib.Events.onPluginLoaded(this);
	}

	onContextMenu(e) {
		let context = NeatoLib.ContextMenu.get(), viewLabel = "View Avatar", copyLabel = "Copy Avatar Link";

		if(!context && !e.target.classList.contains(this.classes.maskProfile.split(" ")[0]) && !e.target.classList.contains(this.classes.guildIconImage.split(" ")[0]) && !e.target.classList.contains("clickable")) return;

		this.url = "";

		if(!context) context = NeatoLib.ContextMenu.create([NeatoLib.ContextMenu.createGroup([])], e);

		const
		getAvatar = () => {
			const user = NeatoLib.ReactData.get(context).return.return.return.return.memoizedProps.user;

			if (user) this.url = user.getAvatarURL();
			else return null;

			if(this.url.includes("/a_")) this.url = this.url.replace(".png", ".gif");

			return this.url;
		},

		getServerIcon = () => {
			const guild = NeatoLib.ReactData.getProp(context, "guild");

			if (guild && !NeatoLib.ReactData.getProp(context, "channel")) this.url = guild.getIconURL();
			else if (e.target.className.includes("guildIconImage")) this.url = e.target.style.backgroundImage.split('"')[1];
			else return null;

			viewLabel = "View Icon";
			copyLabel = "Copy Icon Link";

			return this.url;
		},

		getEmoji = () => {
			if(!e.target.classList.contains("emoji")) return null;

			this.url = e.target.src;

			viewLabel = "View Emoji";

			return this.url;
		},

		formatURL = () => {
			if(this.url.indexOf("?size") != -1) this.url = this.url.substring(0, this.url.indexOf("?size") + 1);
			this.url += "size=2048";
		};

		if(context && NeatoLib.ReactData.get(context) && (getServerIcon() || getAvatar() || getEmoji())) {

			formatURL();

			let par = context.getElementsByClassName(NeatoLib.ContextMenu.classes.itemGroup)[1] || context.getElementsByClassName(NeatoLib.ContextMenu.classes.itemGroup)[0];

			if(viewLabel) par.appendChild(NeatoLib.ContextMenu.createItem(viewLabel, () => this.createImagePreview()));
			if(copyLabel) par.appendChild(NeatoLib.ContextMenu.createItem(copyLabel, () => this.copyURL()));

		} else if(e.target.classList.contains(this.classes.maskProfile.split(" ")[0]) || e.target.classList.contains("clickable")){

			let targ = e.target.classList.contains("clickable") ? NeatoLib.DOM.searchForParentElementByClassName(e.target, "avatar-large") : e.target;

			if(!targ.style.backgroundImage) targ = targ.parentElement.getElementsByClassName(this.classes.maskProfile.split(" ")[0])[0];
			if(targ.style.backgroundImage) this.url = targ.style.backgroundImage.match(/".*"/)[0].replace(/"/g, "");
			else return;

			formatURL();

			const menu = NeatoLib.ContextMenu.create([
				NeatoLib.ContextMenu.createGroup([
					NeatoLib.ContextMenu.createItem("View Avatar", () => this.createImagePreview(menu)),
					NeatoLib.ContextMenu.createItem("Copy Avatar Link", () => this.copyURL(menu))
				])
			], e);

		}

	}

	createImagePreview(cm) {
		if(!document.getElementById("avatar-img-preview")){
			document.addEventListener("keyup", this.keyUpEvent);

			if (cm) cm.remove();
			NeatoLib.ContextMenu.close();

			let scale = window.innerHeight - 160;

			document.getElementsByClassName(NeatoLib.getClass("app"))[0].insertAdjacentHTML("beforeend",
			`<div id="aiv-preview-window" style="z-index: 5000">
				<div id="aiv-preview-backdrop" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px); top: 0; left: 0; bottom: 0; right: 0; position: fixed;"></div>
				<div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);">
					<div class="inner-1JeGVc">
						<div>
							<div class="imageWrapper-2p5ogY" style="width: ${scale}px; height: ${scale}px;"><img src="${this.url}" style="width: 100%; height: 100%;"></div>
							<div style="text-align: center; padding-top: 5px;"><button id="aiv-preview-copy" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Copy URL</div></button>
								<button id="aiv-preview-close" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;">
									<div class="contents-4L4hQM">Close</div>
								</button>
								<button id="aiv-preview-open" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;">
									<div class="contents-4L4hQM">Open Externally</div>
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>`);

			document.getElementById("aiv-preview-backdrop").addEventListener("click", () => this.destroyPreview());
			document.getElementById("aiv-preview-close").addEventListener("click", () => this.destroyPreview());
			document.getElementById("aiv-preview-copy").addEventListener("click", () => this.copyURL());
			document.getElementById("aiv-preview-open").addEventListener("click", () => this.openURL());
		}
	}

	destroyPreview() {
		if(document.getElementById("aiv-preview-window")) document.getElementById("aiv-preview-window").remove();
		document.removeEventListener("keyup", this.keyUpEvent);
	}

	copyURL(cm) {
		if (cm) cm.remove();
		NeatoLib.ContextMenu.close();

		NeatoLib.Modules.get("copy").copy(this.url);
		NeatoLib.showToast("Link copied to clipboard", "success");
	}

	openURL() {
		window.open(this.url);
	}

	stop() {
		document.removeEventListener("contextmenu", this.contextEvent);
		document.removeEventListener("keyup", this.keyUpEvent);
	}

}
