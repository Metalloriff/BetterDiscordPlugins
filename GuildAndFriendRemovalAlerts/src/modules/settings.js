import pkg from "../package.json";
import { PluginUtilities } from "@zlibrary";

export default class Settings {
    static settings = PluginUtilities.loadSettings(pkg.info.name, {});
    
    static get = (key, defaultValue) => Settings.settings[key] ?? defaultValue;
    static set = (key, value) => {
        Settings.settings[key] = value;
        Settings.save();
    };
    
    static save = () => PluginUtilities.saveSettings(pkg.info.name, Settings.settings);
}