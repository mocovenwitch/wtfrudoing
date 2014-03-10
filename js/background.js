/**
 * Created by lenehuang on 2/28/14.
 */

/*
 * WEBSITE_TYPE:
 * Describe the types of all the Websites
 */
var WEBSITE_TYPE = {
  SNS: 'sns',
  GAME: 'game',
  ESHOP: 'eshop',
  MUSIC: 'music',
  VIDEO: 'video',
  NEWS : 'news',
  OTHER: 'other'
};

/*
 * Time recorder:
 * Record the start time, leave time, and calculate the staying time
 *
 * start_time: the time after get the Website type
 * leave_time: current tab is inactive
 * staying_time: leave_time - start_time
 */
var start_time, leave_time, staying_time;

/*
 * Website URL:
 * Record the current URL and previous one
 */
var current_website_url = '', previous_website_url = '-1';

/*
 * Website Type
 */
var previous_site_type = WEBSITE_TYPE.OTHER;

var getWebType = function(url) {
  var currentUrl = url;

  // first, search in the whitelist
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

  //second, dig the page content
  //TODO:
}

var onGetWebsiteUrllisterner = function(url) {
  console.log('[onGetWebsiteUrllisterner]: called');

  var currentUrl = url;
  if(!!currentUrl) {
    getWebType(currentUrl);
  } else {
    console.log('[onGetWebsiteUrllisterner]: ' + 'Can\'t get Website type without URL!');
  }
}

var onGetWebsiteTypelistener = function(url, type) {
  console.log('[onGetWebsiteTypelistener]: called');

  if(!!type) {
    previous_site_type = type;
  } else {
    console.log('[onGetWebsiteTypelistener]: ' + 'Failed to get the Website type!');
  }
  start_time = Date.now();
}

var afterSyncData = function() {
  onGetWebsiteUrllisterner(current_website_url);
  previous_website_url = current_website_url;
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
        if(item.type == previous_site_type) {
          item.time += staying_time;
          used = true;
        }
        updated_data.push(item);
      });
    }

    if(!used) {
      updated_data.push({
        'type': previous_site_type,
        'time': staying_time
      });
    }

    //  4.3 save to storage
    console.log(updated_data);
    chrome.storage.sync.set({"reading_log": updated_data}, function() {
      console.log('[syncData]: ' + 'Data saved in the storage.')
    });

    afterSyncData();
  }

  chrome.storage.sync.get("reading_log", function(items) {
    previous_data = items["reading_log"];
    console.log('[syncData]: Get sync data.' + items["reading_log"]);

    sync(afterSyncData);
  });

}


chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var type = message.type;

  switch (type) {
    case 'current_url':
      var url;
      chrome.windows.getCurrent(function (currentWindow) {
        chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
          url = activeTabs[0].url;
          current_website_url = url;
          previous_website_url = url;

          onGetWebsiteUrllisterner(current_website_url);

          sendResponse({result: url});
        });
      });
      break;
  }

  // TRUE - after get the result, then send back the message
  return true;
});


chrome.tabs.onActiveChanged.addListener(function() {
  console.log('[chrome.tabs.onActived.addListener]: called');

  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
      url = activeTabs[0].url;
      current_website_url = url

      if(current_website_url != previous_website_url) {
        console.log('leaving ' + previous_website_url + ', goto ' + current_website_url);
        leave_time = Date.now();
        staying_time = formatTime(leave_time - start_time);

        if(!!staying_time) {
          syncData(afterSyncData);
        }
      }
    });
  });
});

var formatTime = function(time) {
  var formatedTime = 0;

  formatedTime = parseInt(time / 60000);
  if(formatedTime < 1)formatedTime = 1;

  return formatedTime;
}