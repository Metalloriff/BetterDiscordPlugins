//META{"name":"HideBlockedMessages"}*//

class HideBlockedMessages {
	
    getName() { return "Hide Blocked Messages"; } 
    getDescription() { return "Very simple plugin that removes annoying blocked messages from the chat."; }
    getVersion() { return "0.0.1"; }
    getAuthor() { return "Metalloriff"; }

    load() {}

    start() {
		BdApi.injectCSS("hide-blocked-messages-css", ".message-group-blocked { display: none !important; }");
		HideBlockedMessages.initialzed = true;
	}
	
    stop() {
		BdApi.clearCSS("hide-blocked-messages-css");
	}
	
}