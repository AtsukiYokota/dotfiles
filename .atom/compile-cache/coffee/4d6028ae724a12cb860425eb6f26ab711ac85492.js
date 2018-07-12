(function() {
  var $$, DefinitionsView, SelectListView, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  path = require('path');

  module.exports = DefinitionsView = (function(superClass) {
    extend(DefinitionsView, superClass);

    function DefinitionsView() {
      return DefinitionsView.__super__.constructor.apply(this, arguments);
    }

    DefinitionsView.prototype.initialize = function(matches) {
      DefinitionsView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for definitions');
      return this.focusFilterEditor();
    };

    DefinitionsView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    DefinitionsView.prototype.viewForItem = function(arg) {
      var _, column, fileName, line, ref1, relativePath, text, type;
      text = arg.text, fileName = arg.fileName, line = arg.line, column = arg.column, type = arg.type;
      ref1 = atom.project.relativizePath(fileName), _ = ref1[0], relativePath = ref1[1];
      return $$(function() {
        return this.li({
          "class": 'two-lines'
        }, (function(_this) {
          return function() {
            _this.div(type + " " + text, {
              "class": 'primary-line'
            });
            return _this.div(relativePath + ", line " + (line + 1), {
              "class": 'secondary-line'
            });
          };
        })(this));
      });
    };

    DefinitionsView.prototype.getFilterKey = function() {
      return 'fileName';
    };

    DefinitionsView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No definition found';
      } else {
        return DefinitionsView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    DefinitionsView.prototype.confirmed = function(arg) {
      var column, fileName, line, promise;
      fileName = arg.fileName, line = arg.line, column = arg.column;
      this.cancelPosition = null;
      this.cancel();
      promise = atom.workspace.open(fileName);
      return promise.then(function(editor) {
        editor.setCursorBufferPosition([line, column]);
        return editor.scrollToCursorPosition();
      });
    };

    DefinitionsView.prototype.cancelled = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    return DefinitionsView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2RlZmluaXRpb25zLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw4Q0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7OEJBQ0osVUFBQSxHQUFZLFNBQUMsT0FBRDtNQUNWLGlEQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsY0FBVjs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELENBQVkseUJBQVo7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVBVOzs4QkFTWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxNQUFELENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtJQUZPOzs4QkFJVCxXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLGlCQUFNLHlCQUFVLGlCQUFNLHFCQUFRO01BQzNDLE9BQW9CLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixRQUE1QixDQUFwQixFQUFDLFdBQUQsRUFBSTtBQUNKLGFBQU8sRUFBQSxDQUFHLFNBQUE7ZUFDUixJQUFDLENBQUEsRUFBRCxDQUFJO1VBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO1NBQUosRUFBd0IsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUN0QixLQUFDLENBQUEsR0FBRCxDQUFRLElBQUQsR0FBTSxHQUFOLEdBQVMsSUFBaEIsRUFBd0I7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGNBQVA7YUFBeEI7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBUSxZQUFELEdBQWMsU0FBZCxHQUFzQixDQUFDLElBQUEsR0FBTyxDQUFSLENBQTdCLEVBQTBDO2NBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxnQkFBUDthQUExQztVQUZzQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBeEI7TUFEUSxDQUFIO0lBRkk7OzhCQU9iLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7OEJBRWQsZUFBQSxHQUFpQixTQUFDLFNBQUQ7TUFDZixJQUFHLFNBQUEsS0FBYSxDQUFoQjtlQUNFLHNCQURGO09BQUEsTUFBQTtlQUdFLHNEQUFBLFNBQUEsRUFIRjs7SUFEZTs7OEJBTWpCLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcseUJBQVUsaUJBQU07TUFDM0IsSUFBQyxDQUFBLGNBQUQsR0FBa0I7TUFDbEIsSUFBQyxDQUFBLE1BQUQsQ0FBQTtNQUNBLE9BQUEsR0FBVSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQWYsQ0FBb0IsUUFBcEI7YUFDVixPQUFPLENBQUMsSUFBUixDQUFhLFNBQUMsTUFBRDtRQUNYLE1BQU0sQ0FBQyx1QkFBUCxDQUErQixDQUFDLElBQUQsRUFBTyxNQUFQLENBQS9CO2VBQ0EsTUFBTSxDQUFDLHNCQUFQLENBQUE7TUFGVyxDQUFiO0lBSlM7OzhCQVFYLFNBQUEsR0FBVyxTQUFBO0FBQ1QsVUFBQTsrQ0FBTSxDQUFFLElBQVIsQ0FBQTtJQURTOzs7O0tBckNpQjtBQUo5QiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgRGVmaW5pdGlvbnNWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKG1hdGNoZXMpIC0+XG4gICAgc3VwZXJcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQGFkZENsYXNzKCdzeW1ib2xzLXZpZXcnKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzZXRMb2FkaW5nKCdMb29raW5nIGZvciBkZWZpbml0aW9ucycpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBkZXN0cm95OiAtPlxuICAgIEBjYW5jZWwoKVxuICAgIEBwYW5lbC5kZXN0cm95KClcblxuICB2aWV3Rm9ySXRlbTogKHt0ZXh0LCBmaWxlTmFtZSwgbGluZSwgY29sdW1uLCB0eXBlfSkgLT5cbiAgICBbXywgcmVsYXRpdmVQYXRoXSA9IGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlTmFtZSlcbiAgICByZXR1cm4gJCQgLT5cbiAgICAgIEBsaSBjbGFzczogJ3R3by1saW5lcycsID0+XG4gICAgICAgIEBkaXYgXCIje3R5cGV9ICN7dGV4dH1cIiwgY2xhc3M6ICdwcmltYXJ5LWxpbmUnXG4gICAgICAgIEBkaXYgXCIje3JlbGF0aXZlUGF0aH0sIGxpbmUgI3tsaW5lICsgMX1cIiwgY2xhc3M6ICdzZWNvbmRhcnktbGluZSdcblxuICBnZXRGaWx0ZXJLZXk6IC0+ICdmaWxlTmFtZSdcblxuICBnZXRFbXB0eU1lc3NhZ2U6IChpdGVtQ291bnQpIC0+XG4gICAgaWYgaXRlbUNvdW50IGlzIDBcbiAgICAgICdObyBkZWZpbml0aW9uIGZvdW5kJ1xuICAgIGVsc2VcbiAgICAgIHN1cGVyXG5cbiAgY29uZmlybWVkOiAoe2ZpbGVOYW1lLCBsaW5lLCBjb2x1bW59KSAtPlxuICAgIEBjYW5jZWxQb3NpdGlvbiA9IG51bGxcbiAgICBAY2FuY2VsKClcbiAgICBwcm9taXNlID0gYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlTmFtZSlcbiAgICBwcm9taXNlLnRoZW4gKGVkaXRvcikgLT5cbiAgICAgIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbbGluZSwgY29sdW1uXSlcbiAgICAgIGVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKClcblxuICBjYW5jZWxsZWQ6IC0+XG4gICAgQHBhbmVsPy5oaWRlKClcbiJdfQ==
