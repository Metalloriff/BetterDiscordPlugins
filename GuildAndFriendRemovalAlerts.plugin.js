//META{"name":"GuildAndFriendRemovalAlerts"}*//

class GuildAndFriendRemovalAlerts {
	
    getName() { return "Guild And Friend Removal Alerts"; }
    getDescription() { return "Alerts you when a guild or friend is removed."; }
    getVersion() { return "0.2.6"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	getSettingsPanel() {

		setTimeout(() => {

			NeatoLib.Settings.pushElements([

				NeatoLib.Settings.Elements.createToggleGroup("ra-togs", "", [
					{ title : "Alerts for server removals", value : "guildNotifications", setValue : this.settings.guildNotifications },
					{ title : "Alerts for friend removals", value : "friendNotifications", setValue : this.settings.friendNotifications },
					{ title : "Also display OS notifications", value : "windowsNotifications", setValue : this.settings.windowsNotifications }
				], choice => {
					this.settings[choice.value] = !this.settings[choice.value];
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Ignored server IDs (separate with spaces)", this.settings.ignoredServers, e => {
					this.settings.ignoredServers = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Notification background color", this.settings.color, e => {
					this.settings.color = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.DOM.createElement({ innerHTML :
				`<div class="ra-serveritem">
					<header class="ra-serveritem-inner">
						<div class="ra-icon"><img src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90"></div>
						<div style="flex: 1;">
							<span class="ra-label">A Server</span>
							<div class="ra-label ra-description">Server no longer present! It is either temporarliy down, you were kicked/banned, or it was deleted.</div>
							<div class="ra-label ra-description">Owner: SomeOwner#6969</div>
						</div>
						<span class="ra-x-button" style="margin-bottom: 9%;">X</span>
					</header>
				</div>` })
				
			], this.getName());
			
			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
		
	}

	saveSettings() {
		this.applyCSS();
		NeatoLib.Settings.save(this);
	}
	
	save() {
		NeatoLib.Data.save(this.getName(), "data", {
			guilds : (this.settings.guildNotifications ? this.allGuilds : []),
			friends : (this.settings.friendNotifications ? this.allFriends : [])
		});
	}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
        else lib.addEventListener("load", libLoadedEvent);

	}
	
	onLibLoaded() {

		NeatoLib.Updates.check(this);

		this.settings = NeatoLib.Settings.load(this, {
			guildNotifications: true,
			friendNotifications: true,
			windowsNotifications : true,
			ignoredServers : ["280806472928198656"],
			color : "#7289da"
		});

		let data = NeatoLib.Data.load(this.getName(), "data", {
			guilds : [],
			friends : []
		});

		this.allGuilds = data.guilds;
		this.allFriends = data.friends;

		this.guildsModule = NeatoLib.Modules.get("getGuilds");
		this.friendsModule = NeatoLib.Modules.get("getFriendIDs");
		this.userModule = NeatoLib.Modules.get("getUser");

		this.guildsObserver = new MutationObserver(() => this.checkGuilds());
		this.guildsObserver.observe(document.getElementsByClassName("guilds scroller")[0], { childList : true });

		this.checkLoopFunc = setInterval(() => {
			this.checkGuilds();
			this.checkFriends();
		}, 5000);

		this.applyCSS();
		
	}

	applyCSS() {

		if(this.styles) this.styles.destroy();

		this.styles = NeatoLib.injectCSS(`
		
			.ra-serveritem {
				margin: 20px;
				min-height: 134px;
				display: flex;
				flex-direction: column;
				contain: layout;
				pointer-events: auto;
			}

			.ra-serveritem-inner {
				padding: 10px;
				align-items: center;
				display: flex;
				background: ${this.settings.color};
				border-radius: 5px;
				min-width: 400px;
			}

			.ra-icon {
				margin-right: 10px;
				height: 90px;
				width: 90px;
			}

			.ra-icon img {
				border-radius: 5px;
			}

			.ra-label {
				color: white;
				margin-top: 10px;
				width: 95%;
			}
			
			.ra-description {
				opacity: 0.6;
			}

			.ra-x-button {
				float: right;
				cursor: pointer;
				color: white;
				width: 15px;
				height: 15px;
				margin-bottom: 17.5%;
			}
		
		`);

	}
	
	getGuilds() {

		let guilds = this.guildsModule.getGuilds(), arr = [];

		for(let id in guilds) {
			let guild = guilds[id], ownerUser = this.userModule.getUser(guild.ownerId), ownerTag = ownerUser ? ownerUser.tag : undefined;
			arr.push({ id : guild.id, name : guild.name, owner : ownerTag, icon : guild.getIconURL() });
		}
		
		return arr;

	}
	
	checkGuilds() {

		if(!this.settings.guildNotifications) return;

		let guilds = this.getGuilds(), guildIds = Array.from(guilds, x => x.id), app = document.getElementsByClassName("app")[0], save = false;

		if(!guilds.length) return setTimeout(() => this.checkGuilds(), 5000);

		for(let i = 0; i < this.allGuilds.length; i++) {

			let guild = this.allGuilds[i];

			if(this.settings.ignoredServers && this.settings.ignoredServers.split(" ").indexOf(guild.id) != -1) continue;

			if(guildIds.indexOf(guild.id) == -1) {

				if(!document.getElementById("ra-alertwindow")) app.insertAdjacentHTML("beforeend", `
				<div id="ra-alertwindow">
					<div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div>
					<div id="ra-modal" class="modal-1UGdnR" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
				</div>`);

				let modal = document.getElementById("ra-modal");
				 
				modal.insertAdjacentHTML("beforeend", `
				<div class="ra-serveritem">
					<header class="ra-serveritem-inner">
						<div class="ra-icon"><img src="${guild.icon || "/assets/f046e2247d730629309457e902d5c5b3.svg"}" height="90" width="90"></div>
						<div style="flex: 1;">
							<span class="ra-label">${guild.name}</span>
							<div class="ra-label ra-description">Server no longer present! It is either temporarliy down, you were kicked/banned, or it was deleted.</div>
							<div class="ra-label ra-description">${guild.owner ? "Owner: " + guild.owner : "Owner unknown"}</div>
						</div>
						<span class="ra-x-button" style="margin-bottom: 9%;" onclick="this.parentElement.parentElement.parentElement.parentElement.parentElement.remove();">X</span>
					</header>
				</div>`);
				
				if(this.settings.windowsNotifications) new Notification(guild.name, { silent : true, body : "Server removed", icon : guild.icon || "/assets/f046e2247d730629309457e902d5c5b3.svg" });

				save = true;

			}

		}

		if(this.allGuilds.length != guilds.length) save = true;

		this.allGuilds = guilds;

		if(save) this.save();
		
	}
	
	getFriends() {

		let friends = this.friendsModule.getFriendIDs(), arr = [];

		for(let i = 0; i < friends.length; i++) {
			let friend = this.userModule.getUser(friends[i]);
			if(friend) arr.push({ id : friend.id, tag : friend.tag, avatar : friend.getAvatarURL() });
		}
		
		return arr;

	}
	
	checkFriends() {

		if(!this.settings.friendNotifications) return;

		let friends = this.getFriends(), friendIDs = Array.from(friends, x => x.id), app = document.getElementsByClassName("app")[0], save = false;

		if(!friends.length) return setTimeout(() => this.checkFriends(), 5000);

		for(let i = 0; i < this.allFriends.length; i++) {

			let friend = this.allFriends[i];

			if(friendIDs.indexOf(friend.id) == -1) {

				if(!document.getElementById("ra-alertwindow")) app.insertAdjacentHTML("beforeend", `
				<div id="ra-alertwindow">
					<div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div>
					<div id="ra-modal" class="modal-1UGdnR" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
				</div>`);

				document.getElementById("ra-modal").insertAdjacentHTML("beforeend", `
				<div class="ra-serveritem">
					<header class="ra-serveritem-inner">
						<div class="ra-icon"><img src="${friend.avatar || "/assets/f046e2247d730629309457e902d5c5b3.svg"}" height="90" width="90"></div>
						<div style="flex: 1;">
							<span class="ra-label">${friend.tag}</span>
							<div class="ra-label ra-description">Friend was removed.</div>
						</div>
						<span class="ra-x-button" onclick="this.parentElement.parentElement.parentElement.parentElement.parentElement.remove();">X</span>
					</header>
				</div>`);
			
				if(this.settings.windowsNotifications) new Notification(friend.tag, { silent : true, body : "Friend removed", icon : friend.avatar || "/assets/f046e2247d730629309457e902d5c5b3.svg" });

				save = true;

			}

		}

		if(this.allFriends.length != friends.length) save = true;

		this.allFriends = friends;

		if(save) this.save();
		
	}
	
    stop() {

		if(this.guildsObserver) this.guildsObserver.disconnect();

		clearInterval(this.checkLoopFunc);

		this.styles.destroy();
		
	}
	
}
