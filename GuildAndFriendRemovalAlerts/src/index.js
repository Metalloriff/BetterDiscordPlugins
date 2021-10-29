import BasePlugin from "@zlibrary/plugin";
import { Patcher, PluginUtilities, ReactComponents, WebpackModules } from "@zlibrary";
import SettingsPanel from "./components/settings";
import Settings from "./modules/settings";
import Stores from "@discord/stores";
import { ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalRoot, openModal, closeModal } from "@discord/modal";
import stylesheet from "styles";
import styles from "./styles.scss";
import Item from "./components/item";
import ContextMenu, { closeContextMenu, MenuItem, openContextMenu } from "@discord/contextmenu";
import pkg from "./package.json";
import { ActionTypes } from "@discord/constants";
import { Dispatcher } from "@discord/modules";

const { getFriendIDs } = WebpackModules.getByProps("getFriendIDs");
const HomeButton = WebpackModules.getByProps("DefaultHomeButton");
const events = [ ActionTypes.GUILD_CREATE, ActionTypes.GUILD_DELETE, ActionTypes.GUILD_UPDATE, ActionTypes.RELATIONSHIP_ADD,
				 ActionTypes.RELATIONSHIP_REMOVE, ActionTypes.RELATIONSHIP_UPDATE, ActionTypes.FRIEND_REQUEST_ACCEPTED ];

export default class GuildAndFriendRemovalAlerts extends BasePlugin {
	history = {
		guilds: Settings.get("removedGuildHistory", []),
		friends: Settings.get("removedFriendHistory", []),
		update: () => {
			Settings.set("removedGuildHistory", this.history.guilds);
			Settings.set("removedFriendHistory", this.history.friends);
		},
		clear: () => {
			Object.assign(this.history, {
				guilds: [],
				friends: []
			});
			
			this.history.update();
		}
	};
	
	snapshots = {
		guilds: Settings.get("guildsSnapshot", []),
		friends: Settings.get("friendsSnapshot", []),
		update: ({ guilds, friends }) => {
			Settings.set("guildsSnapshot", this.snapshots.guilds = guilds);
			Settings.set("friendsSnapshot", this.snapshots.friends = friends);
		}
	};
	
	getSettingsPanel = () => <SettingsPanel/>;
	
	onStart() {
		// TODO fix home button context menu
		Patcher.after(HomeButton, "DefaultHomeButton", (_, [props], component) => {
			component.props.onContextMenu = e => {
				openContextMenu(e, () => (
					<ContextMenu.default navId={pkg.info.name} onClose={closeContextMenu}>
						<MenuItem label="View GFR Logs" action={() => this.openModal(this.history.guilds, this.history.friends, true)} id={pkg.info.name + "-logs"}/>
						<MenuItem label="View All Guilds and Friends" action={() => this.openModal()} id={pkg.info.name + "-view-all"}/>
					</ContextMenu.default>
				));
			};
		});
		
		stylesheet.inject();
		
		events.forEach(eventType => Dispatcher.subscribe(eventType, this.main));
	}
	
	serializeGuild(guildId) {
		const serialized = { id: guildId, invalid: true, name: "Unknown Guild", iconUrl: "/assets/1531b79c2f2927945582023e1edaaa11.png" };
		
		try {
			const guild = Stores.Guilds.getGuild(guildId);
			
			if (guild) {
				Object.assign(serialized, {
					invalid: false,
					name: guild.name,
					ownerId: guild.ownerId,
					iconUrl: typeof(guild.getIconURL) === "function" ? guild.getIconURL("webp") : serialized.iconUrl
				});
			}
		} finally { }
		
		return serialized;
	}
	
	serializeUser(userId) {
		const serialized = { id: userId, invalid: true, tag: "Unknown User", avatarURL: "/assets/1cbd08c76f8af6dddce02c5138971129.png" };

		try {
			const user = Stores.Users.getUser(userId);
			
			if (user) {
				Object.assign(serialized, {
					invalid: false,
					tag: user.tag,
					avatarUrl: typeof(user.getAvatarURL) === "function" ? user.getAvatarURL("webp") : serialized.avatarUrl
				});
			}
		} finally { }

		return serialized;
	}
	
	main = () => {
		console.log("main()");
		
		const guilds = Object.keys(Stores.Guilds.getGuilds()).map(guildId => this.serializeGuild(guildId));
		const friends = getFriendIDs().map(uid => this.serializeUser(uid));
		
		const removedGuilds = this.snapshots.guilds.filter(snapshot => !guilds.some(guild => snapshot.id === guild.id));
		const removedFriends = this.snapshots.friends.filter(snapshot => !friends.some(friend => snapshot.id === friend.id));
		
		if (removedGuilds.length || removedFriends.length) {
			if (Settings.get("showModal", true))
				this.openModal(removedGuilds, removedFriends);
			
			removedGuilds.forEach(guild => this.history.guilds.unshift(guild));
			removedFriends.forEach(friend => this.history.friends.unshift(friend));
			
			if (Settings.get("showDeskNotifs", false)) {
				removedGuilds.forEach(guild =>
					new Notification(guild.name, {
						silent: true,
						body: "Server removed",
						icon: guild.iconUrl
					}));
				
				removedFriends.forEach(friend =>
					new Notification(friend.name, {
						silent: true,
						body: "Friend removed",
						icon: friend.avatarUrl
					}));
			}
		}
		
		if (guilds.length !== this.snapshots.guilds.length || friends.length !== this.snapshots.friends.length) {
			this.history.update();
			this.snapshots.update({ guilds, friends });
			
			console.log("update");
		}
	};
	
	openModal(guilds, friends, showClearButton = false) {
		if (!guilds && !friends) {
			guilds = this.snapshots.guilds;
			friends = this.snapshots.friends;
		}
		
		const clearLogs = () =>
			BdApi.showConfirmationModal("Are you sure?", "Do you really want to clear the logs?\nThis action cannot be undone.", {
				danger: true,
				onConfirm: () => {
					this.history.clear();
					closeModal(modalId);
				},
				confirmText: "Clear"
			});
		
		const modalId = openModal(props => (
			<ModalRoot {...props} size="large" className={styles.modal}>
				<ModalHeader>Guild And Friend Removal Alerts <ModalCloseButton className={styles.floatRight} onClick={props.onClose}/></ModalHeader>
				
				<ModalContent {...props}>
					{ guilds?.length || friends?.length ? (
						<React.Fragment>
							{ showClearButton ? (
								<div className={styles.clearButton} onClick={clearLogs}>
									Clear Logs
								</div>
							) : null }
							
							{ guilds?.length ? (
								<div className={styles.itemContainer}>
									<div className={styles.title}>Guilds - <span style={{ color: "var(--control-brand-foreground-new)" }}>{guilds.length}</span></div>

									<div className={styles.items}>
										{ guilds.map((guild, i) =>
											<Item key={i} title={guild.name} description={"Owner ID - " + guild.ownerId} icon={guild.iconUrl} clickId={guild.ownerId} closeModal={props.onClose}/>) }
									</div>
								</div>
							) : null }

							{ friends?.length ? (
								<div className={styles.itemContainer}>
									<div className={styles.title}>Friends - <span style={{ color: "var(--control-brand-foreground-new)" }}>{friends.length}</span></div>

									<div className={styles.items}>
										{ friends.map((friend, i) =>
											<Item key={i} title={friend.tag} icon={friend.avatarUrl} clickId={friend.id} closeModal={props.onClose}/>) }
									</div>
								</div>
							) : null }
						</React.Fragment>
					) : (
						<div className={styles.nothingHere}>
							No logs to show.
						</div>
					) }
				</ModalContent>
			</ModalRoot>
		));
	}
	
	onStop() {
		Patcher.unpatchAll();
		stylesheet.remove();

		events.forEach(eventType => Dispatcher.unsubscribe(eventType, this.main));
	}
}
