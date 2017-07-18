angular.module('coinBalanceApp')
  .component('extNum', {
    templateUrl: 'templates/extNum.html',
    controller: function($filter) {
      var ctrl = this;

      ctrl.number = 0;
      ctrl.decimals = 2;
      ctrl.globalMove = '=';
      ctrl.tickMove = '=';
      ctrl.numberShown = '0.00';
      ctrl.symbol = '';

      ctrl.$onChanges = function(changes) {

        var valueThreshold = Math.pow(0.1, ctrl.decimals || 2);

        if (ctrl.number > valueThreshold) {
          ctrl.globalMove = '+';
        } else if (ctrl.number < (0 - valueThreshold)) {
          ctrl.globalMove = '-';
        }

        ctrl.tickMove = '=';

        if (!changes.number.isFirstChange()) {
          if (changes.number.currentValue > changes.number.previousValue +
            valueThreshold) {
            console.log('ticking up : ' + ctrl.number);
            ctrl.tickMove = '+';

          } else if (changes.number.currentValue < changes.number.previousValue -
            valueThreshold) {
            console.log('ticking down : ' + ctrl.number);
            ctrl.tickMove = '-';
          }
        }

        ctrl.numberShown = $filter('currency')(ctrl.number, '', ctrl.decimals);
      }
    },
    bindings: {
      number: '<',
      decimals: '<',
      symbol: '<'
    }
  });
