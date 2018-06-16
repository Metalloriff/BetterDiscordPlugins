//META{"name":"MessageLogger"}*//

class MessageLogger {
	
    getName() { return "MessageLogger"; }
    getDescription() { return "Records all sent messages, message edits and message deletions in the specified servers, all unmuted servers or all servers, and in direct messages."; }
    getVersion() { return "1.7.6"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			"0.1.2" : 
			`
				Added an "ignore bots" setting.
				Added a filter to the log.
				Added a help button.
				Added a context menu to users in the log.
			`,
			"0.2.2" :
			`
				Changed Ctrl + Alt + M from filtering the selected server, to filtering the selected channel.
				Messages are now grouped, instead of separate for every message.
				Sent messages no longer save. This is to help prevent that annoying Javascript error that requires you to delete the config file.
				Message data is now saved in "MessageLoggerData.config.json" instead of "MessageLogger.config.json", so if the javascript error happens, you won't have to reconfigure your settings.
				Improved the performance of the log window.
				Fixed that hideous scrollbar.
				Added a clear button.
				Fixed messages sometimes randomly deleting themselves from the log.
				Added a setting to ignore messages posted by yourself.
				Added a context menu to logged messages. More options will be added to it soon.
			`,
			"0.3.2" :
			`
				Ctrl + Alt + M now deafaults to the deleted messages instead of sent.
				Added a "Remove From Log" log message context menu item.
				Added a "Display clear log button at the top of the log" setting.
				Clicking the "edited" icon next to an edited message now opens the logger and filters that message.
			`,
			"0.4.2" :
			`
				Added a cache all images setting. Enabling this will most of the time make deleted images show.
				Fixed multiple images from the same user not showing in the log.
				Improved the size of images in the log.
			`,
			"0.5.2" :
			`
				Added sent message cap and saved message cap settings.
			`,
			"1.6.6" :
			`
				Updated everything to only depend on my lib.
				Added settings to reconfigure the keybinds.
				Re-added the message context menu.
			`,
			"1.7.6" :
			`
				Fixed both keybinds opening the filtered log.
				Fixed the guild context menu not showing. Thanks, Discord.
				Bulk deletes (purges, bans, etc.) are now logged.
				Clicking a notification (toast) will now take you to the log of that type.
				Added a context menu to images in the log.
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
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
        else lib.addEventListener("load", libLoadedEvent);

	}

	getSettingsPanel() {

		setTimeout(() => {

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("ml-gen-toggles", "General settings", [
				{ title : "Ignore muted channels and server", value : "ignoreMuted", setValue : this.settings.ignoreMuted },
				{ title : "Ignore bots", value : "ignoreBots", setValue : this.settings.ignoreBots },
				{ title : "Ignore message posted by you", value : "ignoreSelf", setValue : this.settings.ignoreSelf },
				{ title : "Disable keybinds", value : "disableKeybind", setValue : this.settings.disableKeybind },
				{ title : "Display clear log button at the top of the log", value : "clearButtonOnTop", setValue : this.settings.clearButtonOnTop },
				{ title : "Cache all received images. (Attempted fix to show deleted images, disable this if you notice a decline in your internet speed)", value : "cacheAllImages", setValue : this.settings.cacheAllImages }
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
				{ title : "Blacklsit", value : "blacklist" }
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

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createTextField("Sent message cap", "number", this.settings.cap, e => {
				this.settings.cap = e.target.value;
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createTextField("Saved message cap", "number", this.settings.savedCap, e => {
				this.settings.savedCap = e.target.value;
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

			/* NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("ml-count-toggles", "Display amount of new messages since the last time the channel was visited", [
				{ title : "Sent messages", value : "sent", setValue : this.settings.countToggles.sent },
				{ title : "Edited messages", value : "edited", setValue : this.settings.countToggles.edited },
				{ title : "Deleted messages", value : "deleted", setValue : this.settings.countToggles.deleted }
			], choice => {
				this.settings.countToggles[choice.value] = !this.settings.countToggles[choice.value];
				this.saveSettings();
			}), this.getName()); */

			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

        return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
        
	}
	
	saveSettings() {
		NeatoLib.Settings.save(this);
	}

	saveData() {
		NeatoLib.Data.save(this.getName() + "Data", "data", {
			deletedMessageRecord : this.deletedMessageRecord,
			editedMessageRecord : this.editedMessageRecord
		});
	}

	onLibLoaded() {

		NeatoLib.Updates.check(this);

		this.settings = NeatoLib.Settings.load(this, {
			displayUpdateNotes : true,
			ignoreMuted : true,
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
			countToggles : {
				sent : false,
				edited : true,
				deleted : true
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
			}
		});

		this.registerKeybinds();

		let data = NeatoLib.Data.load(this.getName() + "Data", "data", {
			deletedMessageRecord : [],
			editedMessageRecord : []
		});

		this.messageRecord = [];
		this.deletedMessageRecord = data.deletedMessageRecord;
		this.editedMessageRecord = data.editedMessageRecord;

		this.getUser = NeatoLib.Modules.get("getUser").getUser;
		this.getServer = NeatoLib.Modules.get("getGuild").getGuild;
		this.getChannel = NeatoLib.Modules.get("getChannel").getChannel;

		this.openUserContextMenu = NeatoLib.Modules.get(["openUserContextMenu"]).openUserContextMenu;

		this.isMuted = NeatoLib.Modules.get(["isMuted"]).isMuted;

		this.filter = "";

		this.$document = $(document);
		this.$document.on("contextmenu.MessageLogger", e => {
			if(e.target.classList.contains("guild-icon")) this.onGuildContext(e);
			if(e.target.parentElement.classList.contains("message-text")) this.onMessageContext();
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

			"Ctrl + M" - Open message log.
			"Ctrl + Alt + M" - Open message log with selected channel filtered.
		`;

		this.classes = NeatoLib.getClasses(["contextMenu"]);

		this.localUser = NeatoLib.getLocalUser();

		this.electron = require("electron");

		this.getMessage = NeatoLib.Modules.get(["getMessages"]).getMessage;

		this.transitionTo = NeatoLib.Modules.get(["transitionTo"]).transitionTo;

		NeatoLib.unpatchInternalFunction("dispatch", this.getName());
		NeatoLib.patchInternalFunction("dispatch", dispatch => {
			
			if(dispatch.type == "MESSAGE_DELETE_BULK") {

				let timestamp = new Date().toLocaleTimeString();

				for(let i = 0; i < dispatch.ids.length; i++) {

					let deletedMessage = this.messageRecord.find(x => x.message.id == dispatch.ids[i]);

					if(!deletedMessage || this.deletedMessageRecord.find(x => x.message.id == dispatch.ids[i])) return;
					
					deletedMessage.timestamp = timestamp;

					this.deletedMessageRecord.push(deletedMessage);

				}

				if(this.settings.toastToggles.deleted) {
					let channel = this.getChannel(dispatch.channelId), server = channel ? this.getServer(channel.guild_id) : null;
					if(server && channel) NeatoLib.showToast(`${dispatch.ids.length} messages bulk deleted from ${server.name}, #${channel.name}.`, "error", { icon : server.getIconURL(), onClick : () => this.openWindow("deleted") });
				}
					
				this.saveData();

			}

		}, this.getName());
		
        NeatoLib.unpatchInternalFunction("handleMessage", this.getName());
        NeatoLib.patchInternalFunction("handleMessage", data => {

			if(data.message != undefined && data.message.state === "SENDING") return;

			var channel = this.getChannel(data.message == undefined ? data.channelId : data.message.channel_id), server = this.getServer(channel.guild_id);

			if(this.settings.ignoreMuted && channel != undefined && (this.isMuted(data.channelId) || this.isMuted(channel.guild_id))) return;

			if(channel.type == 0) {

				if(this.settings.type == "whitelist" && !this.settings.list.includes(channel.guild_id)) return;

				if(this.settings.type == "blacklist" && this.settings.list.includes(channel.guild_id)) return;

			}

			let user = data.message == undefined || data.message.author == undefined ? undefined : this.getUser(data.message.author.id);

			if(user && user.bot && this.settings.ignoreBots) return;

			if(user && user.id == this.localUser.id && this.settings.ignoreSelf) return;
				
			let timestamp = new Date().toLocaleTimeString();
			data.timestamp = timestamp;

            if(this.messageRecord.length >= this.settings.cap) this.messageRecord.splice(0, 1);
            if(this.deletedMessageRecord.length >= this.settings.savedCap) this.deletedMessageRecord.splice(0, 1);
			if(this.editedMessageRecord.length >= this.settings.savedCap) this.editedMessageRecord.splice(0, 1);

            if(data.type == "MESSAGE_DELETE") {

				let deletedMessage = this.messageRecord.find(x => x.message.id == data.id);

				if(deletedMessage == undefined || this.deletedMessageRecord.find(x => x.message.id == data.id)) return;
				
				deletedMessage.timestamp = timestamp;

				if(this.settings.toastToggles.deleted) {
					if(server && channel) NeatoLib.showToast(`Message deleted from ${server.name}, #${channel.name}.`, "error", { icon : server.getIconURL(), onClick : () => this.openWindow("deleted") });
					else NeatoLib.showToast("Message deleted from DM.", "error", { icon : this.getAvatarOf(deletedMessage.message.author), onClick : () => this.openWindow("deleted") });
				}

                this.deletedMessageRecord.push(deletedMessage);
				
				this.saveData();

				return;

            }

            if(data.type == "MESSAGE_UPDATE" && data.message.edited_timestamp != undefined) {

				let lastMessage = this.messageRecord.find(x => x.message.id == data.message.id), lastEditedIDX = this.editedMessageRecord.findIndex(x => x.message.id == data.message.id);

				if(lastMessage == undefined || data.message.content == undefined || (data.message.content.trim().length == 0 && data.message.attachments.length == 0)) return;

				data.editHistory = lastMessage.editHistory == undefined ? [{ content : lastMessage.message.content, editedAt : timestamp }] : lastMessage.editHistory;

				if(lastEditedIDX != -1) {

					data.editHistory.push({ content : this.editedMessageRecord[lastEditedIDX].message.content, editedAt : timestamp });

					lastMessage.editHistory = data.editHistory;
					lastMessage.message.content = data.message.content;
					lastMessage.edited = true;
					
					if(this.settings.toastToggles.edited) {
						if(server && channel) NeatoLib.showToast(`Message edited in ${server.name}, #${channel.name}.`, { icon : server.getIconURL(), onClick : () => this.openWindow("edited") });
						else NeatoLib.showToast("Message edited in DM.", { icon : this.getAvatarOf(lastMessage.message.author), onClick : () => this.openWindow("edited") });
					}

					this.editedMessageRecord.splice(lastEditedIDX, 1);

				}

				data.timestamp = timestamp;

                this.editedMessageRecord.push(data);
				
				this.saveData();

				return;

			}

			if(data.message.content == undefined || (data.message.content.trim().length == 0 && data.message.attachments.length == 0)) return;

			let existingIDX = this.messageRecord.findIndex(x => x.message.id == data.message.id);

			if(existingIDX != -1) {

				if(this.messageRecord[existingIDX].edited === true) return;

				this.messageRecord.splice(existingIDX, 1);

			}

			if(this.settings.toastToggles.sent) {
				if(server && channel) NeatoLib.showToast(`Message sent in ${server.name}, #${channel.name}.`, "success", { icon : server.getIconURL(), onClick : () => this.openWindow("sent") });
				else NeatoLib.showToast("Message sent in DM.", "success", { icon : this.getAvatarOf(data.message.author), onClick : () => this.openWindow("sent") });
			}

			if(this.settings.cacheAllImages) for(let i = 0; i < data.message.attachments.length; i++) new Image().src = data.message.attachments[i].url;

			this.messageRecord.push(data);

		}, this.getName());
		
		if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

		this.switch();

		this.switchEvent = () => this.switch();

		NeatoLib.Events.attach("switch", this.switchEvent);

		NeatoLib.Events.onPluginLoaded(this);

	}

	unregisterKeybinds() {
		NeatoLib.Keybinds.detachListener("ml-open-log-filtered");
		NeatoLib.Keybinds.detachListener("ml-open-log");
	}

	registerKeybinds() {

		if(this.settings.disableKeybind) return;

		NeatoLib.Keybinds.attachListener("ml-open-log-filtered", this.settings.openLogFilteredKeybind, () => {
			let channel = NeatoLib.getSelectedTextChannel();
			if(channel) this.filter = "channel: " + channel.id;
			this.openWindow("deleted");
		});

		NeatoLib.Keybinds.attachListener("ml-open-log", this.settings.openLogKeybind, () => {
			this.filter = "";
			this.openWindow("deleted")
		});

	}

	switch() {

		if(this.ready != true || document.getElementsByClassName("messages scroller")[0] == undefined) return;

		let onMessage = e => {

			let messageID = NeatoLib.ReactData.getProps(e.currentTarget.parentElement).message.id;

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

		let foundEdited = document.getElementsByClassName("edited");

		for(let i = 0; i < foundEdited.length; i++) foundEdited[i].addEventListener("click", e => onMessage(e));

		let channel = NeatoLib.getSelectedTextChannel();

	}

	openWindow(type) {

		let app = document.getElementsByClassName("app")[0];

		if(document.getElementById("message-logger-window") == undefined) app.insertAdjacentHTML("beforeend", `<div id="message-logger-window">

		<style>

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

        </style>

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
						<div class="ml-tab-button ghostpings">Ghost Pings</div>
					</div>
                </div>
                <div class="ml-scroller" id="message-logger-scroller"></div>
            </div>
		</div>`);

		let tabs = document.getElementsByClassName("ml-tab-button"), $tabs = $(tabs);

		$tabs.off("click");
		$tabs.on("click", e => {

			if(e.currentTarget.classList.contains("help")) {
				return;
			}

			if(e.currentTarget.classList.contains("selected")) {
				this.settings.reverseOrder = !this.settings.reverseOrder;
				this.saveSettings();
			}
			
			for(let i = 0; i < tabs.length; i++) if(tabs[i].classList.contains("selected")) tabs[i].classList.remove("selected");

			this.openWindow(e.currentTarget.classList[1]);

			e.currentTarget.classList.add("selected");

		});

		document.getElementsByClassName("ml-tab-button " + type)[0].classList.add("selected");

		let backdrop = document.getElementsByClassName("ml-backdrop")[0], $backdrop = $(backdrop);

		$backdrop.off("click");
		$backdrop.on("click", () => {
			this.filter = "";
			document.getElementById("message-logger-window").outerHTML = "";
			if(this.updateWindow) clearInterval(this.updateWindow);
		});

		document.getElementsByClassName("ml-filter-help-button")[0].onclick = () => {

			BdApi.getCore().alert("Help", this.helpMessage.split("\n").join("<br><br>"));

			$backdrop.click();

		};
		
		let scroller = document.getElementById("message-logger-scroller"), messages = this.getFilteredMessages(type);
		scroller.innerHTML = "";

		if(this.updateWindow) clearInterval(this.updateWindow);

		this.updateWindow = setInterval(() => {

			if(!document.getElementById("ml-filter")) {
				clearInterval(this.updateWindow);
				return;
			}

			this.filter = document.getElementById("ml-filter").value;

			if(this.getFilteredMessages(type).length != messages.length) this.openWindow(type);
			
		}, 1000);

		let lastMessage, group;

		for(let i = 0; i < messages.length; i++) {

			if(messages[i].message.author == undefined) continue;

			if(lastMessage != undefined && lastMessage.author.id == messages[i].message.author.id && lastMessage.channel_id == messages[i].message.channel_id) {

				let message = group.getElementsByClassName("message-text")[0], accessory = group.getElementsByClassName("accessory")[0];

				if(messages[i].editHistory != undefined) for(let ii = 0; ii < messages[i].editHistory.length; ii++) message.insertAdjacentHTML("beforeend", `<div class="markup" style="opacity:0.5">${messages[i].editHistory[ii].content}<div class="markup ml-edit-timestamp">${messages[i].editHistory[ii].editedAt}</div></div>`);

				message.insertAdjacentHTML("beforeend", `<div class="markup" data-message-id="${messages[i].message.id}">${messages[i].message.content}</div>`);

				for(let ii = 0; ii < messages[i].message.attachments.length; ii++) accessory.insertAdjacentHTML("beforeend", `<img src="${messages[i].message.attachments[ii].url}" height="auto" width="${Math.clamp(messages[i].message.attachments[ii].width, 200, 650)}px">`);

				continue;

			}

			lastMessage = messages[i].message;

			group = this.messageGroupItem(messages[i], type);

			group.addEventListener("contextmenu", e => {

				e.preventDefault();

				let user = this.getUser(messages[i].message.author.id), channel = this.getChannel(messages[i].message.channel_id), items = [], messageID = e.target.getAttribute("data-message-id");

				if(e.target.tagName == "IMG") {

					let filename = e.target.src.substring(e.target.src.lastIndexOf("/") + 1, e.target.src.lastIndexOf("?") == -1 ? e.target.src.length : e.target.src.lastIndexOf("?"));

					items.push(NeatoLib.ContextMenu.createItem(filename));

					items.push(NeatoLib.ContextMenu.createItem("Save To Folder", () => {
						NeatoLib.browseForFile(folder => {
							NeatoLib.downloadFile(e.target.src, folder.path, filename);
						}, { directory : true });
					}));

				}

				if(e.target.classList.contains("markup")) {

					if(messageID != undefined) {

						if(channel != undefined && this.getMessage(channel.id, messages[i].message.id) != undefined) {
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
							let ii = messageA.findIndex(x => x.message.id == messageID);
							if(ii != -1) messageA.splice(ii, 1);
							this.saveData();
							NeatoLib.ContextMenu.close();
							this.openWindow(type);
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
				
				this.getContextMenu().style.zIndex = "10000";
				document.getElementsByClassName(this.classes.item)[0].addEventListener("click", () => $backdrop.click());

			});

			scroller.insertAdjacentElement(this.settings.reverseOrder == true ? "afterbegin" : "beforeend", group);

		}

		if(type == "ghostpings") return;

		scroller.insertAdjacentHTML(this.settings.clearButtonOnTop ? "afterbegin" : "beforeend", `<div id="ml-clear-log-button" class="message-group hide-overflow" style="cursor:pointer;">
			<div class="comment" style="text-align:center;">
				<div class="message">
					<div class="body">
						<h2 class="old-h2"><span class="username-wrapper"><strong class="user-name" style="color:white">Clear</strong></span></h2>
					</div>
				</div>
			</div>
		</div>`);

		document.getElementById("ml-clear-log-button").addEventListener("click", () => {
			NeatoLib.UI.createPrompt("ml-clear-log-prompt", "Clear log", `Are you sure you want to clear all ${type} messages?`, prompt => {
				if(type == "sent") this.messageRecord = [];
				if(type == "edited") this.editedMessageRecord = [];
				if(type == "deleted") this.deletedMessageRecord = [];
				this.saveData();
				NeatoLib.showToast("Log cleared!", "success");
				this.openWindow(type);
				prompt.close();
			});
		});

	}

	getFilteredMessages(type) {
		
		let messages;

		if(type == "sent") messages = this.messageRecord.slice(0);
		if(type == "edited") messages = this.editedMessageRecord.slice(0);
		if(type == "deleted") messages = this.deletedMessageRecord.slice(0);
		if(type == "ghostpings") messages = Array.filter(this.deletedMessageRecord, x => Array.from(x.message.mentions, y => y.id).includes(this.localUser.id));
		
		let filters = this.filter.split(",");

		for(let i = 0; i < filters.length; i++) {

			let split = filters[i].split(":");
			if(split.length < 2) continue;

			let filterType = split[0].trim().toLowerCase(), filter = split[1].trim().toLowerCase();

			if(filterType == "server") messages = Array.filter(messages, x => {
				let guild = this.getServer(x.message.guild_id);
				return x.message.guild_id == filter || (guild != undefined && guild.name.toLowerCase().includes(filter));
			});

			if(filterType == "channel") messages = Array.filter(messages, x => {
				let channel = this.getChannel(x.message.channel_id);
				return x.message.channel_id == filter || (channel != undefined && channel.name.toLowerCase().includes(filter.replace("#", "")));
			});

			if(filterType == "message" || filterType == "content") messages = Array.filter(messages, x => x.message.id == filter || x.message.content.toLowerCase().includes(filter));

			if(filterType == "user") messages = Array.filter(messages, x => x.message.author.id == filter || x.message.author.username.toLowerCase().includes(filter) || (x.message.member != undefined && x.message.member.nick != null && x.message.member.nick.toLowerCase().includes(filter)));

		}

		return messages;

	}

	messageGroupItem(data, type) {

		let details = "", server, channel = this.getChannel(data.message.channel_id);

		if(channel != undefined) server = this.getServer(channel.guild_id);

		if(type == "sent") details = "Sent in";
		if(type == "edited") details = "Last edit in";
		if(type == "deleted") details = "Deleted from";

		details += server && channel ? ` ${server.name}, #${channel.name} ` : " DM ";

		details += `at ${data.timestamp}`;

		let history = "";

		if(data.editHistory != undefined) for(let i = 0; i < data.editHistory.length; i++) history += `<div class="markup" style="opacity:0.5">${data.editHistory[i].content}<div class="markup ml-edit-timestamp">${data.editHistory[i].editedAt}</div></div>`;

		let attachments = "";

		if(data.message.attachments.length > 0) {
			for(let i = 0; i < data.message.attachments.length; i++) {
				let img = data.message.attachments[i];
				attachments += `<img src="${img.url}" height="auto" width="${Math.clamp(img.width, 200, 650)}px">`;
			}
		}

		let element = document.createElement("div");

		element.setAttribute("class", "message-group hide-overflow");

		element.innerHTML =
		`<div class="avatar-large stop-animation ml-message-avatar" style="background-image: url(&quot;${this.getAvatarOf(data.message.author)}&quot;);"></div>
			<div class="comment">
				<div class="message">
					<div class="body">
						<h2 class="old-h2"><span class="username-wrapper"><strong class="user-name ml-message-username" style="color: white">${data.message.member == undefined || data.message.member.nick == null ? data.message.author.username : data.message.member.nick}</strong></span><span class="highlight-separator"> - </span><span class="timestamp">${details}</span></h2>
					<div class="message-text">
						${history}
						<div class="markup" data-message-id="${data.message.id}">${data.message.content}</div>
					</div>
				</div>
				<div class="accessory">${attachments}</div>
			</div>
		</div>`;

		return element;

	}

	getAvatarOf(user) {
		return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
	}

	onGuildContext(e) {

		if(this.settings.type == "all") return;

		let id = e.target.parentElement.href.match(/\d+/)[0], updateButtonContent = () => {
			button.firstChild.innerText = (this.settings.list.includes(id) ? "Remove From " : "Add To ") + (this.settings.type == "blacklist" ? "Blacklist" : "Whitelist");
		};

		let button = NeatoLib.ContextMenu.createItem("...", () => {

			if(this.settings.list.includes(id)) this.settings.list.splice(this.settings.list.indexOf(id), 1);
			else this.settings.list.push(id);

			this.saveSettings();

			updateButtonContent();

		});

		updateButtonContent();

		document.getElementsByClassName(this.classes.itemGroup)[1].appendChild(NeatoLib.ContextMenu.createSubMenu("Message Logger", [button], { callback : () => {
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
		this.saveData();
	}
	
    stop() {

		NeatoLib.unpatchInternalFunction("handleMessage", this.getName());

		NeatoLib.unpatchInternalFunction("dispatch", this.getName());
		
		this.$document.off("contextmenu.MessageLogger");
		this.$document.off("keydown.MessageLogger");

		if(this.updateWindow) clearInterval(this.updateWindow);

		if(this.messageObserver) this.messageObserver.disconnect();

		NeatoLib.Events.detach("switch", this.switchEvent);

		this.unregisterKeybinds();

	}
	
}
