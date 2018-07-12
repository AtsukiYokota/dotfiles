(function() {
  "use strict";
  var Beautifier, CoffeeFmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = CoffeeFmt = (function(superClass) {
    extend(CoffeeFmt, superClass);

    function CoffeeFmt() {
      return CoffeeFmt.__super__.constructor.apply(this, arguments);
    }

    CoffeeFmt.prototype.name = "coffee-fmt";

    CoffeeFmt.prototype.link = "https://github.com/sterpe/coffee-fmt";

    CoffeeFmt.prototype.options = {
      CoffeeScript: {
        tab: [
          "indent_size", "indent_char", "indent_with_tabs", function(indentSize, indentChar, indentWithTabs) {
            if (indentWithTabs) {
              return "\t";
            }
            return Array(indentSize + 1).join(indentChar);
          }
        ]
      }
    };

    CoffeeFmt.prototype.beautify = function(text, language, options) {
      this.verbose('beautify', language, options);
      return new this.Promise(function(resolve, reject) {
        var e, fmt, results;
        options.newLine = "\n";
        fmt = require('coffee-fmt');
        try {
          results = fmt.format(text, options);
          return resolve(results);
        } catch (error) {
          e = error;
          return reject(e);
        }
      });
    };

    return CoffeeFmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2NvZmZlZS1mbXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUVOLE9BQUEsR0FBUztNQUVQLFlBQUEsRUFDRTtRQUFBLEdBQUEsRUFBSztVQUFDLGFBQUQsRUFDSCxhQURHLEVBQ1ksa0JBRFosRUFFSCxTQUFDLFVBQUQsRUFBYSxVQUFiLEVBQXlCLGNBQXpCO1lBQ0UsSUFBZSxjQUFmO0FBQUEscUJBQU8sS0FBUDs7bUJBQ0EsS0FBQSxDQUFNLFVBQUEsR0FBVyxDQUFqQixDQUFtQixDQUFDLElBQXBCLENBQXlCLFVBQXpCO1VBRkYsQ0FGRztTQUFMO09BSEs7Ozt3QkFXVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtNQUNSLElBQUMsQ0FBQSxPQUFELENBQVMsVUFBVCxFQUFxQixRQUFyQixFQUErQixPQUEvQjtBQUNBLGFBQU8sSUFBSSxJQUFDLENBQUEsT0FBTCxDQUFhLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFFbEIsWUFBQTtRQUFBLE9BQU8sQ0FBQyxPQUFSLEdBQWtCO1FBRWxCLEdBQUEsR0FBTSxPQUFBLENBQVEsWUFBUjtBQUVOO1VBQ0UsT0FBQSxHQUFVLEdBQUcsQ0FBQyxNQUFKLENBQVcsSUFBWCxFQUFpQixPQUFqQjtpQkFFVixPQUFBLENBQVEsT0FBUixFQUhGO1NBQUEsYUFBQTtVQUlNO2lCQUNKLE1BQUEsQ0FBTyxDQUFQLEVBTEY7O01BTmtCLENBQWI7SUFGQzs7OztLQWY2QjtBQUh6QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBDb2ZmZWVGbXQgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiY29mZmVlLWZtdFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3N0ZXJwZS9jb2ZmZWUtZm10XCJcblxuICBvcHRpb25zOiB7XG4gICAgIyBBcHBseSBsYW5ndWFnZS1zcGVjaWZpYyBvcHRpb25zXG4gICAgQ29mZmVlU2NyaXB0OlxuICAgICAgdGFiOiBbXCJpbmRlbnRfc2l6ZVwiLCBcXFxuICAgICAgICBcImluZGVudF9jaGFyXCIsIFwiaW5kZW50X3dpdGhfdGFic1wiLCBcXFxuICAgICAgICAoaW5kZW50U2l6ZSwgaW5kZW50Q2hhciwgaW5kZW50V2l0aFRhYnMpIC0+XG4gICAgICAgICAgcmV0dXJuIFwiXFx0XCIgaWYgaW5kZW50V2l0aFRhYnNcbiAgICAgICAgICBBcnJheShpbmRlbnRTaXplKzEpLmpvaW4oaW5kZW50Q2hhcilcbiAgICAgIF1cbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgQHZlcmJvc2UoJ2JlYXV0aWZ5JywgbGFuZ3VhZ2UsIG9wdGlvbnMpXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgIyBBZGQgbmV3TGluZSBvcHRpb25cbiAgICAgIG9wdGlvbnMubmV3TGluZSA9IFwiXFxuXCJcbiAgICAgICMgUmVxdWlyZVxuICAgICAgZm10ID0gcmVxdWlyZSgnY29mZmVlLWZtdCcpXG4gICAgICAjIEZvcm1hdCFcbiAgICAgIHRyeVxuICAgICAgICByZXN1bHRzID0gZm10LmZvcm1hdCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAjIFJldHVybiBiZWF1dGlmaWVkIENvZmZlZVNjcmlwdCBjb2RlXG4gICAgICAgIHJlc29sdmUocmVzdWx0cylcbiAgICAgIGNhdGNoIGVcbiAgICAgICAgcmVqZWN0KGUpXG4gICAgKVxuIl19
