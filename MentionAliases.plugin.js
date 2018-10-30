//META{"name":"MentionAliases","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/MentionAliases.plugin.js"}*//

class MentionAliases {
	
    getName() { return "Mention Aliases"; }
    getDescription() { return "Allows you to set an alias for users that you can @mention them with. You also have the choice to display their alias next to their name. A use example is setting your friends' aliases as their first names. Only replaces the alias with the mention if the user is in the server you mention them in. You can also do @owner to mention the owner of a guild."; }
    getVersion() { return "0.8.22"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			"0.4.11" :
			`
				Added this neato burrito crappy little change log. There will be settings for it soon. (disabling it, viewing the full change log)
				Added a keybind for opening the alias list. (Ctrl + Shift + @)
				Added an X button to close out of the aliases list.
				You can now close the alias list with escape.
				Added the alias box to user popouts.
				Added the owner of the selected server at the top of the alias list.
				Fixed @owner tag.
			`,
			"0.5.12" : 
			`
				Fixed the alias list button deciding to take up half the window when it felt like it.
				Added a view changelog button.
				Added a setting for displaying the changelog upon update.
			`,
			"0.5.13" : 
			`
				Fixed alias tags not showing next to users with default profile pictures.
				Fixed alias tags in the DM list moving to the left when a user started or stopped playing a game.
			`,
			"0.6.14" :
			`
				Added a context menu to users.
				Added alias groups.
				Redid the settings menu.
			`,
			"0.7.14" :
			`
				Fixed a few really dumb bugs.
				Fixed @owner... again.
				Added a "display alias field on user popouts" setting.
			`,
			"0.8.14" :
			`
				Rewrote the plugin entirely, fixing a bunch of bugs and improving performance.
				Added server owner tags.
				Fixed the aliases menu.
				Clicking out of the aliases menu will now close it.
				Tags now display in voice channels.
				Tags now display next to user join messages
			`,
			"0.8.16" :
			`
				The alias text color will change to black if the background is bright.
				Toggling display alias tags will no longer require you to switch servers to take affect.
				Fixed pings getting confused.
			`
		};
	}

    load() {}
	
	getSettingsPanel() {

		setTimeout(() => {

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleGroup("ma-toggles", "Settings", [
				{ title : "Display alias tags next to users", value : "displayTags", setValue : this.settings.displayTags },
				{ title : "Display alias list button (you can still open the list with Ctrl + Shift + @)", value : "displayButton", setValue : this.settings.displayButton },
				{ title : "Display alias field on user popouts", value : "displayOnPopout", setValue : this.settings.displayOnPopout },
				{ title : "Display server owner tags", value : "displayOwnerTags", setValue : this.settings.displayOwnerTags }
			], choice => {
				this.settings[choice.value] = !this.settings[choice.value];
				this.saveSettings();
			}), this.getName());
			
			Metalloriff.Settings.pushChangelogElements(this);

		}, 0);

		return Metalloriff.Settings.Elements.pluginNameLabel("Mention Aliases");
		
	}

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

	saveSettings() {
		this.updateAllTags();
		NeatoLib.Settings.save(this);
	}
	
	save() {
		NeatoLib.Data.save("MentionAliases", "data", {
			aliases : this.aliases,
			groups : this.groups
		});
	}
	
	onLibLoaded() {

		if(!NeatoLib.hasRequiredLibVersion(this, "0.4.16")) return;

		NeatoLib.Updates.check(this);

		this.userModule = NeatoLib.Modules.get("getUser");
		this.memberModule = NeatoLib.Modules.get("getMember");
		this.guildModule = NeatoLib.Modules.get("getGuild");

		this.settings = NeatoLib.Settings.load(this, {
			displayUpdateNotes : true,
			displayTags : true,
			displayButton : true,
			displayOnPopout : true,
			displayOwnerTags : true
		});

		let data = NeatoLib.Data.load("MentionAliases", "data", {
			aliases : {},
			groups : []
		});

		this.aliases = data.aliases;
		this.groups = data.groups;

		if(data.displayTags) this.settings.displayTags = data.displayTags;
		if(data.displayButton) this.settings.displayButton = data.displayButton;
		if(data.displayOnPopout) this.settings.displayOnPopout = data.displayOnPopout;
		
		if(this.aliases.length != undefined){
			let updatedAliases = {};
			for(let i = 0; i < this.aliases.length; i++) updatedAliases[this.aliases[i][0]] = this.aliases[i][1];
			this.aliases = updatedAliases;
		}

		this.style = NeatoLib.injectCSS(`

			.username-1cB_5E, .members-1bid1J .botTag-1OwMgs + .members-1bid1J .botTag-1OwMgs { font-size: 15px; }
			.memberInner-3XUq9K { width: 160px; }
			.nameTag-26T3kW { white-space: normal; }
			.member-3W1lQa { height: auto; }

			.ma-aliases-button {
				width: 30px;
				height: 30px;
				position: absolute;
				right: 0px;
				top: 7px;
				opacity: 0.3;
				cursor: pointer;
				transition: all 0.3s;
			}

			.ma-aliases-button:hover {
				transform: scale(1.2);
				opacity: 1;
			}

			.ma-aliases-button > img {
				width: 100%;
				height: 100%;
			}

			.ma-no-aliases-defined-label {
				text-align: center;
				color: white;
				opacity: 0.4;
				line-height: 600px;
			}

			.ma-alias-menu {
				z-index: 1000;
				position: absolute;
				left: 45%;
				bottom: 8%;
				background-color: #2f3136;
				border-radius: 5px;
				color: white;
			}

			.ma-alias-list {
				max-height: 560px;
			}

			.ma-action-buttons > * {
				opacity: 1 !important;
			}

			.ma-not-in-server {
				filter: grayscale(100%) brightness(0.5);
				transition: filter 0.3s;
			}

			.ma-not-in-server:hover {
				filter: none;
			}

			.ma-alias-list-field {
				background-color: transparent;
				color: white;
				border: none;
				flex: auto;
			}
		
		`);

		this.windowResizeEvent = () => this.onWindowResize();

		this.keydownEvent = e => {

			if(e.key == "Escape" && document.getElementsByClassName("ma-alias-menu").length){
				document.getElementsByClassName("ma-alias-menu")[0].remove();
				return;
			}

			if(e.ctrlKey && e.shiftKey && e.key == "@") {
				this.toggleAliasList();
			}

		};

		this.contextEvent = e => {
			let element = NeatoLib.DOM.searchForParentElementByClassName(e.target, NeatoLib.getClass("member")) || NeatoLib.DOM.searchForParentElementByClassName(e.target, NeatoLib.getClass("containerCozy", "container"));
			if(element) this.onUserContext(element);
		};

		this.chatboxEvent = e => {

			let chatbox = e.target;

			if((e.which == 13 || e.which == 32) && chatbox.value) {
				
				let origVal = chatbox.value, val = chatbox.value, valIgnoreCase = chatbox.value.trim().toLowerCase();

				for(let uid in this.aliases) {
					if(valIgnoreCase.indexOf(this.aliases[uid].toLowerCase()) != -1 && this.usersInServer.indexOf(uid) != -1) {
						val = val.replace(new RegExp("@" + this.aliases[uid] + "($| )", "ig"), "@" + this.userModule.getUser(uid).tag);
					}
				}

				if(valIgnoreCase.indexOf("@owner") != -1) {
					if(this.selectedGuild && this.selectedGuild.ownerId) val = val.replace(new RegExp("@owner($| )", "ig"), "@" + this.userModule.getUser(this.selectedGuild.ownerId).tag);
				}

				for(let i = 0; i < this.groups.length; i++) {

					let group = this.groups[i];

					if(valIgnoreCase.indexOf("@" + group.name.toLowerCase()) != -1) {
						let users = Array.from(group.users, uid => this.userModule.getUser(uid)), list = [];
						for(let u = 0; u < users.length; u++) if(users[u] && this.usersInServer.indexOf(users[u].id) != -1) list.push("@" + users[u].tag);
						val = val.replace(new RegExp("@" + group.name + "($| )", "ig"), list.join(" "));
					}

				}

				if(origVal != val) NeatoLib.Chatbox.setText(val);

			}

		};

		this.clickEvent = e => {
			if(!document.getElementsByClassName("ma-alias-menu")[0].contains(e.target)) this.toggleAliasList();
		};
		
		window.addEventListener("resize", this.windowResizeEvent);
		document.addEventListener("keydown", this.keydownEvent);
		document.addEventListener("contextmenu", this.contextEvent);

		this.appObserver = new MutationObserver(m => {
			
			if(m[3] && m[3].target && m[3].target instanceof Element) {
				if(m[3].target.className.includes(NeatoLib.getClass("textAreaEdit"))) {
					m[3].target.addEventListener("keydown", this.chatboxEvent);
				}
			}

			if(m[0].addedNodes.length && m[0].addedNodes[0] instanceof Element) {

				if(this.settings.displayOnPopout) {

					let popout = m[0].addedNodes[0].getElementsByClassName(NeatoLib.getClass("userPopout"))[0], uid;

					if(popout && popout.getElementsByClassName("discriminator").length) uid = NeatoLib.ReactData.getProp(popout, "user.id");

					if(uid && !document.getElementById("ma-aliasfield")) {

						NeatoLib.DOM.insertHTMLBefore(popout.getElementsByClassName("footer-1fjuF6")[0], `
						<div class="body-3iLsc4">
							<div class="bodyTitle-Y0qMQz marginBottom8-AtZOdT size12-3R0845 weightBold-2yjlgw">Alias</div>
							<div class="note-3kmerW note-3HfJZ5">
								<textarea id="ma-aliasfield" placeholder="No alias defined, click to add one" maxlength="50" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="height: 22px;">${this.aliases[uid] || ""}</textarea>
							</div>
						</div>`);

						let field = document.getElementById("ma-aliasfield");

						field.addEventListener("input", () => field.value = field.value.split(" ").join("-"));
						field.addEventListener("focusout", () => this.updateAlias(uid, field.value));

					}

				}
				
			}

			for(let i = 0; i < m.length; i++) {

				if(m[i].addedNodes.length && m[i].addedNodes[0] instanceof Element) {

					if(m[i].addedNodes[0].classList.contains("modal-1UGdnR")) {

						let popout = m[i].addedNodes[0].getElementsByClassName("inner-1JeGVc")[0], uid;
				
						if(popout && popout.getElementsByClassName("discriminator").length && (popout.getElementsByClassName(NeatoLib.getClass("body")).length || popout.getElementsByClassName(NeatoLib.getClass("userInfoSection")).length)) uid = NeatoLib.ReactData.getProp(popout.getElementsByClassName("discriminator")[0], "user.id");
						else return;
				
						if(uid && !document.getElementById("ma-aliasfield")) {
				
							NeatoLib.DOM.insertHTMLAtIndex(1, `
								<div class="userInfoSection-2acyCx"><div class="userInfoSectionHeader-CBvMDh size12-3R0845 weightBold-2yjlgw">Alias</div><div class="note-3kmerW note-QfFU8y"><textarea id="ma-aliasfield" placeholder="No alias defined, click to add one" maxlength="50" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="height: 24px;">${this.aliases[uid] || ""}</textarea></div></div>
							`, popout.getElementsByClassName("scroller-2FKFPG")[0]);
				
							let field = document.getElementById("ma-aliasfield");
				
							field.oninput = () => field.value = field.value.split(" ").join("-");
							field.onblur = () => this.updateAlias(uid, field.value);
				
						}

					}

					if(this.settings.displayTags) {

						if(m[i].addedNodes[0].classList.contains(NeatoLib.getClass("member"))) this.updateMember(m[i].addedNodes[0]);

						if(m[i].addedNodes[0].classList.contains(NeatoLib.getClass("activityIconForeground", "channel"))) this.updateMemberDM(m[i].addedNodes[0]);

						if(m[i].addedNodes[0].classList.contains("draggable-1KoBzC")) this.updateVoiceChat(m[i].addedNodes[0]);

					}

				}

			}

		});
		this.appObserver.observe(document.getElementById("app-mount"), { childList : true, subtree : true });

		if(this.settings.displayUpdateNotes == true) Metalloriff.Changelog.compareVersions(this.getName(), this.getChanges());

		this.switchEvent = () => {
			
			if(!this.ready) return;

			this.selectedGuild = NeatoLib.getSelectedGuild();

			if(document.getElementsByClassName("ma-alias-menu").length) document.getElementsByClassName("ma-alias-menu")[0].remove();
			
			this.scanMembers();

			if(this.settings.displayTags) this.updateAllTags();

			if(this.settings.displayButton) {
				if(!document.getElementById("ma-aliases-button") && NeatoLib.Chatbox.get()) {
					document.getElementsByClassName(NeatoLib.getClass("channelTextArea"))[0].insertAdjacentHTML("beforeend", `<div id="ma-aliases-button" class="ma-aliases-button"><img src="https://dl.dropbox.com/s/gko2n32hxti6248/mention_aliases_button.png"></div>`);
					document.getElementById("ma-aliases-button").onclick = () => this.toggleAliasList();
				}
				this.onWindowResize();
			} else {
				if(document.getElementById("ma-aliases-button")) document.getElementById("ma-aliases-button").remove();
				NeatoLib.Chatbox.get().style.width = "";
			}
			
		};

		NeatoLib.Events.attach("switch", this.switchEvent);
		
		NeatoLib.Events.attach("chatbox", this.chatboxAddEvent = chatbox => {
			chatbox.removeEventListener("keydown", this.chatboxEvent);
			chatbox.addEventListener("keydown", this.chatboxEvent);
		});
		
		this.messageEvent = () => this.updateMessages();

		NeatoLib.Events.attach("message", this.messageEvent);

		NeatoLib.Events.onPluginLoaded(this);

		this.switchEvent();
		
	}

	updateAllTags() {

		let tags = document.getElementsByClassName("ma-usertag");
		for(let i = tags.length - 1; i > -1; i--) tags[i].remove();

		if(!this.settings.displayTags) return;

		let members = document.getElementsByClassName(NeatoLib.getClass("member"));
		for(let i = 0; i < members.length; i++) this.updateMember(members[i]);

		let dms = document.getElementsByClassName(NeatoLib.getClass("activityIconForeground", "channel"));
		for(let i = 0; i < dms.length; i++) this.updateMemberDM(dms[i]);

		let vc = document.getElementsByClassName("draggable-1KoBzC");
		for(let i = 0; i < vc.length; i++) this.updateVoiceChat(vc[i]);

		this.updateMessages();

	}
	
	updateAlias(uid, a) {

		if(!a && this.aliases[uid]) delete this.aliases[uid];
		if(a) this.aliases[uid] = a;

		this.save();
		this.scanMembers();
		if(this.settings.displayTags) this.updateAllTags();
		
	}
	
	scanMembers() {

		if(this.selectedGuild) return this.usersInServer = Array.from(this.memberModule.getMembers(this.selectedGuild.id), u => u.userId);
		else this.usersInServer = [];

		let dmAvatars = Array.from(document.getElementsByClassName("avatar-large")).concat(Array.from(document.getElementsByClassName(NeatoLib.getClass("mask"))));

		for(let i = 0; i < dmAvatars.length; i++) {
			let uid = NeatoLib.ReactData.getProp(dmAvatars[i], "user.id");
			if(uid && this.usersInServer.indexOf(uid) == -1) this.usersInServer.push(uid);
		}
		
	}

	onWindowResize() {

		let chatbox = NeatoLib.Chatbox.get();

		if(chatbox) {
			chatbox = chatbox.parentElement;
			chatbox.style.width = "";
			chatbox.style.width = (chatbox.getBoundingClientRect().width - 40) + "px";
		} else setTimeout(() => this.onWindowResize(), 1000);

		if(document.getElementsByClassName("ma-alias-menu").length) document.getElementsByClassName("ma-alias-menu")[0].style.left = (document.getElementById("ma-aliases-button").getBoundingClientRect().left - 460) + "px";
		
	}

	toggleAliasList(aliases) {

		document.removeEventListener("click", this.clickEvent);
		if(document.getElementsByClassName("ma-alias-menu").length) return document.getElementsByClassName("ma-alias-menu")[0].remove();

		let label = aliases ? "Users In Group" : "Defined User Aliases";

		if(aliases) {
			let t = {};
			for(let i = 0; i < aliases.length; i++) temp[aliases[i]] = this.userModule.getUser(aliases[i]).username;
			aliases = t;
		} else aliases = this.aliases;

		document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `

			<div class="ma-alias-menu">
				<div style="height: 600px;width: 500px;">
					<div class="header" style="padding-bottom: 12px;">
						<div class="title" style="text-align: center;transform: translateY(6px);">${label}</div>
						<div class="actionButtons-LKmOj2 ma-action-buttons" style="position: absolute;top: 5px;">
							<div class="closeButton-2Rx3ov" onclick="$('.ma-alias-menu').remove();"></div>
						</div>
					</div>
					<div class="scroller-wrap dark">
						<div class="scroller ma-alias-list">
							<div class="ma-no-aliases-defined-label">No user aliases defined. View a user's profile to define an alias.</div>
						</div>
					</div>
				</div>
			</div>
		
		`);

		if(document.getElementById("ma-aliases-button")) document.getElementsByClassName("ma-alias-menu")[0].style.left = (document.getElementById("ma-aliases-button").getBoundingClientRect().left - 460) + "px";
		else {
			let m = document.getElementsByClassName("ma-alias-menu")[0], rect = m.getBoundingClientRect();
			m.style.left = ((window.innerWidth - rect.width) / 2) + "px";
			m.style.top = ((window.innerHeight - rect.height) / 2) + "px";
		}

		let keys = Object.keys(aliases).sort((x, y) => {
			if(aliases[x].toLowerCase() < aliases[y].toLowerCase()) return -1;
			if(aliases[x].toLowerCase() > aliases[y].toLowerCase()) return 1;
			return 0;
		}), noAliasesDefinedLabel = document.getElementsByClassName("ma-no-aliases-defined-label")[0], list = document.getElementsByClassName("ma-alias-list")[0];

		let populate = uid => {

			let user = this.userModule.getUser(uid), alias = aliases[uid];

			if(!user) user = { getAvatarURL : () => "", tag : "User not found in cache" };

			if(!alias) alias = "@owner";

			if(noAliasesDefinedLabel) noAliasesDefinedLabel.remove();

			list.insertAdjacentHTML("beforeend", `
			
				<div class="message-group hide-overflow">
					<div class="avatar-large stop-animation" style="background-image: url(${user.getAvatarURL()});"></div>
					<div class="comment" style="line-height: 40px;">
						<div class="message first">
							<div class="body">
								<h2 class="old-h2"><span class="username-wrapper"><input class="ma-alias-list-field" maxlength="30" value="${alias}"></input><span class="ma-alias-list-field ma-span" style="display:none;"></span></span><span class="highlight-separator"> - </span><span class="timestamp ma-alias-menu-user-tag">${user.tag}</span></h2>
							</div>
						</div>
					</div>
					<div class="actionButtons-LKmOj2 ma-action-buttons" style="position: relative;">
						<div class="closeButton-2Rx3ov"></div>
					</div>
				</div>
			
			`);

			list.lastElementChild.getElementsByClassName("closeButton-2Rx3ov")[0].onclick = e => {
				NeatoLib.DOM.searchForParentElementByClassName(e.target, NeatoLib.getClass("containerCozy", "container")).remove();
				this.updateAlias(uid, null);
				NeatoLib.showToast("Alias removed", "success");
			};

			if(this.usersInServer.indexOf(uid) == -1) list.lastElementChild.classList.add("ma-not-in-server");

			list.lastElementChild.onclick = () => NeatoLib.Chatbox.setText(NeatoLib.Chatbox.get().value + " @" + user.tag);

			let field = list.lastElementChild.getElementsByTagName("input")[0];

			let updateFieldSize = () => {
				let span = field.parentElement.getElementsByTagName("span")[0];
				span.innerText = field.value;
				if(span.offsetWidth > 20) field.style.width = span.offsetWidth + "px";
				else field.style.width = "20px";
			};

			field.oninput = updateFieldSize;
			field.onblur = () => this.updateAlias(uid, field.value);

		};

		if(this.selectedGuild && this.selectedGuild.ownerId) populate(this.selectedGuild.ownerId);

		let sortedInServer = Array.filter(keys, uid => this.usersInServer.indexOf(uid) != -1), sortedNotInServer = Array.filter(keys, uid => this.usersInServer.indexOf(uid) == -1);

		for(let i = 0; i < sortedInServer.length; i++) populate(sortedInServer[i]);
		for(let i = 0; i < sortedNotInServer.length; i++) populate(sortedNotInServer[i]);

		setTimeout(() => document.addEventListener("click", this.clickEvent), 0);
		
	}
	
	updateMember(added) {

		if(!added || added.getElementsByClassName("ma-usertag").length) return;

		let uid = NeatoLib.ReactData.getProp(added, "user.id");

		if(!uid) return;

		let alias = this.aliases[uid], nameTag = added.getElementsByClassName(NeatoLib.getClass("nameTag"))[0], color = nameTag.style.color, existingTag = added.getElementsByClassName("ma-usertag")[0];

		if(existingTag) existingTag.remove();

		if(alias) nameTag.insertAdjacentHTML("beforeend", `<span class="${[NeatoLib.getClass("botTagRegular"), NeatoLib.getClass("botTag"), NeatoLib.getClass("bot")].join(" ")} ma-usertag" style="background-color: ${color}; color: ${color && NeatoLib.Colors.getBrightness(color) > 0.65 ? "black" : "white"}">${alias}</span>`);
		if(this.settings.displayOwnerTags && this.selectedGuild && this.selectedGuild.ownerId == uid && !nameTag.getElementsByClassName("ma-ownertag").length) nameTag.insertAdjacentHTML("beforeend", `<span class="${[NeatoLib.getClass("botTagRegular"), NeatoLib.getClass("botTag"), NeatoLib.getClass("bot")].join(" ")} ma-usertag ma-ownertag" style="background-color: ${color}; color: ${color && NeatoLib.Colors.getBrightness(color) > 0.65 ? "black" : "white"}">Owner</span>`);
		
	}
	
	updateMemberDM(added) {

		if(!added || added.getElementsByClassName("ma-usertag").length) return;

		let uid = NeatoLib.ReactData.getProp(added.getElementsByClassName("avatar-small")[0], "user.id"), alias;

		if(uid) alias = this.aliases[uid];
		else return;

		if(alias) {
			let tag = document.createElement("span");
			tag.className = [NeatoLib.getClass("botTagRegular"), NeatoLib.getClass("botTag"), NeatoLib.getClass("bot"), "ma-usertag"].join(" ");
			tag.innerText = alias;
			added.firstChild.insertBefore(tag, added.getElementsByTagName("button")[0]);
		}
		
	}

	updateVoiceChat(added) {

		if(!added || added.getElementsByClassName("ma-usertag").length) return;

		let uid = NeatoLib.ReactData.getProp(added, "user.id"), alias;

		if(uid) alias = this.aliases[uid];
		else return;

		let par = added.getElementsByClassName("userDefault-1qtQob")[0];

		if(alias) par.insertAdjacentHTML("beforeend", `<span class="${[NeatoLib.getClass("botTagRegular"), NeatoLib.getClass("botTag"), NeatoLib.getClass("bot")].join(" ")} ma-usertag" style="vertical-align:middle;">${alias}</span>`);
		if(this.settings.displayOwnerTags && this.selectedGuild && this.selectedGuild.ownerId == uid && !added.getElementsByClassName("ma-ownertag").length) par.insertAdjacentHTML("beforeend", `<span class="${[NeatoLib.getClass("botTagRegular"), NeatoLib.getClass("botTag"), NeatoLib.getClass("bot")].join(" ")} ma-usertag ma-ownertag" style="vertical-align:middle;">Owner</span>`);

	}
	
	updateMessages() {

		if(!this.settings.displayTags) return;

		let groups = document.getElementsByClassName(NeatoLib.getClass("containerCozy", "container"));

		for(let i = 0; i < groups.length; i++) {

			let uid = NeatoLib.ReactData.getProp(groups[i], "messages.0.author.id");

			if(!uid) continue;

			let alias = this.aliases[uid], username = groups[i].getElementsByClassName(NeatoLib.getClass("asianCompactTimeStamp", "username"))[0], existingTag = groups[i].querySelector(".ma-usertag");

			if(existingTag) return;

			let par = (username ? username.parentElement : null) || groups[i].getElementsByClassName("anchor-3Z-8Bb")[0];
			if(par) {
				if(alias) par.insertAdjacentHTML("beforeend", `<span style="background-color: ${username ? username.style.color : ""}; color: ${username && NeatoLib.Colors.getBrightness(username.style.color) > 0.65 ? "black" : "white"}" class="${[NeatoLib.getClass("botTagRegular"), NeatoLib.getClass("botTag"), NeatoLib.getClass("bot")].join(" ")} ma-usertag">${alias}</span>`);
				if(this.settings.displayOwnerTags && this.selectedGuild && this.selectedGuild.ownerId == uid && !groups[i].getElementsByClassName("ma-ownertag").length) par.insertAdjacentHTML("beforeend", `<span style="background-color: ${username ? username.style.color : ""}; color: ${username && NeatoLib.Colors.getBrightness(username.style.color) > 0.65 ? "black" : "white"}" class="${[NeatoLib.getClass("botTagRegular"), NeatoLib.getClass("botTag"), NeatoLib.getClass("bot")].join(" ")} ma-usertag ma-ownertag">Server Owner</span>`);
			}

		}
		
	}

	onUserContext(ue) {

		if(!NeatoLib.ContextMenu.get()) return;

		let menu = [], user = NeatoLib.ReactData.getProp(ue, "messages.0.author") || NeatoLib.ReactData.getProps(ue).user;

		if(!user) return;

		menu.push(NeatoLib.ContextMenu.createItem("Set Alias", () => {
			let prompt = NeatoLib.UI.createTextPrompt("ma-define-alias-prompt", "Define alias", (alias, prompt) => {
				this.updateAlias(user.id, alias);
				NeatoLib.showToast("Alias set", "success");
				prompt.close();
			}, this.aliases[user.id], { secondOptionText : "Remove", secondOptionCallback : prompt => {
				this.updateAlias(user.id, null);
				NeatoLib.showToast("Alias removed", "error");
				prompt.close();
			}});
		}));

		let groupsMenu = [], groupsSubMenu = [];

		for(let i = 0; i < this.groups.length; i++) {

			let options = [], groupName = this.groups[i].name.split("-").join(" ");

			if(this.groups[i].users.indexOf(user.id) != -1) options.push(NeatoLib.ContextMenu.createItem("Remove User", () => {
				this.groups[i].users.splice(this.groups[i].users.indexOf(user.id), 1);
				this.save();
				NeatoLib.showToast("User removed from " + groupName, "error");
				NeatoLib.ContextMenu.close();
			}));
			else options.push(NeatoLib.ContextMenu.createItem("Add User", () => {
				this.groups[i].users.push(user.id);
				this.save();
				NeatoLib.showToast("User added to " + groupName, "success");
				NeatoLib.ContextMenu.close();
			}));

			options.push(NeatoLib.ContextMenu.createItem("View Users", () => {
				this.toggleAliasList(this.groups[i].users);
				NeatoLib.ContextMenu.close();
			}));

			options.push(NeatoLib.ContextMenu.createItem("Delete Group", () => {
				NeatoLib.UI.createPrompt("ma-delete-group-prompt", "Delete group?", "Are you sure you want to delete " + groupName + "?", prompt => {
					this.groups.splice(i, 1);
					this.save();
					NeatoLib.showToast("Group deleted", "error");
					prompt.close();
				});
				NeatoLib.ContextMenu.close();
			}));

			groupsSubMenu.push(NeatoLib.ContextMenu.createSubMenu(groupName, options));

		}

		if(!groupsSubMenu.length) groupsSubMenu.push(NeatoLib.ContextMenu.createItem("No Groups Found", null, { color : "rgba(255, 255, 255, 0.25)" }));

		groupsMenu.push(NeatoLib.ContextMenu.createGroup(groupsSubMenu));

		groupsMenu.push(NeatoLib.ContextMenu.createGroup([
			NeatoLib.ContextMenu.createItem("Create Group", () => {
				let prompt = NeatoLib.UI.createTextPrompt("ma-create-group-prompt", "Create alias group", (name, prompt) => {
					if(this.groups.findIndex(g => g.name == name) == -1) {
						this.groups.push({ name : name, users : [] });
						this.save();
						NeatoLib.showToast("Group created", "success");
						prompt.close();
					} else NeatoLib.showToast("A group with this name already exists", "error");
				}, "", { confirmText : "Create" });
				prompt.getElementsByTagName("input")[0].addEventListener("input", e => e.target.value = e.target.value.split(" ").join("-"));
				NeatoLib.ContextMenu.close();
			}),
			NeatoLib.ContextMenu.createItem("Plugin Settings", () => NeatoLib.Settings.showPluginSettings(this.getName()))
		]));

		menu.push(NeatoLib.ContextMenu.createSubMenu("Groups", groupsMenu));

		(NeatoLib.ContextMenu.get().children[1] || NeatoLib.ContextMenu.get().firstChild).appendChild(NeatoLib.ContextMenu.createSubMenu("Mention Aliases", menu));

	}
	
    stop() {

		if(this.style) this.style.destroy();

		let chatbox = NeatoLib.Chatbox.get();

		if(chatbox) {
			chatbox.removeEventListener("keydown", this.chatboxEvent);
			chatbox.style.width = "";
		}

		if(this.appObserver) this.appObserver.disconnect();

		if(document.getElementById("ma-aliases-button")) document.getElementById("ma-aliases-button").remove();
		if(document.getElementsByClassName("ma-alias-menu").length) document.getElementsByClassName("ma-alias-menu")[0].remove();

		window.removeEventListener("resize", this.windowResizeEvent);
		document.removeEventListener("keydown", this.keydownEvent);
		document.removeEventListener("contextmenu", this.contextEvent);
		document.removeEventListener("click", this.clickEvent);
		
		NeatoLib.Events.detach("switch", this.switchEvent);
		NeatoLib.Events.detach("chatbox", this.chatboxAddEvent);
		NeatoLib.Events.detach("message", this.messageEvent);

	}
	
}