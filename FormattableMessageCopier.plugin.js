//META{"name":"FormattableMessageCopier"}*//

class FormattableMessageCopier {
	
	getSettingsPanel(){
            
        let updateExample = () => {

            let hints = document.getElementsByClassName("plugin-settings")[0].getElementsByTagName("p");

            for(let i = 0; i < hints.length; i++) hints[i].style.color = `rgb(${this.settings.selectionColor})`;

            let time = new Date().toLocaleTimeString("en-us"),
            example = document.getElementById("mc-example"),
            exampleMessages1 = [], exampleMessages2 = [];

            for(let msg of ["Hello.", "These are some messages.", "This is a third message, with a reaction."]) {

                exampleMessages1.push(this.settings.messageFormat
                .split("$time").join(time)
                .split("$messagetext").join(msg));

                exampleMessages1.push(this.settings.reactionFormat
                .split("$emoji").join("👌")
                .split("$count").join("4") + this.settings.reactionFormat
                .split("$emoji").join("💯")
                .split("$count").join("20"));

                exampleMessages2.push(this.settings.messageFormat
                .split("$time").join(time)
                .split("$messagetext").join("This message has an image attached to it."));

                exampleMessages2.push(this.settings.attachmentFormat
                .split("$filename").join("LUUL.jpg")
                .split("$fileurl").join("https://i.imgur.com/cxWch9R.jpg"));

                example.innerText = (this.settings.headerFormat
                    .split("$channel").join("#general")
                    .split("$selectionstarttime").join(time)
                    .split("$selectionendtime").join(time)
                    .split("$selectiondate").join(new Date().toLocaleDateString("en-us"))
                + "\n" + this.settings.groupFormat
                    .split("$time").join(time)
                    .split("$username").join("Metalloriff")
                    .split("$usertag").join("Metalloriff#2891")
                    .split("$jumplink").join("https://discordapp.com/channels/serverid/channelid/messageid")
                    .split("$message").join(exampleMessages1.join("\n"))
                + "\n" + this.settings.groupFormat
                    .split("$time").join(time)
                    .split("$username").join("Some Kid Named Nate")
                    .split("$usertag").join("Some Kid Named Nate#0000")
                    .split("$jumplink").join("https://discordapp.com/channels/serverid/channelid/messageid")
                    .split("$message").join(exampleMessages2.join("\n")))
                .split("$newline").join("\n")
                .split("$tab").join("    ");

            }

        };

        setTimeout(() => {
            
            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Header format", this.settings.headerFormat, e => {
                this.settings.headerFormat = e.target.value;
                updateExample();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createHint(`
                Header variables:\n\n
                $channel - The name of the selected channel\n
                $selectionstarttime - The timestamp of the first selected message\n
                $selectionendtime - The timestamp of the last selected message\n
                $selectiondate - The date of the selected messages\n
                $newline - New line\n
                $tab - Tab
            `), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Message group format", this.settings.groupFormat, e => {
                this.settings.groupFormat = e.target.value;
                updateExample();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createHint(`
                $time - Message group timestamp\n
                $username - Message group sender's username\n
                $usertag - Message group sender's username and discriminator\n
                $message - Formatted message\n
                $newline - New line\n
                $tab - Tab
            `), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Message format", this.settings.messageFormat, e => {
                this.settings.messageFormat = e.target.value;
                updateExample();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createHint(`
                $time - Message timestamp\n
                $jumplink - A link that redirects the user to the message, if they are in the server it was from, and have access to the channel\n
                $messagetext - Message text\n
                $newline - New line\n
                $tab - Tab
            `), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Attachment format", this.settings.attachmentFormat, e => {
                this.settings.attachmentFormat = e.target.value;
                updateExample();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createHint(`
                $filename - Name of the uploaded file\n
                $fileurl - URL of the uploaded file\n
                $newline - New line\n
                $tab - Tab
            `), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Reaction format", this.settings.reactionFormat, e => {
                this.settings.reactionFormat = e.target.value;
                updateExample();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createHint(`
                $emoji - Reaction's emoji\n
                $count - Reaction count\n
                $newline - New line\n
                $tab - Tab
            `), this.getName());

            NeatoLib.Settings.pushElement(NeatoLib.Settings.Elements.createNewTextField("Selection color (R, G, B)", this.settings.selectionColor, e => {
                this.settings.selectionColor = e.target.value;
                updateExample();
                this.saveSettings();
            }), this.getName());

            NeatoLib.Settings.pushHTML(`
                <div id="mc-example" style="padding-top:30px;color:white;background-color:rgba(0,0,0,0.3);white-space:pre;border-radius:5px;" class="message-group hide-overflow">
                    <div class="comment">
                        <div class="message">
                            <div class="body">
                                <div class="message-text">
                                    <div class="markup">...</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `, this.getName());

            let fields = document.getElementsByClassName("plugin-settings")[0].getElementsByClassName("input-2YozMi");

            updateExample();

        }, 0);
        
        return NeatoLib.Settings.Elements.pluginNameLabel(this.getName());

	}

    saveSettings(){
        NeatoLib.Settings.save(this);
    }
	
    getName() { return "Formattable Message Copier"; }
    getDescription() { return "Allows you to select messages in a chat to copy them in a customizable format. Double click the top of a message group to select it, then shift click to the next point to select all message groups between, or ctrl click another message group to append a single group to the selection."; }
    getVersion() { return "0.1.4"; }
    getAuthor() { return "Metalloriff"; }

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
	
	onLibLoaded(){

        this.settings = NeatoLib.Settings.load(this, {
            headerFormat : "messages in $channel since $selectionstarttime, until $selectionendtime, on $selectiondate$newline$newline",
            groupFormat : "[$time] $username:$newline$newline$message$newline$newline",
            messageFormat : "$tab$messagetext",
            attachmentFormat : "[$filename]: <$fileurl>",
            reactionFormat : " [ $emoji : $count ] ",
            selectionColor : "114, 137, 218"
        });

        NeatoLib.Updates.check(this);

        NeatoLib.Events.onPluginLoaded(this);

        this.userModule = NeatoLib.Modules.get("getUser");
        this.channelModule = NeatoLib.Modules.get("getChannel");
        this.selection = [];

        this.applyCSS();

        this.clickEvent = e => this.onClick(e);

        document.addEventListener("dblclick", this.clickEvent);
        document.addEventListener("click", this.clickEvent);
        
    }

    applyCSS(){

        if(this.styles) this.styles.destroy();

        this.styles = NeatoLib.injectCSS(`

            .mc-message-selected {
                margin-left: 0px !important;
                margin-right: 0px !important;
                padding-left: 20px !important;
                padding-right: 6px !important;
                border: 2px solid rgb(${this.settings.selectionColor}) !important;
                background-color: rgba(${this.settings.selectionColor}, 0.5) !important;
            }

            #mc-copy-button {
                background-color: rgb(${this.settings.selectionColor}) !important;
            }

        `);
        
    }
    
    onClick(e){

        if(!e.target.classList || (!e.target.classList.contains("message-group") && e.target.className != "old-h2")) return;

        let messageGroup;

        if(e.target.className.includes("message-group")) messageGroup = e.target;
        else messageGroup = $(e.target).parents(".message-group")[0];
        
        if(messageGroup) {

            if(e.type == "dblclick" || (e.type == "click" && e.ctrlKey)){
                messageGroup.classList.add("mc-message-selected");
                this.selection.push(messageGroup);
            }

            if(e.type == "click" && !e.ctrlKey && !e.shiftKey) this.clearSelection();

            if(e.type == "click" && e.shiftKey && this.selection.length > 0 && messageGroup != this.selection[0]) {

                if(document.selection) document.selection.empty();
                else if(window.getSelection) window.getSelection().removeAllRanges();

                let messages = document.getElementsByClassName("message-group"), selecting = false, newSelection = [];

                let select = (i, reverse) => {
                    if(messages[i] == (reverse ? messageGroup : this.selection[0])) selecting = true;
                    if(selecting) {
                        newSelection.push(messages[i]);
                        messages[i].classList.add("mc-message-selected");
                    }
                    if(messages[i] == (reverse ? this.selection[0] : messageGroup)) selecting = false;
                };

                if(this.selection.length > 1) {
                    for(let i = 0; i < this.selection.length; i++) this.selection[i].classList.remove("mc-message-selected");
                    this.selection.splice(1, this.selection.length);
                }

                for(let i = 0; i < messages.length; i++) select(i);

                if(selecting) {
                    selecting = false;
                    newSelection = [];
                    for(let i = 0; i < messages.length; i++) {
                        messages[i].classList.remove("mc-message-selected");
                        select(i, true);
                    }
                }

                this.selection = newSelection;

            }

        }

        if(document.getElementById("mc-copy-button")) document.getElementById("mc-copy-button").remove();

        if(this.selection.length > 0){
            this.selection[this.selection.length - 1].insertAdjacentHTML("beforeend", `<button id="mc-copy-button" style="display: inline-block; margin-right: 25px;" type="button" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"><div class="contents-4L4hQM">Copy Selection (${this.selection.length})</div></button>`);
            document.getElementById("mc-copy-button").addEventListener("click", () => this.copySelection());
        }

    }

    clearSelection(){
        for(let i = 0; i < this.selection.length; i++) this.selection[i].classList.remove("mc-message-selected");
        this.selection = [];
        if(document.getElementById("mc-copy-button")) document.getElementById("mc-copy-button").remove();
    }

    copySelection(){

        let formatted = [],
        firstMessage = NeatoLib.ReactData.getProps(this.selection[0]),
        lastGroup = NeatoLib.ReactData.getProps(this.selection[this.selection.length - 1]).messages,
        lastMessageTimestamp = lastGroup[lastGroup.length - 1].timestamp,
        channelName = firstMessage.channel.name;
        
        if(this.settings.headerFormat != "" && this.selection.length > 1){
            formatted.push(this.settings.headerFormat
                .split("$channel").join(channelName == "" ? "DM" : ("#" + channelName))
                .split("$selectionstarttime").join(firstMessage.messages[0].timestamp.toDate().toLocaleTimeString("en-us"))
                .split("$selectionendtime").join(lastMessageTimestamp.toDate().toLocaleTimeString("en-us"))
                .split("$selectiondate").join(lastMessageTimestamp.toDate().toLocaleDateString("en-us"))
                .split("$newline").join("\n")
                .split("$tab").join("\t")
            );
        }

        for(let i = 0; i < this.selection.length; i++) {

            let props = NeatoLib.ReactData.getProps(this.selection[i]),
            time = props.messages[0].timestamp.toDate().toLocaleTimeString("en-us"),
            messages = [];

            for(let pi = 0; pi < props.messages.length; pi++) {

                let message = props.messages[pi];

                for(let mi = 0; mi < message.mentions.length; mi++) message.content = message.content.replace("<@" + message.mentions[i] + ">", "`@" + this.userModule.getUser(message.mentions[i]).tag + "`");

                let content = this.settings.messageFormat
                .split("$time").join(message.timestamp.toDate().toLocaleTimeString("en-us"))
                .split("$newline").join("\n")
                .split("$tab").join("\t")
                .split("$messagetext").join(message.content);
                
                if(content != "") messages.push(content);

                let reactions = [];

                for(let ri = 0; ri < message.reactions.length; ri++) {
                    reactions.push(this.settings.reactionFormat
                        .split("$emoji").join(message.reactions[ri].emoji.name)
                        .split("$count").join(message.reactions[ri].count)
                        .split("$newline").join("\n")
                        .split("$tab").join("\t")
                    );
                }

                if(reactions.length > 0) messages.push(reactions.join(""));

                for(let ai = 0; ai < message.attachments.length; ai++) {
                    messages.push(this.settings.attachmentFormat
                        .split("$filename").join(message.attachments[ai].filename)
                        .split("$fileurl").join(message.attachments[ai].url)
                        .split("$newline").join("\n")
                        .split("$tab").join("\t")
                    );
                }

            }
            
            formatted.push(this.settings.groupFormat
                .split("$time").join(time)
                .split("$username").join(props.messages[0].author.username)
                .split("$usertag").join(props.messages[0].author.tag)
                .split("$jumplink").join(props.channel.guild_id ? `<https://discordapp.com/channels/${props.channel.guild_id}/${props.channel.id}/${props.messages[0].id}>` : "")
                .split("$message").join(messages.join("\n"))
                .split("$newline").join("\n")
                .split("$tab").join("\t")
            );
        }
        
        this.clearSelection();

        formatted = formatted.join("\n");
        
        NeatoLib.Modules.get("copy").copy(formatted);

        NeatoLib.showToast(formatted.length + " characters copied!", null, { color : `rgb(${this.settings.selectionColor})` });
        
    }
	
    stop() {

        document.removeEventListener("dblclick", this.clickEvent);
        document.removeEventListener("click", this.clickEvent);

        this.styles.destroy();
        
    }
	
}
