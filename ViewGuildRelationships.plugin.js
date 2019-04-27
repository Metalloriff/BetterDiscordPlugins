//META{"name":"ViewGuildRelationships","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/ViewGuildRelationships.plugin.js"}*//

class ViewGuildRelationships {

	getName() { return "View Guild Relationships"; }
	getDescription() { return "Adds a 'View Relationships' button to the guild dropdown and context menu that opens a list of all friends, requested friends, and blocked users in the server."; }
	getVersion() { return "1.2.9"; }
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

	onLibLoaded() {
		if (!NeatoLib.hasRequiredLibVersion(this, "0.1.13")) return;

		NeatoLib.Updates.check(this);

		this.style = NeatoLib.injectCSS(`
			.vgr-separator {
				font-weight: bold;
				color: white;
				background-color: rgba(0, 0, 0, 0.3);
				padding: 10px;
				margin: 10px;
				border-radius: 5px;
			}

			.vgr-separator > :first-child {
				cursor: pointer;
			}

			.vgr-nonefound {
				font-weight: bold;
				color: white;
				padding: 15px;
				opacity: 0.6;
			}

			.vgr-title {
				font-size: 20px;
				color: white;
				padding: 10px;
				text-align: center;
			}

			#vgr-scroller {
				max-height: 760px;
			}

			.vgr-friend-item {
				height: 48px;
				padding: 10px;
				margin: 10px;
				background-color: rgba(0, 0, 0, 0.15);
				border-radius: 5px;
				transition: all 0.3s;
				color: lightgray;
			}

			.vgr-separator.collapsed > :not(:first-child) {
				display: none;
			}

			.vgr-friend-item:hover {
				background-color: #7289da;
				color: white !important;
			}

			.vgr-friend-item-avatar {
				background-color: rgba(0, 0, 0, 0.5);
				border-radius: 5px;
			}

			.vgr-friend-item-username {
				display: inline-block;
				position: relative;
				bottom: 20px;
			}

			.vgr-mutual-servers {
				float: right;
			}

			.vgr-mutual-servers > .vgr-friend-item-avatar {
				display: inline-block;
				margin-left: 10px;
				width: 48px;
				height: 48px;
			}

			.vgr-mutual-servers > .vgr-more {
				text-align: center;
				vertical-align: top;
				line-height: 47px;
				font-size: 20px;
				color: white !important;
			}

			.vgr-mutual-servers > :not(.vgr-more) {
				cursor: pointer;
			}
		`);

		this.contextMenuEvent = e => this.onContextMenu(e);

		this.memberModule = NeatoLib.Modules.get(["getMember", "getMembers"]);
		this.relationshipModule = NeatoLib.Modules.get("getRelationships");
		this.userModule = NeatoLib.Modules.get(["getUser", "getUsers"]);
		this.guildModule = NeatoLib.Modules.get(["getGuild", "getGuilds"]);
		this.channelModule = NeatoLib.Modules.get(["getChannel", "getChannels"]);

		document.addEventListener("contextmenu", this.contextMenuEvent);

		NeatoLib.Events.onPluginLoaded(this);
	}

	onContextMenu(e) {
		const contextMenu = NeatoLib.ContextMenu.get();

		if (contextMenu && (e.target.classList.contains(NeatoLib.getClass("acronym","wrapper")) || e.target.classList.contains(NeatoLib.getClass("acronym")))) {
			const gid = (e.target.parentElement.href || e.target.href).match(/\d+/);
			if (gid) contextMenu.firstChild.appendChild(NeatoLib.ContextMenu.createItem("View Relationships", () => this.getRelationships(gid[0])));
		}
	}

	getMutualServers(uid) {
		const guilds = NeatoLib.Modules.get("getGuilds").getGuilds(), isMember = NeatoLib.Modules.get("isMember").isMember, mutual = [];

		for (let gid in guilds) {
			if (isMember(gid, uid)) {
				mutual.push(guilds[gid]);
			}
		}

		return mutual;
	}

	getRelationships(gid) {
		NeatoLib.ContextMenu.close();

		let relationships = this.relationshipModule.getRelationships(),
			guild = this.guildModule.getGuild(gid);

		let win = NeatoLib.UI.createBasicScrollList("vgr-relationshipswindow", "Relationships in " + guild.name);

		win.scroller.insertAdjacentHTML("beforeend", `
			<div id="vgr-friends-separator" class="vgr-separator"><div onclick="if(this.parentElement.classList.contains('collapsed')) this.parentElement.classList.remove('collapsed'); else this.parentElement.classList.add('collapsed');">Friends</div><div class="vgr-nonefound">No friends found here.</div></div>

			<div id="vgr-blocked-separator" class="vgr-separator"><div onclick="if(this.parentElement.classList.contains('collapsed')) this.parentElement.classList.remove('collapsed'); else this.parentElement.classList.add('collapsed');">Blocked Users</div><div class="vgr-nonefound">No blocked users found here.</div></div>

			<div id="vgr-incoming-separator" class="vgr-separator"><div onclick="if(this.parentElement.classList.contains('collapsed')) this.parentElement.classList.remove('collapsed'); else this.parentElement.classList.add('collapsed');">Incoming Friend Requests</div><div class="vgr-nonefound">No incoming friend requests found here.</div></div>

			<div id="vgr-outgoing-separator" class="vgr-separator"><div onclick="if(this.parentElement.classList.contains('collapsed')) this.parentElement.classList.remove('collapsed'); else this.parentElement.classList.add('collapsed');">Outgoing Friend Requests</div><div class="vgr-nonefound">No outgoing friend requests found here.</div></div>
		`);

		let friends = document.getElementById("vgr-friends-separator"),
			noFriendsFound = friends.getElementsByClassName("vgr-nonefound")[0],
			blocked = document.getElementById("vgr-blocked-separator"),
			noBlockedFound = blocked.getElementsByClassName("vgr-nonefound")[0],
			incoming = document.getElementById("vgr-incoming-separator"),
			noIncomingFound = incoming.getElementsByClassName("vgr-nonefound")[0],
			outgoing = document.getElementById("vgr-outgoing-separator"),
			noOutgoingFound = outgoing.getElementsByClassName("vgr-nonefound")[0];

		let friendItem = user => {
			return `
				<div class="vgr-friend-item" data-name="${user.username}" data-tag="${user.tag}" data-id="${user.id}">
					<img class="vgr-friend-item-avatar" src="${user.getAvatarURL()}" height="48px" width="48px">
					<div class="vgr-friend-item-username">${user.username}</div>
				</div>
			`;
		};

		let mutualServerList = user => {
			const mutual = this.getMutualServers(user.id), element = document.createElement("div"), overflow = [];

			element.className = "vgr-mutual-servers";

			for (let i = 0; i < mutual.length; i++) {
				if (i > 4) {
					overflow.push(mutual[i].name);
					continue;
				}

				element.insertAdjacentHTML("afterBegin", `<img class="vgr-friend-item-avatar" src="${mutual[i].getIconURL()}" height="48px" width="48px">`);
				NeatoLib.Tooltip.attach(mutual[i].name, element.firstElementChild);

				element.firstElementChild.addEventListener("click", () => {
					NeatoLib.Modules.get("selectGuild").selectGuild(mutual[i].id);
					win.window.remove();
				});
			}

			if (overflow.length) {
				element.insertAdjacentHTML("afterBegin", `<div class="vgr-friend-item-avatar vgr-more">+${overflow.length}</div>`);
				NeatoLib.Tooltip.attach(overflow.join(", "), element.firstElementChild);
			}

			return element;
		};

		for (let uid in relationships) {
			let user = this.userModule.getUser(uid),
				member = this.memberModule.getMember(gid, uid),
				added;

			if (!user || !member) continue;

			if (relationships[uid] == 1) {
				if (noFriendsFound) noFriendsFound.remove();
				friends.insertAdjacentHTML("beforeend", friendItem(user));
				added = friends.lastElementChild;
				added.appendChild(mutualServerList(user));
			}

			if (relationships[uid] == 2) {
				if (noBlockedFound) noBlockedFound.remove();
				blocked.insertAdjacentHTML("beforeend", friendItem(user));
				added = blocked.lastElementChild;
				added.appendChild(mutualServerList(user));
			}

			if (relationships[uid] == 3) {
				if (noIncomingFound) noIncomingFound.remove();
				incoming.insertAdjacentHTML("beforeend", friendItem(user));
				added = incoming.lastElementChild;
				added.appendChild(mutualServerList(user));
			}

			if (relationships[uid] == 4) {
				if (noOutgoingFound) noOutgoingFound.remove();
				outgoing.insertAdjacentHTML("beforeend", friendItem(user));
				added = outgoing.lastElementChild;
				added.appendChild(mutualServerList(user));
			}

			if (added) {
				if (member && member.colorString) added.style.color = member.colorString;
				added.addEventListener("contextmenu", e => this.onFriendItemContext(user, Array.filter(Object.values(this.channelModule.getChannels()), c => c.guild_id == gid)[0], e));
			}
		}

		if (!noFriendsFound) NeatoLib.DOM.sortChildren(friends);
		if (!noBlockedFound) NeatoLib.DOM.sortChildren(blocked);
		if (!noIncomingFound) NeatoLib.DOM.sortChildren(incoming);
		if (!noOutgoingFound) NeatoLib.DOM.sortChildren(outgoing);
	}

	onFriendItemContext(u, c, e) {
		if (u && c) NeatoLib.Modules.get("openUserContextMenu").openUserContextMenu(e, u, c);
		if (NeatoLib.ContextMenu.get()) {
			NeatoLib.ContextMenu.get().style.zIndex = "10000";
			NeatoLib.ContextMenu.get().firstChild.firstChild.addEventListener("click", () => document.getElementById("vgr-relationshipswindow").remove());
		}
	}

	stop() {
		document.removeEventListener("contextmenu", this.contextMenuEvent);
		if (this.style) this.style.destroy();
	}

}
