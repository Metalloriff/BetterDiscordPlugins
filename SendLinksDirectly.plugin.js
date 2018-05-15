//META{"name":"SendLinksDirectly"}*//

class SendLinksDirectly {
	
    getName() { return "SendLinksDirectly"; }
    getDescription() { return `Allows you to enclose direct links in square brackets to upload them directly, instead of sending a link.
    Usage: [link] or [link, filename.fileformat]
    Example: [https://static-cdn.jtvnw.net/emoticons/v1/521050/4.0, forsenE.png]`; }
    getVersion() { return "0.0.1"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			
		};
	}

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

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SendLinksDirectly.plugin.js");
		
        this.uploadFile = InternalUtilities.WebpackModules.findByUniqueProperties(["upload"]).upload;
        this.hasPermission = InternalUtilities.WebpackModules.findByUniqueProperties(["can"]).can;

		var lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://www.dropbox.com/s/cxhekh6y9y3wqvo/NeatoBurritoLibrary.js?raw=1");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			document.head.appendChild(lib);
		}
        if(typeof window.Metalloriff !== "undefined") this.onLibLoaded();
        else lib.addEventListener("load", () => { this.onLibLoaded(); });
		
	}

	onLibLoaded() {

        this.onSwitch();

    }
    
    onSwitch() {

        var $chatbox = $(".chat textarea"), chatbox = $chatbox[0], selectedChannel = Metalloriff.getSelectedChannel();

        if(selectedChannel == undefined || (selectedChannel.type == 0 && !this.hasPermission(32768, selectedChannel))) return;

        if($chatbox.length) {

            $chatbox.on("keydown.SendLinksDirectly", e => {
                
                if(e.which == 13 && !e.shiftKey && chatbox.value.trim() != "") {

                    var search = chatbox.value.split("[").join("][").split("]"), links = new Array(), message = chatbox.value;

                    for(let i = 1; i < search.length - 1; i++) {

                        if(search[i].startsWith("[http")) {

                            var link = search[i].substring(1, search[i].length), args = link.split(",");

                            links.push(args);
                            
                            message = message.replace(search[i] + "]", "");

                        }

                    }

                    for(let i = 0; i < links.length; i++) {

                        var filename = links[i][0].substring(links[i][0].lastIndexOf("/") + 1, links[i][0].length), urlVarStart = filename.lastIndexOf("?");

                        if(urlVarStart != -1) filename = filename.substring(0, urlVarStart);

                        Metalloriff.requestFile(links[i][0], links[i].length > 1 ? links[i][1] : filename, file => {

                            this.uploadFile(selectedChannel.id, file, { content : i == 0 ? message : "", tts : false });

                        });

                    }

                    if(links.length > 0) {

                        chatbox.focus();
                        chatbox.select();

                        document.execCommand("insertText", false, "");

                    }

                }

            });

        }

    }
	
    stop() {

        $(".chat textarea").off("keydown.SendLinksDirectly");

	}
	
}
