'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function uuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }
  return '' + s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

var GoogleAnalytics = (function () {
  function GoogleAnalytics() {
    _classCallCheck(this, GoogleAnalytics);
  }

  _createClass(GoogleAnalytics, null, [{
    key: 'getCid',
    value: function getCid(cb) {
      var _this = this;

      if (this.cid) {
        cb(this.cid);
        return;
      }

      require('getmac').getMac(function (error, macAddress) {
        return error ? cb(_this.cid = uuid()) : cb(_this.cid = require('crypto').createHash('sha1').update(macAddress, 'utf8').digest('hex'));
      });
    }
  }, {
    key: 'sendEvent',
    value: function sendEvent(category, action, label, value) {
      var params = {
        t: 'event',
        ec: category,
        ea: action
      };
      if (label) {
        params.el = label;
      }
      if (value) {
        params.ev = value;
      }

      this.send(params);
    }
  }, {
    key: 'send',
    value: function send(params) {
      var _this2 = this;

      if (!atom.packages.getActivePackage('metrics')) {
        // If the metrics package is disabled, then user has opted out.
        return;
      }

      GoogleAnalytics.getCid(function (cid) {
        Object.assign(params, { cid: cid }, GoogleAnalytics.defaultParams());
        _this2.request('https://www.google-analytics.com/collect?' + require('querystring').stringify(params));
      });
    }
  }, {
    key: 'request',
    value: function request(url) {
      if (!navigator.onLine) {
        return;
      }
      this.post(url);
    }
  }, {
    key: 'post',
    value: function post(url) {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.send(null);
    }
  }, {
    key: 'defaultParams',
    value: function defaultParams() {
      // https://developers.google.com/analytics/devguides/collection/protocol/v1/parameters
      return {
        v: 1,
        tid: 'UA-47615700-5'
      };
    }
  }]);

  return GoogleAnalytics;
})();

exports['default'] = GoogleAnalytics;

atom.packages.onDidActivatePackage(function (pkg) {
  if ('metrics' === pkg.name) {
    var buildPackage = atom.packages.getLoadedPackage('build');
    require('./google-analytics').sendEvent('core', 'activated', buildPackage.metadata.version);
  }
});
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvZ29vZ2xlLWFuYWx5dGljcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7QUFFWixTQUFTLElBQUksR0FBRztBQUNkLFdBQVMsRUFBRSxHQUFHO0FBQ1osV0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQSxHQUFJLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDNUU7QUFDRCxjQUFVLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxTQUFJLEVBQUUsRUFBRSxTQUFJLEVBQUUsRUFBRSxTQUFJLEVBQUUsRUFBRSxTQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxDQUFHO0NBQ3ZFOztJQUVvQixlQUFlO1dBQWYsZUFBZTswQkFBZixlQUFlOzs7ZUFBZixlQUFlOztXQUNyQixnQkFBQyxFQUFFLEVBQUU7OztBQUNoQixVQUFJLElBQUksQ0FBQyxHQUFHLEVBQUU7QUFDWixVQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2IsZUFBTztPQUNSOztBQUVELGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBQyxLQUFLLEVBQUUsVUFBVSxFQUFLO0FBQzlDLGVBQU8sS0FBSyxHQUNWLEVBQUUsQ0FBQyxNQUFLLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQyxHQUNyQixFQUFFLENBQUMsTUFBSyxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLE1BQU0sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO09BQ2hHLENBQUMsQ0FBQztLQUNKOzs7V0FFZSxtQkFBQyxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7QUFDL0MsVUFBTSxNQUFNLEdBQUc7QUFDYixTQUFDLEVBQUUsT0FBTztBQUNWLFVBQUUsRUFBRSxRQUFRO0FBQ1osVUFBRSxFQUFFLE1BQU07T0FDWCxDQUFDO0FBQ0YsVUFBSSxLQUFLLEVBQUU7QUFDVCxjQUFNLENBQUMsRUFBRSxHQUFHLEtBQUssQ0FBQztPQUNuQjtBQUNELFVBQUksS0FBSyxFQUFFO0FBQ1QsY0FBTSxDQUFDLEVBQUUsR0FBRyxLQUFLLENBQUM7T0FDbkI7O0FBRUQsVUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNuQjs7O1dBRVUsY0FBQyxNQUFNLEVBQUU7OztBQUNsQixVQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLENBQUMsRUFBRTs7QUFFOUMsZUFBTztPQUNSOztBQUVELHFCQUFlLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBRyxFQUFLO0FBQzlCLGNBQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLGVBQWUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ3JFLGVBQUssT0FBTyxDQUFDLDJDQUEyQyxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztPQUN0RyxDQUFDLENBQUM7S0FDSjs7O1dBRWEsaUJBQUMsR0FBRyxFQUFFO0FBQ2xCLFVBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFO0FBQ3JCLGVBQU87T0FDUjtBQUNELFVBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDaEI7OztXQUVVLGNBQUMsR0FBRyxFQUFFO0FBQ2YsVUFBTSxHQUFHLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztBQUNqQyxTQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN0QixTQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2hCOzs7V0FFbUIseUJBQUc7O0FBRXJCLGFBQU87QUFDTCxTQUFDLEVBQUUsQ0FBQztBQUNKLFdBQUcsRUFBRSxlQUFlO09BQ3JCLENBQUM7S0FDSDs7O1NBN0RrQixlQUFlOzs7cUJBQWYsZUFBZTs7QUFnRXBDLElBQUksQ0FBQyxRQUFRLENBQUMsb0JBQW9CLENBQUMsVUFBQyxHQUFHLEVBQUs7QUFDMUMsTUFBSSxTQUFTLEtBQUssR0FBRyxDQUFDLElBQUksRUFBRTtBQUMxQixRQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzdELFdBQU8sQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDN0Y7Q0FDRixDQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9nb29nbGUtYW5hbHl0aWNzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmZ1bmN0aW9uIHV1aWQoKSB7XG4gIGZ1bmN0aW9uIHM0KCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xuICB9XG4gIHJldHVybiBgJHtzNCgpfSR7czQoKX0tJHtzNCgpfS0ke3M0KCl9LSR7czQoKX0tJHtzNCgpfSR7czQoKX0ke3M0KCl9YDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR29vZ2xlQW5hbHl0aWNzIHtcbiAgc3RhdGljIGdldENpZChjYikge1xuICAgIGlmICh0aGlzLmNpZCkge1xuICAgICAgY2IodGhpcy5jaWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHJlcXVpcmUoJ2dldG1hYycpLmdldE1hYygoZXJyb3IsIG1hY0FkZHJlc3MpID0+IHtcbiAgICAgIHJldHVybiBlcnJvciA/XG4gICAgICAgIGNiKHRoaXMuY2lkID0gdXVpZCgpKSA6XG4gICAgICAgIGNiKHRoaXMuY2lkID0gcmVxdWlyZSgnY3J5cHRvJykuY3JlYXRlSGFzaCgnc2hhMScpLnVwZGF0ZShtYWNBZGRyZXNzLCAndXRmOCcpLmRpZ2VzdCgnaGV4JykpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHNlbmRFdmVudChjYXRlZ29yeSwgYWN0aW9uLCBsYWJlbCwgdmFsdWUpIHtcbiAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICB0OiAnZXZlbnQnLFxuICAgICAgZWM6IGNhdGVnb3J5LFxuICAgICAgZWE6IGFjdGlvblxuICAgIH07XG4gICAgaWYgKGxhYmVsKSB7XG4gICAgICBwYXJhbXMuZWwgPSBsYWJlbDtcbiAgICB9XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICBwYXJhbXMuZXYgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnNlbmQocGFyYW1zKTtcbiAgfVxuXG4gIHN0YXRpYyBzZW5kKHBhcmFtcykge1xuICAgIGlmICghYXRvbS5wYWNrYWdlcy5nZXRBY3RpdmVQYWNrYWdlKCdtZXRyaWNzJykpIHtcbiAgICAgIC8vIElmIHRoZSBtZXRyaWNzIHBhY2thZ2UgaXMgZGlzYWJsZWQsIHRoZW4gdXNlciBoYXMgb3B0ZWQgb3V0LlxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIEdvb2dsZUFuYWx5dGljcy5nZXRDaWQoKGNpZCkgPT4ge1xuICAgICAgT2JqZWN0LmFzc2lnbihwYXJhbXMsIHsgY2lkOiBjaWQgfSwgR29vZ2xlQW5hbHl0aWNzLmRlZmF1bHRQYXJhbXMoKSk7XG4gICAgICB0aGlzLnJlcXVlc3QoJ2h0dHBzOi8vd3d3Lmdvb2dsZS1hbmFseXRpY3MuY29tL2NvbGxlY3Q/JyArIHJlcXVpcmUoJ3F1ZXJ5c3RyaW5nJykuc3RyaW5naWZ5KHBhcmFtcykpO1xuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIHJlcXVlc3QodXJsKSB7XG4gICAgaWYgKCFuYXZpZ2F0b3Iub25MaW5lKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMucG9zdCh1cmwpO1xuICB9XG5cbiAgc3RhdGljIHBvc3QodXJsKSB7XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oJ1BPU1QnLCB1cmwpO1xuICAgIHhoci5zZW5kKG51bGwpO1xuICB9XG5cbiAgc3RhdGljIGRlZmF1bHRQYXJhbXMoKSB7XG4gICAgLy8gaHR0cHM6Ly9kZXZlbG9wZXJzLmdvb2dsZS5jb20vYW5hbHl0aWNzL2Rldmd1aWRlcy9jb2xsZWN0aW9uL3Byb3RvY29sL3YxL3BhcmFtZXRlcnNcbiAgICByZXR1cm4ge1xuICAgICAgdjogMSxcbiAgICAgIHRpZDogJ1VBLTQ3NjE1NzAwLTUnXG4gICAgfTtcbiAgfVxufVxuXG5hdG9tLnBhY2thZ2VzLm9uRGlkQWN0aXZhdGVQYWNrYWdlKChwa2cpID0+IHtcbiAgaWYgKCdtZXRyaWNzJyA9PT0gcGtnLm5hbWUpIHtcbiAgICBjb25zdCBidWlsZFBhY2thZ2UgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UoJ2J1aWxkJyk7XG4gICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdjb3JlJywgJ2FjdGl2YXRlZCcsIGJ1aWxkUGFja2FnZS5tZXRhZGF0YS52ZXJzaW9uKTtcbiAgfVxufSk7XG4iXX0=