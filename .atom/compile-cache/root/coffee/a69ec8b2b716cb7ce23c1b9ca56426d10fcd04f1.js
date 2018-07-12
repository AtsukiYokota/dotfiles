(function() {
  "use strict";
  var Beautifier, ESLintFixer, Path, allowUnsafeNewFunction,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  Path = require('path');

  allowUnsafeNewFunction = require('loophole').allowUnsafeNewFunction;

  module.exports = ESLintFixer = (function(superClass) {
    extend(ESLintFixer, superClass);

    function ESLintFixer() {
      return ESLintFixer.__super__.constructor.apply(this, arguments);
    }

    ESLintFixer.prototype.name = "ESLint Fixer";

    ESLintFixer.prototype.link = "https://github.com/eslint/eslint";

    ESLintFixer.prototype.options = {
      JavaScript: false,
      Vue: false
    };

    ESLintFixer.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var editor, filePath, projectPath, result;
        editor = atom.workspace.getActiveTextEditor();
        filePath = editor.getPath();
        projectPath = atom.project.relativizePath(filePath)[0];
        result = null;
        return allowUnsafeNewFunction(function() {
          var CLIEngine, cli, err, importPath;
          importPath = Path.join(projectPath, 'node_modules', 'eslint');
          try {
            CLIEngine = require(importPath).CLIEngine;
            cli = new CLIEngine({
              fix: true,
              cwd: projectPath
            });
            result = cli.executeOnText(text).results[0];
            return resolve(result.output);
          } catch (error) {
            err = error;
            return reject(err);
          }
        });
      });
    };

    return ESLintFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2VzbGludC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEscURBQUE7SUFBQTs7O0VBRUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDTix5QkFBMEIsT0FBQSxDQUFRLFVBQVI7O0VBRTNCLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzBCQUNyQixJQUFBLEdBQU07OzBCQUNOLElBQUEsR0FBTTs7MEJBRU4sT0FBQSxHQUFTO01BQ1AsVUFBQSxFQUFZLEtBREw7TUFFUCxHQUFBLEVBQUssS0FGRTs7OzBCQUtULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBTyxJQUFJLElBQUMsQ0FBQSxPQUFMLENBQWEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUNsQixZQUFBO1FBQUEsTUFBQSxHQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQTtRQUNULFFBQUEsR0FBVyxNQUFNLENBQUMsT0FBUCxDQUFBO1FBQ1gsV0FBQSxHQUFjLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixRQUE1QixDQUFzQyxDQUFBLENBQUE7UUFFcEQsTUFBQSxHQUFTO2VBQ1Qsc0JBQUEsQ0FBdUIsU0FBQTtBQUNyQixjQUFBO1VBQUEsVUFBQSxHQUFhLElBQUksQ0FBQyxJQUFMLENBQVUsV0FBVixFQUF1QixjQUF2QixFQUF1QyxRQUF2QztBQUNiO1lBQ0UsU0FBQSxHQUFZLE9BQUEsQ0FBUSxVQUFSLENBQW1CLENBQUM7WUFFaEMsR0FBQSxHQUFNLElBQUksU0FBSixDQUFjO2NBQUEsR0FBQSxFQUFLLElBQUw7Y0FBVyxHQUFBLEVBQUssV0FBaEI7YUFBZDtZQUNOLE1BQUEsR0FBUyxHQUFHLENBQUMsYUFBSixDQUFrQixJQUFsQixDQUF1QixDQUFDLE9BQVEsQ0FBQSxDQUFBO21CQUV6QyxPQUFBLENBQVEsTUFBTSxDQUFDLE1BQWYsRUFORjtXQUFBLGFBQUE7WUFPTTttQkFDSixNQUFBLENBQU8sR0FBUCxFQVJGOztRQUZxQixDQUF2QjtNQU5rQixDQUFiO0lBREM7Ozs7S0FUK0I7QUFOM0MiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblBhdGggPSByZXF1aXJlKCdwYXRoJylcbnthbGxvd1Vuc2FmZU5ld0Z1bmN0aW9ufSA9IHJlcXVpcmUgJ2xvb3Bob2xlJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEVTTGludEZpeGVyIGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIkVTTGludCBGaXhlclwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2VzbGludC9lc2xpbnRcIlxuXG4gIG9wdGlvbnM6IHtcbiAgICBKYXZhU2NyaXB0OiBmYWxzZVxuICAgIFZ1ZTogZmFsc2VcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMpIC0+XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgICBmaWxlUGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHByb2plY3RQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKGZpbGVQYXRoKVswXVxuXG4gICAgICByZXN1bHQgPSBudWxsXG4gICAgICBhbGxvd1Vuc2FmZU5ld0Z1bmN0aW9uIC0+XG4gICAgICAgIGltcG9ydFBhdGggPSBQYXRoLmpvaW4ocHJvamVjdFBhdGgsICdub2RlX21vZHVsZXMnLCAnZXNsaW50JylcbiAgICAgICAgdHJ5XG4gICAgICAgICAgQ0xJRW5naW5lID0gcmVxdWlyZShpbXBvcnRQYXRoKS5DTElFbmdpbmVcblxuICAgICAgICAgIGNsaSA9IG5ldyBDTElFbmdpbmUoZml4OiB0cnVlLCBjd2Q6IHByb2plY3RQYXRoKVxuICAgICAgICAgIHJlc3VsdCA9IGNsaS5leGVjdXRlT25UZXh0KHRleHQpLnJlc3VsdHNbMF1cblxuICAgICAgICAgIHJlc29sdmUgcmVzdWx0Lm91dHB1dFxuICAgICAgICBjYXRjaCBlcnJcbiAgICAgICAgICByZWplY3QoZXJyKVxuICAgIClcbiJdfQ==
