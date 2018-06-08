//META{"name":"VoiceChatNotifications"}*//

class VoiceChatNotifications {
	
	constructor() {
		
        this.defaultSettings = {
            logConnections : true,
            logMutes : true,
            logDeafens : true,
            logMoves : true,
            displayWhileFocused : false,
            displayUpdateNotes : true,
            suppressInDnd : true
        };

	}
	
    getName() { return "Voice Chat Notifications"; }
    getDescription() { return "Displays notifications when users connect to/disconnect from, mute/unmute themselves, and deafen/undeafen themselves in the voice channel you're in. Press Alt + V to open the voice log."; }
    getVersion() { return "1.1.2"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
            "1.0.1" : 
            `
                Redid the plugin entirely. It will now work when the server is not selected, like it should've in the first place.
            `,
            "1.1.1" :
            `
                Added a display notifications on user move setting and feature.
                Added a suppress notifications in do not disturb setting.
                Added a voice notification log. (Alt + V)
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
                { title : "Display notifications on user move", value : "logMoves", setValue : this.settings.logMoves },
                { title : "Display notifications while Discord is focused", value : "displayWhileFocused", setValue : this.settings.displayWhileFocused },
                { title : "Suppress notifications while in do not disturb", value : "suppressInDnd", setValue : this.settings.suppressInDnd }
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

        this.log = [];

        let getVoiceStates = InternalUtilities.WebpackModules.findByUniqueProperties(["getVoiceState"]).getVoiceStates,
            getUser = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]).getUser,
            getChannel = InternalUtilities.WebpackModules.findByUniqueProperties(["getChannel"]).getChannel;
        
        let lastStates = {};

        let localUser = PluginUtilities.getCurrentUser();

        this.update = setInterval(() => {

            if(!this.settings.displayWhileFocused && this.focused) return;

            if(this.settings.suppressInDnd && Metalloriff.getLocalStatus() == "dnd") return;
        
            let currentCall = Metalloriff.getSelectedVoiceChannel();

            if(currentCall == undefined) return;
            
            let newStates = getVoiceStates(currentCall.guild_id);

            for(let id in newStates) {

                if(localUser.id == id) continue;

                if(lastStates[id] == undefined) {
                    if(!this.settings.logConnections) continue;
                    let user = getUser(id), channel = getChannel(newStates[id].channelId);
                    if(user && channel) {
                        new Notification(`${user.username} joined ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                        this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : `Joined ${channel.name}` });
                    }
                } else {

                    if(this.settings.logMoves && lastStates[id].channelId != newStates[id].channelId) {

                        let user = getUser(id), channel = getChannel(newStates[id].channelId);

                        if(user && channel) {
                            new Notification(`${user.username} moved to ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                            this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : `Moved to ${channel.name}` });
                        }

                        continue;

                    }

                    if(this.settings.logDeafens && lastStates[id].selfDeaf != newStates[id].selfDeaf) {

                        let user = getUser(id);

                        if(user) {
                            new Notification(`${user.username} ${newStates[id].selfDeaf ? "deafened" : "undeafened"}`, { silent : true, icon : user.getAvatarURL() });
                            this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : newStates[id].selfDeaf ? "Deafened" : "Undeafened" });
                        }

                        continue;

                    }

                    if(this.settings.logMutes && lastStates[id].selfMute != newStates[id].selfMute) {

                        let user = getUser(id);

                        if(user) {
                            new Notification(`${user.username} ${newStates[id].selfMute ? "muted" : "unmuted"}`, { silent : true, icon : user.getAvatarURL() });
                            this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : newStates[id].selfMute ? "Muted" : "Unmuted" });
                        }

                    }

                }

            }

            for(let id in lastStates) {

                if(localUser.id == id || !this.settings.logConnections) continue;

                if(newStates[id] == undefined && id != localUser.id) {
                    let user = getUser(id), channel = getChannel(lastStates[id].channelId);
                    if(user && channel) {
                        new Notification(`${user.username} left ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                        this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : `Left ${channel.name}` });
                    }
                }

            }

            lastStates = newStates;

        }, 500);

        this.focused = true;

        $(window).on("focus.VCN", () => this.focused = true);
        $(window).on("blur.VCN", () => this.focused = false);

        this.onKeyDown = e => {

            if(e.altKey && e.key == "v") {

                let list = Metalloriff.UI.createBasicScrollList("vcn-log", "Voice Notification Log", { width : 400, height : 500 });

                if(this.log.length > 50) this.log.splice(50, this.log.length);

                for(let i = 0; i < this.log.length; i++) {
                    list.scroller.insertAdjacentHTML("afterbegin", `
                    
                    <div class="message-group hide-overflow">
                        <div class="avatar-large stop-animation" style="background-image: url(${this.log[i].avatar});"></div>
                        <div class="comment">
                            <div class="message">
                                <div class="body">
                                    <h2 class="old-h2"><span class="username-wrapper"><strong class="user-name" style="color: white">${this.log[i].username}</strong></span><span class="highlight-separator"> - </span><span class="timestamp">${this.log[i].timestamp}</span></h2>
                                    <div class="message-text">
                                        <div class="markup">${this.log[i].text}.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    `);
                }

            }

        };

        document.addEventListener("keydown", this.onKeyDown);

    }
	
    stop() {

        clearInterval(this.update);

        $(window).off("focus.VCN");
        $(window).off("blur.VCN");

        if(this.onKeyDown) document.removeEventListener("keydown", this.onKeyDown);

	}
	
}
