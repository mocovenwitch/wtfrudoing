/**
 * Created by lenehuang on 2/28/14.
 */

'use strict'
var WEBSITE_TYPE = {
  SNS: 'sns',
  GAME: 'game',
  ESHOP: 'eshop',
  MUSIC: 'music',
  VIDEO: 'video',
  NEWS: 'news',
  OTHER: 'other'
};


var WTFRUD = function() {
  this.start_time = 0;
  this.leave_time = 0;
  this.staying_time = 0;
  this.current_website_url = 0;
  this.previous_website_url = '';
  this.previous_site_type = WEBSITE_TYPE.OTHER;
};

WTFRUD.prototype.afterGetCurrentUrl = function(url) {
  this.current_website_url = url

  if(this.current_website_url != this.previous_website_url) {
    console.log('leaving ' + this.previous_website_url + ', go to ' + this.current_website_url);
    this.leave_time = Date.now();
    this.staying_time = formatTime(this.leave_time - this.start_time);

    if(!!this.staying_time) {
      syncData(afterSyncData);
    }
  }
};

WTFRUD.prototype.getWebType = function() {
  // first, search in the whitelist
  $.ajax(chrome.extension.getURL('/data/whitelist.json'), {
    dataType: 'JSON',
    success: function(response) {
      var websites = response.websites;
      var type = WEBSITE_TYPE.OTHER;

      for(var key in websites) {
        if(WTFRUD.current_website_url.toLowerCase().indexOf(websites[key].url) >= 0) {
          type = websites[key].type;
          break;
        }
      }
      console.log('[getWebType]:' + type);
      onGetWebsiteTypelistener(type);
    },
    error: function() {
      console.log('[getWebType]: error -' + 'can\'t get whitelist data!');
    }
  });

  //second, dig the page content
  //TODO:
}

var onGetWebsiteUrllisterner = function() {
  console.log('[onGetWebsiteUrllisterner]: called');

  if(!!WTFRUD.current_website_url) {
    wtfrudoing.getWebType();
  } else {
    console.log('[onGetWebsiteUrllisterner]: ' + 'Can\'t get Website type without URL!');
  }
}

var onGetWebsiteTypelistener = function(type) {
  console.log('[onGetWebsiteTypelistener]: called');

  if(!!type) {
    WTFRUD.previous_site_type = type;
  } else {
    console.log('[onGetWebsiteTypelistener]: ' + 'Failed to get the Website type!');
  }
  WTFRUD.start_time = Date.now();
}

var afterSyncData = function() {
  onGetWebsiteUrllisterner();
  WTFRUD.previous_website_url = WTFRUD.current_website_url;
}


/*
 * Sync data:
 * Sync Websites reading time and type to Chrome sync db
 * Don't consider the offline usage in version 1.0
 */
var syncData = function(afterSyncData) {
  //  4.1 get previous data
  var mydata = "reading_log";
  var previous_data = [];
  var updated_data = [];
  var used = false;

  var sync = function(afterSyncData) {
    if(previous_data != undefined && previous_data.length > 0) {
      //  4.2 update the data
      $.each(previous_data, function(key, item) {
        if(item.type == WTFRUD.previous_site_type) {
          item.time += WTFRUD.staying_time;
          used = true;
        }
        updated_data.push(item);
      });
    }

    if(!used) {
      updated_data.push({
        'type': WTFRUD.previous_site_type,
        'time': WTFRUD.staying_time
      });
    }

    //  4.3 save to storage
    chrome.storage.sync.set({"reading_log": updated_data}, function() {
      afterSyncData();
      console.log('[syncData]: Data saved in the storage: ', updated_data);
    });


  }

  chrome.storage.sync.get("reading_log", function(items) {
    previous_data = items["reading_log"];
    console.log('[syncData]: Get sync data: ', items["reading_log"]);

    sync(afterSyncData);
  });

}

var wtfrudoing = new WTFRUD();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var type = message.type;

  switch (type) {
    case 'current_url':
      var url;
      chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
          url = activeTabs[0].url;
          WTFRUD.current_website_url = url;
          WTFRUD.previous_website_url = url;

          onGetWebsiteUrllisterner();

          sendResponse({result: url});
        });
      });
      break;
  }

  // TRUE - after get the result, then send back the message
  return true;
});

var GET_CURRENT_URL = function(callback) {
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
      var url = activeTabs[0].url;
      callback(url);
    });
  });
};

chrome.tabs.onActiveChanged.addListener(function() {
  console.log('[chrome.tabs.onActived.addListener]: called');

  GET_CURRENT_URL(WTFRUD.prototype.afterGetCurrentUrl);
});

var formatTime = function(time) {
  var formatedTime;

  formatedTime = parseInt(time / 60000);
  if(formatedTime < 1)formatedTime = 1;

  return formatedTime;
}