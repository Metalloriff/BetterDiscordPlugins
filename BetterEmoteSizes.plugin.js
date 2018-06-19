//META{"name":"BetterEmoteSizes"}*//

class BetterEmoteSizes {
	
    getName() { return "Emote Zoom"; }
    getDescription() { return "Increases the size of emojis, emotes, and reactions upon hovering over them and allows you to change their default sizes."; }
    getVersion() { return "2.3.10"; }
    getAuthor() { return "Metalloriff"; }
	
	getSettingsPanel(){

		setTimeout(() => {

			NeatoLib.Settings.pushElements([

				NeatoLib.Settings.Elements.createToggleSwitch("Affect small emojis", this.settings.alterSmall, () => {
					this.settings.alterSmall = !this.settings.alterSmall;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Default small emoji size (px)", this.settings.smallSize, e => {
					this.settings.smallSize = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createToggleSwitch("Affect large emojis", this.settings.alterLarge, () => {
					this.settings.alterLarge = !this.settings.alterLarge;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Default large emoji size (px)", this.settings.largeSize, e => {
					this.settings.largeSize = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createToggleSwitch("Affect BetterDiscord emotes", this.settings.alterBD, () => {
					this.settings.alterBD = !this.settings.alterBD;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Default BetterDiscord emote size (px)", this.settings.bdSize, e => {
					this.settings.bdSize = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createToggleSwitch("Affect reactions", this.settings.alterReactions, () => {
					this.settings.alterReactions = !this.settings.alterReactions;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Default reaction size (px)", this.settings.reactionSize, e => {
					this.settings.reactionSize = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Emoji and BD emote hover size mulitplier", this.settings.hoverSize, e => {
					this.settings.hoverSize = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("reaction hover size mulitplier", this.settings.reactionHoverSize, e => {
					this.settings.reactionHoverSize = e.target.value;
					this.saveSettings();
				}),

				NeatoLib.Settings.Elements.createNewTextField("Transition time (seconds)", this.settings.transitionSpeed, e => {
					this.settings.transitionSpeed = e.target.value;
					this.saveSettings();
				}),

			], this.getName());
			
			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());

	}
	
	saveSettings(){
		NeatoLib.Settings.save(this);
		this.update();
	}

    load() {}

    start() {

        let libLoadedEvent = () => {
            try{ this.onLibLoaded(); }
            catch(err) { console.error(this.getName(), "fatal error, plugin could not be started!", err); try { this.stop(); } catch(err) { console.error(this.getName() + ".stop()", err); } }
        };

		let lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js?forceNew=" + performance.now());
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
        else lib.addEventListener("load", libLoadedEvent);

	}
	
	onLibLoaded() {

		this.settings = NeatoLib.Settings.load(this, {
			displayUpdateNotes : true,
			alterSmall : true,
			smallSize : 22,
			alterLarge : true,
			largeSize : 32,
			alterBD : true,
			bdSize : 28,
			alterReactions : true,
			reactionSize : 16,
			hoverSize : 3,
			transitionSpeed : 0.5,
			reactionHoverSize : 2
		});

		NeatoLib.Updates.check(this);

		this.update();

		NeatoLib.Events.onPluginLoaded(this);
		
	}
	
	update(){

		if(this.style) this.style.destroy();
		this.style = NeatoLib.injectCSS(".message-group.hide-overflow { overflow: visible; }");
		
		if(this.settings.alterSmall) {
			this.style.append(`
				#app-mount .markup > .emoji:not(.jumboable) {
					width: ${this.settings.smallSize}px;
					height: ${this.settings.smallSize}px;
					transform: scale(1);
					transition: transform ${this.settings.transitionSpeed}s;
				}
				#app-mount .markup > .emoji:not(.jumboable):hover {
					transform: scale(${this.settings.hoverSize});
					position: relative;
					z-index: 1;
				}
				#app-mount .comment:last-child .markup .emoji:not(.jumboable):hover {
					transform: scale(${this.settings.hoverSize}) translateY(-35%);
				}
			`);
		}

		if(this.settings.alterLarge) {
			this.style.append(`
				#app-mount .markup > .emoji.jumboable {
					width: ${this.settings.largeSize}px;
					height: ${this.settings.largeSize}px;
					transform: scale(1);
					transition: transform ${this.settings.transitionSpeed}s;
				}
				#app-mount .markup > .emoji.jumboable:hover {
					transform: scale(${this.settings.hoverSize});
					position: relative;
					z-index: 1;
				}
				#app-mount .comment:last-child .markup .emoji.jumboable:hover {
					transform: scale(${this.settings.hoverSize}) translateY(-35%);
				}
			`);
		}

		if(this.settings.alterBD) {
			this.style.append(`
				#app-mount .emote {
					width: ${this.settings.bdSize}px;
					height: ${this.settings.bdSize}px;
					max-height: ${this.settings.bdSize}px !important;
					transform: scale(1);
					transition: transform ${this.settings.transitionSpeed}s;
				}
				#app-mount .emote:not(.emoteshake):not(.emoteshake2):not(.emoteshake3):hover {
					transform: scale(${this.settings.hoverSize});
					position: relative;
					z-index: 1;
				}
				#app-mount .comment:last-child .emote:not(.emoteshake):not(.emoteshake2):not(.emoteshake3):hover {
					transform: scale(${this.settings.hoverSize}) translateY(-35%);
				}
			`);
		}

		if(this.settings.alterReactions) {
			this.style.append(`
				#app-mount .reaction .emoji, .reaction.reaction-me .emoji {
					width: ${this.settings.reactionSize}px;
					height: ${this.settings.reactionSize}px;
				}
				#app-mount .reaction {
					transition: transform ${this.settings.transitionSpeed}s;
				}
				#app-mount .reaction:hover {
					transform: scale(${this.settings.reactionHoverSize});
					z-index: 1000;
				}
			`);
		}

	}
	
    stop(){
		if(this.style) this.style.destroy();
	}
	
}
