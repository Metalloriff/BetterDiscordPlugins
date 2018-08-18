//META{"name":"UserBirthdays","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/UserBirthdays.plugin.js"}*//

class UserBirthdays {
	
	getName() { return "User Birthdays"; }
	getDescription() { return "Allows you to set birthdays for users and get notified when it's a user's birthday."; }
	getVersion() { return "1.0.7"; }
	getAuthor() { return "Metalloriff"; }

	load() {}

	start() {

		let libLoadedEvent = () => {
			try{ this.onLibLoaded(); }
			catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
		};

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
		if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);

	}
	
	get theme() {
		return document.getElementsByClassName("theme-dark").length ? "theme-dark" : "theme-light";
	}
	
	onLibLoaded() {

		NeatoLib.Updates.check(this);

		this.birthdays = { "264163473179672576" : { day : "5/20", hadIn : "never" } };

		const oldData = NeatoLib.Data.load("UserBirthdays", "data").birthdays;

		if(oldData) {
			for(let i = 0; i < oldData.length; i++) {
				this.birthdays[oldData[i][0]] = { day : oldData[i][1], hadIn : oldData[i][3] };
			}
		}

		this.birthdays = NeatoLib.Data.load("UserBirthdays", "birthdays", this.birthdays);

		this.popObserver = new MutationObserver(m => {

			let pop = m[0].addedNodes[0];

			if(!pop) return;

			if(pop.className.indexOf("popout") != -1) {

				const uid = NeatoLib.ReactData.getProp(pop.getElementsByClassName("discriminator")[0], "user.id"), birthday = this.birthdays[uid];

				if(!uid) return;

				NeatoLib.DOM.insertHTMLBefore(pop.getElementsByClassName(NeatoLib.getClass("body", "footer"))[0], `
					<div class="body-3iLsc4 da-body">
						<div class="bodyTitle-Y0qMQz marginBottom8-AtZOdT size12-3R0845 weightBold-2yjlgw">Birthday</div>
						<div class="note-3kmerW note-3HfJZ5">
							<textarea id="ub-birthdayfield" placeholder="No birthday specified, click to add one. Example: 4/20 or April 20" maxlength="50" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9 da-scrollbarGhostHairline" style="height: 36px;">${birthday ? birthday.day : ""}</textarea>
						</div>
					</div>
				`);

				const field = document.getElementById("ub-birthdayfield");

				field.addEventListener("focusout", () => {
					if(field.value && new Date(field.value) == "Invalid Date") return NeatoLib.showToast("Invalid date value", "error");
					this.setBirthday(uid, field.value);
					NeatoLib.showToast("Birthday set!", "success");
				});

			} else {

				pop = m[1].addedNodes[0];

				if(pop.className.indexOf("modal") != -1 && (pop.getElementsByClassName(NeatoLib.getClass("profileBadge", "body")).length || pop.getElementsByClassName(NeatoLib.getClass("userInfoSection")).length)) {

					const uid = NeatoLib.ReactData.getProp(pop.getElementsByClassName("discriminator")[0], "user.id"), birthday = this.birthdays[uid];

					if(!uid) return;
					
					NeatoLib.DOM.insertHTMLAtIndex(1, `
						<div class="userInfoSection-2acyCx"><div class="userInfoSectionHeader-CBvMDh size12-3R0845 weightBold-2yjlgw">Birthday</div><div class="note-3kmerW note-QfFU8y"><textarea id="ub-birthdayfield" placeholder="No birthday specified, click to add one. Example: 4/20 or April 20" maxlength="50" class="scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9" style="height: 24px;">${birthday ? birthday.day : ""}</textarea></div></div>
					`, pop.getElementsByClassName(NeatoLib.getClass("scrollerWrapPolyfill", "scroller"))[0]);

					const field = document.getElementById("ub-birthdayfield");

					field.addEventListener("focusout", () => {
						if(field.value && new Date(field.value) == "Invalid Date") return NeatoLib.showToast("Invalid date value", "error");
						this.setBirthday(uid, field.value);
						NeatoLib.showToast("Birthday set!", "success");
					});

				}

			}

		});

		const pops = document.getElementsByClassName(this.theme);

		this.popObserver.observe(pops[pops.length - 2], { childList : true });
		this.popObserver.observe(pops[pops.length - 1], { childList : true });

		this.style = NeatoLib.injectCSS(`
			
			.ub-item {
				margin: 20px;
				min-height: 134px;
				display: flex;
				flex-direction: column;
				contain: layout;
				pointer-events: auto;
			}

			.ub-item-inner {
				padding: 10px;
				align-items: center;
				display: flex;
				background: #7289da;
				border-radius: 5px;
				min-width: 400px;
			}

			.ub-icon {
				margin-right: 10px;
				height: 90px;
				width: 90px;
			}

			.ub-icon img {
				border-radius: 5px;
			}

			.ub-label {
				color: white;
				margin-top: 10px;
				width: 95%;
			}
			
			.ub-description {
				opacity: 0.6;
			}

			.ub-x-button {
				float: right;
				cursor: pointer;
				color: white;
				width: 15px;
				height: 15px;
				margin-bottom: 17.5%;
			}

		`);

		this.checkForBirthdays();

		this.checkLoop = setInterval(() => this.checkForBirthdays(), 60000);

		NeatoLib.Events.onPluginLoaded(this);
		
	}
	
	checkForBirthdays() {

		const now = new Date();

		for(let uid in this.birthdays) {

			const user = NeatoLib.Modules.get("getUser").getUser(uid) || { getAvatarURL : function(){ return "/assets/f046e2247d730629309457e902d5c5b3.svg"; }, tag : uid, username : "Unknown User" },
			birthday = new Date(this.birthdays[uid].day);

			if(now.getMonth() == birthday.getMonth() && now.getDate() == birthday.getDate() && (isNaN(this.birthdays[uid].hadIn) || now.getFullYear() != this.birthdays[uid].hadIn)) {
			
				document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `
					<div id="ub-alertwindow">
						<div class="backdrop-1wrmKB da-backdrop" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="this.parentElement.remove();"></div>
						<div class="modal-1UGdnR da-modal" style="opacity: 1;">
							<div class="ub-item">
								<header class="ub-item-inner">
									<div class="ub-icon"><img src="${user.getAvatarURL()}" height="90" width="90"></div>
									<div style="flex: 1;">
										<span class="ub-label">${uid == "264163473179672576" ? "Metalloriff#2891" : user.tag}</span>
										<div class="ub-label ub-description">It's ${uid == "264163473179672576" ? "the plugin creator" : user.username}'s birthday today!</div>
									</div>
									<span class="ub-x-button" onclick="document.getElementById('ub-alertwindow').remove();">X</span>
								</header>
							</div>
						</div>
					</div>
				`);

				this.birthdays[uid].hadIn = now.getFullYear();

				NeatoLib.Data.save("UserBirthdays", "birthdays", this.birthdays);

			}

		}

	}

	setBirthday(uid, day) {
		if(day) this.birthdays[uid] = { day : day, hadIn : "never" };
		else delete this.birthdays[uid];
		NeatoLib.Data.save("UserBirthdays", "birthdays", this.birthdays);
	}
	
	stop() {
		clearInterval(this.checkLoop);
		this.popObserver.disconnect();
		this.style.destroy();
	}
	
}
