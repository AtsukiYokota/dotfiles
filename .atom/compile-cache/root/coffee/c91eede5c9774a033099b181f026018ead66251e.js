
/*
Requires https://github.com/hhatto/autopep8
 */

(function() {
  "use strict";
  var Autopep8, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Autopep8 = (function(superClass) {
    extend(Autopep8, superClass);

    function Autopep8() {
      return Autopep8.__super__.constructor.apply(this, arguments);
    }

    Autopep8.prototype.name = "autopep8";

    Autopep8.prototype.link = "https://github.com/hhatto/autopep8";

    Autopep8.prototype.executables = [
      {
        name: "autopep8",
        cmd: "autopep8",
        homepage: "https://github.com/hhatto/autopep8",
        installation: "https://github.com/hhatto/autopep8#installation",
        version: {
          parse: function(text) {
            try {
              return text.match(/autopep8 (\d+\.\d+\.\d+)/)[1];
            } catch (error) {
              return text.match(/autopep8 (\d+\.\d+)/)[1] + ".0";
            }
          },
          runOptions: {
            returnStdoutOrStderr: true
          }
        },
        docker: {
          image: "unibeautify/autopep8"
        }
      }, {
        name: "isort",
        cmd: "isort",
        optional: true,
        homepage: "https://github.com/timothycrosley/isort",
        installation: "https://github.com/timothycrosley/isort#installing-isort",
        version: {
          parse: function(text) {
            return text.match(/VERSION (\d+\.\d+\.\d+)/)[1];
          }
        }
      }
    ];

    Autopep8.prototype.options = {
      Python: true
    };

    Autopep8.prototype.beautify = function(text, language, options, context) {
      var tempFile;
      if (context == null) {
        context = {};
      }
      return this.exe("autopep8").run([tempFile = this.tempFile("input", text), "-i", options.max_line_length != null ? ["--max-line-length", "" + options.max_line_length] : void 0, options.indent_size != null ? ["--indent-size", "" + options.indent_size] : void 0, options.ignore != null ? ["--ignore", "" + (options.ignore.join(','))] : void 0]).then((function(_this) {
        return function() {
          var filePath, projectPath;
          if (options.sort_imports) {
            filePath = context.filePath;
            projectPath = typeof atom !== "undefined" && atom !== null ? atom.project.relativizePath(filePath)[0] : void 0;
            return _this.exe("isort").run(["-sp", projectPath, tempFile]);
          }
        };
      })(this)).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return Autopep8;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2F1dG9wZXA4LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUlBO0FBSkEsTUFBQSxvQkFBQTtJQUFBOzs7RUFLQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7dUJBRXJCLElBQUEsR0FBTTs7dUJBQ04sSUFBQSxHQUFNOzt1QkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxVQURSO1FBRUUsR0FBQSxFQUFLLFVBRlA7UUFHRSxRQUFBLEVBQVUsb0NBSFo7UUFJRSxZQUFBLEVBQWMsaURBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDtBQUNMO3FCQUNFLElBQUksQ0FBQyxLQUFMLENBQVcsMEJBQVgsQ0FBdUMsQ0FBQSxDQUFBLEVBRHpDO2FBQUEsYUFBQTtxQkFHRSxJQUFJLENBQUMsS0FBTCxDQUFXLHFCQUFYLENBQWtDLENBQUEsQ0FBQSxDQUFsQyxHQUF1QyxLQUh6Qzs7VUFESyxDQURBO1VBTVAsVUFBQSxFQUFZO1lBQ1Ysb0JBQUEsRUFBc0IsSUFEWjtXQU5MO1NBTFg7UUFlRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sc0JBREQ7U0FmVjtPQURXLEVBb0JYO1FBQ0UsSUFBQSxFQUFNLE9BRFI7UUFFRSxHQUFBLEVBQUssT0FGUDtRQUdFLFFBQUEsRUFBVSxJQUhaO1FBSUUsUUFBQSxFQUFVLHlDQUpaO1FBS0UsWUFBQSxFQUFjLDBEQUxoQjtRQU1FLE9BQUEsRUFBUztVQUNQLEtBQUEsRUFBTyxTQUFDLElBQUQ7bUJBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyx5QkFBWCxDQUFzQyxDQUFBLENBQUE7VUFBaEQsQ0FEQTtTQU5YO09BcEJXOzs7dUJBZ0NiLE9BQUEsR0FBUztNQUNQLE1BQUEsRUFBUSxJQUREOzs7dUJBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBOztRQURrQyxVQUFVOzthQUM1QyxJQUFDLENBQUEsR0FBRCxDQUFLLFVBQUwsQ0FBZ0IsQ0FBQyxHQUFqQixDQUFxQixDQUNqQixRQUFBLEdBQVcsSUFBQyxDQUFBLFFBQUQsQ0FBVSxPQUFWLEVBQW1CLElBQW5CLENBRE0sRUFFakIsSUFGaUIsRUFHc0MsK0JBQXZELEdBQUEsQ0FBQyxtQkFBRCxFQUFzQixFQUFBLEdBQUcsT0FBTyxDQUFDLGVBQWpDLENBQUEsR0FBQSxNQUhpQixFQUk2QiwyQkFBOUMsR0FBQSxDQUFDLGVBQUQsRUFBaUIsRUFBQSxHQUFHLE9BQU8sQ0FBQyxXQUE1QixDQUFBLEdBQUEsTUFKaUIsRUFLNkIsc0JBQTlDLEdBQUEsQ0FBQyxVQUFELEVBQVksRUFBQSxHQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxJQUFmLENBQW9CLEdBQXBCLENBQUQsQ0FBZCxDQUFBLEdBQUEsTUFMaUIsQ0FBckIsQ0FPRSxDQUFDLElBUEgsQ0FPUSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDSixjQUFBO1VBQUEsSUFBRyxPQUFPLENBQUMsWUFBWDtZQUNFLFFBQUEsR0FBVyxPQUFPLENBQUM7WUFDbkIsV0FBQSxrREFBYyxJQUFJLENBQUUsT0FBTyxDQUFDLGNBQWQsQ0FBNkIsUUFBN0IsQ0FBdUMsQ0FBQSxDQUFBO21CQUNyRCxLQUFDLENBQUEsR0FBRCxDQUFLLE9BQUwsQ0FBYSxDQUFDLEdBQWQsQ0FBa0IsQ0FBQyxLQUFELEVBQVEsV0FBUixFQUFxQixRQUFyQixDQUFsQixFQUhGOztRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQVBSLENBYUUsQ0FBQyxJQWJILENBYVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQWJSO0lBRFE7Ozs7S0F4QzRCO0FBUHhDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vaGhhdHRvL2F1dG9wZXA4XG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEF1dG9wZXA4IGV4dGVuZHMgQmVhdXRpZmllclxuXG4gIG5hbWU6IFwiYXV0b3BlcDhcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICBleGVjdXRhYmxlczogW1xuICAgIHtcbiAgICAgIG5hbWU6IFwiYXV0b3BlcDhcIlxuICAgICAgY21kOiBcImF1dG9wZXA4XCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDhcIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9oaGF0dG8vYXV0b3BlcDgjaW5zdGFsbGF0aW9uXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPlxuICAgICAgICAgIHRyeVxuICAgICAgICAgICAgdGV4dC5tYXRjaCgvYXV0b3BlcDggKFxcZCtcXC5cXGQrXFwuXFxkKykvKVsxXVxuICAgICAgICAgIGNhdGNoXG4gICAgICAgICAgICB0ZXh0Lm1hdGNoKC9hdXRvcGVwOCAoXFxkK1xcLlxcZCspLylbMV0gKyBcIi4wXCJcbiAgICAgICAgcnVuT3B0aW9uczoge1xuICAgICAgICAgIHJldHVyblN0ZG91dE9yU3RkZXJyOiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRvY2tlcjoge1xuICAgICAgICBpbWFnZTogXCJ1bmliZWF1dGlmeS9hdXRvcGVwOFwiXG4gICAgICB9XG4gICAgfVxuICAgIHtcbiAgICAgIG5hbWU6IFwiaXNvcnRcIlxuICAgICAgY21kOiBcImlzb3J0XCJcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgICBob21lcGFnZTogXCJodHRwczovL2dpdGh1Yi5jb20vdGltb3RoeWNyb3NsZXkvaXNvcnRcIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS90aW1vdGh5Y3Jvc2xleS9pc29ydCNpbnN0YWxsaW5nLWlzb3J0XCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9WRVJTSU9OIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBvcHRpb25zOiB7XG4gICAgUHl0aG9uOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0ID0ge30pIC0+XG4gICAgQGV4ZShcImF1dG9wZXA4XCIpLnJ1bihbXG4gICAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgICAgXCItaVwiXG4gICAgICAgIFtcIi0tbWF4LWxpbmUtbGVuZ3RoXCIsIFwiI3tvcHRpb25zLm1heF9saW5lX2xlbmd0aH1cIl0gaWYgb3B0aW9ucy5tYXhfbGluZV9sZW5ndGg/XG4gICAgICAgIFtcIi0taW5kZW50LXNpemVcIixcIiN7b3B0aW9ucy5pbmRlbnRfc2l6ZX1cIl0gaWYgb3B0aW9ucy5pbmRlbnRfc2l6ZT9cbiAgICAgICAgW1wiLS1pZ25vcmVcIixcIiN7b3B0aW9ucy5pZ25vcmUuam9pbignLCcpfVwiXSBpZiBvcHRpb25zLmlnbm9yZT9cbiAgICAgIF0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBpZiBvcHRpb25zLnNvcnRfaW1wb3J0c1xuICAgICAgICAgIGZpbGVQYXRoID0gY29udGV4dC5maWxlUGF0aFxuICAgICAgICAgIHByb2plY3RQYXRoID0gYXRvbT8ucHJvamVjdC5yZWxhdGl2aXplUGF0aChmaWxlUGF0aClbMF1cbiAgICAgICAgICBAZXhlKFwiaXNvcnRcIikucnVuKFtcIi1zcFwiLCBwcm9qZWN0UGF0aCwgdGVtcEZpbGVdKVxuICAgICAgKVxuICAgICAgLnRoZW4oPT4gQHJlYWRGaWxlKHRlbXBGaWxlKSlcbiJdfQ==
