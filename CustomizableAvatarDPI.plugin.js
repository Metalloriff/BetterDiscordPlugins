//META{"name":"CustomizableAvatarDPI"}*//

class CustomizableAvatarDPI {
	
	constructor() {
        this.initialized = false;
		this.defaultSettings = {
            popoutAvatarSize : 1024,
            largeAvatarSize : 128,
            smallAvatarSize : 128
        };
        this.settings;
	}
	
    getName() { return "Customizable Avatar DPI"; }
    getDescription() { return "Allows you to change the DPI of user avatars, to reduce bluriness with themes that increase the size of them."; }
    getVersion() { return "0.0.4"; }
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
                    .cadpi-label { padding-top: 30px; }
                    .cadpi-label-label {
                        color: white;
                        font-size: 20px;
                        display: inline;
                    }
                    .cadpi-hint {
                        opacity: 0.5;
                        display: none;
                    }
                    .cadpi-label:hover > .cadpi-hint { display: inline !important; }
                </style>

				<h style="color: rgb(255, 255, 255); font-size: 30px; font-weight: bold;">Customizable Avatar DPI by Metalloriff</h>
				<br><br>
            
                <div class="cadpi-label">
                <p class="cadpi-label-label">Small avatar size:</p>
                <p class="cadpi-label-label cadpi-hint">Member list, DM list, etc.</p>
                </div>

				<input id="cadpi-small" value="` + this.settings.smallAvatarSize + `" type="number" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5">

                <div class="cadpi-label">
				    <p class="cadpi-label-label">Large avatar size:</p>
                    <p class="cadpi-label-label cadpi-hint">Chat avatars.</p>
                </div>

				<input id="cadpi-large" value="` + this.settings.largeAvatarSize + `" type="number" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5">

                <div class="cadpi-label">
				    <p class="cadpi-label-label">Popout avatar size:</p>
                    <p class="cadpi-label-label cadpi-hint">User popouts, user profiles.</p>
                </div>

				<input id="cadpi-popout" value="` + this.settings.popoutAvatarSize + `" type="number" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5">

				<div style="text-align: center;">
				<br>
				<button id="cadpi-reset-button" style="display: inline-block; margin-right: 25px;" type="button" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN">
					<div class="contents-4L4hQM">Reset</div>
				</button>
				<button id="cadpi-save-button" style="display: inline-block; margin-left: 25px;" type="button" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN">
					<div class="contents-4L4hQM">Save</div>
				</button>
				</div>
			`);
			$("#cadpi-reset-button").on("click", () => {
                this.settings = this.defaultSettings;
                $("#cadpi-small")[0].value = "128";
                $("#cadpi-large")[0].value = "128";
                $("#cadpi-popout")[0].value = "1024";
			});
			$("#cadpi-save-button").on("click", () => {
                this.settings = {
                    smallAvatarSize : $("#cadpi-small")[0].value,
                    largeAvatarSize : $("#cadpi-large")[0].value,
                    popoutAvatarSize : $("#cadpi-popout")[0].value
                }
                PluginUtilities.saveSettings("CustomizableAvatarDPI", this.settings);
			});
		}else
			this.getSettingsPanel();
	}
	
	initialize(){
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/CustomizableAvatarDPI.plugin.js");
        this.settings = PluginUtilities.loadSettings("CustomizableAvatarDPI", this.defaultSettings);
        this.initialized = true;
	}

    observer(e) {
        if(!this.initialized)
            return;
        var nodes = $(e.addedNodes),
            largeAvatars = nodes.find(".avatar-large"),
            popoutAvatars = nodes.find(".image-33JSyf.maskProfile-MeBve8.mask-2vyqAW"),
            smallAvatars = nodes.find(".avatar-small:not(a), .avatar-1BXaQj.small-TEeAkX > .mask-2vyqAW, .avatarContainer-303pFz.margin-reset > div");
        largeAvatars.each(i => 
            largeAvatars[i].style.backgroundImage = largeAvatars[i].style.backgroundImage.substring(0, largeAvatars[i].style.backgroundImage.indexOf("?size=")) + "?size=" + this.settings.largeAvatarSize
        );
        popoutAvatars.each(i => 
            popoutAvatars[i].style.backgroundImage = popoutAvatars[i].style.backgroundImage.substring(0, popoutAvatars[i].style.backgroundImage.indexOf("?size=")) + "?size=" + this.settings.popoutAvatarSize
        );
        smallAvatars.each(i => 
            smallAvatars[i].style.backgroundImage = smallAvatars[i].style.backgroundImage.substring(0, smallAvatars[i].style.backgroundImage.indexOf("?size=")) + "?size=" + this.settings.smallAvatarSize
        );
    }
	
    stop() {}
	
}
