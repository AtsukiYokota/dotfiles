(function() {
  var $$, SelectListView, UsagesView, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  path = require('path');

  module.exports = UsagesView = (function(superClass) {
    extend(UsagesView, superClass);

    function UsagesView() {
      return UsagesView.__super__.constructor.apply(this, arguments);
    }

    UsagesView.prototype.initialize = function(matches) {
      UsagesView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for usages');
      return this.focusFilterEditor();
    };

    UsagesView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    UsagesView.prototype.viewForItem = function(arg) {
      var _, column, fileName, line, moduleName, name, ref1, relativePath;
      name = arg.name, moduleName = arg.moduleName, fileName = arg.fileName, line = arg.line, column = arg.column;
      ref1 = atom.project.relativizePath(fileName), _ = ref1[0], relativePath = ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div("" + name, {
              "class": 'primary-line'
            });
            return _this.div(relativePath + ", line " + line, {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    UsagesView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    UsagesView.prototype.scrollToItemView = function() {
      var column, editor, fileName, line, moduleName, name, ref1;
      UsagesView.__super__.scrollToItemView.apply(this, arguments);
      ref1 = this.getSelectedItem(), name = ref1.name, moduleName = ref1.moduleName, fileName = ref1.fileName, line = ref1.line, column = ref1.column;
      editor = atom.workspace.getActiveTextEditor();
      if (editor.getBuffer().file.path === fileName) {
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToBufferPosition([line - 1, column], {
          center: true
        });
      }
    };

    UsagesView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No usages found';
      } else {
        return UsagesView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    UsagesView.prototype.confirmed = function(arg) {
      var column, fileName, line, moduleName, name, promise;
      name = arg.name, moduleName = arg.moduleName, fileName = arg.fileName, line = arg.line, column = arg.column;
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line - 1, column]);
        editor.setSelectedBufferRange([[line - 1, column], [line - 1, column + name.length]]);
        return editor.scrollToCursorPosition();
      });
    };

    UsagesView.prototype.cancelled = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    return UsagesView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3VzYWdlcy12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEseUNBQUE7SUFBQTs7O0VBQUEsTUFBdUIsT0FBQSxDQUFRLHNCQUFSLENBQXZCLEVBQUMsV0FBRCxFQUFLOztFQUNMLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3lCQUNKLFVBQUEsR0FBWSxTQUFDLE9BQUQ7TUFDViw0Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGNBQVY7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7TUFDQSxJQUFDLENBQUEsVUFBRCxDQUFZLG9CQUFaO2FBQ0EsSUFBQyxDQUFBLGlCQUFELENBQUE7SUFQVTs7eUJBU1osT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsTUFBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxPQUFQLENBQUE7SUFGTzs7eUJBSVQsV0FBQSxHQUFhLFNBQUMsR0FBRDtBQUNYLFVBQUE7TUFEYSxpQkFBTSw2QkFBWSx5QkFBVSxpQkFBTTtNQUMvQyxPQUFvQixJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWIsQ0FBNEIsUUFBNUIsQ0FBcEIsRUFBQyxXQUFELEVBQUk7QUFDSixhQUFPLEVBQUEsQ0FBRyxTQUFBO2VBQ1IsSUFBQyxDQUFBLEVBQUQsQ0FBSTtVQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sV0FBUDtTQUFKLEVBQXdCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7WUFDdEIsS0FBQyxDQUFBLEdBQUQsQ0FBSyxFQUFBLEdBQUcsSUFBUixFQUFnQjtjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sY0FBUDthQUFoQjttQkFDQSxLQUFDLENBQUEsR0FBRCxDQUFRLFlBQUQsR0FBYyxTQUFkLEdBQXVCLElBQTlCLEVBQXNDO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDthQUF0QztVQUZzQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7TUFEUSxDQUFIO0lBRkk7O3lCQU9iLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7eUJBRWQsZ0JBQUEsR0FBa0IsU0FBQTtBQUNoQixVQUFBO01BQUEsa0RBQUEsU0FBQTtNQUNBLE9BQTZDLElBQUMsQ0FBQSxlQUFELENBQUEsQ0FBN0MsRUFBQyxnQkFBRCxFQUFPLDRCQUFQLEVBQW1CLHdCQUFuQixFQUE2QixnQkFBN0IsRUFBbUM7TUFDbkMsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtNQUNULElBQUcsTUFBTSxDQUFDLFNBQVAsQ0FBQSxDQUFrQixDQUFDLElBQUksQ0FBQyxJQUF4QixLQUFnQyxRQUFuQztRQUNFLE1BQU0sQ0FBQyxzQkFBUCxDQUE4QixDQUM1QixDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsTUFBWCxDQUQ0QixFQUNSLENBQUMsSUFBQSxHQUFPLENBQVIsRUFBVyxNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQXpCLENBRFEsQ0FBOUI7ZUFFQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsQ0FBQyxJQUFBLEdBQU8sQ0FBUixFQUFXLE1BQVgsQ0FBOUIsRUFBa0Q7VUFBQSxNQUFBLEVBQVEsSUFBUjtTQUFsRCxFQUhGOztJQUpnQjs7eUJBU2xCLGVBQUEsR0FBaUIsU0FBQyxTQUFEO01BQ2YsSUFBRyxTQUFBLEtBQWEsQ0FBaEI7ZUFDRSxrQkFERjtPQUFBLE1BQUE7ZUFHRSxpREFBQSxTQUFBLEVBSEY7O0lBRGU7O3lCQU1qQixTQUFBLEdBQVcsU0FBQyxHQUFEO0FBQ1QsVUFBQTtNQURXLGlCQUFNLDZCQUFZLHlCQUFVLGlCQUFNO01BQzdDLElBQUMsQ0FBQSxjQUFELEdBQWtCO01BQ2xCLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDQSxPQUFBLEdBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFmLENBQW9CLFFBQXBCO2FBQ1YsT0FBTyxDQUFDLElBQVIsQ0FBYSxTQUFDLE1BQUQ7UUFDWCxNQUFNLENBQUMsdUJBQVAsQ0FBK0IsQ0FBQyxJQUFBLEdBQU8sQ0FBUixFQUFXLE1BQVgsQ0FBL0I7UUFDQSxNQUFNLENBQUMsc0JBQVAsQ0FBOEIsQ0FDNUIsQ0FBQyxJQUFBLEdBQU8sQ0FBUixFQUFXLE1BQVgsQ0FENEIsRUFDUixDQUFDLElBQUEsR0FBTyxDQUFSLEVBQVcsTUFBQSxHQUFTLElBQUksQ0FBQyxNQUF6QixDQURRLENBQTlCO2VBRUEsTUFBTSxDQUFDLHNCQUFQLENBQUE7TUFKVyxDQUFiO0lBSlM7O3lCQVVYLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTsrQ0FBTSxDQUFFLElBQVIsQ0FBQTtJQURTOzs7O0tBaERZO0FBSnpCIiwic291cmNlc0NvbnRlbnQiOlsieyQkLCBTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBVc2FnZXNWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKG1hdGNoZXMpIC0+XG4gICAgc3VwZXJcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQGFkZENsYXNzKCdzeW1ib2xzLXZpZXcnKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzZXRMb2FkaW5nKCdMb29raW5nIGZvciB1c2FnZXMnKVxuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAY2FuY2VsKClcbiAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7bmFtZSwgbW9kdWxlTmFtZSwgZmlsZU5hbWUsIGxpbmUsIGNvbHVtbn0pIC0+XG4gICAgW18sIHJlbGF0aXZlUGF0aF0gPSBhdG9tLnByb2plY3QucmVsYXRpdml6ZVBhdGgoZmlsZU5hbWUpXG4gICAgcmV0dXJuICQkIC0+XG4gICAgICBAbGkgY2xhc3M6ICd0d28tbGluZXMnLCA9PlxuICAgICAgICBAZGl2IFwiI3tuYW1lfVwiLCBjbGFzczogJ3ByaW1hcnktbGluZSdcbiAgICAgICAgQGRpdiBcIiN7cmVsYXRpdmVQYXRofSwgbGluZSAje2xpbmV9XCIsIGNsYXNzOiAnc2Vjb25kYXJ5LWxpbmUnXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAnZmlsZU5hbWUnXG5cbiAgc2Nyb2xsVG9JdGVtVmlldzogLT5cbiAgICBzdXBlclxuICAgIHtuYW1lLCBtb2R1bGVOYW1lLCBmaWxlTmFtZSwgbGluZSwgY29sdW1ufSA9IEBnZXRTZWxlY3RlZEl0ZW0oKVxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIGVkaXRvci5nZXRCdWZmZXIoKS5maWxlLnBhdGggaXMgZmlsZU5hbWVcbiAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKFtcbiAgICAgICAgW2xpbmUgLSAxLCBjb2x1bW5dLCBbbGluZSAtIDEsIGNvbHVtbiArIG5hbWUubGVuZ3RoXV0pXG4gICAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihbbGluZSAtIDEsIGNvbHVtbl0sIGNlbnRlcjogdHJ1ZSlcblxuICBnZXRFbXB0eU1lc3NhZ2U6IChpdGVtQ291bnQpIC0+XG4gICAgaWYgaXRlbUNvdW50IGlzIDBcbiAgICAgICdObyB1c2FnZXMgZm91bmQnXG4gICAgZWxzZVxuICAgICAgc3VwZXJcblxuICBjb25maXJtZWQ6ICh7bmFtZSwgbW9kdWxlTmFtZSwgZmlsZU5hbWUsIGxpbmUsIGNvbHVtbn0pIC0+XG4gICAgQGNhbmNlbFBvc2l0aW9uID0gbnVsbFxuICAgIEBjYW5jZWwoKVxuICAgIHByb21pc2UgPSBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVOYW1lKVxuICAgIHByb21pc2UudGhlbiAoZWRpdG9yKSAtPlxuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKFtsaW5lIC0gMSwgY29sdW1uXSlcbiAgICAgIGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlKFtcbiAgICAgICAgW2xpbmUgLSAxLCBjb2x1bW5dLCBbbGluZSAtIDEsIGNvbHVtbiArIG5hbWUubGVuZ3RoXV0pXG4gICAgICBlZGl0b3Iuc2Nyb2xsVG9DdXJzb3JQb3NpdGlvbigpXG5cbiAgY2FuY2VsbGVkOiAtPlxuICAgIEBwYW5lbD8uaGlkZSgpXG4iXX0=
