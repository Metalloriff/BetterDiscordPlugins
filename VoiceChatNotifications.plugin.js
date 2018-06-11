//META{"name":"VoiceChatNotifications"}*//

class VoiceChatNotifications {
	
	constructor() {
		
        this.defaultSettings = {
            logConnections : true,
            logMutes : true,
            logDeafens : true,
            logMoves : true,
            logServerMuteDeaf : true,
            displayWhileFocused : true,
            displayUpdateNotes : true,
            suppressInDnd : true
        };

	}
	
    getName() { return "VoiceChatNotifications"; }
    getDescription() { return "Displays notifications when users connect to/disconnect from, mute/unmute themselves, and deafen/undeafen themselves in the voice channel you're in. Press Alt + V to open the voice log."; }
    getVersion() { return "2.2.3"; }
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
            `,
            "1.1.3" :
            `
                Changes are now logged while in DnD, without notifications, if suppressed.
                Added a server mute and deafen setting.
            `,
            "1.2.3" :
            `
                Updated the plugin from Zere's lib to only depend on my lib.
                The plugin name was changed. This will require you to re-enable the plugin.
            `
		};
	}

    load() {}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");
			document.head.appendChild(lib);
		}
        if(typeof window.Metalloriff !== "undefined") libLoadedEvent();
        else lib.addEventListener("load", libLoadedEvent);

    }
    
    getSettingsPanel() {

        setTimeout(() => {

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("vcn-toggles", "Settings", [
                { title : "Display notifications on user connect/disconnect", value : "logConnections", setValue : this.settings.logConnections },
                { title : "Display notificaitons on user mute/unmute", value : "logMutes", setValue : this.settings.logMutes },
                { title : "Display notifications on user deafen/undeafen", value : "logDeafens", setValue : this.settings.logDeafens },
                { title : "Display notifications on user move", value : "logMoves", setValue : this.settings.logMoves },
                { title : "Display notifications on user server mute/deafen", value : "logServerMuteDeaf", setValue : this.settings.logServerMuteDeaf },
                { title : "Display notifications while Discord is focused", value : "displayWhileFocused", setValue : this.settings.displayWhileFocused },
                { title : "Suppress notifications while in do not disturb", value : "suppressInDnd", setValue : this.settings.suppressInDnd }
            ], choice => {
                this.settings[choice.value] = !this.settings[choice.value];
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushChangelogElements(this);

        }, 0);

        return `${NeatoLib.Settings.Elements.pluginNameLabel(this.getName())}`;

    }

    saveSettings() { NeatoLib.Settings.save(this); }

	onLibLoaded() {
        
        this.settings = NeatoLib.Settings.load(this, this.defaultSettings);

        NeatoLib.Updates.check(this);

        if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

        this.log = [];

        let getVoiceStates = NeatoLib.Modules.get(["getVoiceState"]).getVoiceStates,
            getUser = NeatoLib.Modules.get(["getUser"]).getUser,
            getChannel = NeatoLib.Modules.get(["getChannel"]).getChannel;
        
        let lastStates = {};

        let localUser = NeatoLib.getLocalUser();

        this.update = setInterval(() => {

            if(!this.settings.displayWhileFocused && this.focused) return;
        
            let currentCall = NeatoLib.getSelectedVoiceChannel();

            if(currentCall == undefined) return;
            
            let newStates = getVoiceStates(currentCall.guild_id);

            for(let id in newStates) {

                if(localUser.id == id) continue;

                if(lastStates[id] == undefined) {
                    if(!this.settings.logConnections) continue;
                    let user = getUser(id), channel = getChannel(newStates[id].channelId);
                    if(user && channel) {
                        if(!this.settings.suppressInDnd || NeatoLib.getLocalStatus() != "dnd") new Notification(`${user.username} joined ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                        this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : `Joined ${channel.name}` });
                    }
                } else {

                    if(this.settings.logMoves && lastStates[id].channelId != newStates[id].channelId) {

                        let user = getUser(id), channel = getChannel(newStates[id].channelId);

                        if(user && channel) {
                            if(!this.settings.suppressInDnd || NeatoLib.getLocalStatus() != "dnd") new Notification(`${user.username} moved to ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                            this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : `Moved to ${channel.name}` });
                        }

                        continue;

                    }

                    if(this.settings.logServerMuteDeaf && lastStates[id].deaf != newStates[id].deaf) {
                        
                        let user = getUser(id);

                        if(user) {
                            if(!this.settings.suppressInDnd || NeatoLib.getLocalStatus() != "dnd") new Notification(`${user.username} ${newStates[id].deaf ? "server deafened" : "server undeafened"}`, { silent : true, icon : user.getAvatarURL() });
                            this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : newStates[id].deaf ? "Server deafened" : "Server undeafened" });
                        }

                        continue;

                    }

                    if(this.settings.logServerMuteDeaf && lastStates[id].mute != newStates[id].mute) {
                        
                        let user = getUser(id);

                        if(user) {
                            if(!this.settings.suppressInDnd || NeatoLib.getLocalStatus() != "dnd") new Notification(`${user.username} ${newStates[id].mute ? "server muted" : "server unmuted"}`, { silent : true, icon : user.getAvatarURL() });
                            this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : newStates[id].mute ? "Server muted" : "Server unmuted" });
                        }

                        continue;

                    }

                    if(this.settings.logDeafens && lastStates[id].selfDeaf != newStates[id].selfDeaf) {

                        let user = getUser(id);

                        if(user) {
                            if(!this.settings.suppressInDnd || NeatoLib.getLocalStatus() != "dnd") new Notification(`${user.username} ${newStates[id].selfDeaf ? "deafened" : "undeafened"}`, { silent : true, icon : user.getAvatarURL() });
                            this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : newStates[id].selfDeaf ? "Deafened" : "Undeafened" });
                        }

                        continue;

                    }

                    if(this.settings.logMutes && lastStates[id].selfMute != newStates[id].selfMute) {

                        let user = getUser(id);

                        if(user) {
                            if(!this.settings.suppressInDnd || NeatoLib.getLocalStatus() != "dnd") new Notification(`${user.username} ${newStates[id].selfMute ? "muted" : "unmuted"}`, { silent : true, icon : user.getAvatarURL() });
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
                        if(!this.settings.suppressInDnd || NeatoLib.getLocalStatus() != "dnd") new Notification(`${user.username} left ${channel.name}`, { silent : true, icon : user.getAvatarURL() });
                        this.log.push({ avatar : user.getAvatarURL(), username : user.username, timestamp : new Date().toLocaleTimeString(), text : `Left ${channel.name}` });
                    }
                }

            }

            lastStates = newStates;

        }, 500);

        this.focused = true;

        this.focus = () => this.focused = true;
        this.unfocus = () => this.focused = false;

        window.addEventListener("focus", this.focus);
        window.addEventListener("blur", this.unfocus);

        this.onKeyDown = e => {

            if(e.altKey && e.key == "v") {

                if(document.getElementById("vcn-log")) return;

                let list = NeatoLib.UI.createBasicScrollList("vcn-log", "Voice Notification Log", { width : 400, height : 500 });

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
        
        NeatoLib.Events.onPluginLoaded(this);

    }
	
    stop() {

        clearInterval(this.update);

        if(this.focus && this.unfocus) {
            window.removeEventListener("focus", this.focus);
            window.removeEventListener("blur", this.unfocus);
        }

        if(this.onKeyDown) document.removeEventListener("keydown", this.onKeyDown);

        this.ready = false;

	}
	
}
