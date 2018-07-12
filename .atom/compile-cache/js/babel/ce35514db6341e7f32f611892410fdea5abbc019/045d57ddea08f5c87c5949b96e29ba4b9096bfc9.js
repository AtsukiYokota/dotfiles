Object.defineProperty(exports, '__esModule', {
  value: true
});

var _atom = require('atom');

'use babel';

var MinimapCursorLineBinding = null;

exports['default'] = {

  active: false,

  isActive: function isActive() {
    return this.active;
  },

  bindings: {},

  activate: function activate(state) {},

  consumeMinimapServiceV1: function consumeMinimapServiceV1(minimap) {
    this.minimap = minimap;
    this.minimap.registerPlugin('cursorline', this);
  },

  deactivate: function deactivate() {
    if (!this.minimap) {
      return;
    }
    this.minimap.unregisterPlugin('cursorline');
    this.minimap = null;
  },

  activatePlugin: function activatePlugin() {
    var _this = this;

    if (this.active) {
      return;
    }

    this.subscriptions = new _atom.CompositeDisposable();
    this.active = true;

    this.minimapsSubscription = this.minimap.observeMinimaps(function (minimap) {
      if (MinimapCursorLineBinding === null) {
        MinimapCursorLineBinding = require('./minimap-cursorline-binding');
      }

      var id = minimap.id;
      var binding = new MinimapCursorLineBinding(minimap);
      _this.bindings[id] = binding;

      var subscription = minimap.onDidDestroy(function () {
        binding.destroy();
        _this.subscriptions.remove(subscription);
        subscription.dispose();
        delete _this.bindings[id];
      });

      _this.subscriptions.add(subscription);
    });
  },

  deactivatePlugin: function deactivatePlugin() {
    if (!this.active) {
      return;
    }

    for (var id in this.bindings) {
      this.bindings[id].destroy();
    }
    this.bindings = {};
    this.active = false;
    this.minimapsSubscription.dispose();
    this.subscriptions.dispose();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9taW5pbWFwLWN1cnNvcmxpbmUvbGliL21pbmltYXAtY3Vyc29ybGluZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O29CQUVvQyxNQUFNOztBQUYxQyxXQUFXLENBQUE7O0FBSVgsSUFBSSx3QkFBd0IsR0FBRyxJQUFJLENBQUE7O3FCQUVwQjs7QUFFYixRQUFNLEVBQUUsS0FBSzs7QUFFYixVQUFRLEVBQUMsb0JBQUc7QUFBRSxXQUFPLElBQUksQ0FBQyxNQUFNLENBQUE7R0FBRTs7QUFFbEMsVUFBUSxFQUFFLEVBQUU7O0FBRVosVUFBUSxFQUFDLGtCQUFDLEtBQUssRUFBRSxFQUFFOztBQUVuQix5QkFBdUIsRUFBQyxpQ0FBQyxPQUFPLEVBQUU7QUFDaEMsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUE7QUFDdEIsUUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxDQUFBO0dBQ2hEOztBQUVELFlBQVUsRUFBQyxzQkFBRztBQUNaLFFBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQUUsYUFBTTtLQUFFO0FBQzdCLFFBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUE7QUFDM0MsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUE7R0FDcEI7O0FBRUQsZ0JBQWMsRUFBQywwQkFBRzs7O0FBQ2hCLFFBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUFFLGFBQU07S0FBRTs7QUFFM0IsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQTs7QUFFbEIsUUFBSSxDQUFDLG9CQUFvQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLFVBQUMsT0FBTyxFQUFLO0FBQ3BFLFVBQUksd0JBQXdCLEtBQUssSUFBSSxFQUFFO0FBQ3JDLGdDQUF3QixHQUFHLE9BQU8sQ0FBQyw4QkFBOEIsQ0FBQyxDQUFBO09BQ25FOztBQUVELFVBQU0sRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUE7QUFDckIsVUFBTSxPQUFPLEdBQUcsSUFBSSx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQTtBQUNyRCxZQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxPQUFPLENBQUE7O0FBRTNCLFVBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUMsWUFBTTtBQUM5QyxlQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDakIsY0FBSyxhQUFhLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFBO0FBQ3ZDLG9CQUFZLENBQUMsT0FBTyxFQUFFLENBQUE7QUFDdEIsZUFBTyxNQUFLLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUN6QixDQUFDLENBQUE7O0FBRUYsWUFBSyxhQUFhLENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQyxDQUFBO0tBQ3JDLENBQUMsQ0FBQTtHQUNIOztBQUVELGtCQUFnQixFQUFDLDRCQUFHO0FBQ2xCLFFBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQUUsYUFBTTtLQUFFOztBQUU1QixTQUFLLElBQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFBRSxVQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFBO0tBQUU7QUFDL0QsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUE7QUFDbEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUE7QUFDbkIsUUFBSSxDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxDQUFBO0FBQ25DLFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDN0I7O0NBRUYiLCJmaWxlIjoiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtY3Vyc29ybGluZS9saWIvbWluaW1hcC1jdXJzb3JsaW5lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxuaW1wb3J0IHsgQ29tcG9zaXRlRGlzcG9zYWJsZSB9IGZyb20gJ2F0b20nXG5cbnZhciBNaW5pbWFwQ3Vyc29yTGluZUJpbmRpbmcgPSBudWxsXG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBhY3RpdmU6IGZhbHNlLFxuXG4gIGlzQWN0aXZlICgpIHsgcmV0dXJuIHRoaXMuYWN0aXZlIH0sXG5cbiAgYmluZGluZ3M6IHt9LFxuXG4gIGFjdGl2YXRlIChzdGF0ZSkge30sXG5cbiAgY29uc3VtZU1pbmltYXBTZXJ2aWNlVjEgKG1pbmltYXApIHtcbiAgICB0aGlzLm1pbmltYXAgPSBtaW5pbWFwXG4gICAgdGhpcy5taW5pbWFwLnJlZ2lzdGVyUGx1Z2luKCdjdXJzb3JsaW5lJywgdGhpcylcbiAgfSxcblxuICBkZWFjdGl2YXRlICgpIHtcbiAgICBpZiAoIXRoaXMubWluaW1hcCkgeyByZXR1cm4gfVxuICAgIHRoaXMubWluaW1hcC51bnJlZ2lzdGVyUGx1Z2luKCdjdXJzb3JsaW5lJylcbiAgICB0aGlzLm1pbmltYXAgPSBudWxsXG4gIH0sXG5cbiAgYWN0aXZhdGVQbHVnaW4gKCkge1xuICAgIGlmICh0aGlzLmFjdGl2ZSkgeyByZXR1cm4gfVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuYWN0aXZlID0gdHJ1ZVxuXG4gICAgdGhpcy5taW5pbWFwc1N1YnNjcmlwdGlvbiA9IHRoaXMubWluaW1hcC5vYnNlcnZlTWluaW1hcHMoKG1pbmltYXApID0+IHtcbiAgICAgIGlmIChNaW5pbWFwQ3Vyc29yTGluZUJpbmRpbmcgPT09IG51bGwpIHtcbiAgICAgICAgTWluaW1hcEN1cnNvckxpbmVCaW5kaW5nID0gcmVxdWlyZSgnLi9taW5pbWFwLWN1cnNvcmxpbmUtYmluZGluZycpXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGlkID0gbWluaW1hcC5pZFxuICAgICAgY29uc3QgYmluZGluZyA9IG5ldyBNaW5pbWFwQ3Vyc29yTGluZUJpbmRpbmcobWluaW1hcClcbiAgICAgIHRoaXMuYmluZGluZ3NbaWRdID0gYmluZGluZ1xuXG4gICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBtaW5pbWFwLm9uRGlkRGVzdHJveSgoKSA9PiB7XG4gICAgICAgIGJpbmRpbmcuZGVzdHJveSgpXG4gICAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5yZW1vdmUoc3Vic2NyaXB0aW9uKVxuICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpXG4gICAgICAgIGRlbGV0ZSB0aGlzLmJpbmRpbmdzW2lkXVxuICAgICAgfSlcblxuICAgICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChzdWJzY3JpcHRpb24pXG4gICAgfSlcbiAgfSxcblxuICBkZWFjdGl2YXRlUGx1Z2luICgpIHtcbiAgICBpZiAoIXRoaXMuYWN0aXZlKSB7IHJldHVybiB9XG5cbiAgICBmb3IgKGNvbnN0IGlkIGluIHRoaXMuYmluZGluZ3MpIHsgdGhpcy5iaW5kaW5nc1tpZF0uZGVzdHJveSgpIH1cbiAgICB0aGlzLmJpbmRpbmdzID0ge31cbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgdGhpcy5taW5pbWFwc1N1YnNjcmlwdGlvbi5kaXNwb3NlKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gIH1cblxufVxuIl19