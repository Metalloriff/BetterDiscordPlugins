//META{"name":"TheClapBestClapPluginClapEver","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TheClapBestClapPluginClapEver.plugin.js"}*//

class TheClapBestClapPluginClapEver {
	
    getName() { return "The Clap Best Clap Plugin Clap Ever"; }
	getDescription() { return `Literally the most useless and cancerous plugin ever. Put "clapclap:" at the first of your message to replace spaces with clap emojis. You can also do "clapclap(some_emote_name):" to use custom emotes, "superclapclap" for every character instead of every space, "ra:" to replace all characters with regional indicators, "reverse:" to reverse the message, "b:" for the good shit, and "owo:" for complete fucking cancer.`; }
    getVersion() { return "0.4.7"; }
    getAuthor() { return "Metalloriff"; }

    load() {}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}
		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);

	}
	
	onLibLoaded() {

		NeatoLib.Updates.check(this);

		this.onChatInput = e => {

			const chatbox = e.target;

			if(e.which == 13 && !e.shiftKey && chatbox.value){

				let chatboxValue = chatbox.value.trim(), changed = false;

				if(chatboxValue.startsWith("clapclap") || chatboxValue.startsWith("superclapclap")){

					let getClapClap = chatboxValue.substring(0, chatboxValue.indexOf(":") + 1), emote = "clap", definedEmote = getClapClap.substring(getClapClap.indexOf("(") + 1, getClapClap.indexOf(")"));

					if(definedEmote) emote = definedEmote;

					emote = " :" + emote  + ": ";

					chatboxValue = chatboxValue.replace(getClapClap, "").split(chatboxValue.startsWith("super") ? "" : " ").join(emote);

					if(chatboxValue.startsWith(emote)) chatboxValue += emote;

					changed = true;
					
				}

				if(chatboxValue.startsWith("ra:")){

					let alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", temp = chatboxValue.split(" ").join("\t");

					for(let i = 0; i < alphabet.length; i++) temp = temp.replace("ra:", "").split(alphabet[i]).join("[a" + i + "]");
					for(let i = 0; i < alphabet.length; i++) temp = temp.split("[a" + i + "]").join(":regional_indicator_" + alphabet[i].toLowerCase() + ": ");

					temp = temp.split("?").join(":question:");

					chatboxValue = temp;

					changed = true;

				}

				if(chatboxValue.startsWith("reverse:")) {
					chatboxValue = chatboxValue.replace("reverse:", "").split("").reverse().join("");
					changed = true;
				}

				if(chatboxValue.startsWith("owo:")) {

					const cancer = ["owo", "OwO", "uwu", "UwU", ">w<", "^w^"];

					chatboxValue = chatboxValue.replace("owo:", "").trim();

					chatboxValue = chatboxValue.split("r").join("w").split("R").join("W").split("l").join("w").split("L").join("W").split(" n").join(" ny").split(" N").join(" Ny").split("ove").join("uv").split("OVE").join("UV");

					chatboxValue += " " + cancer[cancer.length * Math.random() << 0];

					if(chatbox.value == chatbox.value.toUpperCase()) chatboxValue = chatboxValue.toUpperCase();

					changed = true;

				}

				if(chatboxValue.toLowerCase().startsWith("b:")) {
					chatboxValue = chatboxValue.substring(2, chatboxValue.length).split("b").join(":b:");
					changed = true;
				}
				
				if(changed) {
					chatbox.select();
					document.execCommand("insertText", false, chatboxValue);
				}

			}

		};

		this.switch();

		NeatoLib.Events.attach("switch", this.switchEvent = () => this.switch());

		NeatoLib.Events.onPluginLoaded(this);

	}
	
	switch() {
		const chatbox = NeatoLib.Chatbox.get();
		if(chatbox) chatbox.addEventListener("keydown", this.onChatInput);
	}
	
    stop() {
		const chatbox = NeatoLib.Chatbox.get();
		if(chatbox) chatbox.removeEventListener("keydown", this.onChatInput);
		NeatoLib.Events.detach("switch", this.switchEvent);
	}
	
}
