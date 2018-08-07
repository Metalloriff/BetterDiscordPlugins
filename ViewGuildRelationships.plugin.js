//META{"name":"ViewGuildRelationships","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/ViewGuildRelationships.plugin.js"}*//

class ViewGuildRelationships {

  getName() { return "View Guild Relationships"; }
  getDescription() { return "Adds a 'View Relationships' button to the guild dropdown and context menu that opens a list of all friends, requested friends, and blocked users in the server."; }
  getVersion() { return "1.1.7"; }
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
				cursor: default;
			}

			.vgr-separator.collapsed > * {
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

		if (contextMenu && e.target.classList.contains(NeatoLib.getClass("guildIcon"))) {
			const gid = e.target.parentElement.href.match(/\d+/);
			if (gid) contextMenu.firstChild.appendChild(NeatoLib.ContextMenu.createItem("View Relationships", () => this.getRelationships(gid[0])));
		}
	}

	getRelationships(gid) {
		NeatoLib.ContextMenu.close();

		let relationships = this.relationshipModule.getRelationships(),
			guild = this.guildModule.getGuild(gid);

		let win = NeatoLib.UI.createBasicScrollList("vgr-relationshipswindow", "Relationships in " + guild.name);

		win.scroller.insertAdjacentHTML("beforeend", `
			<div id="vgr-friends-separator" onclick="if(this.classList.contains('collapsed')) this.classList.remove('collapsed'); else this.classList.add('collapsed');" class="vgr-separator">Friends<div class="vgr-nonefound">No friends found here.</div></div>

			<div id="vgr-blocked-separator" onclick="if(this.classList.contains('collapsed')) this.classList.remove('collapsed'); else this.classList.add('collapsed');" class="vgr-separator">Blocked Users<div class="vgr-nonefound">No blocked users found here.</div></div>

			<div id="vgr-incoming-separator" onclick="if(this.classList.contains('collapsed')) this.classList.remove('collapsed'); else this.classList.add('collapsed');" class="vgr-separator">Incoming Friend Requests<div class="vgr-nonefound">No incoming friend requests found here.</div></div>

			<div id="vgr-outgoing-separator" onclick="if(this.classList.contains('collapsed')) this.classList.remove('collapsed'); else this.classList.add('collapsed');" class="vgr-separator">Outgoing Friend Requests<div class="vgr-nonefound">No outgoing friend requests found here.</div></div>
		`);

		let friends = document.getElementById("vgr-friends-separator"),
			noFriendsFound = friends.firstElementChild,
			blocked = document.getElementById("vgr-blocked-separator"),
			noBlockedFound = blocked.firstElementChild,
			incoming = document.getElementById("vgr-incoming-separator"),
			noIncomingFound = incoming.firstElementChild,
			outgoing = document.getElementById("vgr-outgoing-separator"),
			noOutgoingFound = outgoing.firstElementChild;

		let friendItem = user => {
			return `
				<div class="vgr-friend-item" data-name="${user.username}" data-tag="${user.tag}" data-id="${user.id}">
					<img class="vgr-friend-item-avatar" src="${user.getAvatarURL()}" height="48px" width="48px">
					<div class="vgr-friend-item-username">${user.username}</div>
				</div>
			`;
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
			}

			if (relationships[uid] == 2) {
				if (noBlockedFound) noBlockedFound.remove();
				blocked.insertAdjacentHTML("beforeend", friendItem(user));
				added = blocked.lastElementChild;
			}

			if (relationships[uid] == 3) {
				if (noIncomingFound) noIncomingFound.remove();
				incoming.insertAdjacentHTML("beforeend", friendItem(user));
				added = incoming.lastElementChild;
			}

			if (relationships[uid] == 4) {
				if (noOutgoingFound) noOutgoingFound.remove();
				outgoing.insertAdjacentHTML("beforeend", friendItem(user));
				added = outgoing.lastElementChild;
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
