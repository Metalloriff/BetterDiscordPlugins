//META{"name":"NateUtilities"}*//

class NateUtilities {
	
    getName() { return "NateUtilities"; }
    getDescription() { return "For all of your ear and brain saving needs! If you don't know what this plugin is, it's not for you, just ignore it."; }
    getVersion() { return "0.0.1"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			
		};
	}

    load() {}

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

	getSettingsPanel() {

		setTimeout(() => {

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createKeybindInput("local mute nate", this.settings.muteHotkey, newKey => {
                this.unregisterKeybinds();
                if(newKey) {
                    this.settings.muteHotkey = newKey;
                    this.registerKeybinds();
                    this.saveSettings();
                } else PluginUtilities.showToast("You did not input anything!", { type : "error" });
            }, { description : "For when your ears and/or brain need a break.", global : true }), this.getName());

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createKeybindInput("server mute nate", this.settings.serverMuteHotkey, newKey => {
                this.unregisterKeybinds();
                if(newKey) {
                    this.settings.serverMuteHotkey = newKey;
                    this.registerKeybinds();
                    this.saveSettings();
                } else PluginUtilities.showToast("You did not input anything!", { type : "error" });
            }, { description : "For when you feel like being a hero.", global : true }), this.getName());

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createKeybindInput("server deafen nate", this.settings.serverDeafenHotkey, newKey => {
                this.unregisterKeybinds();
                if(newKey) {
                    this.settings.serverDeafenHotkey = newKey;
                    this.registerKeybinds();
                    this.saveSettings();
                } else PluginUtilities.showToast("You did not input anything!", { type : "error" });
            }, { description : "For when you need to talk behind Nate's back.", global : true }), this.getName());

            Metalloriff.Settings.pushChangelogElements(this);

		}, 0);

		return Metalloriff.Settings.Elements.pluginNameLabel(this.getName());
		
	}

	saveSettings() {
		PluginUtilities.saveSettings(this.getName(), this.settings);		
	}
	
	initialize() {

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/NateUtilities.plugin.js");
		
		this.settings = PluginUtilities.loadSettings(this.getName(), {
            displayUpdateNotes : true,
            muteHotkey : "Alt + N",
            serverMuteHotkey : "Shift + Alt + N",
            serverDeafenHotkey : "Control + Alt + N"
		});

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");
			document.head.appendChild(lib);
		}
        if(typeof window.Metalloriff !== "undefined") this.onLibLoaded();
		else lib.addEventListener("load", () => { this.onLibLoaded(); });
		
    }

	onLibLoaded() {

        Metalloriff.onPluginLoaded(this);
		
        //if(this.settings.displayUpdateNotes) Metalloriff.Changelog.compareVersions(this.getName(), this.getChanges());
        
        this.registerKeybinds();

        this.initialized = true;

        this.onSwitch();

    }
    
    onSwitch() {

        if(!this.initialized) return;

        this.selectedServer = PluginUtilities.getCurrentServer();
        this.selectedVoiceChannel = Metalloriff.getSelectedVoiceChannel();

    }
    
    registerKeybinds() {

        let nate = "209024642697003008",
        toggleLocalMute = InternalUtilities.WebpackModules.findByUniqueProperties(["toggleLocalMute"]).toggleLocalMute,
        isLocalMuted = InternalUtilities.WebpackModules.findByUniqueProperties(["isLocalMute"]).isLocalMute,
        serverActionModule = InternalUtilities.WebpackModules.findByUniqueProperties(["setServerMute", "setServerDeaf"]),
        getVoiceStates = InternalUtilities.WebpackModules.findByUniqueProperties(["getVoiceStates"]).getVoiceStates;

        Metalloriff.Keybinds.registerGlobal(this.settings.muteHotkey, () => {
            toggleLocalMute(nate);
            if(isLocalMuted(nate)) PluginUtilities.showToast("I got ya, fam!", { type : "success" });
            else PluginUtilities.showToast("You're gonna regret that.", { type : "error" });
        });

        Metalloriff.Keybinds.registerGlobal(this.settings.serverMuteHotkey, () => {
            
            if(this.selectedServer && this.selectedVoiceChannel) {

                let voiceStates = getVoiceStates(this.selectedServer.id);

                if(voiceStates[nate] == undefined) {
                    PluginUtilities.showToast("Nate is not here, you're safe!", { type : "success" });
                    return;
                }

                serverActionModule.setServerMute(this.selectedServer.id, nate, !voiceStates[nate].mute);

                if(!voiceStates[nate].mute) PluginUtilities.showToast("You should be proud!", { type : "success" });
                else PluginUtilities.showToast("Sick fuck!", { type : "error" });

            }

        });

        Metalloriff.Keybinds.registerGlobal(this.settings.serverDeafenHotkey, () => {

            if(this.selectedServer && this.selectedVoiceChannel) {

                let voiceStates = getVoiceStates(this.selectedServer.id);

                if(voiceStates[nate] == undefined) {
                    PluginUtilities.showToast("Nate is not here, you're safe!", { type : "success" });
                    return;
                }

                serverActionModule.setServerDeaf(this.selectedServer.id, nate, !voiceStates[nate].deaf);

                if(!voiceStates[nate].deaf) PluginUtilities.showToast("That Nate kid is an idiot.", { type : "success" });
                else PluginUtilities.showToast("Shut up guys!", { type : "error" });

            }

        });

    }

    unregisterKeybinds() {
        Metalloriff.Keybinds.unregisterGlobal(this.settings.muteHotkey);
        Metalloriff.Keybinds.unregisterGlobal(this.settings.serverMuteHotkey);
        Metalloriff.Keybinds.unregisterGlobal(this.settings.serverDeafenHotkey);
    }
	
    stop() {
        this.unregisterKeybinds();
	}
	
}