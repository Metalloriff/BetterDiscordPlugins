//META{"name":"TheClapBestClapPluginClapEver"}*//

class TheClapBestClapPluginClapEver {
	
    getName() { return "The Clap Best Clap Plugin Clap Ever"; }
    getDescription() { return "Literally the most useless plugin ever. It allows you to surround text with \"(clapclap)\" to replace spaces with clap emojis."; }
    getVersion() { return "CLAP.CLAP.CLAP"; }
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
		this.attach();
	}
	
	onSwitch(){
		this.attach();
	}
	
	attach(){
		var chatboxJQ = $(".textAreaEnabled-2vOfh8");
		if(chatboxJQ.length){
			var chatbox = chatboxJQ[0];
			chatboxJQ.on("keydown.ClapClap", e => {
				if(e.which == 13 && !e.shiftKey && chatbox.value){
					var whyamidoingthis = chatbox.value;
					if(whyamidoingthis.startsWith("clapclap:")){
						whyamidoingthis = whyamidoingthis.replace("clapclap:", "").split(" ").join(" :clap: ");
						if(whyamidoingthis.startsWith(" :clap: "))
							whyamidoingthis += " :clap: ";
					}
					chatbox.focus();
					chatbox.select();
					document.execCommand("insertText", false, whyamidoingthis);
				}
			});
		}
	}
	
    stop() {
		var chatbox = $(".textAreaEnabled-2vOfh8");
		if(chatbox)
			chatbox.off("keydown.ClapClap");
	}
	
}