//META{"name":"AvatarIconViewer"}*//

class AvatarIconViewer {
	
	constructor(){
		this.clickedTooSoon = false;
		this.url = "";
	}
	
    getName() { return "User Avatar And Server Icon Viewer"; }
    getDescription() { return "Allows you to view server icons, user avatars, and emotes in fullscreen via the context menu. You may also directly copy the image URL or open the URL externally."; }
    getVersion() { return "0.3.7"; }
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
			var target = e.target, context = $(".contextMenu-uoJTbz")[0], messageGroup = null, userData = null, memberElement, createContext = false, viewLabel, copyLabel;
			if(context){
				$(".member-2FrNV0").toArray().forEach(function(e){
					if(e.outerHTML.includes(target.outerHTML))
						memberElement = e;
				});
				if(memberElement == null){
					$(".draggable-3SphXU").toArray().forEach(function(e){
						if(e.outerHTML.includes(target.outerHTML))
							memberElement = e;
					});
					$(".channel.private").toArray().forEach(function(e){
						if(e.outerHTML.includes(target.outerHTML))
							memberElement = e;
					});
					$(".message-group").toArray().forEach(function(e){
						if(e.outerHTML.includes(target.outerHTML))
							messageGroup = e;
					});
				}
				if(messageGroup != null){
					var messages = ReactUtilities.getReactInstance(messageGroup).return.memoizedProps.messages;
					if(messages != null && messages.length > 0)
						userData = messages[0].author;
				}
				if(target.style.backgroundImage.includes("/icons/")){
					this.url = this.getBetween(target.outerHTML, "url(&quot;", "&quot;)") + "?size=2048";
					viewLabel = "View Icon";
					copyLabel = "Copy Icon URL";
					createContext = true;
				}else if(target.className.includes("avatar") || (userData != null && target.className == "user-name") || memberElement != null){
					if(target.className.includes("avatar"))
						this.url = this.getBetween(target.outerHTML, "url(&quot;", "&quot;)");
					else if(userData != null)
						this.url = userData.getAvatarURL();
					else
						this.url = this.getBetween(memberElement.outerHTML, "url(&quot;", "&quot;)");
					if(this.url.includes("?"))
						this.url = this.url.substr(0, this.url.indexOf("?"));
					this.url += "?size=2048";
					viewLabel = "View Avatar";
					copyLabel = "Copy Avatar URL";
					createContext = true;
				}else if(target.className.includes("emoji")){
					this.url = target.src;
					viewLabel = "View Emote";
					createContext = true;
				}
				if(createContext){
					if(viewLabel){
						$(context.firstChild).append(`<div id="aic-view-button" class="item-1XYaYf"><span>` + viewLabel + `</span></div>`);
						$("#aic-view-button").on("click", e => { this.createImagePreview(e); });
					}
					if(copyLabel){
						$(context.firstChild).append(`<div id="aic-copy-button" class="item-1XYaYf"><span>` + copyLabel + `</span></div>`);
						$("#aic-copy-button").on("click", e => { this.copyURL(e); });
					}
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
			this.closeContextMenu();
			var app = $(".app").last(), scale = window.innerHeight - 160;
			app.append(`<div id="aiv-preview-window" class=""><div id="aiv-preview-backdrop" class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div><div class="imageWrapper-38T7d9" style="width: ` + scale + `px; height: ` + scale + `px;"><img src="` + this.url + `" style="width: 100%; height: 100%;"></div><div style="text-align: center; padding-top: 5px;"><button id="aiv-preview-copy" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Copy URL</div></button><button id="aiv-preview-close" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Close</div></button><button id="aiv-preview-open" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Open Externally</div></button></div></div></div></div></div>`);
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
	
	closeContextMenu(){
		var context = $(".contextMenu-uoJTbz")[0];
		if(context != null){
			context.innerHTML = "";
			context.className = "";
		}
	}
	
	copyURL() {
		this.closeContextMenu();
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
