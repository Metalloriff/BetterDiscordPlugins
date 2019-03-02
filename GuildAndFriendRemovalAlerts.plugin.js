//META{"name":"GuildAndFriendRemovalAlerts","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/GuildAndFriendRemovalAlerts.plugin.js"}*//

class GuildAndFriendRemovalAlerts {

	getName() { return "Guild And Friend Removal Alerts"; }
	getDescription() { return "Alerts you when a guild or friend is removed."; }
	getVersion() { return "0.2.13"; }
	getAuthor() { return "Metalloriff"; }

	load() {}

	start() {
		const libLoadedEvent = () => {
			try{ this.onLibLoaded(); }
			catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
		};

		let lib = document.getElementById("NeatoBurritoLibrary");
		if (!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}

		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
		if (typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}

	get settingFields() {
		return {
			guildNotifications: { label: "Display alerts for server removals", type: "bool" },
			friendNotifications: { label: "Display alerts for friend removals", type: "bool" },
			windowsNotifications: { label: "Display Windows/OS notifications", type: "bool" },
			ignoredServers: { label: "Ignored server IDs", type: "string", array: true },
			color: { label: "Notification background color", type: "color" },
			preview: {
				type: "custom",
				html: `<div class="ra-serveritem">
				<header class="ra-serveritem-inner">
					<div class="ra-icon"><img src="/assets/f046e2247d730629309457e902d5c5b3.svg" height="90" width="90"></div>
					<div style="flex: 1;">
						<span class="ra-label">A Server</span>
						<div class="ra-label ra-description">Server no longer present! It is either temporarliy down, you were kicked/banned, or it was deleted.</div>
						<div class="ra-label ra-description">Owner: SomeOwner#6969</div>
					</div>
					<span class="ra-x-button" style="margin-bottom: 9%;">X</span>
				</header>
			</div>`
			}
		};
	}

	get defaultSettings() {
		return {
			guildNotifications: true,
			friendNotifications: true,
			windowsNotifications: true,
			ignoredServers: "280806472928198656",
			color: "#7289da"
		};
	}

	getSettingsPanel() {
		return NeatoLib.Settings.createPanel(this);
	}

	saveSettings() {
		this.applyCSS();
		NeatoLib.Settings.save(this);
	}

	save() {
		NeatoLib.Data.save(this.getName(), "data", {
			guilds: (this.settings.guildNotifications ? this.allGuilds : []),
			friends: (this.settings.friendNotifications ? this.allFriends : [])
		});
	}

	onLibLoaded() {
		NeatoLib.Updates.check(this);

		this.settings = NeatoLib.Settings.load(this);

		const data = NeatoLib.Data.load(this.getName(), "data", {
			guilds: [],
			friends: []
		});

		this.allGuilds = data.guilds;
		this.allFriends = data.friends;

		this.guildsModule = NeatoLib.Modules.get("getGuilds");
		this.friendsModule = NeatoLib.Modules.get("getFriendIDs");
		this.userModule = NeatoLib.Modules.get("getUser");

		this.guildsObserver = new MutationObserver(() => this.checkGuilds());
		this.guildsObserver.observe(document.getElementsByClassName(NeatoLib.getClass("guilds"))[0], { childList: true });

		this.checkLoopFunc = setInterval(() => {
			this.checkGuilds();
			this.checkFriends();
		}, 5000);

		this.applyCSS();
	}

	applyCSS() {
		if (this.styles) this.styles.destroy();

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
		const guilds = NeatoLib.Modules.get("getGuilds").getGuilds(), arr = [];

		for (let id in guilds) {
			const guild = guilds[id], ownerUser = NeatoLib.Modules.get("getUser").getUser(guild.ownerId), ownerTag = ownerUser ? ownerUser.tag : null;

			arr.push({
				id: guild.id,
				name: guild.name,
				owner: ownerTag,
				icon: guild.getIconURL()
			});
		}

		return arr;
	}

	checkGuilds() {
		if (!this.settings.guildNotifications) return;

		const guilds = this.getGuilds(), guildIds = Array.from(guilds, guild => guild.id), app = document.getElementsByClassName(NeatoLib.getClass("app"))[0];
		if (!guilds.length) return setTimeout(() => this.checkGuilds(), 5000);

		if (typeof this.settings.ignoredServers == "string") this.settings.ignoredServers = this.settings.ignoredServers.split(" ");

		let save = false;

		for (let i = 0; i < this.allGuilds.length; i++) {
			const guild = this.allGuilds[i];

			if (this.settings.ignoredServers.includes(guild.id)) continue;

			if (!guildIds.includes(guild.id)) {
				if (!document.getElementById("ra-alertwindow")) app.insertAdjacentHTML("beforeend", `
				<div id="ra-alertwindow">
					<div class="backdrop-1wrmKB" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="this.parentElement.remove();"></div>
					<div id="ra-modal" class="modal-1UGdnR" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
				</div>`);

				const modal = document.getElementById("ra-modal");

				modal.insertAdjacentHTML("beforeend", `
				<div class="ra-serveritem">
					<header class="ra-serveritem-inner">
						<div class="ra-icon"><img src="${guild.icon || "/assets/f046e2247d730629309457e902d5c5b3.svg"}" height="90" width="90"></div>
						<div style="flex: 1;">
							<span class="ra-label">${guild.name}</span>
							<div class="ra-label ra-description">Server no longer present! It is either temporarliy down, you were kicked/banned, or it was deleted.</div>
							<div class="ra-label ra-description">${guild.owner ? "Owner: " + guild.owner : "Owner unknown"}</div>
						</div>
						<span class="ra-x-button" style="margin-bottom: 9%;">X</span>
					</header>
				</div>`);

				modal.lastChild.getElementsByClassName("ra-x-button")[0].onclick = e => {
					if (modal.children.length <= 1) modal.parentElement.remove();
					else e.currentTarget.remove();
				};

				if (this.settings.windowsNotifications) new Notification(guild.name, {
					silent: true,
					body: "Server removed",
					icon: guild.icon || "/assets/f046e2247d730629309457e902d5c5b3.svg"
				});

				save = true;
			}
		}

		if (this.allGuilds.length != guilds.length) save = true;

		this.allGuilds = guilds;

		if (save) this.save();
	}

	getFriends() {
		const friends = NeatoLib.Modules.get("getFriendIDs").getFriendIDs(), arr = [];

		for (let i = 0; i < friends.length; i++) {
			const friend = NeatoLib.Modules.get("getUser").getUser(friends[i]);
			if (friend) arr.push({
				id: friend.id,
				tag: friend.tag,
				avatar: friend.getAvatarURL()
			});
		}

		return arr;
	}

	checkFriends() {
		if (!this.settings.friendNotifications) return;

		const friends = this.getFriends(), friendIds = Array.from(friends, friend => friend.id), app = document.getElementsByClassName(NeatoLib.getClass("app"))[0];
		if (!friends.length) return setTimeout(() => this.checkFriends(), 5000);

		let save = false;

		for (let i = 0; i < this.allFriends.length; i++) {
			const friend = this.allFriends[i];

			if (!friendIds.includes(friend.id)) {
				if (!document.getElementById("ra-alertwindow")) app.insertAdjacentHTML("beforeend", `
				<div id="ra-alertwindow">
					<div class="backdrop-1wrmKB" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$(this).parent().remove();"></div>
					<div id="ra-modal" class="modal-1UGdnR" style="opacity: 1; overflow-y: auto; justify-content: flex-start;"></div>
				</div>`);

				const modal = document.getElementById("ra-modal");

				modal.insertAdjacentHTML("beforeend", `
				<div class="ra-serveritem">
					<header class="ra-serveritem-inner">
						<div class="ra-icon"><img src="${friend.avatar || "/assets/f046e2247d730629309457e902d5c5b3.svg"}" height="90" width="90"></div>
						<div style="flex: 1;">
							<span class="ra-label">${friend.tag}</span>
							<div class="ra-label ra-description">Friend was removed.</div>
						</div>
						<span class="ra-x-button">X</span>
					</header>
				</div>`);

				modal.lastChild.getElementsByClassName("ra-x-button")[0].onclick = e => {
					if (modal.children.length <= 1) modal.parentElement.remove();
					else e.currentTarget.remove();
				};

				if (this.settings.windowsNotifications) new Notification(friend.tag, {
					silent: true,
					body: "Friend removed",
					icon: friend.avatar || "/assets/f046e2247d730629309457e902d5c5b3.svg"
				});

				save = true;
			}
		}

		if (this.allFriends.length != friends.length) save = true;

		this.allFriends = friends;

		if (save) this.save();
	}

	stop() {
		if (this.guildsObserver) this.guildsObserver.disconnect();

		clearInterval(this.checkLoopFunc);

		this.styles.destroy();
	}

}
