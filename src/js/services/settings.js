angular.module('coinBalanceApp')
  .factory('settings', function() {
    var SETTING_KEY = "coin-balance-settings";
    var DEFAULT_SETTINGS = {};

    return {
      save: function(settings) {
        store = {};
        store[SETTING_KEY] = settings
        chrome.storage.local.set(store, function() {
          if (chrome.runtime.lastError) {
            console.error(
              "Error setting " + key + " to " + JSON.stringify(data) +
              ": " + chrome.runtime.lastError.message
            );
          }
        });
      },
      fetch: function(callback) {
        chrome.storage.local.get(SETTING_KEY, (data) => {
          callback(data[SETTING_KEY] ? data[SETTING_KEY] :
            DEFAULT_SETTINGS);
        });
      }
    };
  });
