var NeatoLib = {

	version: "0.9.29",

	parseVersion: function(version) {

		let numbers = Array.from(version.split("."), n => parseInt(n)),
			major = numbers[0],
			minor = numbers[1],
			patch = numbers[2];

		return {
			major: major,
			minor: minor,
			patch: patch,
			compareTo: otherVersion => {
				if (patch > otherVersion.patch || minor > otherVersion.minor || major > otherVersion.major) return "newer";
				if (patch < otherVersion.patch || minor < otherVersion.minor || major < otherVersion.major) return "older";
				return "equal";
			}
		};

	},

	hasRequiredLibVersion: function(plugin, requiredVersion) {
		if (NeatoLib.parseVersion(NeatoLib.version).compareTo(NeatoLib.parseVersion(requiredVersion)) == "older") {
			if (plugin.ready) plugin.ready = false;

			const updateLibrary = () => {
				const vm = require("vm");

				fetch("https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js", { cache: "no-cache" }).then(r => r.text()).then(data => {
					let lib = new vm.Script(data, {
						filename: "NeatoBurritoLibrary.js",
						displayErrors: true
					});

					new Promise(exec => exec(lib.runInThisContext())).then(() => {
						NeatoLib.showToast(`[${plugin.getName()}]: Library updated!`, "success");
						setTimeout(() => plugin.start(), 1000);
					});
				});
			};

			NeatoLib.showToast(`[${plugin.getName()}]: Library update required! Click this notification to update it.`, "error", {
				timeout: 30000,
				onClick: updateLibrary,
				destroyOnClick: true
			});

			return false;
		}

		return true;
	},

	forceLibUpdate: function() {
		const vm = require("vm");

		fetch("https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/Lib/NeatoBurritoLibrary.js", { cache: "no-cache" }).then(r => r.text()).then(data => {
			const lib = new vm.Script(data, { filename: "NeatoBurritoLibrary.js", displayErrors: true });

			new Promise(e => e(lib.runInThisContext())).then(() => NeatoLib.showToast("Lib updated!", "success"));
		});
	},

	Changelog: {

		compareVersions: function(name, changes) {

			var spacelessName = name.split(" ").join(""),
				updateData = NeatoLib.Data.load("MetalloriffUpdateData", spacelessName, {}),
				unreadChanges = [],
				thisUpdateData = updateData[spacelessName],
				first = false;

			if (thisUpdateData != undefined) {

				if (thisUpdateData.readChanges == undefined) thisUpdateData.readChanges = [];

				for (var i in changes) {

					if (!thisUpdateData.readChanges.includes(i)) {

						unreadChanges.push(i);
						thisUpdateData.readChanges.push(i);

					}

				}

			} else {

				updateData[spacelessName] = {
					readChanges: Object.keys(changes)
				};
				first = true;

			}

			if (unreadChanges.length > 0 || first) {
				NeatoLib.Changelog.createChangeWindow(name, unreadChanges, changes, updateData);
			}

		},

		createChangeWindow: function(name, changes, allChanges, newUpdateData) {

			let changeKeys = Object.keys(allChanges);

			if (changeKeys.length == 0) {
				NeatoLib.showToast("There are no updates notes for this plugin yet!", "error");
				return;
			}

			let spacelessName = name.split(" ").join("");

			if (document.getElementById(spacelessName + "-changelog")) document.getElementById(spacelessName + "-changelog").remove();

			document.getElementsByClassName(NeatoLib.getClass("app"))[0].insertAdjacentHTML("beforeend", `

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

			document.getElementById(spacelessName + "-changelog").getElementsByClassName("metalloriff-changelog-backdrop")[0].addEventListener("click", () => {
				if (newUpdateData != undefined) NeatoLib.Data.save("MetalloriffUpdateData", spacelessName, newUpdateData);
				document.getElementById(spacelessName + "-changelog").remove();
			});

			let scroller = document.getElementById(spacelessName + "-changelog-scroller");

			if (changes.length == 0) changes = changeKeys;

			for (let i = 0; i < changes.length; i++) {
				scroller.insertAdjacentHTML("afterbegin", `
					<div class="metalloriff-update-item">
						<p class="metalloriff-update-label">` + changes[i] + `</p><p class="metalloriff-update-note">` +
					allChanges[changes[i]].split("\n").join("<br><br>") +
					`</p>
					</div>
				`);
			}

		}

	},

	Settings: {

		createPanel: function(plugin) {
			setTimeout(() => {
				this.create(plugin);
				this.pushChangelogElements(plugin);
			});

			return this.Elements.pluginNameLabel(plugin.getName());
		},

		create: function(plugin) {
			const panel = document.getElementById(`plugin-settings-${plugin.getName()}`), fields = plugin.settingFields;
			panel.classList.add("neato-settings");

			panel.insertAdjacentHTML("beforeEnd", `
				<style>
					.neato-setting-label {
						color: white;
						line-height: 24px;
						margin-left: 5px;
					}

					:not(.neato-setting-array-items) > .neato-setting {
						margin-top: 20px;
					}

					.neato-setting-array-items > .neato-setting {
						margin-top: 10px;
					}

					.neato-textfield {
						display: block;
						color: white;
						background-color: rgba(0, 0, 0, 0.2);
						border: none;
						border-radius: 5px;
						height: 40px;
						padding: 10px;
						width: 100%;
					}

					.neato-setting-array .neato-textfield {
						display: inline;
						transition: width 0.3s;
					}

					.neato-setting-array .neato-setting:hover .neato-textfield {
						width: calc(100% - 45px);
					}

					.neato-setting-array .neato-array-remove-button {
						width: 0;
						color: white;
						float: right;
						cursor: pointer;
						font-size: 40px;
						transition: width 0.3s;
					}

					.neato-setting-array .neato-setting:hover .neato-array-remove-button {
						width: 40px;
					}

					.neato-setting-array-buttons {
						margin-top: 10px;
						text-align: center;
					}

					.neato-radio-button {
						display: flex;
						background: rgba(0, 0, 0, 0.2);
						padding: 10px;
						border-radius: 5px;
						cursor: pointer;
						position: relative;
						margin: 10px;
						transition: all 0.3s;
						user-select: none;
					}

					.neato-radio-button .nrb-box {
						width: 24px;
						height: 24px;
						border: none;
						background: rgba(0, 0, 0, 0.5);
						border-radius: 100%;
						margin-right: 5px;
					}

					.neato-radio-button.nrb-selected {
						background: #7289da;
						box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.3);
					}

					.neato-radio-button.nrb-selected .nrb-box {
						background: white;
					}

					.neato-radio-button * {
						cursor: pointer;
					}

					.neato-settings [data-description]::after {
						content: attr(data-description);
						margin-left: 10px;
						opacity: 0.5;
					}
				</style>
			`);

			const createLabel = (title, description, tooltip) => {
				const element = document.createElement("label");
				element.className = "neato-setting-label";
				element.textContent = title;
				if(description) element.dataset.description = description || "";
				if(tooltip) NeatoLib.Tooltip.attach(tooltip, element);
				return element;
			};

			const createToggleSwitch = (title, description, tooltip, value, callback) => { //<input id="1" class="checkboxEnabled-CtinEn checkbox-2tyjJg da-checkboxEnabled da-checkbox" type="checkbox" tabindex="-1">
				const element = document.createElement("div");
				element.className = "neato-setting";
				if (title) element.appendChild(createLabel(title, description, tooltip));

				const tswitch = document.createElement("div");
				tswitch.className = [NeatoLib.getClass("flexChild"), NeatoLib.getClass("switchEnabled"), NeatoLib.getClass("switch"), value ? NeatoLib.getClass("valueChecked") : NeatoLib.getClass("valueUnchecked"), NeatoLib.getClass("value"), NeatoLib.getClass("sizeDefault"), NeatoLib.getClass("sizeDefault", "size"), NeatoLib.getClass("themeDefault")].join(" ");
				tswitch.style.float = "right";

				const tcheckbox = document.createElement("input");
				tcheckbox.type = "checkbox";
				tcheckbox.className = [NeatoLib.getClass("checkboxEnabled"), NeatoLib.getClass("checkboxEnabled", "checkbox")].join(" ");

				tswitch.appendChild(tcheckbox);
				tswitch.addEventListener("click", e => {
					value = !value;

					if (value == true) tswitch.className = tswitch.className.replace(NeatoLib.getClass("valueUnchecked"), NeatoLib.getClass("valueChecked"));
					else tswitch.className = tswitch.className.replace(NeatoLib.getClass("valueChecked"), NeatoLib.getClass("valueUnchecked"));

					callback(value, e);
				});

				element.appendChild(tswitch);

				return element;
			};

			const createTextField = (title, description, tooltip, value, type, callback) => {
				const element = document.createElement("div");
				element.className = "neato-setting";
				if (title) element.appendChild(createLabel(title, description, tooltip));

				const input = document.createElement("input");
				input.className = "neato-textfield";
				input.type = "text";
				input.value = value || "";

				let last = input.value;

				input.addEventListener("focusout", e => {
					switch (type) {
						case "number": case "float":
							if (!input.value) {
								callback(input.value = last = 0, e);
								break;
							}

							if (isNaN(input.value)) {
								NeatoLib.showToast("Value must be a number!", "error");
								input.value = last;
								break;
							}

							callback(last = parseFloat(input.value), e);
						break;

						case "whole number": case "int": case "integer":
							if (!input.value) {
								callback(input.value = last = 0, e);
								break;
							}

							if (isNaN(input.value)) {
								NeatoLib.showToast("Value must be a number!", "error");
								input.value = last;
								break;
							}

							callback(last = parseInt(input.value), e);
						break;

						default: callback(input.value, e);
					}
				});

				element.appendChild(input);

				return element;
			};

			const createRadioGroup = (title, description, tooltip, value, choices, callback) => {
				const element = document.createElement("div");
				element.className = "neato-setting";
				if (title) element.appendChild(createLabel(title, description, tooltip));

				const list = document.createElement("div");

				const update = () => {
					for (let choice of element.getElementsByClassName("neato-radio-button")) {
						if (choice.dataset.key == value) choice.classList.add("nrb-selected");
						else choice.classList.remove("nrb-selected");
					}
				};

				const createRadioButton = choice => {
					const c = document.createElement("div");
					c.className = "neato-radio-button";
					c.dataset.key = choice;
					if (value == choice) c.classList.add("nrb-selected");

					const t = document.createElement("span");
					t.className = "nrb-box";

					c.appendChild(t);
					c.appendChild(createLabel(choices[choice].label, choices[choice].description, choices[choice].tooltip));

					c.addEventListener("click", e => {
						callback(value = choice, e);
						update();
					});

					return c;
				};

				for (let choice in choices) element.appendChild(createRadioButton(choice));

				update();

				return element;
			};

			if (!plugin.settings) plugin.settings = plugin.defaultSettings;

			for (let setting in fields) {
				const field = fields[setting];
				try {
					let repop, array, insertDeleteButton;

					if (field.array || field.list) {
						const list = document.createElement("div");
						list.className = "neato-setting neato-setting-array";
						list.appendChild(createLabel(field.label, field.description, field.tooltip));

						array = document.createElement("div");
						array.className = "neato-setting-array-items";
						list.appendChild(array);

						if (field.array) {
							const addButton = document.createElement("button"), clearButton = document.createElement("button");
							addButton.className = clearButton.className = [NeatoLib.getClass("button"), NeatoLib.getClass("lookFilled"), NeatoLib.getClass("colorBrand"), NeatoLib.getClass("sizeMedium"), NeatoLib.getClass("grow")].join(" ");
							addButton.style = clearButton.style = "display:inline;margin:0 10px";

							addButton.textContent = "Add";
							addButton.addEventListener("click", e => {
								plugin.settings[setting].push("");
								array.innerHTML = "";
								repop();
								if (typeof field.callback == "function") field.callback({ type: "add", event: e, array: array, panel: panel });
								plugin.saveSettings();
							});

							clearButton.textContent = "Clear";
							clearButton.addEventListener("click", e => {
								plugin.settings[setting] = [];
								array.innerHTML = "";
								repop();
								if (typeof field.callback == "function") field.callback({ type: "clear", event: e, array: array, panel: panel });
								plugin.saveSettings();
							});

							insertDeleteButton = i => {
								const button = document.createElement("span");
								button.className = "material-icons neato-array-remove-button";
								button.textContent = "close";

								button.addEventListener("click", e => {
									plugin.settings[setting].splice(i, 1);
									array.innerHTML = "";
									repop();
									if (typeof field.callback == "function") field.callback({ type: "remove", event: e, array: array, panel: panel });
									plugin.saveSettings();
								});

								NeatoLib.Tooltip.attach("Remove", button, { delay : 250 });

								array.children[i].appendChild(button);
							};

							const buttons = document.createElement("div");
							buttons.className = "neato-setting-array-buttons";

							buttons.appendChild(addButton);
							buttons.appendChild(clearButton);

							list.appendChild(buttons);
						}

						panel.appendChild(list);
					}

					const set = (nv, e) => {
						if (typeof field.callback == "function") field.callback({ type: "change", oldValue: plugin.settings[setting], newValue: nv, event: e, panel: panel });
						plugin.settings[setting] = nv;
						plugin.saveSettings();
					};

					switch (field.type) {
						case "bool": case "boolean":
							if (array) {
								(repop = () => {
									for (let i in plugin.settings[setting]) {
										const element = createToggleSwitch(null, null, null, plugin.settings[setting][i], (nv, e) => {
											if (typeof field.callback == "function") field.callback({ type: "change", oldValue: plugin.settings[setting][i], newValue: nv, event: e, panel: panel });
											plugin.settings[setting][i] = nv;
											plugin.saveSettings();
										});

										if (field.events)
											for (let event in field.events)
												if (event == "start" || event == "init") field.events[i](element);
												else element.addEventListener(event, field.events[i]);

										array.appendChild(element);

										if (field.array) insertDeleteButton(i);
									}
								})();
							} else {
								const element = createToggleSwitch(field.label, field.description, field.tooltip, plugin.settings[setting], set);

								if (field.events)
									for (let event in field.events)
										if (event == "start" || event == "init") field.events[i](element);
										else element.addEventListener(event, field.events[i]);

								panel.appendChild(element);
							}
						break;

						case "custom":
							if (field.element) panel.appendChild(field.element);
							if (field.html) panel.insertAdjacentHTML("beforeEnd", field.html);
							if (field.createElement) field.createElement(panel);

							if (field.events)
								for (let event in field.events)
									if (event == "start" || event == "init") field.events[i](panel.lastChild);
									else panel.lastChild.addEventListener(event, field.events[i]);
						break;

						case "radio": case "radio group":
							const element = createRadioGroup(field.label, field.description, field.tooltip, plugin.settings[setting], field.choices, set);

							if (field.events)
								for (let event in field.events)
									if (event == "start" || event == "init") field.events[i](element);
									else element.addEventListener(event, field.events[i]);

							panel.appendChild(element);
						break;

						default:
							if (array) {
								(repop = () => {
									for (let i in plugin.settings[setting]) {
										const element = createTextField(null, null, null, plugin.settings[setting][i], field.type, (nv, e) => {
										if (typeof field.callback == "function") field.callback({ type: "change", oldValue: plugin.settings[i], newValue: nv, event: e, panel: panel });
											plugin.settings[setting][i] = nv;
											plugin.saveSettings();
										});

										if (field.events)
											for (let event in field.events)
												if (event == "start" || event == "init") field.events[i](element);
												else element.addEventListener(event, field.events[i]);

										array.appendChild(element);

										if (field.array) insertDeleteButton(i);
									}
								})();
							} else {
								const element = createTextField(field.label, field.description, field.tooltip, plugin.settings[setting], field.type, set);

								if (field.events)
									for (let event in field.events)
										if (event == "start" || event == "init") field.events[i](element);
										else element.addEventListener(event, field.events[i]);

								panel.appendChild(element);
							}

					}
				} catch(err) { console.error(err); }
			}
		},

		Styles: {
			textField: `color: white; background-color: rgba(0, 0, 0, 0.2); border: none; border-radius: 5px; height: 40px; padding: 10px; width: 100%;`
		},

		Elements: {

			pluginNameLabel: function(name, authorName = "Metalloriff") {
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
					<h style="color: white;font-size: 30px;font-weight: bold;">${name.replace(/([A-Z])/g, ' $1').trim()} by ${authorName}</h>`;
			},

			createRadioGroup: function(id, label, choices, selectedChoice, callback, description = "") {

				let element = document.createElement("div");

				element.style.paddingTop = "20px";

				element.innerHTML = `
				<h5 style="color:white;padding-bottom:10px;">${label}</h5>
				<h5 style="Color:white;padding-bottom:10px;opacity:0.5;">${description}<h5>
				<div id="${id}" style="color:white;"></div>`;

				for (let i = 0; i < choices.length; i++) {

					if (choices[i].description == undefined) choices[i].description = "";

					let choiceButton = document.createElement("div");

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

					if (selectedChoice != undefined && choices[i].value == selectedChoice) choiceButton.querySelector(`label > div`).style.backgroundColor = "white";

					choiceButton.addEventListener("click", e => {

						let i = e.currentTarget.getAttribute("data-index");

						let checkboxes = e.currentTarget.parentElement.querySelectorAll(`.metalloriff-checkbox-item > label > div`);

						for (let ii = 0; ii < checkboxes.length; ii++) checkboxes[ii].style.backgroundColor = "";

						element.querySelector(`#${id}-${i} > label > div`).style.backgroundColor = "white";

						callback(choiceButton, choices[i]);

					});

				}

				return element;

			},

			createToggleGroup: function(id, label, choices, callback, description = "") {

				let element = document.createElement("div");

				element.style.paddingTop = "10px";

				element.insertAdjacentHTML("beforeend", `
					<h5 style="color:white;padding-bottom:5px;">${label}</h5>
					<h5 style="Color:white;padding-bottom:5px;opacity:0.5;">${description}<h5>
					<div id="${id}" style="color:white;"></div>
				`);

				for (let i = 0; i < choices.length; i++) {

					let choiceButton = NeatoLib.Settings.Elements.createToggleSwitch(choices[i].title, choices[i].setValue, e => {
						callback(choices[i], e);
					});

					choiceButton.setAttribute("id", `${id}-${i}`);
					choiceButton.setAttribute("data-value", choices[i].value);
					choiceButton.setAttribute("data-index", i);

					element.insertAdjacentElement("beforeend", choiceButton);

				}

				return element;

			},

			createTextField: function(label, type, value, callback, options = {}) {

				let element = document.createElement("div");

				element.style.paddingTop = options.spacing || "20px";

				element.insertAdjacentHTML("beforeend", `
					<p style="color:white;font-size:20px;">${label}</p>
					<input value="${value}" type="${type}" class="inputDefault-_djjkz input-cIJ7To size16-14cGz5">
				`);

				if (options.tooltip) NeatoLib.Tooltip.attach(options.tooltip, element, {
					side: "left"
				});

				element.querySelector("input").addEventListener(options.callbackType || "focusout", e => callback(e));

				return element;

			},

			createNewTextField: function(label, value, callback, options = {}) {

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
					<input value="${value}" type="${options.type || "text"}" style="${NeatoLib.Settings.Styles.textField}">
				`);

				element.querySelector("input").addEventListener(options.callbackType || "focusout", e => callback(e));

				return element;

			},

			createHint: function(text, options = {}) {

				let element = document.createElement("p");

				element.style.color = options.color || "white";
				element.style.fontSize = options.fontSize || "17px";

				element.innerText = text;

				return element;

			},

			createButton: function(label, callback, style = "", attributes = {}) {

				let element = document.createElement("button");

				element.setAttribute("style", `display:inline-block;${style}`);
				element.setAttribute("class", [NeatoLib.getClass("button"), NeatoLib.getClass("lookFilled"), NeatoLib.getClass("colorBrand"), NeatoLib.getClass("sizeMedium"), NeatoLib.getClass("grow")].join(" "));

				for (let key in attributes) element.setAttribute(key, attributes[key]);

				element.innerText = label;

				element.addEventListener("click", e => callback(e));

				return element;

			},

			createToggleSwitch: function(label, value, callback, spacing = "20px") {

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

					if (b.classList.contains("valueChecked-m-4IJZ")) {
						b.classList.add("valueUnchecked-2lU_20");
						b.classList.remove("valueChecked-m-4IJZ");
					} else {
						b.classList.add("valueChecked-m-4IJZ");
						b.classList.remove("valueUnchecked-2lU_20");
					}

					callback(e);

				});

				return element;

			},

			createLabel: function(title, spacing = "20px", style = "") {
				return `<div style="color:white;margin: ${spacing} 0px;${style}">${title}</div>`;
			},

			createGroup: function(title, options = {}) {

				let element = document.createElement("div");

				element.setAttribute("style", `color:white;margin:${options.spacing || "20px"};${options.style || ""}`);

				element.insertAdjacentHTML("beforeend", `<div style="margin: ${options.spacing || "20px"} 0px;">${title}</div><div></div>`);

				return element;

			},

			createKeybindInput: function(title, value, callback, options = {}) {

				let element = document.createElement("div"),
					v = value.primaryKey || "",
					oldValue = value;

				if (value.modifiers && value.modifiers[0]) v = (value.modifiers.join(" + ") || "") + " + " + (value.primaryKey || "");

				if (options.global) v = value;

				element.insertAdjacentHTML("beforeend", `
					<style>
						#app-mount .card-FDVird.active-nvdKfC:before, .card-FDVird:before {
							opacity: 0.5 !important;
						}
					</style>
					<div class="row-2okwlC">
						<div class="flex-1xMQg5 flex-1O1GKY vertical-V37hAW flex-1O1GKY directionColumn-35P_nr justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 keybindGroup-JQs9x_ card-FDVird" style="flex: 1 1 auto; margin: 10px 25px">
							<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 marginBottom8-AtZOdT" style="flex: 1 1 auto;">
								<div class="item-rJ_Cmt flexChild-faoVW3" style="flex: 1 1 50%;">
									<h5 class="h5-18_1nd title-3sZWYQ size12-3R0845 height16-2Lv3qA weightSemiBold-NJexzi defaultMarginh5-2mL-bP marginBottom8-AtZOdT">${title}</h5>
									<div class="container-CpszHS container-1nZlH6 hasValue-3pdcdm">
										<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 layout-FSaTy9 layout-eEMo5y" style="flex: 1 1 auto;"><input placeholder="No Keybind Set" type="text" readonly="" class="input-1G2o7i input-1UhAnY base-96ewKC" value="${v.replace("Key", "")}" style="flex: 1 1 auto;">
											<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6"
												style="flex: 0 1 auto; margin: 0px;">
												<button type="button" class="button-34kXw5 button-3tQuzi button-38aScr lookGhost-2Fn_0- colorGrey-2DXtkV sizeMin-1mJd1x grow-q77ONN nbl-keybind-button">
													<div class="contents-18-Yxp nbl-keybind-button">
														<span class="text-2sI5Sd nbl-keybind-button">Edit Keybind</span>
															<span class="editIcon-13gaox nbl-keybind-button">
														</span>
													</div>
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="description-3_Ncsb formText-3fs7AJ keybindMessage-20JT9A flexChild-faoVW3 modeDefault-3a2Ph1 primary-jw0I4K" style="flex: 1 1 auto;">${options.description || ""}</div>
						</div>
					</div>
				`);

				let isRecording = false,
					primaryKey = "",
					modifiers = [],
					globalKeys = [];

				let keyEvent = e => {

					e.preventDefault();

					if (options.global) {

						let key = e.key;

						if (key.length == 1) key = key.toUpperCase();

						if (globalKeys.indexOf(key) == -1) globalKeys.push(key);
						if (globalKeys[0] == "") globalKeys.splice(0, 1);
						input.value = globalKeys.join(" + ");

						if (e.location == 0 && globalKeys.length > 1) button.click();
						else input.value += " + ...";

					} else {

						if (e.location == 0) primaryKey = e.code;
						else if (modifiers.indexOf(e.code) == -1) modifiers.push(e.code);

						if (primaryKey && modifiers[0]) {
							input.value = `${modifiers.join(" + ")} + ${primaryKey}`;
							button.click();
						} else if (primaryKey) input.value = primaryKey;
						else if (modifiers[0]) input.value = modifiers.join(" + ") + " + ...";
						else input.value = "";

						input.value = input.value.replace("Key", "");

					}

				};

				let keyUpEvent = e => {

					e.preventDefault();

					if (options.global) {

						let key = e.key;

						if (key.length == 1) key = key.toUpperCase();

						if (globalKeys.indexOf(key) != -1) globalKeys.splice(globalKeys.indexOf(key), 1);
						if (globalKeys[0] == "") globalKeys.splice(0, 1);
						input.value = globalKeys.join(" + ");

					} else {

						if (e.location == 0) primaryKey = undefined;
						else if (modifiers.indexOf(e.code) != -1) modifiers.splice(modifiers.indexOf(e.code), 1);

						if (primaryKey && modifiers[0]) input.value = `${modifiers.join(" + ")} + ${primaryKey}`;
						else if (primaryKey) input.value = primaryKey;
						else if (modifiers[0]) input.value = modifiers.join(" + ") + " + ...";
						else input.value = "";

						input.value = input.value.replace("Key", "");

					}

				};

				let toggleRecording = () => {

					isRecording = !isRecording;

					if (isRecording) {
						if (options.global) NeatoLib.Keybinds.unregisterGlobal(oldValue);
						document.addEventListener("keydown", keyEvent);
						document.addEventListener("keyup", keyUpEvent);
						document.addEventListener("click", documentClick);
						container.classList.add("recording-1H2dS7");
						label.innerText = "Save Keybind";
					} else {
						oldValue = globalKeys.join(" + ");
						if (options.global) callback(oldValue);
						else callback({
							primaryKey: primaryKey,
							modifiers: modifiers
						});
						primaryKey = undefined;
						modifiers = [];
						globalKeys = [];
						document.removeEventListener("keydown", keyEvent);
						document.removeEventListener("keyup", keyUpEvent);
						document.removeEventListener("click", documentClick);
						container.classList.remove("recording-1H2dS7");
						label.innerText = "Edit Keybind";
					}

				};

				let documentClick = e => {
					if (!e.target.classList.contains("nbl-keybind-button")) toggleRecording();
				};

				let input = element.getElementsByTagName("input")[0],
					container = element.getElementsByClassName("container-CpszHS")[0],
					button = element.getElementsByTagName("button")[0],
					label = element.getElementsByClassName("text-2sI5Sd")[0];

				button.addEventListener("click", toggleRecording);

				return element;

			}

		},

		pushChangelogElements: function(plugin) {

			var element = document.createElement("div");

			element.style.padding = "10px";
			element.style.marginTop = "10px";
			element.style.backgroundColor = "rgba(0,0,0,0.2)";
			element.style.borderRadius = "5px";

			element.insertAdjacentHTML("beforeend", `<div style="text-align:center;color:white;">Other</div>`);

			element.insertAdjacentElement("beforeend", NeatoLib.Settings.Elements.createToggleSwitch("Display changes for every update", plugin.settings.displayUpdateNotes, () => {
				plugin.settings.displayUpdateNotes = !plugin.settings.displayUpdateNotes;
				plugin.saveSettings();
			}));

			var right = document.createElement("div");

			right.style.textAlign = "right";

			right.style.paddingTop = "20px";

			right.insertAdjacentElement("beforeend", NeatoLib.Settings.Elements.createButton("View Changelog", () => {
				NeatoLib.Changelog.createChangeWindow(plugin.getName(), [], plugin.getChanges());
			}));

			right.insertAdjacentElement("afterbegin", NeatoLib.Settings.Elements.createButton("Join Support Server", () => {
				window.open("https://discord.gg/yNqzuJa");
			}, "float:left"));

			element.insertAdjacentElement("beforeend", right);

			NeatoLib.Settings.pushElement(element, plugin.getName());

		},

		pushElement: function(element, name, options = {}) {

			const {
				tooltip,
				tooltipSide
			} = options;

			document.getElementById(`plugin-settings-${name}`).appendChild(element);

			if (tooltip) NeatoLib.Tooltip.attach(tooltip, element, {
				side: tooltipSide || "left"
			});

		},

		pushElements: function(elements, name) {
			let panel = document.getElementById(`plugin-settings-${name}`);
			for (let i = 0; i < elements.length; i++) panel.appendChild(elements[i]);
		},

		pushHTML: function(html, name) {
			document.getElementById(`plugin-settings-${name}`).insertAdjacentHTML("beforeend", html);
		},

		showPluginSettings: function(name) {

			document.querySelector(".button-2b6hmh:nth-child(3)").click();

			setTimeout(() => {

				var bdActions = document.querySelectorAll("#bd-settings-sidebar .ui-tab-bar-item");

				for (var i = 0; i < bdActions.length; i++) {
					if (bdActions[i].textContent == "Plugins") bdActions[i].click();
				}

				setTimeout(() => {

					var settingsBox = document.querySelector(`li[data-name="${name}"]`),
						settingsButton = settingsBox.getElementsByClassName("bda-settings-button")[0];

					settingsBox.scrollIntoView();

					if (settingsButton != undefined) settingsButton.click();

				}, 100);

			}, 100);

		},

		save: function(plugin) {
			NeatoLib.Data.save(plugin.getName().split(" ").join(""), "settings", plugin.settings);
		},

		load: function(plugin, defaultSettings) {
			return plugin.settings = NeatoLib.Data.load(plugin.getName().split(" ").join(""), "settings", defaultSettings || plugin.defaultSettings);
		}

	},

	UI: {

		createPrompt: function(id, title, description, yesCallback, noCallback = "close", options = {}) {

			document.getElementsByClassName(NeatoLib.getClass("app"))[0].insertAdjacentHTML("beforeend", `

			<div id="neato-prompt-${id}" style="z-index:10000;">
				<div class="backdrop-1wrmKB" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>
				<div class="modal-36zFtW" style="opacity: 1; transform: scale(1) translateZ(0px);">
					<div class="inner-2VEzy9">
						<div class="modal-3v8ziU sizeSmall-2-_smo">
							<div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-2nhbou" style="flex: 0 0 auto;">
								<h4 class="h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">${title}</h4>
							</div>
							<div class="scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d">
								<div class="scroller-2FKFPG inner-3wn6Q5">
									<div class="card-1SJYqw marginBottom20-32qID7 card-3Qj_Yx" style="background-color:${options.color || "transparent"};border:none;">
										<div class="medium-zmzTW- size16-14cGz5 height20-mO2eIN white-2qwKC7">${description}</div>
									</div>
								</div>
							</div>
							<div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 footer-30ewN8" style="flex: 0 0 auto;"><button type="submit" class="button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN prompt-yes"><div class="contents-18-Yxp">${options.yesText || "Yes"}</div></button><button type="button" class="button-38aScr lookLink-9FtZy- colorPrimary-3b3xI6 sizeMedium-1AC_Sl grow-q77ONN prompt-no"><div class="contents-18-Yxp">${options.noText || "No"}</div></button></div>
						</div>
					</div>
				</div>
			</div>

			`);

			let prompt = document.getElementById("neato-prompt-" + id),
				backdrop = prompt.getElementsByClassName("backdrop-1wrmKB")[0],
				yesButton = prompt.getElementsByClassName("prompt-yes")[0],
				noButton = prompt.getElementsByClassName("prompt-no")[0];

			prompt.close = () => prompt.outerHTML = "";

			backdrop.addEventListener("click", () => prompt.close());

			yesButton.addEventListener("click", () => yesCallback(prompt));
			noButton.addEventListener("click", noCallback == "close" ? () => prompt.close() : () => noCallback(prompt));

			prompt.addEventListener("keydown", e => {
				if (e.key == "Escape") prompt.close();
				if (e.key == "Enter") yesButton.click();
			});

			return prompt;

		},

		createTextPrompt: function(id, title, callback, value = "", options = {}) {

			document.getElementsByClassName(NeatoLib.getClass("app"))[0].insertAdjacentHTML("beforeend", `

			<div id="neato-text-prompt-${id}" style="z-index:10000;">
				<div class="backdrop-1wrmKB" style="opacity: 0.85; background-color: rgb(0, 0, 0); transform: translateZ(0px);"></div>
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
				backdrop = prompt.getElementsByClassName("backdrop-1wrmKB")[0],
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

			if (options.secondOptionCallback != undefined) secondOption.addEventListener("click", () => options.secondOptionCallback(prompt));

			prompt.addEventListener("keydown", e => {
				if (e.key == "Escape") prompt.close();
				if (e.key == "Enter") confirmButton.click();
			});

			return prompt;

		},

		createBasicScrollList: function(id, title, options = {}) {

			document.getElementsByClassName(NeatoLib.getClass("app"))[0].insertAdjacentHTML("beforeend", `

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
					max-height: calc(100vh - 300px);
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

			let window = document.getElementById(id),
				scroller = window.getElementsByClassName(`${id}-scroller`)[0],
				backdrop = window.getElementsByClassName(`${id}-backdrop`)[0];

			backdrop.addEventListener("click", () => window.outerHTML = "");
			window.addEventListener("keydown", e => {
				if (key == "Escape") backdrop.click();
			});

			return {
				window: window,
				scroller: scroller,
				backdrop: backdrop
			};

		}

	},

	Keybinds: {

		globalShortcut: require("electron").remote.globalShortcut,

		attachListener: function(id, key, event, options = {}) {

			if (key == undefined) return console.warn(id, "The passed key object is null!", key);

			if (window.activeNeatoKeyListeners == undefined) window.activeNeatoKeyListeners = {};

			let node = options.node || document;

			if (window.activeNeatoKeyListeners[id]) {
				console.warn("There is already a keybind listener with the id '" + id + "'!");
				return;
			}

			window.activeNeatoKeyListeners[id] = {
				heldKeys: [],
				keydown: e => {
					if (window.activeNeatoKeyListeners[id].heldKeys.indexOf(e.code) == -1) window.activeNeatoKeyListeners[id].heldKeys.push(e.code);
					if (window.activeNeatoKeyListeners[id].heldKeys.indexOf(key.primaryKey) != -1) {
						let heldModifiers = 0;
						for (let i = 0; i < key.modifiers.length; i++)
							if (window.activeNeatoKeyListeners[id].heldKeys.indexOf(key.modifiers[i]) != -1) heldModifiers++;
						if (key.modifiers.length == heldModifiers && window.activeNeatoKeyListeners[id].heldKeys.length == heldModifiers + 1) event(e);
					}
				},
				keyup: e => {
					if (window.activeNeatoKeyListeners[id].heldKeys.indexOf(e.code) != -1) window.activeNeatoKeyListeners[id].heldKeys.splice(window.activeNeatoKeyListeners[id].heldKeys.indexOf(e.code), 1);
				},
				windowFocusLoss: () => {
					window.activeNeatoKeyListeners[id].heldKeys = [];
				}
			};

			node.addEventListener("keydown", window.activeNeatoKeyListeners[id].keydown);
			node.addEventListener("keyup", window.activeNeatoKeyListeners[id].keyup);

			window.addEventListener("blur", window.activeNeatoKeyListeners[id].windowFocusLoss);

			return window.activeNeatoKeyListeners[id];

		},

		detachListener: function(id, node = document) {

			if (window.activeNeatoKeyListeners == undefined) window.activeNeatoKeyListeners = {};

			if (!window.activeNeatoKeyListeners[id]) {
				console.warn("There is no keybind listener with the id '" + id + "'!");
				return;
			}

			node.removeEventListener("keydown", window.activeNeatoKeyListeners[id].keydown);
			node.removeEventListener("keyup", window.activeNeatoKeyListeners[id].keyup);

			window.removeEventListener("blur", window.activeNeatoKeyListeners[id].windowFocusLoss);

			delete window.activeNeatoKeyListeners[id];

		},

		registerGlobal: function(key, event, debug = false) {
			try {
				this.globalShortcut.register(key, event);
			} catch (e) {
				if (debug) console.error(e);
			}
		},

		unregisterGlobal: function(key, debug = false) {
			try {
				this.globalShortcut.unregister(key);
			} catch (e) {
				if (debug) console.error(e);
			}
		}

	},

	Chatbox: {

		get: function() {
			let chat = document.getElementsByClassName(NeatoLib.getClass("chat"))[0];
			return chat ? chat.getElementsByTagName("textarea")[0] : null;
		},

		setText: function(newText) {
			NeatoLib.Chatbox.get().select();
			document.execCommand("insertText", false, newText);
		},

		appendText: function(text) {
			let chatbox = NeatoLib.Chatbox.get();
			if (!chatbox) return;
			chatbox.select();
			document.execCommand("insertText", false, chatbox.value + text);
		}

	},

	Modules: { //Based off of Zerebos' PluginLibrary. https://rauenzi.github.io/BetterDiscordAddons/docs/PluginLibrary.js

		req: webpackJsonp.push([
			[], {
				"__extra_id__": (m, e, r) => m.exports = r
			},
			[
				["__extra_id__"]
			]
		]),

		find: function(filter) {
			for (let i in this.req.c) {
				if (this.req.c.hasOwnProperty(i)) {
					const m = this.req.c[i].exports;
					if (m && m.__esModule && m.default && filter(m.default)) return m.default;
					if (m && filter(m)) return m;
				}
			}

			console.warn("No module found with this filter!", filter);

			return null;
		},

		findAll: function(filter) {

			let found = [];

			for (let i in this.req.c) {

				if (this.req.c.hasOwnProperty(i)) {
					let m = this.req.c[i].exports;
					if (m && m.__esModule && m.default && filter(m.default)) found.push(m.default);
					else if (m && filter(m)) found.push(m);
				}

			}

			return found;

		},

		findAllByPropertyName: function(propName, filter) {

			if (!filter) filter = m => m[propName];

			let found = [];

			for (let i in this.req.c) {

				if (this.req.c.hasOwnProperty(i)) {
					let m = this.req.c[i].exports;
					if (m && m.__esModule && m.default && filter(m.default)) found.push(m.default[propName]);
					else if (m && filter(m)) found.push(m[propName]);
				}

			}

			return found;

		},

		findIndex: function(filter) {

			for (let i in this.req.c) {

				if (this.req.c.hasOwnProperty(i)) {
					let m = this.req.c[i].exports;
					if (m && m.__esModule && m.default && filter(m.default)) return i;
					if (m && filter(m)) return i;
				}

			}

			console.warn("No module found with this filter!", filter);

			return null;

		},

		get: function(props) {
			const cacheKey = typeof props == "string" ? props : props.join(",");
			if (!this.cached) this.cached = {};
			if (!this.cached[cacheKey]) this.cached[cacheKey] = typeof props == "string" ? this.find(module => module[props] != undefined) : this.find(module => props.every(prop => module[prop] != undefined));
			return this.cached[cacheKey];
		},

		getById: function(id) {
			return this.find(x => x._dispatchToken == "ID_" + id);
		}

	},

	Updates: { //Based off of Zerebos' PluginLibrary. https://rauenzi.github.io/BetterDiscordAddons/docs/PluginLibrary.js

		requestUpdateCheck: function(pluginName, url) {

			require("request")(url, (err, response, res) => {

				if (err) return console.error(pluginName, "Failed to check for updates!", err);

				let latestVersion = res.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i);
				if (!latestVersion) return;
				latestVersion = latestVersion.toString().replace(/['"]/g, "").trim();

				if(!window.PluginUpdates.plugins[url]) return NeatoLib.Updates.hideNotice(pluginName);

				let versionOld = window.PluginUpdates.plugins[url].version.split(".");
				let versionNew = latestVersion.split(".");

				if(versionNew[0] > versionOld[0] || (versionNew[0] == versionOld[0] && versionNew[1] > versionOld[1]) || (versionNew[0] == versionOld[0] && versionNew[1] == versionOld[1] && versionNew[2] > versionOld[2]))
					NeatoLib.Updates.displayNotice(pluginName, url);
				else
					NeatoLib.Updates.hideNotice(pluginName);

			});

		},

		displayNotice: function(pluginName, url) {

			if (document.getElementById("pluginNotice") == undefined) {

				let classes = NeatoLib.Modules.get("noticeInfo");

				document.getElementsByClassName(NeatoLib.getClass("app"))[0].insertAdjacentHTML("afterbegin", `<div class="${classes.notice} ${classes.noticeInfo}" id="pluginNotice"><div class="${classes.dismiss}" id="pluginNoticeDismiss"></div><span class="notice-message">The following plugins have updates:</span>&nbsp;&nbsp;<strong id="outdatedPlugins"></strong></div>`);

				document.getElementById("pluginNoticeDismiss").addEventListener("click", () => document.getElementById("pluginNotice").outerHTML = "");

			}

			if (document.getElementById(pluginName + "-notice") == undefined) {

				let element = document.createElement("span"),
					outdated = document.getElementById("outdatedPlugins");

				element.setAttribute("id", pluginName + "-notice");
				element.innerText = pluginName;

				element.addEventListener("click", () => NeatoLib.Updates.download(pluginName, url));

				if (outdated.getElementsByTagName("span")[0] != undefined) outdated.insertAdjacentHTML("beforeend", "<span class='separator'>, </span>");
				outdated.appendChild(element);

			}

		},

		hideNotice: function(pluginName) {

			let notice = document.getElementById(pluginName + "-notice");

			if (notice) {
				if (notice.nextSibling && notice.nextSibling.classList.contains("separator")) notice.nextSibling.remove();
				else if (notice.previousSibling && notice.previousSibling.classList.contains("separator")) notice.previousSibling.remove();
				notice.remove();
			} else if (!document.querySelector("#outdatedPluings > span") && document.querySelector("#pluginNotice > .btn-reload") && document.querySelector("#pluginNotice .notice-message")) document.querySelector("#pluginNotice .notice-message").innerText = "To finish updating you need to reload.";

		},

		download: function(pluginName, url) {

			let req = require("request"),
				fs = require("fs"),
				path = require("path");

			req(url, (err, response, res) => {

				if (err) return console.error(pluginName, "Failed to download update!", err);

				let latestVersion = res.match(/['"][0-9]+\.[0-9]+\.[0-9]+['"]/i).toString().replace(/['"]/g, "").trim(),
					fileName = url.split("/");
				fileName = fileName[fileName.length - 1];

				let file = path.join(NeatoLib.getPluginsFolderPath(), fileName);

				fs.writeFileSync(file, res);

				NeatoLib.showToast(`${pluginName} was updated to v${latestVersion}.`, "success");

					if (!window.PluginUpdates.downloaded) {

						window.PluginUpdates.downloaded = [];

						let button = document.createElement("button");

						button.className = "btn btn-reload btn-2o56RF button-1MICoQ size14-3iUx6q weightMedium-2iZe9B";
						button.innerText = "Reload";

						button.addEventListener("click", e => {
							e.preventDefault();
							window.location.reload(false);
						});

						let tooltip = document.createElement("div");
						tooltip.className = NeatoLib.getClass("tooltip") + " " + NeatoLib.getClass("tooltip", "tooltipBottom") + " " + NeatoLib.getClass("tooltip", "tooltipBlack");

						tooltip.style.maxWidth = "400px";

						button.addEventListener("mouseenter", () => {
							document.getElementsByClassName(NeatoLib.getClass("tooltip"))[0].appendChild(tooltip);
							tooltip.innerText = window.PluginUpdates.downloaded.join(", ");
							tooltip.style.left = button.getBoundingClientRect().left + (button.offsetWidth / 2) - (tooltip.offsetWidth / 2) + "px";
							tooltip.style.top = button.getBoundingClientRect().top + button.offsetHeight + "px";
						});

						button.addEventListener("mouseleave", () => tooltip.remove());

						document.getElementById("pluginNotice").appendChild(button);

					}

					window.PluginUpdates.plugins[url].version = latestVersion;
					window.PluginUpdates.downloaded.push(pluginName);
					NeatoLib.Updates.hideNotice(pluginName);

			});

		},

		check: function(plugin, path) {

			let url = path ? path : "https://rawgit.com/Metalloriff/BetterDiscordPlugins/master/" + plugin.getName().split(" ").join("") + ".plugin.js";

			if (typeof window.PluginUpdates == "undefined") window.PluginUpdates = {
				plugins: {}
			};
			window.PluginUpdates.plugins[url] = {
				name: plugin.getName(),
				raw: url,
				version: plugin.getVersion()
			};

			NeatoLib.Updates.requestUpdateCheck(plugin.getName(), url);

			if (typeof window.PluginUpdates.interval == "undefined") {
				window.PluginUpdates.interval = setInterval(() => {
					window.PluginUpdates.checkAll();
				}, 7200000);
			}

			if (typeof window.PluginUpdates.checkAll == "undefined") {
				window.PluginUpdates.checkAll = function() {
					for (let key in this.plugins) {
						NeatoLib.Updates.requestUpdateCheck(this.plugins[key].name, this.plugins[key].raw);
					}
				};
			}

		}

	},

	Data: {

		save: function(name, key, data) {
			try {
				BdApi.setData(name, key, data);
			} catch (err) {
				console.warn(name, "failed to save data.", err);
			}
		},

		load: function(name, key, fallback) {
			try {
				return $.extend(true, fallback ? fallback : {}, BdApi.getData(name, key));
			} catch (err) {
				console.warn(name, "failed to load data.", err);
			}
			return {};
		}

	},

	Events: {

		onPluginLoaded: function(plugin) {

			NeatoLib.showToast(`[${plugin.getName()}]: Plugin loaded.`, "success");
			console.log(plugin.getName(), "loaded.");

			plugin.ready = true;

			if (plugin.forceLoadTimeout) {
				clearTimeout(plugin.forceLoadTimeout);
				plugin.forceLoadTimeout = null;
				delete plugin.forceLoadTimeout;
			}

		},

		attach: function(eventType, event, options = {}) {
			window.activeNeatoEvents.push({
				callback: event,
				type: eventType,
				options: options
			});
		},

		detach: function(eventType, event) {
			let idx = window.activeNeatoEvents.findIndex(e => e.callback == event && e.type == eventType);
			if (idx != -1) window.activeNeatoEvents.splice(idx, 1);
			else console.warn("Event could not be found.", event);
		}

	},

	ReactData: {

		get: function(element) {

			if (!(element instanceof Element)) return null;

			return element[Object.keys(element).find(key => key.startsWith("__reactInternalInstance"))];

		},

		getEvents: function(element) {

			if (!(element instanceof Element)) return null;

			return element[Object.keys(element).find(key => key.startsWith("__reactEventHandlers"))];

		},

		getOwner: function(element) {

			if (!(element instanceof Element)) return null;

			let reactData = this.get(element);

			if (reactData == undefined) return null;

			for (let c = reactData.return; !_.isNil(c); c = c.return) {
				if (_.isNil(c)) continue;
				let owner = c.stateNode;
				if (!_.isNil(owner) && !(owner instanceof HTMLElement)) return owner;
			}

		},

		getProps: function(element) {

			if (!(element instanceof Element)) return null;

			let owner = this.getOwner(element);

			return owner ? owner.props : null;

		},

		getProp: function(element, propKey) {

			if (!(element instanceof Element)) return null;

			let owner = this.getOwner(element);

			if (!owner || !owner.props) return null;

			let split = propKey.split("."),
				obj = owner.props;

			for (let i = 0; i < split.length; i++) {
				obj = obj[split[i]];
				if (!obj) return null;
			}

			return obj;

		},

	},

	ContextMenu: {

		create: function(items, event, options = {}) {

			this.close();

			let menu = document.createElement("div");

			menu.classList.add(this.classes.contextMenu.split(" ")[0], document.getElementsByClassName("theme-dark")[0] != undefined ? "theme-dark" : "theme-light");

			for (let i = 0; i < items.length; i++) menu.appendChild(items[i]);

			if (options.style) menu.style = options.style;

			menu.style.zIndex = 10000;
			menu.style.top = event.clientY + "px";
			menu.style.left = event.clientX + "px";
			menu.style.position = 'relative';

			let close = () => {
				menu.remove();
				document.removeEventListener("click", onClick);
				document.removeEventListener("contextmenu", onClick);
				document.removeEventListener("keyup", onKeyUp);
			};

			let onClick = e => {
				if (!menu.contains(e.target)) close();
			};

			let onKeyUp = e => {
				if (e.key == "Escape") close();
			};

			document.addEventListener("click", onClick);
			setTimeout(() => {
				document.addEventListener("contextmenu", onClick);
			}, 0);
			document.addEventListener("keyup", onKeyUp);

			document.getElementById("app-mount").appendChild(menu);

			return menu;

		},

		createGroup: function(items, options = {}) {

			let element = document.createElement("div");

			element.classList.add(this.classes.itemGroup.split(" ")[0]);

			for (let i = 0; i < items.length; i++) element.appendChild(items[i]);

			return element;

		},

		createItem: function(label, callback, options = {}) {

			let element = document.createElement("div");

			element.classList.add(this.classes.item.split(" ")[0], this.classes.itemBase.split(" ")[0], this.classes.clickable.split(" ")[0]);

			element.innerHTML = "<span>" + label + "</span>";

			if (options.color) element.firstChild.style.color = options.color;

			if (options.hint) NeatoLib.Tooltip.attach(options.hint, element);

			if (options.description) element.innerHTML += `<div class="${this.classes.hint}">${options.description}</div>`;

			if (callback) element.addEventListener("click", callback);

			return element;

		},

		createSubMenu: function(label, items, options = {}) {

			let element = document.createElement("div");
			element.classList.add(this.classes.itemSubMenu.split(" ")[0], this.classes.itemBase.split(" ")[0], this.classes.clickable.split(" ")[0]);

			let le = document.createElement("div");
			le.classList.add(this.classes.label.split(" ")[0]);
			le.innerText = label;

			element.appendChild(le);
			
			element.insertAdjacentHTML("beforeend", `
				<svg class="caret-UIZBlm da-caret" width="24" height="24" viewBox="0 0 24 24">
					<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M16.59 8.59004L12 13.17L7.41 8.59004L6 10L12 16L18 10L16.59 8.59004Z"></path>
				</svg>
			`);

			if (options.color) element.style.color = options.color;
			if (options.hint) element.innerHTML += `<div class="${this.classes.hint}">${options.hint}</div>`;
			if (options.callback) 
				element.addEventListener("click", e => {
					if (e.target.parentElement == element) options.callback(e);
				});

			let sm, hoveringOver;

			element.addEventListener("mouseenter", () => {
				let layer = document.createElement("div");
				layer.classList.add(NeatoLib.getClass("layer"), "neato-cl");

				layer.style.left = (element.getBoundingClientRect().width) + "px";
				layer.style.top = (element.getBoundingClientRect().y - NeatoLib.DOM.searchForParentElementByClassName(element, NeatoLib.getClass("itemSubMenu")).getBoundingClientRect().y) + "px";

				let subMenu = document.createElement("div");
				subMenu.classList.add(this.classes.subMenuContext.split(" ")[0]);

				let menu = document.createElement("div");

				menu.classList.add(this.classes.contextMenu.split(" ")[0]);

				for (let i = 0; i < items.length; i++) menu.appendChild(items[i]);

				subMenu.appendChild(menu);

				layer.appendChild(subMenu);

				document.getElementsByClassName(NeatoLib.getClass("layerContainer"))[0].appendChild(layer);

				sm = layer;

				subMenu.addEventListener("mouseenter", e => {
					hoveringOver = subMenu;
				});

				subMenu.addEventListener("mouseleave", () => {
					setTimeout(() => {
						if (hoveringOver == subMenu) hoveringOver = null;
					}, 0);
				});

				element.appendChild(layer);
			});

			element.addEventListener("mouseleave", () => {
				if (sm && !hoveringOver) sm.remove();
			});

			return element;

		},

		createToggle: function(label, value, callback, options = {}) {

			let element = document.createElement("div");

			element.classList.add(this.classes.item.split(" ")[0], this.classes.itemBase.split(" ")[0], this.classes.itemToggle.split(" ")[0]);

			element.innerHTML = `
				<div class="${this.classes.label}">${label}</div>
				<div class="checkbox">
					<div class="checkbox-inner">
						<input type="checkbox">
						<span></span>
					</div>
				</div>
			`;

			let checkbox = element.getElementsByTagName("input")[0];

			checkbox.checked = value;

			if (options.color) element.style.color = options.color;

			if (callback) element.addEventListener("click", () => {
				checkbox.checked = !checkbox.checked;
				callback(checkbox.checked);
			});

			return element;

		},

		get: function() {
			return Array.from(document.getElementsByClassName(this.classes.contextMenu.split(" ")[0])).filter(x => x.style.display != "none")[0];
		},

		close: function() {
			let cm = NeatoLib.ContextMenu.get();
			if (cm) cm.style.display = "none";
		}

	},

	Tooltip: {

		attach: function(content, element, options = {}) {

			if (element.tooltip != undefined) element.tooltip.detach();

			const { side = "top", color, onShow, onHide, delay } = options;

			let domChecker, delayTimeout;

			element.tooltip = {
				tooltip: undefined,
				node: element,
				event: {
					mouseenter: () => {
						let tooltip = document.createElement("div");
						tooltip.classList.add(NeatoLib.getClass("tooltip"), NeatoLib.getClass("tooltip", "tooltip" + side.substr(0,1).toUpperCase() + side.substr(1)), NeatoLib.getClass("tooltip", "tooltipBlack"));
                        tooltip.innerText = content;
						tooltip.style.pointerEvents = "none";
						tooltip.style.zIndex = 15000;
                        if (color) tooltip.style.backgroundColor = color;
                        let tooltipContainer = document.createElement("div");
                        tooltipContainer.classList.add(NeatoLib.getClass("layerContainer", "layer"));
                        document.getElementsByClassName(NeatoLib.getClass("layerContainer"))[0].appendChild(tooltipContainer);
                        tooltipContainer.appendChild(tooltip);
                        tooltip.insertAdjacentHTML("afterbegin", `<div class="${NeatoLib.getClass("tooltip", "tooltipPointer")}"></div>`);
						element.tooltip.tooltip = tooltipContainer;
						let elementRect = element.getBoundingClientRect();
						switch (side) {
							case "top":
								tooltipContainer.style.top = (elementRect.top - tooltipContainer.offsetHeight) + "px";
								tooltipContainer.style.left = ((elementRect.left + (element.offsetWidth / 2)) - (tooltipContainer.offsetWidth / 2)) + "px";
							break;

							case "bottom":
								tooltipContainer.style.top = (elementRect.top + element.offsetHeight) + "px";
								tooltipContainer.style.left = ((elementRect.left + (element.offsetWidth / 2)) - (tooltipContainer.offsetWidth / 2)) + "px";
							break;

							case "right":
								tooltipContainer.style.left = (elementRect.left + element.offsetWidth) + "px";
								tooltip.style.top = ((elementRect.top + (element.offsetHeight / 2)) - (tooltipContainer.offsetHeight / 2)) + "px";
							break;

							case "left":
								tooltipContainer.style.left = (elementRect.left - tooltipContainer.offsetWidth) + "px";
								tooltipContainer.style.top = ((elementRect.top + (element.offsetHeight / 2)) - (tooltipContainer.offsetHeight / 2)) + "px";
							break;
						}
						if (typeof onShow == "function") onShow(element.tooltip);
						domChecker = setInterval(() => {
							if (!document.contains(element)) {
								tooltip.remove();
								clearInterval(domChecker);
							}
						}, 200);
					},
					mouseleave: () => {
						if (element.tooltip.tooltip) {
							element.tooltip.tooltip.remove();
							if (typeof onHide == "function") onHide(element.tooltip);
						}
						clearInterval(domChecker);
						clearTimeout(delayTimeout);
					}
				},
				detach: () => {
					element.tooltip.event.mouseleave();
					element.removeEventListener("mouseenter", element.tooltip.event.mouseenter);
					element.removeEventListener("mouseleave", element.tooltip.event.mouseleave);
					delete element.tooltip;
				}
			};

			if (delay) {
				const display = element.tooltip.event.mouseenter;
				element.tooltip.event.mouseenter = () => delayTimeout = setTimeout(display, delay);
			}

			element.addEventListener("mouseenter", element.tooltip.event.mouseenter);
			element.addEventListener("mouseleave", element.tooltip.event.mouseleave);

			return element.tooltip;

		}

	},

	Colors: {

		DiscordDefaults: {
			red: "#f04747",
			blue: "#7289da",
			green: "#43b581"
		},

		hexToRGB: function(hex, format = "R, G, B") {
			return format.replace("R", parseInt(hex.substring(1, 7).substring(0, 2), 16)).replace("G", parseInt(hex.substring(1, 7).substring(2, 4), 16)).replace("B", parseInt(parseInt(hex.substring(1, 7).substring(4, 6), 16)));
		},

		getBrightness: function(color) {
			if (!color) return 0;
			let c = Array.from(color.split(","), n => parseInt(n.replace(/[^0-9]/g, "")));
			return Math.sqrt(c[0] * c[0] * 0.241 + c[1] * c[1] * 0.691 + c[2] * c[2] * 0.068) / 255;
		}

	},

	DOM: {

		searchForParentElement: function(element, filter) {
			if (!element) return null;

			if (filter(element)) return element;

			while (element && element.parentElement && element.parentElement != document) {
				element = element.parentElement;

				if (filter(element)) return element;

				for (let i = 0; i < element.children.length; i++)
					if (filter(element.children[i])) return element.children[i];
			}
		},

		searchForParentElementByClassName: function(element, className) {
			if (!element) return null;

			if (element.classList.contains(className)) return element;

			while (element && element.parentElement && element.parentElement != document) {
				element = element.parentElement;

				if (element.classList.contains(className)) return element;

				for (let i = 0; i < element.children.length; i++)
					if (element.children[i].classList.contains(className)) return element.children[i];
			}

			return null;
		},

		createElement: function(values, options = {}) {

			let element = document.createElement(options.type || "div");

			for (let key in values) element[key] = values[key];

			return element;

		},

		sortChildren: function(element, sortFunc) {

			let children = Array.from(element.children).sort(sortFunc || function(a, b) {
				let x = a.innerText.toLowerCase(),
					y = b.innerText.toLowerCase();
				if (x < y) return -1;
				else if (x > y) return 1;
				return 0;
			});

			for (let i = 0; i < children.length; i++) element.appendChild(children[i]);

		},

		insertHTMLBefore: function(element, html) {

			let e = document.createElement("div");

			element.parentElement.insertBefore(e, element);

			e.outerHTML = html;

			return e;

		},

		insertAtIndex: function(idx, element, parent) {
			if (idx >= parent.children.length) parent.appendChild(element);
			else parent.insertBefore(element, parent.children[idx]);
		},

		insertHTMLAtIndex: function(idx, html, parent) {

			let e = document.createElement("div");

			this.insertAtIndex(idx, e, parent);

			e.outerHTML = html;

			return e;

		}

	},

	Thread: {

		sleep: function(timeout = 0) {
			return new Promise(p => setTimeout(p, timeout));
		}

	},

	downloadFile: async function(url, path, filename, onCompleted) {
		filename = filename.split(/[:|?|%]/)[0];

		const def = [url, path, filename, onCompleted];

		let progressToast, id = path.replace(/[^a-z0-9]/g, "");

		const error = function(err) {
			if (!err) return;
			if (id) NeatoLib.showProgressToast(id, "Error saving " + filename + ". Click to retry.", 1, 1, {
					color: NeatoLib.Colors.DiscordDefaults.red,
					progressText: "ERROR",
					timeout: 5000
				})
				.addEventListener("click", function(e) {
					NeatoLib.downloadFile(...def);
					e.currentTarget.close();
				});
			throw err;
		};

		try {
			const fs = require("fs"),
				protocol = require(url.match(/[http&https]+/)[0]);

			if (!path.endsWith("/")) path += "/";

			path = path.split("?")[0] + filename;

			if (fs.existsSync(path)) {
				NeatoLib.showToast(`"${filename}" already exists, random characters will be appended to the file name!`, "error");
				const fileExtension = "." + path.split(".")[path.split(".").length - 1];
				path = path.split(fileExtension).join(`${Math.random().toString(36).substring(10)}${fileExtension}`);
			}

			id = path.replace(/[^a-z0-9]/g, "");

			const startingToast = NeatoLib.showToast(`[<span style="color:${NeatoLib.Colors.DiscordDefaults.blue}">${filename}</span>]: Preparing download...`);

			const request = protocol.get(url, function(req) {
				let data = [],
					progress = 0,
					length;

				startingToast.close();
				if (length = req.headers["content-length"]) progressToast = NeatoLib.showProgressToast(id, "Downloading " + filename + "...", progress, length, {
					timeout: 10000
				});
				else progressToast = NeatoLib.showProgressToast(id, "Downloading " + filename + "...", 1, 1, {
					color: NeatoLib.Colors.DiscordDefaults.blue,
					progressText: "File size unknown",
					timeout: 10000
				});

				req.on("data", function(dataChunk) {
					data.push(dataChunk);
					progress += dataChunk.length;
					if (length) progressToast = NeatoLib.showProgressToast(id, "Downloading " + filename + "...", progress, length, {
						timeout: 10000
					});
				});

				req.on("end", function() {
					if (data.length == 0) return error("URL is invalid");
					progressToast = NeatoLib.showProgressToast(id, "Finished downloading " + filename, progress, length, {
						timeout: 3000
					});
					progressToast.addEventListener("click", () => {
						window.open("file:///" + path.substring(0, path.lastIndexOf("/")));
					});
					fs.writeFile(path, Buffer.concat(data), error);
					if (onCompleted) onCompleted(path, url);
				});
			});

			request.on("error", error);
			request.end();
		} catch (err) {
			error(err);
		}
	},

	requestFile: function(url, name = "unknown.png", onCompleted) {
		const http = require("https");

		const request = http.request(url, x => {
			const data = [];

			x.on("data", d => data.push(d));

			x.on("end", () => {
				if (onCompleted != undefined) onCompleted(new File([Buffer.concat(data)], name));
			});
		});

		request.on("error", error => {
			NeatoLib.showToast("Failed to request file! Error: " + error.message, "error");
		});

		request.end();
	},

	getClass: function(moduleName, className = moduleName, index = 0) {
		let temp = NeatoLib.Modules.get(moduleName);
		if(!temp || typeof temp[className] !== "string") return;
		if(!temp[className]) return temp[moduleName].split(" ")[index];
		return temp[className].split(" ")[index];
	},

	getClasses: function(classes, returnAll = true) {

		var found = {};

		for (var i = 0; i < classes.length; i++) {

			var module = NeatoLib.Modules.get(classes[i]);

			if (module != undefined) {

				for (var ii in module) {

					if (!returnAll && classes[i] != ii) continue;

					found[ii] = module[ii];

				}

			}

		}

		return found;

	},

	getSelectedGuild: function() {
		return NeatoLib.Modules.get("getGuild").getGuild(NeatoLib.Modules.get("getLastSelectedGuildId").getGuildId());
	},

	getSelectedGuildId: function() {
		return NeatoLib.Modules.get("getLastSelectedGuildId").getGuildId();
	},

	getSelectedTextChannel: function() {
		return NeatoLib.Modules.Stores.Channels.getChannel(NeatoLib.Modules.Stores.SelectedChannels.getChannelId());
	},

	getSelectedVoiceChannel: function() {
		return NeatoLib.Modules.Stores.Channels.getChannel(NeatoLib.Modules.Stores.SelectedChannels.getVoiceChannelId());
	},

	monkeyPatchInternal: function(module, funcName, newFunc) {

		const unpatched = module[funcName];

		module[funcName] = function() {
			return newFunc({
				module: this,
				args: arguments,
				unpatch: () => module[funcName] = unpatched,
				unpatched: unpatched,
				callDefault: () => unpatched.apply(this, arguments),
				callDefaultWithArgs: function() {
					this.unpatched.apply(this.module, arguments);
				}
			});
		};

		return module[funcName].unpatch = () => module[funcName] = unpatched;

	},

	patchInternalFunction: function(functionName, newFunction, pluginName, replace = false) {

		let module = NeatoLib.Modules.get(functionName);

		if (module == undefined) return console.warn("No module with function '" + functionName + "' found!");

		if (module[functionName + "_unpatched_" + pluginName] != undefined) return console.warn("This function is already patched by this plugin!");

		module[functionName + "_unpatched_" + pluginName] = module[functionName];

		module[functionName] = replace ? newFunction : function() {
			newFunction.apply(module, arguments);
			return module[functionName + "_unpatched_" + pluginName].apply(module, arguments);
		};

	},

	unpatchInternalFunction: function(functionName, pluginName) {

		let module = NeatoLib.Modules.get(functionName);

		if (module == undefined) {

			console.log("There are no modules that contain this function!");

			return;

		}

		if (module[functionName + "_unpatched_" + pluginName] == undefined) {

			console.log("This function is not patched!");

			return;

		}

		module[functionName] = module[functionName + "_unpatched_" + pluginName];
		delete module[functionName + "_unpatched_" + pluginName];

	},

	internalFunctionIsPatched: function(functionName, pluginName) {

		let module = NeatoLib.Modules.get(functionName);

		if (module == undefined) {

			console.log("There are no modules that contain this function!");

			return;

		}

		return module[functionName + "_unpatched_" + pluginName] != undefined;

	},

	patchInternalFunctions: function(functionNames, newFunction, pluginName, replace = false) {
		for (let i = 0; i < functionNames.length; i++) NeatoLib.patchInternalFunction(functionNames[i], newFunction, pluginName, replace);
	},

	unpatchInternalFunctions: function(functionNames, pluginName) {
		for (let i = 0; i < functionNames.length; i++) NeatoLib.unpatchInternalFunction(functionNames[i], pluginName);
	},

	getLocalUser: function() {
		return NeatoLib.Modules.Stores.Users.getCurrentUser();
	},

	getLocalStatus: function() {
		return NeatoLib.Modules.get("getApplicationActivity").getStatus(NeatoLib.getLocalUser().id);
	},

	browseForFile: function(callback, options = {}) {

		let fileBrowser = document.createElement("input");

		fileBrowser.type = "file";
		fileBrowser.style.display = "none";

		if (options.directory == true) {
			fileBrowser.setAttribute("webkitdirectory", true);
			fileBrowser.setAttribute("directory", true);
		}

		if (options.multiple == true) fileBrowser.setAttribute("multiple", true);

		document.head.appendChild(fileBrowser);

		fileBrowser.click();

		fileBrowser.addEventListener("change", () => {

			callback(options.multiple == true ? fileBrowser.files : fileBrowser.files[0]);

			fileBrowser.outerHTML = "";

		});

	},

	shuffleArray: function(array) {

		let idx = array.length,
			temp, random;

		while (idx != 0) {
			random = Math.floor(Math.random() * idx);
			idx--;
			temp = array[idx];
			array[idx] = array[random];
			array[random] = temp;
		}

		return array;

	},

	getPluginsFolderPath: function() {

		let proc = require("process"),
			path = require("path");

		switch (proc.platform) {
			case "win32":
				return path.resolve(proc.env.appdata, "BetterDiscord/plugins/");
			case "darwin":
				return path.resolve(proc.env.HOME, "Library/Preferences/", "BetterDiscord/plugins/");
			default:
				return path.resolve(proc.env.HOME, ".config/", "BetterDiscord/plugins/");
		}

	},

	getThemesFolderPath: function() {

		let proc = require("process"),
			path = require("path");

		switch (proc.platform) {
			case "win32":
				return path.resolve(proc.env.appdata, "BetterDiscord/themes/");
			case "darwin":
				return path.resolve(proc.env.HOME, "Library/Preferences/", "BetterDiscord/themes/");
			default:
				return path.resolve(proc.env.HOME, ".config/", "BetterDiscord/themes/");
		}

	},

	tryCreateToastContainer: function() {

		if (!document.getElementsByClassName("toasts").length) {

			const container = document.getElementsByClassName(NeatoLib.Modules.get(['sidebar', 'guilds']).guilds.split(" ")[0])[0].nextSibling,
				memberlist = container.getElementsByClassName(NeatoLib.Modules.get("membersWrap").membersWrap)[0],
				form = container ? container.getElementsByTagName("form")[0] : undefined,
				left = container ? container.getBoundingClientRect().left : 310,
				right = memberlist ? memberlist.getBoundingClientRect().left : 0,
				width = right ? right - container.getBoundingClientRect().left : container.offsetWidth,
				bottom = form ? form.offsetHeight : 80,
				toastWrapper = document.createElement("div");

			toastWrapper.classList.add("toasts");

			toastWrapper.style.left = left + "px";
			toastWrapper.style.width = width + "px";
			toastWrapper.style.bottom = bottom + "px";

			document.getElementsByClassName(NeatoLib.getClass("app"))[0].appendChild(toastWrapper);

		}

	},

	showToast: function(text, type, options = {}) {

		this.tryCreateToastContainer();

		const toast = document.createElement("div");

		toast.classList.add("toast");
		if (typeof type == "string") toast.classList.add("toast-" + type);
		if (options.icon) toast.classList.add("icon");
		if (options.color) toast.style.background = options.color;

		const destroy = toast.close = function() {
			toast.classList.add("closing");
			setTimeout(function() {
				toast.remove();
				if (!document.getElementsByClassName("toast").length) document.getElementsByClassName("toasts")[0].remove();
			}, 300);
		};

		if (options.onClick) toast.addEventListener("click", options.onClick);
		if (options.destroyOnClick) toast.addEventListener("click", destroy);

		toast.innerHTML = text;

		document.getElementsByClassName("toasts")[0].appendChild(toast);

		setTimeout(destroy, options.timeout || 3000);

		return toast;

	},

	showProgressToast: function(id, label, val, max, options = {}) {

		let bar;

		const destroy = function() {
			clearTimeout(bar.destroyTimeout);
			bar.classList.add("closing");
			setTimeout(function() {
				bar.remove();
				if (!document.getElementsByClassName("toast").length) document.getElementsByClassName("toasts")[0].remove();
			}, 300);
		};

		const updateBar = function() {

			bar.getElementsByClassName("toast-prog-bar-label")[0].innerHTML = label;

			const prog = bar.getElementsByClassName("toast-prog-bar-progress")[0];
			if (options.progressText) prog.innerHTML = options.progressText;
			else if (!isNaN(parseInt((val / max) * 100))) prog.innerText = parseInt((val / max) * 100) + "%";
			else prog.innerText = "ERROR";
			prog.style.width = ((val / max) * 500) + "px";

			if (options.color) prog.style.background = options.color;
			else prog.style.background = NeatoLib.Colors.DiscordDefaults.green;

			clearTimeout(bar.destroyTimeout);
			bar.destroyTimeout = setTimeout(destroy, options.timeout || 1500);

		};

		if (bar = document.getElementById("neato-toast-prog-bar-" + id)) {
			updateBar();
			return bar;
		}

		this.tryCreateToastContainer();

		document.getElementsByClassName("toasts")[0].insertAdjacentHTML("beforeend",
			`<div id="neato-toast-prog-bar-${id}" class="toast has-prog-bar">
			<div class="toast-prog-bar-label">${label}</div>
			<div class="toast-prog-bar-background">
				<div class="toast-prog-bar-progress" style="width:0">0%</div>
			</div>
		</div>`);

		bar = document.getElementById("neato-toast-prog-bar-" + id);
		bar.close = destroy;

		if (options.backgroundColor) bar.style.backgroundColor = options.backgroundColor;

		if (options.onClick) bar.addEventListener("click", options.onClick);
		if (options.destroyOnClick) bar.addEventListener("click", destroy);

		updateBar();

		return bar;

	},

	injectCSS: function(css) {

		let element = document.createElement("style");

		element.type = "text/css";

		element.innerText = css;

		document.head.appendChild(element);

		return {
			element: element,
			getStyle: selector => {
				let selectorIDX = css.indexOf(selector);
				if (selectorIDX == -1) return null;
				return css.substring(selectorIDX, selectorIDX + css.substring(selectorIDX, css.length).indexOf("}")).split("{")[1].trim();
			},
			append: toAppend => {
				css += toAppend;
				element.innerText = css;
			},
			destroy: () => {
				element.remove();
			}
		};

	},

	getSnowflakeCreationDate: function(id) {
		const epoch = 1420070400000;

		const toBinary = sf => {
			let binary = "",
				high = parseInt(sf.slice(0, -10)) || 0,
				low = parseInt(sf.slice(-10));

			while (low > 0 || high > 0) {
				binary = String(low & 1) + binary;

				low = Math.floor(low / 2);

				if (high > 0) {
					low += 5000000000 * (high % 2);
					high = Math.floor(high / 2);
				}
			}

			return binary;
		};

		return new Date(parseInt(toBinary(id).padStart(64).substring(0, 42), 2) + epoch);
	},

	setTimeout: function(func, delay) {
		try {
			const setTimeout = NeatoLib.Modules.get("_wrappedBuiltIns")._wrappedBuiltIns.find(([obj, name, func]) => obj == global && name == "setTimeout")[2];
			return setTimeout(func, delay);
		} finally {
			return global.setTimeout(func, delay);
		}
	}

};

var Metalloriff = NeatoLib;

var mesquite = BdApi.Plugins.getAll().map(x => x.getName());

for (let pluginName of mesquite) {
	if (typeof BdApi.Plugins.get(pluginName).onLibLoaded == "function" && !BdApi.Plugins.get(pluginName).ready) {
		setTimeout(() => {
			if (BdApi.Plugins.get(pluginName).onLibLoaded.toString().indexOf("NeatoLib.Events.onPluginLoaded") == -1) NeatoLib.Events.onPluginLoaded(BdApi.Plugins.get(pluginName));
		}, 100);
	}
}

if (window.activeNeatoEvents == undefined) window.activeNeatoEvents = [];

if (window.neatoObserver) window.neatoObserver.disconnect();
window.neatoObserver = new MutationObserver(mutations => {

	let call = (type, ...args) => {
		for (let i = 0; i < window.activeNeatoEvents.length; i++) {
			if (window.activeNeatoEvents[i].type == type) {
				if (typeof(window.activeNeatoEvents[i].callback) == "function") {
					try {
						window.activeNeatoEvents[i].callback(...args);
					} catch (err) {
						console.warn("Unable to call " + window.activeNeatoEvents[i].type + " event.", window.activeNeatoEvents[i].callback, err);
					}
				}
			}
		}
	};

	for (let i = 0; i < mutations.length; i++) {

		if (mutations[i].removedNodes[0] != undefined && mutations[i].removedNodes[0] instanceof Element) {
			if (mutations[i].removedNodes[0].id == "friends") {
				call("switch");
			}
		}

		let added = mutations[i].addedNodes[0];

		if (added == undefined || !(added instanceof Element)) continue;

		if (added.classList.contains(NeatoLib.Events.classes.layer)) call("settings");

		if (added.id == "friends") call("switch");

		if (added.classList.contains(NeatoLib.getClass("messagesWrapper")) || added.getElementsByClassName(NeatoLib.getClass("messagesWrapper"))[0] != undefined) call("switch");

		if ((added.classList.contains(NeatoLib.getClass("message")) && !added.className.includes("sending")) || added.classList.contains(NeatoLib.getClass("cozyMessage"))) call("message");

		if (window.neatoObserver.addedTextarea != (window.neatoObserver.addedTextarea = added.getElementsByClassName(NeatoLib.getClass("textArea"))[0]) && window.neatoObserver.addedTextarea) call("chatbox", window.neatoObserver.addedTextarea);

	}

});
window.neatoObserver.observe(document, {
	childList: true,
	subtree: true
});

NeatoLib.Modules.Stores = {
	Guilds: NeatoLib.Modules.get(["getGuild", "getGuilds"]),
	Channels: NeatoLib.Modules.get(["getChannel", "getChannels"]),
	SelectedChannels: NeatoLib.Modules.get(["getChannelId", "getVoiceChannelId"]),
	Users: NeatoLib.Modules.get(["getUser", "getUsers"]),
	Members: NeatoLib.Modules.get(["getMember", "getMembers"]),
};

NeatoLib.Events.classes = {
	layer: NeatoLib.Modules.get("layer").layer.split(" ")[0],
	socialLinks: NeatoLib.Modules.get("socialLinks").socialLinks.split(" ")[0]
};

NeatoLib.ContextMenu.classes = NeatoLib.Modules.get("contextMenu");

NeatoLib.getSelectedServer = NeatoLib.getSelectedGuild;
NeatoLib.getSelectedServerId = NeatoLib.getSelectedGuildId;

if (window.neatoStyles) window.neatoStyles.destroy();
window.neatoStyles = NeatoLib.injectCSS(`

	.toast.has-prog-bar {
		padding-top: 30px;
	}

	.toast-prog-bar-label {
		position: absolute;
		top: 8px;
	}

	.toast-prog-bar-background {
		height: 25px;
		width: 500px;
		border-radius: 5px;
		background: rgba(0,0,0,0.3);
		text-align: center;
		line-height: 25px;
	}

	.toast-prog-bar-progress {
		height: 25px;
		border-radius: 5px;
		background: green;
		text-align: center;
		line-height: 25px;
		position: relative;
		top: 0;
		padding: 0;
		transition: all 0.3s;
		overflow: hidden;
	}

	/* Below is CSS from Zerebos' PluginLibrary. https://rauenzi.github.io/BetterDiscordAddons/docs/PluginLibrary.js */

	#pluginNotice {-webkit-app-region: drag;border-radius:0;} #outdatedPlugins {font-weight:700;} #outdatedPlugins>span {-webkit-app-region: no-drag;color:#fff;cursor:pointer;} #outdatedPlugins>span:hover {text-decoration:underline;}

	.toasts{position:fixed;display:flex;top:0;flex-direction:column;align-items:center;justify-content:flex-end;pointer-events:none;z-index:4000}@keyframes toast-up{from{transform:translateY(0);opacity:0}}.toast{animation:toast-up .3s ease;transform:translateY(-10px);background:#36393F;padding:10px;border-radius:5px;box-shadow:0 0 0 1px rgba(32,34,37,.6),0 2px 10px 0 rgba(0,0,0,.2);font-weight:500;color:#fff;user-select:text;font-size:14px;opacity:1;margin-top:10px}@keyframes toast-down{to{transform:translateY(0);opacity:0}}.toast.closing{animation:toast-down .2s ease;animation-fill-mode:forwards;opacity:1;transform:translateY(-10px)}.toast.icon{padding-left:30px;background-size:20px 20px;background-repeat:no-repeat;background-position:6px 50%}.toast.toast-info{background-color:#4a90e2}.toast.toast-info.icon{background-image:url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptMSAxNWgtMnYtNmgydjZ6bTAtOGgtMlY3aDJ2MnoiLz48L3N2Zz4=)}.toast.toast-success{background-color:#43b581}.toast.toast-success.icon{background-image:url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMTIgMkM2LjQ4IDIgMiA2LjQ4IDIgMTJzNC40OCAxMCAxMCAxMCAxMC00LjQ4IDEwLTEwUzE3LjUyIDIgMTIgMnptLTIgMTVsLTUtNSAxLjQxLTEuNDFMMTAgMTQuMTdsNy41OS03LjU5TDE5IDhsLTkgOXoiLz48L3N2Zz4=)}.toast.toast-danger,.toast.toast-error{background-color:#f04747}.toast.toast-danger.icon,.toast.toast-error.icon{background-image:url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTEyIDJDNi40NyAyIDIgNi40NyAyIDEyczQuNDcgMTAgMTAgMTAgMTAtNC40NyAxMC0xMFMxNy41MyAyIDEyIDJ6bTUgMTMuNTlMMTUuNTkgMTcgMTIgMTMuNDEgOC40MSAxNyA3IDE1LjU5IDEwLjU5IDEyIDcgOC40MSA4LjQxIDcgMTIgMTAuNTkgMTUuNTkgNyAxNyA4LjQxIDEzLjQxIDEyIDE3IDE1LjU5eiIvPiAgICA8cGF0aCBkPSJNMCAwaDI0djI0SDB6IiBmaWxsPSJub25lIi8+PC9zdmc+)}.toast.toast-warn,.toast.toast-warning{background-color:#FFA600;color:#fff}.toast.toast-warn.icon,.toast.toast-warning.icon{background-image:url(data:image/svg+xml;base64,PHN2ZyBmaWxsPSIjRkZGRkZGIiBoZWlnaHQ9IjI0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4gICAgPHBhdGggZD0iTTAgMGgyNHYyNEgweiIgZmlsbD0ibm9uZSIvPiAgICA8cGF0aCBkPSJNMSAyMWgyMkwxMiAyIDEgMjF6bTEyLTNoLTJ2LTJoMnYyem0wLTRoLTJ2LTRoMnY0eiIvPjwvc3ZnPg==)}

`);

if (!document.getElementById("material-icons")) {
	const link = document.createElement("link");

	link.id = "material-icons";
	link.rel = "stylesheet";
	link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";

	document.head.appendChild(link);
}
