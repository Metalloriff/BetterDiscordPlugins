//META{"name":"GuildAndFriendRemovalAlerts"}*//

class GuildAndFriendRemovalAlerts {
	
	constructor() {
		this.defaultSettings = {
			guildNotifications: true,
			friendNotifications: true,
			windowsNotifications : true
		};
		this.settings;
		this.allGuilds = new Array();
		this.allFriends = new Array();
		this.guildsModule;
		this.friendsModule;
		this.userModule;
		this.guildsObserver;
		this.checkLoopFunc = undefined;
	}
	
    getName() { return "Guild And Friend Removal Alerts"; }
    getDescription() { return "Alerts you when a guild or friend is removed."; }
    getVersion() { return "0.1.6"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		if(!$(".plugin-settings").length)
			setTimeout(() => { this.getSettingsPanel(); }, 100);
		else
			this.createSettingsPanel();
	}
	
	createSettingsPanel(){
		var panel = $(".plugin-settings");
		if(panel.length){
			panel.append(`<h style="color: white;font-size: 30px;font-weight: bold;">Guild And Friend Removal Alerts by Metalloriff</h>
				<div style="padding-top: 20px;">
				   <div id="ra-settings-checkboxgroup" class="radioGroup-1GBvlr">
					  <div id="ra-checkbox-1" class="item-26Dhrx marginBottom8-AtZOdT horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG cardPrimaryEditable-3KtE4g card-3Qj_Yx" style="padding: 10px;border-radius: 0px !important;">
						 <label class="checkboxWrapper-SkhIWG">
							<input type="checkbox" class="inputDefault-3JxKJ2 input-3ITkQf" value="on">
							<div class="checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs box-mmYMsp">
							<div id="ra-checkbox-ticked-1" style="background-color: white;height: 60%;width: 60%;border-radius: 3px;"></div>
							</div>
						 </label>
						 <div class="info-3LOr12">
							<div class="title-3BE6m5">Guild alerts</div>
						 </div>
					  </div>
					  <div id="ra-checkbox-2" class="item-26Dhrx marginBottom8-AtZOdT horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG cardPrimaryEditable-3KtE4g card-3Qj_Yx" style="padding: 10px;border-radius: 0px !important;">
						 <label class="checkboxWrapper-SkhIWG">
							<input type="checkbox" class="inputDefault-3JxKJ2 input-3ITkQf" value="on">
							<div class="checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs box-mmYMsp">
							<div id="ra-checkbox-ticked-2" style="background-color: white;height: 60%;width: 60%;border-radius: 3px;"></div>
							</div>
						 </label>
						 <div class="info-3LOr12">
							<div class="title-3BE6m5">Friend alerts</div>
						 </div>
					  </div>
					  <div id="ra-checkbox-3" class="item-26Dhrx marginBottom8-AtZOdT horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG cardPrimaryEditable-3KtE4g card-3Qj_Yx" style="padding: 10px;border-radius: 0px !important;">
						 <label class="checkboxWrapper-SkhIWG">
							<input type="checkbox" class="inputDefault-3JxKJ2 input-3ITkQf" value="on">
							<div class="checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs box-mmYMsp">
							<div id="ra-checkbox-ticked-3" style="background-color: white;height: 60%;width: 60%;border-radius: 3px;"></div>
							</div>
						 </label>
						 <div class="info-3LOr12">
							<div class="title-3BE6m5">Show Windows notifications</div>
						 </div>
					  </div>
				   </div>
				</div>`);
				if(this.settings.guildNotifications == false)
					$("#ra-checkbox-ticked-1").hide();
				if(this.settings.friendNotifications == false)
					$("#ra-checkbox-ticked-2").hide();
				if(this.settings.windowsNotifications == false)
					$("#ra-checkbox-ticked-3").hide();
				$("#ra-checkbox-1").on("click", e => { $("#ra-checkbox-ticked-1").toggle(); this.settings.guildNotifications = !this.settings.guildNotifications; this.saveSettings(); });
				$("#ra-checkbox-2").on("click", e => { $("#ra-checkbox-ticked-2").toggle(); this.settings.friendNotifications = !this.settings.friendNotifications; this.saveSettings(); });
				$("#ra-checkbox-3").on("click", e => { $("#ra-checkbox-ticked-3").toggle(); this.settings.windowsNotifications = !this.settings.windowsNotifications; this.saveSettings(); });
		}else
			this.getSettingsPanel();
	}

	saveSettings(){
		PluginUtilities.saveSettings("GuildAndFriendRemovalAlerts", this.settings);
	}
	
	save(){
		PluginUtilities.saveData("GuildAndFriendRemovalAlerts", "data", {
			guilds : (this.settings.guildNotifications ? this.allGuilds : new Array()),
			friends : (this.settings.friendNotifications ? this.allFriends : new Array())
		});
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
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/GuildAndFriendRemovalAlerts.plugin.js");
		this.settings = PluginUtilities.loadSettings("GuildAndFriendRemovalAlerts", this.defaultSettings);
		var data = PluginUtilities.loadData("GuildAndFriendRemovalAlerts", "data", {
			guilds : new Array(),
			friends : new Array()
		});
		this.allGuilds = data.guilds;
		this.allFriends = data.friends;
		this.guildsModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getGuilds"]);
		this.friendsModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getFriendIDs"]);
		this.userModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]);
		if($(".guilds.scroller").length && this.settings.guildNotifications == true){
			var observer = new MutationObserver((changes) => { this.checkGuilds(); });
			observer.observe($(".guilds.scroller")[0], { childList : true });
			this.guildsObserver = observer;
		}
		this.checkLoopFunc = setInterval(() => {
			this.checkGuilds();
			this.checkFriends();
		}, 5000);
	}
	
	getGuilds(){
		var guilds = this.guildsModule.getGuilds(), temp = new Array();
		for(var guildID in guilds){
			var guild = guilds[guildID], ownerUser = this.userModule.getUser(guild.ownerId), ownerTag = undefined;
			if(ownerUser)
				ownerTag = ownerUser.tag;
			temp.push({ id : guild.id, name : guild.name, owner : ownerTag, icon : guild.getIconURL() });
		}
		return temp;
	}
	
	checkGuilds(){
		if(this.settings.guildNotifications == false)
			return;
		var guilds = this.getGuilds(), guildIDs = Array.from(guilds, x => x.id), app = $(".app").last(), save = false;
		if(guilds.length == 0){
			setTimeout(() => this.checkGuilds(), 5000);
			return;
		}
		for(var i = 0; i < this.allGuilds.length; i++){
			var guild = this.allGuilds[i];
			if(!guildIDs.includes(guild.id)){
				if(!$("#ra-alertwindow").length){
					app.append(`<div id="ra-alertwindow">
					   <div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div>
					   <div id="ra-modal" class="modal-1UGdnR" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
					</div>`);
				}
				$("#ra-modal").append(`
					<div class="inner-1JeGVc ra-serveritem" style="margin: 20px; min-height: 134px;">
					<div class="topSectionNormal-2-vo2m">
						<header class="header-QKLPzZ flex-1O1GKY alignCenter-1dQNNs">
							<div class="avatar-16XVId profile-ZOdGIb avatar-3EQepX"><img id="ra-icon" src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90"></div>
							<div class="headerInfo-30uryT">
								<div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW">
									<span id="ra-namelabel" class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="padding-right: 7px;">Unknown</span>
									<span class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="float: right; cursor: pointer;" onclick="$(this.parentElement.parentElement.parentElement.parentElement.parentElement).remove();">X</span>
								</div>
								<div class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="color: rgb(150, 150, 150); padding-top: 20px">Guild no longer present! It is either temporarliy down, you were kicked/banned, or it was deleted.</div>
								<div id="ra-ownerlabel" class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="color: rgb(150, 150, 150); padding-top: 20px">Owner unknown</div>
							</div>
						</header>
					</div>
					</div>
				`);
				var item = $(".ra-serveritem").last();
				item.find("#ra-namelabel")[0].textContent = guild.name;
				if(guild.owner != undefined)
					item.find("#ra-ownerlabel")[0].textContent = "Owner: " + guild.owner;
				if(guild.icon != undefined)
					item.find("#ra-icon")[0].src = guild.icon;
				if(this.settings.windowsNotifications){
					new Notification(guild.name, {
						silent : true,
						body : "Guild removed.",
						icon : guild.icon
					});
				}
				save = true;
			}
		}
		if(this.allGuilds.length != guilds.length){ save = true; }
		this.allGuilds = guilds;
		if(save == true){ this.save(); }
	}
	
	getFriends(){
		var friends = this.friendsModule.getFriendIDs(), temp = new Array();
		for(var idx in friends){
			var friend = this.userModule.getUser(friends[idx]);
			if(friend != undefined)
				temp.push({ id : friend.id, tag : friend.tag, avatar : friend.getAvatarURL() });
		}
		return temp;
	}
	
	checkFriends(){
		if(this.settings.friendNotifications == false)
			return;
		var friends = this.getFriends(), friendIDs = Array.from(friends, x => x.id), app = $(".app").last(), save = false;
		if(friends.length == 0){
			setTimeout(() => this.checkFriends(), 5000);
			return;
		}
		for(var i = 0; i < this.allFriends.length; i++){
			var friend = this.allFriends[i];
			if(!friendIDs.includes(friend.id)){
				if(!$("#ra-alertwindow").length){
					app.append(`<div id="ra-alertwindow">
					   <div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div>
					   <div id="ra-modal" class="modal-1UGdnR" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
					</div>`);
				}
				$("#ra-modal").append(`
					<div class="inner-1JeGVc ra-frienditem" style="margin: 20px; min-height: 134px;">
					<div class="topSectionNormal-2-vo2m">
						<header class="header-QKLPzZ flex-1O1GKY alignCenter-1dQNNs">
							<div class="avatar-16XVId profile-ZOdGIb avatar-3EQepX"><img id="ra-avatar" src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90"></div>
							<div class="headerInfo-30uryT">
								<div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW">
									<span id="ra-taglabel" class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="padding-right: 7px;">Unknown</span>
									<span class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="float: right; cursor: pointer;" onclick="$(this.parentElement.parentElement.parentElement.parentElement.parentElement).remove();">X</span>
								</div>
								<div class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="color: rgb(150, 150, 150); padding-top: 20px">Friend was removed.</div>
							</div>
						</header>
					</div>
					</div>
				`);
				var item = $(".ra-frienditem").last();
				item.find("#ra-taglabel")[0].textContent = friend.tag;
				item.find("#ra-avatar")[0].src = friend.avatar;
				if(this.settings.windowsNotifications){
					var notif = new Notification(friend.tag, {
						silent : true,
						body : "Friend removed.",
						icon : friend.avatar
					});
				}
				save = true;
			}
		}
		if(this.allFriends.length != friends.length){ save = true; }
		this.allFriends = friends;
		if(save == true){ this.save(); }
	}
	
    stop() {
		if(this.guildsObserver != undefined)
			this.guildsObserver.disconnect();
		if(this.checkLoopFunc != undefined)
			clearInterval(this.checkLoopFunc);
	}
	
}
