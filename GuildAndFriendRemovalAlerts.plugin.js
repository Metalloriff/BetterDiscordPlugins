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
    getVersion() { return "0.1.4"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel(){
		if(!$(".plugin-settings").length)
			setTimeout(e => { this.getSettingsPanel(e); }, 100);
		else
			this.createSettingsPanel();
	}
	
	createSettingsPanel(){
		var panel = $(".plugin-settings");
		if(panel.length){
			panel.append(`<h style="color: white;font-size: 30px;font-weight: bold;">Guild And Friend Removal Alerts by Metalloriff</h>
				<div style="padding-top: 20px;">
				   <div id="ra-settings-checkboxgroup" class="radioGroup-2P3MJo">
					  <div id="ra-checkbox-1" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC" style="padding: 10px;border-radius: 0px !important;">
						 <label class="checkboxWrapper-2Yvr_Y">
							<input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
							<div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
							<div id="ra-checkbox-ticked-1" style="background-color: white;height: 60%;width: 60%;border-radius: 3px;"></div>
							</div>
						 </label>
						 <div class="info-1Z508c">
							<div class="title-1M-Ras">Guild alerts</div>
						 </div>
					  </div>
					  <div id="ra-checkbox-2" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC" style="padding: 10px;border-radius: 0px !important;">
						 <label class="checkboxWrapper-2Yvr_Y">
							<input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
							<div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
							<div id="ra-checkbox-ticked-2" style="background-color: white;height: 60%;width: 60%;border-radius: 3px;"></div>
							</div>
						 </label>
						 <div class="info-1Z508c">
							<div class="title-1M-Ras">Friend alerts</div>
						 </div>
					  </div>
					  <div id="ra-checkbox-3" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC" style="padding: 10px;border-radius: 0px !important;">
						 <label class="checkboxWrapper-2Yvr_Y">
							<input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
							<div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
							<div id="ra-checkbox-ticked-3" style="background-color: white;height: 60%;width: 60%;border-radius: 3px;"></div>
							</div>
						 </label>
						 <div class="info-1Z508c">
							<div class="title-1M-Ras">Show Windows notifications</div>
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
		PluginUtilities.saveData("GuildAndFriendRemovalAlerts", "guilds", this.settings.guildNotifications ? this.allGuilds : new Array());
		PluginUtilities.saveData("GuildAndFriendRemovalAlerts", "friends", this.settings.friendNotifications ? this.allFriends : new Array());
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
		this.allGuilds = PluginUtilities.loadData("GuildAndFriendRemovalAlerts", "guilds", new Array());
		this.allFriends = PluginUtilities.loadData("GuildAndFriendRemovalAlerts", "friends", new Array());
		this.guildsModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getGuilds"]);
		this.friendsModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getFriendIDs"]);
		this.userModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]);
		if($(".guilds.scroller").length && this.settings.guildNotifications == true){
			var observer = new MutationObserver((changes) => { this.checkGuilds(); });
			observer.observe($(".guilds.scroller")[0], { childList : true });
			this.guildsObserver = observer;
		}
		this.checkLoop();
	}
	
	checkLoop(){
		this.checkGuilds();
		this.checkFriends();
		this.checkLoopFunc = setTimeout(() => { this.checkLoop(); }, 5000);
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
					   <div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div>
					   <div id="ra-modal" class="modal-2LIEKY" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
					</div>`);
				}
				$("#ra-modal").append(`
					<div class="inner-1_1f7b ra-serveritem" style="margin: 20px; min-height: 134px;">
					<div class="topSectionNormal-2LlRG1">
						<header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP">
							<div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img id="ra-icon" src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90"></div>
							<div class="headerInfo-Gkqcz9">
								<div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW">
									<span id="ra-namelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="padding-right: 7px;">Unknown</span>
									<span class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="float: right; cursor: pointer;" onclick="$(this.parentElement.parentElement.parentElement.parentElement.parentElement).remove();">X</span>
								</div>
								<div class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">Guild no longer present! It is either temporarliy down, you were kicked/banned, or it was deleted.</div>
								<div id="ra-ownerlabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">Owner unknown</div>
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
					   <div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div>
					   <div id="ra-modal" class="modal-2LIEKY" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
					</div>`);
				}
				$("#ra-modal").append(`
					<div class="inner-1_1f7b ra-frienditem" style="margin: 20px; min-height: 134px;">
					<div class="topSectionNormal-2LlRG1">
						<header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP">
							<div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img id="ra-avatar" src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90"></div>
							<div class="headerInfo-Gkqcz9">
								<div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW">
									<span id="ra-taglabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="padding-right: 7px;">Unknown</span>
									<span class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="float: right; cursor: pointer;" onclick="$(this.parentElement.parentElement.parentElement.parentElement.parentElement).remove();">X</span>
								</div>
								<div class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">Friend was removed.</div>
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
			clearTimeout(this.checkLoopFunc);
	}
	
}
