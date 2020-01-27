//META{"name":"PinCollapsedChannels","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/PinCollapsedChannels.plugin.js"}*//

class PinCollapsedChannels {

	getName() { return "PinCollapsedChannels"; }
	getDescription() { return "Allows you to pin channels on collapsed categories, similar to if there was an unread message."; }
	getVersion() { return "0.0.2"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {

		};
	}

	load() {}

	start() {
		const libLoadedEvent = () => {
			try{ this.onLibLoaded(); }
			catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
		};

		let lib = document.getElementById("NeatoBurritoLibrary");
		if (!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}

		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
		if (typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}

	get settingFields() {
		return {
			pinnedChannels: { label: "Pinned Channel IDs", description: "Hint: you can right click on channels to pin and unpin them.", type: "string", array: true }
		};
	}

	get defaultSettings() {
		return {
			displayUpdateNotes: true,
			pinnedChannels: []
		};
	}

	getSettingsPanel() {
		return NeatoLib.Settings.createPanel(this);
	}

	saveSettings() {
		NeatoLib.Settings.save(this);
	}

	onLibLoaded() {
		this.settings = NeatoLib.Settings.load(this);

		if (!NeatoLib.hasRequiredLibVersion(this, "0.5.19")) return;

		NeatoLib.Updates.check(this);

		this.unpatch = NeatoLib.monkeyPatchInternal(NeatoLib.Modules.find(m => m.default && m.default.toString().search(/return!0;return \w&&\w\.default\.isGuildCollapsed\(\w\)}/) !== -1), "default", e => {
			if (this.settings.pinnedChannels.includes(e.args[0].id)){
				return false;
			}
			else return e.callDefault();
		});

		document.addEventListener("contextmenu", this.contextEvent = e => this.onContextMenu(e));

		//if (this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

		NeatoLib.Events.onPluginLoaded(this);
	}

	onContextMenu(e) {
		const channel = NeatoLib.ReactData.getProp(NeatoLib.DOM.searchForParentElement(e.target, element => element.className && element.className.includes && element.className.includes("containerDefault")), "channel"),
			contextMenu = NeatoLib.ContextMenu.get();

		if (!channel || !contextMenu || !channel.parent_id || channel.type != 0) return;

		const subItems = [];

		if (this.settings.pinnedChannels.includes(channel.id)) {
			subItems.push(NeatoLib.ContextMenu.createItem("Unpin Channel", () => {
				this.settings.pinnedChannels.splice(this.settings.pinnedChannels.indexOf(channel.id), 1);
				this.saveSettings();
				NeatoLib.ContextMenu.close();
			}));
		} else {
			subItems.push(NeatoLib.ContextMenu.createItem("Pin Channel", () => {
				this.settings.pinnedChannels.push(channel.id);
				this.saveSettings();
				NeatoLib.ContextMenu.close();
			}));
		}

		contextMenu.firstChild.appendChild(NeatoLib.ContextMenu.createSubMenu("Pin Collapsed Channels", subItems));
	}

	stop() {
		this.unpatch();
		document.removeEventListener("contextmenu", this.contextEvent);
	}

}
