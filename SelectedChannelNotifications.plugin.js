//META{"name":"SelectedChannelNotifications","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/SelectedChannelNotifications.plugin.js"}*//

class SelectedChannelNotifications {
	
    getName() { return "Selected Channel Notifications"; }
    getDescription() { return "Plays a sound and displays a notification (both optional) when Discord is minimized and a message is received in the selected channel."; }
    getVersion() { return "0.1.6"; }
    getAuthor() { return "Metalloriff"; }

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
			messageSound: { label: "Message notification sound", type: "string" },
			playSound: { label: "Play sound on message", type: "bool" },
			displayNotification: { label: "Display notification on message", type: "bool" }
		};
	}

	get defaultSettings() {
		return {
            messageSound : "https://discordapp.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3",
            playSound : true,
            displayNotification : true
        };
	}
	
	getSettingsPanel() {
		return NeatoLib.Settings.createPanel(this);
	}
	
	saveSettings() {
		NeatoLib.Settings.save(this);
		this.audio.src = this.settings.messageSound;
		this.audio.volume = this.volumeModule.getOutputVolume() / 200;
	}
	
	onLibLoaded() {
		NeatoLib.Updates.check(this);

		this.channelModule = NeatoLib.Modules.get("getChannel");
		this.notificationSettingsModule = NeatoLib.Modules.get("getChannelMessageNotifications");
		this.volumeModule = NeatoLib.Modules.get("getOutputVolume");

		NeatoLib.Settings.load(this);

		this.audio = new Audio();

		this.audio.src = this.settings.messageSound;
		this.audio.volume = this.volumeModule.getOutputVolume() / 200;

		this.notifications = [];

		this.focused = true;
		
		window.addEventListener("focus", this.focus = () => {
			this.focused = true;
			for (let i = 0; i < this.notifications.length; i++) this.notifications[i].close();
		});

		window.addEventListener("blur", this.unfocus = () => {
			this.focused = false;
		});

		NeatoLib.Events.attach("message", this.msgRec = () => this.onMessageReceived());

		NeatoLib.Events.onPluginLoaded(this);
    }

    onMessageReceived() {
		if (!this.focused && NeatoLib.getLocalStatus() != "dnd") {
			const messages = document.getElementsByClassName(NeatoLib.getClass("containerCozy", "container")),
				lastGroup = NeatoLib.ReactData.getProps(messages[messages.length - 1]).messages,
				lastMsg = lastGroup[lastGroup.length - 1];
			
			if (lastMsg.author.id != NeatoLib.getLocalUser().id && !lastMsg.mentioned) {
				if (this.settings.displayNotification) {
					const n = new Notification(
						(!lastMsg.nick ? lastMsg.author.username : lastMsg.nick) + " - #" + NeatoLib.getSelectedTextChannel().name, {
							silent: true,
							body: lastMsg.content,
							icon: lastMsg.author.getAvatarURL()
						}
					);

					const i = this.notifications.push(n) - 1;

					n.onclose = () => this.notifications.splice(i, 1);
				}

				if (this.settings.playSound) this.audio.play();
			}
		}
    }
	
    stop() {
		window.removeEventListener("focus", this.focus);
		window.removeEventListener("blur", this.unfocus);

		NeatoLib.Events.detach("message", this.msgRec);
    }
	
}
