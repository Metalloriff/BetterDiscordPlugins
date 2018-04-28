//META{"name":"UserBirthdays"}*//

class UserBirthdays {
	
	constructor(){
		this.birthdays = new Array();
		this.checkLoop;
		this.popoutObserver;
	}
	
    getName() { return "User Birthdays"; }
    getDescription() { return "Allows you to set birthdays for users and get notified when it's a user's birthday."; }
    getVersion() { return "0.0.5"; }
    getAuthor() { return "Metalloriff"; }

    load() {}

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
	
	getSettingsPanel(){
		return `<button id="ub-reset-button" onclick="BdApi.getPlugin('${this.getName()}').reset(); BdApi.getPlugin('${this.getName()}').save();">Clear All Birthdays</button>`;
	}
	
	reset(){
		this.birthdays = new Array();
	}
	
	save(){
		PluginUtilities.saveData("UserBirthdays", "data", {birthdays : this.birthdays});
	}
	
	get themeType(){
		if(!$(".theme-dark").length)
			return "light";
		else
			return "dark";
	}
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/UserBirthdays.plugin.js");
		this.reset();
		var data = PluginUtilities.loadData("UserBirthdays", "data", {birthdays : this.birthdays});
		this.birthdays = data["birthdays"];
		$(".theme-" + this.themeType).last().on("DOMNodeInserted.UserBirthdays", e => { this.onThemeDarkChange(e); });
		this.checkForBirthdays();
		this.popoutObserver = new MutationObserver(e => {
			if(e[0].addedNodes.length > 0 && e[0].addedNodes[0].getElementsByClassName("userPopout-3XzG_A").length > 0){
				var popout = $(".userPopout-3XzG_A"), userID = "";
				if(popout.length && popout[0].getElementsByClassName("discriminator").length > 0)
					userID = ReactUtilities.getOwnerInstance(popout[0]).props.user.id;
				var birthday = "", birthdayItem = this.birthdays.find(x => x[0] == userID);
				if(birthdayItem) birthday = birthdayItem[2];
				if(popout.length && userID != "" && !$("#ub-birthdayfield").length){
					$(`<div class="body-3iLsc4"><div class="bodyTitle-Y0qMQz marginBottom8-AtZOdT size12-3R0845 weightBold-2yjlgw">Birthday</div><div class="note-3kmerW note-3HfJZ5"><textarea id="ub-birthdayfield" placeholder="No birthday specified, click to add one. Example: 4/20 or April 20" maxlength="50" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="height: 35px;">${birthday}</textarea></div></div>`).insertAfter($(popout.find(".body-3iLsc4").last()));
					$("#ub-birthdayfield").on("focusout", () => { this.updateBirthday(userID); });
				}
			}
		});
		this.popoutObserver.observe(document.getElementsByClassName("popouts-3dRSmE")[0], { childList : true });
	}
	
	checkForBirthdays(){
		var today = new Date();
		if(today.getMonth() == 4 && today.getDate() == 20 && !Array.from(this.birthdays, x => x[0]).includes("264163473179672576"))
			this.birthdays.push(["264163473179672576", "5/20", "May 20", "never"]);
		for(var i = 0; i < this.birthdays.length; i++){
			var birthdayDate = new Date(this.birthdays[i][1]);
			if(today.getMonth() == birthdayDate.getMonth() && today.getDate() == birthdayDate.getDate() && (this.birthdays[i][3] == "never" || today.getFullYear() != this.birthdays[i][3])){
				var user = this.getUser(this.birthdays[i][0]);
				if(user == null){
					this.birthdays.splice(i, 1);
					i--;
					continue;
				}
				if(user.id == "264163473179672576")
					$(".app").last().append(`<div id="ub-bday-alert"><div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="var a = document.getElementById('ub-bday-alert'); a.parentNode.removeChild(a);"></div><div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1JeGVc"><div class="topSectionNormal-2-vo2m" custom-editusers="true"><header class="header-QKLPzZ flex-1O1GKY alignCenter-1dQNNs"><div class="avatar-16XVId profile-ZOdGIb avatar-3EQepX"><img src="` + user.getAvatarURL() + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-30uryT"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi">It's ` + user.tag + `'s birthday today!<div id="dl-servermessagelabel" class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi" style="color: rgb(150, 150, 150); padding-top: 20px">It's the plugin developer's birthday! Go tell him happy birthday, he's lonely!</div></span></div></div></header></div></div></div></div>`);
				else
					$(".app").last().append(`<div id="ub-bday-alert"><div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="var a = document.getElementById('ub-bday-alert'); a.parentNode.removeChild(a);"></div><div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1JeGVc"><div class="topSectionNormal-2-vo2m" custom-editusers="true"><header class="header-QKLPzZ flex-1O1GKY alignCenter-1dQNNs"><div class="avatar-16XVId profile-ZOdGIb avatar-3EQepX"><img src="` + user.getAvatarURL() + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-30uryT"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span class="username username-3gJmXY size18-3EXdSj weightSemiBold-NJexzi">It's ` + user.username +`'s birthday today!</span></div></div></header></div></div></div></div>`);
				this.birthdays[i][3] = today.getFullYear();
				this.save();
			}
		}
		this.checkLoop = setTimeout(() => { this.checkForBirthdays(); }, 60000);
	}
	
	onThemeDarkChange(){
		var userInfo = $(".theme-" + this.themeType).last().find(".inner-1JeGVc"), userID = "";
		if(userInfo.length && $(".nameTag-2IFDfL.userSelectText-1o1dQ7.nameTag-m8r81H").length)
			userID = ZeresLibrary.ReactUtilities.getReactInstance(userInfo[0]).child.memoizedProps.user.id;
		if(userID != "" && userInfo.length && !document.getElementById("ub-birthdayfield")){
			$(`<div class="userInfoSection-2acyCx"><div id="ub-birthdaylabel" class="userInfoSectionHeader-CBvMDh size12-3R0845 weightBold-2yjlgw">Birthday</div><div class="note-3kmerW note-QfFU8y"><textarea id="ub-birthdayfield" placeholder="No birthday specified, click to add one. Example: 4/20 or April 20" maxlength="20" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="height: 24px;"></textarea></div></div>`).insertAfter($(userInfo.find(".scroller-2FKFPG").find(".userInfoSection-2acyCx").first()));
			$("#ub-birthdayfield").on("focusout", () => { this.updateBirthday(ZeresLibrary.ReactUtilities.getReactInstance($(".inner-1JeGVc")[0]).child.memoizedProps.user.id); });
			for(var i = 0; i < this.birthdays.length; i++){
				if(this.birthdays[i][0] == userID)
					$("#ub-birthdayfield")[0].value = this.birthdays[i][2];
			}
		}
	}
	
	updateBirthday(userID){
		var birthdayDate = $("#ub-birthdayfield")[0].value + " " + new Date().getFullYear();
		var birthday = new Date(birthdayDate);
		if(birthday && birthday != "Invalid Date"){
			var birthdayString = birthday.toLocaleDateString("en-us", {day: "numeric", month: "numeric"});
			for(var i = 0; i < this.birthdays.length; i++){
				if(this.birthdays[i][0] == userID){
					if($("#ub-birthdayfield")[0].value == ""){
						this.birthdays.splice(i, 1);
						this.save();
						return;
					}
					this.birthdays[i] = [userID, birthdayString, $("#ub-birthdayfield")[0].value, "never"];
					this.save();
					return;
				}
			}
			this.birthdays.push([userID, birthdayString, $("#ub-birthdayfield")[0].value, "never"]);
			this.save();
		}else
			PluginUtilities.showToast("Birthday invalid! Example: 'May 20' or '5/20'");
	}
	
    stop() {
		clearTimeout(this.checkLoop);
		$(".theme-" + this.themeType).last().off("DOMNodeInserted.UserBirthdays");
		if(this.popoutObserver != undefined) this.popoutObserver.disconnect();
	}
	
	getUser(id){
		return InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]).getUser(id);
	}
	
}
