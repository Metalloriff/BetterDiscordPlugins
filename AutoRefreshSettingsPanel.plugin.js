//META{"name":"AutoRefreshSettingsPanel"}*//

class AutoRefreshSettingsPanel {
	
    getName() { return "AutoRefreshSettingsPanel"; }
    getDescription() { return "Automatically refreshes the BetterDiscord plugin settings panel when clicking into Discord, making developing settings menus 1,000x faster if you have a lot of plugins."; }
    getVersion() { return "0.0.1"; }
	getAuthor() { return "Metalloriff"; }

    load() {}

    start() {

        this.refreshPluginSettings = () => {
			let panel = document.getElementsByClassName("plugin-settings")[0];
			if(panel) panel.innerHTML = BdApi.getPlugin(panel.id.substring(panel.id.lastIndexOf("-") + 1, panel.id.length)).getSettingsPanel();
		};

        window.addEventListener("focus", this.refreshPluginSettings);

	}
	
    stop() {
        window.removeEventListener("focus", this.refreshPluginSettings);
	}
	
}