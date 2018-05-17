//META{"name":"MessageLogger"}*//

class MessageLogger {
	
    getName() { return "MessageLogger"; }
    getDescription() { return "Records all sent messages, message edits and message deletions in the specified servers, all unmuted servers or all servers."; }
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

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleSwitch("Ignore muted channels and servers", this.settings.ignoreMuted, () => {
				this.settings.ignoreMuted = !this.settings.ignoreMuted;
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
		PluginUtilities.saveData(this.getName(), "data", {
			messageRecord : this.messageRecord,
			deletedMessageRecord : this.deletedMessageRecord,
			editedMessageRecord : this.editedMessageRecord
		});
	}
	
	initialize() {

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/MessageLogger.plugin.js");

		this.settings = PluginUtilities.loadSettings(this.getName(), {
			displayUpdateNotes : true,
			ignoreMuted : true,
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
			disableKeybind : false
		});

		let data = PluginUtilities.loadData(this.getName(), "data", {
			messageRecord : [],
			deletedMessageRecord : [],
			editedMessageRecord : []
		});

		this.messageRecord = data.messageRecord;
		this.deletedMessageRecord = data.deletedMessageRecord;
		this.editedMessageRecord = data.editedMessageRecord;

		this.getUser = DiscordModules.UserStore.getUser;
		this.getServer = DiscordModules.GuildStore.getGuild;
		this.getChannel = DiscordModules.ChannelStore.getChannel;

		this.isMuted = InternalUtilities.WebpackModules.findByUniqueProperties(["isMuted"]).isMuted;

		this.$document = $(document);
		this.$document.on("contextmenu.MessageLogger", e => {
			if(e.target.parentElement.classList.contains("guild-inner")) this.onGuildContext();
			if(e.target.parentElement.classList.contains("message-text")) this.onMessageContext();
		});

		this.$document.on("keydown.MessageLogger", e => {
			if(e.key == "Escape") $(".ml-backdrop").click();
			if(!this.settings.disableKeybind && e.ctrlKey && e.key == "m") this.openWindow("ghostpings");
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
		
	}

	onLibLoaded() {

		this.classes = Metalloriff.getClasses(["contextMenu"]);
		
        Metalloriff.unpatchInternalFunction("handleMessage", this.getName());
        Metalloriff.patchInternalFunction("handleMessage", data => {

			if(data.message != undefined && data.message.state === "SENDING") return;

			var channel = this.getChannel(data.message == undefined ? data.channelId : data.message.channel_id), server = this.getServer(channel.guild_id);

			if(this.settings.ignoreMuted && channel != undefined && (this.isMuted(data.channelId) || this.isMuted(channel.guild_id))) return;

			if(this.settings.type == "whitelist" && !this.settings.list.includes(channel.guild_id)) return;

			if(this.settings.type == "blacklist" && this.settings.list.includes(channel.guild_id)) return;
				
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

			let existingIDX = this.messageRecord.findIndex(x => x.message.id == data.message.id);

			if(existingIDX != -1) {

				if(this.messageRecord[existingIDX].edited === true) return;

				this.messageRecord.splice(existingIDX, 1);

			}

			if(data.message.content == undefined || (data.message.content.trim().length == 0 && data.message.attachments.length == 0)) return;

			if(this.settings.toastToggles.sent) {
				if(server && channel) PluginUtilities.showToast(`Message sent in ${server.name}, #${channel.name}.`, { type : "success", icon : server.getIconURL() });
				else PluginUtilities.showToast("Message sent in DM.", { type : "success", icon : this.getAvatarOf(data.message.author) });
			}

			this.messageRecord.push(data);
			
			this.saveData();

        }, this.getName());

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
			max-height: 700px;
			overflow-y: scroll;
			overflow-x: hidden;
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

		.ml-tab-button:hover {
			background-color: rgba(150, 150, 150, 0.3);
		}

		.ml-tab-button.selected {
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

        </style>

        <div class="ml-backdrop"></div>
            <div class="ml-scroller-wrapper">
                <div class="ml-label">
					<h2>Message Logger</h2>
					<div style="text-align:center">
						<div class="ml-tab-button created">Sent Messages</div>
						<div class="ml-tab-button removed">Deleted Messages</div>
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
		$backdrop.on("click", () => { document.getElementById("message-logger-window").outerHTML = ""; });
		
		let scroller = document.getElementById("message-logger-scroller"), messages, my = PluginUtilities.getCurrentUser();
		scroller.innerHTML = "";

		if(type == "created") messages = this.messageRecord.slice(0);
		if(type == "edited") messages = this.editedMessageRecord.slice(0);
		if(type == "removed") messages = this.deletedMessageRecord.slice(0);
		if(type == "ghostpings") messages = Array.filter(this.deletedMessageRecord, x => Array.from(x.message.mentions, y => y.id).includes(my.id));

		if(this.settings.reverseOrder == true) messages.reverse();

		for(let i = 0; i < messages.length; i++) {

			if(messages[i].message.author == undefined) continue;

			let group = this.messageGroupItem(messages[i], type);

			scroller.insertAdjacentElement("beforeend", group);

		}

	}

	messageGroupItem(data, type) {

		let details = "", server, channel = this.getChannel(data.message.channel_id);

		if(channel != undefined) server = this.getServer(channel.guild_id);

		if(type == "created") details = "Sent in";
		if(type == "edited") details = "Last edit in";
		if(type == "removed") details = "Removed from";

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
		`<div class="avatar-large stop-animation" style="background-image: url(&quot;${this.getAvatarOf(data.message.author)}&quot;);"></div>
			<div class="comment">
				<div class="message">
					<div class="body">
						<h2 class="old-h2"><span class="username-wrapper"><strong class="user-name" style="color: white">${data.message.member == undefined || data.message.member.nick == null ? data.message.author.username : data.message.member.nick}</strong></span><span class="highlight-separator"> - </span><span class="timestamp">${details}</span></h2>
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

	onGuildContext() {

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

		menu.addItems(new PluginContextMenu.TextItem("View Sent Messages", { callback : () => { this.openWindow("created"); document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none"; }}))
		.addItems(new PluginContextMenu.TextItem("View Deleted Messages", { callback : () => { this.openWindow("removed"); document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none"; }}))
		.addItems(new PluginContextMenu.TextItem("View Edited Messages", { callback : () => { this.openWindow("edited"); document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none"; }}))
		.addItems(new PluginContextMenu.TextItem("View Ghost Pings", { callback : () => { this.openWindow("ghostpings"); document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none"; }}));

		let itemGroups = document.getElementsByClassName(this.classes.itemGroup);

		itemGroups[itemGroups.length - 1].insertAdjacentElement("beforeend", new PluginContextMenu.SubMenuItem("Message Logger", menu).element[0]);

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

	}
	
}