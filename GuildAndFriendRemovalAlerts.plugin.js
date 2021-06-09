/**
 * @name GuildAndFriendRemovalAlerts
 * @invite yNqzuJa
 * @authorLink https://github.com/Metalloriff
 * @donate https://www.paypal.me/israelboone
 * @website https://metalloriff.github.io/toms-discord-stuff/
 * @source https://github.com/Metalloriff/BetterDiscordPlugins/blob/master/GuildAndFriendRemovalAlerts.plugin.js
 */

const name = "GuildAndFriendRemovalAlerts";
const newUrl = "https://github.com/Metalloriff/BetterDiscordPlugins/tree/master/" + name;
const rawUrl = `https://raw.githubusercontent.com/Metalloriff/BetterDiscordPlugins/master/${name}/${name}.plugin.js`;

module.exports = (() => {
    const config = {
        info: {
            name: "0 GuildAndFriendRemovalAlerts OUTDATED",
            authors: [{
                name: "Metalloriff",
                discord_id: "264163473179672576",
                github_username: "metalloriff",
                twitter_username: "Metalloriff"
            }],
            version: "999.999.999",
            description: `Please delete this plugin and download the new one at ${newUrl}.`
        }
    };
    
    return class {
        getName = () => config.info.name;
        getAuthor = () => config.info.authors[0].name;
        getDescription = () => config.info.description;
        getVersion = () => config.info.version;
        
        load() {
            BdApi.showConfirmationModal("Outdated Plugin", `This version of ${name} is outdated, consider installing the newest one by clicking the "Update Now" button.`, {
                onConfirm: () => {
                    const https = require("https");
                    const fs = require("fs");
                    const path = require("path");

                    https.get(rawUrl, res => {
                        const chunks = [];
                        res.on("data", chunk => chunks.push(chunk));

                        res.on("end", () => {
                            try {
                                fs.writeFileSync(path.resolve(BdApi.Plugins.folder, path.basename(rawUrl)), chunks.join(""), "utf8");
                            } catch (error) {
                                console.error(name, error);
                                BdApi.showToast("Failed to download new update - check the console for details", { type: "error" });
                            }
                        });
                    });
                }
            });
        }
        
        start() {  }
        stop() {  }
    };
})();
