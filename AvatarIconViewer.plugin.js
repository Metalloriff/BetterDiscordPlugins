//META{"name":"AvatarIconViewer"}*//

class AvatarIconViewer {
	
	constructor(){
		this.clickedTooSoon = false;
		this.url = "";
		this.onContextMenuEvent = e => { this.onContextMenu(e); };
		this.onEscapeEvent = e => { this.onEscape(e); };
	}
	
	get themeType(){
		if(!$(".theme-dark").length)
			return "light";
		else
			return "dark";
	}
	
    getName() { return "User Avatar And Server Icon Viewer"; }
    getDescription() { return "Allows you to view server icons and user avatars in fullscreen by right clicking on a user's avatar or a server icon. You can also directly copy the image URL or open the URL externally. If you need any help or have any suggestions, feel free to message me, Metalloriff#2891."; }
    getVersion() { return "0.2.3"; }
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
		document.addEventListener("contextmenu", this.onContextMenuEvent);
	}
	
	onContextMenu() {
		if(this.clickedTooSoon == false){
			var x = event.clientX, y = event.clientY, elementMouseIsOver = document.elementFromPoint(x, y), context = $(".contextMenu-uoJTbz")[0], messageGroup = null, userData = null, memberElement;
			if(context){
				$(".member.member-status").toArray().forEach(function(e){
					if(e.outerHTML.includes(elementMouseIsOver.outerHTML))
						memberElement = e;
				});
				if(memberElement == null){
					$(".draggable-3SphXU").toArray().forEach(function(e){
						if(e.outerHTML.includes(elementMouseIsOver.outerHTML))
							memberElement = e;
					});
					$(".message-group").toArray().forEach(function(e){
						if(e.outerHTML.includes(elementMouseIsOver.outerHTML))
							messageGroup = e;
					});
				}
				if(messageGroup != null){
					var messages = messageGroup[Object.keys(messageGroup).find((key) => key.startsWith('__reactInternalInstance'))].return.memoizedProps.messages;
					if(messages != null && messages.length > 0)
						userData = messages[0].author;
				}
				if(elementMouseIsOver.style.backgroundImage.includes("/icons/")){
					this.url = this.getBetween(elementMouseIsOver.outerHTML, "url(&quot;", "&quot;)").replace(".webp", ".png") + "?size=2048";
					$(context.firstChild).append(`<div id="aic-view-button" class="item-1XYaYf"><span>View Icon</span></div>`);
					$(context.firstChild).append(`<div id="aic-view-button" class="item-1XYaYf"><span>Copy Icon URL</span></div>`);
					$("#aic-view-button").on("click", e => { this.createImagePreview(e); });
					$("#aic-copy-button").on("click", e => { this.copyURL(e); });
				}else if(elementMouseIsOver.className.includes("avatar") || (userData != null && !elementMouseIsOver.parentElement.outerHTML.includes("markup")) || memberElement != null){
					if(elementMouseIsOver.className.includes("avatar"))
						this.url = this.getBetween(elementMouseIsOver.outerHTML, "url(&quot;", "&quot;)");
					else if(userData != null)
						this.url = userData.getAvatarURL();
					else
						this.url = this.getBetween(memberElement.outerHTML, "url(&quot;", "&quot;)");
					if(this.url.includes("?"))
						this.url = this.url.substr(0, this.url.indexOf("?"));
					this.url += "?size=2048";
					$(context.firstChild).append(`<div id="aic-view-button" class="item-1XYaYf"><span>View Avatar</span></div>`);
					$(context.firstChild).append(`<div id="aic-view-button" class="item-1XYaYf"><span>Copy Avatar URL</span></div>`);
					$("#aic-view-button").on("click", e => { this.createImagePreview(e); });
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
			document.addEventListener("keyup", this.onEscapeEvent);
			this.closeContextMenu();
			var p = $(".theme-" + this.themeType).last(), scale = window.innerHeight - 160;
			p.append(`<div id="aiv-preview-window" class=""><div id="aiv-preview-backdrop" class="backdrop-2ohBEd" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div><div class="modal-2LIEKY" style="opacity: 1; transform: scale(1) translateZ(0px);"><div class="inner-1_1f7b"><div><div class="imageWrapper-38T7d9" style="width: ` + scale + `px; height: ` + scale + `px;"><img src="` + this.url + `" style="width: 100%; height: 100%;"></div><div style="text-align: center; padding-top: 5px;"><button id="aiv-preview-copy" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Copy URL</div></button><button id="aiv-preview-close" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Close</div></button><button id="aiv-preview-open" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u" type="button" style="display: inline-block; height: 30px !important; min-height: 30px !important; margin-right: 5px; margin-left: 5px;"><div class="contents-4L4hQM">Open Externally</div></button></div></div></div></div></div>`);
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
		document.removeEventListener("keyup", this.onEscapeEvent);
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
		document.removeEventListener("contextmenu", this.onContextMenuEvent);
		document.removeEventListener("keyup", this.onEscapeEvent);
	}
	
	getBetween(str, first, last) {
		return str.substring(str.lastIndexOf(first) + first.length, str.lastIndexOf(last));
	}
	
}
