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
      Blade: true,
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
              case "Blade":
                beautifyHTML = require("js-beautify").html;
                text = text.replace(/\@(?!yield)([^\n\s]*)/ig, "<blade $1/>");
                text = beautifyHTML(text, options);
                text = text.replace(/<blade ([^\n]*)\/>/ig, "@$1");
                text = text.replace(/\(\ \'/ig, "('");
                _this.debug("Beautified HTML: " + text);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2pzLWJlYXV0aWZ5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSxzQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBQ3JCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFFTixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU8sSUFEQTtNQUVQLElBQUEsRUFBTSxJQUZDO01BR1AsR0FBQSxFQUFLLElBSEU7TUFJUCxVQUFBLEVBQVksSUFKTDtNQUtQLFFBQUEsRUFBVSxJQUxIO01BTVAsVUFBQSxFQUFZLElBTkw7TUFPUCxHQUFBLEVBQUssSUFQRTtNQVFQLEdBQUEsRUFBSyxJQVJFO01BU1AsSUFBQSxFQUFNLElBVEM7TUFVUCxHQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsSUFBYjtRQUNBLFdBQUEsRUFBYSxJQURiO1FBRUEsMEJBQUEsRUFBNEIsSUFGNUI7UUFHQSxxQkFBQSxFQUF1QixJQUh2QjtRQUlBLGlCQUFBLEVBQW1CLElBSm5CO1FBS0EsZ0JBQUEsRUFBa0IsSUFMbEI7UUFNQSxnQkFBQSxFQUFrQixJQU5sQjtPQVhLOzs7eUJBb0JULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO01BQ1IsSUFBQyxDQUFBLE9BQUQsQ0FBUyx1QkFBQSxHQUF3QixRQUFqQztNQUNBLElBQUMsQ0FBQSxJQUFELENBQU0sdUJBQUEsR0FBdUIsQ0FBQyxJQUFJLENBQUMsU0FBTCxDQUFlLE9BQWYsRUFBd0IsSUFBeEIsRUFBOEIsQ0FBOUIsQ0FBRCxDQUE3QjtNQUNBLE9BQU8sQ0FBQyxHQUFSLEdBQWMsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCLEVBQTZCLElBQTdCLEVBQWtDLE9BQU8sQ0FBQyxXQUExQztBQUNkLGFBQU8sSUFBSSxJQUFDLENBQUEsT0FBTCxDQUFhLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixjQUFBO0FBQUE7QUFDRSxvQkFBTyxRQUFQO0FBQUEsbUJBQ08sTUFEUDtBQUFBLG1CQUNlLFlBRGY7QUFBQSxtQkFDNkIsS0FEN0I7Z0JBRUksVUFBQSxHQUFhLE9BQUEsQ0FBUSxhQUFSO2dCQUNiLElBQUEsR0FBTyxVQUFBLENBQVcsSUFBWCxFQUFpQixPQUFqQjt1QkFDUCxPQUFBLENBQVEsSUFBUjtBQUpKLG1CQUtPLFlBTFA7QUFBQSxtQkFLcUIsVUFMckI7Z0JBT0ksT0FBTyxDQUFDLGlCQUFSLEdBQTRCO2dCQUU1QixZQUFBLEdBQWUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDdEMsSUFBQSxHQUFPLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CO3VCQUNQLE9BQUEsQ0FBUSxJQUFSO0FBWEosbUJBWU8sS0FaUDtBQUFBLG1CQVljLGVBWmQ7QUFBQSxtQkFZK0IsTUFaL0I7QUFBQSxtQkFZdUMsS0FadkM7QUFBQSxtQkFZOEMsdUJBWjlDO0FBQUEsbUJBWXVFLGtCQVp2RTtnQkFhSSxZQUFBLEdBQWUsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDdEMsSUFBQSxHQUFPLFlBQUEsQ0FBYSxJQUFiLEVBQW1CLE9BQW5CO2dCQUNQLEtBQUMsQ0FBQSxLQUFELENBQU8sbUJBQUEsR0FBb0IsSUFBM0I7dUJBQ0EsT0FBQSxDQUFRLElBQVI7QUFoQkosbUJBaUJPLEtBakJQO2dCQWtCSSxXQUFBLEdBQWMsT0FBQSxDQUFRLGFBQVIsQ0FBc0IsQ0FBQztnQkFDckMsSUFBQSxHQUFPLFdBQUEsQ0FBWSxJQUFaLEVBQWtCLE9BQWxCO3VCQUNQLE9BQUEsQ0FBUSxJQUFSO0FBcEJKLG1CQXFCTyxPQXJCUDtnQkFzQkksWUFBQSxHQUFlLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUM7Z0JBRXRDLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLHlCQUFiLEVBQXdDLGFBQXhDO2dCQUNQLElBQUEsR0FBTyxZQUFBLENBQWEsSUFBYixFQUFtQixPQUFuQjtnQkFFUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxzQkFBYixFQUFxQyxLQUFyQztnQkFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxVQUFiLEVBQXlCLElBQXpCO2dCQUNQLEtBQUMsQ0FBQSxLQUFELENBQU8sbUJBQUEsR0FBb0IsSUFBM0I7dUJBQ0EsT0FBQSxDQUFRLElBQVI7QUE5Qko7dUJBZ0NJLE1BQUEsQ0FBTyxJQUFJLEtBQUosQ0FBVSxvQ0FBQSxHQUFxQyxRQUEvQyxDQUFQO0FBaENKLGFBREY7V0FBQSxhQUFBO1lBa0NNO1lBQ0osS0FBQyxDQUFBLEtBQUQsQ0FBTyxxQkFBQSxHQUFzQixHQUE3QjttQkFDQSxNQUFBLENBQU8sR0FBUCxFQXBDRjs7UUFEa0I7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWI7SUFKQzs7OztLQXhCOEI7QUFIMUMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSlNCZWF1dGlmeSBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJKUyBCZWF1dGlmeVwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2JlYXV0aWZ5LXdlYi9qcy1iZWF1dGlmeVwiXG5cbiAgb3B0aW9uczoge1xuICAgIEJsYWRlOiB0cnVlXG4gICAgSFRNTDogdHJ1ZVxuICAgIFhNTDogdHJ1ZVxuICAgIEhhbmRsZWJhcnM6IHRydWVcbiAgICBNdXN0YWNoZTogdHJ1ZVxuICAgIEphdmFTY3JpcHQ6IHRydWVcbiAgICBFSlM6IHRydWVcbiAgICBKU1g6IHRydWVcbiAgICBKU09OOiB0cnVlXG4gICAgQ1NTOlxuICAgICAgaW5kZW50X3NpemU6IHRydWVcbiAgICAgIGluZGVudF9jaGFyOiB0cnVlXG4gICAgICBzZWxlY3Rvcl9zZXBhcmF0b3JfbmV3bGluZTogdHJ1ZVxuICAgICAgbmV3bGluZV9iZXR3ZWVuX3J1bGVzOiB0cnVlXG4gICAgICBwcmVzZXJ2ZV9uZXdsaW5lczogdHJ1ZVxuICAgICAgd3JhcF9saW5lX2xlbmd0aDogdHJ1ZVxuICAgICAgZW5kX3dpdGhfbmV3bGluZTogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBAdmVyYm9zZShcIkpTIEJlYXV0aWZ5IGxhbmd1YWdlICN7bGFuZ3VhZ2V9XCIpXG4gICAgQGluZm8oXCJKUyBCZWF1dGlmeSBPcHRpb25zOiAje0pTT04uc3RyaW5naWZ5KG9wdGlvbnMsIG51bGwsIDQpfVwiKVxuICAgIG9wdGlvbnMuZW9sID0gQGdldERlZmF1bHRMaW5lRW5kaW5nKCdcXHJcXG4nLCdcXG4nLG9wdGlvbnMuZW5kX29mX2xpbmUpXG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgdHJ5XG4gICAgICAgIHN3aXRjaCBsYW5ndWFnZVxuICAgICAgICAgIHdoZW4gXCJKU09OXCIsIFwiSmF2YVNjcmlwdFwiLCBcIkpTWFwiXG4gICAgICAgICAgICBiZWF1dGlmeUpTID0gcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpXG4gICAgICAgICAgICB0ZXh0ID0gYmVhdXRpZnlKUyh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgcmVzb2x2ZSB0ZXh0XG4gICAgICAgICAgd2hlbiBcIkhhbmRsZWJhcnNcIiwgXCJNdXN0YWNoZVwiXG4gICAgICAgICAgICAjIGpzaGludCBpZ25vcmU6IHN0YXJ0XG4gICAgICAgICAgICBvcHRpb25zLmluZGVudF9oYW5kbGViYXJzID0gdHJ1ZSAjIEZvcmNlIGpzYmVhdXRpZnkgdG8gaW5kZW50X2hhbmRsZWJhcnNcbiAgICAgICAgICAgICMganNoaW50IGlnbm9yZTogZW5kXG4gICAgICAgICAgICBiZWF1dGlmeUhUTUwgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuaHRtbFxuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5SFRNTCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgcmVzb2x2ZSB0ZXh0XG4gICAgICAgICAgd2hlbiBcIkVKU1wiLCBcIkhUTUwgKExpcXVpZClcIiwgXCJIVE1MXCIsIFwiWE1MXCIsIFwiV2ViIEZvcm0vQ29udHJvbCAoQyMpXCIsIFwiV2ViIEhhbmRsZXIgKEMjKVwiXG4gICAgICAgICAgICBiZWF1dGlmeUhUTUwgPSByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuaHRtbFxuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5SFRNTCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgQGRlYnVnKFwiQmVhdXRpZmllZCBIVE1MOiAje3RleHR9XCIpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICB3aGVuIFwiQ1NTXCJcbiAgICAgICAgICAgIGJlYXV0aWZ5Q1NTID0gcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmNzc1xuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5Q1NTKHRleHQsIG9wdGlvbnMpXG4gICAgICAgICAgICByZXNvbHZlIHRleHRcbiAgICAgICAgICB3aGVuIFwiQmxhZGVcIlxuICAgICAgICAgICAgYmVhdXRpZnlIVE1MID0gcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmh0bWxcbiAgICAgICAgICAgICMgcHJlIHNjcmlwdCAoV29ya2Fyb3VuZClcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoL1xcQCg/IXlpZWxkKShbXlxcblxcc10qKS9pZywgXCI8YmxhZGUgJDEvPlwiKVxuICAgICAgICAgICAgdGV4dCA9IGJlYXV0aWZ5SFRNTCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgIyBwb3N0IHNjcmlwdCAoV29ya2Fyb3VuZClcbiAgICAgICAgICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLzxibGFkZSAoW15cXG5dKilcXC8+L2lnLCBcIkAkMVwiKVxuICAgICAgICAgICAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFwoXFwgXFwnL2lnLCBcIignXCIpXG4gICAgICAgICAgICBAZGVidWcoXCJCZWF1dGlmaWVkIEhUTUw6ICN7dGV4dH1cIilcbiAgICAgICAgICAgIHJlc29sdmUgdGV4dFxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJVbmtub3duIGxhbmd1YWdlIGZvciBKUyBCZWF1dGlmeTogXCIrbGFuZ3VhZ2UpKVxuICAgICAgY2F0Y2ggZXJyXG4gICAgICAgIEBlcnJvcihcIkpTIEJlYXV0aWZ5IGVycm9yOiAje2Vycn1cIilcbiAgICAgICAgcmVqZWN0KGVycilcblxuICAgIClcbiJdfQ==
