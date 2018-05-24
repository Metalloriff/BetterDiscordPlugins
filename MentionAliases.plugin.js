//META{"name":"MentionAliases"}*//

class MentionAliases {
	
	constructor() {
		this.initialized = false;
		this.aliases = {};
		this.usersInServer = [];
		this.groups = [];
		this.displayTags = true;
		this.displayButton = true;
		this.displayOnPopout = true;
		this.defaultSettings = { displayUpdateNotes : true };
		this.settings = this.defaultSettings;
		this.messageObserver = null;
		this.popoutObserver = null;
		this.userModule;
		this.memberModule;
		this.guildModule;
	}
	
	get themeType(){
		if(document.getElementsByClassName("theme-dark").length > 0) return "dark";
		return "light";
	}
	
	
    getName() { return "Mention Aliases"; }
    getDescription() { return "Allows you to set an alias for users that you can @mention them with. You also have the choice to display their alias next to their name. A use example is setting your friends' aliases as their first names. Only replaces the alias with the mention if the user is in the server you mention them in. You can also do @owner to mention the owner of a guild."; }
    getVersion() { return "0.7.14"; }
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
			`
		};
	}

    load() {}
	
	getSettingsPanel(){

		setTimeout(() => {

			Metalloriff.Settings.pushElement(Metalloriff.Settings.Elements.createToggleGroup("ma-toggles", "Settings", [
				{ title : "Display alias tags next to users", value : "displayTags", setValue : this.displayTags },
				{ title : "Display alias list button (you can still open the list with Ctrl + Shift + @)", value : "displayButton", setValue : this.displayButton },
				{ title : "Display alias field on user popouts", value : "displayOnPopout", setValue : this.displayOnPopout }
			], choice => {
				this[choice.value] = !this[choice.value];
				this.save();
			}), this.getName());
			
			Metalloriff.Settings.pushChangelogElements(this);

		}, 0);

		return Metalloriff.Settings.Elements.pluginNameLabel("Mention Aliases");
		
	}

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
	
	save(){
		PluginUtilities.saveData("MentionAliases", "data", { aliases : this.aliases, displayTags : this.displayTags, displayButton : this.displayButton, displayOnPopout : this.displayOnPopout, settings : this.settings, groups : this.groups });
	}
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/MentionAliases.plugin.js");
		this.userModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]);
		this.memberModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getMembers"]);
		this.guildModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getGuild"]);
		var data = PluginUtilities.loadData("MentionAliases", "data", { aliases : this.aliases, displayTags : this.displayTags, displayButton : this.displayButton, displayOnPopout : this.displayOnPopout, settings : this.defaultSettings, groups : this.groups });
		this.aliases = data.aliases;
		this.groups = data.groups;
		var updatedAliases = {};
		if(this.aliases.length != undefined){
			for(var i = 0; i < this.aliases.length; i++){
				updatedAliases[this.aliases[i][0]] = this.aliases[i][1];
			}
			this.aliases = updatedAliases;
		}
		this.displayTags = data.displayTags;
		this.displayButton = data.displayButton;
		this.displayOnPopout = data.displayOnPopout;
		this.settings = data.settings;
		this.initialized = true;
		$(".theme-" + this.themeType).last().on("DOMNodeInserted.MentionAliases", e => { this.onPopout(e); });
		this.onSwitch();
		BdApi.injectCSS("MentionAliases", `

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
		$(window).on("resize.MentionAliases", () => this.onWindowResize());
		$(document).on("keydown.MentionAliases", e => this.onKeyDown(e));
		$(document).on("contextmenu.MentionAliases", e => {
			let $targ = $(e.target), element = $targ.parents(".member-3W1lQa")[0] || $targ.parents(".message-group")[0];
			if(element) this.onUserContext(element);
		})
		this.popoutObserver = new MutationObserver(e => {
			if(!this.displayOnPopout) return;
			if(e[0].addedNodes.length > 0 && e[0].addedNodes[0].getElementsByClassName("userPopout-3XzG_A").length > 0){
				if(this.aliases == undefined)
					this.aliases = {};
				var popout = $(".userPopout-3XzG_A"), userID = "";
				if(popout.length && popout[0].getElementsByClassName("discriminator").length > 0)
					userID = ReactUtilities.getOwnerInstance(popout[0]).props.user.id;
				if(popout.length && userID != "" && !$("#ma-aliasfield").length){
					$(`<div class="body-3iLsc4"><div class="bodyTitle-Y0qMQz marginBottom8-AtZOdT size12-3R0845 weightBold-2yjlgw">Alias</div><div class="note-3kmerW note-3HfJZ5"><textarea id="ma-aliasfield" placeholder="No alias specified, click to add one" maxlength="50" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="height: 22px;"></textarea></div></div>`).insertAfter($(popout.find(".body-3iLsc4").last()));
					var field = $("#ma-aliasfield");
					if(field.length){
						field.on("input", e => { e.currentTarget.value = e.currentTarget.value.split(" ").join("-"); });
						field.on("focusout", () => { this.updateAlias(userID, field[0].value); });
						if(this.aliases[userID] != undefined){ field[0].value = this.aliases[userID]; }
					}
				}
			}
		});
		this.popoutObserver.observe(document.getElementsByClassName("popouts-3dRSmE")[0], { childList : true });

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

		if(this.settings.displayUpdateNotes == true) Metalloriff.Changelog.compareVersions(this.getName(), this.getChanges());

		this.classes = Metalloriff.getClasses(["contextMenu"]);

	}
	
	updateAlias(userID, newAlias){
		if(newAlias == "" && this.aliases[userID] != undefined){ delete this.aliases[userID]; }
		if(newAlias != ""){ this.aliases[userID] = newAlias; }
		this.save();
		this.updateMessages();
		this.scanMembers();
	}
	
	scanMembers(){
		var server = PluginUtilities.getCurrentServer();
		if(server == undefined)
			this.usersInServer = [];
		else{
			this.usersInServer = Array.from(this.memberModule.getMembers(server.id), x => x.userId);
			return;
		}
		var dmAvatars = $(".member > .avatar-small, .messages .avatar-large");
		dmAvatars.each(i => {
			if(dmAvatars[i].style.backgroundImage != undefined && dmAvatars[i].style.backgroundImage != ""){
				var id = dmAvatars[i].style.backgroundImage.match(/\d+/)[0];
				if(id != undefined && !this.usersInServer.includes(id))
					this.usersInServer.push(id);
			}
		});
	}

	onWindowResize(){
		var chatbox = document.getElementsByClassName("inner-zqa7da")[0];
		if(chatbox != undefined){
			chatbox.style.width = "";
			chatbox.style.width = (chatbox.getBoundingClientRect().width - 40) + "px";
		}else{
			setTimeout(() => {
				this.onWindowResize();
			}, 1000);
		}
		if(document.getElementsByClassName("ma-alias-menu").length > 0){ document.getElementsByClassName("ma-alias-menu")[0].style.left = (document.getElementsByClassName("ma-aliases-button")[0].getBoundingClientRect().left - 460) + "px"; }
	}
	
	onSwitch(){
		if(!this.initialized)
			return;
		$(".ma-alias-menu").remove();

		this.attach();
		this.scanMembers();

		var channelList = $(document.getElementsByClassName("scroller-2FKFPG members-1998pB"));
		if(channelList.length){
			channelList.off("DOMNodeInserted.MentionAliases");
			if(this.displayTags){
				channelList.on("DOMNodeInserted.MentionAliases", e => {
					this.updateMember($(e.target));
				});
				var members = document.getElementsByClassName("member-3W1lQa");
				for(var i = 0; i < members.length; i++)
					this.updateMember($(members[i]));
			}
		}

		let messagesScroller = document.getElementsByClassName("messages scroller")[0]
		if(messagesScroller != undefined){
			this.messageObserver = new MutationObserver(() => { this.updateMessages(); this.scanMembers(); });
			this.messageObserver.observe(messagesScroller, { childList : true });
		}else if(this.messageObserver != null)
			this.messageObserver.disconnect();
		
		var dmList = $(".private-channels .scroller-2FKFPG");
		if(dmList.length){
			dmList.off("DOMNodeInserted.MentionAliases");
			if(this.displayTags){
				dmList.on("DOMNodeInserted.MentionAliases", e => {
					this.updateMemberDM(e.target);
				});
				var dms = $(".channel.private");
				for(var i = 0; i < dms.length; i++)
					this.updateMemberDM(dms[i]);
			}
		}

		this.updateMessages();

		if(this.displayButton){
			if(!$(".ma-aliases-button").length){
				$(`<div class="ma-aliases-button"><img src="https://dl.dropbox.com/s/gko2n32hxti6248/mention_aliases_button.png"></div>`).insertAfter(".inner-zqa7da");
				$(".ma-aliases-button").on("click", () => { this.toggleAliasList(); });
			}
			this.onWindowResize();
		}else{
			$(".ma-aliases-button").remove();
			$(".inner-zqa7da")[0].style.width = "";
		}
	}

	onKeyDown(e) {
		if(e.key == "Escape" && $(".ma-alias-menu").length){
			$(".ma-alias-menu").remove();
			return;
		}
		if(e.ctrlKey && e.shiftKey && e.key == "@") {
			this.toggleAliasList();
		}
	}

	toggleAliasList(aliases) {
		if($(".ma-alias-menu").length){
			$(".ma-alias-menu").remove();
			return;
		}
		let label = aliases == undefined ? "Defined User Aliases" : "Users In Group";
		let temp = {};
		if(aliases == undefined) aliases = this.aliases;
		else {
			for(let i = 0; i < aliases.length; i++) temp[aliases[i]] = this.getUser(aliases[i]).username;
			aliases = temp;
		}
		$(".app").last().append(`

		<div class="popout popout-bottom-right no-arrow no-shadow ma-alias-menu">
			<div class="messages-popout-wrap themed-popout recent-mentions-popout" style="height: 600px;width: 500px;">
				<div class="header" style="padding-bottom: 12px;">
					<div class="title" style="text-align: center;transform: translateY(6px);">${label}</div>
					<div class="actionButtons-LKmOj2 ma-action-buttons" style="position: absolute;top: 5px;">
						<div class="closeButton-2Rx3ov" onclick="$('.ma-alias-menu').remove();"></div>
					</div>
				</div>
				<div class="scroller-wrap dark">
					<div class="messages-popout scroller ma-alias-list">
						<div class="ma-no-aliases-defined-label">No user aliases defined. View a user's profile to define an alias.</div>
					</div>
				</div>
			</div>
		</div>
		
		`);
		if($(".ma-aliases-button").length){ $(".ma-alias-menu")[0].style.left = ($(".ma-aliases-button")[0].getBoundingClientRect().left - 460) + "px"; }
		else {
			var menu = $(".ma-alias-menu")[0], menuRect = menu.getBoundingClientRect();
			menu.style.left =  (($(document).width() - menuRect.width) / 2) + "px";
			menu.style.top = (($(document).height() - menuRect.height) / 2) + "px";
		}
		var sortedKeys = Object.keys(aliases).sort((x, y) => {
			if(aliases[x].toLowerCase() < aliases[y].toLowerCase()){ return -1; }
			if(aliases[x].toLowerCase() > aliases[y].toLowerCase()){ return 1; }
			return 0;
		}), populate = (i) => {
			var list = $(".ma-alias-list"), user = this.getUser(i), alias = aliases[i];
			if(user == undefined){
				user = {
					getAvatarURL : () => { return ""; },
					tag : "User not found"
				};
			}
			if(alias == undefined){ alias = "@owner"; }
			$(".ma-no-aliases-defined-label").remove();
			list.append(`
			
			<div class="message-group hide-overflow">
				<div class="avatar-large stop-animation" style="background-image: url('` + user.getAvatarURL() + `');"></div>
				<div class="comment" style="line-height: 40px;">
					<div class="message first">
						<div class="body">
							<h2 class="old-h2"><span class="username-wrapper"><input class="ma-alias-list-field" maxlength="30" value="` + alias + `"></input><span class="ma-alias-list-field ma-span" style="display:none;"></span></span><span class="highlight-separator"> - </span><span class="timestamp ma-alias-menu-user-tag">` + user.tag + `</span></h2>
						</div>
					</div>
				</div>
				<div class="actionButtons-LKmOj2 ma-action-buttons" style="position: relative;">
					<div class="closeButton-2Rx3ov"></div>
				</div>
			</div>
			
			`);
			list.find(".closeButton-2Rx3ov").last().on("click", e => {
				$(e.target).parents(".message-group").remove();
				this.updateAlias(i, "");
				PluginUtilities.showToast("Alias removed!", { type : "success" });
			});
			if(!this.usersInServer.includes(i)){ list.find(".message-group").last()[0].classList.add("ma-not-in-server"); }
			list.find(".message-group").last().on("click", e => {
				var chatbox = $("textarea")[0], chatboxValue = chatbox.value;
				chatbox.focus();
				chatbox.select();
				document.execCommand("insertText", false, chatboxValue + " @" + this.getUser($(e.currentTarget).find(".ma-alias-list-field").data("user-id")).tag);
			});
			var updateFieldSize = (e) => {
				var span = $(e.parentElement).find("span");
				span.text(e.value);
				if(span.width() > 20){ e.style.width = span.width() + "px"; }
				else{ e.style.width = "20px"; }
			}, field = list.find(".ma-alias-list-field:not(.ma-span)").last();
			field.on("input", e => { updateFieldSize(e.target); });
			field.data("user-id", i);
			field.on("focusout", e => { this.updateAlias($(e.target).data("user-id"), e.target.value); })
			updateFieldSize(field[0]);	
		};
		var currentServer = PluginUtilities.getCurrentServer();
		if(currentServer != undefined && currentServer.ownerId != undefined){ populate(currentServer.ownerId); }
		var sortedInServer = Array.filter(sortedKeys, x => this.usersInServer.includes(x)),
		sortedNotInServer = Array.filter(sortedKeys, x => !this.usersInServer.includes(x));
		for(var idx in sortedInServer){ populate(sortedInServer[idx]); }
		for(var idx in sortedNotInServer){ populate(sortedNotInServer[idx]); }
	}
	
	updateMember(added){
		if(added.length && added.find(".image-33JSyf").length){
			var id = ReactUtilities.getOwnerInstance(added[0]).props.user.id,
				alias = this.aliases[id],
				color = added.find(".nameTag-m8r81H")[0].style.color;
			added.find(".ma-usertag").remove();
			if(alias != undefined){
				$(`<span class="botTagRegular-2HEhHi botTag-2WPJ74 ma-usertag">` + alias + `</span>`).insertAfter(added.find(".username-1cB_5E"));
				setTimeout(() => { added.find(".ma-usertag")[0].style.backgroundColor = color; }, 0);
			}
		}
	}
	
	updateMemberDM(added){
		if(added.className == "channel-name"){ added = $(added).parents(".channel.private")[0]; }

		if(added.className != "channel private" && added.className != "channel selected private"){ return; }
		
		var user = ReactUtilities.getOwnerInstance(added)._reactInternalFiber.return.memoizedState.user, alias = undefined;

		if(user != undefined){ alias = this.aliases[user.id]; }
		else{ return; }
		
		$(added).find(".ma-usertag").remove();
		
		if(alias != undefined){ $(`<span class="botTagRegular-2HEhHi botTag-2WPJ74 ma-usertag">` + alias + `</span>`).insertAfter($(added).find(".channel-name")); }
	}
	
	updateMessages(){
		if(!this.displayTags || this.aliases == undefined)
			return;
		var messages = $(".message-group");
		for(var i = 0; i < messages.length; i++){
			if(messages[i] != null){
				var react = ReactUtilities.getReactInstance(messages[i]);
				if(react == undefined){ continue; }
				var id = "", msgs = react.return.memoizedProps.messages;
				if(messages != null && msgs != null && msgs.length > 0)
					id = msgs[0].author.id;
				var alias = this.aliases[id], username = $(messages[i]).find(".user-name");
				$(messages[i]).find(".ma-usertag").remove();
				if(id != "" && alias != null && username.length && alias != ""){
					$(`<span style="background-color: ` + username[0].style["color"] + `" class="botTagRegular-2HEhHi botTag-2WPJ74 ma-usertag">` + alias + `</span>`).insertAfter(username);
				}
			}
		}
	}
	
	onPopout(){
		if(this.aliases == undefined)
			this.aliases = {};
		var td = $(".theme-" + this.themeType).last(), popout = td.find(".inner-1JeGVc"), userID = "";
		if(popout.length && popout.find(".discriminator").length)
			userID = ZeresLibrary.ReactUtilities.getReactInstance(popout[0]).child.memoizedProps.user.id;
		if(popout.length && userID != "" && !$("#ma-aliasfield").length){
			$(`<div class="userInfoSection-2acyCx"><div class="userInfoSectionHeader-CBvMDh size12-3R0845 weightBold-2yjlgw">Alias</div><div class="note-3kmerW note-QfFU8y"><textarea id="ma-aliasfield" placeholder="No alias specified, click to add one" maxlength="50" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="height: 24px;"></textarea></div></div>`).insertAfter($(popout.find(".scroller-2FKFPG").find(".userInfoSection-2acyCx")[0]));
			var field = $("#ma-aliasfield");
			if(field.length){
				field.on("input", e => { e.currentTarget.value = e.currentTarget.value.split(" ").join("-"); });
				field.on("focusout", () => { this.updateAlias(userID, field[0].value); });
				if(this.aliases[userID] != undefined){ field[0].value = this.aliases[userID]; }
			}
		}
	}

	onUserContext(userElement) {

		let menu = new PluginContextMenu.Menu(), user = userElement.classList.contains("message-group") ? ReactUtilities.getOwnerInstance(userElement).props.messages[0].author : ReactUtilities.getOwnerInstance(userElement).props.user;

		menu.addItems(new PluginContextMenu.TextItem("Set Alias", { callback : () => {

			let prompt = Metalloriff.UI.createTextPrompt("ma-define-alias-prompt", "Define alias", (alias, prompt) => {
				this.updateAlias(user.id, alias);
				PluginUtilities.showToast("Alias set!", { type : "success" });
				prompt.close();
			}, this.aliases[user.id], { secondOptionText : "Remove", secondOptionCallback : prompt => {
				this.updateAlias(user.id, "");
				PluginUtilities.showToast("Alias removed!", { type : "success" });
				prompt.close();
			}});

			prompt.getElementsByTagName("input")[0].addEventListener("input", e => e.target.value = e.target.value.split(" ").join("-"));

			document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none";

		}}));

		let groupsMenu = new PluginContextMenu.Menu(), groups = new PluginContextMenu.ItemGroup();

		for(let i = 0; i < this.groups.length; i++) {

			let options = new PluginContextMenu.Menu(), groupName = this.groups[i].name.split("-").join(" ");

			if(this.groups[i].users.includes(user.id)) options.addItems(new PluginContextMenu.TextItem("Remove User From Group", { callback : () => {
				this.groups[i].users.splice(this.groups[i].users.indexOf(user.id), 1);
				this.save();
				PluginUtilities.showToast(`User removed from ${groupName}.`, { type : "success" });
				document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none";
			}}));
			else options.addItems(new PluginContextMenu.TextItem("Add User To Group", { callback : () => {
				this.groups[i].users.push(user.id);
				this.save();
				PluginUtilities.showToast(`User added to ${groupName}.`, { type : "success" });
				document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none";
			}}));

			options.addItems(new PluginContextMenu.TextItem("View Users", { callback : () => {
				document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none";
				this.toggleAliasList(this.groups[i].users);
			}})).addItems(new PluginContextMenu.TextItem("Delete Group", { callback : () => {
				document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none";
				Metalloriff.UI.createPrompt("ma-delete-group-prompt", "Delete group?", `Are you sure you want to delete "${groupName}"?`, () => {
					this.groups.splice(i, 1);
					this.save();
					PluginUtilities.showToast("Group deleted!", { type : "success" });
					prompt.close();
				});
			}}));

			groups.addItems(new PluginContextMenu.SubMenuItem(groupName, options));

		}

		groupsMenu.addItems(groups).addItems(new PluginContextMenu.TextItem("Create Group", { callback : () => {

			let prompt = Metalloriff.UI.createTextPrompt("ma-create-group-prompt", "Create alias group", (name, prompt) => {
				if(this.groups.findIndex(x => x.name == name) == -1) {
					this.groups.push({ name : name, users : [] });
					this.save();
					PluginUtilities.showToast("Group created!", { type : "success" });
					prompt.close();
				} else PluginUtilities.showToast("A group with this name already exists!", { type : "error" });
			}, "", { confirmText : "Create" });

			prompt.getElementsByTagName("input")[0].addEventListener("input", e => e.target.value = e.target.value.split(" ").join("-"));

			document.getElementsByClassName(this.classes.contextMenu)[0].style.display = "none";

		}}));

		menu.addItems(new PluginContextMenu.SubMenuItem("Groups", groupsMenu));

		menu.addItems(new PluginContextMenu.TextItem("Settings", { callback : () => Metalloriff.Settings.showPluginSettings(this.getName()) }));

		document.getElementsByClassName(this.classes.itemGroup)[1].insertAdjacentElement("beforeend", new PluginContextMenu.SubMenuItem("Mention Aliases", menu).element[0]);

	}
	
	attach(){
		let chatboxJQ = $(".chat textarea");
		if(chatboxJQ.length){
			let chatbox = chatboxJQ[0];
			chatboxJQ.off("keydown.MentionAliases");
			chatboxJQ.on("keydown.MentionAliases", e => {
				if((e.which == 13 || e.which == 32) && chatbox.value){
					let originalChatboxValue = chatbox.value, chatboxValue = chatbox.value, chatBoxValueIgnoreCase = chatboxValue.trim().toLowerCase();
					for(let id in this.aliases){
						let alias = this.aliases[id];
						if(chatBoxValueIgnoreCase.includes(alias.toLowerCase()) && (this.usersInServer.includes(id))){
							let userTag = this.getUser(id).tag, chatboxValueWithoutMentions = chatBoxValueIgnoreCase.split("@" + userTag.toLowerCase()).join("");
							while(chatboxValueWithoutMentions.split(" ").includes("@" + alias.toLowerCase())){
								chatboxValue = chatboxValue.replace(new RegExp("@" + alias, "ig"), "@" + userTag);
								chatboxValueWithoutMentions = chatboxValueWithoutMentions.split("@" + alias.toLowerCase()).join("");
							}
						}
					}
					if(chatBoxValueIgnoreCase.includes("@owner")){
						let guild = PluginUtilities.getCurrentServer(), owner = undefined;
						if(guild != undefined){
							owner = this.getUser(guild.ownerId);
							if(chatBoxValueIgnoreCase.split(" ").includes("@owner")){
								chatboxValue = chatboxValue.replace(new RegExp("@owner", "ig"), "@" + owner.tag);
							}
						}
					}
					for(let i = 0; i < this.groups.length; i++) {
						let group = this.groups[i];
						if(chatBoxValueIgnoreCase.split(" ").includes("@" + group.name.toLowerCase())) {
							let users = Array.from(group.users, x => this.getUser(x)), mentionList = new Array();
							for(let ii = 0; ii < users.length; ii++) if(users[ii] != undefined && this.usersInServer.includes(users[ii].id)) mentionList.push("@" + users[ii].tag);
							chatboxValue = chatboxValue.replace(new RegExp("@" + group.name, "ig"), mentionList.join(" "));
						}
					}
					if(originalChatboxValue != chatboxValue){
						chatbox.focus();
						chatbox.select();
						document.execCommand("insertText", false, chatboxValue);
					}
				}
			});
		}
	}
	
    stop() {
		BdApi.clearCSS("MentionAliases");
		var chatbox = $(".chat textarea");
		if(chatbox) chatbox.off("keydown.MentionAliases");
		$(".scroller-2FKFPG.members-1998pB").off("DOMNodeInserted.MentionAliases");
		$(".private-channels > div.scrollerWrap-2lJEkd scrollerThemed-2oenus themeGhostHairline-DBD-2d scrollerFade-1Ijw5y > div").off("DOMNodeInserted.MentionAliases");
		$(".theme-" + this.themeType).last().off("DOMNodeInserted.MentionAliases");
		$(".ma-aliases-button").remove();
		$(".ma-alias-menu").remove();
		$(".inner-zqa7da")[0].style.width = "";
		$(window).off("resize.MentionAliases");
		$(document).off("keydown.MentionAliases");
		$(document).off("contextmenu.MentionAliases");
		if(this.messageObserver != null) this.messageObserver.disconnect();
		if(this.popoutObserver != null) this.popoutObserver.disconnect();
	}
	
	getUser(id){
		return this.userModule.getUser(id);
	}
	
}
