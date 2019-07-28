//META{"name":"CustomizableAvatarDPI","website":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/README.md","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/CustomizableAvatarDPI.plugin.js"}*//

class CustomizableAvatarDPI {
	
	getName() { return "Customizable Avatar DPI"; }
	getDescription() { return "Allows you to change the DPI of user avatars, to reduce bluriness with themes that increase the size of them."; }
	getVersion() { return "1.0.6"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			"1.0.6":
			`
				Just temporary fix until Metalloriff hopefully rewrites this plugin aroung christmas time
			`
		}
	}

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

	saveSettings() {
		NeatoLib.Settings.save(this);
	}

	getSettingsPanel() {

		setTimeout(() => {

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Popout avatar size", this.settings.popoutAvatarSize, e => {
				this.settings.popoutAvatarSize = e.target.value;
				this.saveSettings();
			}), this.getName(), { tooltip : "User popouts" });

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Other avatar size", this.settings.otherAvatarSize, e => {
				this.settings.otherAvatarSize = e.target.value;
				this.saveSettings();
			}), this.getName(), { tooltip : "Everything else" });

			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
		
	}
	
	onLibLoaded(){

		NeatoLib.Updates.check(this);

		this.settings = NeatoLib.Settings.load(this, {
			popoutAvatarSize : 1024,
			otherAvatarSize : 256,
			displayUpdateNotes : true
		});
		
		this.appObserver = new MutationObserver(m => {

			for(let i = 0; i < m.length; i++) {

				if(!m[i].addedNodes.length) continue;

				for(let a = 0; a < m[i].addedNodes.length; a++) {

					let added = m[i].addedNodes[a];

					if(!(added instanceof Element)) continue;
					
					let imgs = added.getElementsByClassName(NeatoLib.getClass(["avatar", "mask", "pointer", "status"], "avatar"));
					for(let img of imgs)
						if(img) img.src = img.src.split("?size=")[0] + "?size=" + this.settings.otherAvatarSize;

					let popouts = added.classList.contains(NeatoLib.getClass(["body", "footer", "popout", "title"], "popout")) ? [added] : added.getElementsByClassName(NeatoLib.getClass(["body", "footer", "popout", "title"], "popout"));
					for(let popout of popouts){
						let imgs = popout.getElementsByClassName(NeatoLib.getClass(["avatar", "mask", "pointer", "status"], "avatar"));
						for(let img of imgs)
							if(img) img.src = img.src.split("?size=")[0] + "?size=" + this.settings.popoutAvatarSize;
					}

				}

			}

		});

		this.appObserver.observe(document.getElementById("app-mount"), { childList : true, subtree : true });

		NeatoLib.Events.onPluginLoaded(this);
		
		NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());
		
	}
	
	stop() {
		this.appObserver.disconnect();
	}
	
}
