//META{"name":"MentionAliases"}*//

class MentionAliases {
	
	constructor() {
		this.initialized = false;
		this.aliases = new Array();
		this.usersInServer = new Array();
		this.usersInDMs = new Array();
		this.displayTags = true;
		this.messageObserver = null;
		this.userModule;
		this.memberModule;
	}
	
	get themeType(){
		if($(".theme-dark").length)
			return "dark";
		return "light";
	}
	
	
    getName() { return "Mention Aliases"; }
    getDescription() { return "Allows you to set an alias for users that you can @mention them with. You also have the choice to display their alias next to their name. A use example is setting your friends' aliases as their first names. Only replaces the alias with the mention if the user is in the server you mention them in."; }
    getVersion() { return "0.1.8"; }
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
			<div style="text-align: center;">
				<br>
				<button onclick="BdApi.getPlugin('Mention Aliases').reset(true);" style="display: inline-block; margin-right: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
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
		if(fromSettings){
			$("#ma-displayTags")[0].checked = true;
			this.save();
		}
	}
	
	save(fromSettings){
		if(fromSettings){
			this.displayTags = $("#ma-displayTags")[0].checked;
		}
		PluginUtilities.saveData("MentionAliases", "data", { aliases : this.aliases, displayTags : this.displayTags });
	}
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/MentionAliases.plugin.js");
		this.userModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]);
		this.memberModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getMembers"]);
		this.reset(false);
		var data = PluginUtilities.loadData("MentionAliases", "data", { aliases : this.alises, displayTags : this.displayTags });
		this.aliases = data["aliases"];
		this.displayTags = data["displayTags"];
		this.initialized = true;
		$(".theme-" + this.themeType).last().on("DOMNodeInserted.MentionAliases", e => { this.onPopout(e); });
		this.onSwitch();
		BdApi.injectCSS("MentionAliases",
		`.username-MwOsla, .channel-members .botTag-1OwMgs + .channel-members .botTag-1OwMgs { font-size: 15px; }
		.memberInner-3XUq9K { width: 160px; }
		.nameTag-26T3kW { white-space: normal; }
		.member-2FrNV0 { height: auto; }`);
	}
	
	updateAlias(userID){
		var newAlias = $("#ma-aliasfield")[0].value;
		for(var i = 0; i < this.aliases.length; i++){
			if(this.aliases[i][0] == userID){
				if(newAlias == "")
					this.aliases.splice(i, 1);
				else
					this.aliases[i] = [userID, newAlias];
			}
		}
		if(newAlias != "")
			this.aliases.push([userID, newAlias]);
		this.save(false);
		this.updateMessages();
		this.scanMembers();
	}
	
	scanMembers(){
		var server = PluginUtilities.getCurrentServer();
		if(server == null)
			this.usersInServer = new Array();
		else
			this.usersInServer = Array.from(this.memberModule.getMembers(server), x => x.userId);
		var dmAvatars = $(".member > .avatar-small, .avatar-large");
		dmAvatars.each(i => {
			if(dmAvatars[i].style.backgroundImage != undefined){
				var id = dmAvatars[i].style.backgroundImage.match(/\d+/)[0];
				if(id != undefined && !this.usersInDMs.includes(id))
					this.usersInDMs.push(id);
			}
		});
	}
	
	onSwitch(){
		if(!this.initialized)
			return;
		this.attach();
		this.scanMembers();
		var channelList = $(".scroller-fzNley.channel-members");
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
	}
	
	updateMember(added){
		if(added.length && added.find(".image-EVRGPw.mask-2vyqAW").length){
			var id = added.find(".image-EVRGPw.mask-2vyqAW")[0].style.backgroundImage.match(/\d+/)[0],
				alias = this.aliases.find(x => x[0] == id),
				color = added.find(".nameTag-3F0z_i.nameTag-26T3kW")[0].style.color;
			added.find(".ma-usertag").remove();
			if(alias != null && alias[1] != ""){
				$(`<span class="botTagRegular-288-ZL botTag-1OwMgs ma-usertag">` + alias[1] + `</span>`).insertAfter(added.find(".username-MwOsla"));
				setTimeout(() => { added.find(".ma-usertag")[0].style.backgroundColor = color; }, 10);
			}
		}
	}
	
	updateMemberDM(added){
		if(added.length && added.find(".avatar-small").length){
			if(added[0].className != "channel private")
				return;
			var id = added.find(".avatar-small")[0].style.backgroundImage.match(/\d+/)[0],
				alias = this.aliases.find(x => x[0] == id);
			added.find(".ma-usertag").remove();
			if(alias != null && alias[1] != "")
				$(`<span class="botTagRegular-288-ZL botTag-1OwMgs ma-usertag">` + alias[1] + `</span>`).insertAfter(added.find(".channel-name"));
		}
	}
	
	updateMessages(){
		if(!this.displayTags || this.aliases == null)
			return;
		var messages = $(".message-group");
		for(var i = 0; i < messages.length; i++){
			if(messages[i] != null){
				var id = "", msgs = messages[i][Object.keys(messages[i]).find((key) => key.startsWith('__reactInternalInstance'))].return.memoizedProps.messages;
				if(messages != null && msgs != null && msgs.length > 0)
					id = msgs[0].author.id;
				var alias = this.aliases.find(x => x[0] == id), username = $(messages[i]).find(".user-name");
				$(messages[i]).find(".ma-usertag").remove();
				if(id != "" && alias != null && username.length && alias[1] != ""){
					$(`<span style="background-color: ` + username[0].style["color"] + `" class="botTagRegular-288-ZL botTag-1OwMgs ma-usertag">` + alias[1] + `</span>`).insertAfter(username);
				}
			}
		}
	}
	
	onPopout(){
		if(this.aliases == null)
			this.aliases = new Array();
		var td = $(".theme-" + this.themeType).last(), popout = td.find(".inner-1_1f7b"), userID = "";
		if(popout.length && $(".discriminator.discriminator-3KVlLu.size14-1wjlWP").length)
			userID = ZeresLibrary.ReactUtilities.getReactInstance(popout[0]).child.memoizedProps.user.id;
		if(popout.length && userID != "" && !$("#ma-aliasfield").length){
			$(`<div class="userInfoSection-2WJxMm"><div class="userInfoSectionHeader-pmdPGs size12-1IGJl9 weightBold-2qbcng">Alias</div><div class="note-2AtC_s note-39NEdV"><textarea id="ma-aliasfield" placeholder="No alias specified, click to add one" maxlength="50" class="scrollbarGhostHairline-D_btXm scrollbar-11WJwo" style="height: 24px;"></textarea></div></div>`).insertAfter($(popout.find(".scroller-fzNley").find(".userInfoSection-2WJxMm")[0]));
			if($("#ma-aliasfield").length){
				$("#ma-aliasfield").on("input", e => { e.currentTarget.value = e.currentTarget.value.split(" ").join("-"); });
				$("#ma-aliasfield").on("focusout", e => { this.updateAlias(userID, e); });
				for(var i = 0; i < this.aliases.length; i++)
					if(this.aliases[i][0] == userID)
						$("#ma-aliasfield")[0].value = this.aliases[i][1];
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
					for(var i = 0; i < this.aliases.length; i++){
						var alias = this.aliases[i];
						if(!alias[0] || !alias[1]){
							this.aliases.splice(i, 1);
							i--;
							continue;
						}
						if(chatboxValue.toLowerCase().includes(alias[1].toLowerCase()) && (this.usersInServer.includes(alias[0])) || this.usersInDMs.includes(alias[0])){
							var userTag = this.getUser(alias[0]).tag, chatboxValueWithoutMentions = chatboxValue.toLowerCase().split("@" + userTag.toLowerCase()).join("");
							while(chatboxValueWithoutMentions.split(" ").includes("@" + alias[1].toLowerCase())){
								chatboxValue = chatboxValue.replace(new RegExp("@" + alias[1], "ig"), "@" + userTag);
								chatboxValueWithoutMentions = chatboxValueWithoutMentions.split("@" + alias[1].toLowerCase()).join("");
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
		$(".scroller-fzNley.channel-members").off("DOMNodeInserted.MentionAliases");
		$(".private-channels > div.scrollerWrap-2uBjct.scrollerThemed-19vinI.themeGhostHairline-2H8SiW.scrollerFade-28dRsO > div").off("DOMNodeInserted.MentionAliases");
		$(".theme-" + this.themeType).last().off("DOMNodeInserted.MentionAliases");
		if(this.messageObserver != null)
			this.messageObserver.disconnect();
	}
	
	getUser(id){
		return this.userModule.getUser(id);
	}
	
}
