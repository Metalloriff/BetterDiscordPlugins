var Metalloriff = {};

Metalloriff.Changelog = {};

Metalloriff.Changelog.compareVersions = function(name, changes) {

    var spacelessName = name.split(" ").join(""),
    updateData = PluginUtilities.loadData("MetalloriffUpdateData", spacelessName, {}),
    unreadChanges = [],
    thisUpdateData = updateData[spacelessName],
    first = false;

    if(thisUpdateData != undefined){

        if(thisUpdateData.readChanges == undefined) thisUpdateData.readChanges = [];

        for(var i in changes){
            
            if(!thisUpdateData.readChanges.includes(i)){

                unreadChanges.push(i);
                thisUpdateData.readChanges.push(i);

            }

        }

    }else{

        updateData[spacelessName] = { readChanges : Object.keys(changes) }; 
        first = true;

    }

    if(unreadChanges.length > 0 || first){ Metalloriff.Changelog.createChangeWindow(name, unreadChanges, changes, updateData); }

};

Metalloriff.Changelog.createChangeWindow = function(name, changes, allChanges, newUpdateData) {

    let changeKeys = Object.keys(allChanges);

    if(changeKeys.length == 0) {
        PluginUtilities.showToast("There are no updates notes for this plugin yet!", { type : "error" });
        return;
    }

    let spacelessName = name.split(" ").join("");

    $("#" + spacelessName + "-changelog").remove();

    $(".app").last().append(`

        <div id="${spacelessName}-changelog">

        <style>

        .metalloriff-update-item {
            padding: 10px;
        }

        .metalloriff-update-label {
            color: white;
            font-size: 35px;
        }
        
        .metalloriff-update-note {
            color: white;
            font-size: 25px;
            opacity: 0.75;
            line-height: 25px;
        }

        .metalloriff-changelog-backdrop {
            opacity: 0.85;
            background-color: black;
            z-index: 1000;
            position: fixed;
            contain: strict;
            bottom: 0;
            left: 0;
            top: 0;
            right: 0;
        }

        .metalloriff-changelog-scroller {
            width: 800px;
            min-height: 800px;
            max-height: 800px;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            overflow-y: scroll;
            background: #2f3136;
            border-radius: 5px;
            z-index: 10000;
        }

		#${spacelessName}-changelog *::-webkit-scrollbar {
			max-width: 10px;
		}
		
		#${spacelessName}-changelog *::-webkit-scrollbar-track-piece {
			background: transparent;
			border: none;
			border-radius: 5px;
		}
		
		#${spacelessName}-changelog *:hover::-webkit-scrollbar-track-piece {
			background: #2F3136;
			border-radius: 5px;
		}
		
		#${spacelessName}-changelog *::-webkit-scrollbar-thumb {
			background: #1E2124;
			border: none;
			border-radius: 5px;
		}
		
		#${spacelessName}-changelog *::-webkit-scrollbar-button {
			display: none;
		}

        .metalloriff-changelog-label {
            flex: 1 1 auto;
            text-align: center;
            color: white;
            padding-top: 10px;
            font-size: 20px;
        }

        </style>

        <div class="metalloriff-changelog-backdrop"></div>
            <div class="metalloriff-changelog-scroller">
                <div class="metalloriff-changelog-label">
                    <h2>${name} Update Notes</h2>
                    <br>
                </div>
                <div id="${spacelessName}-changelog-scroller"></div>
            </div>
        </div>

        </div>

    `);

    $(".metalloriff-changelog-backdrop").on("click", () => {
        if(newUpdateData != undefined){ PluginUtilities.saveData("MetalloriffUpdateData", spacelessName, newUpdateData); }
        $(".metalloriff-changelog-backdrop").parent().remove();
    });

    let scroller = $("#" + spacelessName + "-changelog-scroller");

    if(changes.length == 0) changes = changeKeys;

    changes.reverse();

    for(let i in changes){
        scroller.append(`
        <div class="metalloriff-update-item">
            <p class="metalloriff-update-label">` + changes[i] + `</p><p class="metalloriff-update-note">`
                + allChanges[changes[i]].split("\n").join("<br><br>") +
            `</p>
        </div>
        `);
    }

};

Metalloriff.Settings = {};

Metalloriff.Settings.Styles = {};

Metalloriff.Settings.Styles.textField = `color: white; background-color: rgba(0, 0, 0, 0.2); border: none; border-radius: 5px; height: 40px; padding: 10px; width: 100%;`;

Metalloriff.Settings.Elements = {};

Metalloriff.Settings.Elements.pluginNameLabel = function(name) {
    return `
        <style>
            #bd-settingspane-container *::-webkit-scrollbar {
                max-width: 10px;
            }
            
            #bd-settingspane-container *::-webkit-scrollbar-track-piece {
                background: transparent;
                border: none;
                border-radius: 5px;
            }
            
            #bd-settingspane-container *:hover::-webkit-scrollbar-track-piece {
                background: #2F3136;
                border-radius: 5px;
            }
            
            #bd-settingspane-container *::-webkit-scrollbar-thumb {
                background: #1E2124;
                border: none;
                border-radius: 5px;
            }
            
            #bd-settingspane-container *::-webkit-scrollbar-button {
                display: none;
            }
        </style>
        <h style="color: white;font-size: 30px;font-weight: bold;">${name} by Metalloriff</h>`;
}

Metalloriff.Settings.Elements.createRadioGroup = function(id, label, choices, selectedChoice, callback, description = "") {

    var element = document.createElement("div");

    element.style.paddingTop = "20px";

    element.innerHTML = `
    <h5 style="color:white;padding-bottom:10px;">${label}</h5>
    <h5 style="Color:white;padding-bottom:10px;opacity:0.5;">${description}<h5>
    <div id="${id}" style="color:white;"></div>`;

    for(var i = 0; i < choices.length; i++) {

        if(choices[i].description == undefined) choices[i].description = "";

        var choiceButton = document.createElement("div");

        choiceButton.setAttribute("id", `${id}-${i}`);
        choiceButton.setAttribute("data-value", choices[i].value);
        choiceButton.setAttribute("data-index", i);
        choiceButton.setAttribute("class", "metalloriff-checkbox-item");
        choiceButton.setAttribute("style", `padding:10px;border-radius:5px !important;background-color:rgba(0, 0, 0, 0.3);cursor:pointer;position:relative;margin-bottom:10px;display:flex;`);

        choiceButton.innerHTML = 
        `<label>
            <div style="width:24px;height:24px;border:3px solid white;border-radius:100%;"></div>
        </label>
        <div style="margin: 0 8px;color:white;">
            <div style="display:inline;padding-right:10px;line-height:24px;">${choices[i].title}</div>
            <div style="display:inline;line-height:24px;opacity:0.5;">${choices[i].description}</div>
        </div>`;

        element.insertAdjacentElement("beforeend", choiceButton);

        if(selectedChoice != undefined && choices[i].value == selectedChoice) choiceButton.querySelector(`label > div`).style.backgroundColor = "white";

        choiceButton.addEventListener("click", e => {

            var i = e.currentTarget.getAttribute("data-index");

            var checkboxes = $(e.currentTarget.parentElement).find(`.metalloriff-checkbox-item > label > div`);

            for(var ii = 0; ii < checkboxes.length; ii++) { checkboxes[ii].style.backgroundColor = ""; }

            element.querySelector(`#${id}-${i} > label > div`).style.backgroundColor = "white";

            callback(choiceButton, choices[i]);

        });

    }

    return element;

};

Metalloriff.Settings.Elements.createToggleGroup = function(id, label, choices, callback, description = "") {

    let element = document.createElement("div");

    element.style.paddingTop = "20px";

    element.insertAdjacentHTML("beforeend", `
        <h5 style="color:white;padding-bottom:10px;">${label}</h5>
        <h5 style="Color:white;padding-bottom:10px;opacity:0.5;">${description}<h5>
        <div id="${id}" style="color:white;"></div>
    `);

    for(let i = 0; i < choices.length; i++) {

        let choiceButton = Metalloriff.Settings.Elements.createToggleSwitch(choices[i].title, choices[i].setValue, e => {
            callback(choices[i], e);
        });

        choiceButton.setAttribute("id", `${id}-${i}`);
        choiceButton.setAttribute("data-value", choices[i].value);
        choiceButton.setAttribute("data-index", i);

        element.insertAdjacentElement("beforeend", choiceButton);

    }

    return element;

};

Metalloriff.Settings.Elements.createTextField = function(label, type, value, callback, options = {}) {

    let element = document.createElement("div");

    element.style.paddingTop = options.spacing || "20px";

    element.insertAdjacentHTML("beforeend", `
        <p style="color:white;font-size:20px;">${label}</p>
        <input value="${value}" type="${type}" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5">
    `);

    if(options.tooltip) new PluginTooltip.Tooltip($(element), options.tooltip, { side : "left" });

    element.querySelector("input").addEventListener(options.callbackType || "focusout", e => callback(e));

    return element;

};

Metalloriff.Settings.Elements.createNewTextField = function(label, value, callback, options = {}) {

    let element = document.createElement("div");

    element.style.paddingTop = options.spacing || "20px";

    element.insertAdjacentHTML("beforeend", `
        <style>
            .neato-text-field-p {
                color: white;
                font-size: 20px;
            }
        </style>
        <p class="neato-text-field-p">${label}</p>
        <p class="neato-text-field-p" style="opacity:0.5;font-size:17px;">${options.description || ""}</p>
        <input value="${value}" type="${options.type || "text"}" style="${Metalloriff.Settings.Styles.textField}">
    `);

    element.querySelector("input").addEventListener(options.callbackType || "focusout", e => callback(e));

    return element;

};

Metalloriff.Settings.Elements.createHint = function(text, options = {}) {

    let element = document.createElement("p");

    element.style.color = options.color || "white";
    element.style.fontSize = options.fontSize || "17px";

    element.innerText = text;

    return element;

};

Metalloriff.Settings.Elements.createButton = function(label, callback, style = "", attributes = {}) {
    
    let element = document.createElement("button");

    element.setAttribute("style", `display:inline-block;${style}`);
    element.setAttribute("class", "button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN");

    for(let key in attributes) element.setAttribute(key, attributes[key]);

    element.innerText = label;

    element.addEventListener("click", e => callback(e));
    
    return element;

};

Metalloriff.Settings.Elements.createToggleSwitch = function(label, value, callback, spacing = "20px") {

    var element = document.createElement("div");

    element.style.paddingTop = spacing;

    element.innerHTML = 
    `<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStart-H-X2h- noWrap-3jynv6" style="flex: 1 1 auto;">
        <h3 class="titleDefault-a8-ZSr title-31JmR4 marginReset-236NPn weightMedium-2iZe9B size16-14cGz5 height24-3XzeJx flexChild-faoVW3" style="flex: 1 1 auto;">${label}</h3>
        <div class="flexChild-faoVW3 switchEnabled-V2WDBB switch-3wwwcV ${value == true ? "valueChecked-m-4IJZ" : "valueUnchecked-2lU_20"} value-2hFrkk sizeDefault-2YlOZr size-3rFEHg themeDefault-24hCdX" style="flex: 0 0 auto;">
            <input class="checkboxEnabled-CtinEn checkbox-2tyjJg" type="checkbox">
        </div>
    </div>`;

    element.querySelector("input").addEventListener("click", e => {

        var b = e.currentTarget.parentElement;

        if(b.classList.contains("valueChecked-m-4IJZ")) {
            b.classList.add("valueUnchecked-2lU_20");
            b.classList.remove("valueChecked-m-4IJZ");
        } else {
            b.classList.add("valueChecked-m-4IJZ");
            b.classList.remove("valueUnchecked-2lU_20");
        }

        callback(e);

    });

    return element;

};

Metalloriff.Settings.Elements.createLabel = function(title, spacing = "20px", style = "") {

    return `<div style="color:white;margin: ${spacing} 0px;${style}">${title}</div>`;

};

Metalloriff.Settings.Elements.createGroup = function(title, options = {}) {

    let element = document.createElement("div");

    element.setAttribute("style", `color:white;margin:${options.spacing || "20px"};${options.style || ""}`);

    element.insertAdjacentHTML("beforeend", `<div style="margin: ${options.spacing || "20px"} 0px;">${title}</div><div></div>`);

    return element;

};

Metalloriff.Settings.pushChangelogElements = function(plugin) {

    var element = document.createElement("div");

    element.style.padding = "15px";
    element.style.margin = "15px";
    element.style.backgroundColor = "rgba(0,0,0,0.2)";
    element.style.borderRadius = "5px";

    element.insertAdjacentHTML("beforeend", `<div style="text-align:center;color:white;">Changelog</div>`);

    element.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createToggleSwitch("Display changes for every update", plugin.settings.displayUpdateNotes, () => {
        plugin.settings.displayUpdateNotes = !plugin.settings.displayUpdateNotes;
        plugin.saveSettings();
    }));

    var right = document.createElement("div");

    right.style.textAlign = "right";

    right.style.paddingTop = "20px";

    right.insertAdjacentElement("beforeend", Metalloriff.Settings.Elements.createButton("View Changelog", () => {
        Metalloriff.Changelog.createChangeWindow(plugin.getName(), [], plugin.getChanges());
    }));

    element.insertAdjacentElement("beforeend", right);

    Metalloriff.Settings.pushElement(element, plugin.getName());

};

Metalloriff.Settings.pushElement = function(element, name) { document.getElementById(`plugin-settings-${name}`).insertAdjacentElement("beforeend", element); };
Metalloriff.Settings.pushHTML = function(html, name) { document.getElementById(`plugin-settings-${name}`).insertAdjacentHTML("beforeend", html); }

Metalloriff.Settings.showPluginSettings = function(name) {

    document.querySelector(".button-2b6hmh:nth-child(3)").click();

    setTimeout(() => {

        var bdActions = document.querySelectorAll("#bd-settings-sidebar .ui-tab-bar-item");

        for(var i = 0; i < bdActions.length; i++) { if(bdActions[i].textContent == "Plugins") bdActions[i].click(); }

        setTimeout(() => {

            var settingsBox = document.querySelector(`li[data-name="${name}"]`), settingsButton = settingsBox.getElementsByClassName("bda-settings-button")[0];

            settingsBox.scrollIntoView();

            if(settingsButton != undefined) settingsButton.click();

        }, 100);

    }, 100);

};

Metalloriff.UI = {};

Metalloriff.UI.createPrompt = function(id, title, description, yesCallback, noCallback = "close", options = {}) {

    document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `
    
    <div id="neato-prompt-${id}" style="z-index:10000;">
        <div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>
        <div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);">
            <div class="inner-1JeGVc">
                <div class="modal-3HD5ck sizeSmall-Sf4iOi">
                    <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF" style="flex: 0 0 auto;">
                        <h4 class="h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">${title}</h4>
                    </div>
                    <div class="scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d">
                        <div class="scroller-2FKFPG inner-3wn6Q5">
                            <div class="card-1SJYqw marginBottom20-32qID7 card-3Qj_Yx" style="background-color:${options.color || "transparent"};border:none;">
                                <div class="medium-zmzTW- size16-14cGz5 height20-mO2eIN white-2qwKC7">${description}</div>
                            </div>
                        </div>
                    </div>
                    <div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 footer-2yfCgX" style="flex: 0 0 auto;"><button type="submit" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN prompt-yes"><div class="contents-18-Yxp">${options.yesText || "Yes"}</div></button><button type="button" class="button-38aScr lookLink-9FtZy- colorPrimary-3b3xI6 sizeMedium-1AC_Sl grow-q77ONN prompt-no"><div class="contents-18-Yxp">${options.noText || "No"}</div></button></div>
                </div>
            </div>
        </div>
    </div>
    
    `);

    let prompt = document.getElementById("neato-prompt-" + id),
    backdrop = prompt.getElementsByClassName("backdrop-1ocfXc")[0],
    yesButton = prompt.getElementsByClassName("prompt-yes")[0],
    noButton = prompt.getElementsByClassName("prompt-no")[0];

    prompt.close = () => prompt.outerHTML = "";

    backdrop.addEventListener("click", () => prompt.close());

    yesButton.addEventListener("click", () => yesCallback(prompt));
    noButton.addEventListener("click", noCallback == "close" ? () => prompt.close() : () => noCallback(prompt));

    prompt.addEventListener("keydown", e => {
       if(e.key == "Escape") prompt.close();
       if(e.key == "Enter") yesButton.click();
    });

    return prompt;

};

Metalloriff.UI.createTextPrompt = function(id, title, callback, value = "", options = {}) {

    document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `
			
    <div id="neato-text-prompt-${id}" style="z-index:10000;">
        <div class="backdrop-1ocfXc" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>
        <div class="modal-1UGdnR" style="opacity: 1; transform: scale(1) translateZ(0px);">
            <div class="inner-1JeGVc">
                <div class="modal-3HD5ck sizeSmall-Sf4iOi">
                    <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF" style="flex: 0 0 auto;">
                        <h4 class="h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">${title}</h4>
                    </div>
                    <div class="content-2BXhLs">
                        <div class="inner-3wn6Q5" style="flex:1;-webkit-box-flex:1;padding-right:20px;">
                            <div class="input-2JOcvO marginBottom8-AtZOdT">
                                <h5 class="h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi defaultMarginh5-2mL-bP marginBottom8-AtZOdT">${options.description || ""}</h5>
                                <div class="inputWrapper-31_8H8 vertical-V37hAW flex-1O1GKY directionColumn-35P_nr"><input placeholder="${options.placeholder || ""}" value="${value.split("\"").join("&quot;")}" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5" type="text"></div>
                            </div>
                            <div class="reset-2ikQ30 marginBottom20-32qID7 small-29zrCQ size12-3R0845 height16-2Lv3qA primary-jw0I4K weightSemiBold-NJexzi prompt-second-option">${options.secondOptionText || ""}</div>
                        </div>
                    </div>
                    <div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 footer-2yfCgX" style="flex: 0 0 auto;"><button class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN prompt-confirm"><div class="contents-18-Yxp">${options.confirmText || "Save"}</div></button><button type="button" class="button-38aScr lookLink-9FtZy- colorPrimary-3b3xI6 sizeMedium-1AC_Sl grow-q77ONN prompt-cancel"><div class="contents-18-Yxp">Cancel</div></button></div>
                </div>
            </div>
        </div>
    </div>

    `);
    
    let prompt = document.getElementById("neato-text-prompt-" + id),
    backdrop = prompt.getElementsByClassName("backdrop-1ocfXc")[0],
    confirmButton = prompt.getElementsByClassName("prompt-confirm")[0],
    cancelButton = prompt.getElementsByClassName("prompt-cancel")[0],
    secondOption = prompt.getElementsByClassName("prompt-second-option")[0],
    field = prompt.getElementsByTagName("input")[0];

    field.focus();
    field.selectionStart = field.selectionEnd = field.value.length;

    prompt.close = () => prompt.outerHTML = "";

    backdrop.addEventListener("click", () => prompt.close());

    confirmButton.addEventListener("click", () => callback(field.value, prompt));
    cancelButton.addEventListener("click", () => prompt.close());

    if(options.secondOptionCallback != undefined) secondOption.addEventListener("click", () => options.secondOptionCallback(prompt));

    prompt.addEventListener("keydown", e => {
       if(e.key == "Escape") prompt.close();
       if(e.key == "Enter") confirmButton.click();
    });

    return prompt;

};

Metalloriff.UI.createBasicScrollList = function(id, title, options = {}) {

    document.getElementsByClassName("app")[0].insertAdjacentHTML("beforeend", `
    
    <div id="${id}">

    <style>

        ${options.style || ""}

        .${id}-item {
            padding: 10px;
        }

        .${id}-backdrop {
            opacity: 0.85;
            background-color: black;
            z-index: 1000;
            position: fixed;
            contain: strict;
            bottom: 0;
            left: 0;
            top: 0;
            right: 0;
        }

        .${id}-scroller-wrapper {
            width: ${options.width || 800}px;
            min-height: ${options.height || 800}px;
            max-height: ${options.height || 800}px;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #2f3136;
            border-radius: 5px;
            z-index: 10000;
		}

		.${id}-scroller {
			width: 100%;
			max-height: ${(options.height || 800) - 30}px;
			overflow-y: scroll;
			overflow-x: hidden;
		}

		#${id} *::-webkit-scrollbar {
			max-width: 10px;
		}
		
		#${id} *::-webkit-scrollbar-track-piece {
			background: transparent;
			border: none;
			border-radius: 5px;
		}
		
		#${id} *:hover::-webkit-scrollbar-track-piece {
			background: #2F3136;
			border-radius: 5px;
		}
		
		#${id} *::-webkit-scrollbar-thumb {
			background: #1E2124;
			border: none;
			border-radius: 5px;
		}
		
		#${id} *::-webkit-scrollbar-button {
			display: none;
		}

        .${id}-label {
            color: white;
            font-size: 35px;
            flex: 1 1 auto;
            text-align: center;
            padding-top: 10px;
            font-size: 20px;
		}

		.${id}-label span {
			vertical-align: middle;
			marign-left: 10px;
		}

		.${id}-scroller > :last-child {
			margin-bottom: 10px;
        }
        
    </style>

    <div class="${id}-backdrop"></div>
        <div class="${id}-scroller-wrapper">
            <div class="${id}-label">
                <h2>${title}</h2>
            </div>
            <div class="${id}-scroller"></div>
        </div>
    </div>

    </div>

    `);

    let window = document.getElementById(id), scroller = window.getElementsByClassName(`${id}-scroller`)[0], backdrop = window.getElementsByClassName(`${id}-backdrop`)[0];

    backdrop.addEventListener("click", () => window.outerHTML = "");
    window.addEventListener("keydown", e => { if(key == "Escape") backdrop.click(); });

    return { window : window, scroller : scroller, backdrop : backdrop };

};

Metalloriff.ContextMenu = {};

Metalloriff.ContextMenu.close = function() {
    document.getElementsByClassName(InternalUtilities.WebpackModules.findByUniqueProperties(["contextMenu"]).contextMenu)[0].style.display = "none";
};

Metalloriff.Chatbox = {};

Metalloriff.Chatbox.get = function() {
    let chat = document.getElementsByClassName("chat")[0];
    return chat ? chat.getElementsByTagName("textarea")[0] : null;
};

Metalloriff.Chatbox.setText = function(newText) {
    Metalloriff.Chatbox.get().select();
    document.execCommand("insertText", false, newText);
};

Metalloriff.Debug = {};

Metalloriff.Debug.reloadLib = function() {

    setTimeout(() => {

        let lib = document.createElement("script");

        lib.setAttribute("id", "NeatoBurritoLibrary");
        lib.setAttribute("type", "text/javascript");
        lib.setAttribute("src", "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js");

        document.head.appendChild(lib);

    }, 100);

    document.getElementById("NeatoBurritoLibrary").outerHTML = "";

};

Metalloriff.downloadFile = function(url, path, fileName, onCompleted) {

    let fileSys = require("fs"), http = require("https");

    if(!path.endsWith("/")) path += "/";

    path += fileName;

    if(path.lastIndexOf("?") != -1) path = path.substring(0, path.lastIndexOf("?"));

    PluginUtilities.showToast("Download started...");

    if(fileSys.existsSync(path)) {

        PluginUtilities.showToast("File already exists, random characters will be appended to the file name!", { type : "error" });

        let fileExtension = path.substring(path.lastIndexOf("."), path.length);

        path = path.split(fileExtension).join(` ${Math.random().toString(36).substring(10)}${fileExtension}`);

    }

    let request = http.request(url, x => {

        let data = [];

        x.on("data", d => { data.push(d); });

        x.on("end", () => {

            fileSys.writeFile(path, Buffer.concat(data), error => {
                if(error) PluginUtilities.showToast("Failed to save file! Error: " + error.message, { type : "error" });
                else PluginUtilities.showToast("File saved successfully!", { type : "success" });
            });

            if(onCompleted != undefined) onCompleted(path);

        });

    });

    request.on("error", error => { PluginUtilities.showToast("Failed to save file! Error: " + error.message, { type : "error" }); });

    request.end();

};

Metalloriff.requestFile = function(url, name = "unknown.png", onCompleted) {

    var http = require(url.split("://")[0]);

    var request = http.request(url, x => {

        var data = [];

        x.on("data", d => { data.push(d); });

        x.on("end", () => {

            if(onCompleted != undefined) onCompleted(new File([Buffer.concat(data)], name));

        });

    });

    request.on("error", error => { PluginUtilities.showToast("Failed to request file! Error: " + error.message, { type : "error" }); });

    request.end();

};

Metalloriff.getClasses = function(classes, returnAll = true) {

    var found = {};

    for(var i = 0; i < classes.length; i++) {

        var module = InternalUtilities.WebpackModules.findByUniqueProperties([classes[i]]);

        if(module != undefined) {

            for(var ii in module) {

                if(!returnAll && classes[i] != ii) continue;

                found[ii] = module[ii];

            }

        }

    }

    return found;

};

Metalloriff.getSelectedChannel = function() {

    return InternalUtilities.WebpackModules.findByUniqueProperties(["getChannel"]).getChannel(InternalUtilities.WebpackModules.findByUniqueProperties(["getChannelId"]).getChannelId());

};

Metalloriff.getSelectedVoiceChannel = function() {

    return InternalUtilities.WebpackModules.findByUniqueProperties(["getChannel"]).getChannel(InternalUtilities.WebpackModules.findByUniqueProperties(["getVoiceChannelId"]).getVoiceChannelId());

};

Metalloriff.patchInternalFunction = function(functionName, newFunction, pluginName, replace = false) {

    let module = InternalUtilities.WebpackModules.findByUniqueProperties([functionName]);

    if(module == undefined) {

        console.log("There are no modules that contain this function!");

        return;

    }

    module[functionName + "_unpatched_" + pluginName] = module[functionName];
    
    module[functionName] = replace ? newFunction : function() {
        newFunction.apply(module, arguments);
        return module[functionName + "_unpatched_" + pluginName].apply(module, arguments);
    };

};

Metalloriff.unpatchInternalFunction = function(functionName, pluginName) {

    let module = InternalUtilities.WebpackModules.findByUniqueProperties([functionName]);

    if(module == undefined) {

        console.log("There are no modules that contain this function!");

        return;

    }

    if(module[functionName + "_unpatched_" + pluginName] == undefined) {

        console.log("This function is not patched!");

        return;

    }

    module[functionName] = module[functionName + "_unpatched_" + pluginName];
    delete module[functionName + "_unpatched_" + pluginName];

};

Metalloriff.internalFunctionIsPatched = function(functionName, pluginName) {

    let module = InternalUtilities.WebpackModules.findByUniqueProperties([functionName]);

    if(module == undefined) {

        console.log("There are no modules that contain this function!");

        return;

    }

    return module[functionName + "_unpatched_" + pluginName] != undefined;

};

Metalloriff.patchInternalFunctions = function(functionNames, newFunction, pluginName, replace = false) {
    for(let i = 0; i < functionNames.length; i++) Metalloriff.patchInternalFunction(functionNames[i], newFunction, pluginName, replace);
};

Metalloriff.unpatchInternalFunctions = function(functionNames, pluginName) {
    for(let i = 0; i < functionNames.length; i++) Metalloriff.unpatchInternalFunction(functionNames[i], pluginName);
};

Metalloriff.getModuleById = function(id) {
    return InternalUtilities.WebpackModules.find(x => x._dispatchToken == "ID_" + id);
};

Metalloriff.getLocalStatus = function() {
    let className = document.getElementsByClassName("container-2Thooq")[0].getElementsByClassName("status")[0].className;
    return className.substring(className.indexOf("-") + 1, className.length);
};

Metalloriff.browseForFile = function(callback, options = {}) {

    let fileBrowser = document.createElement("input");

    fileBrowser.type = "file";
    fileBrowser.style.display = "none";

    if(options.directory == true) {
        fileBrowser.setAttribute("webkitdirectory", true);
        fileBrowser.setAttribute("directory", true);
    }

    if(options.multiple == true) fileBrowser.setAttribute("multiple", true);

    document.head.appendChild(fileBrowser);

    fileBrowser.click();

    fileBrowser.addEventListener("change", () => {

        callback(options.multiple == true ? fileBrowser.files : fileBrowser.files[0]);

        fileBrowser.outerHTML = "";

    });

};

Metalloriff.shuffleArray = function(array) {

    let idx = array.length, temp, random;

    while(idx != 0) {
        random = Math.floor(Math.random() * idx);
        idx--;
        temp = array[idx];
        array[idx] = array[random];
        array[random] = temp;
    }

    return array;

};
