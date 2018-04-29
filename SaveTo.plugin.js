//META{"name":"SaveTo"}*//

class SaveTo {
	
	constructor() {

		this.defaultData = {
            folders : new Array()
        };
        this.data;

        this.defaultSettings = {
            fileNameType : "original"
        };
        this.settings;

        this.classes;

	}
	
    getName() { return "Save To"; }
    getDescription() { return "Allows you to save images, videos, files, server icons and user avatars to your defined folders, or browse to a folder, via the context menu."; }
    getVersion() { return "0.0.1"; }
	getAuthor() { return "Metalloriff"; }
	getChanges() {
		return {
			
		};
    }
    
    getSettingsPanel() {

        var date = new Date();

        Metalloriff.Settings.addRadioGroup("st-file-name-type", "File name type:", [
            { title : "Original", value : "original", description : `Example: unknown.png` },
            { title : "Date", value : "date", description : `Example: ${date.toLocaleDateString().split("/").join("-")} ${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}.png` },
            { title : "Random numbers", value : "random", description : `Example: ${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}.png` },
            { title : "Original + random numbers", value : "original+random", description : `Example: unknown ${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}.png` }
        ], this.settings.fileNameType, (e, choiceItem) => {
            this.settings.fileNameType = choiceItem.value;
            PluginUtilities.saveSettings("SaveTo", this.settings);
        });

        return `
        
            ${Metalloriff.Settings.pluginNameLabel(this.getName())}

            <div id="metalloriff-plugin-settings"></div>
        
        `;

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

        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/SaveTo.plugin.js");
        
        $("#NeatoBurritoLibrary").remove();

		var lib = document.getElementById("NeatoBurritoLibrary");
		if(lib == undefined) {
			lib = document.createElement("script");
			lib.setAttribute("type", "text/javascript");
			lib.setAttribute("src", "https://www.dropbox.com/s/cxhekh6y9y3wqvo/NeatoBurritoLibrary.js?raw=1");
			lib.setAttribute("id", "NeatoBurritoLibrary");
			document.head.appendChild(lib);
			lib.addEventListener("load", () => { this.onLibLoaded(); });
        } else { this.onLibLoaded(); }
        
        this.data = PluginUtilities.loadData("SaveTo", "data", this.defaultData);

        this.settings = PluginUtilities.loadSettings("SaveTo", this.defaultSettings);

	}

	onLibLoaded() {

        this.classes = Metalloriff.getClasses(["contextMenu", "member"]);
        
        $(document).on("contextmenu.SaveTo", e => {
            setTimeout(() => {
                this.onContextMenu(e);
            }, 0);
        });

    }

    onContextMenu(e) {

        var member = $(e.target).parents(`.${this.classes.member}`), dm = $(e.target).parents(".channel.private, .friends-row"), messageGroup = $(e.target).parents(".message-group");

        if(e.target.localName != "a" && e.target.localName != "img" && e.target.localName != "video" && !member.length && !dm.length && !messageGroup.length) return;

        var saveLabel = "Save To", url = e.target.poster || e.target.style.backgroundImage.substring(e.target.style.backgroundImage.indexOf(`"`) + 1, e.target.style.backgroundImage.lastIndexOf(`"`)) || e.target.href || e.target.src, menu = new PluginContextMenu.Menu(false);

        if(e.target.classList.contains("avatar-small")) saveLabel = "Save Icon To";

        if(url == undefined || e.target.classList.contains("avatar-large")) {

            if(messageGroup.length) {

                var user = ReactUtilities.getOwnerInstance(messageGroup).props.messages[0].author;

                url = user.getAvatarURL();
                if(user.avatar.startsWith("a_")) url = url.replace(".png", ".gif");

                saveLabel = "Save Avatar To";

            }

            if(member.length) {

                var user = ReactUtilities.getOwnerInstance(member).props.user;

                url = user.getAvatarURL();
                if(user.avatar.startsWith("a_")) url = url.replace(".png", ".gif");

                saveLabel = "Save Avatar To";

            }

            if(dm.length) {

                var unparsedUrl = dm.find(".avatar-small")[0].style.backgroundImage;

                url = unparsedUrl.substring(unparsedUrl.indexOf(`"`) + 1, unparsedUrl.lastIndexOf(`"`));

                if(url.includes("a_")) url = url.replace(".png", ".gif");

                saveLabel = "Save Avatar To";

            }

        }

        if(url == undefined || e.target.classList.contains("emote") || url.includes("youtube.com/")) return;

        if(url.lastIndexOf("?") != -1) url = url.substring(0, url.lastIndexOf("?"));

        if(saveLabel.includes("Avatar") || saveLabel.includes("Icon")) url += "?size=2048";

        if(e.target.classList.contains("emoji")) saveLabel = "Save Emote To";

        url = url.replace(".webp", ".png");

        var folderNames = Array.from(this.data.folders, x => x.substring(x.split("\\").join("/").lastIndexOf("/") + 1, x.length)).sort((x, y) => { if(x < y) return -1; if(x > y) return 1; return 0; }), fileName = url.substring(url.lastIndexOf("/") + 1, url.length), fileExtension = url.substring(url.lastIndexOf("."), url.length);
            
        var date = new Date();

        if(this.settings.fileNameType == "date") fileName = `${date.toLocaleDateString().split("/").join("-")} ${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}${fileExtension}`;

        if(this.settings.fileNameType == "random") fileName = `${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}${fileExtension}`;

        if(this.settings.fileNameType == "original+random") fileName = fileName.replace(fileExtension, "") + ` ${date.getMonth()}${date.getDay()}${date.getMinutes()}${date.getSeconds()}${date.getMilliseconds()}${fileExtension}`;
        
        var options = new PluginContextMenu.Menu(false);
        options.addItems(new PluginContextMenu.TextItem("Remove Folder", { callback : e => {
            this.data.folders.splice(this.data.folders.findIndex(x => x.endsWith(e.currentTarget.parentElement.parentElement.innerText.split("\n")[0])), 1);
            PluginUtilities.saveData("SaveTo", "data", this.data);
            $(e.currentTarget.parentElement.parentElement).remove();
        }})).addItems(new PluginContextMenu.TextItem("Open Folder", { callback : e => {
            window.open("file:///" + this.data.folders.find(x => x.endsWith(e.currentTarget.parentElement.parentElement.innerText.split("\n")[0])));
        }})).addItems(new PluginContextMenu.TextItem("Save To Folder", { callback : e => {
            e.target.parentElement.click();
        }}));

        for(var i = 0; i < folderNames.length; i++) {;
            menu.addItems(new PluginContextMenu.SubMenuItem(folderNames[i], options, { callback : e => {
                Metalloriff.downloadFile(url, this.data.folders.find(x => x.endsWith(e.currentTarget.innerText.split("\n")[0])), fileName);
            }}));
        }

        menu.addItems(new PluginContextMenu.ItemGroup().addItems(new PluginContextMenu.TextItem("Add Folder", { callback : () => {
            $("#st-folder-upload").remove();
            $(".app").append(`<input id="st-folder-upload" style="display:none;" type="file" webkitdirectory directory></input>`);
            var fileBrowser = document.getElementById("st-folder-upload");
            fileBrowser.click();
            fileBrowser.addEventListener("change", () => {
                if(this.data.folders.indexOf(fileBrowser.files[0].path) == -1) {
                    this.data.folders.push(fileBrowser.files[0].path);
                    PluginUtilities.saveData("SaveTo", "data", this.data);
                }
                $("#st-folder-upload").remove();
            });
        }})).addItems(new PluginContextMenu.TextItem("Browse", { callback : () => {
            $("#st-folder-upload").remove();
            $(".app").append(`<input id="st-folder-upload" style="display:none;" type="file" webkitdirectory directory></input>`);
            var fileBrowser = document.getElementById("st-folder-upload");
            fileBrowser.click();
            fileBrowser.addEventListener("change", () => {
                Metalloriff.downloadFile(url, fileBrowser.files[0].path, fileName);
                $("#st-folder-upload").remove();
            });
        }}))).addItems(new PluginContextMenu.ItemGroup().addItems(new PluginContextMenu.TextItem("Settings", { callback : () => {
            document.querySelector(`.${this.classes.contextMenu}`).style.display = "none";
            Metalloriff.Settings.showPluginSettings(this.getName());
        }})));

        var subMenu = new PluginContextMenu.SubMenuItem(saveLabel, menu);

        $(`.${this.classes.itemGroup}`).last().append(subMenu.element);

    }
	
    stop() {

        $(document).off("contextmenu.SaveTo");

	}
	
}