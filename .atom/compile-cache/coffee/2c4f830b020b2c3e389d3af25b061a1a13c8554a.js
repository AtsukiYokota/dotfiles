(function() {
  var RenameView, TextEditorView, View,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  View = require('space-pen').View;

  TextEditorView = require('atom-space-pen-views').TextEditorView;

  module.exports = RenameView = (function(superClass) {
    extend(RenameView, superClass);

    function RenameView() {
      return RenameView.__super__.constructor.apply(this, arguments);
    }

    RenameView.prototype.initialize = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this,
          visible: true
        });
      }
      return atom.commands.add(this.element, 'core:cancel', (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this));
    };

    RenameView.prototype.destroy = function() {
      this.panel.hide();
      this.focusout();
      return this.panel.destroy();
    };

    RenameView.content = function(usages) {
      var n, name;
      n = usages.length;
      name = usages[0].name;
      return this.div((function(_this) {
        return function() {
          _this.div("Type new name to replace " + n + " occurences of " + name + " within project:");
          return _this.subview('miniEditor', new TextEditorView({
            mini: true,
            placeholderText: name
          }));
        };
      })(this));
    };

    RenameView.prototype.onInput = function(callback) {
      this.miniEditor.focus();
      return atom.commands.add(this.element, {
        'core:confirm': (function(_this) {
          return function() {
            callback(_this.miniEditor.getText());
            return _this.destroy();
          };
        })(this)
      });
    };

    return RenameView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3JlbmFtZS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0NBQUE7SUFBQTs7O0VBQUMsT0FBUSxPQUFBLENBQVEsV0FBUjs7RUFDUixpQkFBa0IsT0FBQSxDQUFRLHNCQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3lCQUNKLFVBQUEsR0FBWSxTQUFBOztRQUNWLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1VBQVMsT0FBQSxFQUFTLElBQWxCO1NBQTdCOzthQUNWLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixJQUFDLENBQUEsT0FBbkIsRUFBNEIsYUFBNUIsRUFBMkMsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxPQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBM0M7SUFGVTs7eUJBSVosT0FBQSxHQUFTLFNBQUE7TUFDUCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTtNQUNBLElBQUMsQ0FBQyxRQUFGLENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLE9BQVAsQ0FBQTtJQUhPOztJQUtULFVBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQyxNQUFEO0FBQ1IsVUFBQTtNQUFBLENBQUEsR0FBSSxNQUFNLENBQUM7TUFDWCxJQUFBLEdBQU8sTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO2FBQ2pCLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ0gsS0FBQyxDQUFBLEdBQUQsQ0FBSywyQkFBQSxHQUE0QixDQUE1QixHQUE4QixpQkFBOUIsR0FBK0MsSUFBL0MsR0FBb0Qsa0JBQXpEO2lCQUNBLEtBQUMsQ0FBQSxPQUFELENBQVMsWUFBVCxFQUF1QixJQUFJLGNBQUosQ0FDckI7WUFBQSxJQUFBLEVBQU0sSUFBTjtZQUFZLGVBQUEsRUFBaUIsSUFBN0I7V0FEcUIsQ0FBdkI7UUFGRztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTDtJQUhROzt5QkFRVixPQUFBLEdBQVMsU0FBQyxRQUFEO01BQ1AsSUFBQyxDQUFBLFVBQVUsQ0FBQyxLQUFaLENBQUE7YUFDQSxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsSUFBQyxDQUFBLE9BQW5CLEVBQTRCO1FBQUEsY0FBQSxFQUFnQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO1lBQzFDLFFBQUEsQ0FBUyxLQUFDLENBQUEsVUFBVSxDQUFDLE9BQVosQ0FBQSxDQUFUO21CQUNBLEtBQUMsQ0FBQSxPQUFELENBQUE7VUFGMEM7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWhCO09BQTVCO0lBRk87Ozs7S0FsQmM7QUFKekIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Vmlld30gPSByZXF1aXJlICdzcGFjZS1wZW4nXG57VGV4dEVkaXRvclZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFJlbmFtZVZpZXcgZXh0ZW5kcyBWaWV3XG4gIGluaXRpYWxpemU6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogQCwgdmlzaWJsZTogdHJ1ZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZChAZWxlbWVudCwgJ2NvcmU6Y2FuY2VsJywgPT4gQGRlc3Ryb3koKSlcblxuICBkZXN0cm95OiAtPlxuICAgIEBwYW5lbC5oaWRlKClcbiAgICBALmZvY3Vzb3V0KClcbiAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgQGNvbnRlbnQ6ICh1c2FnZXMpIC0+XG4gICAgbiA9IHVzYWdlcy5sZW5ndGhcbiAgICBuYW1lID0gdXNhZ2VzWzBdLm5hbWVcbiAgICBAZGl2ID0+XG4gICAgICBAZGl2IFwiVHlwZSBuZXcgbmFtZSB0byByZXBsYWNlICN7bn0gb2NjdXJlbmNlcyBvZiAje25hbWV9IHdpdGhpbiBwcm9qZWN0OlwiXG4gICAgICBAc3VidmlldyAnbWluaUVkaXRvcicsIG5ldyBUZXh0RWRpdG9yVmlld1xuICAgICAgICBtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IG5hbWVcblxuICBvbklucHV0OiAoY2FsbGJhY2spIC0+XG4gICAgQG1pbmlFZGl0b3IuZm9jdXMoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkIEBlbGVtZW50LCAnY29yZTpjb25maXJtJzogPT5cbiAgICAgIGNhbGxiYWNrKEBtaW5pRWRpdG9yLmdldFRleHQoKSlcbiAgICAgIEBkZXN0cm95KClcbiJdfQ==
