/**
 * Created by lenehuang on 3/3/14.
 */

var startRecord = function() {
  chrome.runtime.sendMessage({type: 'start'}, function(response) {
    console.log('[startRecord]:' + response.result);
  });
};

startRecord();

//chrome.storage.sync.clear();
