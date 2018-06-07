//META{"name":"SelectedChannelNotifications"}*//

class SelectedChannelNotifications {
	
    getName() { return "Selected Channel Notifications"; }
    getDescription() { return "Plays a sound and displays a notification (both optional) when Discord is minimized and a message is received in the selected channel."; }
    getVersion() { return "0.1.3"; }
    getAuthor() { return "Metalloriff"; }

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

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createTextField("Message notification sound", "text", this.settings.messageSound, e => {
                this.settings.messageSound = e.target.value;
                this.saveSettings();
            }), this.getName());

            Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleGroup("scn-toggles", "", [
                { title : "Play sound on message", value : "playSound", setValue : this.settings.playSound },
                { title : "Display notification on message", value : "displayNotification", setValue : this.settings.displayNotification }
            ], choice => {
                this.settings[choice.value] = !this.settings[choice.value];
                this.saveSettings();
            }), this.getName());

		}, 0);

        return Metalloriff.Settings.Elements.pluginNameLabel(this.getName());
        
	}
	
	saveSettings() {

        PluginUtilities.saveSettings("SelectedChannelNotifications", this.settings);
        
        this.onSwitch();

	}
	
	initialize() {

        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SelectedChannelNotifications.plugin.js");

        this.audio = new Audio();

        this.notifications = [];

        this.settings = PluginUtilities.loadSettings("SelectedChannelNotifications", {
            messageSound : "https://discordapp.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3",
            playSound : true,
            displayNotification : true
        });

        this.channelModule = DiscordModules.ChannelStore;
        this.notificationSettingsModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getChannelMessageNotifications"]);
        this.volumeModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getOutputVolume"]);
        
        this.focused = true;

        this.focus = () => {
            this.focused = true;
            for(let i = 0; i < this.notifications.length; i++) this.notifications[i].close();
        };
        this.unfocus = () => this.focused = false;

        this.messageObserver = new MutationObserver(mutations => {
            for(let i = 0; i < mutations.length; i++) {
                if(mutations[i].addedNodes && mutations[i].addedNodes[0] && mutations[i].addedNodes[0].classList.contains("message-group")) {
                    this.onMessageReceived();
                }
            }
        });

        window.addEventListener("focus", this.focus);
        window.addEventListener("blur", this.unfocus);

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

        this.initialized = true;

        this.onSwitch();

    }

    onSwitch() {

        if(!this.initialized) return;

        this.currentGuild = PluginUtilities.getCurrentServer();
        let messageScroller = document.getElementsByClassName("messages scroller")[0], selectedChannel = document.getElementsByClassName("wrapperSelectedText-3dSUjC")[0];

        this.messageObserver.disconnect();

        if(this.currentGuild == undefined || messageScroller == undefined || selectedChannel == undefined) return;

        this.currentChannel = ReactUtilities.getOwnerInstance(selectedChannel).props.channel;

        if(this.currentChannel == undefined || this.notificationSettingsModule.getChannelMessageNotifications(this.currentGuild.id, this.currentChannel.id) == 0) return;

        this.audio.src = this.settings.messageSound;
        this.audio.volume = this.volumeModule.getOutputVolume() / 100;

        this.messageObserver.observe(messageScroller, { childList : true });

    }

    onMessageReceived() {

        if(!this.focused && Metalloriff.getLocalStatus() != "dnd") {

            let messages = document.getElementsByClassName("message-group"),
            latestMessageGroupMessages = ReactUtilities.getOwnerInstance(messages[messages.length - 1]).props.messages,
            latestMessage = latestMessageGroupMessages[latestMessageGroupMessages.length - 1];

            if(latestMessage.author.id != PluginUtilities.getCurrentUser().id && latestMessage.mentioned == false) {

                if(this.settings.displayNotification == true) {

                    let notif = new Notification((latestMessage.nick == undefined ? latestMessage.author.username : latestMessage.nick) + " - #" + this.currentChannel.name, { silent : true, body : latestMessage.content, icon : latestMessage.author.getAvatarURL() });

                    let idx = this.notifications.push(notif) - 1;

                    notif.onclose = () => this.notifications.splice(idx, 1);

                }

                if(this.settings.playSound == true) this.audio.play();

            }

        }

    }
	
    stop() {

        if(this.messageObserver != undefined) this.messageObserver.disconnect();

        window.removeEventListener("focus", this.focus);
        window.removeEventListener("blur", this.unfocus);

    }
	
}
