//META{"name":"SendLinksDirectly"}*//

class SendLinksDirectly {
	
    getName() { return "SendLinksDirectly"; }
    getDescription() { return `Allows you to enclose direct links in square brackets to upload them directly, instead of sending a link.
    Usage: [link] or [link, filename.fileformat]
    Example: [https://static-cdn.jtvnw.net/emoticons/v1/521050/4.0, forsenE.png]`; }
    getVersion() { return "1.0.3"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			
		};
	}

    load() {}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
        else lib.addEventListener("load", libLoadedEvent);

	}

	onLibLoaded() {

        NeatoLib.Updates.check(this);
		
        this.uploadFile = NeatoLib.Modules.get("upload").upload;
        this.hasPermission = NeatoLib.Modules.get("can").can;
        
        NeatoLib.Events.onPluginLoaded(this);

        this.keyEvent = e => {
            
            let chatbox = e.target, selectedChannel = NeatoLib.getSelectedTextChannel();

            if(selectedChannel == undefined) return;
                
            if(e.which == 13 && !e.shiftKey && chatbox.value.trim() != "") {

                let search = chatbox.value.split("[").join("][").split("]"), links = [], message = chatbox.value;

                for(let i = 1; i < search.length - 1; i++) {

                    if(search[i].startsWith("[http")) {

                        let link = search[i].substring(1, search[i].length), args = link.split(",");

                        links.push(args);
                        
                        message = message.replace(search[i] + "]", "");

                    }

                }

                for(let i = 0; i < links.length; i++) {

                    let filename = links[i][0].substring(links[i][0].lastIndexOf("/") + 1, links[i][0].length), urlVarStart = filename.lastIndexOf("?");

                    if(urlVarStart != -1) filename = filename.substring(0, urlVarStart);

                    NeatoLib.requestFile(links[i][0], links[i].length > 1 ? links[i][1] : filename, file => {

                        this.uploadFile(selectedChannel.id, file, { content : i == 0 ? message : "", tts : false });

                    });

                }

                if(links.length > 0) {

                    chatbox.focus();
                    chatbox.select();

                    document.execCommand("delete");

                }

            }

        };

        this.switchEvent = () => this.switch();

        this.switch();

        NeatoLib.Events.attach("switch", this.switchEvent);

    }
    
    switch() {

        let chatbox = NeatoLib.Chatbox.get();

        if(chatbox == undefined) return;

        chatbox.addEventListener("keydown", this.keyEvent);

    }
	
    stop() {
        if(NeatoLib.Chatbox.get()) NeatoLib.Chatbox.get().removeEventListener("keydown", this.keyEvent);
        NeatoLib.Events.detach("switch", this.switchEvent);
	}
	
}
