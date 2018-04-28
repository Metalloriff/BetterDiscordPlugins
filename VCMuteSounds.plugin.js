//META{"name":"VCMuteSounds"}*//

class VCMuteSounds {
	
	constructor(){
		this.muteSound = new Audio();
		this.unmuteSound = new Audio();
		this.checkDelay = 100;
		this.lastMuteCount = 0;
		this.switched = false;
		this.checkFunc;
	}
	
    getName() { return "Voice Chat Mute Sounds"; }
    getDescription() { return "Enables the mute and unmute sound for all users in a voice call when the server/group is selected."; }
    getVersion() { return "0.0.3"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		return "Volume:<br><input id='vcms-vol' type='number' min='0' max='100' value='" + (this.muteSound.volume * 100) + "'><br><br>Mute Sound:<br><input id='vcms-msc' type='text' value='" + this.muteSound.src + "'><br><br>Unmute Sound:<br><input id='vcms-usc' type='text' value='" + this.unmuteSound.src + "'><br><br>Update Delay (ms):<br><input id='vcms-delay' type='number' min='10' max='1000' value='" + this.checkDelay + "'><br><br><button onclick='BdApi.getPlugin('${this.getName()}').resetSettings();'>Reset Settings</button><br><br><button onclick='BdApi.getPlugin('${this.getName()}').saveSettings();'>Save & Update</button>"
	}
	
	saveSettings(){
		var msc = document.getElementById("vcms-msc").value, usc = document.getElementById("vcms-usc").value, vol = document.getElementById("vcms-vol").value / 100, delay = document.getElementById("vcms-delay").value;
		this.muteSound.src = msc;
		this.muteSound.volume = vol;
		this.unmuteSound.src = usc;
		this.unmuteSound.volume = vol;
		this.checkDelay = delay;
		PluginUtilities.saveData("VCMuteSounds", "settings", {volume : vol, muteSoundClip : msc, unmuteSoundClip : usc, checkDelay : delay});
		PluginUtilities.showToast("Settings saved!");
	}
	
	resetSettings(){
		if(document.getElementById("vcms-vol")){
			document.getElementById("vcms-vol").value = 50;
			document.getElementById("vcms-msc").value = "https://discordapp.com/assets/e4d539271704b87764dc465b1a061abd.mp3";
			document.getElementById("vcms-usc").value = "https://discordapp.com/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3";
			document.getElementById("vcms-delay").value = 100;
			PluginUtilities.showToast("Settings reset to defaults!");
			this.saveSettings();
			return;
		}
		this.muteSound.volume = 0.5;
		this.muteSound.src = "https://discordapp.com/assets/e4d539271704b87764dc465b1a061abd.mp3";
		this.unmuteSound.volume = 0.5;
		this.unmuteSound.src = "https://discordapp.com/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3";
		this.checkDelay = 100;
	}

    start() {
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
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/VCMuteSounds.plugin.js");
		this.muteSound = new Audio();
		this.unmuteSound = new Audio();
		this.resetSettings();
		var data = PluginUtilities.loadData("VCMuteSounds", "settings", {volume : 0.5, muteSoundClip : "https://discordapp.com/assets/e4d539271704b87764dc465b1a061abd.mp3",
			unmuteSoundClip : "https://discordapp.com/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3", checkDelay : 100});
		this.lastMuteCount = 0;
		this.muteSound.src = data["muteSoundClip"];
		this.muteSound.volume = data["volume"]
		this.unmuteSound.src = data["unmuteSoundClip"];
		this.unmuteSound.volume = data["volume"];
		this.checkDelay = data["checkDelay"];
		this.check();
	}
	
	onSwitch(){
		this.switched = true;
	}
	
	check(){
		var selectedVoiceChannel = document.getElementsByClassName("wrapperSelectedVoice-1Q1ocJ wrapper-fDmxzK")[0], muteCount = document.getElementsByClassName("callAvatarStatus-3y6S04").length;
		if(selectedVoiceChannel != null || muteCount > 0){
			if(selectedVoiceChannel != null)
				muteCount = selectedVoiceChannel.parentElement.getElementsByClassName("iconSpacing-3jB4W5").length;
			if(this.switched == false){
				if(muteCount > this.lastMuteCount)
					this.muteSound.play();
				if(muteCount < this.lastMuteCount)
					this.unmuteSound.play();
			}
		}
		this.lastMuteCount = muteCount;
		this.switched = false;
		this.checkFunc = setTimeout(e => { this.check(e); }, this.checkDelay);
	}
	
    stop() {
		clearTimeout(this.checkFunc);
	}
	
}
