Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var MinimapCursorLineBinding = (function () {
  function MinimapCursorLineBinding(minimap) {
    var _this = this;

    _classCallCheck(this, MinimapCursorLineBinding);

    this.minimap = minimap;
    this.subscriptions = new _atom.CompositeDisposable();
    this.editor = this.minimap.getTextEditor();
    this.decorationsByMarkerId = {};
    this.decorationSubscriptionsByMarkerId = {};

    this.subscriptions.add(this.editor.observeCursors(function (cursor) {
      _this.handleMarker(cursor.getMarker());
    }));
  }

  _createClass(MinimapCursorLineBinding, [{
    key: 'handleMarker',
    value: function handleMarker(marker) {
      var _this2 = this;

      var id = marker.id;

      var decoration = this.minimap.decorateMarker(marker, { type: 'line', 'class': 'cursor-line' });
      this.decorationsByMarkerId[id] = decoration;
      this.decorationSubscriptionsByMarkerId[id] = decoration.onDidDestroy(function () {
        _this2.decorationSubscriptionsByMarkerId[id].dispose();

        delete _this2.decorationsByMarkerId[id];
        delete _this2.decorationSubscriptionsByMarkerId[id];
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      for (var id in this.decorationsByMarkerId) {
        var decoration = this.decorationsByMarkerId[id];
        this.decorationSubscriptionsByMarkerId[id].dispose();
        decoration.destroy();

        delete this.decorationsByMarkerId[id];
        delete this.decorationSubscriptionsByMarkerId[id];
      }

      this.subscriptions.dispose();
    }
  }]);

  return MinimapCursorLineBinding;
})();

exports['default'] = MinimapCursorLineBinding;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWN1cnNvcmxpbmUvbGliL21pbmltYXAtY3Vyc29ybGluZS1iaW5kaW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O29CQUVvQyxNQUFNOztBQUYxQyxXQUFXLENBQUE7O0lBSVUsd0JBQXdCO0FBRS9CLFdBRk8sd0JBQXdCLENBRTlCLE9BQU8sRUFBRTs7OzBCQUZILHdCQUF3Qjs7QUFHekMsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdEIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUE7QUFDMUMsUUFBSSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQTtBQUMvQixRQUFJLENBQUMsaUNBQWlDLEdBQUcsRUFBRSxDQUFBOztBQUUzQyxRQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFDLE1BQU0sRUFBSztBQUM1RCxZQUFLLFlBQVksQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQTtLQUN0QyxDQUFDLENBQUMsQ0FBQTtHQUNKOztlQVprQix3QkFBd0I7O1dBYzlCLHNCQUFDLE1BQU0sRUFBRTs7O1VBQ1osRUFBRSxHQUFLLE1BQU0sQ0FBYixFQUFFOztBQUNWLFVBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUM1QyxNQUFNLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLFNBQU8sYUFBYSxFQUFFLENBQy9DLENBQUE7QUFDRCxVQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFBO0FBQzNDLFVBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxVQUFVLENBQUMsWUFBWSxDQUFDLFlBQU07QUFDekUsZUFBSyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQTs7QUFFcEQsZUFBTyxPQUFLLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3JDLGVBQU8sT0FBSyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUNsRCxDQUFDLENBQUE7S0FDSDs7O1dBRU8sbUJBQUc7QUFDVCxXQUFLLElBQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRTtBQUMzQyxZQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsRUFBRSxDQUFDLENBQUE7QUFDakQsWUFBSSxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ3BELGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUE7O0FBRXBCLGVBQU8sSUFBSSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFBO0FBQ3JDLGVBQU8sSUFBSSxDQUFDLGlDQUFpQyxDQUFDLEVBQUUsQ0FBQyxDQUFBO09BQ2xEOztBQUVELFVBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7S0FDN0I7OztTQXZDa0Isd0JBQXdCOzs7cUJBQXhCLHdCQUF3QiIsImZpbGUiOiIvaG9tZS95b2tvdGEvLmF0b20vcGFja2FnZXMvbWluaW1hcC1jdXJzb3JsaW5lL2xpYi9taW5pbWFwLWN1cnNvcmxpbmUtYmluZGluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNaW5pbWFwQ3Vyc29yTGluZUJpbmRpbmcge1xuXG4gIGNvbnN0cnVjdG9yIChtaW5pbWFwKSB7XG4gICAgdGhpcy5taW5pbWFwID0gbWluaW1hcFxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgICB0aGlzLmVkaXRvciA9IHRoaXMubWluaW1hcC5nZXRUZXh0RWRpdG9yKClcbiAgICB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZCA9IHt9XG4gICAgdGhpcy5kZWNvcmF0aW9uU3Vic2NyaXB0aW9uc0J5TWFya2VySWQgPSB7fVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZCh0aGlzLmVkaXRvci5vYnNlcnZlQ3Vyc29ycygoY3Vyc29yKSA9PiB7XG4gICAgICB0aGlzLmhhbmRsZU1hcmtlcihjdXJzb3IuZ2V0TWFya2VyKCkpXG4gICAgfSkpXG4gIH1cblxuICBoYW5kbGVNYXJrZXIgKG1hcmtlcikge1xuICAgIGNvbnN0IHsgaWQgfSA9IG1hcmtlclxuICAgIGNvbnN0IGRlY29yYXRpb24gPSB0aGlzLm1pbmltYXAuZGVjb3JhdGVNYXJrZXIoXG4gICAgICBtYXJrZXIsIHsgdHlwZTogJ2xpbmUnLCBjbGFzczogJ2N1cnNvci1saW5lJyB9XG4gICAgKVxuICAgIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXSA9IGRlY29yYXRpb25cbiAgICB0aGlzLmRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF0gPSBkZWNvcmF0aW9uLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICB0aGlzLmRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF0uZGlzcG9zZSgpXG5cbiAgICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF1cbiAgICAgIGRlbGV0ZSB0aGlzLmRlY29yYXRpb25TdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF1cbiAgICB9KVxuICB9XG5cbiAgZGVzdHJveSAoKSB7XG4gICAgZm9yIChjb25zdCBpZCBpbiB0aGlzLmRlY29yYXRpb25zQnlNYXJrZXJJZCkge1xuICAgICAgY29uc3QgZGVjb3JhdGlvbiA9IHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXVxuICAgICAgdGhpcy5kZWNvcmF0aW9uU3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdLmRpc3Bvc2UoKVxuICAgICAgZGVjb3JhdGlvbi5kZXN0cm95KClcblxuICAgICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXVxuICAgICAgZGVsZXRlIHRoaXMuZGVjb3JhdGlvblN1YnNjcmlwdGlvbnNCeU1hcmtlcklkW2lkXVxuICAgIH1cblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgfVxuXG59XG4iXX0=