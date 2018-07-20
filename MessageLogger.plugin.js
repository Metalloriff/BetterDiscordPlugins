//META{"name":"MessageLogger","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/MessageLogger.plugin.js"}*//

class MessageLogger {
	
	getName() { return "MessageLogger"; }
	getDescription() { return "Records all sent messages, message edits and message deletions in the specified servers, all unmuted servers or all servers, and in direct messages."; }
	getVersion() { return "1.12.9"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			"1.10.7" :
			`
				You can now blacklist/whitelist channels.
				Added a "display deleted messages and message edit history in chat" setting.
				Links are now clickable in the log.
			`,
			"1.11.7" :
			`
				Added tooltips to deleted and edited chat messages.
				Fixed links in the log not being clickable.
				Links now show in edited chat messages.
				Mentions now show in the log and edited chat messages.
				Fixed edit history not being formatted in the log.
				Channel tags now show in the log and edited chat messages.
				Emojis now show in the log and edited chat messages.
				Fixed opening the log normally opening filtered after alt-tabbing from Discord. (Requires restart. Was a lib issue.)
				Using the keybinds while the log window is opened will now close it again.
				Fixed old edited and deleted messages not changing to the deleted/edited state in chat.
				Deleted and edited messages will now be deleted/edited as they do orginally, when the plugin is unloaded.
				Fixed only one image per message showing in the log.
				Added a "show amount of new deleted messages when entering a channel" setting, along with edited messages.
			`,
			"1.12.7" :
			`
				Fixed unread deleted/edited messages never being read.
				Deleted images and mentions are now grayed out unless hovered, making it obvious that they are deleted.
				Fixed bot messages being logged regardless of settings.
				Fixed the logger filling entirely upon clicking "load more". All I have to say about this bug, is please refer to this meme: <a href="https://i.imgur.com/x5bXdOq.png">https://i.imgur.com/x5bXdOq.png</a>
				You can now blacklist/whitelist DMs.
				Fixed muted channels always logging.
				Editing an edited message now sets to the correct message.
			`,
			"1.12.9" :
			`
				Fixed random crashes. Thanks Discord!
				Fixed edited and deleted messages not showing in DMs.
				Slight performance improvement.
			`
		};
	}

	load() {}

	start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);

	}

	getSettingsPanel() {

		setTimeout(() => {

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("ml-gen-toggles", "General settings", [
				{ title : "Ignore muted servers", value : "ignoreMutedGuilds", setValue : this.settings.ignoreMutedGuilds },
				{ title : "Ignore muted channels", value : "ignoreMutedChannels", setValue : this.settings.ignoreMutedChannels },
				{ title : "Ignore bots", value : "ignoreBots", setValue : this.settings.ignoreBots },
				{ title : "Ignore message posted by you", value : "ignoreSelf", setValue : this.settings.ignoreSelf },
				{ title : "Disable keybinds", value : "disableKeybind", setValue : this.settings.disableKeybind },
				{ title : "Display clear log button at the top of the log", value : "clearButtonOnTop", setValue : this.settings.clearButtonOnTop },
				{ title : "Cache all received images. (Attempted fix to show deleted images, disable this if you notice a decline in your internet speed)", value : "cacheAllImages", setValue : this.settings.cacheAllImages },
				{ title : "Display dates with timestamps", value : "displayDates", setValue : this.settings.displayDates },
				{ title : "Display deleted messages and message edit history in chat", value : "displayInChat", setValue : this.settings.displayInChat },
				{ title : "Show amount of new deleted messages when entering a channel", value : "showDeletedCount", setValue : this.settings.showDeletedCount },
				{ title : "Show amount of new edited messages when entering a channel", value : "showEditedCount", setValue : this.settings.showEditedCount }
			], choice => {
				this.settings[choice.value] = !this.settings[choice.value];
				if(choice.value == "disableKeybind") {
					this.unregisterKeybinds();
					this.registerKeybinds();
				}
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createRadioGroup("ml-sort-type", "Sort direction", [
				{ title : "New - old", value : true },
				{ title : "Old - new", value : false }
			], this.settings.reverseOrder, (choiceButton, choice) => {
				this.settings.reverseOrder = choice.value;
				this.saveSettings();
			}, "Hint: You can also click the selected tab to reverse the order direction."), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createRadioGroup("ml-visibility-type", "Log type", [
				{ title : "All", value : "all" },
				{ title : "Whitelist", value : "whitelist" },
				{ title : "Blacklist", value : "blacklist" }
			], this.settings.type, (choiceButton, choice) => {
				this.settings.type = choice.value;
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("ml-toast-toggles", "Display toast notifications for every", [
				{ title : "Message sent", value : "sent", setValue : this.settings.toastToggles.sent },
				{ title : "Message edited", value : "edited", setValue : this.settings.toastToggles.edited },
				{ title : "Message deleted", value : "deleted", setValue : this.settings.toastToggles.deleted }
			], choice => {
				this.settings.toastToggles[choice.value] = !this.settings.toastToggles[choice.value];
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Sent message cap", this.settings.cap, e => {
				if(isNaN(e.target.value)) return NeatoLib.showToast("Value must be a number!", "error");
				this.settings.cap = e.target.value;
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Saved message cap", this.settings.savedCap, e => {
				if(isNaN(e.target.value)) return NeatoLib.showToast("Value must be a number!", "error");
				this.settings.savedCap = e.target.value;
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Log loaded message cap", this.settings.renderCap, e => {
				if(isNaN(e.target.value)) return NeatoLib.showToast("Value must be a number!", "error");
				this.settings.renderCap = e.target.value;
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createKeybindInput("Open log", this.settings.openLogKeybind, newBind => {
				if(newBind) {
					this.unregisterKeybinds();
					this.settings.openLogKeybind = newBind;
					this.registerKeybinds();
					this.saveSettings();
				} else NeatoLib.showToast("Keybind empty!", "error");
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createKeybindInput("Open log filtered by selected channel", this.settings.openLogFilteredKeybind, newBind => {
				if(newBind) {
					this.unregisterKeybinds();
					this.settings.openLogFilteredKeybind = newBind;
					this.registerKeybinds();
					this.saveSettings();
				} else NeatoLib.showToast("Keybind empty!", "error");
			}), this.getName());

			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
		
	}
	
	saveSettings() {
		NeatoLib.Settings.save(this);
	}

	saveData() {
		this.updateMessages();
		NeatoLib.Data.save(this.getName() + "Data", "data", {
			deletedMessageRecord : this.deletedMessageRecord,
			editedMessageRecord : this.editedMessageRecord,
			purgedMessageRecord : this.purgedMessageRecord
		});
	}

	onLibLoaded() {

		if(!NeatoLib.hasRequiredLibVersion(this, "0.4.18")) return;

		NeatoLib.Updates.check(this);

		this.settings = NeatoLib.Settings.load(this, {
			displayUpdateNotes : true,
			ignoreMutedGuilds : true,
			ignoreMutedChannels : true,
			ignoreBots : true,
			ignoreSelf : false,
			cap : 1000,
			savedCap : 100,
			reverseOrder : true,
			type : "all",
			list : [],
			toastToggles : {
				sent : false,
				edited : true,
				deleted : true
			},
			desktopToggles : {
				sent : false,
				edited : false,
				deleted : false
			},
			disableKeybind : false,
			displayUpdateNotes : true,
			clearButtonOnTop : false,
			cacheAllImages : true,
			openLogKeybind : {
				primaryKey : "KeyM",
				modifiers : ["ControlLeft"]
			},
			openLogFilteredKeybind : {
				primaryKey : "KeyM",
				modifiers : ["ControlLeft", "AltLeft"]
			},
			renderCap : 15,
			displayDates : true,
			displayInChat : true,
			showDeletedCount : true,
			showEditedCount : true
		});

		this.style = NeatoLib.injectCSS(`
			.ml-item {
				padding: 10px;
			}

			.ml-label {
				color: white;
				font-size: 35px;
			}
			
			.ml-note {
				color: white;
				font-size: 25px;
				opacity: 0.75;
				line-height: 25px;
			}

			.ml-backdrop {
				opacity: 0.85;
				background-color: black;
				z-index: 1000;
				position: fixed;
				contain: strict;
				bottom: 0;
				left: 0;
				top: 0;
				right: 0;
			}

			.ml-scroller-wrapper {
				width: 800px;
				min-height: 800px;
				max-height: 800px;
				position: fixed;
				top: 50%;
				left: 50%;
				transform: translate(-50%, -50%);
				background: #2f3136;
				border-radius: 5px;
				z-index: 10000;
			}

			.ml-scroller {
				width: 100%;
				max-height: 663px;
				overflow-y: scroll;
				overflow-x: hidden;
			}

			#message-logger-window *::-webkit-scrollbar {
				max-width: 10px;
			}
			
			#message-logger-window *::-webkit-scrollbar-track-piece {
				background: transparent;
				border: none;
				border-radius: 5px;
			}
			
			#message-logger-window *:hover::-webkit-scrollbar-track-piece {
				background: #2F3136;
				border-radius: 5px;
			}
			
			#message-logger-window *::-webkit-scrollbar-thumb {
				background: #1E2124;
				border: none;
				border-radius: 5px;
			}
			
			#message-logger-window *::-webkit-scrollbar-button {
				display: none;
			}

			.ml-label {
				flex: 1 1 auto;
				text-align: center;
				color: white;
				padding-top: 10px;
				font-size: 20px;
			}
			
			.ml-tab-button {
				padding: 10px;
				background-color: rgba(0, 0, 0, 0.3);
				color: white;
				display: inline-block;
				border-radius: 5px;
				margin: 15px 10px;
				cursor: pointer;
				transition: all 0.3s;
				font-size: 15px;
			}

			.ml-tab-button:hover, .ml-filter-help-button:hover {
				background-color: rgba(150, 150, 150, 0.3);
			}

			.ml-tab-button.selected, ml-tab-button:active, .ml-filter-help-button:active {
				background-color: #7289da;
				transform: scale(1.1);
			}

			.ml-edit-timestamp {
				display: inline;
				margin-left: 15px;
				opacity: 0;
				transition: opacity 0.3s;
			}

			.markup:hover .ml-edit-timestamp {
				opacity: 1;
			}

			.ml-filter-field {
				background-color: rgba(0, 0, 0, 0.2);
				border: none;
				border-radius: 5px;
				height: 25px;
				line-height: 25px;
				width: 80%;
				margin-top: 10px;
				color: white;
				padding: 0px 5px;
			}

			.ml-label span {
				vertical-align: middle;
				marign-left: 10px;
			}

			.ml-filter-help-button {
				display: inline-block;
				background-color: rgba(0, 0, 0, 0.2);
				border: none;
				border-radius: 5px;
				height: 25px;
				line-height: 25px;
				width: 8%;
				margin-top: 10px;
				color: white;
				padding: 0px 5px;
				cursor: pointer;
				font-size: 15px;
				transition: all 0.3s;
			}

			.ml-scroller > :last-child {
				margin-bottom: 10px;
			}

			#app-mount .message.ml-deleted .markup {
				color: ${NeatoLib.Colors.DiscordDefaults.red};
			}

			.message.ml-deleted img, .message.ml-deleted .mention {
				transition: filter 0.3s;
			}

			.message.ml-deleted:not(:hover) img, .message.ml-deleted:not(:hover) .mention {
				filter: grayscale(100%);
			}

			#app-mount .message-text > .markup.ml-edited, #app-mount .markup > .ml-edited:not(:last-child) {
				color: rgba(255, 255, 255, 0.5);
			}
		`);

		this.regex = {
			mention : new RegExp("<@[0-9]+>"),
			channel : new RegExp("<#[0-9]+>"),
			emoji : new RegExp("<:[^\\s]+:[0-9]+>"),
			numbersOnly : new RegExp("[0-9]+")
		};

		this.registerKeybinds();

		let data = NeatoLib.Data.load(this.getName() + "Data", "data", {
			deletedMessageRecord : [],
			editedMessageRecord : [],
			purgedMessageRecord : []
		});

		this.messageRecord = [];
		this.deletedMessageRecord = data.deletedMessageRecord;
		this.editedMessageRecord = data.editedMessageRecord;
		this.purgedMessageRecord = data.purgedMessageRecord;

		this.getUser = NeatoLib.Modules.get("getUser").getUser;
		this.getServer = NeatoLib.Modules.get("getGuild").getGuild;
		this.getChannel = NeatoLib.Modules.get("getChannel").getChannel;

		this.openUserContextMenu = NeatoLib.Modules.get("openUserContextMenu").openUserContextMenu;

		this.muteModule = NeatoLib.Modules.get("isMuted");

		this.filter = "";

		document.addEventListener("contextmenu", this.contextEvent = e => {

			if(e.target.classList.contains("guild-icon")) return this.onGuildContext(e);

			if(e.target.parentElement.classList.contains("message-text")) return this.onMessageContext();

			const foundChannel = NeatoLib.DOM.searchForParentElementByClassName(e.target, NeatoLib.Modules.get("wrapperDefaultText").wrapper);
			let channel = foundChannel ? NeatoLib.ReactData.getProp(foundChannel.parentElement, "channel") : null;
			if(!channel) {
				const privateChannel = NeatoLib.DOM.searchForParentElementByClassName(e.target, "private");
				if(privateChannel) channel = NeatoLib.Modules.get("getChannel").getChannel(privateChannel.firstChild.href.match(/\d+/)[0]);
			}
			if(channel) return this.onChannelContext(channel);

		});

		this.helpMessage = 
		`
			Filter help:

			"server: <servername or serverid>" - Filter results with the specified server name or id.
			"channel: <channelname or channelid>" - Filter results with the specified channel name or id.
			"user: <username, nickname or userid>" - Filter results with the specified username, nickname or userid.
			"message: <search or messageid>" or "content: <search or messageid>" - Filter results with the specified message content.

			Separate the search tags with commas.
			Example: server: tom's bd stuff, message: heck


			Shortcut help:

			"Ctrl + M" (default) - Open message log.
			"Ctrl + Alt + M" (default) - Open message log with selected channel filtered.
			"Ctrl + S" - Saves a backup of the current logged messages.
			"Ctrl + O" - Opens file browser to load a backup.
		`;

		this.classes = NeatoLib.getClasses(["contextMenu"]);

		this.localUser = NeatoLib.getLocalUser();

		this.electron = require("electron");

		this.getMessage = NeatoLib.Modules.get(["getMessages", "getMessage"]).getMessage;

		this.transitionTo = NeatoLib.Modules.get("transitionTo").transitionTo;

		this.windowKeyEvent = e => {

			if(e.ctrlKey) {

				if(e.key == "s") {

					NeatoLib.UI.createTextPrompt("ml-save-backup-prompt", "Save backup file", (name, prompt) => {

						NeatoLib.Data.save(name, "data", {
							messageRecord : this.messageRecord,
							deletedMessageRecord : this.deletedMessageRecord,
							editedMessageRecord : this.editedMessageRecord,
							purgedMessageRecord : this.purgedMessageRecord
						});

						NeatoLib.showToast(`[${this.getName()}]: Backup saved as "${name}.config.json"`, "success");

						prompt.close();

					}, "ML_BackupData_" + new Date().toDateString().split(" ").join("_") + "_" + new Date().toLocaleTimeString().split(":").join("_").split(" ").join("_"), { placeholder : "Backup filename..." });

				}

				if(e.key == "o") {

					NeatoLib.browseForFile(file => {
						
						if(!file.name.endsWith(".config.json")) return NeatoLib.showToast(`[${this.getName()}]: This is not a correct backup data file`, "error");

						NeatoLib.UI.createPrompt("ml-load-backup-prompt", "Load backup file", "Are you sure you want to load from this backup? All current logged messages will be lost.", prompt => {

							let data = NeatoLib.Data.load(file.name.substring(0, file.name.indexOf(".")), "data");
	
							this.messageRecord = data.messageRecord;
							this.deletedMessageRecord = data.deletedMessageRecord;
							this.editedMessageRecord = data.editedMessageRecord;
							this.purgedMessageRecord = data.purgedMessageRecord;
	
							NeatoLib.showToast(`[${this.getName()}]: Backup file loaded`, "success");

							this.saveData();

							prompt.close();

						});

					});

				}

			}

		};

		this.prevented = [];

		this.deletedChatMessages = {};
		this.editedChatMessages = {};

		this.unpatchDispatch = NeatoLib.monkeyPatchInternal(NeatoLib.Modules.get("dispatch"), "dispatch", e => {

			const dispatch = e.args[0];

			if(!dispatch) return e.callDefault();

			try {

				if(dispatch.type != "MESSAGE_CREATE" && dispatch.type != "MESSAGE_DELETE" && dispatch.type != "MESSAGE_DELETE_BULK" && dispatch.type != "MESSAGE_UPDATE") return e.callDefault();

				if(!this.settings.displayInChat) e.callDefault();

				const channel = NeatoLib.Modules.get("getChannel").getChannel(dispatch.message ? dispatch.message.channel_id : dispatch.channelId), guild = channel && channel.guild_id ? NeatoLib.Modules.get("getGuild").getGuild(channel.guild_id) : null;

				if(!channel) return e.callDefault();

				this.updateMessages(channel.id);
				setTimeout(() => this.updateMessages(channel.id), 500);

				let guildIsMutedReturn = false, channelIsMutedReturn;

				if(guild) {
					guildIsMutedReturn = this.settings.ignoreMutedGuilds && this.muteModule.isMuted(guild.id);
					channelIsMutedReturn = this.settings.ignoreMutedChannels && (this.muteModule.isChannelMuted(guild.id, channel.id) || channel.parent_id && this.muteModule.isChannelMuted(channel.parent_id));
				}

				let listed = (guild && this.settings.list.includes(guild.id)) || this.settings.list.includes(channel.id);
				if(this.settings.type == "whitelist" && listed && (!channelIsMutedReturn || this.settings.list.includes(channel.id))) listed = true;
				else if(this.settings.type == "blacklist" && !listed && !guildIsMutedReturn && !channelIsMutedReturn) listed = true;
				else if(this.settings.type == "all" && !guildIsMutedReturn && !channelIsMutedReturn) listed = true;
				else listed = false;

				if(!listed) return e.callDefault();

				let author = dispatch.message && dispatch.message.author ? NeatoLib.Modules.get("getUser").getUser(dispatch.message.author.id) : null;
				if(!author) author = ((NeatoLib.Modules.get("_channelMessages")._channelMessages[channel.id] || { _map : {} })._map[dispatch.message ? dispatch.message.id : dispatch.id] || {}).author;

				if(author && author.bot && this.settings.ignoreBots) return e.callDefault();
				if(author && author.id == this.localUser.id && this.settings.ignoreSelf) return e.callDefault();
					
				const timestamp = dispatch.timestamp = this.settings.displayDates ? `${new Date().toLocaleTimeString()}, ${new Date().toLocaleDateString()}` : new Date().toLocaleTimeString();

				if(this.messageRecord.length >= this.settings.cap) this.messageRecord.splice(0, 1);
				if(this.deletedMessageRecord.length >= this.settings.savedCap) this.deletedMessageRecord.splice(0, 1);
				if(this.editedMessageRecord.length >= this.settings.savedCap) this.editedMessageRecord.splice(0, 1);
				if(this.purgedMessageRecord.length >= this.settings.savedCap) this.purgedMessageRecord.splice(0, 1);

				if(dispatch.type == "MESSAGE_DELETE") {

					this.prevented.push(e.callDefault);

					if(this.settings.displayInChat) {
						if(!this.deletedChatMessages[channel.id]) (this.deletedChatMessages[channel.id] = { unseen : 0 })[dispatch.id] = timestamp;
						else this.deletedChatMessages[channel.id][dispatch.id] = timestamp;
						if(!this.selectedChannel || this.selectedChannel.id != channel.id) this.deletedChatMessages[channel.id].unseen++;
					}

					const deleted = this.messageRecord.find(m => m.message.id == dispatch.id);

					if(!deleted || this.deletedMessageRecord.find(m => m.message.id == dispatch.id)) return;

					deleted.timestamp = timestamp;

					if(this.settings.toastToggles.deleted) {
						if(guild && channel) NeatoLib.showToast(`Message deleted from ${guild.name}, #${channel.name}.`, "error", { icon : guild.getIconURL(), onClick : () => this.openWindow("deleted") });
						else NeatoLib.showToast("Message deleted from DM.", "error", { icon : this.getAvatarOf(deleted.message.author), onClick : () => this.openWindow("deleted") });
					}

					this.deletedMessageRecord.push(deleted);

					this.saveData();

				} else if(dispatch.type == "MESSAGE_DELETE_BULK") {

					this.prevented.push(e.callDefault);

					if(this.settings.displayInChat && !this.deletedChatMessages[channel.id]) this.deletedChatMessages[channel.id] = { unseen : 0 };

					for(let i = 0; i < dispatch.ids.length; i++) {

						if(this.settings.displayInChat) {
							this.deletedChatMessages[channel.id][dispatch.ids[i]] = timestamp;
							if(!this.selectedChannel || this.selectedChannel.id != channel.id) this.deletedChatMessages[channel.id].unseen++;
						}

						const purged = this.messageRecord.find(x => x.message.id == dispatch.ids[i]);

						if(!purged || this.purgedMessageRecord.find(x => x.message.id == dispatch.ids[i])) return;
						
						purged.timestamp = timestamp;

						this.purgedMessageRecord.push(purged);

					}

					if(this.settings.toastToggles.deleted) {
						if(guild && channel) NeatoLib.showToast(`${dispatch.ids.length} messages bulk deleted from ${guild.name}, #${channel.name}.`, "error", { icon : guild.getIconURL(), onClick : () => this.openWindow("deleted") });
					}
						
					this.saveData();

				} else if(dispatch.type == "MESSAGE_UPDATE" && dispatch.message.edited_timestamp) {

					this.prevented.push(e.callDefault);

					if(this.settings.displayInChat) {
						if(!this.editedChatMessages[channel.id]) (this.editedChatMessages[channel.id] = { unseen : 0 })[dispatch.message.id] = [{ message : dispatch.message.content, timestamp : timestamp }];
						else if(!this.editedChatMessages[channel.id][dispatch.message.id]) this.editedChatMessages[channel.id][dispatch.message.id] = [{ message : dispatch.message.content, timestamp : timestamp }];
						else this.editedChatMessages[channel.id][dispatch.message.id].push({ message : dispatch.message.content, timestamp : timestamp });
						if(!this.selectedChannel || this.selectedChannel.id != channel.id) this.editedChatMessages[channel.id].unseen++;
					}

					const last = this.messageRecord.find(m => m.message.id == dispatch.message.id), lastEditedIDX = this.editedMessageRecord.findIndex(m => m.message.id == dispatch.message.id);

					if(!last || !dispatch.message.content || !dispatch.message.content.trim().length && !dispatch.message.attachments.length) return;

					dispatch.editHistory = !last.editHistory ? [{ content : last.message.content, editedAt : timestamp }] : last.editHistory;

					if(lastEditedIDX != -1) {

						dispatch.editHistory.push({ content : this.editedMessageRecord[lastEditedIDX].message.content, editedAt : timestamp });

						last.editHistory = dispatch.editHistory;
						last.message.content = dispatch.message.content;
						last.edited = true;
						
						if(this.settings.toastToggles.edited) {
							if(guild && channel) NeatoLib.showToast(`Message edited in ${guild.name}, #${channel.name}.`, { icon : guild.getIconURL(), onClick : () => this.openWindow("edited") });
							else NeatoLib.showToast("Message edited in DM.", { icon : this.getAvatarOf(last.message.author), onClick : () => this.openWindow("edited") });
						}

						this.editedMessageRecord.splice(lastEditedIDX, 1);

					}

					this.editedMessageRecord.push(dispatch);

					this.saveData();

				} else if(dispatch.type == "MESSAGE_CREATE" && dispatch.message && dispatch.message.state != "SENDING") {

					const existing = this.messageRecord.findIndex(m => m.message.id == dispatch.message.id);

					if(existing != -1) {
						if(this.messageRecord[existing].edited) return e.callDefault();
						this.messageRecord.splice(existing, 1);
					}
		
					if(this.settings.toastToggles.sent) {
						if(guild && channel) NeatoLib.showToast(`Message sent in ${guild.name}, #${channel.name}.`, "success", { icon : guild.getIconURL(), onClick : () => this.openWindow("sent") });
						else NeatoLib.showToast("Message sent in DM.", "success", { icon : this.getAvatarOf(dispatch.message.author), onClick : () => this.openWindow("sent") });
					}
		
					if(this.settings.cacheAllImages) for(let i = 0; i < dispatch.message.attachments.length; i++) new Image().src = dispatch.message.attachments[i].url;

					this.messageRecord.push(dispatch);

					e.callDefault();

				} else e.callDefault();

			} catch(err) {
				console.error(err);
				return e.callDefault();
			}

		});

		this.unpatchEdit = NeatoLib.monkeyPatchInternal(NeatoLib.Modules.get("startEditMessage"), "startEditMessage", e => {

			if(!this.editedChatMessages[e.args[0]] || !this.editedChatMessages[e.args[0]][e.args[1]]) return e.callDefault();

			const edits = this.editedChatMessages[e.args[0]][e.args[1]];
			e.args[2] = edits[edits.length - 1].message;

			return e.callDefault();

		});
		
		if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

		this.switch();

		NeatoLib.Events.attach("switch", this.switchEvent = () => this.switch());

		NeatoLib.Events.onPluginLoaded(this);

	}

	unregisterKeybinds() {
		NeatoLib.Keybinds.detachListener("ml-open-log-filtered");
		NeatoLib.Keybinds.detachListener("ml-open-log");
	}

	registerKeybinds() {

		if(this.settings.disableKeybind) return;

		NeatoLib.Keybinds.attachListener("ml-open-log-filtered", this.settings.openLogFilteredKeybind, () => {
			if(this.selectedChannel) this.filter = "channel: " + this.selectedChannel.id;
			if(document.getElementById("message-logger-window")) document.getElementById("message-logger-window").remove();
			else this.openWindow("deleted");
		});

		NeatoLib.Keybinds.attachListener("ml-open-log", this.settings.openLogKeybind, () => {
			this.filter = "";
			if(document.getElementById("message-logger-window")) document.getElementById("message-logger-window").remove();
			else this.openWindow("deleted");
		});

	}

	switch() {

		if(this.ready != true || document.getElementsByClassName("messages scroller")[0] == undefined) return;

		this.selectedChannel = NeatoLib.getSelectedTextChannel();

		if(this.settings.showDeletedCount && this.deletedChatMessages[this.selectedChannel.id] && this.deletedChatMessages[this.selectedChannel.id].unseen) {
			NeatoLib.showToast(`There are ${this.deletedChatMessages[this.selectedChannel.id].unseen} new deleted messages in ${this.selectedChannel.name ? "#" + this.selectedChannel.name : "DM"}`);
			this.deletedChatMessages[this.selectedChannel.id].unseen = 0;
		}

		if(this.settings.showEditedCount && this.editedChatMessages[this.selectedChannel.id] && this.editedChatMessages[this.selectedChannel.id].unseen) {
			NeatoLib.showToast(`There are ${this.editedChatMessages[this.selectedChannel.id].unseen} new edited messages in ${this.selectedChannel.name ? "#" + this.selectedChannel.name : "DM"}`);
			this.editedChatMessages[this.selectedChannel.id].unseen = 0;
		}

		const onMessage = e => {

			const messageID = NeatoLib.ReactData.getProps(e.currentTarget.parentElement).message.id;

			if(this.editedMessageRecord.findIndex(x => x.message.id == messageID)) {
				this.filter = "message: " + messageID;
				this.openWindow("edited");
			}

		};

		if(this.messageObserver) this.messageObserver.disconnect();

		this.messageObserver = new MutationObserver(mutations => {

			for(let i = 0; i < mutations.length; i++) {

				if(mutations[i].addedNodes[0] && mutations[i].addedNodes[0].className == "edited") {
			
					mutations[i].addedNodes[0].addEventListener("click", e => onMessage(e));

				}

			}

		});

		this.messageObserver.observe(document.getElementsByClassName("messages scroller")[0], { childList : true, subtree : true });

		const foundEdited = document.getElementsByClassName("edited");

		for(let i = 0; i < foundEdited.length; i++) foundEdited[i].addEventListener("click", e => onMessage(e));

		setTimeout(() => this.updateMessages(), 100);
		this.updateMessages();

	}

	updateMessages(cid) {

		if(!this.selectedChannel || cid && this.selectedChannel.id != cid) return;
		
		if(!document.getElementsByClassName("chat").length) return;

		const groups = document.getElementsByClassName("chat")[0].getElementsByClassName("message-group"), channel = this.selectedChannel;

		const onClickEditedTag = e => {

			const mid = NeatoLib.ReactData.getProps(e.currentTarget.parentElement).message.id;

			if(this.editedMessageRecord.findIndex(x => x.message.id == mid)) {
				this.filter = "message: " + mid;
				this.openWindow("edited");
			}

		};

		if(!channel) return;

		for(let g = 0; g < groups.length; g++) {

			const messages = NeatoLib.ReactData.getProp(groups[g], "messages");

			if(!messages) continue;

			for(let i = 0; i < messages.length; i++) {

				const id = messages[i].id, message = groups[g].lastChild.getElementsByClassName("message")[i], markup = message ? message.getElementsByClassName("markup")[0] : null;

				if(!id || !markup) continue;

				if(this.deletedChatMessages[channel.id] && this.deletedChatMessages[channel.id][id]) {
					message.classList.add("ml-deleted");
					NeatoLib.Tooltip.attach("Deleted at " + this.deletedChatMessages[channel.id][id].split(",")[0], message, { side : "left" });
				}

				if(this.editedChatMessages[channel.id] && this.editedChatMessages[channel.id][id]) {

					while(markup.getElementsByClassName("markup").length) markup.getElementsByClassName("markup")[0].remove();

					markup.classList.add("ml-edited");

					const edit = this.editedChatMessages[channel.id][id];

					for(let e = 0; e < edit.length; e++) {
						if(!markup.getElementsByClassName("edited").length) markup.insertAdjacentHTML("beforeend", `<span class="edited">(edited)</span>`);
						markup.lastElementChild.addEventListener("click", onClickEditedTag);
						markup.insertAdjacentHTML("beforeend", `<div class="markup ml-edited">${this.formatMarkup(edit[e].message, channel)}</div>`);
						NeatoLib.Tooltip.attach("Edited at " + edit[e].timestamp.split(",")[0], markup.lastElementChild, { side : "left" });
					}

				}

			}

		}

	}

	formatMarkup(content, channel) {

		let markup = content.replace(/(https?:\/\/[^\s]+)/g, `<a class="anchor-3Z-8Bb" href="$&">$&</a>`);

		try {

			if(channel) {
				while(this.regex.mention.test(markup)) {
					const uid = markup.match(this.regex.mention)[0].match(this.regex.numbersOnly)[0], user = NeatoLib.Modules.get("getUser").getUser(uid), member = channel.guild_id ? NeatoLib.Modules.get("getMember").getMember(channel.guild_id, uid) : null;
					markup = markup.replace(this.regex.mention, `<span class="mention">@${user ? (member && member.nick ? member.nick : user.username) : "Unknown User"}</span>`);
				}
			}

			while(this.regex.channel.test(markup)) {
				const cid = markup.match(this.regex.channel)[0].match(this.regex.numbersOnly)[0], channel = NeatoLib.Modules.get("getChannel").getChannel(cid), parent = channel.parent_id ? NeatoLib.Modules.get("getChannel").getChannel(channel.parent_id) : null, guild = channel.guild_id ? NeatoLib.Modules.get("getGuild").getGuild(channel.guild_id) : null;
				markup = markup.replace(this.regex.channel, `<span class="mention">#${channel.name}</span>`);
			}

			while(this.regex.emoji.test(markup)) {
				const eid = markup.match(this.regex.emoji)[0].match(this.regex.numbersOnly)[0], url = `https://cdn.discordapp.com/emojis/${eid}.png`;
				markup = markup.replace(this.regex.emoji, `<img class="emoji" src="${url}">`);
			}

		} catch(e) { console.error("formatMarkup", e); }

		return markup;

	}

	openWindow(type, curCap = this.settings.renderCap) {

		const app = document.getElementsByClassName("app")[0];

		if(document.getElementById("message-logger-window") == undefined) app.insertAdjacentHTML("beforeend", `
		<div id="message-logger-window">
			<div class="ml-backdrop"></div>
			<div class="ml-scroller-wrapper">
				<div class="ml-label">
					<h2>Message Logger</h2>
					<span>Filter:</span>
					<input id="ml-filter" class="ml-filter-field" value="${this.filter}"></input>
					<div class="ml-filter-help-button">Help</div>
					<div style="text-align:center">
						<div class="ml-tab-button sent">Sent Messages</div>
						<div class="ml-tab-button deleted">Deleted Messages</div>
						<div class="ml-tab-button edited">Edited Messages</div>
						<div class="ml-tab-button purged">Purged Messages</div>
						<div class="ml-tab-button ghostpings">Ghost Pings</div>
					</div>
				</div>
				<div class="ml-scroller" id="message-logger-scroller"></div>
			</div>
		</div>`);

		document.removeEventListener("keydown", this.windowKeyEvent);
		document.addEventListener("keydown", this.windowKeyEvent);

		const tabs = document.getElementsByClassName("ml-tab-button");

		for(let i = 0, l = tabs.length; i < l; i++) {

			tabs[i].onclick = () => {
	
				if(tabs[i].classList.contains("help")) return;
	
				if(tabs[i].classList.contains("selected")) {
					this.settings.reverseOrder = !this.settings.reverseOrder;
					this.saveSettings();
				}
				
				for(let i = 0, l = tabs.length; i < l; i++) if(tabs[i].classList.contains("selected")) tabs[i].classList.remove("selected");
	
				this.openWindow(tabs[i].classList[1]);
	
				tabs[i].classList.add("selected");
	
			};

		}

		document.getElementsByClassName("ml-tab-button " + type)[0].classList.add("selected");

		const backdrop = document.getElementsByClassName("ml-backdrop")[0];

		backdrop.onclick = () => {
			this.filter = "";
			document.removeEventListener("keydown", this.windowKeyEvent);
			document.getElementById("message-logger-window").outerHTML = "";
			if(this.updateWindow) clearInterval(this.updateWindow);
		};

		document.getElementsByClassName("ml-filter-help-button")[0].onclick = () => {
			BdApi.getCore().alert("Help", this.helpMessage.split("\n").join("<br><br>"));
			backdrop.click();
		};
		
		const scroller = document.getElementById("message-logger-scroller"), messages = this.getFilteredMessages(type);
		scroller.innerHTML = "";

		if(this.updateWindow) clearInterval(this.updateWindow);

		this.updateWindow = setInterval(() => {

			if(!document.getElementById("ml-filter")) {
				clearInterval(this.updateWindow);
				return;
			}

			this.filter = document.getElementById("ml-filter").value;

			if(this.getFilteredMessages(type).length != messages.length) this.openWindow(type, curCap);
			
		}, 1000);

		if(!messages.length) return;

		const onGroupContext = (e, i) => {

			e.preventDefault();

			const user = this.getUser(messages[i].message.author.id), channel = this.getChannel(messages[i].message.channel_id), items = [], messageID = e.target.getAttribute("data-message-id");

			if(e.target.tagName == "IMG") {

				const filename = e.target.src.substring(e.target.src.lastIndexOf("/") + 1, e.target.src.lastIndexOf("?") == -1 ? e.target.src.length : e.target.src.lastIndexOf("?"));

				items.push(NeatoLib.ContextMenu.createItem(filename));

				items.push(NeatoLib.ContextMenu.createItem("Save To Folder", () => {
					NeatoLib.browseForFile(folder => {
						NeatoLib.downloadFile(e.target.src, folder.path, filename);
					}, { directory : true });
				}));

			}

			if(e.target.classList.contains("markup")) {

				if(messageID) {

					if(channel && this.getMessage(channel.id, messages[i].message.id)) {
						items.push(NeatoLib.ContextMenu.createItem("Jump To", () => {
							this.transitionTo(`/channels/${messages[i].message.guild_id}/${messages[i].message.channel_id}?jump=${messages[i].message.id}`);
							$backdrop.click();
							this.getContextMenu().style.display = "none";
						}));
					}

					items.push(NeatoLib.ContextMenu.createItem("Remove From Log", () => {
						let messageA;
						if(type == "sent") messageA = this.messageRecord;
						if(type == "edited") messageA = this.editedMessageRecord;
						if(type == "deleted" || type == "ghostpings") messageA = this.deletedMessageRecord;
						if(type == "purged") messageA = this.purgedMessageRecord;
						let ii = messageA.findIndex(x => x.message.id == messageID);
						if(ii != -1) messageA.splice(ii, 1);
						this.saveData();
						NeatoLib.ContextMenu.close();
						this.openWindow(type, curCap);
					}));

				}

				items.push(NeatoLib.ContextMenu.createItem("Copy Text", () => {
					this.electron.clipboard.writeText(messages[i].message.content);
					this.getContextMenu().style.display = "none";
					NeatoLib.showToast("Text copied to clipboard!", "success");
				}));

				return;

			}
				
			if(items.length) NeatoLib.ContextMenu.create(items, e);

			if(items.length || !user || !channel) return;

			this.openUserContextMenu(e, user, channel);
			
			document.getElementsByClassName(this.classes.item)[0].addEventListener("click", () => backdrop.click());

		};

		let lastMessage, group;

		const populate = i => {

			try {
				
				if(!messages[i].message.author) return;

				if(lastMessage && lastMessage.author.id == messages[i].message.author.id && lastMessage.channel_id == messages[i].message.channel_id) {

					const message = group.getElementsByClassName("message-text")[0], accessory = group.getElementsByClassName("accessory")[0];

					if(messages[i].editHistory != undefined) for(let ii = 0; ii < messages[i].editHistory.length; ii++) {
						const markup = document.createElement("div"), timestamp = document.createElement("div");
						markup.className = "markup";
						markup.style = "opacity:0.5";
						markup.innerHTML = this.formatMarkup(messages[i].editHistory[ii].content, messages[i].channel);
						timestamp.className = "markup ml-edit-timestamp";
						timestamp.innerText = messages[i].editHistory[ii].editedAt;
						markup.appendChild(timestamp);
						message.appendChild(markup);
					}

					const markup = document.createElement("div");
					markup.className = "markup";
					markup.dataset.messageId = messages[i].message.id;
					markup.innerHTML = this.formatMarkup(messages[i].message.content, messages[i].channel);
					message.appendChild(markup);

					for(let ii = 0; ii < messages[i].message.attachments.length; ii++) {
						const img = document.createElement("img");
						img.src = messages[i].message.attachments[ii].url;
						img.width = Math.clamp(messages[i].message.attachments[ii].width, 200, 650);
						accessory.appendChild(img);
					}

					return;

				}

				lastMessage = messages[i].message;

				group = this.messageGroupItem(messages[i], type);

				group.addEventListener("contextmenu", e => onGroupContext(e, i));

				scroller.appendChild(group);

			} catch(err) { console.error(err); }

		};

		const cap = Math.clamp(messages.length - 1, 0, curCap);
		
		if(this.settings.reverseOrder) for(let i = messages.length - 1; i > Math.clamp(messages.length - cap, -1, Infinity); i--) populate(i);
		else for(let i = 0; i <= cap; i++) populate(i);

		if(messages.length > curCap) {
		
			scroller.insertAdjacentHTML("beforeend", `
			<div id="ml-load-more-button" class="message-group hide-overflow" style="cursor:pointer;">
				<div class="comment" style="text-align:center;">
					<div class="message">
						<div class="body">
							<h2 class="old-h2"><span class="username-wrapper"><strong class="user-name" style="color:white">Load More</strong></span></h2>
						</div>
					</div>
				</div>
			</div>`);

			document.getElementById("ml-load-more-button").onclick = () => {
				this.openWindow(type, parseInt(curCap) + parseInt(this.settings.renderCap));
			};

		}

		if(type == "ghostpings") return;

		scroller.insertAdjacentHTML(this.settings.clearButtonOnTop ? "afterbegin" : "beforeend", `
		<div id="ml-clear-log-button" class="message-group hide-overflow" style="cursor:pointer;">
			<div class="comment" style="text-align:center;">
				<div class="message">
					<div class="body">
						<h2 class="old-h2"><span class="username-wrapper"><strong class="user-name" style="color:white">Clear</strong></span></h2>
					</div>
				</div>
			</div>
		</div>`);

		document.getElementById("ml-clear-log-button").onclick = () => {
			NeatoLib.UI.createPrompt("ml-clear-log-prompt", "Clear log", `Are you sure you want to clear all ${type} messages?`, prompt => {
				if(type == "sent") this.messageRecord = [];
				if(type == "edited") this.editedMessageRecord = [];
				if(type == "deleted") this.deletedMessageRecord = [];
				if(type == "purged") this.purgedMessageRecord = [];
				this.saveData();
				NeatoLib.showToast("Log cleared!", "success");
				this.openWindow(type);
				prompt.close();
			});
		};

	}

	getFilteredMessages(type) {
		
		let messages;

		if(type == "sent") messages = this.messageRecord.slice(0);
		if(type == "edited") messages = this.editedMessageRecord.slice(0);
		if(type == "deleted") messages = this.deletedMessageRecord.slice(0);
		if(type == "ghostpings") messages = Array.filter(this.deletedMessageRecord, x => Array.from(x.message.mentions, y => y.id).includes(this.localUser.id));
		if(type == "purged") messages = this.purgedMessageRecord.slice(0);
		
		const filters = this.filter.split(",");

		for(let i = 0; i < filters.length; i++) {

			const split = filters[i].split(":");
			if(split.length < 2) continue;

			const filterType = split[0].trim().toLowerCase(), filter = split[1].trim().toLowerCase();

			if(filterType == "server" || filterType == "guild") messages = Array.filter(messages, x => {
				const guild = this.getServer(x.message.guild_id);
				return x.message.guild_id == filter || (guild != undefined && guild.name.toLowerCase().includes(filter));
			});

			if(filterType == "channel") messages = Array.filter(messages, x => {
				const channel = this.getChannel(x.message.channel_id);
				return x.message.channel_id == filter || (channel != undefined && channel.name.toLowerCase().includes(filter.replace("#", "")));
			});

			if(filterType == "message" || filterType == "content") messages = Array.filter(messages, x => x.message.id == filter || x.message.content.toLowerCase().includes(filter));

			if(filterType == "user") messages = Array.filter(messages, x => x.message.author.id == filter || x.message.author.username.toLowerCase().includes(filter) || (x.message.member != undefined && x.message.member.nick != null && x.message.member.nick.toLowerCase().includes(filter)));

		}

		return messages;

	}

	messageGroupItem(data, type) {

		let details = "", server, channel = this.getChannel(data.message.channel_id);

		if(channel) server = this.getServer(channel.guild_id);

		if(type == "sent") details = "Sent in";
		if(type == "edited") details = "Last edit in";
		if(type == "deleted") details = "Deleted from";

		details += server && channel ? ` ${server.name}, #${channel.name} ` : " DM ";

		details += `at ${data.timestamp}`;

		let history = "";

		if(data.editHistory) for(let i = 0; i < data.editHistory.length; i++) history += `<div class="markup" style="opacity:0.5">${this.formatMarkup(data.editHistory[i].content, channel)}<div class="markup ml-edit-timestamp">${data.editHistory[i].editedAt}</div></div>`;

		let attachments = "";

		if(data.message.attachments.length > 0) {
			for(let i = 0; i < data.message.attachments.length; i++) {
				let img = data.message.attachments[i];
				attachments += `<img src="${img.url}" width="${Math.clamp(img.width, 200, 650)}px">`;
			}
		}

		let element = document.createElement("div");

		element.setAttribute("class", "message-group hide-overflow");

		let markup = this.formatMarkup(data.message.content, channel);

		element.innerHTML =
		`<div class="avatar-large stop-animation ml-message-avatar" style="background-image: url(${this.getAvatarOf(data.message.author)});"></div>
			<div class="comment">
				<div class="message">
					<div class="body">
						<h2 class="old-h2"><span class="username-wrapper"><strong class="user-name ml-message-username" style="color: white">${data.message.member && data.message.member.nick ? data.message.member.nick : data.message.author.username}</strong></span><span class="highlight-separator"> - </span><span class="timestamp">${details}</span></h2>
					<div class="message-text">
						${history}
						<div class="markup" data-message-id="${data.message.id}">${markup}</div>
					</div>
				</div>
				<div class="accessory">${attachments}</div>
			</div>
		</div>`;

		return element;

	}

	getAvatarOf(user) {
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
	}

	onChannelContext(channel) {

		const buttons = [];

		buttons.push(NeatoLib.ContextMenu.createItem("Open Log Here", () => {
			this.filter = "channel: " + channel.id;
			this.openWindow("deleted");
			NeatoLib.ContextMenu.close();
		}));

		if(this.settings.type != "all") {

			const updateButtonContent = () => {
				buttons[1].firstChild.innerText = (this.settings.list.includes(channel.id) ? "Remove From " : "Add To ") + (this.settings.type == "blacklist" ? "Blacklist" : "Whitelist");
			};

			buttons.push(NeatoLib.ContextMenu.createItem("...", () => {

				if(this.settings.list.includes(channel.id)) this.settings.list.splice(this.settings.list.indexOf(channel.id), 1);
				else this.settings.list.push(channel.id);

				this.saveSettings();

				updateButtonContent();

			}));

			updateButtonContent();

		}

		document.getElementsByClassName(this.classes.itemGroup)[0].appendChild(NeatoLib.ContextMenu.createSubMenu("Message Logger", buttons));

	}

	onGuildContext(e) {

		const id = e.target.parentElement.href.match(/\d+/)[0], buttons = [];

		buttons.push(NeatoLib.ContextMenu.createItem("Open Log Here", () => {
			this.filter = "server: " + id;
			this.openWindow("deleted");
			NeatoLib.ContextMenu.close();
		}));

		if(this.settings.type != "all") {

			const updateButtonContent = () => {
				buttons[1].firstChild.innerText = (this.settings.list.includes(id) ? "Remove From " : "Add To ") + (this.settings.type == "blacklist" ? "Blacklist" : "Whitelist");
			};

			buttons.push(NeatoLib.ContextMenu.createItem("...", () => {

				if(this.settings.list.includes(id)) this.settings.list.splice(this.settings.list.indexOf(id), 1);
				else this.settings.list.push(id);

				this.saveSettings();

				updateButtonContent();

			}));

			updateButtonContent();

		}

		document.getElementsByClassName(this.classes.itemGroup)[1].appendChild(NeatoLib.ContextMenu.createSubMenu("Message Logger", buttons, { callback : () => {
			this.filter = "";
			this.openWindow("deleted");
			NeatoLib.ContextMenu.close();
		}}));

	}

	onMessageContext() {

		let itemGroups = document.getElementsByClassName(this.classes.itemGroup);

		itemGroups[itemGroups.length - 1].insertAdjacentElement("beforeend", NeatoLib.ContextMenu.createSubMenu("Open Message Log", [
			NeatoLib.ContextMenu.createItem("Sent Messages", () => { this.openWindow("sent"); NeatoLib.ContextMenu.close(); }),
			NeatoLib.ContextMenu.createItem("Deleted Messages", () => { this.openWindow("deleted"); NeatoLib.ContextMenu.close(); }),
			NeatoLib.ContextMenu.createItem("Edited Messages", () => { this.openWindow("edited"); NeatoLib.ContextMenu.close(); }),
			NeatoLib.ContextMenu.createItem("Ghost Pings", () => { this.openWindow("ghostpings"); NeatoLib.ContextMenu.close(); }),
			NeatoLib.ContextMenu.createItem("Plugin Settings", () => { NeatoLib.Settings.showPluginSettings(this.getName()); NeatoLib.ContextMenu.close(); })
		]));

	}

	getContextMenu() {
		return document.getElementsByClassName(this.classes.contextMenu)[0];
	}

	clearLogs() {
		this.messageRecord = [];
		this.deletedMessageRecord = [];
		this.editedMessageRecord = [];
		this.purgedMessageRecord = [];
		this.saveData();
	}
	
	stop() {

		this.unpatchDispatch();
		this.unpatchEdit();

		for(let i = 0; i < this.prevented.length; i++) this.prevented[i]();
		
		document.removeEventListener("contextmenu", this.contextEvent);
		document.removeEventListener("keydown", this.windowKeyEvent);

		if(this.updateWindow) clearInterval(this.updateWindow);

		if(this.messageObserver) this.messageObserver.disconnect();

		NeatoLib.Events.detach("switch", this.switchEvent);

		this.style.destroy();

		this.unregisterKeybinds();

	}
	
}
