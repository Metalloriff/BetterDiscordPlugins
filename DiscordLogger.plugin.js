//META{"name":"DiscordLogger"}*//

class DiscordLogger {
	
    getName() { return "Discord Logger"; }
    getDescription() { return "Notifies you and logs when you get kicked/banned from a server, when a server is deleted, and when a friend removes you."; }
    getVersion() { return "0.1.3"; }
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
		$(`<div id="dl-log-button" class="friends-online" style="color: rgb(255, 255, 255) !important;" onclick="DiscordLogger.createLogWindow();">View Log</div>`).insertBefore($(".guilds.scroller").find(".friends-online"));
		PluginUtilities.showToast("Discord Logger has been initialized!");
	}
	
	getSettingsPanel(){
		var changeLog =
		`<br><br>0.0.2:<br>
		 Fixed the plugin randomly thinking you left every server.<br>
		 Fixed the plugin thinking you left a server when the server name changed.<br>
		 <br>0.0.3:<br>
		 I kind of accidentally broke the plugin entirely in the last update, so I fixed that.<br>
		 <br>0.1.3:</br>
		 Added a viewable log. You can also write to it.`;
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
		if(type != "force"){
			if(DiscordLogger.updatedTooSoon == null){
				DiscordLogger.updatedTooSoon = setTimeout(function(){DiscordLogger.updatedTooSoon = null;}, 1000);
				if(type == "loop")
					DiscordLogger.updateLoop = setTimeout(DiscordLogger.update, DiscordLogger.refreshDelay * 1000, "loop");
			}else return;
		}
		try{
			var newServerList = DiscordLogger.readServerList(), newFriendsList = DiscordLogger.readFriendsList(), removedServers = new Array();
			if(newServerList.length > 0 && newFriendsList.length > 0){
				var newServerIDs = Array.from(newServerList, x => x[0]);
				for(var i = 0; i < DiscordLogger.serverList.length; i++){
					var server = DiscordLogger.serverList[i];
					if(server[1] != server[2]){
						if(!newServerIDs.includes(server[0]) && !removedServers.includes(server[0])){
							DiscordLogger.pushLog(server[1] + " was removed from the server list.");
							document.getElementsByClassName("theme-dark")[0].insertAdjacentHTML("beforeend", DiscordLogger.serverAlert);
							document.getElementById("dl-servernamelabel").textContent = server[1];
							if(server[2] != "null")
								document.getElementById("dl-servericon").src = server[2];
							removedServers.push(server[0]);
						}
					}
				}
				for(var i = 0; i < DiscordLogger.friendsList.length; i++){
					var user = DiscordLogger.friendsList[i];
					if(!newFriendsList.includes(user)){
						var userInfo = DiscordLogger.userFunctions.getUser(user.toString());
						if(userInfo != null){
							DiscordLogger.pushLog(userInfo.tag + " was removed from the friends list.");
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
	
	static pushLog(message){
		var date = new Date();
		DiscordLogger.log.push([date.toLocaleDateString("en-us"), date.toLocaleTimeString("en-us"), message]);
		DiscordLogger.updateLogElements();
		var lf = document.getElementById("dl-log-logfield");
		if(lf)
			lf.value = "";
		DiscordLogger.saveSettings();
	}
	
	static get serverAlert(){
		return `<div id="discord-logger-serveralert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="DiscordLogger.destroyAlert();"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img id="dl-servericon" src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span id="dl-servernamelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">Server Name</span></div><div id="dl-servermessagelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">This server no longer exists! The server is either temporarliy down, you were kicked/banned, or the server was deleted.</div></div></header></div></div></div></div>`;
	}
	
	static createLogWindow(){
		document.getElementsByClassName("theme-dark")[0].insertAdjacentHTML("beforeend", DiscordLogger.logWindow);
		DiscordLogger.updateLogElements();
		$("#dl-log-scroller").scrollTop = $("#dl-log-scroller")[0].scrollHeight;
	}
	
	static updateLogElements(){
		var scroller = document.getElementById("dl-log-scroller"), lastDate = "", searchBarText = document.getElementById("dl-log-search-bar").value;
		scroller.innerHTML = "";
		for(var i = 0; i < DiscordLogger.log.length; i++){
			var date = DiscordLogger.log[i][0];
			var time = DiscordLogger.log[i][1];
			var message = DiscordLogger.log[i][2];
			if(date == time || DiscordLogger.log[i].length != 3)
				DiscordLogger.log.splice(i, 1);
			else{
				if(searchBarText != "" && !message.includes(searchBarText) && !date.includes(searchBarText))
					continue;
				if(lastDate != date){
					scroller.insertAdjacentHTML("beforeend", `<div class="inviteRow-1OabNn flex-3B1Tl4 alignCenter-3VxkQP justifyBetween-1d1Hto"><div class="inviteRowInfo-3TXWjG flex-3B1Tl4 alignCenter-3VxkQP"><div class="inviteRowName-uHzNmr"><b>--` + date + `--</b></div></div></div>`);
					lastDate = date;
				}
				scroller.insertAdjacentHTML("beforeend", `<div class="inviteRow-1OabNn flex-3B1Tl4 alignCenter-3VxkQP justifyBetween-1d1Hto"><div class="inviteRowInfo-3TXWjG flex-3B1Tl4 alignCenter-3VxkQP"><div class="inviteRowName-uHzNmr" ondblclick="DiscordLogger.log.splice(` + i + `, 1); DiscordLogger.updateLogElements();"><b>[` + time + `]: </b>` + message + `</div></div></div>`);
			}
		}
		$("#dl-log-scroller").animate({scrollTop : $("#dl-log-scroller")[0].scrollHeight}, "fast");
	}
	
	static get logWindow(){
		return `<div id="discord-logger-log-window"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="DiscordLogger.destroyLogWindow();"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="wrapper-2PXjeM"><div class="modal-3HOjGZ modal-_aE5JX sizeSmall-1sh0-r" style="width: 800px; min-height: 800px; max-height: 800px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;"><div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 1 1 auto;"><h2 class="h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 marginBottom4-_yArcI">Log</h2><br><div class="search-bar"><div class="search-bar-inner"><input id="dl-log-search-bar" type="text" placeholder="Search..." oninput="DiscordLogger.updateLogElements();"></div></div></div></div><div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW"><div id="dl-log-scroller" class="scroller-fzNley inner-tqJwAU marginBottom8-1mABJ4"></div></div><div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw" style="flex: 0 0 auto;"><button onclick="DiscordLogger.destroyLogWindow();" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button"><div class="contents-4L4hQM">Close</div></button><div style="width: 15px; display: inline-block; height: auto;"></div><button type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" onclick="DiscordLogger.pushLog(document.getElementById('dl-log-logfield').value);"><div class="contents-4L4hQM">Log</div></button><div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="height: 32px; flex: 1 1 auto; padding-top: 3px; padding-right: 10px;"><div class="search-bar"><div class="search-bar-inner"><input id="dl-log-logfield" type="text" placeholder="Write to log..."></div></div></div></div></div></div></div></div></div>`;
	}
	
	static destroyLogWindow(){
		var a = document.getElementById("discord-logger-log-window");
		a.parentNode.removeChild(a);
	}
	
	static destroyAlert(){
		var a = document.getElementById("discord-logger-serveralert");
		a.parentNode.removeChild(a);
	}
	
    stop() {
		clearTimeout(DiscordLogger.updateLoop);
		clearTimeout(DiscordLogger.changeWatcherLoop);
		clearTimeout(DiscordLogger.initLoop);
		$("#dl-log-button").remove();
	}
	
}
