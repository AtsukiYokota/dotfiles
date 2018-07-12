(function() {
  "use strict";
  var Beautifier, VueBeautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = VueBeautifier = (function(superClass) {
    extend(VueBeautifier, superClass);

    function VueBeautifier() {
      return VueBeautifier.__super__.constructor.apply(this, arguments);
    }

    VueBeautifier.prototype.name = "Vue Beautifier";

    VueBeautifier.prototype.link = "https://github.com/Glavin001/atom-beautify/blob/master/src/beautifiers/vue-beautifier.coffee";

    VueBeautifier.prototype.options = {
      Vue: true
    };

    VueBeautifier.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var _, prettydiff, regexp, results;
          prettydiff = require("prettydiff2");
          _ = require('lodash');
          regexp = /(^<(template|script|style)[^>]*>)((\s|\S)*?)^<\/\2>/gim;
          results = text.replace(regexp, function(match, begin, type, text) {
            var beautifiedText, lang, ref, replaceText, result;
            lang = (ref = /lang\s*=\s*['"](\w+)["']/.exec(begin)) != null ? ref[1] : void 0;
            replaceText = text;
            text = text.trim();
            beautifiedText = ((function() {
              switch (type) {
                case "template":
                  switch (lang) {
                    case "pug":
                    case "jade":
                      return require("pug-beautify")(text, options);
                    case void 0:
                      return require("js-beautify").html(text, options);
                    default:
                      return void 0;
                  }
                  break;
                case "script":
                  return require("js-beautify")(text, options);
                case "style":
                  switch (lang) {
                    case "scss":
                      options = _.merge(options, {
                        source: text,
                        lang: "scss",
                        mode: "beautify"
                      });
                      return prettydiff(options);
                    case "less":
                      options = _.merge(options, {
                        source: text,
                        lang: "less",
                        mode: "beautify"
                      });
                      return prettydiff(options);
                    case void 0:
                      return require("js-beautify").css(text, options);
                    default:
                      return void 0;
                  }
              }
            })());
            result = beautifiedText ? match.replace(replaceText, "\n" + (beautifiedText.trim()) + "\n") : match;
            _this.verbose("Vue part", match, begin, type, text, lang, result);
            return result;
          });
          _this.verbose("Vue final results", results);
          return resolve(results);
        };
      })(this));
    };

    return VueBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3Z1ZS1iZWF1dGlmaWVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSx5QkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7NEJBQ3JCLElBQUEsR0FBTTs7NEJBQ04sSUFBQSxHQUFNOzs0QkFFTixPQUFBLEdBQ0U7TUFBQSxHQUFBLEVBQUssSUFBTDs7OzRCQUVGLFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBTyxJQUFJLElBQUMsQ0FBQSxPQUFMLENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLGNBQUE7VUFBQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVI7VUFDYixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7VUFDSixNQUFBLEdBQVM7VUFFVCxPQUFBLEdBQVUsSUFBSSxDQUFDLE9BQUwsQ0FBYSxNQUFiLEVBQXFCLFNBQUMsS0FBRCxFQUFRLEtBQVIsRUFBZSxJQUFmLEVBQXFCLElBQXJCO0FBQzdCLGdCQUFBO1lBQUEsSUFBQSwrREFBK0MsQ0FBQSxDQUFBO1lBQy9DLFdBQUEsR0FBYztZQUNkLElBQUEsR0FBTyxJQUFJLENBQUMsSUFBTCxDQUFBO1lBQ1AsY0FBQSxHQUFpQjtBQUFDLHNCQUFPLElBQVA7QUFBQSxxQkFDWCxVQURXO0FBRWQsMEJBQU8sSUFBUDtBQUFBLHlCQUNPLEtBRFA7QUFBQSx5QkFDYyxNQURkOzZCQUVJLE9BQUEsQ0FBUSxjQUFSLENBQUEsQ0FBd0IsSUFBeEIsRUFBOEIsT0FBOUI7QUFGSix5QkFHTyxNQUhQOzZCQUlJLE9BQUEsQ0FBUSxhQUFSLENBQXNCLENBQUMsSUFBdkIsQ0FBNEIsSUFBNUIsRUFBa0MsT0FBbEM7QUFKSjs2QkFNSTtBQU5KO0FBREc7QUFEVyxxQkFTWCxRQVRXO3lCQVVkLE9BQUEsQ0FBUSxhQUFSLENBQUEsQ0FBdUIsSUFBdkIsRUFBNkIsT0FBN0I7QUFWYyxxQkFXWCxPQVhXO0FBWWQsMEJBQU8sSUFBUDtBQUFBLHlCQUNPLE1BRFA7c0JBRUksT0FBQSxHQUFVLENBQUMsQ0FBQyxLQUFGLENBQVEsT0FBUixFQUNSO3dCQUFBLE1BQUEsRUFBUSxJQUFSO3dCQUNBLElBQUEsRUFBTSxNQUROO3dCQUVBLElBQUEsRUFBTSxVQUZOO3VCQURROzZCQUtWLFVBQUEsQ0FBVyxPQUFYO0FBUEoseUJBUU8sTUFSUDtzQkFTSSxPQUFBLEdBQVUsQ0FBQyxDQUFDLEtBQUYsQ0FBUSxPQUFSLEVBQ1I7d0JBQUEsTUFBQSxFQUFRLElBQVI7d0JBQ0EsSUFBQSxFQUFNLE1BRE47d0JBRUEsSUFBQSxFQUFNLFVBRk47dUJBRFE7NkJBS1YsVUFBQSxDQUFXLE9BQVg7QUFkSix5QkFlTyxNQWZQOzZCQWdCSSxPQUFBLENBQVEsYUFBUixDQUFzQixDQUFDLEdBQXZCLENBQTJCLElBQTNCLEVBQWlDLE9BQWpDO0FBaEJKOzZCQWtCSTtBQWxCSjtBQVpjO2dCQUFEO1lBZ0NqQixNQUFBLEdBQVksY0FBSCxHQUF1QixLQUFLLENBQUMsT0FBTixDQUFjLFdBQWQsRUFBMkIsSUFBQSxHQUFJLENBQUMsY0FBYyxDQUFDLElBQWYsQ0FBQSxDQUFELENBQUosR0FBMkIsSUFBdEQsQ0FBdkIsR0FBdUY7WUFDaEcsS0FBQyxDQUFBLE9BQUQsQ0FBUyxVQUFULEVBQXFCLEtBQXJCLEVBQTRCLEtBQTVCLEVBQW1DLElBQW5DLEVBQXlDLElBQXpDLEVBQStDLElBQS9DLEVBQXFELE1BQXJEO0FBQ0EsbUJBQU87VUF0Q3NCLENBQXJCO1VBd0NWLEtBQUMsQ0FBQSxPQUFELENBQVMsbUJBQVQsRUFBOEIsT0FBOUI7aUJBQ0EsT0FBQSxDQUFRLE9BQVI7UUE5Q2tCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiO0lBREM7Ozs7S0FQaUM7QUFIN0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgVnVlQmVhdXRpZmllciBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJWdWUgQmVhdXRpZmllclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL0dsYXZpbjAwMS9hdG9tLWJlYXV0aWZ5L2Jsb2IvbWFzdGVyL3NyYy9iZWF1dGlmaWVycy92dWUtYmVhdXRpZmllci5jb2ZmZWVcIlxuXG4gIG9wdGlvbnM6XG4gICAgVnVlOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG4gICAgICBwcmV0dHlkaWZmID0gcmVxdWlyZShcInByZXR0eWRpZmYyXCIpXG4gICAgICBfID0gcmVxdWlyZSgnbG9kYXNoJylcbiAgICAgIHJlZ2V4cCA9IC8oXjwodGVtcGxhdGV8c2NyaXB0fHN0eWxlKVtePl0qPikoKFxcc3xcXFMpKj8pXjxcXC9cXDI+L2dpbVxuXG4gICAgICByZXN1bHRzID0gdGV4dC5yZXBsYWNlKHJlZ2V4cCwgKG1hdGNoLCBiZWdpbiwgdHlwZSwgdGV4dCkgPT5cbiAgICAgICAgbGFuZyA9IC9sYW5nXFxzKj1cXHMqWydcIl0oXFx3KylbXCInXS8uZXhlYyhiZWdpbik/WzFdXG4gICAgICAgIHJlcGxhY2VUZXh0ID0gdGV4dFxuICAgICAgICB0ZXh0ID0gdGV4dC50cmltKClcbiAgICAgICAgYmVhdXRpZmllZFRleHQgPSAoc3dpdGNoIHR5cGVcbiAgICAgICAgICB3aGVuIFwidGVtcGxhdGVcIlxuICAgICAgICAgICAgc3dpdGNoIGxhbmdcbiAgICAgICAgICAgICAgd2hlbiBcInB1Z1wiLCBcImphZGVcIlxuICAgICAgICAgICAgICAgIHJlcXVpcmUoXCJwdWctYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucylcbiAgICAgICAgICAgICAgd2hlbiB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICByZXF1aXJlKFwianMtYmVhdXRpZnlcIikuaHRtbCh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgICAgd2hlbiBcInNjcmlwdFwiXG4gICAgICAgICAgICByZXF1aXJlKFwianMtYmVhdXRpZnlcIikodGV4dCwgb3B0aW9ucylcbiAgICAgICAgICB3aGVuIFwic3R5bGVcIlxuICAgICAgICAgICAgc3dpdGNoIGxhbmdcbiAgICAgICAgICAgICAgd2hlbiBcInNjc3NcIlxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBfLm1lcmdlKG9wdGlvbnMsXG4gICAgICAgICAgICAgICAgICBzb3VyY2U6IHRleHRcbiAgICAgICAgICAgICAgICAgIGxhbmc6IFwic2Nzc1wiXG4gICAgICAgICAgICAgICAgICBtb2RlOiBcImJlYXV0aWZ5XCJcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgcHJldHR5ZGlmZihvcHRpb25zKVxuICAgICAgICAgICAgICB3aGVuIFwibGVzc1wiXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IF8ubWVyZ2Uob3B0aW9ucyxcbiAgICAgICAgICAgICAgICAgIHNvdXJjZTogdGV4dFxuICAgICAgICAgICAgICAgICAgbGFuZzogXCJsZXNzXCJcbiAgICAgICAgICAgICAgICAgIG1vZGU6IFwiYmVhdXRpZnlcIlxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICBwcmV0dHlkaWZmKG9wdGlvbnMpXG4gICAgICAgICAgICAgIHdoZW4gdW5kZWZpbmVkXG4gICAgICAgICAgICAgICAgcmVxdWlyZShcImpzLWJlYXV0aWZ5XCIpLmNzcyh0ZXh0LCBvcHRpb25zKVxuICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgIClcbiAgICAgICAgcmVzdWx0ID0gaWYgYmVhdXRpZmllZFRleHQgdGhlbiBtYXRjaC5yZXBsYWNlKHJlcGxhY2VUZXh0LCBcIlxcbiN7YmVhdXRpZmllZFRleHQudHJpbSgpfVxcblwiKSBlbHNlIG1hdGNoXG4gICAgICAgIEB2ZXJib3NlKFwiVnVlIHBhcnRcIiwgbWF0Y2gsIGJlZ2luLCB0eXBlLCB0ZXh0LCBsYW5nLCByZXN1bHQpXG4gICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgIClcbiAgICAgIEB2ZXJib3NlKFwiVnVlIGZpbmFsIHJlc3VsdHNcIiwgcmVzdWx0cylcbiAgICAgIHJlc29sdmUocmVzdWx0cylcbiAgICApXG4iXX0=
