//META{"name":"CustomJs","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/CustomJs.plugin.js"}*//

class CustomJs {
	
    getName() { return "CustomJs"; }
    getDescription() { return "Allows you to specify a custom JavaScript file similar to custom CSS."; }
    getVersion() { return "0.0.1"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			
		};
	}

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

	getSettingsPanel() {

		const fs = require("fs");

		setTimeout(() => {

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Custom JS file path", this.settings.filepath, e => {
				if(e.target.value && !fs.existsSync(e.target.value)) return NeatoLib.showToast("File does not exist", "error");
				this.settings.filepath = e.target.value;
				this.saveSettings();
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createButton("Browse", () => {
				NeatoLib.browseForFile(filepath => {
					if(!filepath) return NeatoLib.showToast("No file selected", "error");
					this.settings.filepath = filepath;
					this.saveSettings();
				})
			}), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createButton("Reload", () => this.reloadJs(), "float:right"), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.DOM.createElement({ innerHTML : `
				Example #1
				<pre><div style="background:#202225;display:block;padding:10px;margin-top:10px;border-radius:5px">
return new class {

	start() {
		console.log("start");
		document.addEventListener("click", this.clickEvent = e => this.onClick(e));
	}

	onClick(e) {
		console.log("clicked on", e.target);
	}

	stop() {
		document.removeEventListener("click", this.clickEvent);
		console.log("stop");
	}

	onSwitch() {
		console.log(NeatoLib.getSelectedTextChannel());	
	}
	
}
				</div></pre>
			`, style : "color:white" }, { type : "p" }), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.DOM.createElement({ innerHTML : `
				Example #2
				<pre><div style="background:#202225;display:block;padding:10px;margin-top:10px;border-radius:5px">
return {

	clickEvent : function(e) {
		console.log("clicked on", e.target);
	},

	start : function() {
		console.log("start");
		document.addEventListener("click", this.clickEvent);
	},

	stop : function() {
		document.removeEventListener("click", this.clickEvent);
		console.log("stop");
	},

	onSwitch() {
		console.log(NeatoLib.getSelectedTextChannel());
	}

}
				</div></pre>
			`, style : "color:white" }, { type : "p" }), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.DOM.createElement({ innerHTML : `
				Events and variables
				<pre><div style="background:#202225;display:block;padding:10px;margin-top:10px;border-radius:5px">
start() - Called when the script is loaded. Use this for initialization.

stop() - Called before the script is stopped. Use this for de-initialization.

onSwitch() - Called when switching servers and channels.

loader - This plugin object. Example usage: loader.reloadJs()
				</div></pre>
			`, style : "color:white" }, { type : "p" }), this.getName());

			NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createHint("Note: My library, 'NeatoLib', is included. You can use this for various things in your script. As of now, there are no docs for it, but you can enter 'NeatoLib' into the console (Ctrl/Cmd + Shift + I) to view all of its functions."), this.getName());
			
			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
		
	}

	saveSettings() {
		this.rewatch();
		NeatoLib.Settings.save(this);
	}

	onLibLoaded() {
		
		this.settings = NeatoLib.Settings.load(this, {
			displayUpdateNotes : true,
			filepath : ""
		});
		
		NeatoLib.Updates.check(this);
		
		//if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());
		
		NeatoLib.Events.onPluginLoaded(this);

		this.reloadJs();
		this.rewatch();

		NeatoLib.Events.attach("switch", this.switchEvent = () => {
			if(this.script && typeof this.script.onSwitch == "function") {
				try { this.script.onSwitch(); }
				catch(err) {
					console.error(err);
					NeatoLib.showToast("[Custom JS]: error in onSwitch(), check the console for more details.");
				}
			}
		});

	}

	rewatch() {

		const fs = require("fs");

		if(this.watcher) this.watcher.close();

		if(this.settings.filepath) this.watcher = fs.watch(this.settings.filepath, () => {
			const current = fs.readFileSync(this.settings.filepath, "utf-8");
			if(!current) return;
			if(this.last != current) this.reloadJs();
		});

	}

	reloadJs() {

		if(this.script && typeof this.script.stop == "function") this.script.stop();

		this.script = null;

		const fs = require("fs");

		if(!this.settings.filepath) return;
		else if(!fs.existsSync(this.settings.filepath)) return NeatoLib.showToast("[Custom JS]: file not found", "error");

		try {

			const js = this.script = eval(`(function(){${this.last = fs.readFileSync(this.settings.filepath, "utf-8")}})();`);
			js.loader = this;

			try { if(typeof js.start == "function") js.start(); }
			catch(err) {
				console.error(err);
				NeatoLib.showToast("[Custom JS]: error in start(), check the console for more details.");
			}

		} catch(err) {
			console.error(err);
			NeatoLib.showToast("[Custom JS]: error evaluating JS, " + err);
		}

	}
	
    stop() {

		if(this.script && typeof this.script.stop == "function") {
			try { this.script.stop(); }
			catch(err) {
				console.error(err);
				NeatoLib.showToast("[Custom JS]: error in stop(), check the console for more details.");
			}
		}

		if(this.watcher) this.watcher.close();

		NeatoLib.Events.detach("switch", this.switchEvent);

	}
	
}