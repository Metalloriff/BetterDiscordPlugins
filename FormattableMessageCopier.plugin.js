//META{"name":"FormattableMessageCopier"}*//

class FormattableMessageCopier {
	
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
                .mc-ticked {
                    background-color: white;
                    height: 60%;
                    width: 60%;
                    border-radius: 3px;
                }
                .mc-label {
                    padding-top: 20px;
                }
                .mc-label-label {
                    color: white;
                    font-size: 20px;
                    display: inline;
                }
                .mc-hint {
                    opacity: 0.5;
                    display: none;
                }
                #mc-example {
                    color: white;
                    background-color: rgba(0, 0, 0, 0.3);
                    white-space: pre;
                }
                </style>

                <h style="color: white;font-size: 30px;font-weight: bold;">Message Copier by Metalloriff</h>

                <div class="mc-label">
				    <p class="mc-label-label" style="padding-top: 15px;">Header format:</p>
                </div>

				<input data-var="headerFormat" value="` + this.settings.headerFormat + `" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">

                <h5 style="padding-top:30px;">Header variables:<br><br>
                $channel - The name of the selected channel<br>
                $selectionstarttime - The timestamp of the first selected message<br>
                $selectionendtime - The timestamp of the last selected message<br>
                $selectiondate - The date of the selected messages<br>
                $newline - New line<br>
                $tab - Tab</h5>

                <div class="mc-label">
				    <p class="mc-label-label" style="padding-top: 15px;">Message group format:</p>
                </div>

				<input data-var="groupFormat" value="` + this.settings.groupFormat + `" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">

                <h5 style="padding-top:30px;">Message group variables:<br><br>
                $time - Message group timestamp<br>
                $username - Message group sender's username<br>
                $usertag - Message group sender's username and discriminator<br>
                $message - Formatted message<br>
                $newline - New line<br>
                $tab - Tab</h5>

                <div class="mc-label">
				    <p class="mc-label-label" style="padding-top: 15px;">Message format:</p>
                </div>

				<input data-var="messageFormat" value="` + this.settings.messageFormat + `" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">

                <h5 style="padding-top:30px;">Message variables:<br><br>
                $time - Message timestamp<br>
                $messagetext - Message text<br>
                $newline - New line<br>
                $tab - Tab</h5>

                <div class="mc-label">
				    <p class="mc-label-label" style="padding-top: 15px;">Attachment format:</p>
                </div>

				<input data-var="attachmentFormat" value="` + this.settings.attachmentFormat + `" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">

                <h5 style="padding-top:30px;">Attachment variables:<br><br>
                $filename - Name of the uploaded file<br>
                $fileurl - URL of the uploaded file<br>
                $newline - New line<br>
                $tab - Tab</h5>

                <div class="mc-label">
				    <p class="mc-label-label" style="padding-top: 15px;">Reaction format:</p>
                </div>

				<input data-var="reactionFormat" value="` + this.settings.reactionFormat + `" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">

                <h5 style="padding-top:30px;">Reaction variables:<br><br>
                $emoji - Reaction's emoji<br>
                $count - Reaction count<br>
                $newline - New line<br>
                $tab - Tab</h5>

                <div class="mc-label">
				    <p class="mc-label-label" style="padding-top: 15px;">Selection color (R, G, B):</p>
                </div>

				<input data-var="selectionColor" value="` + this.settings.selectionColor + `" class="inputDefault-Y_U37D input-2YozMi size16-3IvaX_ multiInputField-3ZB4zY">

                <h5 style="padding-top:30px;">Reaction variables:<br><br>
                $emoji - Reaction's emoji<br>
                $count - Reaction count<br>
                $newline - New line<br>
                $tab - Tab</h5>

                <div class="mc-label">
				    <p class="mc-label-label" style="padding-top: 15px;">Preview:</p>
                </div>

                <div id="mc-example" style="padding-top:30px;" class="message-group hide-overflow">
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

            `);
            
            var fields = panel.find(".input-2YozMi"), updateExample = () => {
                var hints = panel.find("h5");
                hints.each(i => { hints[i].style.color = "rgb(" + this.settings.selectionColor + ")"; });

                fields.each(i => {
                    this.settings[$(fields[i]).data("var")] = fields[i].value;
                });

                var time = new Date().toLocaleTimeString("en-us"), example = document.getElementById("mc-example"), exampleMessages1 = new Array(), exampleMessages2 = new Array();
                ["Hello.", "These are some messages.", "This is a third message, with a reaction."].forEach(msg => exampleMessages1.push(this.settings.messageFormat
                    .split("$time").join(time)
                    .split("$messagetext").join(msg)));
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
                var msg =
                    (this.settings.headerFormat
                        .split("$channel").join("#general")
                        .split("$selectionstarttime").join(time)
                        .split("$selectionendtime").join(time)
                        .split("$selectiondate").join(new Date().toLocaleDateString("en-us"))
                + "\n" +
                    this.settings.groupFormat
                        .split("$time").join(time)
                        .split("$username").join("Metalloriff")
                        .split("$usertag").join("Metalloriff#2891")
                        .split("$message").join(exampleMessages1.join("\n"))
                + "\n" +
                    this.settings.groupFormat
                        .split("$time").join(time)
                        .split("$username").join("Some Kid Named Nate")
                        .split("$usertag").join("Some Kid Named Nate#0000")
                        .split("$message").join(exampleMessages2.join("\n")))
                .split("$newline").join("\n")
                .split("$tab").join("    ");
                example.innerText = msg;
            };
            updateExample();

            fields.on("focusout", () => {
                updateExample();
                this.saveSettings();
            });
        }
    }

    saveSettings(){
        PluginUtilities.saveSettings("FormattableMessageCopier", this.settings);
    }
	
	constructor() {
        this.defaultSettings = {
            headerFormat : "messages in $channel since $selectionstarttime, until $selectionendtime, on $selectiondate$newline$newline",
            groupFormat : "[$time] $username:$newline$newline$message$newline$newline",
            messageFormat : "$tab$messagetext",
            attachmentFormat : "[$filename]: <$fileurl>",
            reactionFormat : " [ $emoji : $count ] ",
            selectionColor : "145, 110, 215"
        };
        this.settings;
        this.selection = new Array();
        this.userModule;
	}
	
    getName() { return "Formattable Message Copier"; }
    getDescription() { return "Allows you to select messages in a chat to copy them in a customizable format. Double click the top of a message group to select it, then shift click to the next point to append all message groups between, or ctrl click another message group to append a single group."; }
    getVersion() { return "0.0.1"; }
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
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), "https://github.com/Metalloriff/BetterDiscordPlugins/raw/master/FormattableMessageCopier.plugin.js");
        this.userModule = InternalUtilities.WebpackModules.findByUniqueProperties(["getUser"]);
        this.settings = PluginUtilities.loadSettings("FormattableMessageCopier", this.defaultSettings);
        this.applyCSS();
        $(document).on("dblclick.FormattableMessageCopier", e => { this.onClick(e); });
        $(document).on("click.FormattableMessageCopier", e => { this.onClick(e); });
    }

    applyCSS(){
        BdApi.clearCSS("FormattableMessageCopier");
        BdApi.injectCSS("FormattableMessageCopier", `
            
            .mc-message-selected {
                margin-left: 0px !important;
                margin-right: 0px !important;
                padding-left: 20px !important;
                padding-right: 6px !important;
                border: 2px solid rgb(` + this.settings.selectionColor + `) !important;
                background-color: rgba(` + this.settings.selectionColor + `, 0.5) !important;
            }

            #mc-copy-button {
                background-color: rgb(` + this.settings.selectionColor + `) !important;
            }

        `);
    }
    
    onClick(e){
        if(!e.target.className && !e.target.className.includes("message-group") && e.target.className != "old-h2")
            return;
        var messageGroup = undefined;
        if(e.target.className.includes("message-group")){
            messageGroup = e.target;
        }else{
            var parentMessageGroup = $(e.target).parents(".message-group");
            if(parentMessageGroup.length){ messageGroup = parentMessageGroup[0]; }
        }
        if(messageGroup){
            if(e.type == "dblclick" || (e.type == "click" && e.ctrlKey)){
                messageGroup.classList.add("mc-message-selected");
                this.selection.push(messageGroup);
            }
            if(e.type == "click" && !e.ctrlKey && !e.shiftKey){ this.clearSelection(); }
            if(e.type == "click" && e.shiftKey && this.selection.length > 0 && messageGroup != this.selection[0]){
                if(document.selection){ document.selection.empty(); }else if(window.getSelection){ window.getSelection().removeAllRanges(); }
                var messages = $(".message-group"), selecting = false, newSelection = new Array(),
                select = i => {
                    if(messages[i] == this.selection[0]){ selecting = true; }
                    if(selecting){
                        newSelection.push(messages[i]);
                        messages[i].classList.add("mc-message-selected");
                    }
                    if(messages[i] == messageGroup){ selecting = false; }
                },
                selectReverse = i => {
                    if(messages[i] == messageGroup){ selecting = true; }
                    if(selecting){
                        newSelection.push(messages[i]);
                        messages[i].classList.add("mc-message-selected");
                    }
                    if(messages[i] == this.selection[0]){ selecting = false; }
                };

                if(this.selection.length > 1){
                    this.selection.forEach(g => { g.classList.remove("mc-message-selected"); });
                    this.selection.splice(1, this.selection.length);
                }
                messages.each(select);
                if(selecting){
                    selecting = false;
                    newSelection = new Array();
                    messages.each(i => { messages[i].classList.remove("mc-message-selected"); });
                    messages.each(selectReverse);
                }
                this.selection = newSelection;
            }
        }
        $("#mc-copy-button").remove();
        if(this.selection.length > 0){
            $(this.selection[this.selection.length - 1]).append(`<button id="mc-copy-button" style="display: inline-block; margin-right: 25px;" type="button" class="button-2t3of8 lookFilled-luDKDo colorBrand-3PmwCE sizeMedium-2VGNaF grow-25YQ8u"><div class="contents-4L4hQM">Copy Selection</div></button>`);
            $("#mc-copy-button").on("click", () => { this.copySelection(); });
        }
    }

    clearSelection(){
        this.selection.forEach(g => { g.classList.remove("mc-message-selected"); });
        this.selection = new Array();
        $("#mc-copy-button").remove();
    }

    copySelection(){
        var formatted = new Array(),
            firstMessage = ReactUtilities.getOwnerInstance(this.selection[0]).props,
            lastGroup = ReactUtilities.getOwnerInstance(this.selection[this.selection.length - 1]).props.messages,
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

        this.selection.forEach(item => {
            var props = ReactUtilities.getOwnerInstance(item).props,
                time = props.messages[0].timestamp.toDate().toLocaleTimeString("en-us"),
                messages = new Array();
            props.messages.forEach(message => {
                message.mentions.forEach(mention => { message.content = message.content.replace("<@" + mention + ">", "`@" + this.userModule.getUser(mention).tag + "`"); });
                var content = this.settings.messageFormat
                    .split("$time").join(message.timestamp.toDate().toLocaleTimeString("en-us"))
                    .split("$newline").join("\n")
                    .split("$tab").join("\t")
                    .split("$messagetext").join(message.content);
                var reactions = new Array();
                if(content != ""){ messages.push(content); }
                message.attachments.forEach(attachment => {
                    messages.push(this.settings.attachmentFormat
                        .split("$filename").join(attachment.filename)
                        .split("$fileurl").join(attachment.url)
                        .split("$newline").join("\n")
                        .split("$tab").join("\t")
                    );
                });
                message.reactions.forEach(reaction => {
                    reactions.push(this.settings.reactionFormat
                        .split("$emoji").join(reaction.emoji.name)
                        .split("$count").join(reaction.count)
                        .split("$newline").join("\n")
                        .split("$tab").join("\t")
                    );
                });
                if(reactions.length > 0){ messages.push(reactions.join("")); }
            });
            formatted.push(this.settings.groupFormat
                .split("$time").join(time)
                .split("$username").join(props.messages[0].author.username)
                .split("$usertag").join(props.messages[0].author.tag)
                .split("$message").join(messages.join("\n"))
                .split("$newline").join("\n")
                .split("$tab").join("\t")
            );
        });
        
        this.clearSelection();
		document.body.insertAdjacentHTML("beforeend", "<textarea class=\"temp-clipboard-data\" width=\"0\">" + formatted.join("\n") + "</textarea>");
		document.querySelector(".temp-clipboard-data").select();
		var success = document.execCommand("copy");
		document.getElementsByClassName("temp-clipboard-data")[0].outerHTML = "";
    }
	
    stop() {
        $(document).off("dblclick.FormattableMessageCopier");
        $(document).off("click.FormattableMessageCopier");
        BdApi.clearCSS("FormattableMessageCopier");
    }
	
}