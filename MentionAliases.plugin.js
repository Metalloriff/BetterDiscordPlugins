//META{"name":"MentionAliases"}*//

class MentionAliases {
	
	constructor() {
		this.aliases = new Array();
		this.tdObserver = null;
		this.usersInServer = new Array();
		this.displayTags = true;
		this.messageObserver = null;
	}
	
	get themeType(){
		if(!$(".theme-dark").length)
			return "light";
		else
			return "dark";
	}
	
	
    getName() { return "Mention Aliases"; }
    getDescription() { return "Allows you to set an alias for users that you can @mention them with. You also have the choice to display their alias next to their name. A use example is setting your friends' aliases as their first names."; }
    getVersion() { return "0.0.1"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		return `<h style="color: rgb(255, 255, 255); font-size: 30px; font-weight: bold;">Mention Aliases by Metalloriff</h><br><br><input id="ma-displayTags" type="checkbox"` + (this.displayTags ? "checked" : "") + `><span></span></div><span style="color: rgb(255, 255, 255);">Display alias tag on users</span></div><div style="text-align: center;"><br><button onclick="BdApi.getPlugin('Mention Aliases').reset(true);" style="display: inline-block; margin-right: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u"><div class="contents-4L4hQM">Reset All Aliases & Settings</div></button><button onclick="BdApi.getPlugin('Mention Aliases').save(true);" style="display: inline-block; margin-left: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u"><div class="contents-4L4hQM">Save Settings</div></button></div>`;
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
			$("#ma-displayTags'")[0].checked = true;
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
		this.reset(false);
		var data = PluginUtilities.loadData("MentionAliases", "data", { aliases : this.alises, displayTags : this.displayTags });
		this.aliases = data["aliases"];
		this.displayTags = data["displayTags"];
		if(this.tdObserver != null)
			this.tdObserver.disconnect();
		this.tdObserver = new MutationObserver(e => { this.updateMemberlist(e); });
		this.tdObserver.observe($(".theme-" + this.themeType).last()[0], { childList : true });
		this.onSwitch();
	}
	
	updateAlias(userID){
		var newAlias = $("#ma-aliasfield")[0].value;
		for(var i = 0; i < this.aliases.length; i++){
			if(this.aliases[i][0] == userID){
				if(newAlias == ""){
					this.aliases.splice(i, 1);
					this.save(false);
					return;
				}
				this.aliases[i] = [userID, newAlias];
				this.save(false);
				return;
			}
		}
		if(newAlias == "")
			return;
		this.aliases.push([userID, newAlias]);
		this.save(false);
		this.updateMessages();
		this.updateMemberlist();
	}
	
	onSwitch(){
		this.attach();
		this.usersInServer = Array.from(PluginUtilities.getAllUsers(), x => x.user.id);
		var channelList = $(".scroller-fzNley.channel-members");
		if(channelList.length){
			channelList.off("DOMNodeInserted.MentionAliases");
			if(this.displayTags){
				channelList.on("DOMNodeInserted.MentionAliases", e =>{
					var added = $(e.target);
					if(added.length && added.find(".avatar-small").length){
						var id = added.find(".avatar-small")[0].style["background-image"].match(/\d+/)[0], alias = this.aliases.find(x => x[0] == id), color = added.find(".member-username-inner")[0].style["color"];
						if(alias != null && !added.find("#ma-usertag").length)
							$(`<span id="ma-usertag" style="background-color: ` + color + `" class="botTagRegular-288-ZL botTag-1OwMgs">` + alias[1] + `</span>`).insertAfter(added.find(".member-username-inner"));
					}
				});
			}
		}
		if($(".messages.scroller").length){
			this.messageObserver = new MutationObserver(e => { this.updateMessages(e); });
			this.messageObserver.observe($(".messages.scroller")[0], { childList : true });
		}else if(this.messageObserver != null)
			this.messageObserver.disconnect();
		this.updateMessages();
		this.updateMemberlist();
	}
	
	updateMessages(){
		if(!this.displayTags)
			return;
		var messages = $(".message-group");
		for(var i = 0; i < messages.length; i++){
			if(messages[i] != null){
				var id = "", msgs = messages[i][Object.keys(messages[i]).find((key) => key.startsWith('__reactInternalInstance'))].return.memoizedProps.messages;
				if(messages != null && msgs != null && msgs.length > 0)
					id = msgs[0].author.id;
				var alias = this.aliases.find(x => x[0] == id), username = $(messages[i]).find(".user-name");
				if(id != "" && alias != null && !$(messages[i]).find("#ma-usertag").length && username.length){
					$(`<span id="ma-usertag" style="background-color: ` + username[0].style["color"] + `" class="botTagRegular-288-ZL botTag-1OwMgs">` + alias[1] + `</span>`).insertAfter(username);
				}
			}
		}
	}
	
	updateMemberlist(){
		if(!this.displayTags)
			return;
		var td = $(".theme-" + this.themeType).last(), popout = td.find(".inner-1_1f7b"), userAvatar = $(".image-EVRGPw.maskProfile-MeBve8.mask-2vyqAW").css("background-image"),
		userID = "";
		if(userAvatar)
			userID = userAvatar.match(/\d+/)[0];
		if(popout && userID != "" && !$("#ma-aliasfield").length){
			$(`<div class="userInfoSection-2WJxMm"><div class="userInfoSectionHeader-pmdPGs size12-1IGJl9 weightBold-2qbcng">Alias</div><div class="note-2AtC_s note-39NEdV"><textarea id="ma-aliasfield" placeholder="No alias specified. Click to add one." maxlength="50" class="scrollbarGhostHairline-D_btXm scrollbar-11WJwo" style="height: 24px;"></textarea></div></div>`).insertAfter($(popout.find(".scroller-fzNley").find(".userInfoSection-2WJxMm")[0]));
			$("#ma-aliasfield").on("input", e => { e.currentTarget.value = e.currentTarget.value.split(" ").join("-"); });
			$("#ma-aliasfield").on("focusout", e => { this.updateAlias(userID, e); });
			for(var i = 0; i < this.aliases.length; i++)
				if(this.aliases[i][0] == userID)
					$("#ma-aliasfield")[0].value = this.aliases[i][1];
		}
	}
	
	attach(){
		var chatboxJQ = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatboxJQ.length){
			var chatbox = chatboxJQ[0];
			chatboxJQ.off("keydown.MentionAliases");
			chatboxJQ.on("keydown.MentionAliases", e => {
				if((e.which == 13 || e.which == 32) && chatbox.value){
					var originalChatboxValue = chatbox.value, chatboxValue = chatbox.value, invalidAliases = new Array();
					for(var i = 0; i < this.aliases.length; i++){
						var alias = this.aliases[i];
						if(!alias[0] || !alias[1]){
							invalidAliases.push(i);
							continue;
						}
						if(chatboxValue.toLowerCase().includes(alias[1].toLowerCase()) && this.usersInServer.includes(alias[0])){
							var userTag = this.getUser(alias[0]).tag, chatboxValueWithoutMentions = chatboxValue.toLowerCase().split("@" + userTag.toLowerCase()).join("");
							while(chatboxValueWithoutMentions.split(" ").includes("@" + alias[1].toLowerCase())){
								chatboxValue = chatboxValue.replace(new RegExp("@" + alias[1], "ig"), "@" + userTag);
								chatboxValueWithoutMentions = chatboxValueWithoutMentions.split("@" + alias[1].toLowerCase()).join("");
							}
						}
					}
					for(var invalidAlias in invalidAliases)
						this.aliases.splice(invalidAlias, 1);
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
		var chatbox = $(".textAreaEnabled-2vOfh8, .textAreaEnabledNoAttach-1zE_2h");
		if(chatbox)
			chatbox.off("keydown.MentionAliases");
		if(this.tdObserver != null)
			this.tdObserver.disconnect();
		$(".scroller-fzNley.channel-members").off("DOMNodeInserted.MentionAliases");
		if(this.messageObserver != null)
			this.messageObserver.disconnect();
	}
	
	getUser(id){
		return this.findWebModulesByProperties(["getUser"]).getUser(id);
	}
	
	//The following were kindly stolen from mwittrien's BDfunctionsDevilBro.js https://github.com/mwittrien/BetterDiscordAddons/blob/master/Plugins/BDfunctionsDevilBro.js
	findWebModules(filter) {
		const req = webpackJsonp([], {"__extra_id__": (module, exports, req) => exports.default = req}, ["__extra_id__"]).default;
		delete req.c["__extra_id__"];
		for (let i in req.c) { 
			if (req.c.hasOwnProperty(i)) {
				let m = req.c[i].exports;
				if (m && m.__esModule && m.default && filter(m.default)) return m.default;
				if (m && filter(m)) return m;
			}
		}
	};

	 findWebModulesByProperties(properties) {
		return this.findWebModules((module) => properties.every(prop => module[prop] !== undefined));
	};
	
}