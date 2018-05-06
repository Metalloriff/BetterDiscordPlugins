//META{"name":"VoiceChatNotifications"}*//

class VoiceChatNotifications {
	
	constructor() {
		
        this.defaultSettings = {
            logConnections : true,
            logMutes : true,
            logDeafens : true,
            displayWhileFocused : false,
            displayUpdateNotes : true
        };

	}
	
    getName() { return "Voice Chat Notifications"; }
    getDescription() { return "Displays notifications when users connect to/disconnect from voice channels, mute/unmute themselves and deafen/undeafen themselves (all optional) in the selected server."; }
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
    
    getSettingsPanel() {

        setTimeout(() => {

            var toggleGroup = document.createElement("div"), toggle = key => {
               this.settings[key] = !this.settings[key];
               this.saveSettings();
            };

            toggleGroup.style.padding = "20px";

            toggleGroup.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createToggleSwitch("Display connection/disconnection notifications", this.settings.logConnections, () => toggle("logConnections")));

            toggleGroup.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createToggleSwitch("Display mute/unmute notifications", this.settings.logMutes, () => toggle("logMutes")));

            toggleGroup.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createToggleSwitch("Display deafen/undeafen notifications", this.settings.logDeafens, () => toggle("logDeafens")));

            toggleGroup.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createToggleSwitch("Display notifications while Discord is focused", this.settings.displayWhileFocused, () => toggle("displayWhileFocused")));
            
            Metalloriff.Settings.pushElement(toggleGroup, this.getName());

            Metalloriff.Settings.pushChangelogElements(this);

        }, 0);

        return `${Metalloriff.Settings.Elements.pluginNameLabel(this.getName())}`;

    }

    saveSettings() { PluginUtilities.saveSettings("VoiceChatNotifications", this.settings); }
	
	initialize() {
        
        this.settings = PluginUtilities.loadSettings("VoiceChatNotifications", this.defaultSettings);

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/VoiceChatNotifications.plugin.js");

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

        this.classes = Metalloriff.getClasses(["wrapperDefaultVoice", "wrapperSelectedVoice"], false);

        this.localUser = PluginUtilities.getCurrentUser().id;

        this.voiceObserver = new MutationObserver(mutationEvent => {

            if(this.focused && this.settings.displayWhileFocused == false) return;

            var userElement = mutationEvent[0].addedNodes[0] || mutationEvent[0].removedNodes[0], added = mutationEvent[0].addedNodes.length > 0;

            if(userElement != undefined) {

                if(this.settings.logConnections && userElement.classList.contains("draggable-1KoBzC")) {

                    var props = ReactUtilities.getOwnerInstance(userElement).props, options = { silent : true, icon : props.user.getAvatarURL() };

                    if(props.user.id == this.localUser) return;

                    if(added) new Notification(`${props.user.username} joined ${props.channel.name}`, options);
                    else new Notification(`${props.user.username} left ${props.channel.name}`, options);

                    return;

                }
                
                var props = ReactUtilities.getOwnerInstance(mutationEvent[0].target).props, options = { silent : true, icon : props.user.getAvatarURL() };

                if(props.user.id == this.localUser) return;

                if(this.settings.logDeafens && userElement.classList.contains("margin-reset") && userElement.querySelector(".icon-29PTzq")) {

                    if(added) new Notification(`${props.user.username} deafened`, options);
                    else new Notification(`${props.user.username} undeafened`, options);

                } else if(this.settings.logMutes && userElement.classList.contains("margin-reset") && userElement.querySelector(".icon-3nr6O-")) {

                    if(added) new Notification(`${props.user.username} muted`, options);
                    else new Notification(`${props.user.username} unmuted`, options);

                }

            }

        });

        this.onSwitch();

        this.focused = true;

        $(window).on("focus.VCN", () => this.focused = true);
        $(window).on("blur.VCN", () => this.focused = false);

    }

    onSwitch() {

        if(Metalloriff == undefined || this.voiceObserver == undefined) {

            setTimeout(() => this.onSwitch(), 1000);

            return;

        }

        this.callUserProps = this.getCallProps();

        var voiceChannels = $(".wrapperDefaultVoice-1yvceo");
        voiceChannels.off("click.VCN");
        voiceChannels.on("click.VCN", () => setTimeout(() => this.attachObserver(), 100));

        this.attachObserver();

    }

    getCallProps() {

        var elements = document.getElementsByClassName("draggable-1KoBzC"), toReturn = new Object();

        for(let i = 0; i < elements.length; i++) {

            var props = ReactUtilities.getOwnerInstance(elements[i]).props;

            toReturn[props.user.id + props.channel.id] = props;

        }

        return toReturn;

    }
    
    attachObserver() {

        this.voiceObserver.disconnect();

        var calls = document.querySelectorAll(".listCollapse-3hmWwX, .listDefault-36Sktb");

        for(let i = 0; i < calls.length; i++) this.voiceObserver.observe(calls[i], { childList : true, subtree : true });

    }
	
    stop() {

        this.voiceObserver.disconnect();

        $(".wrapperDefaultVoice-1yvceo").off("click.VCN");

        $(window).off("focus.VCN");
        $(window).off("blur.VCN");

	}
	
}