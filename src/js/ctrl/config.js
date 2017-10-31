angular.module('coinBalanceApp')
  .controller('ConfigController', function(data) {

    var config = this;
    config.currencies = data.currencies;
    config.main = data.config;
    config.save = data.saveSettings;

  });
