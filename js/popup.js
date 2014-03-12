/**
 * Created by lenehuang on 2/25/14.
 */

$('#goto_report').click(function() {
  chrome.tabs.create({url: 'pages/report.html'});
});

$('#clear_history').click(function() {
  chrome.storage.sync.clear();
});