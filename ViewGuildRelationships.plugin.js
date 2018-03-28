//META{"name":"ViewGuildRelationships"}*//

class ViewGuildRelationships {
	
	constructor() {
		this.discriminatorType = 2;
	}
	
    getName() { return "View Guild Relationships"; }
    getDescription() { return "Adds a 'View Relationships' button to the guild dropdown menu that opens a list of all friends, requested friends, and blocked users in the server."; }
    getVersion() { return "0.1.3"; }
    getAuthor() { return "Metalloriff"; }

    load() {}
	
	get themeType(){
		if($(".theme-dark").length)
			return "dark";
		else
			return "light";
	}

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
		if(!$(".plugin-settings").length)
			setTimeout(e => { this.getSettingsPanel(e); }, 100);
		else
			this.createSettingsPanel();
	}
	
	createSettingsPanel(){
		var panel = $(".plugin-settings");
		if(panel.length){
			panel.append(`<h style="color: white;font-size: 30px;font-weight: bold;">View Guild Relationships by Metalloriff</h>
				<div style="padding: 20px;">
					<h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4">Discriminator Display Type</h5>
					<div id="vgr-settings-radiogroup" class="radioGroup-2P3MJo">
						<div id="vgr-radiobutton-1" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC vgr-radiobutton" style="padding: 10px;border-radius: 0px !important;">
							<label class="checkboxWrapper-2Yvr_Y">
								<input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
								<div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
								</div>
							</label>
							<div class="info-1Z508c">
								<div class="title-1M-Ras">Never display</div>
							</div>
						</div>
						<div id="vgr-radiobutton-2" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC vgr-radiobutton" style="padding: 10px;border-radius: 0px !important;">
							<label class="checkboxWrapper-2Yvr_Y">
								<input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on" style="
									">
								<div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
								</div>
							</label>
							<div class="info-1Z508c">
								<div class="title-1M-Ras">Display on hover</div>
							</div>
						</div>
						<div id="vgr-radiobutton-3" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC vgr-radiobutton" style="padding: 10px;border-radius: 0px !important;">
							<label class="checkboxWrapper-2Yvr_Y">
								<input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on" style="
									">
								<div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4"></div>
							</label>
							<div class="info-1Z508c">
								<div class="title-1M-Ras">Always display</div>
							</div>
						</div>
					</div>
				</div>`);
				$(".vgr-radiobutton").on("click", e => { this.selectDiscriminatorType(parseInt(e.currentTarget.id[e.currentTarget.id.length - 1])); });
				this.selectDiscriminatorType(this.discriminatorType);
		}else
			this.getSettingsPanel();
	}
	
	selectDiscriminatorType(index){
		var selected = $("#vgr-settings-radiogroup > div:nth-child(" + index + ") > label > div");
		$("#vgr-radiobutton-ticked").remove();
		selected.append(`<div id="vgr-radiobutton-ticked" style="background-color: white;height: 60%;width: 60%;border-radius: 3px;"></div>`);
		this.discriminatorType = index;
		this.saveSettings();
	}
	
	saveSettings(){
		PluginUtilities.saveData("ViewGuildRelationships", "settings", { discriminatorType : this.discriminatorType });
	}
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/ViewGuildRelationships.plugin.js");
		var data = PluginUtilities.loadData("ViewGuildRelationships", "settings", { discriminatorType : 2 });
		this.discriminatorType = data["discriminatorType"];
		BdApi.injectCSS("ViewGuildRelationships", ".vgr-friend-item:hover { background-color: rgba(0, 0, 0, 0.2) !important; }");
		$(".popouts").on("DOMNodeInserted.ViewGuildRelationships", e => { this.onPopout(e); });
	}
	
	onPopout(){
		var button = $(".item-rK1j5B").last();
		if(button.length && button[0].innerHTML.includes("Server") && !$("#vgr-servermenuitem").length){
			$(`<div id="vgr-servermenuitem" class="item-rK1j5B"><div class="icon-3ICDZz" style="background-image: url(&quot;/assets/52bc30f8a2b1a51f808a785819ca00b5.svg&quot;);"></div><div class="label-HtH0tJ">View Relationships</div></div>`).insertBefore(button);
			$("#vgr-servermenuitem").on("click", e => { this.getRelationships(e); });
		}
	}
	
	getRelationships(){
		$(".menu-3BZuDT").remove();
		var members = InternalUtilities.WebpackModules.findByUniqueProperties(["getMember", "getMembers"]).getMembers(PluginUtilities.getCurrentServer()), users = Array.from(members, x => x.userId), allRelationships = ZeresLibrary.InternalUtilities.WebpackModules.findByUniqueProperties(["getRelationships"]).getRelationships(), relationships = new Array(), userModule = ZeresLibrary.InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]);
		$(".theme-" + this.themeType).last().append(`<div id="vgr-relationshipswindow">
				<div class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);" onclick="$('#vgr-relationshipswindow').remove();"></div>
				<div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);">
					<div class="inner-1_1f7b">
						<div class="wrapper-2PXjeM">
							<div class="modal-3HOjGZ modal-_aE5JX sizeSmall-1sh0-r" style="width: 800px; min-height: 800px; max-height: 800px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);">
								<div class="flex-lFgbSz flex-3B1Tl4 horizontal-2BEEBe horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ justifyStart-2yIZo0 alignCenter-3VxkQP noWrap-v6g9vO header-3sp3cE" style="flex: 0 0 auto;">
									<div class="flex-lFgbSz flex-3B1Tl4 vertical-3X17r5 flex-3B1Tl4 directionColumn-2h-LPR justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO" style="flex: 1 1 auto;">
										<h2 class="h2-2ar_1B title-1pmpPr size16-3IvaX_ height20-165WbF weightSemiBold-T8sxWH defaultColor-v22dK1 marginBottom4-_yArcI">Relationships in ` + ZeresLibrary.InternalUtilities.WebpackModules.findByUniqueProperties(["getGuild"]).getGuild(PluginUtilities.getCurrentServer()).name + `</h2>
									</div>
								</div>
								<div class="scrollerWrap-2uBjct content-1Cut5s scrollerThemed-19vinI themeGhostHairline-2H8SiW">
									<div id="vgr-scroller" class="scroller-fzNley inner-tqJwAU marginBottom8-1mABJ4"></div>
								</div>
								<div class="flex-lFgbSz flex-3B1Tl4 horizontalReverse-2LanvO horizontalReverse-k5PqxT flex-3B1Tl4 directionRowReverse-2eZTxP justifyStart-2yIZo0 alignStretch-1hwxMa noWrap-v6g9vO footer-1PYmcw" style="flex: 0 0 auto;">
									<button onclick="$('#vgr-relationshipswindow').remove();" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button">
										<div class="contents-4L4hQM">Close</div>
									</button>
									<div style="width: 15px; display: inline-block; height: auto;"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>`);
		for(var key in allRelationships)
			if(users.includes(key))
				relationships.push([key, allRelationships[key]]);
			$("#vgr-scroller").append(`<div id="vgr-friends-separator">
					<div style="font-weight: bold;color: white;background-color: rgba(0, 0, 0, 0.3);padding: 10px;">Friends</div>
					<div id="vgr-friends-nonefound" style="font-weight: bold;color: white;padding: 15px;opacity: 0.6;background-color: rgba(0, 0, 0, 0.1);">No friends found here.</div>
				</div>
				<br>
				<div id="vgr-blocked-separator">
					<div style="font-weight: bold;color: white;background-color: rgba(0, 0, 0, 0.3);padding: 10px;">Blocked Users</div>
					<div id="vgr-blocked-nonefound" style="font-weight: bold;color: white;padding: 15px;opacity: 0.6;background-color: rgba(0, 0, 0, 0.1);">No blocked users found here.</div>
				</div>
				<br>
				<div id="vgr-incoming-separator">
					<div style="font-weight: bold;color: white;background-color: rgba(0, 0, 0, 0.3);padding: 10px;">Incoming Friend Requests</div>
					<div id="vgr-incoming-nonefound" style="font-weight: bold;color: white;padding: 15px;opacity: 0.6;background-color: rgba(0, 0, 0, 0.1);">No incoming friend requests found here.</div>
				</div>
				<br>
				<div id="vgr-outgoing-separator">
					<div style="font-weight: bold;color: white;background-color: rgba(0, 0, 0, 0.3);padding: 10px;">Outgoing Friend Requests</div>
					<div id="vgr-outgoing-nonefound" style="font-weight: bold;color: white;padding: 15px;opacity: 0.6;background-color: rgba(0, 0, 0, 0.1);">No outgoing friend requests found here.</div>
				</div>`);
		for(var i = 0; i < relationships.length; i++){
			var member = members[i], user = userModule.getUser(relationships[i][0]), relationship = relationships[i][1], item =
			`<div id="vgr-friend-item-` + i + `" class="vgr-friend-item" data-name="` + user.username + `" data-tag="` + user.tag + `" data-id="` + user.id + `" style="font-weight: bold;color: white;padding: 15px;background-color: rgba(0, 0, 0, 0.1);">
				<img src="` + user.getAvatarURL() + `" height="48px" width="48px" style="position: relative;float: left;">
				<p style="left: 2%;position: relative;padding-top: 4px;">` + user.username  + `</p>
			</div>`;
			if(relationship == 1){
				$("#vgr-friends-nonefound").remove();
				$("#vgr-friends-separator").append(item);
			}
			if(relationship == 2){
				$("#vgr-blocked-nonefound").remove();
				$("#vgr-blocked-separator").append(item);
			}
			if(relationship == 3){
				$("#vgr-incoming-nonefound").remove();
				$("#vgr-incoming-separator").append(item);
			}
			if(relationship == 4){
				$("#vgr-outgoing-nonefound").remove();
				$("#vgr-outgoing-separator").append(item);
			}
			var label = $("#vgr-friend-item-" + i + ".vgr-friend-item > p")[0];
			if(member.colorString != undefined && label != null){
				label.style.color = member.colorString;
			}
		}
		var sortCheck = function(x, y){
			var a = x.dataset["name"].toLowerCase(), b = y.dataset["name"].toLowerCase();
			if(a < b)
				return -1
			else if(a > b)
				return 1;
			else
				return 0;
		};
		$("#vgr-friends-separator > .vgr-friend-item").sort(sortCheck).appendTo("#vgr-friends-separator");
		$("#vgr-blocked-separator > .vgr-friend-item").sort(sortCheck).appendTo("#vgr-blocked-separator");
		$("#vgr-incoming-separator > .vgr-friend-item").sort(sortCheck).appendTo("#vgr-incoming-separator");
		$("#vgr-outgoing-separator > .vgr-friend-item").sort(sortCheck).appendTo("#vgr-outgoing-separator");
		$("#vgr-friends-separator > div:nth-child(1), #vgr-blocked-separator > div:nth-child(1), #vgr-incoming-separator > div:nth-child(1), #vgr-outgoing-separator > div:nth-child(1)").on("click", e => {
			$(e.currentTarget.parentElement).find("*:not(div:nth-child(1))").toggle();
		});
		if(this.discriminatorType == 2)
			$(".vgr-friend-item").hover(e => { this.onFriendItemHover(e); }, e => { this.onFriendItemHoverOff(e); });
		else if(this.discriminatorType == 3)
			$(".vgr-friend-item").each(function(index){ $(this).find("p")[0].textContent = this.dataset["tag"]; });
		else
			$(".vgr-friend-item").each(function(index){ $(this).find("p")[0].textContent = this.dataset["name"]; });
		$(".vgr-friend-item").on("contextmenu", e => { this.onFriendItemContext(e.target.dataset["id"], e); });
		$(".vgr-friend-item > p, .vgr-friend-item > img").on("contextmenu", e => { this.onFriendItemContext(e.target.parentElement.dataset["id"], e); });
	}
	
	onFriendItemContext(id, e){
		var UserUtils = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser", "getUsers"]),
			ChannelUtils = InternalUtilities.WebpackModules.findByUniqueProperties(["getChannel", "getDMFromUserId"]),
			UserContextMenuUtils = InternalUtilities.WebpackModules.findByUniqueProperties(["openUserContextMenu"]),
			user = UserUtils.getUser(id),
			channel = ChannelUtils.getChannel(ReactUtilities.getReactInstance($(".wrapperSelectedText-31jJa8")[0].parentElement).memoizedProps.children.props.channel.id);
		if(user && channel)
			UserContextMenuUtils.openUserContextMenu(e, user, channel);
	}
	
	onFriendItemHover(e){
		var label = $(e.target).find("p")[0];
		if(label){
			label.textContent = e.target.dataset["tag"];
			e.target.className = "vgr-friend-item withdiscriminator";
		}
	}
	
	onFriendItemHoverOff(){
		$(".withdiscriminator").each(function(index){
			$(this).find("p")[0].textContent = this.dataset["name"];
			this.className = "vgr-friend-item";
		});
	}
	
    stop() {
		$(".popouts").off("DOMNodeInserted.ViewGuildRelationships");
		BdApi.clearCSS("ViewGuildRelationships");
	}
	
}
