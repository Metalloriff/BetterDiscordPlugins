/**
 * @name TheClapBestClapPluginClapEver
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TheClapBestClapPluginClapEver.plugin.js
 */

module.exports = (() =>
{
	const config =
	{
		info:
		{
			name: "TheClapBestClapPluginClapEver",
			authors:
			[
				{
					name: "Metalloriff",
					discord_id: "264163473179672576",
					github_username: "metalloriff",
					twitter_username: "Metalloriff"
				}
			],
			version: "2.0.0",
			description: "Literally useless, toxic cancer. Write 'clapclap$' at the beginning of your message to separate each word with a clap emoji. Write 'clapclap( :your_emoji: )$' to separate each word with your own custom emoji. 'superclapclap$' or 'superclapclap( :emoji: )$' for every letter instead of every word. 'ra$' to replace every letter with a regional indicator emoji. 'reverse$' to reverse your message. 'b$' to replace every 'b' with the B emoji. 'owo$' if you have no will to live.",
			github: "https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/TheClapBestClapPluginClapEver.plugin.js",
			github_raw: "https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/TheClapBestClapPluginClapEver.plugin.js"
		}
	};

	return (([Plugin, Api]) => {

		const plugin = (Plugin, Api) =>
		{
			const { DiscordModules, Patcher } = Api;

			return class TheClapBestClapPluginClapEver extends Plugin
			{
				constructor()
				{
					super();
				}
	
				onStart()
				{
					Patcher.after(DiscordModules.MessageActions, "sendMessage", (_, [, message]) =>
					{
						const content = message.content.toLowerCase();
						const clapclap = (/^clapclap(\S| )*\$ /g).exec(content) || (/^superclapclap(\S| )*\$ /g).exec(content);
						
						if (clapclap)
						{	
							const filler = clapclap[0].includes("(") && clapclap[0].includes(")")
								? clapclap[0].substr(clapclap[0].indexOf("(") + 1, clapclap[0].indexOf(")") - clapclap[0].indexOf("(") - 1)
								: " :clap: ";
								
							message.content = message.content.substr(clapclap[0].length, message.content.length)
								.split(clapclap[0].startsWith("super") ? "" : " ")
								.join(filler);
								
							message.content = filler + message.content + filler;

							return;
						}

						switch (content.split("$")[0])
						{
							case "ra":
								const ra = (/^ra\$ /g).exec(content);

								message.content = message.content.substr(ra[0].length, message.content.length)
									.split(" ")
									.join("\t")
									.replace(/[A-Za-z]/g, x => ` :regional_indicator_${x}: `);
								
								break;

							case "reverse":
								const reverse = (/^reverse\$ /g).exec(content);

								message.content = message.content.substr(reverse[0].length, message.content.length)
									.split("")
									.reverse()
									.join("");

								break;

							case "owo":
								const owo = (/^owo\$ /g).exec(content);

								message.content = message.content.substr(owo[0].length, message.content.length)
									.replace(/r/g, "w")
									.replace(/R/g, "W")
									.replace(/l/g, "w")
									.replace(/L/g, "W")
									.replace(/ n/g, " ny")
									.replace(/ N/g, " Ny")
									.replace(/ove/g, "uv")
									.replace(/OVE/g, "UV")
									+ " " + ["owo", "OwO", "uwu", "UwU", ">w<", "^w^", "♥w♥"][7 * Math.random() << 0];

								break;

							case "b":
								const b = (/^b\$ /g).exec(content);

								message.content = message.content.substr(b[0].length, message.content.length)
									.replace(/b/g, ":b:");

								break;
						}
					});
				}
	
				onStop()
				{
					Patcher.unpatchAll();
				}
			}
		};

		return plugin(Plugin, Api);
	})(global.ZeresPluginLibrary.buildPlugin(config));
})();
