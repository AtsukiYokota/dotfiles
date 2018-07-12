(function() {
  var CompositeDisposable, FindAndReplace, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  FindAndReplace = null;

  module.exports = MinimapFindAndReplaceBinding = (function() {
    function MinimapFindAndReplaceBinding(minimap, fnrAPI) {
      this.minimap = minimap;
      this.fnrAPI = fnrAPI;
      this.editor = this.minimap.getTextEditor();
      this.subscriptions = new CompositeDisposable;
      this.decorationsByMarkerId = {};
      this.subscriptionsByMarkerId = {};
      if (this.fnrAPI != null) {
        this.layer = this.fnrAPI.resultsMarkerLayerForTextEditor(this.editor);
        this.subscriptions.add(this.layer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      } else {
        this.subscriptions.add(this.editor.displayBuffer.onDidCreateMarker((function(_this) {
          return function(marker) {
            return _this.handleCreatedMarker(marker);
          };
        })(this)));
      }
      this.discoverMarkers();
    }

    MinimapFindAndReplaceBinding.prototype.destroy = function() {
      var decoration, id, ref, ref1, sub;
      ref = this.subscriptionsByMarkerId;
      for (id in ref) {
        sub = ref[id];
        sub.dispose();
      }
      ref1 = this.decorationsByMarkerId;
      for (id in ref1) {
        decoration = ref1[id];
        decoration.destroy();
      }
      this.subscriptions.dispose();
      this.minimap = null;
      this.editor = null;
      this.decorationsByMarkerId = {};
      return this.subscriptionsByMarkerId = {};
    };

    MinimapFindAndReplaceBinding.prototype.clear = function() {
      var decoration, id, ref, ref1, results, sub;
      ref = this.subscriptionsByMarkerId;
      for (id in ref) {
        sub = ref[id];
        sub.dispose();
        delete this.subscriptionsByMarkerId[id];
      }
      ref1 = this.decorationsByMarkerId;
      results = [];
      for (id in ref1) {
        decoration = ref1[id];
        decoration.destroy();
        results.push(delete this.decorationsByMarkerId[id]);
      }
      return results;
    };

    MinimapFindAndReplaceBinding.prototype.findAndReplace = function() {
      return FindAndReplace != null ? FindAndReplace : FindAndReplace = atom.packages.getLoadedPackage('find-and-replace').mainModule;
    };

    MinimapFindAndReplaceBinding.prototype.discoverMarkers = function() {
      if (this.fnrAPI != null) {
        return this.layer.getMarkers().forEach((function(_this) {
          return function(marker) {
            return _this.createDecoration(marker);
          };
        })(this));
      } else {
        return this.editor.findMarkers({
          "class": 'find-result'
        }).forEach((function(_this) {
          return function(marker) {
            return _this.createDecoration(marker);
          };
        })(this));
      }
    };

    MinimapFindAndReplaceBinding.prototype.handleCreatedMarker = function(marker) {
      var ref;
      if ((this.fnrAPI != null) || ((ref = marker.getProperties()) != null ? ref["class"] : void 0) === 'find-result') {
        return this.createDecoration(marker);
      }
    };

    MinimapFindAndReplaceBinding.prototype.createDecoration = function(marker) {
      var decoration, id;
      if (!this.findViewIsVisible()) {
        return;
      }
      if (this.decorationsByMarkerId[marker.id] != null) {
        return;
      }
      decoration = this.minimap.decorateMarker(marker, {
        type: 'highlight',
        scope: ".minimap .search-result",
        plugin: 'find-and-replace'
      });
      if (decoration == null) {
        return;
      }
      id = marker.id;
      this.decorationsByMarkerId[id] = decoration;
      return this.subscriptionsByMarkerId[id] = decoration.onDidDestroy((function(_this) {
        return function() {
          _this.subscriptionsByMarkerId[id].dispose();
          delete _this.decorationsByMarkerId[id];
          return delete _this.subscriptionsByMarkerId[id];
        };
      })(this));
    };

    MinimapFindAndReplaceBinding.prototype.findViewIsVisible = function() {
      return document.querySelector('.find-and-replace') != null;
    };

    return MinimapFindAndReplaceBinding;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS9saWIvbWluaW1hcC1maW5kLWFuZC1yZXBsYWNlLWJpbmRpbmcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBQ3hCLGNBQUEsR0FBaUI7O0VBRWpCLE1BQU0sQ0FBQyxPQUFQLEdBQ007SUFDUyxzQ0FBQyxPQUFELEVBQVcsTUFBWDtNQUFDLElBQUMsQ0FBQSxVQUFEO01BQVUsSUFBQyxDQUFBLFNBQUQ7TUFDdEIsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGFBQVQsQ0FBQTtNQUNWLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUk7TUFDckIsSUFBQyxDQUFBLHFCQUFELEdBQXlCO01BQ3pCLElBQUMsQ0FBQSx1QkFBRCxHQUEyQjtNQUUzQixJQUFHLG1CQUFIO1FBQ0UsSUFBQyxDQUFBLEtBQUQsR0FBUyxJQUFDLENBQUEsTUFBTSxDQUFDLCtCQUFSLENBQXdDLElBQUMsQ0FBQSxNQUF6QztRQUVULElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsS0FBSyxDQUFDLGlCQUFQLENBQXlCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUMsTUFBRDttQkFDMUMsS0FBQyxDQUFBLG1CQUFELENBQXFCLE1BQXJCO1VBRDBDO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QixDQUFuQixFQUhGO09BQUEsTUFBQTtRQU1FLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsTUFBTSxDQUFDLGFBQWEsQ0FBQyxpQkFBdEIsQ0FBd0MsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxNQUFEO21CQUN6RCxLQUFDLENBQUEsbUJBQUQsQ0FBcUIsTUFBckI7VUFE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O1FBSHFCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF4QjtJQWJmOzsyQ0FrQmxCLGlCQUFBLEdBQW1CLFNBQUE7YUFDakI7SUFEaUI7Ozs7O0FBeEVyQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5GaW5kQW5kUmVwbGFjZSA9IG51bGxcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTWluaW1hcEZpbmRBbmRSZXBsYWNlQmluZGluZ1xuICBjb25zdHJ1Y3RvcjogKEBtaW5pbWFwLCBAZm5yQVBJKSAtPlxuICAgIEBlZGl0b3IgPSBAbWluaW1hcC5nZXRUZXh0RWRpdG9yKClcbiAgICBAc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRlY29yYXRpb25zQnlNYXJrZXJJZCA9IHt9XG4gICAgQHN1YnNjcmlwdGlvbnNCeU1hcmtlcklkID0ge31cblxuICAgIGlmIEBmbnJBUEk/XG4gICAgICBAbGF5ZXIgPSBAZm5yQVBJLnJlc3VsdHNNYXJrZXJMYXllckZvclRleHRFZGl0b3IoQGVkaXRvcilcblxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBsYXllci5vbkRpZENyZWF0ZU1hcmtlciAobWFya2VyKSA9PlxuICAgICAgICBAaGFuZGxlQ3JlYXRlZE1hcmtlcihtYXJrZXIpXG4gICAgZWxzZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBlZGl0b3IuZGlzcGxheUJ1ZmZlci5vbkRpZENyZWF0ZU1hcmtlciAobWFya2VyKSA9PlxuICAgICAgICBAaGFuZGxlQ3JlYXRlZE1hcmtlcihtYXJrZXIpXG5cbiAgICBAZGlzY292ZXJNYXJrZXJzKClcblxuICBkZXN0cm95OiAtPlxuICAgIHN1Yi5kaXNwb3NlKCkgZm9yIGlkLHN1YiBvZiBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWRcbiAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKSBmb3IgaWQsZGVjb3JhdGlvbiBvZiBAZGVjb3JhdGlvbnNCeU1hcmtlcklkXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBAbWluaW1hcCA9IG51bGxcbiAgICBAZWRpdG9yID0gbnVsbFxuICAgIEBkZWNvcmF0aW9uc0J5TWFya2VySWQgPSB7fVxuICAgIEBzdWJzY3JpcHRpb25zQnlNYXJrZXJJZCA9IHt9XG5cbiAgY2xlYXI6IC0+XG4gICAgZm9yIGlkLHN1YiBvZiBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWRcbiAgICAgIHN1Yi5kaXNwb3NlKClcbiAgICAgIGRlbGV0ZSBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdXG5cbiAgICBmb3IgaWQsZGVjb3JhdGlvbiBvZiBAZGVjb3JhdGlvbnNCeU1hcmtlcklkXG4gICAgICBkZWNvcmF0aW9uLmRlc3Ryb3koKVxuICAgICAgZGVsZXRlIEBkZWNvcmF0aW9uc0J5TWFya2VySWRbaWRdXG5cbiAgZmluZEFuZFJlcGxhY2U6IC0+IEZpbmRBbmRSZXBsYWNlID89IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnZmluZC1hbmQtcmVwbGFjZScpLm1haW5Nb2R1bGVcblxuICBkaXNjb3Zlck1hcmtlcnM6IC0+XG4gICAgaWYgQGZuckFQST9cbiAgICAgIEBsYXllci5nZXRNYXJrZXJzKCkuZm9yRWFjaCAobWFya2VyKSA9PiBAY3JlYXRlRGVjb3JhdGlvbihtYXJrZXIpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci5maW5kTWFya2VycyhjbGFzczogJ2ZpbmQtcmVzdWx0JykuZm9yRWFjaCAobWFya2VyKSA9PlxuICAgICAgICBAY3JlYXRlRGVjb3JhdGlvbihtYXJrZXIpXG5cbiAgaGFuZGxlQ3JlYXRlZE1hcmtlcjogKG1hcmtlcikgLT5cbiAgICBpZiBAZm5yQVBJPyBvciBtYXJrZXIuZ2V0UHJvcGVydGllcygpPy5jbGFzcyBpcyAnZmluZC1yZXN1bHQnXG4gICAgICBAY3JlYXRlRGVjb3JhdGlvbihtYXJrZXIpXG5cbiAgY3JlYXRlRGVjb3JhdGlvbjogKG1hcmtlcikgLT5cbiAgICByZXR1cm4gdW5sZXNzIEBmaW5kVmlld0lzVmlzaWJsZSgpXG4gICAgcmV0dXJuIGlmIEBkZWNvcmF0aW9uc0J5TWFya2VySWRbbWFya2VyLmlkXT9cblxuICAgIGRlY29yYXRpb24gPSBAbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgIHR5cGU6ICdoaWdobGlnaHQnXG4gICAgICBzY29wZTogXCIubWluaW1hcCAuc2VhcmNoLXJlc3VsdFwiXG4gICAgICBwbHVnaW46ICdmaW5kLWFuZC1yZXBsYWNlJ1xuICAgIH0pXG4gICAgcmV0dXJuIHVubGVzcyBkZWNvcmF0aW9uP1xuXG4gICAgaWQgPSBtYXJrZXIuaWRcbiAgICBAZGVjb3JhdGlvbnNCeU1hcmtlcklkW2lkXSA9IGRlY29yYXRpb25cbiAgICBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdID0gZGVjb3JhdGlvbi5vbkRpZERlc3Ryb3kgPT5cbiAgICAgIEBzdWJzY3JpcHRpb25zQnlNYXJrZXJJZFtpZF0uZGlzcG9zZSgpXG4gICAgICBkZWxldGUgQGRlY29yYXRpb25zQnlNYXJrZXJJZFtpZF1cbiAgICAgIGRlbGV0ZSBAc3Vic2NyaXB0aW9uc0J5TWFya2VySWRbaWRdXG5cbiAgZmluZFZpZXdJc1Zpc2libGU6IC0+XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmZpbmQtYW5kLXJlcGxhY2UnKT9cbiJdfQ==
