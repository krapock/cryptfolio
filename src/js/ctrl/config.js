angular.module('coinBalanceApp')
  .controller('ConfigController', function(data, $scope) {

    var config = this;
    config.currencies = data.currencies;
    config.main = data.config;

    $scope.$watch(() => data.config.selectedCurrency, (curr) => {
      config.main = data.config;
    });

    config.toggle = (cur) => {
      data.currencies[cur].active = !data.currencies[cur].active;
      data.saveSettings();
    }
    config.toggleMain = (cur) => {
      data.config.selectedCurrency = cur;
      data.saveSettings();
    }
  });
