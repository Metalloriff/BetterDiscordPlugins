//META{"name":"DiscordLogger"}*//

class DiscordLogger {
	
    getName() { return "Discord Logger"; }
    getDescription() { return "Notifies you and logs when you get kicked/banned from a server, when a server is deleted, and when a friend removes you. You can also record servers and it will log users leaving and joining, user nickname changes, role additions, removals, and changes, and channel additions, removals, and changes upon clicking into the server."; }
    getVersion() { return "0.3.5"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	constructor(){
			this.updatedTooSoon = false;
			this.userFunctions;
			this.initLoop;
			this.serverList;
			this.friendsList;
			this.log;
			this.serverLogs = [{"id" : ""}];
			this.refreshDelay;
			this.updateLoop;
			this.guildsScroller;
			this.lastServerLength;
			this.changeWatcherLoop;
			this.lastServer = "";
			this.ended = false;
	}

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
	
	get themeType(){
		if(!$(".theme-dark").length)
			return "light";
		else
			return "dark";
	}
	
	waitToInitialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/DiscordLogger.plugin.js");
		$(".theme-" + this.themeType + ".popouts").on("DOMNodeInserted", e => { this.onPopout(e); });
		if(document.getElementsByClassName("guilds scroller").length == 0)
			this.initLoop = setTimeout(e => { this.waitToInitialize(e); }, 1000);
		else
			this.initLoop = setTimeout(e => { this.initialize(e); }, 5000);
	}
	
	initialize(){
		this.updatedTooSoon = null;
		this.userFunctions = BDfunctionsDevilBro.WebModules.findByProperties(["getUsers", "getUser"]);
		this.resetSettings();
		var logs = PluginUtilities.loadData("DiscordLogger", "logs", { serverList : this.serverList, friendsList : this.friendsList, log : this.log });
		this.serverList = logs["serverList"];
		this.friendsList = logs["friendsList"];
		this.log = logs["log"];
		this.serverLogs = PluginUtilities.loadData("DiscordLogger", "server_logs", { logs : this.serverLogs })["logs"];
		var data = PluginUtilities.loadData("DiscordLogger", "settings", { refreshDelay : this.refreshDelay });
		this.refreshDelay = data["refreshDelay"];
		this.update("loop");
		this.watchForChanges();
		$(`<button id="dl-log-button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button" style="width: 65px !important; height: 30px !important; min-width: 65px !important; min-height: 30px !important; left: -12.5%; margin-bottom: 5px; margin-top: 4px;"><div class="contents-4L4hQM" style="font-size: 90%; overflow: visible;">View Log</div></button>`).insertBefore($(".guilds.scroller").find(".friends-online"));
		$("#dl-log-button").on("click", e => { this.createLogWindow(e); });
		PluginUtilities.showToast("Discord Logger has been initialized!");
	}
	
	getSettingsPanel(){
		var changeLog =
		` <br>0.2.3:<br>
		 Fixed the server removed notifications. I accidentally broke them in the last update, as always.<br>
		 Added a server logging system, it logs server name changes, server icon changes, owner transferships, role additions, changes, and removals, channel additions, changes, and removals, and server member additions, changes, and removals.<br>
		 You can now put "separator" in the log to create a separator.<br>
		 <br>0.2.4:<br>
		 Fixed the settings.<br>
		 <br>0.2.5:<br>
		 Fixed an annoying error every time you switch DM's.<br>
		 The plugin now works on the light theme.<br>
		 Fixed multiple notifications at once causing all but the first to break.<br>
		 Improved the view log button. It's still not good though.<br>
		 <br>0.3.5:<br>
		 Fixed the settings panel looking absolutely horrible with the default theme, now it just doesn't look good.<br>
		 Fixed the log server button being on your status for some reason.<br>
		 Added commands to the log.<br>
		 You can now double click on log messages to remove them.</p>`;
		return `<p style="color: rgb(255, 255, 255);">Force Refresh Delay (seconds):</p><br><input id="dl-refreshDelay" type="number" min="10" max="500" value="` + this.refreshDelay + `"><br><br><button onclick="BdApi.getPlugin('${this.getName()}').resetSettings();" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" id="dl-log-appendtolog"><div class="contents-4L4hQM">Reset Settings</div></button><br><button onclick="BdApi.getPlugin('${this.getName()}').saveSettings(true);" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" id="dl-log-appendtolog"><div class="contents-4L4hQM">Save & Update</div></button><br><br><br><p style="color: rgb(255, 255, 255);"><b>Changelog</b><br>` + changeLog;
	}
	
	resetSettings(){
		this.serverList = this.readServerList();
		this.friendsList = this.readFriendsList();
		this.refreshDelay = 60;
		this.log = new Array();
		this.serverLogs = [{"id" : ""}];
	}
	
	saveSettings(reupdate){
		if(document.getElementById("dl-refreshDelay")){
			this.refreshDelay = document.getElementById("dl-refreshDelay").value;
		}
		PluginUtilities.saveData("DiscordLogger", "logs", { serverList : this.serverList, friendsList : this.friendsList, log : this.log });
		PluginUtilities.saveData("DiscordLogger", "settings", { refreshDelay : this.refreshDelay });
		if(reupdate == true){
			clearTimeout(this.updateLoop);
			this.update("loop");
		}
	}
	
	readServerList(){ return Array.from(BDfunctionsDevilBro.readServerList(), x => [x.id, x.name, x.icon == null ? "null" : "https://cdn.discordapp.com/icons/" + x.id + "/" + x.icon + ".png"]); }
	readFriendsList(){ return BDfunctionsDevilBro.WebModules.findByProperties(["getFriendIDs"]).getFriendIDs(); }
	get loggedServers(){ return Array.from(this.serverLogs, x => x["id"]); }
	
	scanServer(server){
		var roles = new Array(), channels = new Array(), members = new Array();
		Object.values(server.roles).forEach(function (x){
			roles.push({"id" : x.id, "name" : x.name, "permissions" : x.permissions});
		});
		BDfunctionsDevilBro.readChannelList().forEach(function (x){
			channels.push({"id" : x.id, "name" : x.name, "topic" : x.topic});
		});
		PluginUtilities.getAllUsers().forEach(function (x){
			members.push({"id" : x.user.id, "tag" : x.user.tag, "nickname" : x.nick});
		});
		return {"id" : server.id, "name" : server.name, "owner" : server.ownerId, "icon" : server.icon, "roles" : roles, "channels" : channels, "members" : members, "scan_date" : new Date().toLocaleDateString("en-us")};
	}
	
	toggleLogState(server){
		var servers = this.loggedServers,
			index = servers.findIndex(x => x == server.id), logging = servers.includes(server.id);
		if(logging){
			this.serverLogs.splice(index, 1);
			PluginUtilities.showToast(server.name + " will no longer be logged.");
		}else{
			this.serverLogs.push(this.scanServer(server));
			PluginUtilities.showToast(server.name + " will now be logged. (currently buggy)");
		}
		PluginUtilities.saveData("DiscordLogger", "server_logs", { logs : this.serverLogs });
		$("#dl-serverloglabel")[0].textContent = (this.loggedServers.includes(server.id) ? "Disable" : "Enable") + " Server Logging";
	}
	
	onSwitch(){
		var server = BDfunctionsDevilBro.getSelectedServer(), loggedServers = this.loggedServers, selectedChannel = BDfunctionsDevilBro.getSelectedChannel(), isGeneral = false;
		if(server != null && selectedChannel != null)
			isGeneral = selectedChannel.id == server.id;
		if(server != null && loggedServers.includes(server.id) && (this.lastServer != server.id || isGeneral)){
			setTimeout(() => {
				var index = loggedServers.findIndex(x => x == server.id), lastScan = this.serverLogs[index], newScan = this.scanServer(server), changes = new Array();
				if(newScan["owner"] != lastScan["owner"])
					changes.push("Server ownership was transferred from " + this.userFunctions.getUser(lastScan["owner"]).tag + " to " + this.userFunctions.getUser(newScan["owner"]).tag + ".");
				if(newScan["name"] != lastScan["name"])
					changes.push("Server name was changed from " + lastScan["name"] + " to " + newScan["name"] + ".");
				if(newScan["icon"] != lastScan["icon"])
					changes.push("Server icon was changed.");
				var newChanIds = Array.from(newScan["channels"], x => x["id"]), lastChanIds = Array.from(lastScan["channels"], x => x["id"]);
				lastScan["channels"].forEach(function(channel){
					var found = newScan["channels"].find(x => x.id == channel["id"]);
					if(!newChanIds.includes(channel["id"]))
						changes.push("Channel #" + channel["name"] + " (" + channel["topic"].replace("\n", "") + ") was removed.");
					else if(found && JSON.stringify(found) != JSON.stringify(channel))
						changes.push("Channel #" + channel["name"] + " (" + channel["topic"].replace("\n", "") + ") was changed to #" + found["name"]	+ " (" + found["topic"].replace("\n", "") + ").");
				});
				newScan["channels"].forEach(function(channel){
					if(!lastChanIds.includes(channel["id"]))
						changes.push("Channel #" + channel["name"] + " (" + channel["topic"].replace("\n", "") + ") was added.");
				});
				var newRoleIds = Array.from(newScan["roles"], x => x["id"]), lastRoleIds = Array.from(lastScan["roles"], x => x["id"]);
				lastScan["roles"].forEach(function(role){
					var found = newScan["roles"].find(x => x.id == role["id"]);
					if(!newRoleIds.includes(role["id"]))
						changes.push("Role \"" + role["name"] + "\" was removed.");
					else{
						if(found && found["permissions"] != role["permissions"])
							changes.push("Role \"" + role["name"] + "\" permissions have changed.");
						if(found && found["name"] != role["name"])
							changes.push("Role \"" + role["name"] + "\" name was changed to \"" + found["name"] + ".\"");
					}
				});
				newScan["roles"].forEach(function(role){
					if(!lastRoleIds.includes(role["id"]))
						changes.push("Role \"" + role["name"] + "\" was added.");
				});
				if(isGeneral){
					var newUserIds = Array.from(newScan["members"], x => x["id"]), lastUserIds = Array.from(lastScan["members"], x => x["id"]);
					lastScan["members"].forEach(function(user){
						var found = newScan["members"].find(x => x.id == user["id"]);
						if(!newUserIds.includes(user["id"]))
							changes.push("User \"" + user["tag"] + "\" (" + user["nickname"] + ") left or was kicked/banned.");
						else if(found && found["nickname"] != user["nickname"])
							changes.push("User \"" + found["tag"] + "\" changed their nickname from \"" + user["nickname"] + "\" to \"" + found["nickname"] + ".\"");
					});
					newScan["members"].forEach(function(user){
						if(!lastUserIds.includes(user["id"]))
							changes.push("User \"" + user["tag"] + "\" joined.");
					});
				}
				if(changes.length > 0){
					this.pushLog("[separator]Changes in " + server.name + " since " + lastScan["scan_date"]);
					for(var i = 0; i < changes.length; i++){
						this.pushLog(changes[i]);
					}
					this.pushLog("[separator]End of " + server.name + " change log");
					PluginUtilities.showToast("There are new server changes, check the log for more information.");
					this.serverLogs[index] = newScan;
					PluginUtilities.saveData("DiscordLogger", "server_logs", { logs : this.serverLogs });
					this.saveSettings();
				}
			}, 250);
		}
		if(server != null)
			this.lastServer = server.id;
	}
	
	onPopout(){
		var popout = $(".theme-" + this.themeType + ".popouts"), button = $(".item-rK1j5B").last();
		if(popout && !$("#dl-serverlogbutton").length && button.length && button[0].innerHTML.includes("Server")){
			var server = BDfunctionsDevilBro.getSelectedServer();
			$(`<div id="dl-serverlogbutton" class="item-rK1j5B"><div class="icon-3ICDZz" style="background-image: url(&quot;/assets/bc11a9099f5729962c095cb49d5042f6.svg&quot;);"></div><div id="dl-serverloglabel" class="label-HtH0tJ">...</div></div>`).insertBefore(button);
			$("#dl-serverloglabel")[0].textContent = (this.loggedServers.includes(server.id) ? "Disable" : "Enable") + " Server Logging";
			$("#dl-serverlogbutton").on("click", e => { this.toggleLogState(server, e); });
		}
	}
	
	watchForChanges(){
		if(this.guildsScroller == null){
			this.guildsScroller = document.getElementsByClassName("guilds scroller")[0];
			this.lastServerLength = this.guildsScroller.childElementCount;
		}
		if(this.lastServerLength != this.guildsScroller.childElementCount)
			this.update("normal");
		this.lastServerLength = this.guildsScroller.childElementCount;
		this.changeWatcherLoop = setTimeout(e => { this.watchForChanges(e); }, 500);
	}
	
	update(type){
		if(type != "force"){
			if(this.updatedTooSoon == null){
				this.updatedTooSoon = setTimeout(e => { this.updatedTooSoon = null; }, 1000);
				if(type == "loop")
					this.updateLoop = setTimeout(e => { this.update(e); }, this.refreshDelay * 1000, "loop");
			}else return;
		}
		var newServerList = this.readServerList(), newFriendsList = this.readFriendsList(), removedServers = new Array(), removedFriends = new Array(), themeType = this.themeType;
		if(newServerList.length > 0 && newFriendsList.length > 0){
			var newServerIDs = Array.from(newServerList, x => x[0]);
			for(var i = 0; i < this.serverList.length; i++){
				var server = this.serverList[i];
				if(server[1] != server[2]){
					if(!newServerIDs.includes(server[0]) && !removedServers.includes(server[0])){
						this.pushLog(server[1] + " was removed from the server list.");
						$(".theme-" + themeType).last().append(`<div id="discord-logger-serveralert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img id="dl-servericon" src="` + (server[2] == null ? "/assets/f046e2247d730629309457e902d5c5b3.svg" : server[2]) + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span id="dl-servernamelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">` + server[1] + `</span></div><div id="dl-servermessagelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">This server no longer exists! The server is either temporarliy down, you were kicked/banned, or the server was deleted.</div></div></header></div></div></div></div>`);
						removedServers.push(server[0]);
					}
				}
			}
			for(var i = 0; i < this.friendsList.length; i++){
				var user = this.friendsList[i];
				if(!newFriendsList.includes(user) && !removedFriends.includes(user)){
					var userInfo = this.userFunctions.getUser(user.toString());
					if(userInfo != null){
						this.pushLog(userInfo.tag + " was removed from the friends list.");
						$(".theme-" + themeType).last().append(`<div id="discord-logger-serveralert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img id="dl-servericon" src="` + userInfo.getAvatarURL() + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span id="dl-servernamelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">` + (userInfo.username + " (#" + userInfo.discriminator + ")") + `</span></div><div id="dl-servermessagelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">This user was removed from your friends list.</div></div></header></div></div></div></div>`);
						removedFriends.push(user);
					}else{
						console.log("Failed to resolve user with id " + user + ".");
					}
				}
			}
		}
		this.serverList = newServerList;
		this.friendsList = newFriendsList;
		this.saveSettings(false);
		if(type == "loop" && !this.ended)
			this.updateLoop = setTimeout(e => { this.update("loop", e); }, this.refreshDelay * 1000, "loop");
	}
	
	pushLog(message){
		var date = new Date();
		if(message[0] == "/"){
			var messages = new Array(), num = parseInt(message);
			if(message == "/help")
				messages = ["/help - Display this list.", "/clear - Clear log.", "/copy - Copy log to clipboard."];
			if(message == "/clear")
				this.log = new Array();
			if(message == "/copy"){
				this.copyToClipboard(this.log.join("\n"));
				PluginUtilities.showToast("Log copied to clipboard!");
			}
			for(var i = 0; i < messages.length; i++)
				this.log.push([date.toLocaleDateString("en-us"), date.toLocaleTimeString("en-us"), messages[i]]);
		}else
			this.log.push([date.toLocaleDateString("en-us"), date.toLocaleTimeString("en-us"), message]);
		if($("#dl-log-scroller").length)
			this.updateLogElements();
		var lf = document.getElementById("dl-log-logfield");
		if(lf)
			lf.value = "";
		this.saveSettings(false);
	}
	
	copyToClipboard(message) {
		document.body.insertAdjacentHTML("beforeend", "<textarea class=\"temp-clipboard-data\" width=\"0\">" + message + "</textarea>");
		document.querySelector(".temp-clipboard-data").select();
		var success = document.execCommand("copy");
		document.getElementsByClassName("temp-clipboard-data")[0].outerHTML = "";
	}
	
	createLogWindow(){
		var themeDark = document.getElementsByClassName("theme-" + this.themeType);
		themeDark = themeDark[themeDark.length - 1];
		themeDark.insertAdjacentHTML("beforeend", this.logWindow);
		$("#dl-log-appendtolog").on("click", e => { this.pushLog($("#dl-log-logfield")[0].value, e); });
		$("#dl-log-search-bar").on("input", e => { this.updateLogElements(e); });
		this.updateLogElements();
		$("#dl-log-scroller").scrollTop = $("#dl-log-scroller")[0].scrollHeight;
	}
	
	updateLogElements(){
		var scroller = document.getElementById("dl-log-scroller"), lastDate = "", searchBarText = document.getElementById("dl-log-search-bar").value;
		scroller.innerHTML = "";
		for(var i = 0; i < this.log.length; i++){
			var date = this.log[i][0];
			var time = this.log[i][1];
			var message = this.log[i][2];
			if(date == time || this.log[i].length != 3)
				this.log.splice(i, 1);
			else{
				if(searchBarText != "" && !message.includes(searchBarText) && !date.includes(searchBarText))
					continue;
				if(lastDate != date){
					scroller.insertAdjacentHTML("beforeend", `<div class="inviteRow-1OabNn flex-3B1Tl4 alignCenter-3VxkQP justifyBetween-1d1Hto"><div class="inviteRowInfo-3TXWjG flex-3B1Tl4 alignCenter-3VxkQP"><div class="inviteRowName-uHzNmr"><b>--` + date + `--</b></div></div></div>`);
					lastDate = date;
				}
				if(message.startsWith("[separator]")){
					message = message.replace("[separator]", "");
					scroller.insertAdjacentHTML("beforeend", `<div class="inviteRow-1OabNn flex-3B1Tl4 alignCenter-3VxkQP justifyBetween-1d1Hto"><div class="inviteRowInfo-3TXWjG flex-3B1Tl4 alignCenter-3VxkQP"><div class="inviteRowName-uHzNmr"><b>--` + message + `--</b></div></div></div>`);
				}else
					scroller.insertAdjacentHTML("beforeend", `<div ondblclick="BdApi.getPlugin('Discord Logger').removeLogElement(` + i + `);" class="inviteRow-1OabNn flex-3B1Tl4 alignCenter-3VxkQP justifyBetween-1d1Hto"><div class="inviteRowInfo-3TXWjG flex-3B1Tl4 alignCenter-3VxkQP"><div class="inviteRowName-uHzNmr"><b>[` + time + `]: </b>` + message + `</div></div></div>`);
			}
		}
		$("#dl-log-scroller").animate({scrollTop : $("#dl-log-scroller")[0].scrollHeight}, "fast");
	}
	
	removeLogElement(i){
		this.log.splice(i, 1);
		this.updateLogElements();
		this.saveSettings(false);
	}
	
	get logWindow(){
		return `<div id="discord-logger-log-window"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$('#discord-logger-log-window').remove();"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="wrapper-2PXjeM"><div class="modal-3HOjGZ modal-_aE5JX sizeSmall-1sh0-r" style="width: 800px; min-height: 800px; max-height: 800px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);"><div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;"><div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 1 1 auto;"><h2 class="h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 marginBottom4-_yArcI">Log</h2><br><div class="search-bar"><div class="search-bar-inner"><input id="dl-log-search-bar" type="text" placeholder="Search..."></div></div></div></div><div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW"><div id="dl-log-scroller" class="scroller-fzNley inner-tqJwAU marginBottom8-1mABJ4"></div></div><div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw" style="flex: 0 0 auto;"><button onclick="$('#discord-logger-log-window').remove();" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button"><div class="contents-4L4hQM">Close</div></button><div style="width: 15px; display: inline-block; height: auto;"></div><button type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" id="dl-log-appendtolog"><div class="contents-4L4hQM">Log</div></button><div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="height: 32px; flex: 1 1 auto; padding-top: 3px; padding-right: 10px;"><div class="search-bar"><div class="search-bar-inner"><input id="dl-log-logfield" type="text" placeholder="Write to log.     (type /help)"></div></div></div></div></div></div></div></div></div>`;
	}
	
    stop() {
		this.ended = true;
		clearTimeout(this.updateLoop);
		clearTimeout(this.changeWatcherLoop);
		clearTimeout(this.initLoop);
		$("#dl-log-button").remove();
		$(".theme-" + this.themeType + ".popouts").off("DOMNodeInserted");
	}
	
}
