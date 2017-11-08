angular.module('coinBalanceApp')
  .factory('menu', function() {
    var menu = this;

    menu.updateBadgeVal = function(value) {
      if (!isNaN(value)) {
        let absval = value > 0 ? value : 0 - value;
        let text = '';
        if (absval < 1) {
          text = ('' + absval).substr(1, 5);
        } else if (absval < 100) {
          text = ('' + absval).substr(0, 4);
        } else if (absval < 1000) {
          text = ('' + absval).substr(0, 3);
        } else {
          text = ('' + absval / 1000).substr(0, 3) + 'k';
        }
        let color = value > 0 ? '#080' : '#800';
        menu.updateBadge(text, color);
      }
    }
    menu.updateBadgePerc = function(percentage) {
      if (!isNaN(percentage)) {
        let text = ('' + percentage).substr(0, 4);
        let color = percentage > 0 ? '#080' : '#800';
        menu.updateBadge(text, color);
      }
    }
    menu.updateBadge = function(text, color) {
      chrome.browserAction.setBadgeText({
        'text': text
      });
      chrome.browserAction.setBadgeBackgroundColor({
        'color': color
      });
    }

    return menu;
  });
