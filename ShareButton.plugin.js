//META{"name":"ShareButton"}*//

class ShareButton {
	
	constructor() {
        
        this.recentChannels = new Array();
        this.pinnedChannels = new Array();

        this.guildModule;
        this.channelModule;

        this.popoutObserver;

	}
	
    getName() { return "Share Button"; }
    getDescription() { return "Allows you to easily share images, videos, links and messages to other channels and servers via the context menu and message dropdown menu."; }
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
	
	initialize() {

		PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/ShareButton.plugin.js");

		var lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://www.dropbox.com/s/cxhekh6y9y3wqvo/NeatoBurritoLibrary.js?raw=1");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			document.head.appendChild(lib);
			lib.addEventListener("load", () => { this.onLibLoaded(); });
		} else { this.onLibLoaded(); }

        $(document).on("contextmenu.ShareButton", e => { 
            setTimeout(() => {
                this.onContextMenu(e);
            }, 0);
        });

        this.guildModule = DiscordModules.GuildStore;
        this.channelModule = DiscordModules.ChannelStore;

        var data = PluginUtilities.loadData("ShareButton", "data", { recentChannels : new Array(), pinnedChannels : new Array() });

        for(var i in data) { this[i] = data[i]; }

        this.popoutObserver = new MutationObserver(e => {
            if(e[0].addedNodes.length && e[0].addedNodes[0].firstChild.classList.contains("option-popout")) {
                var dropdown = e[0].addedNodes[0].firstChild, message = ReactUtilities.getOwnerInstance(dropdown).props.message;
                dropdown.insertAdjacentHTML("afterbegin", `<div id="sb-share-popout" class="btn-item">Share</div>`);
                document.getElementById("sb-share-popout").addEventListener("click", () => {
                    this.openShareMenu(undefined, "message", message.content);
                    dropdown.style.display = "none";
                });
            }
        });
        this.popoutObserver.observe(document.querySelector(".popouts-3dRSmE"), { childList : true });

    }
    
    saveData() { PluginUtilities.saveData("ShareButton", "data", { recentChannels : this.recentChannels, pinnedChannels : this.pinnedChannels }); }

    onContextMenu(e) {

        if(e.target.localName == "img" || e.target.localName == "video" || (e.target.localName == "a" && e.target.parentElement.className == "markup")) {

            $(".contextMenu-HLZMGh").prepend(`<div id="share-button" class="item-1Yvehc"><span>Share</span></div>`);

            $("#share-button").on("click", () => {

                this.openShareMenu(e);

                document.querySelector(".contextMenu-HLZMGh").style.display = "none";

            });

        }

    }

    openShareMenu(e, definedName, definedData) {

        $(".app").last().append(`
        
            <div id="sb-menu" class="popout popout-bottom-right no-arrow no-shadow">

                <style>
        
                    #sb-menu {
                        z-index: 1000;
                        position: absolute;
                        left: 45%;
                        bottom: 8%;
                    }

                    .sb-label {
                        color: white;
                        font-size: 30px;
                        padding-top: 20px;
                        padding-left: 20px;
                    }

                    .sb-button {
                        border-radius: 10px;
                        background-color: rgba(0, 0, 0, 0.2);
                        cursor: pointer;
                        transition: background 0.3s;
                    }

                    .sb-button:hover {
                        background-color: rgba(255, 255, 255, 0.2);
                    }

                    .sb-button:active {
                        background-color: rgba(0, 0, 0, 0.3);
                    }

                    .sb-guilds {
                        max-height: 870px;
                    }
                    
                    .sb-channel-item-button {
                        text-align: center;
                        margin: 5px;
                    }

                    .sb-channel-item {
                        margin: auto;
                        width: 95%;
                        height: 40px;
                        line-height: 40px;
                        color: white;
                        margin-top: 18px;
                    }

                    .sb-server-item {
                        margin: 5px;
                        margin-top: 10px;
                        padding: 1px;
                    }

                    .sb-server-item-icon {
                        width: 50px;
                        height: 50px;
                        background-color: rgba(0, 0, 0, 0.2);
                        background-size: cover;
                        margin: 10px;
                        border-radius: 5px;
                    }

                    .sb-server-item-label {
                        color: white;
                        display: inline-block;
                        padding-left: 65px;
                        width: 600px;
                        padding-top: 7.5px;
                        font-size: 30px;
                        font-weight: 500;
                    }

                </style>

                <div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: black; transform: translateZ(0px);z-index: -10;" onclick="$('#sb-menu').remove();"></div>
                <div class="messages-popout-wrap themed-popout recent-mentions-popout" style="height: 900px;width: 800px;">
                    <div class="header" style="padding-bottom: 12px;">
                        <div class="title" style="text-align: center;transform: translateY(6px);">Share</div>
                        <div class="actionButtons-1sUUug" style="position: absolute;top: 5px;">
                            <div class="closeButton-17RIVZ" onclick="$('#sb-menu').remove();" style="opacity:1;"></div>
                        </div>
                    </div>
                    <div class="scroller-wrap dark">
                        <div class="messages-popout scroller sb-guilds" style="overflow-x:hidden;">
                            
                        </div>
                    </div>
                </div>
            </div>

        `);

        var menu = document.getElementById("sb-menu"), scroller = $(".sb-guilds");

        var menuRect = menu.getBoundingClientRect();
        menu.style.left =  (($(document).width() - menuRect.width) / 2) + "px";
        menu.style.top = (($(document).height() - menuRect.height) / 2) + "px";

        var fileURL, fileName;

        if(definedName != undefined && definedData != undefined) {

            fileURL = definedData;
            fileName = definedName;

        } else {

            fileURL = e.target.src;

            if(fileURL == undefined) {

                fileURL = e.target.href;
                fileName = fileURL;

            } else {

                if(fileURL.lastIndexOf("?") != -1) { fileURL = fileURL.substring(0, fileURL.lastIndexOf("?")); }

                fileName = fileURL.substring(fileURL.lastIndexOf("/") + 1, fileURL.length);
            
            }

        }
        
        if(fileName != undefined && fileName != "") { menu.querySelector(".title").innerText += ` "${fileName}"`; }

        var updateChannels = () => {

            var channelItem = $(".sb-channel-item-button");

            channelItem.off("click");
            channelItem.on("click", channelClickEvent);

            channelItem.off("contextmenu");
            channelItem.on("contextmenu", channelContextEvent);

        },
        recentChannels, updateRecentChannels = () => {

            if(recentChannels != undefined) {

                recentChannels.remove();
                recentChannels = undefined;

            }

            for(var i = 0; i < this.recentChannels.length; i++) {

                var channel = this.channelModule.getChannel(this.recentChannels[i]), guild = this.guildModule.getGuild(channel.guild_id);

                if(channel == undefined || guild == undefined) { continue; }

                if(recentChannels == undefined) {
                    $(`<div id="sb-recent-channels"><div class="sb-label">Recent Channels</div></div>`).insertBefore(scroller.find("#sb-servers"));
                    recentChannels = $("#sb-recent-channels");
                }

                $(`<div class="sb-channel-item-button sb-button" data-channel-id="${channel.id}" data-content="${fileURL}"><div class="sb-channel-item">#${channel.name} - ${guild.name}</div></div>`).insertAfter(recentChannels.find(".sb-label"));

            }

            updateChannels();

        },
        pinnedChannels, updatePinnedChannels = () => {

            if(pinnedChannels != undefined) {

                pinnedChannels.remove();
                pinnedChannels = undefined;

            }

            for(var i = 0; i < this.pinnedChannels.length; i++) {

                var channel = this.channelModule.getChannel(this.pinnedChannels[i]), guild = this.guildModule.getGuild(channel.guild_id);

                if(channel == undefined || guild == undefined) { continue; }

                if(pinnedChannels == undefined) {
                    scroller.prepend(`<div id="sb-pinned-channels"><div class="sb-label">Pinned Channels</div></div>`);
                    pinnedChannels = $("#sb-pinned-channels");
                }

                $(`<div class="sb-channel-item-button sb-button" data-channel-id="${channel.id}" data-content="${fileURL}"><div class="sb-channel-item">#${channel.name} - ${guild.name}</div></div>`).insertAfter(pinnedChannels.find(".sb-label"));

            }

            updateChannels();

        };

        var guilds = InternalUtilities.WebpackModules.findByUniqueProperties(["getSortedGuilds"]).getSortedGuilds(), guildsParent, allChannels = Object.values(this.channelModule.getChannels()).sort((x, y) => { return x.position - y.position; });

        for(var i = 0; i < guilds.length; i++) {

            if(guildsParent == undefined) {
                scroller.append(`<div id="sb-servers"><div class ="sb-label">Servers</div></div>`);
                guildsParent = $("#sb-servers");
            }

            guildsParent.append(`<div data-server-id="${guilds[i].guild.id}" data-opened="false" class="sb-server-item sb-button"><div class="sb-server-item-icon" style="background-image: url('${guilds[i].guild.getIconURL()}');"><div class="sb-server-item-label">${guilds[i].guild.name}</div></div><div id="sb-server-item-channels"></div></div>`);

        }

        var channelClickEvent = e => {

            var $targ = $(e.currentTarget), item = e.currentTarget.querySelector(".sb-channel-item");

            DiscordModules.MessageActions.sendMessage($targ.data("channel-id"), { content : $targ.data("content") });

            item.innerText = "Sent!";
            $targ[0].style.backgroundColor = "#43b581";
            $targ[0].style.cursor = "default";

            PluginUtilities.showToast("Sent!", { type : "success" });

            $targ.off("click");

            if(this.recentChannels.includes($targ.data("channel-id"))) { this.recentChannels.splice(this.recentChannels.indexOf($targ.data("channel-id")), 1); }

            this.recentChannels.push($targ.data("channel-id"));

            while(this.recentChannels.length >= 10) { this.recentChannels.splice(0, 1); }

            updateRecentChannels();

            this.saveData();

        },
        channelContextEvent = e => {
            
            var menu = new PluginContextMenu.Menu(false), channelId = $(e.currentTarget).data("channel-id"), group = new PluginContextMenu.ItemGroup();

            if(this.pinnedChannels.includes(channelId)) {
                group.addItems(new PluginContextMenu.TextItem("Unpin", { callback : () => {
                    this.pinnedChannels.splice(this.pinnedChannels.indexOf(channelId), 1);
                    updatePinnedChannels();
                    this.saveData();
                    document.querySelector(".contextMenu-HLZMGh").style.display = "none";
                }}));
            } else {
                group.addItems(new PluginContextMenu.TextItem("Pin", { callback : () => {
                    this.pinnedChannels.push(channelId);
                    updatePinnedChannels();
                    this.saveData();
                    document.querySelector(".contextMenu-HLZMGh").style.display = "none";
                }}));
            }

            menu.addGroup(group).show(e.clientX, e.clientY);

        };

        $(".sb-server-item").on("click", e => {

            var $targ = $(e.currentTarget), channelsParent = $targ.find("#sb-server-item-channels"), guild = this.guildModule.getGuild($targ.data("server-id")), categories = new Array();

            if(e.target.classList.contains("sb-channel-item")) return;

            if(channelsParent.find(".sb-channel-item-button").length) {

                channelsParent[0].innerHTML = "";
                e.currentTarget.style.backgroundColor = "";

            } else {

                for(var i = 0; i < allChannels.length; i++) {

                    if(allChannels[i].guild_id == $targ.data("server-id") && allChannels[i].type == 0) {
                    
                        if(allChannels[i].parent_id != undefined && !categories.includes(allChannels[i].parent_id)) {

                            channelsParent.append(`<div id="sb-recent-channels" style="text-align:center;"><div class="sb-label" style="padding-left:0px;">${this.channelModule.getChannel(allChannels[i].parent_id).name}</div></div>`);

                            categories.push(allChannels[i].parent_id);

                        }

                        if(allChannels[i].parent_id == undefined && !categories.includes("uncategorized")) {

                            channelsParent.append(`<div id="sb-recent-channels" style="text-align:center;"><div class="sb-label" style="padding-left:0px;">Uncategorized</div></div>`);

                            categories.push("uncategorized");

                        }

                        channelsParent.append(`<div class="sb-channel-item-button sb-button" data-channel-id="${allChannels[i].id}" data-content="${fileURL}"><div class="sb-channel-item">#${allChannels[i].name}</div></div>`);

                    }

                }

                e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.3)";

            }

            updateChannels();

        });

        updatePinnedChannels();
        updateRecentChannels();

    }

	onLibLoaded() {

	}
	
    stop() {

        $(document).off("contextmenu.ShareButton");

        if(this.popoutObserver != undefined) this.popoutObserver.disconnect();

	}
	
}
