//META{"name":"BDEmoteAutocomplete","website":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/README.md","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/BDEmoteAutocomplete.plugin.js"}*//

class BDEmoteAutocomplete {
	
    getName() { return "BDEmoteAutocomplete"; }
    getDescription() { return "Adds an auto-complete menu for BetterDiscord emotes."; }
    getVersion() { return "1.0.4"; }
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

	getSettingsPanel() {

		setTimeout(() => {

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleSwitch("Case-sensitive", this.settings.caseSensitive, () => {
                this.settings.caseSensitive = !this.settings.caseSensitive;
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("bdea-enabled-channels", "Enabled emote channels", [
                { title : "TwitchGlobal", value : "TwitchGlobal", setValue : this.settings.enabledChannels.includes("TwitchGlobal") },
                { title : "TwitchSubscriber", value : "TwitchSubscriber", setValue : this.settings.enabledChannels.includes("TwitchSubscriber") },
                { title : "BTTV", value : "BTTV", setValue : this.settings.enabledChannels.includes("BTTV") },
                { title : "FrankerFaceZ", value : "FrankerFaceZ", setValue : this.settings.enabledChannels.includes("FrankerFaceZ") },
                { title : "BTTV2", value : "BTTV2", setValue : this.settings.enabledChannels.includes("BTTV2") }
            ], choice => {
                if(this.settings.enabledChannels.includes(choice.value)) this.settings.enabledChannels.splice(this.settings.enabledChannels.indexOf(choice.value, 1));
                else this.settings.enabledChannels.push(choice.value);
                this.saveSettings();
                this.getEmotes();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createTextField("Prefix to display autocomplete", "text", this.settings.prefix, e => {
                this.settings.prefix = e.target.value;
                this.saveSettings();
            }, { tooltip : "If you set this, it will be required before an emote to display the auto-complete menu." }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createTextField("Auto-complete emote size", "number", this.settings.size, e => {
                this.settings.size = e.target.value;
                this.saveSettings();
            }, { tooltip : "The size in pixels to display the auto-complete emotes." }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createTextField("Auto-complete results limit", "number", this.settings.resultsCap, e => {
                this.settings.resultsCap = e.target.value;
                this.saveSettings();
            }, { tooltip : "Maximum amount of results to display. The higher this is, the slower larger results will be." }), this.getName());
            
            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createTextField("Auto-complete display delay (ms)", "number", this.settings.autocompleteDelay, e => {
                this.settings.autocompleteDelay = e.target.value;
                this.saveSettings();
            }, { tooltip : "Delay in millseconds to display the auto-complete menu after pressing a key." }), this.getName());

            NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
		
	}

	saveSettings() {
		NeatoLib.Settings.save(this);	
	}
    
    updateSelected() {

        let items = document.getElementById("bdea-autocomplete-list").getElementsByClassName("selector-2IcQBU selectable-3dP3y-");

        for(let i = 0; i < items.length; i++) {
            if(i == this.selectedIDX) items[i].classList.add("selectorSelected-1_M1WV");
            else items[i].classList.remove("selectorSelected-1_M1WV");
        }

    }

	onLibLoaded() {
        
        NeatoLib.Updates.check(this);
		
		this.settings = NeatoLib.Settings.load(this, {
            displayUpdateNotes : true,
            enabledChannels : ["TwitchGlobal", "TwitchSubscriber", "BTTV", "FrankerFaceZ", "BTTV2"],
            prefix : "",
            size : 16,
            caseSensitive : true,
            resultsCap : 15,
            autocompleteDelay : 750
        });
		
		//if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

        this.selectedIDX = 0;
        this.results = [];

        this.onGlobalKey = e => {
            if(e.key == "Tab") {
                let list = document.getElementById("bdea-autocomplete-list");
                if(list) list.getElementsByClassName("autocompleteRowVertical-q1K4ky autocompleteRow-2OthDa")[this.selectedIDX].click();
            }
        };

        this.onChatInput = (e, fromTimeout) => {

            if(this.inputTimeout) clearTimeout(this.inputTimeout);

            if(e.key.includes("Arrow")) {
                if(e.key.includes("Up") && this.selectedIDX > 0) this.selectedIDX--;
                else if(e.key.includes("Down") && this.selectedIDX < this.results.length - 1) this.selectedIDX++;
                else return;
                this.updateSelected();
                return;
            }

            let chatbox = e.target, autocomplete = document.getElementById("bdea-autocomplete"), words = chatbox.value.split(" "), lastWord = words[words.length - 1];

            if(!lastWord || lastWord.length < 4 || (this.settings.prefix && !lastWord.startsWith(this.settings.prefix))) {
                if(autocomplete) autocomplete.outerHTML = "";
                return;
            }

            if(this.settings.autocompleteDelay && !fromTimeout) {
                this.inputTimeout = setTimeout(() => {
                    this.onChatInput(e, true);
                }, this.settings.autocompleteDelay);
                return;
            }

            if(this.settings.prefix) lastWord = lastWord.substring(this.settings.prefix.length, lastWord.length);

            let emotes = [];

            let lim = 0;
            for(let i = 0; i < this.emotes.length; i++) {

                if(lim >= this.settings.resultsCap) break;
                
                if((this.settings.caseSensitive && !this.emotes[i].name.startsWith(lastWord)) || (!this.settings.caseSensitive && !this.emotes[i].name.toLowerCase().startsWith(lastWord.toLowerCase()))) continue;

                emotes.push(this.emotes[i]);

                lim++;

            }

            this.results = emotes;

            if(emotes.length == 0) {
                if(autocomplete) autocomplete.outerHTML = "";
                return;
            }

            if(!autocomplete) {

                chatbox.parentElement.insertAdjacentHTML("beforeend", `
                    <div id="bdea-autocomplete" class="autocomplete-1vrmpx autocomplete-i9yVHs">
                        <div class="autocompleteInner-zh20B_">
                            <div class="autocompleteRowVertical-q1K4ky autocompleteRow-2OthDa">
                                <div class="selector-2IcQBU">
                                    <div class="contentTitle-2tG_sM small-29zrCQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi">Emotes matching <strong>${lastWord}</strong></div>
                                </div>
                            </div>
                            <div id="bdea-autocomplete-list">

                            </div>
                        </div>
                    </div>
                `);

                autocomplete = document.getElementById("bdea-autocomplete");

            }

            this.selectedIDX = 0;

            let list = document.getElementById("bdea-autocomplete-list");

            list.innerHTML = "";

            for(let i = 0; i < emotes.length; i++) {

                list.insertAdjacentHTML("beforeend", `
                    <div class="autocompleteRowVertical-q1K4ky autocompleteRow-2OthDa">
                        <div class="selector-2IcQBU selectable-3dP3y-">
                            <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 content-Qb0rXO" style="flex: 1 1 auto;"><img style="width:${this.settings.size}px;height:${this.settings.size}px;" src="${emotes[i].url}">
                                <div class="marginLeft8-1YseBe">${emotes[i].name}</div>
                                <div style="margin-left:auto;opacity:0.5;">${emotes[i].channel}</div>
                            </div>
                        </div>
                    </div>
                `);

                let items = document.getElementsByClassName("autocompleteRowVertical-q1K4ky autocompleteRow-2OthDa");

                items[items.length - 1].addEventListener("click", e => {
                    words[words.length - 1] = emotes[this.selectedIDX].name + " ";
                    NeatoLib.Chatbox.setText(words.join(" "));
                    autocomplete.outerHTML = "";
                });

                items[items.length - 1].addEventListener("mouseover", e => {
                    this.selectedIDX = i;
                    this.updateSelected();
                });

            }

            this.updateSelected();

        };

        this.getEmotes();

        this.initialized = true;

        document.addEventListener("keydown", this.onGlobalKey);
        
        NeatoLib.Events.onPluginLoaded(this);

		this.switch();

		this.switchEvent = () => this.switch();

        NeatoLib.Events.attach("switch", this.switchEvent);

	}

    switch() {

        if(this.initialized != true) return;

        if(this.emotes.length == 0) this.getEmotes();

        let chatbox = NeatoLib.Chatbox.get();

        if(chatbox) chatbox.addEventListener("keyup", this.onChatInput);

    }

    getEmotes() {

        let emoteChannels = this.settings.enabledChannels, pushed = {};

        this.emotes = [];

        let blacklisted = {};

        for(let i = 0; i < window.bemotes.length; i++) blacklisted[window.bemotes[i]] = true;

		for(let ec of emoteChannels) {
			let emoteChannel = window.bdEmotes[ec];
			for(let emote in emoteChannel) {
				if(emote.length > 2 && !pushed[emote] && !blacklisted[emote]) {
                    this.emotes.push({ name : emote, url : emoteChannel[emote], channel : ec });
                    pushed[emote] = true;
                }
			}
        }

        this.emotes.sort((a, b) => a.name.length - b.name.length);

    }
	
    stop() {

        let chatbox = NeatoLib.Chatbox.get();

        if(chatbox) chatbox.removeEventListener("keyup", this.onChatInput);

        document.removeEventListener("keydown", this.onGlobalKey);

        if(this.inputTimeout) clearTimeout(this.inputTimeout);

        NeatoLib.Events.detach("switch", this.switchEvent);

	}
	
}
