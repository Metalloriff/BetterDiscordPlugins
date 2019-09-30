//META{"name":"SendLinksDirectly","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/SendLinksDirectly.plugin.js"}*//

class SendLinksDirectly {

  getName() { return "SendLinksDirectly"; }
  getDescription() { return `Allows you to enclose direct links in square brackets to upload them directly, instead of sending a link.
  Usage: [link] or [link, filename.fileformat]
  Example: [https://static-cdn.jtvnw.net/emoticons/v1/521050/4.0, forsenE.png]`; }
  getVersion() { return "1.1.4"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			"1.1.3":
			`
				You can now send files from your PC with files paths.
			`
		};
	}

	load() {}

	start() {
		const libLoadedEvent = () => {
			try{ this.onLibLoaded(); }
			catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
		};

		let lib = document.getElementById("NeatoBurritoLibrary");
		if (!lib) {
			lib = document.createElement("script");
			lib.id = "NeatoBurritoLibrary";
			lib.type = "text/javascript";
			lib.src = "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js";
			document.head.appendChild(lib);
		}

		this.forceLoadTimeout = setTimeout(libLoadedEvent, 30000);
		if (typeof window.NeatoLib !== "undefined") libLoadedEvent();
		else lib.addEventListener("load", libLoadedEvent);
	}

	onLibLoaded() {
		NeatoLib.Updates.check(this);

		NeatoLib.Events.onPluginLoaded(this);

		const fs = require("fs");

		this.keyEvent = e => {
			const chatbox = e.target,
				selectedChannel = NeatoLib.getSelectedTextChannel();

			if (selectedChannel == undefined) return;

			if (e.which == 13 && !e.shiftKey && chatbox.value.trim() != "") {
				let search = chatbox.value.split("[").join("][").split("]"),
					links = [],
					files = [],
					message = chatbox.value;

				for (let i = 1; i < search.length - 1; i++) {
					search[i] = search[i].split("\\").join("/").split("\"").join("");

					if (search[i].startsWith("[http")) {
						links.push(search[i].substring(1, search[i].length).split(","));
						message = message.substring(0, message.indexOf("[")) + message.substring(message.indexOf("]") + 1, message.length);
					} else if (search[i].substring(1, search[i].length).match(/^[A-Z]:\//)) {
						files.push(search[i].substring(1, search[i].length).split(","));
						message = message.substring(0, message.indexOf("[")) + message.substring(message.indexOf("]") + 1, message.length);
					}
				}

				for (let i = 0; i < links.length; i++) {
					const filename = links[i][0].substring(links[i][0].lastIndexOf("/") + 1, links[i][0].length).split("?")[0];

					NeatoLib.requestFile(links[i][0], links[i].length > 1 ? links[i][1] : filename, file => {
						NeatoLib.Modules.find(m => m.upload && typeof m.upload === 'function').upload(selectedChannel.id, file, {
							content: i == 0 ? message : "",
							tts: false
						});
					});
				}

				for (let i = 0; i < files.length; i++) {
					const filename = files[i][0].substring(files[i][0].lastIndexOf("/") + 1, files[i][0].length);

					NeatoLib.Modules.find(m => m.upload && typeof m.upload === 'function').upload(selectedChannel.id, new File([fs.readFileSync(files[i][0])], files[i].length > 1 ? files[i][1] : filename), {
						content: i == 0 ? message : "",
						tts: false
					});
				}

				if (links.length > 0 || files.length > 0) NeatoLib.Chatbox.setText("");
			}
		};

		this.switchEvent = () => this.switch();

		this.switch();

		Metalloriff.Changelog.compareVersions(this.getName(), this.getChanges());

		NeatoLib.Events.attach("switch", this.switchEvent);
	}

	switch () {
		const chatbox = NeatoLib.Chatbox.get();

		if (chatbox == undefined) return;

		chatbox.addEventListener("keydown", this.keyEvent);
	}

	stop() {
		if (NeatoLib.Chatbox.get()) NeatoLib.Chatbox.get().removeEventListener("keydown", this.keyEvent);
		NeatoLib.Events.detach("switch", this.switchEvent);
	}

}
