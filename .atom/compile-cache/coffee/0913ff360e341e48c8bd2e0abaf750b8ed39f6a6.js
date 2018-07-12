(function() {
  var $$, OverrideView, SelectListView, path, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  path = require('path');

  module.exports = OverrideView = (function(superClass) {
    extend(OverrideView, superClass);

    function OverrideView() {
      return OverrideView.__super__.constructor.apply(this, arguments);
    }

    OverrideView.prototype.initialize = function(matches) {
      OverrideView.__super__.initialize.apply(this, arguments);
      this.storeFocusedElement();
      this.addClass('symbols-view');
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.setLoading('Looking for methods');
      this.focusFilterEditor();
      this.indent = 0;
      return this.bufferPosition = null;
    };

    OverrideView.prototype.destroy = function() {
      this.cancel();
      return this.panel.destroy();
    };

    OverrideView.prototype.viewForItem = function(arg) {
      var _, column, fileName, line, moduleName, name, params, parent, ref1, relativePath;
      parent = arg.parent, name = arg.name, params = arg.params, moduleName = arg.moduleName, fileName = arg.fileName, line = arg.line, column = arg.column;
      if (!line) {
        return $$(function() {
          return this.li({
            "class": 'two-lines'
          }, (function(_this) {
            return function() {
              _this.div(parent + "." + name, {
                "class": 'primary-line'
              });
              return _this.div('builtin', {
                "class": 'secondary-line'
              });
            };
          })(this));
        });
      } else {
        ref1 = atom.project.relativizePath(fileName), _ = ref1[0], relativePath = ref1[1];
        return $$(function() {
          return this.li({
            "class": 'two-lines'
          }, (function(_this) {
            return function() {
              _this.div(parent + "." + name, {
                "class": 'primary-line'
              });
              return _this.div(relativePath + ", line " + line, {
                "class": 'secondary-line'
              });
            };
          })(this));
        });
      }
    };

    OverrideView.prototype.getFilterKey = function() {
      return 'name';
    };

    OverrideView.prototype.getEmptyMessage = function(itemCount) {
      if (itemCount === 0) {
        return 'No methods found';
      } else {
        return OverrideView.__super__.getEmptyMessage.apply(this, arguments);
      }
    };

    OverrideView.prototype.confirmed = function(arg) {
      var column, editor, instance, line, line1, line2, name, params, parent, superCall, tabLength, tabText, userIndent;
      parent = arg.parent, instance = arg.instance, name = arg.name, params = arg.params, line = arg.line, column = arg.column;
      this.cancelPosition = null;
      this.cancel();
      editor = atom.workspace.getActiveTextEditor();
      tabLength = editor.getTabLength();
      line1 = "def " + name + "(" + (['self'].concat(params).join(', ')) + "):";
      superCall = "super(" + instance + ", self)." + name + "(" + (params.join(', ')) + ")";
      if (name === '__init__') {
        line2 = "" + superCall;
      } else {
        line2 = "return " + superCall;
      }
      if (this.indent < 1) {
        tabText = editor.getTabText();
        editor.insertText("" + tabText + line1);
        editor.insertNewlineBelow();
        return editor.setTextInBufferRange([[this.bufferPosition.row + 1, 0], [this.bufferPosition.row + 1, tabLength * 2]], "" + tabText + tabText + line2);
      } else {
        userIndent = editor.getTextInRange([[this.bufferPosition.row, 0], [this.bufferPosition.row, this.bufferPosition.column]]);
        editor.insertText("" + line1);
        editor.insertNewlineBelow();
        return editor.setTextInBufferRange([[this.bufferPosition.row + 1, 0], [this.bufferPosition.row + 1, tabLength * 2]], "" + userIndent + userIndent + line2);
      }
    };

    OverrideView.prototype.cancelled = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    return OverrideView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL292ZXJyaWRlLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSwyQ0FBQTtJQUFBOzs7RUFBQSxNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUVQLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7MkJBQ0osVUFBQSxHQUFZLFNBQUMsT0FBRDtNQUNWLDhDQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsY0FBVjs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQSxVQUFELENBQVkscUJBQVo7TUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtNQUNBLElBQUMsQ0FBQSxNQUFELEdBQVU7YUFDVixJQUFDLENBQUEsY0FBRCxHQUFrQjtJQVRSOzsyQkFXWixPQUFBLEdBQVMsU0FBQTtNQUNQLElBQUMsQ0FBQSxNQUFELENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtJQUZPOzsyQkFJVCxXQUFBLEdBQWEsU0FBQyxHQUFEO0FBQ1gsVUFBQTtNQURhLHFCQUFRLGlCQUFNLHFCQUFRLDZCQUFZLHlCQUFVLGlCQUFNO01BQy9ELElBQUcsQ0FBSSxJQUFQO0FBQ0UsZUFBTyxFQUFBLENBQUcsU0FBQTtpQkFDUixJQUFDLENBQUEsRUFBRCxDQUFJO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxXQUFQO1dBQUosRUFBd0IsQ0FBQSxTQUFB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LENBQUMsSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFqQixFQUFzQixDQUF0QixDQURpQyxFQUVqQyxDQUFDLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBakIsRUFBc0IsSUFBQyxDQUFBLGNBQWMsQ0FBQyxNQUF0QyxDQUZpQyxDQUF0QjtRQUliLE1BQU0sQ0FBQyxVQUFQLENBQWtCLEVBQUEsR0FBRyxLQUFyQjtRQUNBLE1BQU0sQ0FBQyxrQkFBUCxDQUFBO2VBQ0EsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQ3hCLENBQUMsSUFBQyxDQUFBLGNBQWMsQ0FBQyxHQUFoQixHQUFzQixDQUF2QixFQUEwQixDQUExQixDQUR3QixFQUV4QixDQUFDLElBQUMsQ0FBQSxjQUFjLENBQUMsR0FBaEIsR0FBc0IsQ0FBdkIsRUFBMEIsU0FBQSxHQUFZLENBQXRDLENBRndCLENBQTVCLEVBSUUsRUFBQSxHQUFHLFVBQUgsR0FBZ0IsVUFBaEIsR0FBNkIsS0FKL0IsRUFqQkY7O0lBYlM7OzJCQW9DWCxTQUFBLEdBQVcsU0FBQTtBQUNULFVBQUE7K0NBQU0sQ0FBRSxJQUFSLENBQUE7SUFEUzs7OztLQXpFYztBQUozQiIsInNvdXJjZXNDb250ZW50IjpbInskJCwgU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgT3ZlcnJpZGVWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgaW5pdGlhbGl6ZTogKG1hdGNoZXMpIC0+XG4gICAgc3VwZXJcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQGFkZENsYXNzKCdzeW1ib2xzLXZpZXcnKVxuICAgIEBwYW5lbCA/PSBhdG9tLndvcmtzcGFjZS5hZGRNb2RhbFBhbmVsKGl0ZW06IHRoaXMpXG4gICAgQHBhbmVsLnNob3coKVxuICAgIEBzZXRMb2FkaW5nKCdMb29raW5nIGZvciBtZXRob2RzJylcbiAgICBAZm9jdXNGaWx0ZXJFZGl0b3IoKVxuICAgIEBpbmRlbnQgPSAwXG4gICAgQGJ1ZmZlclBvc2l0aW9uID0gbnVsbFxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQGNhbmNlbCgpXG4gICAgQHBhbmVsLmRlc3Ryb3koKVxuXG4gIHZpZXdGb3JJdGVtOiAoe3BhcmVudCwgbmFtZSwgcGFyYW1zLCBtb2R1bGVOYW1lLCBmaWxlTmFtZSwgbGluZSwgY29sdW1ufSkgLT5cbiAgICBpZiBub3QgbGluZVxuICAgICAgcmV0dXJuICQkIC0+XG4gICAgICAgIEBsaSBjbGFzczogJ3R3by1saW5lcycsID0+XG4gICAgICAgICAgQGRpdiBcIiN7cGFyZW50fS4je25hbWV9XCIsIGNsYXNzOiAncHJpbWFyeS1saW5lJ1xuICAgICAgICAgIEBkaXYgJ2J1aWx0aW4nLCBjbGFzczogJ3NlY29uZGFyeS1saW5lJ1xuICAgIGVsc2VcbiAgICAgIFtfLCByZWxhdGl2ZVBhdGhdID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVOYW1lKVxuICAgICAgcmV0dXJuICQkIC0+XG4gICAgICAgIEBsaSBjbGFzczogJ3R3by1saW5lcycsID0+XG4gICAgICAgICAgQGRpdiBcIiN7cGFyZW50fS4je25hbWV9XCIsIGNsYXNzOiAncHJpbWFyeS1saW5lJ1xuICAgICAgICAgIEBkaXYgXCIje3JlbGF0aXZlUGF0aH0sIGxpbmUgI3tsaW5lfVwiLCBjbGFzczogJ3NlY29uZGFyeS1saW5lJ1xuXG4gIGdldEZpbHRlcktleTogLT4gJ25hbWUnXG5cbiAgZ2V0RW1wdHlNZXNzYWdlOiAoaXRlbUNvdW50KSAtPlxuICAgIGlmIGl0ZW1Db3VudCBpcyAwXG4gICAgICAnTm8gbWV0aG9kcyBmb3VuZCdcbiAgICBlbHNlXG4gICAgICBzdXBlclxuXG4gIGNvbmZpcm1lZDogKHtwYXJlbnQsIGluc3RhbmNlLCBuYW1lLCBwYXJhbXMsIGxpbmUsIGNvbHVtbn0pIC0+XG4gICAgQGNhbmNlbFBvc2l0aW9uID0gbnVsbFxuICAgIEBjYW5jZWwoKVxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHRhYkxlbmd0aCA9IGVkaXRvci5nZXRUYWJMZW5ndGgoKVxuXG4gICAgbGluZTEgPSBcImRlZiAje25hbWV9KCN7WydzZWxmJ10uY29uY2F0KHBhcmFtcykuam9pbignLCAnKX0pOlwiXG4gICAgc3VwZXJDYWxsID0gXCJzdXBlcigje2luc3RhbmNlfSwgc2VsZikuI3tuYW1lfSgje3BhcmFtcy5qb2luKCcsICcpfSlcIlxuICAgIGlmIG5hbWUgaW4gWydfX2luaXRfXyddXG4gICAgICBsaW5lMiA9IFwiI3tzdXBlckNhbGx9XCJcbiAgICBlbHNlXG4gICAgICBsaW5lMiA9IFwicmV0dXJuICN7c3VwZXJDYWxsfVwiXG5cbiAgICBpZiBAaW5kZW50IDwgMVxuICAgICAgdGFiVGV4dCA9IGVkaXRvci5nZXRUYWJUZXh0KClcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0KFwiI3t0YWJUZXh0fSN7bGluZTF9XCIpXG4gICAgICBlZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZSBbXG4gICAgICAgICAgW0BidWZmZXJQb3NpdGlvbi5yb3cgKyAxLCAwXSxcbiAgICAgICAgICBbQGJ1ZmZlclBvc2l0aW9uLnJvdyArIDEsIHRhYkxlbmd0aCAqIDJdXG4gICAgICAgIF0sXG4gICAgICAgIFwiI3t0YWJUZXh0fSN7dGFiVGV4dH0je2xpbmUyfVwiXG5cbiAgICBlbHNlXG4gICAgICB1c2VySW5kZW50ID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtcbiAgICAgICAgW0BidWZmZXJQb3NpdGlvbi5yb3csIDBdLFxuICAgICAgICBbQGJ1ZmZlclBvc2l0aW9uLnJvdywgQGJ1ZmZlclBvc2l0aW9uLmNvbHVtbl1cbiAgICAgIF0pXG4gICAgICBlZGl0b3IuaW5zZXJ0VGV4dChcIiN7bGluZTF9XCIpXG4gICAgICBlZGl0b3IuaW5zZXJ0TmV3bGluZUJlbG93KClcbiAgICAgIGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZSBbXG4gICAgICAgICAgW0BidWZmZXJQb3NpdGlvbi5yb3cgKyAxLCAwXSxcbiAgICAgICAgICBbQGJ1ZmZlclBvc2l0aW9uLnJvdyArIDEsIHRhYkxlbmd0aCAqIDJdXG4gICAgICAgIF0sXG4gICAgICAgIFwiI3t1c2VySW5kZW50fSN7dXNlckluZGVudH0je2xpbmUyfVwiXG5cbiAgY2FuY2VsbGVkOiAtPlxuICAgIEBwYW5lbD8uaGlkZSgpXG4iXX0=
