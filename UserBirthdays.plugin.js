/**
 * @name UserBirthdays
 * @invite yNqzuJa
 * @authorLink https://github.com/metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/UserBirthdays.plugin.js
 */
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {
        "info": {
            "name": "UserBirthdays",
            "authors": [{
                "name": "Metalloriff",
                "discord_id": "264163473179672576",
                "github_username": "Metalloriff",
                "twitter_username": "Metalloriff"
            }],
            "version": "3.0.0",
            "description": "Allows you to set birthdays for users and get notified when it's a user's birthday.",
            "github": "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/UserBirthdays.plugin.js",
            "github_raw": "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/UserBirthdays.plugin.js"
        },
        "changelog": [{
            "title": "Rewritten!",
            "type": "improved",
            "items": ["UserBirthdays fixed by Danielle#1788"]
        }]
    };

    return !global.ZeresPluginLibrary ? class {
        constructor() {
            this._config = config;
        }
        getName() {
            return config.info.name;
        }
        getAuthor() {
            return config.info.authors.map(a => a.name).join(", ");
        }
        getDescription() {
            return config.info.description;
        }
        getVersion() {
            return config.info.version;
        }
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {

            const {
                Toasts,
                PluginUtilities,
                DiscordModules
            } = Api;

            const {
                UserStore
            } = DiscordModules;

            return class UserBirthdays extends Plugin {

                onStart() {
                    this.birthdays = PluginUtilities.loadData(this.getName(), "birthdays", {
                        "264163473179672576": {
                            day: "5/20",
                            hadIn: ""
                        }
                    });

                    const noteItem = (profile, uid) => {
                        let el = document.createElement("div");
                        let tt = document.createElement("div");
                        let birthday = this.birthdays[uid];

                        tt.className = this.c.tooltip.self;
                        tt.style = "opacity:0;position:absolute;top:15%;right:10%;transition:opacity 0.5s;animation: none;"
                        tt.innerHTML = `<div class="${this.c.tooltip.pointer}"></div>Inproper date format!</div>`;

                        el.appendChild(tt);

                        el.innerHTML += `
                    <div id="ub-field" class="${this.c.note.title}">Birthday</div>
                    <div class="${profile ? this.c.profile.note : this.c.note.self}">
                        <textarea placeholder="Example: 4/20, April 20 or YYYY-MM-DD" maxlength="50" autocorrect="off" class="${this.c.note.textArea}" style="height:35px">${birthday ? birthday.day : ""}</textarea>
                    </div>`

                        el.getElementsByTagName("textarea")[0].addEventListener("input", e => {
                            let v = e.target.value;
                            let d = new Date(v);
                            let t = e.target.parentElement.parentElement.getElementsByClassName(this.c.tooltip.self)[0];

                            if (v.length && d == "Invalid Date") {
                                t.style.opacity = 1;
                            } else {
                                t.style.opacity = 0;
                                this.setBirthday(uid, v);
                            }
                        });

                        return el;
                    };

                    (this.o = new MutationObserver(m => {
                        for (let i = 0; i < m.length; i++) {
                            const p = m[i].addedNodes[0];

                            if (p != null) {
                                if (p.getElementsByClassName(this.c.userPopout)[0]) {
                                    let uid = p.getElementsByClassName(this.c.userPopout)[0].dataset.userId;
                                    if (uid) {
                                        p.getElementsByClassName(this.c.note.self)[0].appendChild(noteItem(false, uid));
                                    }
                                }

                                if (p.getElementsByClassName(this.c.profile.self)[0]) {
                                    p.getElementsByClassName(this.c.profile.self)[0].appendChild(noteItem(true, p.getElementsByClassName(this.c.profile.self)[0].parentElement.parentElement.parentElement.dataset.userId));
                                }
                            }
                        }
                    })).observe(document.getElementsByClassName(this.c.layerContainer)[1], {
                        childList: true
                    });
                    this.o.observe(document.getElementsByClassName(this.c.layerContainer)[1].previousSibling.previousElementSibling, {
                        childList: true
                    });
                    this.o.observe(document.getElementsByClassName(this.c.popouts)[0], {
                        childList: true
                    });

                    this.loop = setInterval(() => {
                        const now = new Date();

                        for (let uid in this.birthdays) {
                            const _user = UserStore.getUser(uid),
                                birthday = new Date(this.birthdays[uid].day);
                            let user;
                            if (_user) {
                                user = {
                                    avatar: _user.getAvatarURL(),
                                    tag: _user.tag,
                                    name: _user.username,
                                    id: uid
                                }
                            } else if (uid == "264163473179672576") {
                                user = {
                                    avatar: "https://cdn.discordapp.com/attachments/396895633732272139/707233064031486002/well_frickly_frack.png",
                                    tag: "Metalloriff#2891",
                                    name: "Metalloriff",
                                    id: uid
                                }
                            } else {
                                user = {
                                    avatar: "/assets/f046e2247d730629309457e902d5c5b3.svg",
                                    tag: uid,
                                    name: "Unknown User",
                                    id: uid
                                }
                            }

                            if (now.getMonth() == birthday.getMonth() && now.getDate() == birthday.getDate() &&
                                (this.birthdays[uid].hadIn == "" || isNaN(this.birthdays[uid].hadIn) || now.getFullYear() != this.birthdays[uid].hadIn)) {
                                this.createBirthdayItem(user);

                                this.birthdays[uid].hadIn = now.getFullYear();
                                PluginUtilities.saveData(this.getName(), "birthdays", this.birthdays);
                            }
                        }
                    }, 60 * 1000)
                }

                onStop() {
                    this.o.disconnect();
                    clearInterval(this.loop);
                }

                get c() {
                    return {
                        app: "app-1q1i1E",
                        layerContainer: "layerContainer-yqaFcK",
                        userPopout: "userPopout-xaxa6l",
                        popouts: "popouts-2bnG9Z",
                        note: {
                            self: "note-1oo11U",
                            title: "bodyTitle-1ySSKn base-1x0h_U size12-3cLvbJ",
                            textArea: "textarea-2r0oV8 scrollbarGhostHairline-1mSOM1 scrollbar-3dvm_9"
                        },
                        profile: {
                            self: "userInfoSection-q_35fn",
                            note: "note-367eZJ"
                        },
                        tooltip: {
                            self: "tooltip-2QfLtc tooltipTop-XDDSxx tooltipBlack-PPG47z tooltipDisablePointerEvents-3eaBGN",
                            pointer: "tooltipPointer-3ZfirK"
                        }
                    }
                }

                setBirthday(uid, day) {
                    if (day) {
                        this.birthdays[uid] = {
                            day: day,
                            hadIn: ""
                        }
                    } else {
                        delete this.birthdays[uid];
                    }

                    PluginUtilities.saveData(this.getName(), "birthdays", this.birthdays);
                    Toasts.success("Birthday Set!")
                }

                createBirthdayItem(user) {
                    let i = document.getElementById("ub-birthday-item-" + user.id);

                    if (!i) {
                        i = document.createElement("div");

                        i.id = "ub-birthday-item-" + user.id;

                        i.style = `
                    background: white;
                    border-radius: 10px;
    
                    width: 80%;
                    height: 150px;
                    margin-top: 40px;
                `;

                        i.innerHTML = `
                    <div style="width: 130px; height: 130px; margin: 10px; border-radius: 10px; background: url(${user.avatar}) no-repeat; background-size: cover;">
                    <div style="position: relative; left: 105%; font-size: 35px; font-weight: bold;">${user.tag}</div>
                    <div style="position: relative; left: 105%; font-size: 35px; width: 1000px;">It's ${user.name}'s birthday today!</div>
                    </div>`;

                        this.createBirthdayContainer().appendChild(i);
                    }

                    return i;
                }

                createBirthdayContainer() {
                    let c = document.getElementById("ub-birthday-container");

                    if (!c) {
                        c = document.createElement("div");

                        c.id = "ub-birthday-container";

                        c.style = `
				background: rgba(0, 0, 0, 0.7);
				overflow: scroll;

				position: absolute;
				width: 100%;
				height: 100%;
				border-top: 50px solid transparent;
				z-index: 1000;

				opacity: 0;
				transition: opacity 0.5s;

				display: grid;
				justify-items: center;

				grid-template-columns: 1fr;
				grid-auto-rows: 15%;
			`;

                        c.addEventListener("click", e => {
                            e.currentTarget.style.opacity = 0;

                            setTimeout(() => {
                                c.remove();
                            }, 600);
                        });

                        document.getElementsByClassName(this.c.app)[0].appendChild(c);

                        setTimeout(() => {
                            c.style.opacity = 1;
                        }, 100);
                    }

                    return c;
                }

            };

        };
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
