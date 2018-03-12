//META{"name":"UserBirthdays"}*//

class UserBirthdays {
	
    getName() { return "User Birthdays"; }
    getDescription() { return "Allows you to set birthdays for users and get notified when it's a user's birthday."; }
    getVersion() { return "0.0.1"; }
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
		return "<button onclick='UserBirthdays.reset();'>Clear All Birthdays</button>";
	}
	
	static reset(){
		UserBirthdays.birthdays = new Array();
	}
	
	static save(){
		PluginUtilities.saveData("UserBirthdays", "data", {birthdays : UserBirthdays.birthdays});
	}
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/UserBirthdays.plugin.js");
		UserBirthdays.reset();
		var data = PluginUtilities.loadData("UserBirthdays", "data", {birthdays : UserBirthdays.birthdays});
		UserBirthdays.birthdays = data["birthdays"];
		$(".theme-dark").last().on("DOMNodeInserted", this.onThemeDarkChange);
		UserBirthdays.checkForBirthdays();
	}
	
	static checkForBirthdays(){
		var today = new Date();
		if(today.getMonth() == 4 && today.getDate() == 20 && !Array.from(UserBirthdays.birthdays, x => x[0]).includes("264163473179672576"))
			UserBirthdays.birthdays.push(["264163473179672576", "5/20", "May 20", "never"]);
		for(var i = 0; i < UserBirthdays.birthdays.length; i++){
			var birthdayDate = new Date(UserBirthdays.birthdays[i][1]);
			if(today.getMonth() == birthdayDate.getMonth() && today.getDate() == birthdayDate.getDate() && (UserBirthdays.birthdays[i][3] == "never" || today.getFullYear() != UserBirthdays.birthdays[i][3])){
				var user = UserBirthdays.getUser(UserBirthdays.birthdays[i][0]);
				if(user.id == "264163473179672576")
					$(".theme-dark").last().append(`<div id="ub-bday-alert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="var a = document.getElementById('ub-bday-alert'); a.parentNode.removeChild(a);"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img src="` + user.getAvatarURL() + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">It's ` + user.tag + `'s birthday today!<div id="dl-servermessagelabel" class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH" style="color: rgb(150, 150, 150); padding-top: 20px">It's the plugin developer's birthday! Go tell him happy birthday, he's lonely!</div></span></div></div></header></div></div></div></div>`);
				else
					$(".theme-dark").last().append(`<div id="ub-bday-alert"><div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="var a = document.getElementById('ub-bday-alert'); a.parentNode.removeChild(a);"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div class="topSectionNormal-2LlRG1" custom-editusers="true"><header class="header-2Lg0Oe flex-3B1Tl4 alignCenter-3VxkQP"><div class="avatar-1BXaQj profile-3z9uol avatar-4g_GO6"><img src="` + user.getAvatarURL() + `" height="90" width="90" style="center center / cover;"></div><div class="headerInfo-Gkqcz9"><div class="nameTag-2n-N0D userSelectText-wz4t4g nameTag-26T3kW"><span class="username username-24t9uh size18-ZM4Qv- weightSemiBold-T8sxWH">It's ` + user.username +`'s birthday today!</span></div></div></header></div></div></div></div>`);
				UserBirthdays.birthdays[i][3] = today.getFullYear();
				UserBirthdays.save();
			}
		}
		UserBirthdays.checkLoop = setTimeout(UserBirthdays.checkForBirthdays, 60000);
	}
	
	onThemeDarkChange(){
		var userInfo = $(".theme-dark").last().find(".inner-1_1f7b"), userAvatar = $(".image-EVRGPw.maskProfile-MeBve8.mask-2vyqAW").css("background-image"), userID = "";
		if(userAvatar)
			userID = userAvatar.match(/\d+/)[0];
		if(userID != "" && userInfo && !document.getElementById("ub-birthdayfield")){
			$(`<div class="userInfoSection-2WJxMm"><div id="ub-birthdaylabel" class="userInfoSectionHeader-pmdPGs size12-1IGJl9 weightBold-2qbcng">Birthday</div><div class="note-2AtC_s note-39NEdV"><textarea id="ub-birthdayfield" placeholder="No birthday specified. Click to add one." maxlength="20" class="scrollbarGhostHairline-D_btXm scrollbar-11WJwo" style="height: 24px;" onfocusout="UserBirthdays.updateBirthday();"></textarea></div></div>`).insertAfter($(userInfo.find(".scroller-fzNley").find(".userInfoSection-2WJxMm")[0]));
			for(var i = 0; i < UserBirthdays.birthdays.length; i++){
				if(UserBirthdays.birthdays[i][0] == userID)
					$("#ub-birthdayfield")[0].value = UserBirthdays.birthdays[i][2];
			}
		}
	}
	
	static updateBirthday(){
		var userID = ($(".image-EVRGPw.maskProfile-MeBve8.mask-2vyqAW").css("background-image").match(/\d+/))[0], birthdayDate = $("#ub-birthdayfield")[0].value + " " + new Date().getFullYear();
		var birthday = new Date(birthdayDate);
		if(birthday && birthday != "Invalid Date"){
			var birthdayString = birthday.toLocaleDateString("en-us", {day: "numeric", month: "numeric"});
			for(var i = 0; i < UserBirthdays.birthdays.length; i++){
				if(UserBirthdays.birthdays[i][0] == userID){
					if($("#ub-birthdayfield")[0].value == ""){
						UserBirthdays.birthdays.splice(i, 1);
						UserBirthdays.save();
						return;
					}
					UserBirthdays.birthdays[i] = [userID, birthdayString, $("#ub-birthdayfield")[0].value, "never"];
					UserBirthdays.save();
					return;
				}
			}
			UserBirthdays.birthdays.push([userID, birthdayString, $("#ub-birthdayfield")[0].value, "never"]);
			UserBirthdays.save();
		}else
			PluginUtilities.showToast("Birthday invalid! Example: 'May 20' or '5/20'");
	}
	
    stop() {
		clearTimeout(UserBirthdays.checkLoop);
		$(".theme-dark").last().off("DOMNodeInserted", this.onThemeDarkChange);
	}
	
	static getUser(id){
		return UserBirthdays.findWebModulesByProperties(["getUsers", "getUser"]).getUser(id);
	}
	
	//The following were kindly stolen from mwittrien's BDfunctionsDevilBro.js https://github.com/mwittrien/BetterDiscordAddons/blob/master/Plugins/BDfunctionsDevilBro.js
	static findWebModules(filter) {
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

	static findWebModulesByProperties(properties) {
		return UserBirthdays.findWebModules((module) => properties.every(prop => module[prop] !== undefined));
	};
	
}