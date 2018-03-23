//META{"name":"UserBirthdays"}*//

class UserBirthdays {
	
	constructor(){
		this.birthdays = new Array();
		this.checkLoop;
	}
	
    getName() { return "User Birthdays"; }
    getDescription() { return "Allows you to set birthdays for users and get notified when it's a user's birthday."; }
    getVersion() { return "0.0.4"; }
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
					$(".theme-" + this.themeType).last().append(`<div id="ub-bday-alert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="var a = document.getElementById('ub-bday-alert'); a.parentNode.removeChild(a);"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img src="` + user.getAvatarURL() + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">It's ` + user.tag + `'s birthday today!<div id="dl-servermessagelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">It's the plugin developer's birthday! Go tell him happy birthday, he's lonely!</div></span></div></div></header></div></div></div></div>`);
				else
					$(".theme-" + this.themeType).last().append(`<div id="ub-bday-alert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="var a = document.getElementById('ub-bday-alert'); a.parentNode.removeChild(a);"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img src="` + user.getAvatarURL() + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">It's ` + user.username +`'s birthday today!</span></div></div></header></div></div></div></div>`);
				this.birthdays[i][3] = today.getFullYear();
				this.save();
			}
		}
		this.checkLoop = setTimeout(e => { this.checkForBirthdays(e); }, 60000);
	}
	
	onThemeDarkChange(){
		var userInfo = $(".theme-" + this.themeType).last().find(".inner-1_1f7b"), userID = "";
		if(userInfo.length && $(".discriminator.discriminator-3KVlLu.size14-1wjlWP").length)
			userID = ZeresLibrary.ReactUtilities.getReactInstance(userInfo[0]).child.memoizedProps.user.id;
		if(userID != "" && userInfo.length && !document.getElementById("ub-birthdayfield")){
			$(`<div class="userInfoSection-2WJxMm"><div id="ub-birthdaylabel" class="userInfoSectionHeader-pmdPGs size12-1IGJl9 weightBold-2qbcng">Birthday</div><div class="note-2AtC_s note-39NEdV"><textarea id="ub-birthdayfield" placeholder="No birthday specified, click to add one. Example: 5/20 or May 20" maxlength="20" class="scrollbarGhostHairline-D_btXm scrollbar-11WJwo" style="height: 24px;"></textarea></div></div>`).insertAfter($(userInfo.find(".scroller-fzNley").find(".userInfoSection-2WJxMm")[0]));
			$("#ub-birthdayfield").on("focusout", e => { this.updateBirthday(e); });
			for(var i = 0; i < this.birthdays.length; i++){
				if(this.birthdays[i][0] == userID)
					$("#ub-birthdayfield")[0].value = this.birthdays[i][2];
			}
		}
	}
	
	updateBirthday(){
		var userID = ZeresLibrary.ReactUtilities.getReactInstance($(".inner-1_1f7b")[0]).child.memoizedProps.user.id, birthdayDate = $("#ub-birthdayfield")[0].value + " " + new Date().getFullYear();
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
	}
	
	getUser(id){
		return InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]).getUser(id);
	}
	
}
