//META{"name":"AvatarIconViewer"}*//

class AvatarIconViewer {
	
	constructor(){
		this.clickedTooSoon = false;
		this.url = "";
	}
	
    getName() { return "User Avatar And Server Icon Viewer"; }
    getDescription() { return "Allows you to view server icons, user avatars, and emotes in fullscreen via the context menu. You may also directly copy the image URL or open the URL externally."; }
    getVersion() { return "0.4.12"; }
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
	
	initialize() {
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/AvatarIconViewer.plugin.js");
		this.clickedTooSoon = false;
		$(document).on("contextmenu.AvatarIconViewer", e => { this.onContextMenu(e); });
	}
	
	onContextMenu(e) {
		if(this.clickedTooSoon == false){
			var target = e.target, context = $(".contextMenu-HLZMGh")[0], viewLabel, copyLabel;
			if(context){
				this.url = "";
				var messageGroup = $(target).parents(".message-group"), ownerInstance = ReactUtilities.getOwnerInstance(target),
					member = $(target).parents(".member-3W1lQa"), dm = $(target).parents(".channel.private, .friends-row").add(".friends-row");
				if(messageGroup.length && !(target.className.includes("avatar") || target.className.includes("user-name") || target.className.includes("emoji")))
					return;
				if(messageGroup.length){
					var messages = ReactUtilities.getReactInstance(messageGroup).return.memoizedProps.messages;
					if(messages != null && messages.length > 0)
						this.url = messages[0].author.getAvatarURL();
					if(ReactUtilities.getOwnerInstance(messageGroup).state.animatedAvatar)
						this.url = this.url.replace(".png", ".gif");
				}
				if(member.length){
					var user = ReactUtilities.getOwnerInstance(member).props.user;
					this.url = user.getAvatarURL();
					if(user.avatar.startsWith("a_"))
						this.url = this.url.replace(".png", ".gif");
				}
				if(dm.length){
					this.url = this.getBetween(dm.find(".avatar-small")[0].style.backgroundImage, "url(\"", "\")");
					if(this.url.includes("/a_"))
						this.url = this.url.replace(".png", ".gif");
				}
				if(target.style.backgroundImage.includes("/icons/")){
					this.url = this.getBetween(target.outerHTML, "url(&quot;", "&quot;)") + "?size=2048";
					viewLabel = "View Icon";
					copyLabel = "Copy Icon URL";
				}else if(target.className.includes("emoji")){
					this.url = target.src;
					viewLabel = "View Emote";
				}else if(this.url != ""){
					if(this.url.includes("?"))
						this.url = this.url.substr(0, this.url.indexOf("?"));
					this.url += "?size=2048";
					viewLabel = "View Avatar";
					copyLabel = "Copy Avatar URL";
				}
				if(viewLabel){
					$(context.firstChild).append(`<div id="aic-view-button" class="item-1Yvehc"><span>` + viewLabel + `</span></div>`);
					$("#aic-view-button").on("click", e => { this.createImagePreview(e); });
				}
				if(copyLabel){
					$(context.firstChild).append(`<div id="aic-copy-button" class="item-1Yvehc"><span>` + copyLabel + `</span></div>`);
					$("#aic-copy-button").on("click", e => { this.copyURL(e); });
				}
			}
			setTimeout(e => {
				this.clickedTooSoon = false;
			}, 200);
			this.clickedTooSoon = true;
		}
	}
	
	createImagePreview() {
		if(document.getElementById("avatar-img-preview") == null){
			$(document).on("keyup.AvatarIconViewer", e => { this.onEscape(e); });
			$(".contextMenu-HLZMGh").hide();
			var app = $(".app").last(), scale = window.innerHeight - 160;
			app.append(`<div id="aiv-preview-window"><div id="aiv-preview-backdrop" class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div><div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1JeGVc"><div><div class="imageWrapper-2p5ogY" style="width: ` + scale + `px; height: ` + scale + `px;"><img src="` + this.url + `" style="width: 100%; height: 100%;"></div><div style="text-align: center; padding-top: 5px;"><button id="aiv-preview-copy" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Copy URL</div></button><button id="aiv-preview-close" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Close</div></button><button id="aiv-preview-open" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeSmall-2cSMqn grow-q77ONN" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Open Externally</div></button></div></div></div></div></div>`);
			$("#aiv-preview-backdrop").on("click", e => { this.destroyPreview(e); });
			$("#aiv-preview-copy").on("click", e => { this.copyURL(e); });
			$("#aiv-preview-close").on("click", e => { this.destroyPreview(e); });
			$("#aiv-preview-open").on("click", e => { this.openURL(e); });
		}
	}
	
	onEscape(e){
		if(e.keyCode == 27)
			this.destroyPreview();
	}
	
	destroyPreview() {
		$("#aiv-preview-window").remove();
		$(document).off("keyup.AvatarIconViewer");
	}
	
	copyURL() {
		$(".contextMenu-HLZMGh").hide();
		document.body.insertAdjacentHTML("beforeend", "<textarea class=\"temp-clipboard-data\" width=\"0\">" + this.url + "</textarea>");
		var qs = document.querySelector(".temp-clipboard-data");
		qs.select();
		var success = document.execCommand("copy");
		document.getElementsByClassName("temp-clipboard-data")[0].outerHTML = "";
		if(success == true)
			PluginUtilities.showToast("URL copied to clipboard!");
		else
			PluginUtilities.showToast("Failed to copy URL!");
	}
	
	openURL() {
		window.open(this.url);
	}
	
    stop() {
		$(document).off("contextmenu.AvatarIconViewer");
		$(document).off("keyup.AvatarIconViewer");
	}
	
	getBetween(str, first, last) {
		return str.substring(str.lastIndexOf(first) + first.length, str.lastIndexOf(last));
	}
	
}
