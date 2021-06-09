import React from "react";
import createUpdateWrapper from "../../../common/hooks/createUpdateWrapper";
import { WebpackModules } from "@zlibrary";
import Settings from "../modules/settings";

const Switch = createUpdateWrapper(WebpackModules.getByDisplayName("SwitchItem"));

export default function SettingsPanel() {
    return (
        <div className="gafSettingsPanel">
            <Switch note="Whether or not to automatically show the modal when a guild/friend is removed."
                    value={Settings.get("showModal", true)}
                    onChange={value => Settings.set("showModal", value)}>Auto Show Modal</Switch>
            
            <Switch note="Whether or not to show desktop notifications when a guild/friend is removed."
                    value={Settings.get("showDeskNotifs", false)}
                    onChange={value => Settings.set("showDeskNotifs", value)}>Show Desktop Notifications</Switch>
        </div>
    );
}