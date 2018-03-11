//META{"name":"DiscordLogger"}*//

class DiscordLogger {
	
    getName() { return "Discord Logger"; }
    getDescription() { return "Notifies you and logs when you get kicked/banned from a server, when a server is deleted, and when a friend removes you."; }
    getVersion() { return "0.0.3"; }
    getAuthor() { return "Metalloriff"; }

    load() {}

    start() {
		var libraryScript = null;
		if (typeof BDfunctionsDevilBro !== "object" || BDfunctionsDevilBro.isLibraryOutdated()) {
			if (typeof BDfunctionsDevilBro === "object") BDfunctionsDevilBro = "";
			libraryScript = document.querySelector('head script[src="https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js"]');
			if (libraryScript) libraryScript.remove();
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://mwittrien.github.io/BetterDiscordAddons/Plugins/BDfunctionsDevilBro.js");
			document.head.appendChild(libraryScript);
		}
		if (typeof BDfunctionsDevilBro === "object") this.initializePL();
		else libraryScript.addEventListener("load", () => { this.initializePL(); });
	}
	
	initializePL(){
		var libraryScript = document.getElementById('zeresLibraryScript');
		if (!libraryScript) {
			libraryScript = document.createElement("script");
			libraryScript.setAttribute("type", "text/javascript");
			libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
			libraryScript.setAttribute("id", "zeresLibraryScript");
			document.head.appendChild(libraryScript);
		}
		if (typeof window.ZeresLibrary !== "undefined") this.waitToInitialize();
		else libraryScript.addEventListener("load", () => { this.waitToInitialize(); });
	}
	
	waitToInitialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/DiscordLogger.plugin.js");
		if(document.getElementsByClassName("guilds scroller").length == 0)
			DiscordLogger.initLoop = setTimeout(this.waitToInitialize, 1000);
		else
			DiscordLogger.initLoop = setTimeout(this.initialize, 5000);
	}
	
	initialize(){
		DiscordLogger.updatedTooSoon = null;
		DiscordLogger.userFunctions = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers", "getUser"]);
		DiscordLogger.resetSettings();
		var logs = PluginUtilities.loadData("DiscordLogger", "logs", { serverList : DiscordLogger.serverList, friendsList : DiscordLogger.friendsList, log : DiscordLogger.log });
		DiscordLogger.serverList = logs["serverList"];
		DiscordLogger.friendsList = logs["friendsList"];
		DiscordLogger.log = logs["log"];
		var data = PluginUtilities.loadData("DiscordLogger", "settings", { refreshDelay : DiscordLogger.refreshDelay });
		DiscordLogger.refreshDelay = data["refreshDelay"];
		DiscordLogger.update("loop");
		DiscordLogger.watchForChanges();
		PluginUtilities.showToast("Discord Logger has been initialized!");
	}
	
	getSettingsPanel(){
		var changeLog =
		`<br><br>0.0.2:<br>
		 Fixed the plugin randomly thinking you left every server.<br>
		 Fixed the plugin thinking you left a server when the server name changed.<br>
		 <br>0.0.3:<br>
		 I kind of accidentally broke the plugin entirely in the last update, so I fixed that.<br>`;
		return "Force Refresh Delay (seconds):<br><input id='dl-refreshDelay' type='number' min='10' max='500' value='" + DiscordLogger.refreshDelay + "'><br><br><button onclick='DiscordLogger.resetSettings();'>Reset Settings</button><br><br><button onclick='DiscordLogger.saveSettings(true);'>Save & Update</button><br><br><br><b>Changelog</b>" + changeLog;
	}
	
	static resetSettings(){
		DiscordLogger.serverList = DiscordLogger.readServerList();
		DiscordLogger.friendsList = DiscordLogger.readFriendsList();
		DiscordLogger.refreshDelay = 60;
		DiscordLogger.log = new Array();
	}
	
	static saveSettings(reupdate){
		if(document.getElementById("dl-refreshDelay")){
			DiscordLogger.refreshDelay = document.getElementById("dl-refreshDelay").value;
		}
		PluginUtilities.saveData("DiscordLogger", "logs", { serverList : DiscordLogger.serverList, friendsList : DiscordLogger.friendsList, log : DiscordLogger.log });
		PluginUtilities.saveData("DiscordLogger", "settings", { refreshDelay : DiscordLogger.refreshDelay });
		if(reupdate == true){
			clearTimeout(DiscordLogger.updateLoop);
			DiscordLogger.update("loop");
		}
	}
	
	static readServerList(){
		return Array.from(BDfunctionsDevilBro.readServerList(), x => [x.id, x.name, x.icon == null ? "null" : "https://cdn.discordapp.com/icons/" + x.id + "/" + x.icon + ".png"]);
	}
	
	static readFriendsList(){
		return BDfunctionsDevilBro.WebModules.findByProperties(["getFriendIDs"]).getFriendIDs();
	}
	
	static watchForChanges(){
		if(DiscordLogger.guildsScroller == null){
			DiscordLogger.guildsScroller = document.getElementsByClassName("guilds scroller")[0];
			DiscordLogger.lastServerLength = DiscordLogger.guildsScroller.childElementCount;
		}
		if(DiscordLogger.lastServerLength != DiscordLogger.guildsScroller.childElementCount)
			DiscordLogger.update("normal");
		DiscordLogger.lastServerLength = DiscordLogger.guildsScroller.childElementCount;
		DiscordLogger.changeWatcherLoop = setTimeout(DiscordLogger.watchForChanges, 500);
	}
	
	static update(type){
		if(type == "normal"){
			if(DiscordLogger.updatedTooSoon == null){
				DiscordLogger.updatedTooSoon = setTimeout(function(){DiscordLogger.updatedTooSoon = null;}, 1000);
			}else return;
		}
		try{
			var newServerList = DiscordLogger.readServerList(), newFriendsList = DiscordLogger.readFriendsList();
			if(newServerList.length > 0 && newFriendsList.length > 0){
				var newServerIDs = Array.from(newServerList, x => x[0]);
				for(var i = 0; i < DiscordLogger.serverList.length; i++){
					var server = DiscordLogger.serverList[i];
					if(server[1] != server[2]){
						if(!newServerIDs.includes(server[0])){
							DiscordLogger.log.push(server[1] + " was removed from the server list.");
							document.getElementsByClassName("theme-dark")[0].insertAdjacentHTML("beforeend", DiscordLogger.serverAlert);
							document.getElementById("dl-servernamelabel").textContent = server[1];
							if(server[2] != "null")
								document.getElementById("dl-servericon").src = server[2];
						}
					}
				}
				for(var i = 0; i < DiscordLogger.friendsList.length; i++){
					var user = DiscordLogger.friendsList[i];
					if(!newFriendsList.includes(user)){
						var userInfo = DiscordLogger.userFunctions.getUser(user.toString());
						if(userInfo != null){
							DiscordLogger.log.push(userInfo.tag + " was removed from the friends list.");
							document.getElementsByClassName("theme-dark")[0].insertAdjacentHTML("beforeend", DiscordLogger.serverAlert);
							document.getElementById("dl-servernamelabel").textContent = userInfo.username + " (#" + userInfo.discriminator + ")";
							document.getElementById("dl-servericon").src = userInfo.getAvatarURL();
							document.getElementById("dl-servermessagelabel").textContent = "This user was removed from your friends list.";
						}else{
							console.log("Failed to resolve user with id " + user + ".");
						}
					}
				}
			}
			DiscordLogger.serverList = newServerList;
			DiscordLogger.friendsList = newFriendsList;
			DiscordLogger.saveSettings(false);
		}catch(e){
			console.log("[DiscordLogger]: " + e);
		}
		if(type == "loop")
			DiscordLogger.updateLoop = setTimeout(DiscordLogger.update, DiscordLogger.refreshDelay * 1000, "loop");
	}
	
	static get serverAlert(){
		return `<div id="discord-logger-serveralert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="DiscordLogger.destroyAlert();"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img id="dl-servericon" src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span id="dl-servernamelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">Server Name</span></div><div id="dl-servermessagelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">This server no longer exists! The server is either temporarliy down, you were kicked/banned, or the server was deleted.</div></div></header></div></div></div></div>`;
	}
	
	static destroyAlert(){
		var a = document.getElementById("discord-logger-serveralert");
		a.parentNode.removeChild(a);
	}
	
    stop() {
		clearTimeout(DiscordLogger.updateLoop);
		clearTimeout(DiscordLogger.changeWatcherLoop);
		clearTimeout(DiscordLogger.initLoop);
	}

    observer(e) {}
	
}
