//META{"name":"VoiceChatNotifications"}*//

class VoiceChatNotifications {
	
	constructor() {
		
        this.defaultSettings = {
            logConnections : true,
            logMutes : true,
            logDeafens : true,
            displayWhileFocused : false,
            displayUpdateNotes : true
        };

	}
	
    getName() { return "Voice Chat Notifications"; }
    getDescription() { return "Displays notifications when users connect to/disconnect from, mute/unmute themselves, and deafen/undeafen themselves in the voice channel you're in."; }
    getVersion() { return "1.0.1"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
            "1.0.1" : 
            `
                Redid the plugin entirely. It will now work when the server is not selected, like it should've in the first place.
            `
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

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleGroup("vcn-toggles", "Settings", [
                { title : "Display notifications on user connect/disconnect", value : "logConnections", setValue : this.settings.logConnections },
                { title : "Display notificaitons on user mute/unmute", value : "logMutes", setValue : this.settings.logMutes },
                { title : "Display notifications on user deafen/undeafen", value : "logDeafens", setValue : this.settings.logDeafens },
                { title : "Display notifications while Discord is focused", value : "displayWhileFocused", setValue : this.settings.displayWhileFocused }
            ], choice => {
                this.settings[choice.value] = !this.settings[choice.value];
                this.saveSettings();
            }), this.getName());

            Metalloriff.Settings.pushChangelogElements(this);

        }, 0);

        return `${Metalloriff.Settings.Elements.pluginNameLabel(this.getName())}`;

    }

    saveSettings() { PluginUtilities.saveSettings("VoiceChatNotifications", this.settings); }
	
	initialize() {
        
        this.settings = PluginUtilities.loadSettings("VoiceChatNotifications", this.defaultSettings);

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/VoiceChatNotifications.plugin.js");

		var lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://www.dropbox.com/s/cxhekh6y9y3wqvo/NeatoBurritoLibrary.js?raw=1");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			document.head.appendChild(lib);
        }
        if(typeof window.Metalloriff !== "undefined") this.onLibLoaded();
        else lib.addEventListener("load", () => { this.onLibLoaded(); });
		
	}

	onLibLoaded() {

        let getVoiceStates = InternalUtilities.WebpackModules.findByUniqueProperties(["getVoiceState"]).getVoiceStates,
            getUser = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]).getUser,
            getChannel = InternalUtilities.WebpackModules.findByUniqueProperties(["getChannel"]).getChannel;
        
        let lastStates = {};

        let localUser = PluginUtilities.getCurrentUser();

        this.update = setInterval(() => {

            if(!this.settings.displayWhileFocused && this.focused) return;
        
            let currentCall = Metalloriff.getSelectedVoiceChannel();

            if(currentCall == undefined) return;
            
            let newStates = getVoiceStates(currentCall.guild_id);

            for(let id in newStates) {

                if(localUser.id == id) continue;

                if(lastStates[id] == undefined) {
                    if(!this.settings.logConnections) continue;
                    let user = getUser(id), channel = getChannel(newStates[id].channelId);
                    if(user && channel) new Notification(`${user.username} joined ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                } else {

                    if(this.settings.logDeafens && lastStates[id].selfDeaf != newStates[id].selfDeaf) {

                        let user = getUser(id), channel = getChannel(newStates[id].channelId);

                        if(user && channel) {
                            if(newStates[id].selfDeaf) new Notification(`${user.username} deafened`, { silent : true, icon : user.getAvatarURL() });
                            else new Notification(`${user.username} undeafened`, { silent : true, icon : user.getAvatarURL() });
                        }

                        continue;

                    }

                    if(this.settings.logMutes && lastStates[id].selfMute != newStates[id].selfMute) {

                        let user = getUser(id), channel = getChannel(newStates[id].channelId);

                        if(user && channel) {
                            if(newStates[id].selfMute) new Notification(`${user.username} muted`, { silent : true, icon : user.getAvatarURL() });
                            else new Notification(`${user.username} unmuted`, { silent : true, icon : user.getAvatarURL() });
                        }

                    }

                }

            }

            for(let id in lastStates) {

                if(localUser.id == id || !this.settings.logConnections) continue;

                if(newStates[id] == undefined && id != localUser.id) {
                    let user = getUser(id), channel = getChannel(lastStates[id].channelId);
                    if(user && channel) new Notification(`${user.username} left ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                }

            }

            lastStates = newStates;

        }, 500);

        this.focused = true;

        $(window).on("focus.VCN", () => this.focused = true);
        $(window).on("blur.VCN", () => this.focused = false);

    }
	
    stop() {

        clearInterval(this.update);

        $(window).off("focus.VCN");
        $(window).off("blur.VCN");

	}
	
}
