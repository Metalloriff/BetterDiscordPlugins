//META{"name":"MentionAliases"}*//

class MentionAliases {
	
	constructor() {
		this.initialized = false;
		this.aliases = new Object();
		this.usersInServer = new Array();
		this.displayTags = true;
		this.displayButton = true;
		this.displayUpdateNotes = true;
		this.messageObserver = null;
		this.popoutObserver = null;
		this.userModule;
		this.memberModule;
		this.guildModule;
	}
	
	get themeType(){
		if($(".theme-dark").length)
			return "dark";
		return "light";
	}
	
	
    getName() { return "Mention Aliases"; }
    getDescription() { return "Allows you to set an alias for users that you can @mention them with. You also have the choice to display their alias next to their name. A use example is setting your friends' aliases as their first names. Only replaces the alias with the mention if the user is in the server you mention them in. You can also do @owner to mention the owner of a guild."; }
    getVersion() { return "0.5.12"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		return `
			<h style="color: rgb(255, 255, 255); font-size: 30px; font-weight: bold;">Mention Aliases by Metalloriff</h>
			<br><br>
			<div onclick="var e = $('#ma-displayTags')[0]; e.checked = !e.checked;" class="checkbox" style="margin-top: 20px;">
				<div class="checkbox-inner"><input id="ma-displayTags" type="checkbox"` + (this.displayTags ? "checked" : "") + `><span></span></div>
				<span style="color: rgb(255, 255, 255);">Display alias tag on users</span>
			</div>
			<div onclick="var e = $('#ma-displayButton')[0]; e.checked = !e.checked;" class="checkbox" style="margin-top: 20px;">
				<div class="checkbox-inner"><input id="ma-displayButton" type="checkbox"` + (this.displayButton ? "checked" : "") + `><span></span></div>
				<span style="color: rgb(255, 255, 255);">Display alias list button (you can still open the list with Ctrl+Shift+@)</span>
			</div>
			<div onclick="var e = $('#ma-displayUpdateNotes')[0]; e.checked = !e.checked;" class="checkbox" style="margin-top: 20px;">
				<div class="checkbox-inner"><input id="ma-displayUpdateNotes" type="checkbox"` + (this.displayUpdateNotes ? "checked" : "") + `><span></span></div>
				<span style="color: rgb(255, 255, 255);">Display new changes for every update</span>
			</div>
			<div style="text-align: center;">
				<br>
				<button onclick="BdApi.getPlugin('Mention Aliases').createChangeWindow();" style="display: inline-block; margin-right: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
					<div class="contents-4L4hQM">View Changelog</div>
				</button>
				<button onclick="BdApi.getPlugin('Mention Aliases').reset(true);" style="display: inline-block; margin-right: 25px; margin-left: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
					<div class="contents-4L4hQM">Reset All Aliases & Settings</div>
				</button>
				<button onclick="BdApi.getPlugin('Mention Aliases').save(true);" style="display: inline-block; margin-left: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
					<div class="contents-4L4hQM">Save Settings</div>
				</button>
			</div>
		`;
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
	
	reset(fromSettings){
		this.aliases = new Array();
		this.displayTags = true;
		this.displayButton = true;
		this.displayUpdateNotes = true;
		if(fromSettings){
			document.getElementById("ma-displayTags").checked = true;
			document.getElementById("ma-displayButton").checked = true;
			document.getElementById("ma-displayUpdateNotes").checked = true;
			this.save(true);
		}
	}
	
	save(fromSettings){
		if(fromSettings === true){
			this.displayTags = document.getElementById("ma-displayTags").checked;
			this.displayButton = document.getElementById("ma-displayButton").checked;
			this.displayUpdateNotes = document.getElementById("ma-displayUpdateNotes").checked;
		}
		PluginUtilities.saveData("MentionAliases", "data", { aliases : this.aliases, displayTags : this.displayTags, displayButton : this.displayButton, displayUpdateNotes : this.displayUpdateNotes });
	}
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/MentionAliases.plugin.js");
		this.userModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]);
		this.memberModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getMembers"]);
		this.guildModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getGuild"]);
		this.reset(false);
		var data = PluginUtilities.loadData("MentionAliases", "data", { aliases : this.aliases, displayTags : this.displayTags, displayButton : this.displayButton, displayUpdateNotes : this.displayUpdateNotes });
		this.aliases = data.aliases;
		var updatedAliases = new Object();
		if(this.aliases.length != undefined){
			for(var i = 0; i < this.aliases.length; i++){
				updatedAliases[this.aliases[i][0]] = this.aliases[i][1];
			}
			this.aliases = updatedAliases;
		}
		this.displayTags = data.displayTags;
		this.displayButton = data.displayButton;
		this.displayUpdateNotes = data.displayUpdateNotes;
		this.initialized = true;
		$(".theme-" + this.themeType).last().on("DOMNodeInserted.MentionAliases", e => { this.onPopout(e); });
		this.onSwitch();
		BdApi.injectCSS("MentionAliases", `

			.username-MwOsla, .members-1bid1J .botTag-1OwMgs + .members-1bid1J .botTag-1OwMgs { font-size: 15px; }
			.memberInner-3XUq9K { width: 160px; }
			.nameTag-26T3kW { white-space: normal; }
			.member-2FrNV0 { height: auto; }

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
		this.popoutObserver = new MutationObserver(e => {
			if(e[0].addedNodes.length > 0 && e[0].addedNodes[0].getElementsByClassName("userPopout-11hFKo").length > 0){
				if(this.aliases == undefined)
					this.aliases = new Object();
				var popout = $(".userPopout-11hFKo"), userID = "";
				if(popout.length && popout[0].getElementsByClassName("discriminator").length > 0)
					userID = ReactUtilities.getOwnerInstance(popout[0]).props.user.id;
				if(popout.length && userID != "" && !$("#ma-aliasfield").length){
					$(`<div class="body-3ljq11"><div class="bodyTitle-18hsd9 marginBottom8-1mABJ4 size12-1IGJl9 weightBold-2qbcng">Alias</div><div class="note-2AtC_s note-3rIr6P"><textarea id="ma-aliasfield" placeholder="No alias specified, click to add one" maxlength="50" class="scrollbarGhostHairline-D_btXm scrollbar-11WJwo" style="height: 22px;"></textarea></div></div>`).insertAfter($(popout.find(".body-3ljq11").last()));
					var field = $("#ma-aliasfield");
					if(field.length){
						field.on("input", e => { e.currentTarget.value = e.currentTarget.value.split(" ").join("-"); });
						field.on("focusout", () => { this.updateAlias(userID, field[0].value); });
						if(this.aliases[userID] != undefined){ field[0].value = this.aliases[userID]; }
					}
				}
			}
		});
		this.popoutObserver.observe(document.getElementsByClassName("popouts-1TN9u9")[0], { childList : true });
		if(this.displayUpdateNotes == true){ this.compareVersions(); }
	}
	
	updateAlias(userID, newAlias){
		if(newAlias == "" && this.aliases[userID] != undefined){ delete this.aliases[userID]; }
		if(newAlias != ""){ this.aliases[userID] = newAlias; }
		this.save(false);
		this.updateMessages();
		this.scanMembers();
	}
	
	scanMembers(){
		var server = PluginUtilities.getCurrentServer();
		if(server == undefined)
			this.usersInServer = new Array();
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
		var chatbox = $(".inner-3if5cm")[0];
		if(chatbox != undefined){
			chatbox.style.width = "";
			chatbox.style.width = (chatbox.getBoundingClientRect().width - 40) + "px";
		}else{
			setTimeout(() => {
				this.onWindowResize();
			}, 1000);
		}
		if($(".ma-alias-menu").length){ $(".ma-alias-menu")[0].style.left = ($(".ma-aliases-button")[0].getBoundingClientRect().left - 460) + "px"; }
	}
	
	onSwitch(){
		if(!this.initialized)
			return;
		$(".ma-alias-menu").remove();

		this.attach();
		this.scanMembers();

		var channelList = $(".scroller-fzNley.members-1bid1J");
		if(channelList.length){
			channelList.off("DOMNodeInserted.MentionAliases");
			if(this.displayTags){
				channelList.on("DOMNodeInserted.MentionAliases", e => {
					this.updateMember($(e.target));
				});
				var members = $(".member-2FrNV0");
				for(var i = 0; i < members.length; i++)
					this.updateMember($(members[i]));
			}
		}

		if($(".messages.scroller").length){
			this.messageObserver = new MutationObserver(() => { this.updateMessages(); this.scanMembers(); });
			this.messageObserver.observe($(".messages.scroller")[0], { childList : true });
		}else if(this.messageObserver != null)
			this.messageObserver.disconnect();
		
		var dmList = $(".private-channels > div.scrollerWrap-2uBjct.scrollerThemed-19vinI.themeGhostHairline-2H8SiW.scrollerFade-28dRsO > div");
		if(dmList.length){
			dmList.off("DOMNodeInserted.MentionAliases");
			if(this.displayTags){
				dmList.on("DOMNodeInserted.MentionAliases", e => {
					this.updateMemberDM($(e.target));
				});
				var dms = $(".channel.private");
				for(var i = 0; i < dms.length; i++)
					this.updateMemberDM($(dms[i]));
			}
		}

		this.updateMessages();

		if(this.displayButton){
			if(!$(".ma-aliases-button").length){
				$(`<div class="ma-aliases-button"><img src="https://dl.dropbox.com/s/gko2n32hxti6248/mention_aliases_button.png"></div>`).insertAfter(".inner-3if5cm");
				$(".ma-aliases-button").on("click", () => { this.toggleAliasList(); });
			}
			this.onWindowResize();
		}else{
			$(".ma-aliases-button").remove();
			$(".inner-3if5cm")[0].style.width = "";
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

	toggleAliasList() {
		if($(".ma-alias-menu").length){
			$(".ma-alias-menu").remove();
			return;
		}
		$(".app").last().append(`

		<div class="popout popout-bottom-right no-arrow no-shadow ma-alias-menu">
			<div class="messages-popout-wrap themed-popout recent-mentions-popout" style="height: 600px;width: 500px;">
				<div class="header" style="padding-bottom: 12px;">
					<div class="title" style="text-align: center;transform: translateY(6px);">Defined User Aliases</div>
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
		var sortedKeys = Object.keys(this.aliases).sort((x, y) => {
			if(this.aliases[x].toLowerCase() < this.aliases[y].toLowerCase()){ return -1; }
			if(this.aliases[x].toLowerCase() > this.aliases[y].toLowerCase()){ return 1; }
			return 0;
		}), populate = (i) => {
			var list = $(".ma-alias-list"), user = this.getUser(i), alias = this.aliases[i];
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
				var chatbox = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h")[0], chatboxValue = chatbox.value;
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
		if(added.length && added.find(".image-EVRGPw").length){
			var id = added.find(".image-EVRGPw")[0].style.backgroundImage.match(/\d+/)[0],
				alias = this.aliases[id],
				color = added.find(".nameTag-3F0z_i.nameTag-26T3kW")[0].style.color;
			added.find(".ma-usertag").remove();
			if(alias != undefined){
				$(`<span class="botTagRegular-288-ZL botTag-1OwMgs ma-usertag">` + alias + `</span>`).insertAfter(added.find(".username-MwOsla"));
				setTimeout(() => { added.find(".ma-usertag")[0].style.backgroundColor = color; }, 0);
			}
		}
	}
	
	updateMemberDM(added){
		if(added.length && added.find(".avatar-small").length){
			if(added[0].className != "channel private" && added[0].className != "channel selected private")
				return;
			
			var id = added.find(".avatar-small")[0].style.backgroundImage.match(/\d+/)[0],
				alias = this.aliases[id];
			
			added.find(".ma-usertag").remove();
			
			if(alias != undefined)
				$(`<span class="botTagRegular-288-ZL botTag-1OwMgs ma-usertag">` + alias + `</span>`).insertAfter(added.find(".channel-name"));
		}
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
					$(`<span style="background-color: ` + username[0].style["color"] + `" class="botTagRegular-288-ZL botTag-1OwMgs ma-usertag">` + alias + `</span>`).insertAfter(username);
				}
			}
		}
	}
	
	onPopout(){
		if(this.aliases == undefined)
			this.aliases = new Object();
		var td = $(".theme-" + this.themeType).last(), popout = td.find(".inner-1_1f7b"), userID = "";
		if(popout.length && $(".discriminator.discriminator-3KVlLu.size14-1wjlWP").length)
			userID = ZeresLibrary.ReactUtilities.getReactInstance(popout[0]).child.memoizedProps.user.id;
		if(popout.length && userID != "" && !$("#ma-aliasfield").length){
			$(`<div class="userInfoSection-2WJxMm"><div class="userInfoSectionHeader-pmdPGs size12-1IGJl9 weightBold-2qbcng">Alias</div><div class="note-2AtC_s note-39NEdV"><textarea id="ma-aliasfield" placeholder="No alias specified, click to add one" maxlength="50" class="scrollbarGhostHairline-D_btXm scrollbar-11WJwo" style="height: 24px;"></textarea></div></div>`).insertAfter($(popout.find(".scroller-fzNley").find(".userInfoSection-2WJxMm")[0]));
			var field = $("#ma-aliasfield");
			if(field.length){
				field.on("input", e => { e.currentTarget.value = e.currentTarget.value.split(" ").join("-"); });
				field.on("focusout", () => { this.updateAlias(userID, field[0].value); });
				if(this.aliases[userID] != undefined){ field[0].value = this.aliases[userID]; }
			}
		}
	}
	
	attach(){
		var chatboxJQ = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatboxJQ.length){
			var chatbox = chatboxJQ[0];
			chatboxJQ.off("keydown.MentionAliases");
			chatboxJQ.on("keydown.MentionAliases", e => {
				if((e.which == 13 || e.which == 32) && chatbox.value){
					var originalChatboxValue = chatbox.value, chatboxValue = chatbox.value;
					for(var id in this.aliases){
						var alias = this.aliases[id];
						if(chatboxValue.toLowerCase().includes(alias.toLowerCase()) && (this.usersInServer.includes(id))){
							var userTag = this.getUser(id).tag, chatboxValueWithoutMentions = chatboxValue.toLowerCase().split("@" + userTag.toLowerCase()).join("");
							while(chatboxValueWithoutMentions.split(" ").includes("@" + alias.toLowerCase())){
								chatboxValue = chatboxValue.replace(new RegExp("@" + alias, "ig"), "@" + userTag);
								chatboxValueWithoutMentions = chatboxValueWithoutMentions.split("@" + alias.toLowerCase()).join("");
							}
						}
					}
					if(chatboxValue.toLowerCase().includes("@owner")){
						var guild = PluginUtilities.getCurrentServer(), owner = undefined;
						if(guild != undefined){
							owner = this.getUser(guild.ownerId);
							while(chatboxValue.split(" ").includes("@owner")){
								chatboxValue = chatboxValue.replace(new RegExp("@owner", "ig"), "@" + owner.tag);
								chatboxValueWithoutMentions = chatboxValue.split("@owner").join("");
							}
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
		var chatbox = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatbox)
			chatbox.off("keydown.MentionAliases");
		$(".scroller-fzNley.members-1bid1J").off("DOMNodeInserted.MentionAliases");
		$(".private-channels > div.scrollerWrap-2uBjct.scrollerThemed-19vinI.themeGhostHairline-2H8SiW.scrollerFade-28dRsO > div").off("DOMNodeInserted.MentionAliases");
		$(".theme-" + this.themeType).last().off("DOMNodeInserted.MentionAliases");
		$(".ma-aliases-button").remove();
		$(".ma-alias-menu").remove();
		$(".inner-3if5cm")[0].style.width = "";
		$(window).off("resize.MentionAliases");
		$(document).off("keydown.MentionAliases");
		if(this.messageObserver != null)
			this.messageObserver.disconnect();
		if(this.popoutObserver != null)
			this.popoutObserver.disconnect();
	}
	
	getUser(id){
		return this.userModule.getUser(id);
	}

	getSpacelessName() { return this.getName().split(" ").join(""); }

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
			`
		}
	}

	compareVersions() {
		var updateData = PluginUtilities.loadData("MetalloriffUpdateData", this.getSpacelessName(), new Object()), unreadChanges = new Array(), thisUpdateData = updateData[this.getSpacelessName()];
		if(thisUpdateData != undefined){
			if(thisUpdateData.readChanges == undefined){
				thisUpdateData.readChanges = new Array();
			}
			for(var i in this.getChanges()){
				if(!thisUpdateData.readChanges.includes(i)){
					unreadChanges.push(i);
					thisUpdateData.readChanges.push(i);
				}
			}
			if(unreadChanges.length > 0){ this.createChangeWindow(unreadChanges, updateData); }
		}else{
			//updateData[this.getSpacelessName()] = { readChanges : Object.keys(this.getChanges()) };
			updateData[this.getSpacelessName()] = { readChanges : new Array() };
			PluginUtilities.saveData("MetalloriffUpdateData", this.getSpacelessName(), updateData);
		}
	}

	createChangeWindow(changes, newUpdateData) {
		$("#"+ this.getSpacelessName() + "-changelog").remove();
		$(".app").last().append(`
			<div id="` + this.getSpacelessName() + `-changelog" class="">
			<style>

			.metalloriff-update-item {
				padding: 10px;
			}

			.metalloriff-update-label {
				color: white;
				font-size: 35px;
			}
			
			.metalloriff-update-note {
				color: white;
				font-size: 25px;
				opacity: 0.75;
				line-height: 25px;
			}

			</style>
			<div class="backdrop-2ohBEd metalloriff-changelog-backdrop" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>
			<div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);">
			<div class="inner-1_1f7b">
				<div class="wrapper-2PXjeM">
					<div class="modal-3HOjGZ modal-_aE5JX sizeSmall-1sh0-r" style="width: 800px; min-height: 800px; max-height: 800px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
						<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
						<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 1 1 auto;text-align: center;">
							<h2 class="h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 marginBottom4-_yArcI">` + this.getName() + ` Update Notes</h2>
							<br>
						</div>
						</div>
						<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
							<div id="` + this.getSpacelessName() + `-changelog-scroller" class="scroller-fzNley inner-tqJwAU marginBottom8-1mABJ4"></div>
						</div>
					</div>
				</div>
			</div>
			</div>
		</div>
		`);
		$(".metalloriff-changelog-backdrop").on("click", () => {
			if(newUpdateData != undefined){ PluginUtilities.saveData("MetalloriffUpdateData", this.getSpacelessName(), newUpdateData); }
			$(".metalloriff-changelog-backdrop").parent().remove();
		});
		var scroller = $("#" + this.getSpacelessName() + "-changelog-scroller");
		if(changes == undefined){
			changes = Object.keys(this.getChanges());
		}
		for(var i in changes){
			scroller.append(`
			<div class="metalloriff-update-item">
				<p class="metalloriff-update-label">` + changes[i] + `</p><p class="metalloriff-update-note">`
					+ this.getChanges()[changes[i]].split("\n").join("<br><br>") +
				`</p>
			</div>
			`);
		}
	}
	
}
