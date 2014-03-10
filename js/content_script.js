/**
 * Created by lenehuang on 3/3/14.
 */

var getCurrentURL = function() {
  var url;

  console.log('[getCurrentURL]: called');
  chrome.runtime.sendMessage({type: 'current_url'}, function(response) {
    url = response.result;
    console.log('[getCurrentURL]:' + url);
//    onGetWebsiteUrllisterner(url);
  });
};

getCurrentURL();

//chrome.storage.sync.clear();
