angular.module('coinBalanceApp')
  .controller('ConfigController', function(data, $scope) {

    var config = this;
    config.currencies = data.currencies;

    config.reloadMainConf = () => {
      config.main = {
        selectedCurrency: data.config.selectedCurrency,
        refreshdelay: data.config.refreshdelay / 1000
      }
    }
    $scope.$watch(() => data.config.selectedCurrency + "#" + data.config.refreshdelay, (
      curr) => {
      config.reloadMainConf();
    });

    config.toggle = (cur) => {
      data.currencies[cur].active = !data.currencies[cur].active;
      data.saveSettings();
    }
    config.toggleMain = (cur) => {
      data.config.selectedCurrency = cur;
      data.saveSettings();
    }

    config.updateDelay = () => {
      data.config.refreshdelay = config.main.refreshdelay * 1000;
      data.saveSettings();
      config.reloadMainConf();
    }
    config.reloadMainConf();
  });
