
/*
 */

(function() {
  var Beautifier, Lua, format, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  path = require("path");

  "use strict";

  Beautifier = require('../beautifier');

  format = require('./beautifier');

  module.exports = Lua = (function(superClass) {
    extend(Lua, superClass);

    function Lua() {
      return Lua.__super__.constructor.apply(this, arguments);
    }

    Lua.prototype.name = "Lua beautifier";

    Lua.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/lua-beautifier/beautifier.coffee";

    Lua.prototype.options = {
      Lua: {
        indent_size: true,
        indent_char: true,
        end_of_line: true
      }
    };

    Lua.prototype.beautify = function(text, language, options) {
      var indent, indentChar, indentSize;
      options.eol = this.getDefaultLineEnding('\r\n', '\n', options.end_of_line);
      indentChar = options.indent_char || " ";
      indentSize = options.indent_size;
      indent = indentChar.repeat(indentSize);
      return new this.Promise(function(resolve, reject) {
        var error;
        try {
          return resolve(format(text, indent, this.warn, options));
        } catch (error1) {
          error = error1;
          return reject(error);
        }
      });
    };

    return Lua;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2x1YS1iZWF1dGlmaWVyL2luZGV4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7OztBQUFBO0FBQUEsTUFBQSw2QkFBQTtJQUFBOzs7RUFFQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVA7O0VBQ0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFFVCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztrQkFDckIsSUFBQSxHQUFNOztrQkFDTixJQUFBLEdBQU07O2tCQUVOLE9BQUEsR0FBUztNQUNQLEdBQUEsRUFBSztRQUNILFdBQUEsRUFBYSxJQURWO1FBRUgsV0FBQSxFQUFhLElBRlY7UUFHSCxXQUFBLEVBQWEsSUFIVjtPQURFOzs7a0JBUVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO01BQUEsT0FBTyxDQUFDLEdBQVIsR0FBYyxJQUFDLENBQUEsb0JBQUQsQ0FBc0IsTUFBdEIsRUFBNkIsSUFBN0IsRUFBbUMsT0FBTyxDQUFDLFdBQTNDO01BQ2QsVUFBQSxHQUFhLE9BQU8sQ0FBQyxXQUFSLElBQXVCO01BQ3BDLFVBQUEsR0FBYSxPQUFPLENBQUM7TUFDckIsTUFBQSxHQUFTLFVBQVUsQ0FBQyxNQUFYLENBQWtCLFVBQWxCO2FBQ1QsSUFBSSxJQUFDLENBQUEsT0FBTCxDQUFhLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDWCxZQUFBO0FBQUE7aUJBQ0UsT0FBQSxDQUFRLE1BQUEsQ0FBTyxJQUFQLEVBQWEsTUFBYixFQUFxQixJQUFDLENBQUEsSUFBdEIsRUFBNEIsT0FBNUIsQ0FBUixFQURGO1NBQUEsY0FBQTtVQUVNO2lCQUNKLE1BQUEsQ0FBTyxLQUFQLEVBSEY7O01BRFcsQ0FBYjtJQUxROzs7O0tBWnVCO0FBUm5DIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4jIyNcbnBhdGggPSByZXF1aXJlKFwicGF0aFwiKVxuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4uL2JlYXV0aWZpZXInKVxuZm9ybWF0ID0gcmVxdWlyZSAnLi9iZWF1dGlmaWVyJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEx1YSBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJMdWEgYmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L2Jsb2IvbWFzdGVyL3NyYy9iZWF1dGlmaWVycy9sdWEtYmVhdXRpZmllci9iZWF1dGlmaWVyLmNvZmZlZVwiXG5cbiAgb3B0aW9uczoge1xuICAgIEx1YToge1xuICAgICAgaW5kZW50X3NpemU6IHRydWVcbiAgICAgIGluZGVudF9jaGFyOiB0cnVlXG4gICAgICBlbmRfb2ZfbGluZTogdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgb3B0aW9ucy5lb2wgPSBAZ2V0RGVmYXVsdExpbmVFbmRpbmcoJ1xcclxcbicsJ1xcbicsIG9wdGlvbnMuZW5kX29mX2xpbmUpXG4gICAgaW5kZW50Q2hhciA9IG9wdGlvbnMuaW5kZW50X2NoYXIgb3IgXCIgXCJcbiAgICBpbmRlbnRTaXplID0gb3B0aW9ucy5pbmRlbnRfc2l6ZVxuICAgIGluZGVudCA9IGluZGVudENoYXIucmVwZWF0KGluZGVudFNpemUpXG4gICAgbmV3IEBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICB0cnlcbiAgICAgICAgcmVzb2x2ZShmb3JtYXQodGV4dCwgaW5kZW50LCBAd2Fybiwgb3B0aW9ucykpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICByZWplY3QgZXJyb3JcbiJdfQ==
