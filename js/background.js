/**
 * Created by lenehuang on 2/28/14.
 */
var DEBUG = false;
if(!DEBUG){
  if(!window.console) window.console = {};
  var methods = ["log", "debug", "warn", "info"];
  for(var i=0;i<methods.length;i++){
    console[methods[i]] = function(){};
  }
}

var WEBSITE_TYPE = {
  SNS: 'sns',
  GAME: 'game',
  ESHOP: 'eshop',
  MUSIC: 'music',
  VIDEO: 'video',
  NEWS: 'news',
  OTHER: 'other'
};

var FIRST_IN = 'init';

var WTFRUD = function() {
  this.start_time = 0;
  this.leave_time = 0;
  this.staying_time = 0;
  this.current_website_url = '';
  this.previous_website_url = FIRST_IN;
  this.previous_site_type = WEBSITE_TYPE.OTHER;
};

WTFRUD.prototype.afterGetCurrentUrl = function(url) {
  var oWTFRUD = this;
  var temp_start_time = oWTFRUD.start_time;

  oWTFRUD.current_website_url = url;
  oWTFRUD.start_time = Date.now();

  if(oWTFRUD.previous_website_url == FIRST_IN) {
    oWTFRUD.previous_website_url = oWTFRUD.current_website_url;
    oWTFRUD.getWebType();
  }

  if(oWTFRUD.current_website_url != oWTFRUD.previous_website_url) {
    console.log('leaving ' + oWTFRUD.previous_website_url + ', go to ' + oWTFRUD.current_website_url);
    oWTFRUD.leave_time = Date.now();
    oWTFRUD.staying_time = formatTime(oWTFRUD.leave_time - temp_start_time);

    if(!!oWTFRUD.staying_time) {
      syncData(afterSyncData);
    }
  }

};

WTFRUD.prototype.getWebType = function() {
  var oWTFRUD = this;

  // first, search in the whitelist
  $.ajax(chrome.extension.getURL('/data/whitelist.json'), {
    dataType: 'JSON',
    success: function(response) {
      var websites = response.websites;
      var type = WEBSITE_TYPE.OTHER;

      for(var key in websites) {
        if(oWTFRUD.current_website_url.toLowerCase().indexOf(websites[key].url) >= 0) {
          type = websites[key].type;
          break;
        }
      }
      console.log('[getWebType]:' + type);
      oWTFRUD.previous_site_type = type;
    },
    error: function() {
      console.log('[getWebType]: error -' + 'can\'t get whitelist data!');
    }
  });

  //second, dig the page content
  //TODO:
}


var formatTime = function(time) {
  var formatedTime;

  formatedTime = parseInt(time / 60000);
  if(formatedTime < 1)formatedTime = 1;

  return formatedTime;
};

var afterSyncData = function() {
  if(!!wtfrudoing.current_website_url) {
    wtfrudoing.previous_website_url = wtfrudoing.current_website_url;
    wtfrudoing.getWebType();
  }
};

/*
 * Sync data:
 * Sync Websites reading time and type to Chrome sync db
 * Don't consider the offline usage in version 1.0
 */
var syncData = function(afterSyncData) {
  var mydata = "reading_log";
  var previous_data = [];
  var updated_data = [];
  var used = false;

  var sync = function() {
    if(previous_data != undefined && previous_data.length > 0) {
      $.each(previous_data, function(key, item) {
        if(item.type == wtfrudoing.previous_site_type) {
          item.time += wtfrudoing.staying_time;
          used = true;
        }
        updated_data.push(item);
      });
    }

    if(!used) {
      updated_data.push({
        'type': wtfrudoing.previous_site_type,
        'time': wtfrudoing.staying_time
      });
    }

    //  4.3 save to storage
    chrome.storage.sync.set({'reading_log': updated_data}, function() {
      afterSyncData();
      console.log('[syncData]: Data saved in the storage: ', updated_data);
    });
  }

  chrome.storage.sync.get(mydata, function(items) {
    previous_data = items[mydata];
    console.log('[syncData]: Get sync data: ', items[mydata]);

    sync();
  });

}

var wtfrudoing = new WTFRUD();

var GET_CURRENT_URL = function(callback) {
  chrome.windows.getCurrent(function (currentWindow) {
    chrome.tabs.query({active: true, windowId: currentWindow.id}, function(activeTabs) {
      var url = activeTabs[0].url;

      callback.apply(wtfrudoing, [url]);
    });
  });
};

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  var type = message.type;

  switch (type) {
    case 'start':
      GET_CURRENT_URL(WTFRUD.prototype.afterGetCurrentUrl);
      sendResponse({result: 'Mission received!'});
      break;
  }

  // TRUE - after get the result, then send back the message
  return true;
});

chrome.tabs.onActiveChanged.addListener(function() {
  console.log('[chrome.tabs.onActived.addListener]: called');

  GET_CURRENT_URL(WTFRUD.prototype.afterGetCurrentUrl);
});

