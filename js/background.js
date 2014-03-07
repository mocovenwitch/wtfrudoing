/**
 * Created by lenehuang on 2/28/14.
 */

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    var type = message.type;
    switch (type) {
        case 'current_url':
            var url;
            chrome.windows.getCurrent(function (currentWindow) {
                chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
                    url = activeTabs[0].url;
                    sendResponse({result: url});
                });
            });
            break;
    }

    // TRUE - after get the result, then send back the message
    return true;
});
