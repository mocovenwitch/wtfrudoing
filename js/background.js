/**
 * Created by lenehuang on 2/28/14.
 */

/* storage */

var ReportStorage = {
  saveData: function(dataKey, dataObject) {
    var reportObject = {dataKey: dataObject};
    chrome.storage.sync.set(reportObject, function() {
        console.log('Data synced.');
    });
  },
  getData: function(dataKey) {
    chrome.storage.sync.get(dataKey, function(dataObject) {
        console.log('get' + dataObject);
        this.data = dataObject;
    });
  },
  pullToLocal: function() {
      if (areaName === 'sync') {
          chrome.storage.local.clear();
          chrome.storage.local.set(dataKey, dataObject);
      }
  },
  data: ''
};


chrome.storage.onChanged.addListener(function(changes, areaName) {
    for (key in changes) {
        var storageChange = changes[key];
        console.log('Storage key "%s" in namespace "%s" changed. ' +
            'Old value was "%s", new value is "%s".',
            key,
            namespace,
            storageChange.oldValue,
            storageChange.newValue);
    }
});