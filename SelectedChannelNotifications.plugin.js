//META{"name":"SelectedChannelNotifications"}*//

class SelectedChannelNotifications {
	
	getSettingsPanel(){
		if(!$(".plugin-settings").length)
			setTimeout(e => { this.getSettingsPanel(e); }, 100);
		else
			this.createSettingsPanel();
	}

	createSettingsPanel(){
		var panel = $(".plugin-settings");
		if(panel.length){
			panel.append(`

                <style>
                .scn-ticked {
                    background-color: white;
                    height: 60%;
                    width: 60%;
                    border-radius: 3px;
                }
                </style>

				<h style="color: rgb(255, 255, 255); font-size: 30px; font-weight: bold;">Selected Channel Notifications by Metalloriff</h>
				<br><br>

				<p style="color: rgb(255, 255, 255); font-size: 20px;">Message notification sound:</p>
                <input id="scn-messageSound" value="` + this.settings.messageSound + `" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5">
                
                
                <div style="padding-top: 20px;">
                <div id="scn-checkbox-list" class="radioGroup-1GBvlr">

                <div data-key="playSound" class="item-26Dhrx marginBottom8-AtZOdT horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG cardPrimaryEditable-3KtE4g card-3Qj_Yx" style="padding: 10px;border-radius: 0px !important;">
                    <label class="checkboxWrapper-SkhIWG">
                        <input type="checkbox" class="inputDefault-3JxKJ2 input-3ITkQf" value="on">
                        <div class="checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs box-mmYMsp">
                        </div>
                    </label>
                    <div class="info-3LOr12">
                        <div class="title-3BE6m5">Play sound</div>
                    </div>
                </div>

                <div data-key="displayNotification" class="item-26Dhrx marginBottom8-AtZOdT horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG cardPrimaryEditable-3KtE4g card-3Qj_Yx" style="padding: 10px;border-radius: 0px !important;">
                    <label class="checkboxWrapper-SkhIWG">
                        <input type="checkbox" class="inputDefault-3JxKJ2 input-3ITkQf" value="on">
                        <div class="checkbox-1ix_J3 flexCenter-3_1bcw flex-1O1GKY justifyCenter-3D2jYp alignCenter-1dQNNs box-mmYMsp">
                        </div>
                    </label>
                    <div class="info-3LOr12">
                        <div class="title-3BE6m5">Display notification</div>
                    </div>
                </div>

                </div>
                </div>

				<div style="text-align: center;">
				<br>
				<button id="scn-reset-button" style="display: inline-block; margin-right: 25px;" type="button" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN">
					<div class="contents-4L4hQM">Reset Settings</div>
				</button>
				<button id="scn-save-button" style="display: inline-block; margin-left: 25px;" type="button" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN">
					<div class="contents-4L4hQM">Save Settings</div>
				</button>
                </div>
                
			`);
            var messageSound = document.getElementById("scn-messageSound"),
            playSound = document.getElementById("scn-playSound"),
            displayNotification = document.getElementById("scn-displayNotification");
            if(this.settings.playSound == true){ $(`[data-key="playSound"] > label > div`).append(`<div class="scn-ticked"></div>`); }
            if(this.settings.displayNotification == true){ $(`[data-key="displayNotification"] > label > div`).append(`<div class="scn-ticked"></div>`); }
            $("#scn-checkbox-list > div").on("click", e => {
                var key = $(e.currentTarget).data("key");
                this.settings[key] = !this.settings[key];
                $(e.currentTarget).find(".scn-ticked").remove();
                if(this.settings[key] == true){ $(`[data-key="` + key + `"] > label > div`).append(`<div class="scn-ticked"></div>`); }
            });
			$("#scn-reset-button").on("click", () => {
                this.settings = this.defaultSettings;
                $(".scn-ticked").remove();
                $("#scn-checkbox-list > div > label > div").append(`<div class="scn-ticked"></div>`);
                messageSound.value = "https://discordapp.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3";
			});
			$("#scn-save-button").on("click", () => {
                this.settings = {
                    messageSound : messageSound.value,
                    playSound : $(`[data-key="playSound"]`).find(".scn-ticked").length > 0,
                    displayNotification : $(`[data-key="displayNotification"]`).find(".scn-ticked").length > 0
                };
                this.saveSettings();
                PluginUtilities.showToast("Settings saved!", { type : "success" });
			});
		}else
			this.getSettingsPanel();
	}
	
	saveSettings(){
        PluginUtilities.saveSettings("SelectedChannelNotifications", this.settings);
        this.onSwitch();
	}
	
	constructor() {
        this.channelModule;
        this.notificationSettingsModule;
        this.volumeModule;
        this.currentGuild;
        this.currentChannel;
        this.messageObserver;
        this.defaultSettings = {
            messageSound : "https://discordapp.com/assets/dd920c06a01e5bb8b09678581e29d56f.mp3",
            playSound : true,
            displayNotification : true
        };
        this.settings;
        this.audio = new Audio();
        this.focused = true;
	}
	
    getName() { return "Selected Channel Notifications"; }
    getDescription() { return "Plays a sound and displays a notification (both optional) when Discord is minimized and a message is received in the selected channel."; }
    getVersion() { return "0.0.3"; }
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
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SelectedChannelNotifications.plugin.js");
        this.settings = PluginUtilities.loadSettings("SelectedChannelNotifications", this.defaultSettings);
        this.channelModule = DiscordModules.ChannelStore;
        this.notificationSettingsModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getChannelMessageNotifications"]);
        this.volumeModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getOutputVolume"]);
        $(window).on("focus.SelectedChannelNotifications", () => { this.focused = true; });
        $(window).on("blur.SelectedChannelNotifications", () => { this.focused = false; });
        this.onSwitch();
    }

    onSwitch(){
        this.currentGuild = PluginUtilities.getCurrentServer();
        var messageScroller = $(".messages.scroller"), selectedChannel = $(".wrapperSelectedText-3dSUjC");

        if(this.messageObserver != undefined){ this.messageObserver.disconnect(); }

        if(this.currentGuild == undefined || !messageScroller.length || !selectedChannel.length){ return; }

        this.currentChannel = ReactUtilities.getOwnerInstance(selectedChannel[0]).props.channel;

        if(this.currentChannel == undefined || this.notificationSettingsModule.getChannelMessageNotifications(this.currentGuild.id, this.currentChannel.id) == 0){ return; }

        this.audio.src = this.settings.messageSound;
        this.audio.volume = this.volumeModule.getOutputVolume() / 100;

        this.messageObserver = new MutationObserver(() => {
            if(!this.focused){
                var latestMessageGroupMessages = ReactUtilities.getOwnerInstance($(".message-group").last()[0]).props.messages,
                latestMessage = latestMessageGroupMessages[latestMessageGroupMessages.length - 1];
                if(latestMessage.author.id != PluginUtilities.getCurrentUser().id && latestMessage.mentioned == false){
                    if(this.settings.displayNotification == true){
                        var notif = new Notification((latestMessage.nick == undefined ? latestMessage.author.username : latestMessage.nick) + " - #" + this.currentChannel.name, { silent : true, body : latestMessage.content, icon : latestMessage.author.getAvatarURL() });
                    }
                    if(this.settings.playSound == true){ this.audio.play(); }
                }
            }
        });
        this.messageObserver.observe(messageScroller[0], { childList : true });
    }
	
    stop() {
        if(this.messageObserver != undefined){ this.messageObserver.disconnect(); }
        $(window).off("focus.SelectedChannelNotifications");
        $(window).off("blur.SelectedChannelNotifications");
    }
	
}
