
/*
Requires http://uncrustify.sourceforge.net/
 */

(function() {
  "use strict";
  var Beautifier, Uncrustify, _, cfg, expandHomeDir, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('../beautifier');

  cfg = require("./cfg");

  path = require("path");

  expandHomeDir = require('expand-home-dir');

  _ = require('lodash');

  module.exports = Uncrustify = (function(superClass) {
    extend(Uncrustify, superClass);

    function Uncrustify() {
      return Uncrustify.__super__.constructor.apply(this, arguments);
    }

    Uncrustify.prototype.name = "Uncrustify";

    Uncrustify.prototype.link = "https://github.com/uncrustify/uncrustify";

    Uncrustify.prototype.executables = [
      {
        name: "Uncrustify",
        cmd: "uncrustify",
        homepage: "http://uncrustify.sourceforge.net/",
        installation: "https://github.com/uncrustify/uncrustify",
        version: {
          parse: function(text) {
            var error, v;
            try {
              v = text.match(/uncrustify (\d+\.\d+)/)[1];
            } catch (error1) {
              error = error1;
              this.error(error);
              if (v == null) {
                v = text.match(/Uncrustify-(\d+\.\d+)/)[1];
              }
            }
            if (v) {
              return v + ".0";
            }
          }
        },
        docker: {
          image: "unibeautify/uncrustify"
        }
      }
    ];

    Uncrustify.prototype.options = {
      Apex: true,
      C: true,
      "C++": true,
      "C#": true,
      "Objective-C": true,
      D: true,
      Pawn: true,
      Vala: true,
      Java: true,
      Arduino: true
    };

    Uncrustify.prototype.beautify = function(text, language, options, context) {
      var fileExtension, uncrustify;
      fileExtension = context.fileExtension;
      uncrustify = this.exe("uncrustify");
      return new this.Promise(function(resolve, reject) {
        var basePath, configPath, editor, expandedConfigPath, projectPath;
        configPath = options.configPath;
        if (!configPath) {
          return cfg(options, function(error, cPath) {
            if (error) {
              throw error;
            }
            return resolve(cPath);
          });
        } else {
          editor = atom.workspace.getActiveTextEditor();
          if (editor != null) {
            basePath = path.dirname(editor.getPath());
            projectPath = atom.workspace.project.getPaths()[0];
            expandedConfigPath = expandHomeDir(configPath);
            configPath = path.resolve(projectPath, expandedConfigPath);
            return resolve(configPath);
          } else {
            return reject(new Error("No Uncrustify Config Path set! Please configure Uncrustify with Atom Beautify."));
          }
        }
      }).then((function(_this) {
        return function(configPath) {
          var lang, outputFile;
          lang = "C";
          switch (language) {
            case "Apex":
              lang = "Apex";
              break;
            case "C":
              lang = "C";
              break;
            case "C++":
              lang = "CPP";
              break;
            case "C#":
              lang = "CS";
              break;
            case "Objective-C":
            case "Objective-C++":
              lang = "OC+";
              break;
            case "D":
              lang = "D";
              break;
            case "Pawn":
              lang = "PAWN";
              break;
            case "Vala":
              lang = "VALA";
              break;
            case "Java":
              lang = "JAVA";
              break;
            case "Arduino":
              lang = "CPP";
          }
          return uncrustify.run(["-c", configPath, "-f", _this.tempFile("input", text, fileExtension && ("." + fileExtension)), "-o", outputFile = _this.tempFile("output", text, fileExtension && ("." + fileExtension)), "-l", lang]).then(function() {
            return _this.readFile(outputFile);
          });
        };
      })(this));
    };

    return Uncrustify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3VuY3J1c3RpZnkvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBR0E7QUFIQSxNQUFBLG1EQUFBO0lBQUE7OztFQUlBLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFDYixHQUFBLEdBQU0sT0FBQSxDQUFRLE9BQVI7O0VBQ04sSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLGlCQUFSOztFQUNoQixDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBRUosTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7eUJBQ3JCLElBQUEsR0FBTTs7eUJBQ04sSUFBQSxHQUFNOzt5QkFDTixXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxZQURSO1FBRUUsR0FBQSxFQUFLLFlBRlA7UUFHRSxRQUFBLEVBQVUsb0NBSFo7UUFJRSxZQUFBLEVBQWMsMENBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDtBQUNMLGdCQUFBO0FBQUE7Y0FDRSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyx1QkFBWCxDQUFvQyxDQUFBLENBQUEsRUFEMUM7YUFBQSxjQUFBO2NBRU07Y0FDSixJQUFDLENBQUEsS0FBRCxDQUFPLEtBQVA7Y0FDQSxJQUFrRCxTQUFsRDtnQkFBQSxDQUFBLEdBQUksSUFBSSxDQUFDLEtBQUwsQ0FBVyx1QkFBWCxDQUFvQyxDQUFBLENBQUEsRUFBeEM7ZUFKRjs7WUFLQSxJQUFHLENBQUg7QUFDRSxxQkFBTyxDQUFBLEdBQUksS0FEYjs7VUFOSyxDQURBO1NBTFg7UUFlRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sd0JBREQ7U0FmVjtPQURXOzs7eUJBc0JiLE9BQUEsR0FB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QUEsQ0FBQSxDQUFBLElBQUEsQ0FyQkM7SUFMQzs7OztLQXRDOEI7QUFWMUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHA6Ly91bmNydXN0aWZ5LnNvdXJjZWZvcmdlLm5ldC9cbiMjI1xuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuLi9iZWF1dGlmaWVyJylcbmNmZyA9IHJlcXVpcmUoXCIuL2NmZ1wiKVxucGF0aCA9IHJlcXVpcmUoXCJwYXRoXCIpXG5leHBhbmRIb21lRGlyID0gcmVxdWlyZSgnZXhwYW5kLWhvbWUtZGlyJylcbl8gPSByZXF1aXJlKCdsb2Rhc2gnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFVuY3J1c3RpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiVW5jcnVzdGlmeVwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL3VuY3J1c3RpZnkvdW5jcnVzdGlmeVwiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJVbmNydXN0aWZ5XCJcbiAgICAgIGNtZDogXCJ1bmNydXN0aWZ5XCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHA6Ly91bmNydXN0aWZ5LnNvdXJjZWZvcmdlLm5ldC9cIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHBzOi8vZ2l0aHViLmNvbS91bmNydXN0aWZ5L3VuY3J1c3RpZnlcIlxuICAgICAgdmVyc2lvbjoge1xuICAgICAgICBwYXJzZTogKHRleHQpIC0+XG4gICAgICAgICAgdHJ5XG4gICAgICAgICAgICB2ID0gdGV4dC5tYXRjaCgvdW5jcnVzdGlmeSAoXFxkK1xcLlxcZCspLylbMV1cbiAgICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgICAgQGVycm9yKGVycm9yKVxuICAgICAgICAgICAgdiA9IHRleHQubWF0Y2goL1VuY3J1c3RpZnktKFxcZCtcXC5cXGQrKS8pWzFdIGlmIG5vdCB2P1xuICAgICAgICAgIGlmIHZcbiAgICAgICAgICAgIHJldHVybiB2ICsgXCIuMFwiXG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvdW5jcnVzdGlmeVwiXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIEFwZXg6IHRydWVcbiAgICBDOiB0cnVlXG4gICAgXCJDKytcIjogdHJ1ZVxuICAgIFwiQyNcIjogdHJ1ZVxuICAgIFwiT2JqZWN0aXZlLUNcIjogdHJ1ZVxuICAgIEQ6IHRydWVcbiAgICBQYXduOiB0cnVlXG4gICAgVmFsYTogdHJ1ZVxuICAgIEphdmE6IHRydWVcbiAgICBBcmR1aW5vOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zLCBjb250ZXh0KSAtPlxuICAgIGZpbGVFeHRlbnNpb24gPSBjb250ZXh0LmZpbGVFeHRlbnNpb25cblxuICAgIHVuY3J1c3RpZnkgPSBAZXhlKFwidW5jcnVzdGlmeVwiKVxuICAgICMgY29uc29sZS5sb2coJ3VuY3J1c3RpZnkuYmVhdXRpZnknLCBsYW5ndWFnZSwgb3B0aW9ucylcbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgICBjb25maWdQYXRoID0gb3B0aW9ucy5jb25maWdQYXRoXG4gICAgICB1bmxlc3MgY29uZmlnUGF0aFxuICAgICAgICAjIE5vIGN1c3RvbSBjb25maWcgcGF0aFxuICAgICAgICBjZmcgb3B0aW9ucywgKGVycm9yLCBjUGF0aCkgLT5cbiAgICAgICAgICB0aHJvdyBlcnJvciBpZiBlcnJvclxuICAgICAgICAgIHJlc29sdmUgY1BhdGhcbiAgICAgIGVsc2VcbiAgICAgICAgIyBIYXMgY3VzdG9tIGNvbmZpZyBwYXRoXG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBpZiBlZGl0b3I/XG4gICAgICAgICAgYmFzZVBhdGggPSBwYXRoLmRpcm5hbWUoZWRpdG9yLmdldFBhdGgoKSlcbiAgICAgICAgICBwcm9qZWN0UGF0aCA9IGF0b20ud29ya3NwYWNlLnByb2plY3QuZ2V0UGF0aHMoKVswXVxuICAgICAgICAgICMgY29uc29sZS5sb2coYmFzZVBhdGgpO1xuICAgICAgICAgICMgRXhwYW5kIEhvbWUgRGlyZWN0b3J5IGluIENvbmZpZyBQYXRoXG4gICAgICAgICAgZXhwYW5kZWRDb25maWdQYXRoID0gZXhwYW5kSG9tZURpcihjb25maWdQYXRoKVxuICAgICAgICAgIGNvbmZpZ1BhdGggPSBwYXRoLnJlc29sdmUocHJvamVjdFBhdGgsIGV4cGFuZGVkQ29uZmlnUGF0aClcbiAgICAgICAgICByZXNvbHZlIGNvbmZpZ1BhdGhcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXCJObyBVbmNydXN0aWZ5IENvbmZpZyBQYXRoIHNldCEgUGxlYXNlIGNvbmZpZ3VyZSBVbmNydXN0aWZ5IHdpdGggQXRvbSBCZWF1dGlmeS5cIikpXG4gICAgKVxuICAgIC50aGVuKChjb25maWdQYXRoKSA9PlxuICAgICAgIyBTZWxlY3QgVW5jcnVzdGlmeSBsYW5ndWFnZVxuICAgICAgbGFuZyA9IFwiQ1wiICMgRGVmYXVsdCBpcyBDXG4gICAgICBzd2l0Y2ggbGFuZ3VhZ2VcbiAgICAgICAgd2hlbiBcIkFwZXhcIlxuICAgICAgICAgIGxhbmcgPSBcIkFwZXhcIlxuICAgICAgICB3aGVuIFwiQ1wiXG4gICAgICAgICAgbGFuZyA9IFwiQ1wiXG4gICAgICAgIHdoZW4gXCJDKytcIlxuICAgICAgICAgIGxhbmcgPSBcIkNQUFwiXG4gICAgICAgIHdoZW4gXCJDI1wiXG4gICAgICAgICAgbGFuZyA9IFwiQ1NcIlxuICAgICAgICB3aGVuIFwiT2JqZWN0aXZlLUNcIiwgXCJPYmplY3RpdmUtQysrXCJcbiAgICAgICAgICBsYW5nID0gXCJPQytcIlxuICAgICAgICB3aGVuIFwiRFwiXG4gICAgICAgICAgbGFuZyA9IFwiRFwiXG4gICAgICAgIHdoZW4gXCJQYXduXCJcbiAgICAgICAgICBsYW5nID0gXCJQQVdOXCJcbiAgICAgICAgd2hlbiBcIlZhbGFcIlxuICAgICAgICAgIGxhbmcgPSBcIlZBTEFcIlxuICAgICAgICB3aGVuIFwiSmF2YVwiXG4gICAgICAgICAgbGFuZyA9IFwiSkFWQVwiXG4gICAgICAgIHdoZW4gXCJBcmR1aW5vXCJcbiAgICAgICAgICBsYW5nID0gXCJDUFBcIlxuXG4gICAgICB1bmNydXN0aWZ5LnJ1bihbXG4gICAgICAgIFwiLWNcIlxuICAgICAgICBjb25maWdQYXRoXG4gICAgICAgIFwiLWZcIlxuICAgICAgICBAdGVtcEZpbGUoXCJpbnB1dFwiLCB0ZXh0LCBmaWxlRXh0ZW5zaW9uIGFuZCBcIi4je2ZpbGVFeHRlbnNpb259XCIpXG4gICAgICAgIFwiLW9cIlxuICAgICAgICBvdXRwdXRGaWxlID0gQHRlbXBGaWxlKFwib3V0cHV0XCIsIHRleHQsIGZpbGVFeHRlbnNpb24gYW5kIFwiLiN7ZmlsZUV4dGVuc2lvbn1cIilcbiAgICAgICAgXCItbFwiXG4gICAgICAgIGxhbmdcbiAgICAgICAgXSlcbiAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICBAcmVhZEZpbGUob3V0cHV0RmlsZSlcbiAgICAgICAgKVxuICAgIClcbiJdfQ==
