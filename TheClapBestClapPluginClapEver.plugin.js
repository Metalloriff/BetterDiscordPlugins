//META{"name":"TheClapBestClapPluginClapEver"}*//

class TheClapBestClapPluginClapEver {
	
    getName() { return "The Clap Best Clap Plugin Clap Ever"; }
	getDescription() { return `Literally the most useless and cancerous plugin ever. Put "clapclap:" at the first of your message to replace spaces with clap emojis. You can also do "clapclap(some_emote_name):" to use custom emotes, "superclapclap" for every character instead of every space, "ra:" to replace all characters with regional indicators, "reverse:" to reverse the message, and "owo:" for complete fucking cancer.`; }
    getVersion() { return "0.4.2"; }
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

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/TheClapBestClapPluginClapEver.plugin.js");

		this.onChatInput = e => {

			let chatbox = e.target;

			if(e.which == 13 && !e.shiftKey && chatbox.value){

				let chatboxValue = chatbox.value.trim();

				if(chatboxValue.startsWith("clapclap") || chatboxValue.startsWith("superclapclap")){

					let getClapClap = chatboxValue.substring(0, chatboxValue.indexOf(":") + 1), emote = "clap", definedEmote = getClapClap.substring(getClapClap.indexOf("(") + 1, getClapClap.indexOf(")"));

					if(definedEmote) emote = definedEmote;

					emote = " :" + emote  + ": ";

					chatboxValue = chatboxValue.replace(getClapClap, "").split(chatboxValue.startsWith("super") ? "" : " ").join(emote);

					if(chatboxValue.startsWith(emote)) chatboxValue += emote;
					
				}

				if(chatboxValue.startsWith("ra:")){

					let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", temp = chatboxValue.split(" ").join("\t");

					for(let i = 0; i < alphabet.length; i++) temp = temp.replace("ra:", "").split(alphabet[i]).join("[a" + i + "]");
					for(let i = 0; i < alphabet.length; i++) temp = temp.split("[a" + i + "]").join(":regional_indicator_" + alphabet[i].toLowerCase() + ": ");

					temp = temp.split("?").join(":question:");

					chatboxValue = temp;

				}

				if(chatboxValue.startsWith("reverse:")) chatboxValue = chatboxValue.replace("reverse:", "").split("").reverse().join("");

				if(chatboxValue.startsWith("owo:")) {

					let cancer = ["owo", "OwO", "uwu", "UwU", ">w<", "^w^"];

					chatboxValue = chatboxValue.replace("owo:", "").trim();

					chatboxValue = chatboxValue.split("r").join("w").split("R").join("W").split("l").join("w").split("L").join("W").split(" n").join(" ny").split(" N").join(" Ny").split("ove").join("uv").split("OVE").join("UV");

					chatboxValue += " " + cancer[cancer.length * Math.random() << 0];

					if(chatbox.value == chatbox.value.toUpperCase()) chatboxValue = chatboxValue.toUpperCase();

				}
				
				chatbox.select();
				document.execCommand("insertText", false, chatboxValue);

			}

		};

		this.onSwitch();

	}
	
	onSwitch(){
		
		let chat = document.getElementsByClassName("chat")[0], chatbox = chat ? chat.getElementsByTagName("textarea")[0] : undefined;

		if(chatbox) chatbox.addEventListener("keydown", this.onChatInput);

	}
	
    stop() {
		
		let chat = document.getElementsByClassName("chat")[0], chatbox = chat ? chat.getElementsByTagName("textarea")[0] : undefined;

		if(chatbox) chatbox.removeEventListener("keydown", this.onChatInput);

	}
	
}
