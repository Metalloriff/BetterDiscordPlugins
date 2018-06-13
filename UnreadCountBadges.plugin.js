//META{"name":"UnreadCountBadges"}*//

class UnreadCountBadges {
	
    getName() { return "UnreadCountBadges"; }
    getDescription() { return "Adds an unread count badge on unread servers and channels."; }
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

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createToggleGroup("ucb-toggles", "Toggles", [
                { title : "Ignored muted servers", value : "ignoreMutedGuilds", setValue : this.settings.ignoreMutedGuilds }
            ], choice => {
                this.settings[choice.value] = !this.settings[choice.value];
                this.applySettings();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Badge color", this.settings.badgeColor, e => {
                this.settings.badgeColor = e.target.value;
                this.applySettings();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushHTML(`
            <div style="margin-top: 10px;">
                <div class="containerDefault-1ZnADq ucb-ex" style="width: 45%; display: inline-block;">
                    <div class="wrapperUnreadText-2zuiuD wrapper-KpKNwI">
                        <div class="unread-1Dp-OI"></div>
                        <div class="contentUnreadText-2vNnZc content-20Aix8">
                            <div class="marginReset-3RfdVe" style="flex: 0 0 auto;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="colorUnreadText-2t7XRb icon-sxakjD"><path class="foreground-2W-aJk" fill="currentColor" d="M2.27333333,12 L2.74666667,9.33333333 L0.08,9.33333333 L0.313333333,8 L2.98,8 L3.68666667,4 L1.02,4 L1.25333333,2.66666667 L3.92,2.66666667 L4.39333333,0 L5.72666667,0 L5.25333333,2.66666667 L9.25333333,2.66666667 L9.72666667,0 L11.06,0 L10.5866667,2.66666667 L13.2533333,2.66666667 L13.02,4 L10.3533333,4 L9.64666667,8 L12.3133333,8 L12.08,9.33333333 L9.41333333,9.33333333 L8.94,12 L7.60666667,12 L8.08,9.33333333 L4.08,9.33333333 L3.60666667,12 L2.27333333,12 L2.27333333,12 Z M5.02,4 L4.31333333,8 L8.31333333,8 L9.02,4 L5.02,4 L5.02,4 Z" transform="translate(1.333 2)"></path></svg></div>
                            <div class="nameUnreadText-DfkrI4 name-3M0b8v overflowEllipsis-jeThUf" style="flex: 1 1 auto;">example-channel</div>
                            <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 marginReset-3RfdVe" style="flex: 0 1 auto;">
                                <div class="iconSpacing-3JkGQO">
                                    <div class="wrapper-232cHJ unread-count-channel-badge">5</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="containerDefault-1ZnADq ucb-ex" style="width: 45%; display: inline-block; float:right;">
                    <div class="wrapperMutedText-1YBpvv wrapper-KpKNwI">
                        <div class="contentMutedText-2y6aPQ content-20Aix8">
                            <div class="marginReset-3RfdVe" style="flex: 0 0 auto;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" class="colorMutedText-36M8WR icon-sxakjD"><path class="foreground-2W-aJk" fill="currentColor" d="M2.27333333,12 L2.74666667,9.33333333 L0.08,9.33333333 L0.313333333,8 L2.98,8 L3.68666667,4 L1.02,4 L1.25333333,2.66666667 L3.92,2.66666667 L4.39333333,0 L5.72666667,0 L5.25333333,2.66666667 L9.25333333,2.66666667 L9.72666667,0 L11.06,0 L10.5866667,2.66666667 L13.2533333,2.66666667 L13.02,4 L10.3533333,4 L9.64666667,8 L12.3133333,8 L12.08,9.33333333 L9.41333333,9.33333333 L8.94,12 L7.60666667,12 L8.08,9.33333333 L4.08,9.33333333 L3.60666667,12 L2.27333333,12 L2.27333333,12 Z M5.02,4 L4.31333333,8 L8.31333333,8 L9.02,4 L5.02,4 L5.02,4 Z" transform="translate(1.333 2)"></path></svg></div>
                            <div class="nameMutedText-3Vj4bM name-3M0b8v overflowEllipsis-jeThUf" style="flex: 1 1 auto;">muted-example-channel</div>
                        <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 marginReset-3RfdVe" style="flex: 0 1 auto;">
                            <div class="iconSpacing-3JkGQO">
                                <div class="wrapper-232cHJ unread-count-channel-badge">69</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </div>`, this.getName());

            for(let example of document.getElementsByClassName("containerDefault-1ZnADq ucb-ex")) {

                let wrapper = example.getElementsByClassName("wrapper-KpKNwI")[0],
                content = example.getElementsByClassName("content-20Aix8")[0],
                text = example.getElementsByClassName("overflowEllipsis-jeThUf")[0];

                wrapper.originalClassName = wrapper.className;
                content.originalClassName = content.className;
                text.originalClassName = text.className;

                example.addEventListener("mouseenter", () => {
                    wrapper.className = "wrapperHoveredText-2geN_M wrapper-KpKNwI";
                    content.className = "contentHoveredText-2D9B-x content-20Aix8";
                    text.className = "nameHoveredText-1uO31y name-3M0b8v overflowEllipsis-jeThUf";
                });

                example.addEventListener("mouseleave", () => {
                    wrapper.className = wrapper.originalClassName;
                    content.className = content.originalClassName;
                    text.className = text.originalClassName;
                });

            }

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Muted channel badge opacity", this.settings.mutedChannelBadgeOpacity, e => {
                this.settings.mutedChannelBadgeOpacity = e.target.value;
                this.applySettings();
                this.saveSettings();
            }, { type : "number" }), this.getName());
			
			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());
		
	}

	saveSettings() {
		NeatoLib.Settings.save(this);
	}

	onLibLoaded() {
		
		this.settings = NeatoLib.Settings.load(this, {
            displayUpdateNotes : true,
            badgeColor : "#7289da",
            mutedChannelBadgeOpacity : 0.3,
            ignoreMutedGuilds : true
		});
		
		NeatoLib.Updates.check(this);
		
        //if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());
        
        this.guildModule = NeatoLib.Modules.get(["getGuild", "getGuilds"]);
        this.unreadModule = NeatoLib.Modules.get("getUnreadCount");
        this.channelModule = NeatoLib.Modules.get(["getChannel", "getChannels"]);
        this.muteModule = NeatoLib.Modules.get("isMuted");
        this.scrollModule = NeatoLib.Modules.get("isAtBottom");

        this.badges = {};
        this.channelBadges = {};

        this.applySettings();

        this.switchEvent = () => {

            for(let cid in this.channelBadges) {
                this.channelBadges[cid].remove();
                delete this.channelBadges[cid];
            }

            this.updateBadges();

            let scroller = document.getElementsByClassName("messages scroller")[0], guild = NeatoLib.getSelectedServer();
            if(scroller && guild) scroller.addEventListener("scroll", () => {
                if(this.scrollModule.isAtBottom(guild.id)) {
                    this.updateBadges(guild.id);
                }
            });

        };

        NeatoLib.Events.attach("switch", this.switchEvent);

        NeatoLib.patchInternalFunction("handleMessage", data => {
            if(data.type == "MESSAGE_CREATE" && data.message) {
                this.updateBadges(data.message.guild_id);
            }
        }, this.getName());
		
		NeatoLib.Events.onPluginLoaded(this);

        this.updateBadges();

    }
    
    applySettings() {
        
        if(this.styles) this.styles.destroy();

        this.styles = NeatoLib.injectCSS(`
            .guilds-wrapper .guilds .guild .unread-count-badge {
                bottom: 35px;
                background-color: ${this.settings.badgeColor};
            }
            #app-mount .flex-1xMQg5 .iconSpacing-3JkGQO .unread-count-channel-badge {
                background-color: ${this.settings.badgeColor};
            }
            .wrapperMutedText-1YBpvv .unread-count-channel-badge {
                opacity: ${this.settings.mutedChannelBadgeOpacity};
            }
        `);

    }

    updateBadges(guild) {

        let guilds = !guild ? this.guildModule.getGuilds() : undefined, selectedGuild = NeatoLib.getSelectedServer();

        let updateUnreadFor = id => {
            
            let unreadCount = this.getGuildUnreadCounts(id);

            if(selectedGuild && selectedGuild.id == id) {

                let channels = document.getElementsByClassName("wrapper-KpKNwI");

                for(let i = 0; i < channels.length; i++) {

                    let props = NeatoLib.ReactData.getProps(channels[i]);

                    if(!props) continue;

                    let channelUnreadCount = this.unreadModule.getUnreadCount(props.channel.id);

                    if(channelUnreadCount > 0) {

                        if(this.channelBadges[props.channel.id]) this.channelBadges[props.channel.id].firstChild.innerText = channelUnreadCount;
                        else this.channelBadges[props.channel.id] = channels[i].getElementsByClassName("flex-1xMQg5")[0].appendChild(this.createChannelBadge(channelUnreadCount));

                    } else if(this.channelBadges[props.channel.id]) {

                        this.channelBadges[props.channel.id].remove();
                        delete this.channelBadges[props.channel.id];
                        
                    }

                }

            }

            if(unreadCount > 0) {

                if(this.badges[id] != undefined) this.badges[id].innerText = unreadCount;
                else this.badges[id] = document.querySelector("[style*='" + id + "']").parentElement.appendChild(this.createBadge(unreadCount));

            } else if(this.badges[id]) {

                this.badges[id].remove();
                delete this.badges[id];

                for(let cid in this.channelBadges) {
                    this.channelBadges[cid].remove();
                    delete this.channelBadges[cid];
                }

            }

        };

        if(guild) return updateUnreadFor(guild);

        for(let id in guilds) updateUnreadFor(id);

    }

    getGuildUnreadCounts(guildId) {

        let channels = this.channelModule.getChannels();

        let unread = 0;

        for(let id in channels) {
            if(this.muteModule.isGuildOrCategoryOrChannelMuted(guildId, id) && this.settings.ignoreMutedGuilds) continue;
            if(channels[id].guild_id == guildId) {
                unread += this.unreadModule.getUnreadCount(id);
            }
        }

        return unread;

    }

    createBadge(unreadCount) {

        let badge = document.createElement("div");

        badge.classList.add("badge", "unread-count-badge");
        badge.innerText = unreadCount;

        return badge;

    }

    createChannelBadge(unreadCount) {

        let badge = document.createElement("div");

        badge.classList.add("iconSpacing-3JkGQO");

        badge.innerHTML = `<div class="wrapper-232cHJ unread-count-channel-badge">${unreadCount}</div>`;

        return badge;

    }
	
    stop() {

        let css = document.getElementById("uc-css");
        if(css) css.remove();

        NeatoLib.Events.detach("switch", this.switchEvent);

        this.styles.destroy();

        for(let id in this.badges) this.badges[id].remove();
        for(let id in this.channelBadges) this.channelBadges[id].remove();

        NeatoLib.unpatchInternalFunction("handleMessage", this.getName());

	}
	
}