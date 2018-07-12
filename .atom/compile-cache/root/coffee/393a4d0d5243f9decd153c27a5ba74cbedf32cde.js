(function() {
  "use strict";
  var Beautifier, JSBeautify,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = JSBeautify = (function(superClass) {
    extend(JSBeautify, superClass);

    function JSBeautify() {
      return JSBeautify.__super__.constructor.apply(this, arguments);
    }

    JSBeautify.prototype.name = "JS Beautify";

    JSBeautify.prototype.link = "https://github.com/beautify-web/js-beautify";

    JSBeautify.prototype.options = {
      HTML: true,
      XML: true,
      Handlebars: true,
      Mustache: true,
      JavaScript: true,
      EJS: true,
      JSX: true,
      JSON: true,
      CSS: {
        indent_size: true,
        indent_char: true,
        selector_separator_newline: true,
        newline_between_rules: true,
        preserve_newlines: true,
        wrap_line_length: true,
        end_with_newline: true
      }
    };

    JSBeautify.prototype.beautify = function(text, language, options) {
      this.verbose("JS Beautify language " + language);
      this.info("JS Beautify Options: " + (JSON.stringify(options, null, 4)));
      options.eol = this.getDefaultLineEnding('\r\n', '\n', options.end_of_line);
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var beautifyCSS, beautifyHTML, beautifyJS, err;
          try {
            switch (language) {
              case "JSON":
              case "JavaScript":
              case "JSX":
                beautifyJS = require("js-beautify");
                text = beautifyJS(text, options);
                return resolve(text);
              case "Handlebars":
              case "Mustache":
                options.indent_handlebars = true;
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                return resolve(text);
              case "EJS":
              case "HTML (Liquid)":
              case "HTML":
              case "XML":
              case "Web Form/Control (C#)":
              case "Web Handler (C#)":
                beautifyHTML = require("js-beautify").html;
                text = beautifyHTML(text, options);
                _this.debug("Beautified HTML: " + text);
                return resolve(text);
              case "CSS":
                beautifyCSS = require("js-beautify").css;
                text = beautifyCSS(text, options);
                return resolve(text);
              default:
                return reject(new Error("Unknown language for JS Beautify: " + language));
            }
          } catch (error) {
            err = error;
            _this.error("JS Beautify error: " + err);
            return reject(err);
          }
        };
      })(this));
    };

    return JSBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2pzLWJlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBQ3JCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFFTixPQUFBLEdBQVM7TUFDUCxJQUFBLEVBQU0sSUFEQztNQUVQLEdBQUEsRUFBSyxJQUZFO01BR1AsVUFBQSxFQUFZLElBSEw7TUFJUCxRQUFBLEVBQVUsSUFKSDtNQUtQLFVBQUEsRUFBWSxJQUxMO01BTVAsR0FBQSxFQUFLLElBTkU7TUFPUCxHQUFBLEVBQUssSUFQRTtNQVFQLElBQUEsRUFBTSxJQVJDO01BU1AsR0FBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLElBQWI7UUFDQSxXQUFBLEVBQWEsSUFEYjtRQUVBLDBCQUFBLEVBQTRCLElBRjVCO1FBR0EscUJBQUEsRUFBdUIsSUFIdkI7UUFJQSxpQkFBQSxFQUFtQixJQUpuQjtRQUtBLGdCQUFBLEVBQWtCLElBTGxCO1FBTUEsZ0JBQUEsRUFBa0IsSUFObEI7T0FWSzs7O3lCQW1CVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtNQUNSLElBQUMsQ0FBQSxPQUFELENBQVMsdUJBQUEsR0FBd0IsUUFBakM7TUFDQSxJQUFDLENBQUEsSUFBRCxDQUFNLHVCQUFBLEdBQXVCLENBQUMsSUFBSSxDQUFDLFNBQUwsQ0FBZSxPQUFmLEVBQXdCLElBQXhCLEVBQThCLENBQTlCLENBQUQsQ0FBN0I7TUFDQSxPQUFPLENBQUMsR0FBUixHQUFjLElBQUMsQ0FBQSxvQkFBRCxDQUFzQixNQUF0QixFQUE2QixJQUE3QixFQUFrQyxPQUFPLENBQUMsV0FBMUM7QUFDZCxhQUFPLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsY0FBQTtBQUFBO0FBQ0Usb0JBQU8sUUFBUDtBQUFBLG1CQUNPLE1BRFA7QUFBQSxtQkFDZSxZQURmO0FBQUEsbUJBQzZCLEtBRDdCO2dCQUVJLFVBQUEsR0FBYSxPQUFBLENBQVEsYUFBUjtnQkFDYixJQUFBLEdBQU8sVUFBQSxDQUFXLElBQVgsRUFBaUIsT0FBakI7dUJBQ1AsT0FBQSxDQUFRLElBQVI7QUFKSixtQkFLTyxZQUxQO0FBQUEsbUJBS3FCLFVBTHJCO2dCQU9JLE9BQU8sQ0FBQyxpQkFBUixHQUE0QjtnQkFFNUIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUM7Z0JBQ3RDLElBQUEsR0FBTyxZQUFBLENBQWEsSUFBYixFQUFtQixPQUFuQjt1QkFDUCxPQUFBLENBQVEsSUFBUjtBQVhKLG1CQVlPLEtBWlA7QUFBQSxtQkFZYyxlQVpkO0FBQUEsbUJBWStCLE1BWi9CO0FBQUEsbUJBWXVDLEtBWnZDO0FBQUEsbUJBWThDLHVCQVo5QztBQUFBLG1CQVl1RSxrQkFadkU7Z0JBYUksWUFBQSxHQUFlLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUM7Z0JBQ3RDLElBQUEsR0FBTyxZQUFBLENBQWEsSUFBYixFQUFtQixPQUFuQjtnQkFDUCxLQUFDLENBQUEsS0FBRCxDQUFPLG1CQUFBLEdBQW9CLElBQTNCO3VCQUNBLE9BQUEsQ0FBUSxJQUFSO0FBaEJKLG1CQWlCTyxLQWpCUDtnQkFrQkksV0FBQSxHQUFjLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUM7Z0JBQ3JDLElBQUEsR0FBTyxXQUFBLENBQVksSUFBWixFQUFrQixPQUFsQjt1QkFDUCxPQUFBLENBQVEsSUFBUjtBQXBCSjt1QkFzQkksTUFBQSxDQUFPLElBQUksS0FBSixDQUFVLG9DQUFBLEdBQXFDLFFBQS9DLENBQVA7QUF0QkosYUFERjtXQUFBLGFBQUE7WUF3Qk07WUFDSixLQUFDLENBQUEsS0FBRCxDQUFPLHFCQUFBLEdBQXNCLEdBQTdCO21CQUNBLE1BQUEsQ0FBTyxHQUFQLEVBMUJGOztRQURrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYjtJQUpDOzs7O0tBdkI4QjtBQUgxQyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBKU0JlYXV0aWZ5IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkpTIEJlYXV0aWZ5XCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vYmVhdXRpZnktd2ViL2pzLWJlYXV0aWZ5XCJcblxuICBvcHRpb25zOiB7XG4gICAgSFRNTDogdHJ1ZVxuICAgIFhNTDogdHJ1ZVxuICAgIEhhbmRsZWJhcnM6IHRydWVcbiAgICBNdXN0YWNoZTogdHJ1ZVxuICAgIEphdmFTY3JpcHQ6IHRydWVcbiAgICBFSlM6IHRydWVcbiAgICBKU1g6IHRydWVcbiAgICBKU09OOiB0cnVlXG4gICAgQ1NTOlxuICAgICAgaW5kZW50X3NpemU6IHRydWVcbiAgICAgIGluZGVudF9jaGFyOiB0cnVlXG4gICAgICBzZWxlY3Rvcl9zZXBhcmF0b3JfbmV3bGluZTogdHJ1ZVxuICAgICAgbmV3bGluZV9iZXR3ZWVuX3J1bGVzOiB0cnVlXG4gICAgICBwcmVzZXJ2ZV9uZXdsaW5lczogdHJ1ZVxuICAgICAgd3JhcF9saW5lX2xlbmd0aDogdHJ1ZVxuICAgICAgZW5kX3dpdGhfbmV3bGluZTogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAdmVyYm9zZShcIkpTIEJlYXV0aWZ5IGxhbmd1YWdlICN7bGFuZ3VhZ2V9XCIpXG4gICAgQGluZm8oXCJKUyBCZWF1dGlmeSBPcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KG9wdGlvbnMsIG51bGwsIDQpfVwiKVxuICAgIG9wdGlvbnMuZW9sID0gQGdldERlZmF1bHRMaW5lRW5kaW5nKCdcXHJcXG4nLCdcXG4nLG9wdGlvbnMuZW5kX29mX2xpbmUpXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgdHJ5XG4gICAgICAgIHN3aXRjaCBsYW5ndWFnZVxuICAgICAgICAgIHdoZW4gXCJKU09OXCIsIFwiSmF2YVNjcmlwdFwiLCBcIkpTWFwiXG4gICAgICAgICAgICBiZWF1dGlmeUpTID0gcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpXG4gICAgICAgICAgICB0ZXh0ID0gYmVhdXRpZnlKUyh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgcmVzb2x2ZSB0ZXh0XG4gICAgICAgICAgd2hlbiBcIkhhbmRsZWJhcnNcIiwgXCJNdXN0YWNoZVwiXG4gICAgICAgICAgICAjIGpzaGludCBpZ25vcmU6IHN0YXJ0XG4gICAgICAgICAgICBvcHRpb25zLmluZGVudF9oYW5kbGViYXJzID0gdHJ1ZSAjIEZvcmNlIGpzYmVhdXRpZnkgdG8gaW5kZW50X2hhbmRsZWJhcnNcbiAgICAgICAgICAgICMganNoaW50IGlnbm9yZTogZW5kXG4gICAgICAgICAgICBiZWF1dGlmeUhUTUwgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuaHRtbFxuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5SFRNTCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgcmVzb2x2ZSB0ZXh0XG4gICAgICAgICAgd2hlbiBcIkVKU1wiLCBcIkhUTUwgKExpcXVpZClcIiwgXCJIVE1MXCIsIFwiWE1MXCIsIFwiV2ViIEZvcm0vQ29udHJvbCAoQyMpXCIsIFwiV2ViIEhhbmRsZXIgKEMjKVwiXG4gICAgICAgICAgICBiZWF1dGlmeUhUTUwgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuaHRtbFxuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5SFRNTCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgQGRlYnVnKFwiQmVhdXRpZmllZCBIVE1MOiAje3RleHR9XCIpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICB3aGVuIFwiQ1NTXCJcbiAgICAgICAgICAgIGJlYXV0aWZ5Q1NTID0gcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmNzc1xuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5Q1NTKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiVW5rbm93biBsYW5ndWFnZSBmb3IgSlMgQmVhdXRpZnk6IFwiK2xhbmd1YWdlKSlcbiAgICAgIGNhdGNoIGVyclxuICAgICAgICBAZXJyb3IoXCJKUyBCZWF1dGlmeSBlcnJvcjogI3tlcnJ9XCIpXG4gICAgICAgIHJlamVjdChlcnIpXG5cbiAgICApXG4iXX0=
