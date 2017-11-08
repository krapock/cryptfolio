angular.module('coinBalanceApp')
  .factory('settings', function(persist) {
    const SETTING_KEY = "coin-balance-settings";
    return {
      save: function(settings) {
        persist.save(SETTING_KEY, settings);
      },
      fetch: function(callback) {
        persist.fetch(SETTING_KEY, callback);
      }
    };
  });
