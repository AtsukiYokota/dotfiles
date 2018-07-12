(function() {
  var CompositeDisposable, MinimapHighlightSelected, requirePackages,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  CompositeDisposable = require('event-kit').CompositeDisposable;

  requirePackages = require('atom-utils').requirePackages;

  MinimapHighlightSelected = (function() {
    function MinimapHighlightSelected() {
      this.markersDestroyed = bind(this.markersDestroyed, this);
      this.markerCreated = bind(this.markerCreated, this);
      this.dispose = bind(this.dispose, this);
      this.init = bind(this.init, this);
      this.subscriptions = new CompositeDisposable;
    }

    MinimapHighlightSelected.prototype.activate = function(state) {
      if (!atom.inSpecMode()) {
        return require('atom-package-deps').install('minimap-highlight-selected', true);
      }
    };

    MinimapHighlightSelected.prototype.consumeMinimapServiceV1 = function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('highlight-selected', this);
    };

    MinimapHighlightSelected.prototype.consumeHighlightSelectedServiceV2 = function(highlightSelected) {
      this.highlightSelected = highlightSelected;
      if ((this.minimap != null) && (this.active != null)) {
        return this.init();
      }
    };

    MinimapHighlightSelected.prototype.deactivate = function() {
      this.deactivatePlugin();
      this.minimapPackage = null;
      this.highlightSelectedPackage = null;
      this.highlightSelected = null;
      return this.minimap = null;
    };

    MinimapHighlightSelected.prototype.isActive = function() {
      return this.active;
    };

    MinimapHighlightSelected.prototype.activatePlugin = function() {
      if (this.active) {
        return;
      }
      this.subscriptions.add(this.minimap.onDidActivate(this.init));
      this.subscriptions.add(this.minimap.onDidDeactivate(this.dispose));
      this.active = true;
      if (this.highlightSelected != null) {
        return this.init();
      }
    };

    MinimapHighlightSelected.prototype.init = function() {
      this.decorations = [];
      this.highlightSelected.onDidAddMarkerForEditor((function(_this) {
        return function(options) {
          return _this.markerCreated(options);
        };
      })(this));
      this.highlightSelected.onDidAddSelectedMarkerForEditor((function(_this) {
        return function(options) {
          return _this.markerCreated(options, true);
        };
      })(this));
      return this.highlightSelected.onDidRemoveAllMarkers((function(_this) {
        return function() {
          return _this.markersDestroyed();
        };
      })(this));
    };

    MinimapHighlightSelected.prototype.dispose = function() {
      var ref;
      if ((ref = this.decorations) != null) {
        ref.forEach(function(decoration) {
          return decoration.destroy();
        });
      }
      return this.decorations = null;
    };

    MinimapHighlightSelected.prototype.markerCreated = function(options, selected) {
      var className, decoration, minimap;
      if (selected == null) {
        selected = false;
      }
      minimap = this.minimap.minimapForEditor(options.editor);
      if (minimap == null) {
        return;
      }
      className = 'highlight-selected';
      if (selected) {
        className += ' selected';
      }
      decoration = minimap.decorateMarker(options.marker, {
        type: 'highlight',
        "class": className
      });
      return this.decorations.push(decoration);
    };

    MinimapHighlightSelected.prototype.markersDestroyed = function() {
      var ref;
      if ((ref = this.decorations) != null) {
        ref.forEach(function(decoration) {
          return decoration.destroy();
        });
      }
      return this.decorations = [];
    };

    MinimapHighlightSelected.prototype.deactivatePlugin = function() {
      if (!this.active) {
        return;
      }
      this.active = false;
      this.dispose();
      return this.subscriptions.dispose();
    };

    return MinimapHighlightSelected;

  })();

  module.exports = new MinimapHighlightSelected;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtaGlnaGxpZ2h0LXNlbGVjdGVkL2xpYi9taW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDhEQUFBO0lBQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxXQUFSOztFQUN2QixrQkFBbUIsT0FBQSxDQUFRLFlBQVI7O0VBRWQ7SUFDUyxrQ0FBQTs7Ozs7TUFDWCxJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO0lBRFY7O3VDQUdiLFFBQUEsR0FBVSxTQUFDLEtBQUQ7TUFDUixJQUFBLENBQU8sSUFBSSxDQUFDLFVBQUwsQ0FBQSxDQUFQO2VBQ0UsT0FBQSxDQUFRLG1CQUFSLENBQTRCLENBQUMsT0FBN0IsQ0FBcUMsNEJBQXJDLEVBQW1FLElBQW5FLEVBREY7O0lBRFE7O3VDQUlWLHVCQUFBLEdBQXlCLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixvQkFBeEIsRUFBOEMsSUFBOUM7SUFEdUI7O3VDQUd6QixpQ0FBQSxHQUFtQyxTQUFDLGlCQUFEO01BQUMsSUFBQyxDQUFBLG9CQUFEO01BQ2xDLElBQVcsc0JBQUEsSUFBYyxxQkFBekI7ZUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBQUE7O0lBRGlDOzt1Q0FHbkMsVUFBQSxHQUFZLFNBQUE7TUFDVixJQUFDLENBQUEsZ0JBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxjQUFELEdBQWtCO01BQ2xCLElBQUMsQ0FBQSx3QkFBRCxHQUE0QjtNQUM1QixJQUFDLENBQUEsaUJBQUQsR0FBcUI7YUFDckIsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUxEOzt1Q0FPWixRQUFBLEdBQVUsU0FBQTthQUFHLElBQUMsQ0FBQTtJQUFKOzt1Q0FFVixjQUFBLEdBQWdCLFNBQUE7TUFDZCxJQUFVLElBQUMsQ0FBQSxNQUFYO0FBQUEsZUFBQTs7TUFFQSxJQUFDLENBQUEsYUFBYSxDQUFDLEdBQWYsQ0FBbUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxhQUFULENBQXVCLElBQUMsQ0FBQSxJQUF4QixDQUFuQjtNQUNBLElBQUMsQ0FBQSxhQUFhLENBQUMsR0FBZixDQUFtQixJQUFDLENBQUEsT0FBTyxDQUFDLGVBQVQsQ0FBeUIsSUFBQyxDQUFBLE9BQTFCLENBQW5CO01BRUEsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUVWLElBQVcsOEJBQVg7ZUFBQSxJQUFDLENBQUEsSUFBRCxDQUFBLEVBQUE7O0lBUmM7O3VDQVVoQixJQUFBLEdBQU0sU0FBQTtNQUNKLElBQUMsQ0FBQSxXQUFELEdBQWU7TUFDZixJQUFDLENBQUEsaUJBQWlCLENBQUMsdUJBQW5CLENBQTJDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO2lCQUFhLEtBQUMsQ0FBQSxhQUFELENBQWUsT0FBZjtRQUFiO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUEzQztNQUNBLElBQUMsQ0FBQSxpQkFBaUIsQ0FBQywrQkFBbkIsQ0FBbUQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7aUJBQWEsS0FBQyxDQUFBLGFBQUQsQ0FBZSxPQUFmLEVBQXdCLElBQXhCO1FBQWI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQW5EO2FBQ0EsSUFBQyxDQUFBLGlCQUFpQixDQUFDLHFCQUFuQixDQUF5QyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLGdCQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekM7SUFKSTs7dUNBTU4sT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBOztXQUFZLENBQUUsT0FBZCxDQUFzQixTQUFDLFVBQUQ7aUJBQWdCLFVBQVUsQ0FBQyxPQUFYLENBQUE7UUFBaEIsQ0FBdEI7O2FBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUZSOzt1Q0FJVCxhQUFBLEdBQWUsU0FBQyxPQUFELEVBQVUsUUFBVjtBQUNiLFVBQUE7O1FBRHVCLFdBQVc7O01BQ2xDLE9BQUEsR0FBVSxJQUFDLENBQUEsT0FBTyxDQUFDLGdCQUFULENBQTBCLE9BQU8sQ0FBQyxNQUFsQztNQUNWLElBQWMsZUFBZDtBQUFBLGVBQUE7O01BQ0EsU0FBQSxHQUFhO01BQ2IsSUFBNEIsUUFBNUI7UUFBQSxTQUFBLElBQWEsWUFBYjs7TUFFQSxVQUFBLEdBQWEsT0FBTyxDQUFDLGNBQVIsQ0FBdUIsT0FBTyxDQUFDLE1BQS9CLEVBQ1g7UUFBQyxJQUFBLEVBQU0sV0FBUDtRQUFvQixDQUFBLEtBQUEsQ0FBQSxFQUFPLFNBQTNCO09BRFc7YUFFYixJQUFDLENBQUEsV0FBVyxDQUFDLElBQWIsQ0FBa0IsVUFBbEI7SUFSYTs7dUNBVWYsZ0JBQUEsR0FBa0IsU0FBQTtBQUNoQixVQUFBOztXQUFZLENBQUUsT0FBZCxDQUFzQixTQUFDLFVBQUQ7aUJBQWdCLFVBQVUsQ0FBQyxPQUFYLENBQUE7UUFBaEIsQ0FBdEI7O2FBQ0EsSUFBQyxDQUFBLFdBQUQsR0FBZTtJQUZDOzt1Q0FJbEIsZ0JBQUEsR0FBa0IsU0FBQTtNQUNoQixJQUFBLENBQWMsSUFBQyxDQUFBLE1BQWY7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsT0FBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLGFBQWEsQ0FBQyxPQUFmLENBQUE7SUFMZ0I7Ozs7OztFQU9wQixNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFJO0FBbkVyQiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2V2ZW50LWtpdCdcbntyZXF1aXJlUGFja2FnZXN9ID0gcmVxdWlyZSAnYXRvbS11dGlscydcblxuY2xhc3MgTWluaW1hcEhpZ2hsaWdodFNlbGVjdGVkXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIHVubGVzcyBhdG9tLmluU3BlY01vZGUoKVxuICAgICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsICdtaW5pbWFwLWhpZ2hsaWdodC1zZWxlY3RlZCcsIHRydWVcblxuICBjb25zdW1lTWluaW1hcFNlcnZpY2VWMTogKEBtaW5pbWFwKSAtPlxuICAgIEBtaW5pbWFwLnJlZ2lzdGVyUGx1Z2luICdoaWdobGlnaHQtc2VsZWN0ZWQnLCB0aGlzXG5cbiAgY29uc3VtZUhpZ2hsaWdodFNlbGVjdGVkU2VydmljZVYyOiAoQGhpZ2hsaWdodFNlbGVjdGVkKSAtPlxuICAgIEBpbml0KCkgaWYgQG1pbmltYXA/IGFuZCBAYWN0aXZlP1xuXG4gIGRlYWN0aXZhdGU6IC0+XG4gICAgQGRlYWN0aXZhdGVQbHVnaW4oKVxuICAgIEBtaW5pbWFwUGFja2FnZSA9IG51bGxcbiAgICBAaGlnaGxpZ2h0U2VsZWN0ZWRQYWNrYWdlID0gbnVsbFxuICAgIEBoaWdobGlnaHRTZWxlY3RlZCA9IG51bGxcbiAgICBAbWluaW1hcCA9IG51bGxcblxuICBpc0FjdGl2ZTogLT4gQGFjdGl2ZVxuXG4gIGFjdGl2YXRlUGx1Z2luOiAtPlxuICAgIHJldHVybiBpZiBAYWN0aXZlXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub25EaWRBY3RpdmF0ZSBAaW5pdFxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWluaW1hcC5vbkRpZERlYWN0aXZhdGUgQGRpc3Bvc2VcblxuICAgIEBhY3RpdmUgPSB0cnVlXG5cbiAgICBAaW5pdCgpIGlmIEBoaWdobGlnaHRTZWxlY3RlZD9cblxuICBpbml0OiA9PlxuICAgIEBkZWNvcmF0aW9ucyA9IFtdXG4gICAgQGhpZ2hsaWdodFNlbGVjdGVkLm9uRGlkQWRkTWFya2VyRm9yRWRpdG9yIChvcHRpb25zKSA9PiBAbWFya2VyQ3JlYXRlZChvcHRpb25zKVxuICAgIEBoaWdobGlnaHRTZWxlY3RlZC5vbkRpZEFkZFNlbGVjdGVkTWFya2VyRm9yRWRpdG9yIChvcHRpb25zKSA9PiBAbWFya2VyQ3JlYXRlZChvcHRpb25zLCB0cnVlKVxuICAgIEBoaWdobGlnaHRTZWxlY3RlZC5vbkRpZFJlbW92ZUFsbE1hcmtlcnMgPT4gQG1hcmtlcnNEZXN0cm95ZWQoKVxuXG4gIGRpc3Bvc2U6ID0+XG4gICAgQGRlY29yYXRpb25zPy5mb3JFYWNoIChkZWNvcmF0aW9uKSAtPiBkZWNvcmF0aW9uLmRlc3Ryb3koKVxuICAgIEBkZWNvcmF0aW9ucyA9IG51bGxcblxuICBtYXJrZXJDcmVhdGVkOiAob3B0aW9ucywgc2VsZWN0ZWQgPSBmYWxzZSkgPT5cbiAgICBtaW5pbWFwID0gQG1pbmltYXAubWluaW1hcEZvckVkaXRvcihvcHRpb25zLmVkaXRvcilcbiAgICByZXR1cm4gdW5sZXNzIG1pbmltYXA/XG4gICAgY2xhc3NOYW1lICA9ICdoaWdobGlnaHQtc2VsZWN0ZWQnXG4gICAgY2xhc3NOYW1lICs9ICcgc2VsZWN0ZWQnIGlmIHNlbGVjdGVkXG5cbiAgICBkZWNvcmF0aW9uID0gbWluaW1hcC5kZWNvcmF0ZU1hcmtlcihvcHRpb25zLm1hcmtlcixcbiAgICAgIHt0eXBlOiAnaGlnaGxpZ2h0JywgY2xhc3M6IGNsYXNzTmFtZSB9KVxuICAgIEBkZWNvcmF0aW9ucy5wdXNoIGRlY29yYXRpb25cblxuICBtYXJrZXJzRGVzdHJveWVkOiA9PlxuICAgIEBkZWNvcmF0aW9ucz8uZm9yRWFjaCAoZGVjb3JhdGlvbikgLT4gZGVjb3JhdGlvbi5kZXN0cm95KClcbiAgICBAZGVjb3JhdGlvbnMgPSBbXVxuXG4gIGRlYWN0aXZhdGVQbHVnaW46IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAYWN0aXZlXG5cbiAgICBAYWN0aXZlID0gZmFsc2VcbiAgICBAZGlzcG9zZSgpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1pbmltYXBIaWdobGlnaHRTZWxlY3RlZFxuIl19
