//META{"name":"TransitioningBackgrounds","website":"https://metalloriff.github.io/toms-discord-stuff/","source":"https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TransitioningBackgrounds.plugin.js"}*//

class TransitioningBackgrounds {
	
    getName() { return "TransitioningBackgrounds"; }
    getDescription() { return "Allows you to set a list of backgrounds that will be transitioned between with several transition animations, in order, or at random."; }
    getVersion() { return "1.1.3"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
            "1.1.3": `
                Entirely rewrote the plugin. Should be more stable, smoother, and most importantly, actually works at all.
            `
		};
    }
    
    get settingFields() {
        return {
            images : {
                label : "Image URLs",
                description : "Images must be a direct link. (ending in .png, .jpg, .jpeg, .gif, etc)",
                type : "string",
                array : true
            },
            transitionMethod : {
                label : "Transition animation",
                type : "radio",
                choices : {
                    "none" : { label : "None" },
                    "fade" : { label : "Fade" },
                    "slide-left" : { label : "Slide Left" },
                    "slide-right" : { label : "Slide Right" },
                    "slide-up" : { label : "Slide Up" },
                    "slide-down" : { label : "Slide Down" },
                    "shrink" : { label : "Shrink" },
                    "rotate-x" : { label : "Rotation Horizontally" },
                    "rotate-y" : { label : "Rotation Vertically" },
                    "zoom-fade" : { label : "Zoom and Fade" }
                }
            },
            changeDelay : {
                label : "Image lifetime",
                description : "The amount of time in seconds that images will last before beginning the transition to the next image.",
                type : "float",
                min : 1, max : 10000
            },
            transitionTime : {
                label : "Transition animation length",
                description : "The amount of time in seconds that the transition between image to image lasts.",
                type : "float",
                min : 0, max : 10000
            },
            randomize : {
                label : "Pick images at random",
                description : "Whether or not you want images to be picked at random or in the order you put them in.",
                type : "boolean"
            },
            onlyRunWhileFocused : {
                label : "Only run while Discord is in focus",
                description : "If enabled, the images won't change if you are out of window, to save bandwidth for bad internet.",
                type : "boolean"
            },
            forceTransparency : {
                label : "Force transparency",
                description : "Attempts to force transparency for themes that don't have a background, or the default theme. A transparent theme is recommended.",
                type : "boolean"
            },
            backgroundBrightness : {
                label : "Background brightness",
                type : "float",
                min : 0, max : 1
            }
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
			lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js?forceNew=" + performance.now());
			document.head.appendChild(lib);
		}
        if(typeof window.NeatoLib !== "undefined") libLoadedEvent();
        else lib.addEventListener("load", libLoadedEvent);

	}

	getSettingsPanel() {

		setTimeout(() => {
            
            NeatoLib.Settings.create(this);

			NeatoLib.Settings.pushChangelogElements(this);

		}, 0);

		return "";
		
	}

	saveSettings() {
        this.update();
		NeatoLib.Settings.save(this);
	}

	onLibLoaded() {
		
		this.settings = NeatoLib.Settings.load(this, {
            displayUpdateNotes : true,
            images : [],
            transitionMethod : "zoom-fade",
            changeDelay : 30,
            transitionTime : 3,
            randomize : false,
            onlyRunWhileFocused : false,
            forceTransparency : false,
            backgroundBrightness : 0.5
		});
		
		NeatoLib.Updates.check(this);
		
        if(this.settings.displayUpdateNotes) NeatoLib.Changelog.compareVersions(this.getName(), this.getChanges());

        this.focused = true;
        
        window.addEventListener("focus", this.focusEvent = () => { this.focused = true; });
        window.addEventListener("blur", this.blurEvent = () => { this.focused = false; });

        this.update();
		
		NeatoLib.Events.onPluginLoaded(this);

    }
    
    update() {
        let css = `
            .transitioning-background {
                background-size: cover;
                width: 100%;
                height: 100%;
                position: absolute;
                transition: all ${this.settings.transitionTime}s ease-in-out;
                filter: brightness(${this.settings.backgroundBrightness});
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
        `;

        if (this.settings.forceTransparency) css = css + `
            .container-2lgZY8, .theme-dark .layer-3QrUeG, .theme-dark .layers-3iHuyZ, .theme-dark .chat-3bRxxu, .theme-dark .chat-3bRxxu form, .theme-dark .content-yTz4x3, .theme-dark .chat-3bRxxu, .theme-dark .chat-3bRxxu form, .theme-dark .content-yTz4x3, .theme-dark .messagesWrapper-3lZDfY, #app-mount .channels-Ie2l6A, .theme-dark .members-1998pB, #app-mount .container-PNkimc, .theme-dark .wrapper-1Rf91z, .theme-dark .title-3qD0b-, .theme-dark .typing-2GQL18, .theme-dark .container-3gCOGc, .theme-dark .headerBar-UHpsPw, .theme-dark .activityFeed-28jde9, .theme-dark .gameLibrary-TTDw4Y, .theme-dark .container-2Thooq, .theme-dark .ui-standard-sidebar-view, #app-mount .container-1UB9sr, .hasDropdown-2invhV .header-2o-2hj {
                background: transparent !important;
            }
        `;

        if (this.css) this.css.destroy();
        this.css = NeatoLib.injectCSS(css);

        clearInterval(this.loop);
        clearTimeout(this.removeTimeout);

        let existing = document.getElementsByClassName("transitioning-background");
        for (let i = existing.length - 1; i > -1; i--)
            existing[i].remove();
        
        if (!this.settings.images.length){
            NeatoLib.showToast("You have not added any images. Please add some in the TransitioningBackgrounds settings.", "error");
            return;
        }

        this.index = 0;

        this.loop = setInterval(() => {
            this.transition();
        }, this.settings.changeDelay * 1000);
        this.transition();
    }

    transition() {
        if (this.settings.images.length == 0 || (this.settings.onlyRunWhileFocused && !this.focused)) return;

        let app = document.getElementsByClassName(NeatoLib.getClass("app"))[0],
            existing = document.getElementsByClassName("transitioning-background"),
            next = this.index + 1 >= this.settings.images.length ? 0 : this.index + 1,
            last = this.index;

        if (this.settings.randomize) {
            next = this.settings.images.length * Math.random() << 0;
            while (next == last)
                next = this.settings.images.length * Math.random() << 0;
        }
        
        if (existing.length > 1) {
            existing[1].className += " tb-" + this.settings.transitionMethod;

            this.removeTimeout = setTimeout(() => {
                existing[1].remove();
                app.insertAdjacentHTML("afterbegin", `<div class="transitioning-background" style="background-image:url(${this.settings.images[next]})"></div>`);
            }, this.settings.transitionTime * 1000)
        } else {
            app.insertAdjacentHTML("afterbegin", `<div class="transitioning-background" style="background-image:url(${this.settings.images[this.index]})"></div>`);
            app.insertAdjacentHTML("afterbegin", `<div class="transitioning-background" style="background-image:url(${this.settings.images[next]})"></div>`);
        }

        this.index = next;
    }
	
    stop() {
        window.removeEventListener("focus", this.focusEvent);
        window.removeEventListener("blur", this.blurEvent);

        clearInterval(this.loop);
        clearTimeout(this.removeTimeout);

        let existing = document.getElementsByClassName("transitioning-background");
        for (let i = existing.length - 1; i > 0; i--)
            existing[i].remove();
        
        this.css.destroy();
	}
	
}
