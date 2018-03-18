//META{"name":"BetterEmoteSizes"}*//

class BetterEmoteSizes {
	
	constructor(){
		this.initialSize = 32;
		this.initialSmallSize = 22;
		this.hoverSize = 96;
		this.hoverSmallSize = 66;
		this.messageObserver = null;
	}
	
    getName() { return "Better Emote Sizes"; }
    getDescription() { return "Increases the size of emotes upon hovering over them, and allows you to set a default and hover size for large and small emotes."; }
    getVersion() { return "0.0.2"; }
    getAuthor() { return "Metalloriff"; }
	
	getSettingsPanel(){
		return `<h style="color: rgb(255, 255, 255); font-size: 30px; font-weight: bold;">Better Emote Sizes by Metalloriff</h><br><br><p style="color: rgb(255, 255, 255); font-size: 20px;">Large Emote Size (px):</p><input id="bes-initialSize" value="` + this.initialSize + `" type="number" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY"><p style="color: rgb(255, 255, 255); font-size: 20px;">Large Emote Hover Size (px):</p><input id="bes-hoverSize" value="` + this.hoverSize + `" type="number" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY"><p style="color: rgb(255, 255, 255); font-size: 20px;">Small Emote Size (px):</p><input id="bes-initialSmallSize" value="` + this.initialSmallSize + `" type="number" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY"><p style="color: rgb(255, 255, 255); font-size: 20px;">Small Emote Hover Size (px):</p><input id="bes-hoverSmallSize" value="` + this.hoverSmallSize + `" type="number" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY"><div style="text-align: center;"><br><button onclick="BdApi.getPlugin('Better Emote Sizes').resetSettings(true);" style="display: inline-block; margin-right: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u"><div class="contents-4L4hQM">Reset Settings</div></button><button onclick="BdApi.getPlugin('Better Emote Sizes').saveSettings();" style="display: inline-block; margin-left: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u"><div class="contents-4L4hQM">Save Settings</div></button></div>`;
	}
	
	resetSettings(fromSettings){
		this.initialSize = 32;
		this.initialSmallSize = 22;
		this.hoverSize = 96;
		this.hoverSmallSize = 66;
		if(fromSettings){
			$("#bes-initialSize")[0].value = 32;
			$("#bes-hoverSize")[0].value = 96;
			$("#bes-initialSmallSize")[0].value = 22;
			$("#bes-hoverSmallSize")[0].value = 66;
			this.saveSettings();
		}
	}
	
	saveSettings(){
		this.initialSize = $("#bes-initialSize")[0].value;
		this.hoverSize = $("#bes-hoverSize")[0].value;
		this.initialSmallSize = $("#bes-initialSmallSize")[0].value;
		this.hoverSmallSize = $("#bes-hoverSmallSize")[0].value;
		PluginUtilities.saveData("BetterEmoteSizes", "settings", { initialSize : this.initialSize, hoverSize : this.hoverSize, initialSmallSize : this.initialSmallSize, hoverSmallSize : this.hoverSmallSize });
		PluginUtilities.showToast("Settings saved!");
		this.update();
	}

    load() {}

    start(){
		var libraryScript = document.getElementById('zeresLibraryScript');
		if (!libraryScript) {
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
			libraryScript.setAttribute("id", "zeresLibraryScript");
			document.head.appendChild(libraryScript);
		}
		if (typeof window.ZeresLibrary !== "undefined") this.initialize();
		else libraryScript.addEventListener("load", () => { this.initialize(); });
	}
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/BetterEmoteSizes.plugin.js");
		this.resetSettings(false);
		var data = PluginUtilities.loadData("BetterEmoteSizes", "settings", { initialSize : this.initialSize, hoverSize : this.hoverSize, initialSmallSize : this.initialSmallSize, hoverSmallSize : this.hoverSmallSize });
		this.initialSize = data["initialSize"];
		this.hoverSize = data["hoverSize"];
		this.initialSmallSize = data["initialSmallSize"];
		this.hoverSmallSize = data["hoverSmallSize"];
		this.update();
	}
	
	onSwitch(){
		this.update();
		if($(".messages.scroller").length){
			this.messageObserver = new MutationObserver(e => { this.update(); });
			this.messageObserver.observe($(".messages.scroller")[0], { childList : true });
		}else if(this.messageObserver != null)
			this.messageObserver.disconnect();
	}
	onMessage(){ this.update(); }
	
	update(){
		var emotes = $(".emoji, .emote");
		for(var i = 0; i < emotes.length; i++){
			var emote = emotes[i], size = (emote.className.includes("jumboable") || emote.className.includes("emote") ? this.initialSize : this.initialSmallSize) + "px";
			emote.draggable = "true";
			emote.style.maxHeight = "";
			emote.style.width = size;
			emote.style.height = size;
			emote.style.transition = "all 0.5s";
		}
		emotes.on("mouseover", this.zoom);
		emotes.on("mouseout", this.unzoom);
	}
	
	zoom(){
		var plugin = BdApi.getPlugin("Better Emote Sizes"), size = (this.className.includes("jumboable") || this.className.includes("emote") ? plugin.hoverSize : plugin.hoverSmallSize) + "px";
		this.style.width = size;
		this.style.height = size;
	}
	
	unzoom(){
		var plugin = BdApi.getPlugin("Better Emote Sizes"), size = (this.className.includes("jumboable") || this.className.includes("emote") ? plugin.initialSize : plugin.initialSmallSize) + "px";
		this.style.width = size;
		this.style.height = size;
	}
	
    stop(){
		var emotes = $(".emoji, .emote");
		for(var i = 0; i < emotes.length; i++){
			var emote = emotes[i], size = (emote.className.includes("jumboable") || emote.className.includes("emote") ? 32 : 22) + "px";
			emote.style.transition = "";
			emote.style.width = size;
			emote.style.height = size;
		}
		emotes.off("mouseover", this.zoom);
		emotes.off("mouseout", this.unzoom);
		if(this.messageObserver != null)
			this.messageObserver.disconnect();
	}
	
}
