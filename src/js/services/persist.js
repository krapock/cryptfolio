angular.module('coinBalanceApp')
  .factory('persist', function() {
    return {
      save: function(key, data) {
        store = {};
        store[key] = data
        chrome.storage.local.set(store, function() {
          if (chrome.runtime.lastError) {
            console.error(
              "Error setting " + key + " to " + JSON.stringify(data) +
              ": " + chrome.runtime.lastError.message
            );
          }
        });
      },
      fetch: function(key, callback) {
        chrome.storage.local.get(key, (data) => {
          callback(data[key] ? data[key] : {});
        });
      }
    };
  });
