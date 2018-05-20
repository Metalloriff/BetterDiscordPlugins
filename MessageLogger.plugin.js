//META{"name":"MessageLogger"}*//

class MessageLogger {
	
    getName() { return "MessageLogger"; }
    getDescription() { return "Records all sent messages, message edits and message deletions in the specified servers, all unmuted servers or all servers, and in direct messages."; }
    getVersion() { return "0.2.2"; }
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

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleSwitch("Ignore muted channels and servers", this.settings.ignoreMuted, () => {
				this.settings.ignoreMuted = !this.settings.ignoreMuted;
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleSwitch("Ignore bots", this.settings.ignoreBots, () => {
				this.settings.ignoreBots = !this.settings.ignoreBots;
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleSwitch("Ignore messages posted by you", this.settings.ignoreSelf, () => {
				this.settings.ignoreSelf = !this.settings.ignoreSelf;
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleSwitch("Disable log window keybind (Ctrl + M)", this.settings.disableKeybind, () => {
				this.settings.disableKeybind = !this.settings.disableKeybind;
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createTextField("Saved message cap", "number", this.settings.cap, e => {
				this.settings.cap = e.target.value;
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createRadioGroup("ml-sort-type", "Sort direction", [
				{ title : "New - old", value : true },
				{ title : "Old - new", value : false }
			], this.settings.reverseOrder, (choiceButton, choice) => {
				this.settings.reverseOrder = choice.value;
				this.saveSettings();
			}, "Hint: You can also click the selected tab to reverse the order direction."), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createRadioGroup("ml-visibility-type", "Log type", [
				{ title : "All", value : "all" },
				{ title : "Whitelist", value : "whitelist" },
				{ title : "Blacklsit", value : "blacklist" }
			], this.settings.type, (choiceButton, choice) => {
				this.settings.type = choice.value;
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleGroup("ml-toast-toggles", "Display toast notifications for every", [
				{ title : "Message sent", value : "sent", setValue : this.settings.toastToggles.sent },
				{ title : "Message edited", value : "edited", setValue : this.settings.toastToggles.edited },
				{ title : "Message deleted", value : "deleted", setValue : this.settings.toastToggles.deleted }
			], choice => {
				this.settings.toastToggles[choice.value] = !this.settings.toastToggles[choice.value];
				this.saveSettings();
			}), this.getName());

			Metalloriff.Settings.pushChangelogElements(this);

		}, 0);

        return Metalloriff.Settings.Elements.pluginNameLabel(this.getName());
        
	}
	
	saveSettings() {
		PluginUtilities.saveSettings(this.getName(), this.settings);
	}

	saveData() {
		PluginUtilities.saveData(this.getName() + "Data", "data", {
			deletedMessageRecord : this.deletedMessageRecord,
			editedMessageRecord : this.editedMessageRecord
		});
	}
	
	initialize() {

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/MessageLogger.plugin.js");

		this.settings = PluginUtilities.loadSettings(this.getName(), {
			displayUpdateNotes : true,
			ignoreMuted : true,
			ignoreBots : true,
			ignoreSelf : false,
			cap : 50,
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
			displayUpdateNotes : true
		});

		let data = PluginUtilities.loadData(this.getName() + "Data", "data", {
			deletedMessageRecord : [],
			editedMessageRecord : []
		});

		this.messageRecord = [];
		this.deletedMessageRecord = data.deletedMessageRecord;
		this.editedMessageRecord = data.editedMessageRecord;

		this.getUser = DiscordModules.UserStore.getUser;
		this.getServer = DiscordModules.GuildStore.getGuild;
		this.getChannel = DiscordModules.ChannelStore.getChannel;

		this.openUserContextMenu = InternalUtilities.WebpackModules.findByUniqueProperties(["openUserContextMenu"]).openUserContextMenu;

		this.isMuted = InternalUtilities.WebpackModules.findByUniqueProperties(["isMuted"]).isMuted;

		this.filter = "";

		this.$document = $(document);
		this.$document.on("contextmenu.MessageLogger", e => {
			if(e.target.parentElement.classList.contains("guild-inner")) this.onGuildContext(e);
			if(e.target.parentElement.classList.contains("message-text")) this.onMessageContext();
		});

		this.$document.on("keydown.MessageLogger", e => {

			if(e.key == "Escape") $(".ml-backdrop").click();

			let channel = Metalloriff.getSelectedChannel();
			if(channel && !this.settings.disableKeybind && e.ctrlKey && e.altKey && e.key == "m") this.filter = "channel: " + channel.id;

			if(!this.settings.disableKeybind && e.ctrlKey && e.key == "m") this.openWindow("sent");

		});

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

		this.helpMessage = 
		`
			Filter help:

			"server: <servername or serverid>" - Filter results with the specified server name or id.
			"channel: <channelname or channelid>" - Filter results with the specified channel name or id.
			"user: <username, nickname or userid>" - Filter results with the specified username, nickname or userid.
			"message: <search>" or "content: <search>" - Filter results with the specified message content.

			Separate the search tags with commas.
			Example: server: tom's bd stuff, message: heck


			Shortcut help:

			"Ctrl + M" - Open message log.
			"Ctrl + Alt + M" - Open message log with selected channel filtered.
		`;
		
	}

	onLibLoaded() {

		this.classes = Metalloriff.getClasses(["contextMenu"]);

		this.localUser = PluginUtilities.getCurrentUser();

		this.electron = require("electron");

		this.getMessage = InternalUtilities.WebpackModules.findByUniqueProperties(["getMessages"]).getMessage;

		this.transitionTo = InternalUtilities.WebpackModules.findByUniqueProperties(["transitionTo"]).transitionTo;
		
        Metalloriff.unpatchInternalFunction("handleMessage", this.getName());
        Metalloriff.patchInternalFunction("handleMessage", data => {

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
            if(this.deletedMessageRecord.length >= this.settings.cap) this.deletedMessageRecord.splice(0, 1);
			if(this.editedMessageRecord.length >= this.settings.cap) this.editedMessageRecord.splice(0, 1);

            if(data.type == "MESSAGE_DELETE") {

				let deletedMessage = this.messageRecord.find(x => x.message.id == data.id);

				if(deletedMessage == undefined || this.deletedMessageRecord.find(x => x.message.id == data.id)) return;
				
				deletedMessage.timestamp = timestamp;

				if(this.settings.toastToggles.deleted) {
					if(server && channel) PluginUtilities.showToast(`Message deleted in ${server.name}, #${channel.name}.`, { type : "error", icon : server.getIconURL() });
					else PluginUtilities.showToast("Message deleted in DM.", { type : "error", icon : this.getAvatarOf(deletedMessage.message.author) });
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
						if(server && channel) PluginUtilities.showToast(`Message edited in ${server.name}, #${channel.name}.`, { icon : server.getIconURL() });
						else PluginUtilities.showToast("Message edited in DM.", { icon : this.getAvatarOf(lastMessage.message.author) });
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
				if(server && channel) PluginUtilities.showToast(`Message sent in ${server.name}, #${channel.name}.`, { type : "success", icon : server.getIconURL() });
				else PluginUtilities.showToast("Message sent in DM.", { type : "success", icon : this.getAvatarOf(data.message.author) });
			}

			this.messageRecord.push(data);

		}, this.getName());
		
		if(this.settings.displayUpdateNotes) Metalloriff.Changelog.compareVersions(this.getName(), this.getChanges());

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
			document.getElementById("message-logger-window").outerHTML = "";
			this.filter = "";
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

			this.filter = document.getElementById("ml-filter").value;

			if(this.getFilteredMessages(type).length != messages.length) this.openWindow(type);
			
		}, 1000);

		let lastMessage, group;

		for(let i = 0; i < messages.length; i++) {

			if(messages[i].message.author == undefined) continue;

			if(lastMessage != undefined && lastMessage.author.id == messages[i].message.author.id && lastMessage.channel_id == messages[i].message.channel_id) {

				let message = group.getElementsByClassName("message-text")[0];

				if(messages[i].editHistory != undefined) for(let ii = 0; ii < messages[i].editHistory.length; ii++) message.insertAdjacentHTML("beforeend", `<div class="markup" style="opacity:0.5">${messages[i].editHistory[ii].content}<div class="markup ml-edit-timestamp">${messages[i].editHistory[ii].editedAt}</div></div>`);

				message.insertAdjacentHTML("beforeend", `<div class="markup">${messages[i].message.content}</div>`);

				continue;

			}

			lastMessage = messages[i].message;

			group = this.messageGroupItem(messages[i], type);

			group.addEventListener("contextmenu", e => {

				e.preventDefault();

				let user = this.getUser(messages[i].message.author.id), channel = this.getChannel(messages[i].message.channel_id);

				if(e.target.classList.contains("markup")) {

					let menu = new PluginContextMenu.Menu();

					if(channel != undefined && this.getMessage(channel.id, messages[i].message.id) != undefined) menu.addItems(
						new PluginContextMenu.ItemGroup().addItems(
							new PluginContextMenu.TextItem("Jump To", { callback : () => {
								this.transitionTo(`/channels/${messages[i].message.guild_id}/${messages[i].message.channel_id}?jump=${messages[i].message.id}`);
								$backdrop.click();
								this.getContextMenu().style.display = "none";
							}})
						)
					);

					menu.addItems(new PluginContextMenu.ItemGroup().addItems(
						new PluginContextMenu.TextItem("Copy Text", { callback : () => {
							this.electron.clipboard.writeText(messages[i].message.content);
							this.getContextMenu().style.display = "none";
							PluginUtilities.showToast("Text copied to clipboard!", { type : "success" });
						}})
					));

					menu.show(e.clientX, e.clientY);
				
					this.getContextMenu().style.zIndex = "10000";

					return;

				}

				if(!user || !channel) return;

				this.openUserContextMenu(e, user, channel);
				
				this.getContextMenu().style.zIndex = "10000";
				document.getElementsByClassName(this.classes.item)[0].addEventListener("click", () => $backdrop.click());

			});

			scroller.insertAdjacentElement(this.settings.reverseOrder == true ? "afterbegin" : "beforeend", group);

		}

		if(type == "ghostpings") return;

		scroller.insertAdjacentHTML("beforeend", `<div id="ml-clear-log-button" class="message-group hide-overflow" style="cursor:pointer;">
			<div class="comment" style="text-align:center;">
				<div class="message">
					<div class="body">
						<h2 class="old-h2"><span class="username-wrapper"><strong class="user-name" style="color:white">Clear</strong></span></h2>
					</div>
				</div>
			</div>
		</div>`);

		document.getElementById("ml-clear-log-button").addEventListener("click", () => {
			Metalloriff.UI.createPrompt("ml-clear-log-prompt", "Clear log", `Are you sure you want to clear all ${type} messages?`, prompt => {
				if(type == "sent") this.messageRecord = [];
				if(type == "edited") this.editedMessageRecord = [];
				if(type == "deleted") this.deletedMessageRecord = [];
				this.saveData();
				PluginUtilities.showToast("Log cleared!", { type : "success" });
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
				return x.message.channel_id == filter ||  (channel != undefined && channel.name.toLowerCase().includes(filter.replace("#", "")));
			});

			if(filterType == "message" || filterType == "content") messages = Array.filter(messages, x => x.message.content.toLowerCase().includes(filter));

			if(filterType == "user") messages = Array.filter(messages, x => x.message.author.id == filter || x.message.author.username.toLowerCase().includes(filter) || (x.message.member != undefined && x.message.member.nick != null && x.message.member.nick.toLowerCase().includes(filter)));

		}

		return messages;

	}

	messageGroupItem(data, type) {

		let details = "", server, channel = this.getChannel(data.message.channel_id);

		if(channel != undefined) server = this.getServer(channel.guild_id);

		if(type == "sent") details = "Sent in";
		if(type == "edited") details = "Last edit in";
		if(type == "deleted") details = "Deleted in";

		details += server && channel ? ` ${server.name}, #${channel.name} ` : " DM ";

		details += `at ${data.timestamp}`;

		let history = "";

		if(data.editHistory != undefined) for(let i = 0; i < data.editHistory.length; i++) history += `<div class="markup" style="opacity:0.5">${data.editHistory[i].content}<div class="markup ml-edit-timestamp">${data.editHistory[i].editedAt}</div></div>`;

		let attachments = "";

		if(data.message.attachments.length > 0) {
			for(let i = 0; i < data.message.attachments.length; i++) {
				let img = data.message.attachments[i];
				attachments += `<img src="${img.url}" height="auto" width="100%">`;
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
						<div class="markup">${data.message.content}</div>
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

		let id = e.target.href.match(/\d+/)[0], updateButtonContent = () => {
			button.element[0].firstChild.innerText = (this.settings.list.includes(id) ? "Remove From " : "Add To ") + (this.settings.type == "blacklist" ? "Blacklist" : "Whitelist");
		};

		let button = new PluginContextMenu.TextItem("...", { callback : () => {

			if(this.settings.list.includes(id)) this.settings.list.splice(this.settings.list.indexOf(id), 1);
			else this.settings.list.push(id);

			this.saveSettings();

			updateButtonContent();

		}});

		updateButtonContent();

		document.getElementsByClassName(this.classes.itemGroup)[1].insertAdjacentElement("beforeend", new PluginContextMenu.SubMenuItem("Message Logger", new PluginContextMenu.Menu().addItems(button)).element[0]);

	}

	onMessageContext() {

		let menu = new PluginContextMenu.Menu();

		menu.addItems(
			new PluginContextMenu.TextItem("View Sent Messages", { callback : () => { this.openWindow("sent"); this.getContextMenu().style.display = "none"; }}),
			new PluginContextMenu.TextItem("View Deleted Messages", { callback : () => { this.openWindow("deleted"); this.getContextMenu().style.display = "none"; }}),
			new PluginContextMenu.TextItem("View Edited Messages", { callback : () => { this.openWindow("edited"); this.getContextMenu().style.display = "none"; }}),
			new PluginContextMenu.TextItem("View Ghost Pings", { callback : () => { this.openWindow("ghostpings"); this.getContextMenu().style.display = "none"; }}),
			new PluginContextMenu.TextItem("Settings", { callback : () => Metalloriff.Settings.showPluginSettings(this.getName()) })
		);

		let itemGroups = document.getElementsByClassName(this.classes.itemGroup);

		itemGroups[itemGroups.length - 1].insertAdjacentElement("beforeend", new PluginContextMenu.SubMenuItem("Message Logger", menu).element[0]);

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

		Metalloriff.unpatchInternalFunction("handleMessage", this.getName());
		
		this.$document.off("contextmenu.MessageLogger");
		this.$document.off("keydown.MessageLogger");

		if(this.updateWindow) clearInterval(this.updateWindow);

	}
	
}
