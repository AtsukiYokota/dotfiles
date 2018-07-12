(function() {
  var Beautifier, Executable, Promise, _, fs, path, readFile, shellEnv, temp, which;

  Promise = require('bluebird');

  _ = require('lodash');

  fs = require('fs');

  temp = require('temp').track();

  readFile = Promise.promisify(fs.readFile);

  which = require('which');

  path = require('path');

  shellEnv = require('shell-env');

  Executable = require('./executable');

  module.exports = Beautifier = (function() {

    /*
    Promise
     */
    Beautifier.prototype.Promise = Promise;


    /*
    Name of Beautifier
     */

    Beautifier.prototype.name = 'Beautifier';


    /*
    Supported Options
    
    Enable options for supported languages.
    - <string:language>:<boolean:all_options_enabled>
    - <string:language>:<string:option_key>:<boolean:enabled>
    - <string:language>:<string:option_key>:<string:rename>
    - <string:language>:<string:option_key>:<function:transform>
    - <string:language>:<string:option_key>:<array:mapper>
     */

    Beautifier.prototype.options = {};

    Beautifier.prototype.executables = [];


    /*
    Is the beautifier a command-line interface beautifier?
     */

    Beautifier.prototype.isPreInstalled = function() {
      return this.executables.length === 0;
    };

    Beautifier.prototype._exe = {};

    Beautifier.prototype.loadExecutables = function() {
      var executables;
      this.debug("Load executables");
      if (Object.keys(this._exe).length === this.executables.length) {
        return Promise.resolve(this._exe);
      } else {
        return Promise.resolve(executables = this.executables.map(function(e) {
          return new Executable(e);
        })).then(function(executables) {
          return Promise.all(executables.map(function(exe) {
            return exe.init();
          }));
        }).then((function(_this) {
          return function(es) {
            var exe, missingInstalls;
            _this.debug("Executables loaded", es);
            exe = {};
            missingInstalls = [];
            es.forEach(function(e) {
              exe[e.cmd] = e;
              if (!e.isInstalled && e.required) {
                return missingInstalls.push(e);
              }
            });
            _this._exe = exe;
            _this.debug("exe", exe);
            if (missingInstalls.length === 0) {
              return _this._exe;
            } else {
              _this.debug("Missing required executables: " + (missingInstalls.map(function(e) {
                return e.cmd;
              }).join(' and ')) + ".");
              throw Executable.commandNotFoundError(missingInstalls[0].cmd);
            }
          };
        })(this))["catch"]((function(_this) {
          return function(error) {
            _this.debug("Error loading executables", error);
            return Promise.reject(error);
          };
        })(this));
      }
    };

    Beautifier.prototype.exe = function(cmd) {
      var e;
      console.log('exe', cmd, this._exe);
      e = this._exe[cmd];
      if (e == null) {
        throw Executable.commandNotFoundError(cmd);
      }
      return e;
    };


    /*
    Supported languages by this Beautifier
    
    Extracted from the keys of the `options` field.
     */

    Beautifier.prototype.languages = null;


    /*
    Beautify text
    
    Override this method in subclasses
     */

    Beautifier.prototype.beautify = null;


    /*
    Show deprecation warning to user.
     */

    Beautifier.prototype.deprecate = function(warning) {
      var ref;
      return (ref = atom.notifications) != null ? ref.addWarning(warning) : void 0;
    };

    Beautifier.prototype.deprecateOptionForExecutable = function(exeName, oldOption, newOption) {
      var deprecationMessage;
      deprecationMessage = "The \"" + oldOption + "\" configuration option has been deprecated. Please switch to using the option in section \"Executables\" (near the top) in subsection \"" + exeName + "\" labelled \"" + newOption + "\" in Atom-Beautify package settings.";
      return this.deprecate(deprecationMessage);
    };


    /*
    Create temporary file
     */

    Beautifier.prototype.tempFile = function(name, contents, ext) {
      if (name == null) {
        name = "atom-beautify-temp";
      }
      if (contents == null) {
        contents = "";
      }
      if (ext == null) {
        ext = "";
      }
      return new Promise((function(_this) {
        return function(resolve, reject) {
          return temp.open({
            prefix: name,
            suffix: ext
          }, function(err, info) {
            _this.debug('tempFile', name, err, info);
            if (err) {
              return reject(err);
            }
            return fs.write(info.fd, contents, function(err) {
              if (err) {
                return reject(err);
              }
              return fs.close(info.fd, function(err) {
                if (err) {
                  return reject(err);
                }
                return resolve(info.path);
              });
            });
          });
        };
      })(this));
    };


    /*
    Read file
     */

    Beautifier.prototype.readFile = function(filePath) {
      return Promise.resolve(filePath).then(function(filePath) {
        return readFile(filePath, "utf8");
      });
    };


    /*
    Find file
     */

    Beautifier.prototype.findFile = function(startDir, fileNames) {
      var currentDir, fileName, filePath, i, len;
      if (!arguments.length) {
        throw new Error("Specify file names to find.");
      }
      if (!(fileNames instanceof Array)) {
        fileNames = [fileNames];
      }
      startDir = startDir.split(path.sep);
      while (startDir.length) {
        currentDir = startDir.join(path.sep);
        for (i = 0, len = fileNames.length; i < len; i++) {
          fileName = fileNames[i];
          filePath = path.join(currentDir, fileName);
          try {
            fs.accessSync(filePath, fs.R_OK);
            return filePath;
          } catch (error1) {}
        }
        startDir.pop();
      }
      return null;
    };

    Beautifier.prototype.getDefaultLineEnding = function(crlf, lf, optionEol) {
      if (!optionEol || optionEol === 'System Default') {
        optionEol = atom.config.get('line-ending-selector.defaultLineEnding');
      }
      switch (optionEol) {
        case 'LF':
          return lf;
        case 'CRLF':
          return crlf;
        case 'OS Default':
          if (process.platform === 'win32') {
            return crlf;
          } else {
            return lf;
          }
        default:
          return lf;
      }
    };


    /*
    Like the unix which utility.
    
    Finds the first instance of a specified executable in the PATH environment variable.
    Does not cache the results,
    so hash -r is not needed when the PATH changes.
    See https://github.com/isaacs/node-which
     */

    Beautifier.prototype.which = function(exe, options) {
      if (options == null) {
        options = {};
      }
      return Executable.which(exe, options);
    };


    /*
    Run command-line interface command
     */

    Beautifier.prototype.run = function(executable, args, arg) {
      var cwd, exe, help, ignoreReturnCode, onStdin, ref;
      ref = arg != null ? arg : {}, cwd = ref.cwd, ignoreReturnCode = ref.ignoreReturnCode, help = ref.help, onStdin = ref.onStdin;
      exe = new Executable({
        name: this.name,
        homepage: this.link,
        installation: this.link,
        cmd: executable
      });
      if (help == null) {
        help = {
          program: executable,
          link: this.link,
          pathOption: void 0
        };
      }
      return exe.run(args, {
        cwd: cwd,
        ignoreReturnCode: ignoreReturnCode,
        help: help,
        onStdin: onStdin
      });
    };


    /*
    Logger instance
     */

    Beautifier.prototype.logger = null;


    /*
    Initialize and configure Logger
     */

    Beautifier.prototype.setupLogger = function() {
      var key, method, ref;
      this.logger = require('../logger')(__filename);
      ref = this.logger;
      for (key in ref) {
        method = ref[key];
        this[key] = method;
      }
      return this.verbose(this.name + " beautifier logger has been initialized.");
    };


    /*
    Constructor to setup beautifer
     */

    function Beautifier() {
      var globalOptions, lang, options, ref;
      this.setupLogger();
      if (this.options._ != null) {
        globalOptions = this.options._;
        delete this.options._;
        if (typeof globalOptions === "object") {
          ref = this.options;
          for (lang in ref) {
            options = ref[lang];
            if (typeof options === "boolean") {
              if (options === true) {
                this.options[lang] = globalOptions;
              }
            } else if (typeof options === "object") {
              this.options[lang] = _.merge(globalOptions, options);
            } else {
              this.warn(("Unsupported options type " + (typeof options) + " for language " + lang + ": ") + options);
            }
          }
        }
      }
      this.verbose("Options for " + this.name + ":", this.options);
      this.languages = _.keys(this.options);
    }

    return Beautifier;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2JlYXV0aWZpZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxPQUFBLEdBQVUsT0FBQSxDQUFRLFVBQVI7O0VBQ1YsQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUNKLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVIsQ0FBZSxDQUFDLEtBQWhCLENBQUE7O0VBQ1AsUUFBQSxHQUFXLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEVBQUUsQ0FBQyxRQUFyQjs7RUFDWCxLQUFBLEdBQVEsT0FBQSxDQUFRLE9BQVI7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFFBQUEsR0FBVyxPQUFBLENBQVEsV0FBUjs7RUFDWCxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7O0FBRXJCOzs7eUJBR0EsT0FBQSxHQUFTOzs7QUFFVDs7Ozt5QkFHQSxJQUFBLEdBQU07OztBQUVOOzs7Ozs7Ozs7Ozt5QkFVQSxPQUFBLEdBQVM7O3lCQUVULFdBQUEsR0FBYTs7O0FBRWI7Ozs7eUJBR0EsY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUFiLEtBQXVCO0lBRFQ7O3lCQUdoQixJQUFBLEdBQU07O3lCQUNOLGVBQUEsR0FBaUIsU0FBQTtBQUNmLFVBQUE7TUFBQSxJQUFDLENBQUEsS0FBRCxDQUFPLGtCQUFQO01BQ0EsSUFBRyxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUMsQ0FBQSxJQUFiLENBQWtCLENBQUMsTUFBbkIsS0FBNkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxNQUE3QztlQUNFLE9BQU8sQ0FBQyxPQUFSLENBQWdCLElBQUMsQ0FB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LE9BQVEsQ0FBQSxJQUFBLENBQVQsR0FBaUIsY0FEbkI7ZUFERjthQUFBLE1BR0ssSUFBRyxPQUFPLE9BQVAsS0FBa0IsUUFBckI7Y0FDSCxJQUFDLENBQUEsT0FBUSxDQUFBLElBQUEsQ0FBVCxHQUFpQixDQUFDLENBQUMsS0FBRixDQUFRLGFBQVIsRUFBdUIsT0FBdkIsRUFEZDthQUFBLE1BQUE7Y0FHSCxJQUFDLENBQUEsSUFBRCxDQUFNLENBQUEsMkJBQUEsR0FBMkIsQ0FBQyxPQUFPLE9BQVIsQ0FBM0IsR0FBMkMsZ0JBQTNDLEdBQTJELElBQTNELEdBQWdFLElBQWhFLENBQUEsR0FBcUUsT0FBM0UsRUFIRzs7QUFMUCxXQUZGO1NBSkY7O01BZUEsSUFBQyxDQUFBLE9BQUQsQ0FBUyxjQUFBLEdBQWUsSUFBQyxDQUFBLElBQWhCLEdBQXFCLEdBQTlCLEVBQWtDLElBQUMsQ0FBQSxPQUFuQztNQUVBLElBQUMsQ0FBQSxTQUFELEdBQWEsQ0FBQyxDQUFDLElBQUYsQ0FBTyxJQUFDLENBQUEsT0FBUjtJQXJCRjs7Ozs7QUEzTmYiLCJzb3VyY2VzQ29udGVudCI6WyJQcm9taXNlID0gcmVxdWlyZSgnYmx1ZWJpcmQnKVxuXyA9IHJlcXVpcmUoJ2xvZGFzaCcpXG5mcyA9IHJlcXVpcmUoJ2ZzJylcbnRlbXAgPSByZXF1aXJlKCd0ZW1wJykudHJhY2soKVxucmVhZEZpbGUgPSBQcm9taXNlLnByb21pc2lmeShmcy5yZWFkRmlsZSlcbndoaWNoID0gcmVxdWlyZSgnd2hpY2gnKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuc2hlbGxFbnYgPSByZXF1aXJlKCdzaGVsbC1lbnYnKVxuRXhlY3V0YWJsZSA9IHJlcXVpcmUoJy4vZXhlY3V0YWJsZScpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgQmVhdXRpZmllclxuXG4gICMjI1xuICBQcm9taXNlXG4gICMjI1xuICBQcm9taXNlOiBQcm9taXNlXG5cbiAgIyMjXG4gIE5hbWUgb2YgQmVhdXRpZmllclxuICAjIyNcbiAgbmFtZTogJ0JlYXV0aWZpZXInXG5cbiAgIyMjXG4gIFN1cHBvcnRlZCBPcHRpb25zXG5cbiAgRW5hYmxlIG9wdGlvbnMgZm9yIHN1cHBvcnRlZCBsYW5ndWFnZXMuXG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PGJvb2xlYW46YWxsX29wdGlvbnNfZW5hYmxlZD5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+Ojxib29sZWFuOmVuYWJsZWQ+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8c3RyaW5nOnJlbmFtZT5cbiAgLSA8c3RyaW5nOmxhbmd1YWdlPjo8c3RyaW5nOm9wdGlvbl9rZXk+OjxmdW5jdGlvbjp0cmFuc2Zvcm0+XG4gIC0gPHN0cmluZzpsYW5ndWFnZT46PHN0cmluZzpvcHRpb25fa2V5Pjo8YXJyYXk6bWFwcGVyPlxuICAjIyNcbiAgb3B0aW9uczoge31cblxuICBleGVjdXRhYmxlczogW11cblxuICAjIyNcbiAgSXMgdGhlIGJlYXV0aWZpZXIgYSBjb21tYW5kLWxpbmUgaW50ZXJmYWNlIGJlYXV0aWZpZXI/XG4gICMjI1xuICBpc1ByZUluc3RhbGxlZDogKCkgLT5cbiAgICBAZXhlY3V0YWJsZXMubGVuZ3RoIGlzIDBcblxuICBfZXhlOiB7fVxuICBsb2FkRXhlY3V0YWJsZXM6ICgpIC0+XG4gICAgQGRlYnVnKFwiTG9hZCBleGVjdXRhYmxlc1wiKVxuICAgIGlmIE9iamVjdC5rZXlzKEBfZXhlKS5sZW5ndGggaXMgQGV4ZWN1dGFibGVzLmxlbmd0aFxuICAgICAgUHJvbWlzZS5yZXNvbHZlKEBfZXhlKVxuICAgIGVsc2VcbiAgICAgIFByb21pc2UucmVzb2x2ZShleGVjdXRhYmxlcyA9IEBleGVjdXRhYmxlcy5tYXAoKGUpIC0+IG5ldyBFeGVjdXRhYmxlKGUpKSlcbiAgICAgICAgLnRoZW4oKGV4ZWN1dGFibGVzKSAtPiBQcm9taXNlLmFsbChleGVjdXRhYmxlcy5tYXAoKGV4ZSkgLT4gZXhlLmluaXQoKSkpKVxuICAgICAgICAudGhlbigoZXMpID0+XG4gICAgICAgICAgQGRlYnVnKFwiRXhlY3V0YWJsZXMgbG9hZGVkXCIsIGVzKVxuICAgICAgICAgIGV4ZSA9IHt9XG4gICAgICAgICAgbWlzc2luZ0luc3RhbGxzID0gW11cbiAgICAgICAgICBlcy5mb3JFYWNoKChlKSAtPlxuICAgICAgICAgICAgZXhlW2UuY21kXSA9IGVcbiAgICAgICAgICAgIGlmIG5vdCBlLmlzSW5zdGFsbGVkIGFuZCBlLnJlcXVpcmVkXG4gICAgICAgICAgICAgIG1pc3NpbmdJbnN0YWxscy5wdXNoKGUpXG4gICAgICAgICAgKVxuICAgICAgICAgIEBfZXhlID0gZXhlXG4gICAgICAgICAgQGRlYnVnKFwiZXhlXCIsIGV4ZSlcbiAgICAgICAgICBpZiBtaXNzaW5nSW5zdGFsbHMubGVuZ3RoIGlzIDBcbiAgICAgICAgICAgIHJldHVybiBAX2V4ZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEBkZWJ1ZyhcIk1pc3NpbmcgcmVxdWlyZWQgZXhlY3V0YWJsZXM6ICN7bWlzc2luZ0luc3RhbGxzLm1hcCgoZSkgLT4gZS5jbWQpLmpvaW4oJyBhbmQgJyl9LlwiKVxuICAgICAgICAgICAgdGhyb3cgRXhlY3V0YWJsZS5jb21tYW5kTm90Rm91bmRFcnJvcihtaXNzaW5nSW5zdGFsbHNbMF0uY21kKVxuICAgICAgICApXG4gICAgICAgIC5jYXRjaCgoZXJyb3IpID0+XG4gICAgICAgICAgQGRlYnVnKFwiRXJyb3IgbG9hZGluZyBleGVjdXRhYmxlc1wiLCBlcnJvcilcbiAgICAgICAgICBQcm9taXNlLnJlamVjdChlcnJvcilcbiAgICAgICAgKVxuICBleGU6IChjbWQpIC0+XG4gICAgY29uc29sZS5sb2coJ2V4ZScsIGNtZCwgQF9leGUpXG4gICAgZSA9IEBfZXhlW2NtZF1cbiAgICBpZiAhZT9cbiAgICAgIHRocm93IEV4ZWN1dGFibGUuY29tbWFuZE5vdEZvdW5kRXJyb3IoY21kKVxuICAgIGVcblxuICAjIyNcbiAgU3VwcG9ydGVkIGxhbmd1YWdlcyBieSB0aGlzIEJlYXV0aWZpZXJcblxuICBFeHRyYWN0ZWQgZnJvbSB0aGUga2V5cyBvZiB0aGUgYG9wdGlvbnNgIGZpZWxkLlxuICAjIyNcbiAgbGFuZ3VhZ2VzOiBudWxsXG5cbiAgIyMjXG4gIEJlYXV0aWZ5IHRleHRcblxuICBPdmVycmlkZSB0aGlzIG1ldGhvZCBpbiBzdWJjbGFzc2VzXG4gICMjI1xuICBiZWF1dGlmeTogbnVsbFxuXG4gICMjI1xuICBTaG93IGRlcHJlY2F0aW9uIHdhcm5pbmcgdG8gdXNlci5cbiAgIyMjXG4gIGRlcHJlY2F0ZTogKHdhcm5pbmcpIC0+XG4gICAgYXRvbS5ub3RpZmljYXRpb25zPy5hZGRXYXJuaW5nKHdhcm5pbmcpXG5cbiAgZGVwcmVjYXRlT3B0aW9uRm9yRXhlY3V0YWJsZTogKGV4ZU5hbWUsIG9sZE9wdGlvbiwgbmV3T3B0aW9uKSAtPlxuICAgIGRlcHJlY2F0aW9uTWVzc2FnZSA9IFwiVGhlIFxcXCIje29sZE9wdGlvbn1cXFwiIGNvbmZpZ3VyYXRpb24gb3B0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFBsZWFzZSBzd2l0Y2ggdG8gdXNpbmcgdGhlIG9wdGlvbiBpbiBzZWN0aW9uIFxcXCJFeGVjdXRhYmxlc1xcXCIgKG5lYXIgdGhlIHRvcCkgaW4gc3Vic2VjdGlvbiBcXFwiI3tleGVOYW1lfVxcXCIgbGFiZWxsZWQgXFxcIiN7bmV3T3B0aW9ufVxcXCIgaW4gQXRvbS1CZWF1dGlmeSBwYWNrYWdlIHNldHRpbmdzLlwiXG4gICAgQGRlcHJlY2F0ZShkZXByZWNhdGlvbk1lc3NhZ2UpXG5cbiAgIyMjXG4gIENyZWF0ZSB0ZW1wb3JhcnkgZmlsZVxuICAjIyNcbiAgdGVtcEZpbGU6IChuYW1lID0gXCJhdG9tLWJlYXV0aWZ5LXRlbXBcIiwgY29udGVudHMgPSBcIlwiLCBleHQgPSBcIlwiKSAtPlxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PlxuICAgICAgIyBjcmVhdGUgdGVtcCBmaWxlXG4gICAgICB0ZW1wLm9wZW4oe3ByZWZpeDogbmFtZSwgc3VmZml4OiBleHR9LCAoZXJyLCBpbmZvKSA9PlxuICAgICAgICBAZGVidWcoJ3RlbXBGaWxlJywgbmFtZSwgZXJyLCBpbmZvKVxuICAgICAgICByZXR1cm4gcmVqZWN0KGVycikgaWYgZXJyXG4gICAgICAgIGZzLndyaXRlKGluZm8uZmQsIGNvbnRlbnRzLCAoZXJyKSAtPlxuICAgICAgICAgIHJldHVybiByZWplY3QoZXJyKSBpZiBlcnJcbiAgICAgICAgICBmcy5jbG9zZShpbmZvLmZkLCAoZXJyKSAtPlxuICAgICAgICAgICAgcmV0dXJuIHJlamVjdChlcnIpIGlmIGVyclxuICAgICAgICAgICAgcmVzb2x2ZShpbmZvLnBhdGgpXG4gICAgICAgICAgKVxuICAgICAgICApXG4gICAgICApXG4gICAgKVxuXG4gICMjI1xuICBSZWFkIGZpbGVcbiAgIyMjXG4gIHJlYWRGaWxlOiAoZmlsZVBhdGgpIC0+XG4gICAgUHJvbWlzZS5yZXNvbHZlKGZpbGVQYXRoKVxuICAgIC50aGVuKChmaWxlUGF0aCkgLT5cbiAgICAgIHJldHVybiByZWFkRmlsZShmaWxlUGF0aCwgXCJ1dGY4XCIpXG4gICAgKVxuXG4gICMjI1xuICBGaW5kIGZpbGVcbiAgIyMjXG4gIGZpbmRGaWxlOiAoc3RhcnREaXIsIGZpbGVOYW1lcykgLT5cbiAgICB0aHJvdyBuZXcgRXJyb3IgXCJTcGVjaWZ5IGZpbGUgbmFtZXMgdG8gZmluZC5cIiB1bmxlc3MgYXJndW1lbnRzLmxlbmd0aFxuICAgIHVubGVzcyBmaWxlTmFtZXMgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgZmlsZU5hbWVzID0gW2ZpbGVOYW1lc11cbiAgICBzdGFydERpciA9IHN0YXJ0RGlyLnNwbGl0KHBhdGguc2VwKVxuICAgIHdoaWxlIHN0YXJ0RGlyLmxlbmd0aFxuICAgICAgY3VycmVudERpciA9IHN0YXJ0RGlyLmpvaW4ocGF0aC5zZXApXG4gICAgICBmb3IgZmlsZU5hbWUgaW4gZmlsZU5hbWVzXG4gICAgICAgIGZpbGVQYXRoID0gcGF0aC5qb2luKGN1cnJlbnREaXIsIGZpbGVOYW1lKVxuICAgICAgICB0cnlcbiAgICAgICAgICBmcy5hY2Nlc3NTeW5jKGZpbGVQYXRoLCBmcy5SX09LKVxuICAgICAgICAgIHJldHVybiBmaWxlUGF0aFxuICAgICAgc3RhcnREaXIucG9wKClcbiAgICByZXR1cm4gbnVsbFxuXG4gICMgUmV0cmlldmVzIHRoZSBkZWZhdWx0IGxpbmUgZW5kaW5nIGJhc2VkIHVwb24gdGhlIEF0b20gY29uZmlndXJhdGlvblxuICAjICBgbGluZS1lbmRpbmctc2VsZWN0b3IuZGVmYXVsdExpbmVFbmRpbmdgLiBJZiB0aGUgQXRvbSBjb25maWd1cmF0aW9uXG4gICMgIGluZGljYXRlcyBcIk9TIERlZmF1bHRcIiwgdGhlIGBwcm9jZXNzLnBsYXRmb3JtYCBpcyBxdWVyaWVkLCByZXR1cm5pbmdcbiAgIyAgQ1JMRiBmb3IgV2luZG93cyBzeXN0ZW1zIGFuZCBMRiBmb3IgYWxsIG90aGVyIHN5c3RlbXMuXG4gICMgQ29kZSBtb2RpZmllZCBmcm9tIGF0b20vbGluZS1lbmRpbmctc2VsZWN0b3JcbiAgIyByZXR1cm5zOiBUaGUgY29ycmVjdCBsaW5lLWVuZGluZyBjaGFyYWN0ZXIgc2VxdWVuY2UgYmFzZWQgdXBvbiB0aGUgQXRvbVxuICAjICBjb25maWd1cmF0aW9uLCBvciBgbnVsbGAgaWYgdGhlIEF0b20gbGluZSBlbmRpbmcgY29uZmlndXJhdGlvbiB3YXMgbm90XG4gICMgIHJlY29nbml6ZWQuXG4gICMgc2VlOiBodHRwczovL2dpdGh1Yi5jb20vYXRvbS9saW5lLWVuZGluZy1zZWxlY3Rvci9ibG9iL21hc3Rlci9saWIvbWFpbi5qc1xuICBnZXREZWZhdWx0TGluZUVuZGluZzogKGNybGYsbGYsb3B0aW9uRW9sKSAtPlxuICAgIGlmICghb3B0aW9uRW9sIHx8IG9wdGlvbkVvbCA9PSAnU3lzdGVtIERlZmF1bHQnKVxuICAgICAgb3B0aW9uRW9sID0gYXRvbS5jb25maWcuZ2V0KCdsaW5lLWVuZGluZy1zZWxlY3Rvci5kZWZhdWx0TGluZUVuZGluZycpXG4gICAgc3dpdGNoIG9wdGlvbkVvbFxuICAgICAgd2hlbiAnTEYnXG4gICAgICAgIHJldHVybiBsZlxuICAgICAgd2hlbiAnQ1JMRidcbiAgICAgICAgcmV0dXJuIGNybGZcbiAgICAgIHdoZW4gJ09TIERlZmF1bHQnXG4gICAgICAgIHJldHVybiBpZiBwcm9jZXNzLnBsYXRmb3JtIGlzICd3aW4zMicgdGhlbiBjcmxmIGVsc2UgbGZcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGxmXG5cbiAgIyMjXG4gIExpa2UgdGhlIHVuaXggd2hpY2ggdXRpbGl0eS5cblxuICBGaW5kcyB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgYSBzcGVjaWZpZWQgZXhlY3V0YWJsZSBpbiB0aGUgUEFUSCBlbnZpcm9ubWVudCB2YXJpYWJsZS5cbiAgRG9lcyBub3QgY2FjaGUgdGhlIHJlc3VsdHMsXG4gIHNvIGhhc2ggLXIgaXMgbm90IG5lZWRlZCB3aGVuIHRoZSBQQVRIIGNoYW5nZXMuXG4gIFNlZSBodHRwczovL2dpdGh1Yi5jb20vaXNhYWNzL25vZGUtd2hpY2hcbiAgIyMjXG4gIHdoaWNoOiAoZXhlLCBvcHRpb25zID0ge30pIC0+XG4gICAgIyBAZGVwcmVjYXRlKFwiQmVhdXRpZmllci53aGljaCBmdW5jdGlvbiBoYXMgYmVlbiBkZXByZWNhdGVkLiBQbGVhc2UgdXNlIEV4ZWN1dGFibGVzLlwiKVxuICAgIEV4ZWN1dGFibGUud2hpY2goZXhlLCBvcHRpb25zKVxuXG4gICMjI1xuICBSdW4gY29tbWFuZC1saW5lIGludGVyZmFjZSBjb21tYW5kXG4gICMjI1xuICBydW46IChleGVjdXRhYmxlLCBhcmdzLCB7Y3dkLCBpZ25vcmVSZXR1cm5Db2RlLCBoZWxwLCBvblN0ZGlufSA9IHt9KSAtPlxuICAgICMgQGRlcHJlY2F0ZShcIkJlYXV0aWZpZXIucnVuIGZ1bmN0aW9uIGhhcyBiZWVuIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgRXhlY3V0YWJsZXMuXCIpXG4gICAgZXhlID0gbmV3IEV4ZWN1dGFibGUoe1xuICAgICAgbmFtZTogQG5hbWVcbiAgICAgIGhvbWVwYWdlOiBAbGlua1xuICAgICAgaW5zdGFsbGF0aW9uOiBAbGlua1xuICAgICAgY21kOiBleGVjdXRhYmxlXG4gICAgfSlcbiAgICBoZWxwID89IHtcbiAgICAgIHByb2dyYW06IGV4ZWN1dGFibGVcbiAgICAgIGxpbms6IEBsaW5rXG4gICAgICBwYXRoT3B0aW9uOiB1bmRlZmluZWRcbiAgICB9XG4gICAgZXhlLnJ1bihhcmdzLCB7Y3dkLCBpZ25vcmVSZXR1cm5Db2RlLCBoZWxwLCBvblN0ZGlufSlcblxuICAjIyNcbiAgTG9nZ2VyIGluc3RhbmNlXG4gICMjI1xuICBsb2dnZXI6IG51bGxcbiAgIyMjXG4gIEluaXRpYWxpemUgYW5kIGNvbmZpZ3VyZSBMb2dnZXJcbiAgIyMjXG4gIHNldHVwTG9nZ2VyOiAtPlxuICAgIEBsb2dnZXIgPSByZXF1aXJlKCcuLi9sb2dnZXInKShfX2ZpbGVuYW1lKVxuICAgICMgQHZlcmJvc2UoQGxvZ2dlcilcbiAgICAjIE1lcmdlIGxvZ2dlciBtZXRob2RzIGludG8gYmVhdXRpZmllciBjbGFzc1xuICAgIGZvciBrZXksIG1ldGhvZCBvZiBAbG9nZ2VyXG4gICAgICAjIEB2ZXJib3NlKGtleSwgbWV0aG9kKVxuICAgICAgQFtrZXldID0gbWV0aG9kXG4gICAgQHZlcmJvc2UoXCIje0BuYW1lfSBiZWF1dGlmaWVyIGxvZ2dlciBoYXMgYmVlbiBpbml0aWFsaXplZC5cIilcblxuICAjIyNcbiAgQ29uc3RydWN0b3IgdG8gc2V0dXAgYmVhdXRpZmVyXG4gICMjI1xuICBjb25zdHJ1Y3RvcjogKCkgLT5cbiAgICAjIFNldHVwIGxvZ2dlclxuICAgIEBzZXR1cExvZ2dlcigpXG4gICAgIyBIYW5kbGUgZ2xvYmFsIG9wdGlvbnNcbiAgICBpZiBAb3B0aW9ucy5fP1xuICAgICAgZ2xvYmFsT3B0aW9ucyA9IEBvcHRpb25zLl9cbiAgICAgIGRlbGV0ZSBAb3B0aW9ucy5fXG4gICAgICAjIE9ubHkgbWVyZ2UgaWYgZ2xvYmFsT3B0aW9ucyBpcyBhbiBvYmplY3RcbiAgICAgIGlmIHR5cGVvZiBnbG9iYWxPcHRpb25zIGlzIFwib2JqZWN0XCJcbiAgICAgICAgIyBJdGVyYXRlIG92ZXIgYWxsIHN1cHBvcnRlZCBsYW5ndWFnZXNcbiAgICAgICAgZm9yIGxhbmcsIG9wdGlvbnMgb2YgQG9wdGlvbnNcbiAgICAgICAgICAjXG4gICAgICAgICAgaWYgdHlwZW9mIG9wdGlvbnMgaXMgXCJib29sZWFuXCJcbiAgICAgICAgICAgIGlmIG9wdGlvbnMgaXMgdHJ1ZVxuICAgICAgICAgICAgICBAb3B0aW9uc1tsYW5nXSA9IGdsb2JhbE9wdGlvbnNcbiAgICAgICAgICBlbHNlIGlmIHR5cGVvZiBvcHRpb25zIGlzIFwib2JqZWN0XCJcbiAgICAgICAgICAgIEBvcHRpb25zW2xhbmddID0gXy5tZXJnZShnbG9iYWxPcHRpb25zLCBvcHRpb25zKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIEB3YXJuKFwiVW5zdXBwb3J0ZWQgb3B0aW9ucyB0eXBlICN7dHlwZW9mIG9wdGlvbnN9IGZvciBsYW5ndWFnZSAje2xhbmd9OiBcIisgb3B0aW9ucylcbiAgICBAdmVyYm9zZShcIk9wdGlvbnMgZm9yICN7QG5hbWV9OlwiLCBAb3B0aW9ucylcbiAgICAjIFNldCBzdXBwb3J0ZWQgbGFuZ3VhZ2VzXG4gICAgQGxhbmd1YWdlcyA9IF8ua2V5cyhAb3B0aW9ucylcbiJdfQ==
