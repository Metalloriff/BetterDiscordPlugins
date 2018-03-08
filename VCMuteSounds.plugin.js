//META{"name":"VCMuteSounds"}*//

class VCMuteSounds {
	
    getName() { return "Voice Chat Mute Sounds"; }
    getDescription() { return "Enables the mute and unmute sound for all users in a voice call when the server/group is selected."; }
    getVersion() { return "0.0.1"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		return "Volume:<br><input id='vcms-vol' type='number' min='0' max='100' value='" + (VCMuteSounds.muteSound.volume * 100) + "'><br><br>Mute Sound:<br><input id='vcms-msc' type='text' value='" + VCMuteSounds.muteSound.src + "'><br><br>Unmute Sound:<br><input id='vcms-usc' type='text' value='" + VCMuteSounds.unmuteSound.src + "'><br><br>Update Delay (ms):<br><input id='vcms-delay' type='number' min='10' max='1000' value='" + VCMuteSounds.checkDelay + "'><br><br><button onclick='VCMuteSounds.resetSettings();'>Reset Settings</button><br><br><button onclick='VCMuteSounds.saveSettings();'>Save & Update</button>"
	}
	
	static saveSettings(){
		var msc = document.getElementById("vcms-msc").value, usc = document.getElementById("vcms-usc").value, vol = document.getElementById("vcms-vol").value / 100, delay = document.getElementById("vcms-delay").value;
		VCMuteSounds.muteSound.src = msc;
		VCMuteSounds.muteSound.volume = vol;
		VCMuteSounds.unmuteSound.src = usc;
		VCMuteSounds.unmuteSound.volume = vol;
		VCMuteSounds.checkDelay = delay;
		PluginUtilities.saveData("VCMuteSounds", "settings", {volume : vol, muteSoundClip : msc, unmuteSoundClip : usc, checkDelay : delay});
		PluginUtilities.showToast("Settings saved!");
	}
	
	static resetSettings(){
		if(document.getElementById("vcms-vol")){
			document.getElementById("vcms-vol").value = 50;
			document.getElementById("vcms-msc").value = "https://discordapp.com/assets/e4d539271704b87764dc465b1a061abd.mp3";
			document.getElementById("vcms-usc").value = "https://discordapp.com/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3";
			document.getElementById("vcms-delay").value = 100;
			PluginUtilities.showToast("Settings reset to defaults!");
			VCMuteSounds.saveSettings();
			return;
		}
		VCMuteSounds.muteSound.volume = 0.5;
		VCMuteSounds.muteSound.src = "https://discordapp.com/assets/e4d539271704b87764dc465b1a061abd.mp3";
		VCMuteSounds.unmuteSound.volume = 0.5;
		VCMuteSounds.unmuteSound.src = "https://discordapp.com/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3";
		VCMuteSounds.checkDelay = 100;
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
		VCMuteSounds.muteSound = new Audio();
		VCMuteSounds.unmuteSound = new Audio();
		VCMuteSounds.resetSettings();
		var data = PluginUtilities.loadData("VCMuteSounds", "settings", {volume : 0.5, muteSoundClip : "https://discordapp.com/assets/e4d539271704b87764dc465b1a061abd.mp3",
			unmuteSoundClip : "https://discordapp.com/assets/5a000a0d4dff083d12a1d4fc2c7cbf66.mp3", checkDelay : 100});
		VCMuteSounds.lastMuteCount = 0;
		VCMuteSounds.muteSound.src = data["muteSoundClip"];
		VCMuteSounds.muteSound.volume = data["volume"]
		VCMuteSounds.unmuteSound.src = data["unmuteSoundClip"];
		VCMuteSounds.unmuteSound.volume = data["volume"];
		VCMuteSounds.checkDelay = data["checkDelay"];
		VCMuteSounds.check();
	}
	
	onSwitch(){
		VCMuteSounds.switched = true;
	}
	
	static check(){
		var muteCount = document.getElementsByClassName("iconSpacing-1WJZFe").length + document.getElementsByClassName("callAvatarStatus-2ybelh").length;
		if(VCMuteSounds.switched == false){
			if(muteCount > VCMuteSounds.lastMuteCount)
				VCMuteSounds.muteSound.play();
			if(muteCount < VCMuteSounds.lastMuteCount)
				VCMuteSounds.unmuteSound.play();
		}
		VCMuteSounds.lastMuteCount = muteCount;
		VCMuteSounds.switched = false;
		VCMuteSounds.checkFunc = setTimeout(VCMuteSounds.check, VCMuteSounds.checkDelay);
	}
	
    stop() {
		clearTimeout(VCMuteSounds.checkFunc);
	}
	
}
