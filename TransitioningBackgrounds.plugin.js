//META{"name":"TransitioningBackgrounds"}*//

class TransitioningBackgrounds {
	
	constructor() {
		this.defaultSettings = {
            images : new Array(),
            transitionMethod : "zoom-fade",
            changeDelay : 30,
            transitionTime : 3,
            randomize : false,
            onlyRunWhileFocused : false,
            forceTransparency : false
        }
        this.settings;
        this.loop;
        this.index;
        this.focused = true;
        this.removeTimeout;
	}
	
    getName() { return "Transitioning Backgrounds"; }
    getDescription() { return "Allows you to set a list of backgrounds that will be transitioned between with several transition types, in order, or at random."; }
    getVersion() { return "0.1.1"; }
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
			setTimeout(() => { this.getSettingsPanel(); }, 100);
		else
			this.createSettingsPanel();
	}
	
	createSettingsPanel(){
		var panel = $(".plugin-settings");
		if(panel.length){
            panel.append(`

                <style>
                .tb-ticked {
                    background-color: white;
                    height: 60%;
                    width: 60%;
                    border-radius: 3px;
                }
                </style>

                <div class="plugin-settings" id="plugin-settings-Transitioning Backgrounds">
                <h style="color: white;font-size: 30px;font-weight: bold;">Transitioning Backgrounds by Metalloriff</h>

                <div style="padding-top: 20px;">
                <h5 id="tb-images-label" class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4">Background images</h5>
                <div class="radioGroup-2P3MJo">
                <div id="tb-image-array">
                </div>
                <div style="text-align: center;">
                    <button id="tb-add-image-button" style="display: inline-block; margin-right: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
                        <div class="contents-4L4hQM">Add</div>
                    </button>
                    <button id="tb-clear-images-button" style="display: inline-block; margin-right: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
                        <div class="contents-4L4hQM">Clear</div>
                    </button>
                </div>
                </div>

                <div style="padding-top: 20px;">
                <h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4">Transition speed (seconds)</h5>
                </div><input id="tb-transition-time" value="` + this.settings.transitionTime + `" type="number" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">
                </div>

                <div style="padding-top: 20px;">
                <h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4">Time between transitions (seconds)</h5>
                </div><input id="tb-transition-delay" value="` + this.settings.changeDelay + `" type="number" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">
                </div>

                <div style="padding-top: 20px;">
                <h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4">Transition type</h5>
                <div id="tb-trans-method-group" class="radioGroup-2P3MJo">
                    <div data-method="fade" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Fade</div>
                        </div>
                    </div>
                    <div data-method="slide-left" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Slide left</div>
                        </div>
                    </div>
                    <div data-method="slide-right" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Slide right</div>
                        </div>
                    </div>
                    <div data-method="slide-up" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Slide up</div>
                        </div>
                    </div>
                    <div data-method="slide-down" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Slide down</div>
                        </div>
                    </div>
                    <div data-method="shrink" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Shrink</div>
                        </div>
                    </div>
                    <div data-method="rotate-x" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Rotate horizontally</div>
                        </div>
                    </div>
                    <div data-method="rotate-y" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Rotate vertically</div>
                        </div>
                    </div>
                    <div data-method="zoom-fade" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Zoom and fade</div>
                        </div>
                    </div>
                </div>
                </div>

                <div style="padding-top: 20px;">
                <h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4">Image selection type</h5>
                <div id="tb-selection-type" class="radioGroup-2P3MJo">
                    <div data-value="false" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">In order</div>
                        </div>
                    </div>
                    <div data-value="true" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                        <label class="checkboxWrapper-2Yvr_Y">
                            <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                            <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                            </div>
                        </label>
                        <div class="info-1Z508c">
                            <div class="title-1M-Ras">Randomized</div>
                        </div>
                    </div>
                </div>
                </div>

                <div style="padding-top: 20px;">
                <h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4">Other settings</h5>
                <div id="tb-other-settings" class="radioGroup-2P3MJo">
                <div data-key="onlyRunWhileFocused" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                    <label class="checkboxWrapper-2Yvr_Y">
                        <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                        <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                        </div>
                    </label>
                    <div class="info-1Z508c">
                        <div class="title-1M-Ras">Only run while Discord is focused</div>
                    </div>
                </div>
                <div data-key="forceTransparency" class="item-2zi_5J marginBottom8-1mABJ4 horizontal-2VE-Fw flex-3B1Tl4 directionRow-yNbSvJ cardPrimaryEditable-2IQ7-V card-3DrRmC tb-radiobutton" style="padding: 10px;border-radius: 0px !important;">
                    <label class="checkboxWrapper-2Yvr_Y">
                        <input type="checkbox" class="inputDefault-2tiBIA input-oWyROL" value="on">
                        <div class="checkbox-1QwaS4 flexCenter-28Hs0n flex-3B1Tl4 justifyCenter-29N31w alignCenter-3VxkQP box-XhjOl4">
                        </div>
                    </label>
                    <div class="info-1Z508c">
                        <div class="title-1M-Ras">Force transparency (may look bad. only use this if you have a theme with no background, or no theme.)</div>
                    </div>
                </div>
                </div>
                </div>
                </div>

                <h5 class="h5-3KssQU title-1pmpPr size12-1IGJl9 height16-1qXrGy weightSemiBold-T8sxWH defaultMarginh5-2UwwFY marginBottom8-1mABJ4" style="color: blueviolet;word-spacing: 5px;padding-top:30px;">Hint: you can edit the background element using the .transitioning-background class, and you can change the behaviour of each fade method with CSS as well.
                
                Search the inspector for "TransitioningBackgrounds" to see all available classes.</h5>
            `);

            var updateTransitionMethod = () => {
                $(".tb-radiobutton-ticked-transmethod").remove();
                $("[data-method='" + this.settings.transitionMethod + "'] > label > div").append(`<div class="tb-ticked tb-radiobutton-ticked-transmethod"></div>`);
            };
            updateTransitionMethod();
            $("#tb-trans-method-group > .tb-radiobutton").on("click", e => {
                this.settings.transitionMethod = $(e.currentTarget).data("method");
                updateTransitionMethod();
                this.saveSettings();
            });

            var updateSelectionType = () => {
                $(".tb-selection-type-ticked").remove();
                $("#tb-selection-type > div:nth-child(" + (this.settings.randomize ? 2 : 1) + ") > label > div").append(`<div class="tb-ticked tb-selection-type-ticked"></div>`);
            };
            updateSelectionType();
            $("#tb-selection-type > div").on("click", e => {
                this.settings.randomize = $(e.currentTarget).data("value");
                updateSelectionType();
                this.saveSettings();
            });

            var otherSettings = $("#tb-other-settings > div");
            var updateOtherSettings = () => {
                $(".tb-other-settings-ticked").remove();
                for(var i = 0; i < otherSettings.length; i++){
                    var key = $(otherSettings[i]).data("key");
                    if(this.settings[key])
                        $("[data-key='" + key + "'] > label > div").append(`<div class="tb-ticked tb-other-settings-ticked"></div>`);
                }
            };
            updateOtherSettings();
            $("#tb-other-settings > div").on("click", e => {
                this.settings[$(e.currentTarget).data("key")] = !this.settings[$(e.currentTarget).data("key")];
                updateOtherSettings();
                this.saveSettings();
            });

            var saveImages = () => {
                var inputs = $(".tb-image-array-item > input");
                this.settings.images = Array.from(inputs.toArray(), x => x.value);
                for(var i = 0; i < inputs.length; i++){ inputs[i].style.backgroundImage = "url('" + this.settings.images[i] + "')"; }
                this.saveSettings();
            };
            var updateImageList = () => {
                $(".tb-image-array-item").remove();
                for(var i = 0; i < this.settings.images.length; i++){
                    $("#tb-image-array").append(`

                        <div class="tb-image-array-item" style="padding-bottom: 10px;">
                            <input value="` + this.settings.images[i] + `" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY" style="display: inline-block;width: 500px;background-image: url('` + this.settings.images[i] + `');background-size: cover;">
                            <button id="tb-remove-image-button-` + i + `" style="display: inline-block;margin-right: 25px;float: right;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u">
                            <div class="contents-4L4hQM">Remove</div>
                            </button>
                        </div>

                    `);
                }
                $(".tb-image-array.item > input").off("focusout");
                $(".tb-image-array-item > button").off("click");
                $(".tb-image-array-item > input").on("focusout", () => { saveImages(); });
                $(".tb-image-array-item > button").on("click", e => {
                    $(e.currentTarget.parentElement).remove();
                    saveImages();
                });
            }
            updateImageList();
            $("#tb-clear-images-button").on("click", () => {
                $(".tb-image-array-item").remove();
                saveImages();
            });
            $("#tb-add-image-button").on("click", () => {
                this.settings.images.push("");
                updateImageList();
            });

            $("#tb-transition-time").on("focusout", () => {
                this.settings.transitionTime = document.getElementById("tb-transition-time").value;
                this.saveSettings();
            });

            $("#tb-transition-delay").on("focusout", () => {
                this.settings.changeDelay = document.getElementById("tb-transition-delay").value;
                this.saveSettings();
            });
		}else
			this.getSettingsPanel();
	}

    saveSettings(reload = true){
        PluginUtilities.saveSettings("TransitioningBackgrounds", this.settings);
        if(reload)
            this.apply();
    }
	
	initialize(){
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/TransitioningBackgrounds.plugin.js");
        this.settings = PluginUtilities.loadSettings("TransitioningBackgrounds", this.defaultSettings);
        $(window).on("focus.TransitioningBackgrounds", () => { this.focused = true; });
        $(window).on("blur.TransitioningBackgrounds", () => { this.focused = false; });
        $(document).on("contextmenu.TransitioningBackgrounds", e => { this.onContextMenu(e); })
        this.apply();
    }
    
    apply(){
        clearInterval(this.loop);
        clearTimeout(this.removeTimeout);
        $(".transitioning-background").remove();
        if(this.settings.images.length == 0){
            if(!$(".plugin-settings").length)
                PluginUtilities.showToast("You have no images added to your backgrounds list! Add some in the plugin settings.");
            return;
        }
        BdApi.clearCSS("TransitioningBackgrounds");
        BdApi.injectCSS("TransitioningBackgrounds", `

            .app { background: none !important; }

            .transitioning-background {
                background-size: cover;
                width: 100%;
                height: 100%;
                position: absolute;
                transition: all ` + this.settings.transitionTime + `s ease-in-out;
            }

            .tb-fade { opacity: 0; }
            .tb-slide-left { transform: translateX(-100%); }
            .tb-slide-right { transform: translateX(100%); }
            .tb-slide-up { transform: translateY(-100%); }
            .tb-slide-down { transform: translateY(100%); }
            .tb-shrink { transform: scale(0); }
            .tb-rotate-x { transform: rotateX(180deg); }
            .tb-rotate-y { transform: rotateY(180deg); }
            .tb-zoom-fade { transform: scale(5); opacity: 0; }

        `);
        BdApi.clearCSS("TransitioningBackgroundsTransparency");
        if(this.settings.forceTransparency){
            BdApi.injectCSS("TransitioningBackgroundsTransparency", `

                #app-mount, .layer-kosS71, .layers-20RVFW, .messages-wrapper, .container-2OU7Cz, .guilds-wrapper, .channels-3g2vYe, .chat, .chat > .content, .members-1bid1J, .container-RYiLUQ, .chat form, .title-qAcLxz, .layer-kosS71, .layers-20RVFW, .ui-standard-sidebar-view, .uploadArea-23on8q, .content-region, .sidebar-region, #friends, .friends-table, .headerBar-cxbhPD {
                    background: transparent !important;
                    background-color: transparent !important;
                }

            `);
        }
        this.index = 0;
        this.loop = setInterval(() => { this.updateBackground(); }, this.settings.changeDelay * 1000);
        this.updateBackground();
    }

    updateBackground(){
        if(this.settings.images.length == 0 || (this.settings.onlyRunWhileFocused && !this.focused))
            return;
        var app = $(".app").first(), existingBackgrounds = $(".transitioning-background"), nextIndex = this.index + 1 >= this.settings.images.length ? 0 : this.index + 1;
        if(this.settings.randomize)
            nextIndex = this.settings.images.length * Math.random() << 0;
        if(existingBackgrounds.length){
            existingBackgrounds[1].className += " tb-" + this.settings.transitionMethod;
            this.removeTimeout = setTimeout(() => {
                $(existingBackgrounds[1]).remove();
                app.prepend(`<div class="transitioning-background" style="background-image: url('` + this.settings.images[nextIndex] + `')"></div>`);
            }, this.settings.transitionTime * 1000);
        }else{
            app.prepend(`<div class="transitioning-background" style="background-image: url('` + this.settings.images[this.index] + `')"></div>`);
            app.prepend(`<div class="transitioning-background" style="background-image: url('` + this.settings.images[nextIndex] + `')"></div>`);
        }
        this.index = nextIndex;
    }

    onContextMenu(e){
        var image = undefined, contextMenu = $(".contextMenu-uoJTbz"), elementURL = undefined;
        if(e.target.localName == "a"){ elementURL = e.target.href; }
        if(e.target.localName == "img"){ elementURL = e.target.src; }
        if(elementURL.lastIndexOf("?") != -1){ elementURL = elementURL.substring(0, elementURL.lastIndexOf("?")); }
        if(elementURL != undefined && (elementURL.endsWith(".jpg") || elementURL.endsWith(".png") || elementURL.endsWith(".gif") || elementURL.endsWith(".jpeg"))){
            image = elementURL;
        }
        $("#tb-contextmenu-addremove").remove();
        if(image != undefined && contextMenu.length){
            if(this.settings.images.includes(image)){
                contextMenu.prepend(`<div id="tb-contextmenu-addremove" class="itemGroup-oViAgA"><div class="item-1XYaYf"><span>Remove Background</span></div></div>`);
                $("#tb-contextmenu-addremove").on("click", () => {
                    this.settings.images.splice(this.settings.images.indexOf(image), 1);
                    this.saveSettings(false);
                    PluginUtilities.showToast("Image removed from background list!", { type : "success" });
                    this.onContextMenu(e);
                });
            }else{
                contextMenu.prepend(`<div id="tb-contextmenu-addremove" class="itemGroup-oViAgA"><div class="item-1XYaYf"><span>Add As Background</span></div></div>`);
                $("#tb-contextmenu-addremove").on("click", () => {
                    this.settings.images.push(image);
                    this.saveSettings(false);
                    PluginUtilities.showToast("Image added to background list!", { type : "success" });
                    this.onContextMenu(e);
                });
            }
        }
    }
	
    stop() {
        clearInterval(this.loop);
        clearTimeout(this.removeTimeout);
        $(window).off("focus.TransitioningBackgrounds");
        $(window).off("blur.TransitioningBackgrounds");
        $(document).off("contextmenu.TransitioningBackgrounds");
        BdApi.clearCSS("TransitioningBackgroundsTransparency");
        BdApi.clearCSS("TransitioningBackgrounds");
    }
	
}
