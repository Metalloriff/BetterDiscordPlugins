//META{"name":"AvatarIconViewer"}*//

class AvatarIconViewer {
	
    getName() { return "User Avatar And Server Icon Viewer"; }
    getDescription() { return "Allows you to view server icons and user avatars in fullscreen by right clicking on a user's avatar or a server icon. You can also directly copy the image URL or open the URL externally. REQUIRES DARK THEME!"; }
    getVersion() { return "0.0.1"; }
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
	
	initialize(){
		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://dl.dropbox.com/s/d4cednehljcjndl/AvatarIconViewer.plugin.js");
		AvatarIconViewer.clickedTooSoon = false;
		document.addEventListener("contextmenu", this.onContextMenu, false);
	}
	
	onContextMenu(){
		if(AvatarIconViewer.clickedTooSoon == false){
			var x = event.clientX, y = event.clientY, elementMouseIsOver = document.elementFromPoint(x, y), context = document.getElementsByClassName("contextMenu-uoJTbz theme-dark")[0];
			if(context){
				if(context.outerHTML.includes("Mark As Read")){
					AvatarIconViewer.url = AvatarIconViewer.getBetween(elementMouseIsOver.outerHTML, "url(&quot;", "&quot;)").replace(".webp", ".png") + "?size=2048";
					context.firstChild.insertAdjacentHTML("beforeend", "<div class=\"item-1XYaYf\" onclick=\"AvatarIconViewer.createImagePreview();\"><span>View Icon</span><div class=\"hint-3TJykr\"></div></div>");
					context.firstChild.insertAdjacentHTML("beforeend", "<div class=\"item-1XYaYf\" onclick=\"AvatarIconViewer.copyURL();\"><span>Copy Icon URL</span><div class=\"hint-3TJykr\"></div></div>");
				}
				if(context.outerHTML.includes("Profile") && elementMouseIsOver.outerHTML.includes("avatar")){	
					AvatarIconViewer.url = AvatarIconViewer.getBetween(elementMouseIsOver.outerHTML, "url(&quot;", "?size").replace(".webp", ".png") + "?size=2048";
					context.firstChild.insertAdjacentHTML("beforeend", "<div class=\"item-1XYaYf\" onclick=\"AvatarIconViewer.createImagePreview();\"><span>View Avatar</span><div class=\"hint-3TJykr\"></div></div>");
					context.firstChild.insertAdjacentHTML("beforeend", "<div class=\"item-1XYaYf\" onclick=\"AvatarIconViewer.copyURL();\"><span>Copy Avatar URL</span><div class=\"hint-3TJykr\"></div></div>");
				}
			}
			setTimeout(function(){
				AvatarIconViewer.clickedTooSoon = false;
			}, 100);
			AvatarIconViewer.clickedTooSoon = true;
		}
	}
	
	static createImagePreview(){		
		if(document.getElementById("avatar-img-preview") == null){
			var context = document.getElementsByClassName("contextMenu-uoJTbz theme-dark")[0];
			if(context != null)
				context.innerHTML = "";
			var p = document.getElementsByClassName("theme-dark")[document.getElementsByClassName("theme-dark").length - 1];
			p.insertAdjacentHTML("beforeend", "<center><div class=\"item-1XYaYf\" id=\"avatar-img-preview\" onclick=\"AvatarIconViewer.destroyPreview();\" width=\"100\" height=\"30\">Close</div></center>");
			p.insertAdjacentHTML("beforeend", "<center><div class=\"item-1XYaYf\" id=\"avatar-img-preview\" onclick=\"AvatarIconViewer.openURL();\" width=\"200\" height=\"30\">Open Externally</div></center>");
			p.insertAdjacentHTML("afterbegin", "<center><img src=\"" + AvatarIconViewer.url + "\" width=\"" + (window.innerHeight - 60) + "\" height=\"" + (window.innerHeight - 60) + "\" id=\"avatar-img-preview\" onclick=\"AvatarIconViewer.destroyPreview();\"></center>");
		}
	}
	
	static destroyPreview(){
		document.getElementsByClassName("theme-dark")[document.getElementsByClassName("theme-dark").length - 1].innerHTML = "";
	}
	
	static copyURL(){
		document.body.insertAdjacentHTML("beforeend", "<textarea class=\"temp-clipboard-data\" width=\"0\">" + AvatarIconViewer.url + "</textarea>");
		var qs = document.querySelector(".temp-clipboard-data");
		qs.select();
		var success = document.execCommand("copy");
		document.getElementsByClassName("temp-clipboard-data")[0].outerHTML = "";
		if(success == true)
			PluginUtilities.showToast("URL copied to clipboard!");
		else
			PluginUtilities.showToast("Failed to copy URL!");
	}
	
	static openURL(){
		window.open(AvatarIconViewer.url);
	}
	
    stop() {
		document.removeEventListener("contextmenu", this.onContextMenu);
	}
	
	static getBetween(str, first, last){
		return str.substring(str.lastIndexOf(first) + first.length, str.lastIndexOf(last));
	}
	
}