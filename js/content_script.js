/**
 * Created by lenehuang on 3/3/14.
 */

//eshop/sns/music/video/game/news/other
var WEBSITE_TYPE = {
    SNS: 'sns',
    GAME: 'game',
    ESHOP: 'eshop',
    MUSIC: 'music',
    VIDEO: 'video',
    NEWS : 'news',
    OTHER: 'other'
};

var getCurrentURL = function() {
    var url;
    chrome.runtime.sendMessage({type: 'current_url'}, function(response) {
        url = response.result;
        console.log('[getCurrentURL]:' + url);
        onGetWebsiteUrllisterner(url);
    });
};

var getWebType = function(url) {
    var currentUrl = url;

    //first search in the whitelist
    $.ajax(chrome.extension.getURL('/data/whitelist.json'), {
        dataType: 'JSON',
        success: function(response) {
            var websites = response.websites;
            var type = WEBSITE_TYPE.OTHER;

            for(var key in websites) {
                if(currentUrl.toLowerCase().indexOf(websites[key].url) >= 0) {
                    type = websites[key].type;
                    break;
                }
            }
            console.log('[getWebType]:' + type);
            onGetWebsiteTypelistener(currentUrl, type);
        },
        error: function() {
            console.log('[getWebType]: error -' + 'can\'t get whitelist data!');
        }
    });
}

// 1. Detect current tab
getCurrentURL();

// 2. find the current tab type
var onGetWebsiteUrllisterner = function(url) {
    console.log('[onGetWebsiteUrllisterner]: called');

    var currentUrl = url;
    getWebType(currentUrl);
}

// 3. calculate the time when leave current tab
var onGetWebsiteTypelistener = function(url, type) {
    console.log('[onGetWebsiteTypelistener]: called');
}
// 4. sync to storage

//  4.1 get previous data

//  4.2 update the data

//  4.3 save to storage