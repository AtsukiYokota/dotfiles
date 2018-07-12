
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Beautifier, ErlTidy,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = ErlTidy = (function(superClass) {
    extend(ErlTidy, superClass);

    function ErlTidy() {
      return ErlTidy.__super__.constructor.apply(this, arguments);
    }

    ErlTidy.prototype.name = "erl_tidy";

    ErlTidy.prototype.link = "http://erlang.org/doc/man/erl_tidy.html";

    ErlTidy.prototype.isPreInstalled = false;

    ErlTidy.prototype.options = {
      Erlang: true
    };

    ErlTidy.prototype.beautify = function(text, language, options) {
      var tempFile;
      tempFile = void 0;
      return this.tempFile("input", text).then((function(_this) {
        return function(path) {
          tempFile = path;
          return _this.run("erl", [["-eval", 'erl_tidy:file("' + tempFile + '")'], ["-noshell", "-s", "init", "stop"]], {
            help: {
              link: "http://erlang.org/doc/man/erl_tidy.html"
            }
          });
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return ErlTidy;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2VybF90aWR5LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxtQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7c0JBRXJCLElBQUEsR0FBTTs7c0JBQ04sSUFBQSxHQUFNOztzQkFDTixjQUFBLEdBQWdCOztzQkFFaEIsT0FBQSxHQUFTO01BQ1AsTUFBQSxFQUFRLElBREQ7OztzQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxRQUFBLEdBQVc7YUFDWCxJQUFDLENBQUEsUUFBRCxDQUFVLE9BQVYsRUFBbUIsSUFBbkIsQ0FBd0IsQ0FBQyxJQUF6QixDQUE4QixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsSUFBRDtVQUM1QixRQUFBLEdBQVc7aUJBQ1gsS0FBQyxDQUFBLEdBQUQsQ0FBSyxLQUFMLEVBQVksQ0FDVixDQUFDLE9BQUQsRUFBVSxpQkFBQSxHQUFvQixRQUFwQixHQUErQixJQUF6QyxDQURVLEVBRVYsQ0FBQyxVQUFELEVBQWEsSUFBYixFQUFtQixNQUFuQixFQUEyQixNQUEzQixDQUZVLENBQVosRUFJRTtZQUFFLElBQUEsRUFBTTtjQUFFLElBQUEsRUFBTSx5Q0FBUjthQUFSO1dBSkY7UUFGNEI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTlCLENBUUMsQ0FBQyxJQVJGLENBUU8sQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNMLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQURLO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVJQO0lBRlE7Ozs7S0FWMkI7QUFQdkMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgRXJsVGlkeSBleHRlbmRzIEJlYXV0aWZpZXJcblxuICBuYW1lOiBcImVybF90aWR5XCJcbiAgbGluazogXCJodHRwOi8vZXJsYW5nLm9yZy9kb2MvbWFuL2VybF90aWR5Lmh0bWxcIlxuICBpc1ByZUluc3RhbGxlZDogZmFsc2VcblxuICBvcHRpb25zOiB7XG4gICAgRXJsYW5nOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHRlbXBGaWxlID0gdW5kZWZpbmVkXG4gICAgQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dCkudGhlbigocGF0aCkgPT5cbiAgICAgIHRlbXBGaWxlID0gcGF0aFxuICAgICAgQHJ1bihcImVybFwiLCBbXG4gICAgICAgIFtcIi1ldmFsXCIsICdlcmxfdGlkeTpmaWxlKFwiJyArIHRlbXBGaWxlICsgJ1wiKSddXG4gICAgICAgIFtcIi1ub3NoZWxsXCIsIFwiLXNcIiwgXCJpbml0XCIsIFwic3RvcFwiXVxuICAgICAgICBdLFxuICAgICAgICB7IGhlbHA6IHsgbGluazogXCJodHRwOi8vZXJsYW5nLm9yZy9kb2MvbWFuL2VybF90aWR5Lmh0bWxcIiB9IH1cbiAgICAgICAgKVxuICAgICkudGhlbig9PlxuICAgICAgQHJlYWRGaWxlKHRlbXBGaWxlKVxuICAgIClcbiJdfQ==
