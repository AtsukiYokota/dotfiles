(function() {
  "use strict";
  var Beautifier, Checker, JSCSFixer, checker, cliConfig,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  Checker = null;

  cliConfig = null;

  checker = null;

  module.exports = JSCSFixer = (function(superClass) {
    extend(JSCSFixer, superClass);

    function JSCSFixer() {
      return JSCSFixer.__super__.constructor.apply(this, arguments);
    }

    JSCSFixer.prototype.name = "JSCS Fixer";

    JSCSFixer.prototype.link = "https://github.com/jscs-dev/node-jscs/";

    JSCSFixer.prototype.options = {
      JavaScript: false
    };

    JSCSFixer.prototype.beautify = function(text, language, options) {
      this.verbose("JSCS Fixer language " + language);
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var config, editor, err, path, result;
          try {
            if (checker == null) {
              cliConfig = require('jscs/lib/cli-config');
              Checker = require('jscs');
              checker = new Checker();
              checker.registerDefaultRules();
            }
            editor = atom.workspace.getActiveTextEditor();
            path = editor != null ? editor.getPath() : void 0;
            config = path != null ? cliConfig.load(void 0, atom.project.relativizePath(path)[0]) : void 0;
            if (config == null) {
              throw new Error("No JSCS config found.");
            }
            checker.configure(config);
            result = checker.fixString(text, path);
            if (result.errors.getErrorCount() > 0) {
              _this.error(result.errors.getErrorList().reduce(function(res, err) {
                return res + "<br> Line " + err.line + ": " + err.message;
              }, "JSCS Fixer error:"));
            }
            return resolve(result.output);
          } catch (error) {
            err = error;
            _this.error("JSCS Fixer error: " + err);
            return reject(err);
          }
        };
      })(this));
    };

    return JSCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2pzY3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLGtEQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixPQUFBLEdBQVU7O0VBQ1YsU0FBQSxHQUFZOztFQUNaLE9BQUEsR0FBVTs7RUFFVixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUVOLE9BQUEsR0FBUztNQUNQLFVBQUEsRUFBWSxLQURMOzs7d0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7TUFDUixJQUFDLENBQUEsT0FBRCxDQUFTLHNCQUFBLEdBQXVCLFFBQWhDO0FBQ0EsYUFBTyxJQUFJLElBQUMsQ0FBQSxPQUFMLENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQsRUFBVSxNQUFWO0FBQ2xCLGNBQUE7QUFBQTtZQUNFLElBQUksZUFBSjtjQUNFLFNBQUEsR0FBWSxPQUFBLENBQVEscUJBQVI7Y0FDWixPQUFBLEdBQVUsT0FBQSxDQUFRLE1BQVI7Y0FDVixPQUFBLEdBQVUsSUFBSSxPQUFKLENBQUE7Y0FDVixPQUFPLENBQUMsb0JBQVIsQ0FBQSxFQUpGOztZQUtBLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFmLENBQUE7WUFDVCxJQUFBLEdBQVUsY0FBSCxHQUFnQixNQUFNLENBQUMsT0FBUCxDQUFBLENBQWhCLEdBQXNDO1lBQzdDLE1BQUEsR0FBWSxZQUFILEdBQWMsU0FBUyxDQUFDLElBQVYsQ0FBZSxNQUFmLEVBQTBCLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYixDQUE0QixJQUE1QixDQUFrQyxDQUFBLENBQUEsQ0FBNUQsQ0FBZCxHQUFtRjtZQUM1RixJQUFJLGNBQUo7QUFDRSxvQkFBTSxJQUFJLEtBQUosQ0FBVSx1QkFBVixFQURSOztZQUVBLE9BQU8sQ0FBQyxTQUFSLENBQWtCLE1BQWxCO1lBQ0EsTUFBQSxHQUFTLE9BQU8sQ0FBQyxTQUFSLENBQWtCLElBQWxCLEVBQXdCLElBQXhCO1lBQ1QsSUFBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWQsQ0FBQSxDQUFBLEdBQWdDLENBQW5DO2NBQ0UsS0FBQyxDQUFBLEtBQUQsQ0FBTyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQWQsQ0FBQSxDQUE0QixDQUFDLE1BQTdCLENBQW9DLFNBQUMsR0FBRCxFQUFNLEdBQU47dUJBQ3RDLEdBQUQsR0FBSyxZQUFMLEdBQWlCLEdBQUcsQ0FBQyxJQUFyQixHQUEwQixJQUExQixHQUE4QixHQUFHLENBQUM7Y0FESyxDQUFwQyxFQUVMLG1CQUZLLENBQVAsRUFERjs7bUJBS0EsT0FBQSxDQUFRLE1BQU0sQ0FBQyxNQUFmLEVBbEJGO1dBQUEsYUFBQTtZQW9CTTtZQUNKLEtBQUMsQ0FBQSxLQUFELENBQU8sb0JBQUEsR0FBcUIsR0FBNUI7bUJBQ0EsTUFBQSxDQUFPLEdBQVAsRUF0QkY7O1FBRGtCO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFiO0lBRkM7Ozs7S0FSNkI7QUFQekMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbkNoZWNrZXIgPSBudWxsXG5jbGlDb25maWcgPSBudWxsXG5jaGVja2VyID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEpTQ1NGaXhlciBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJKU0NTIEZpeGVyXCJcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vanNjcy1kZXYvbm9kZS1qc2NzL1wiXG5cbiAgb3B0aW9uczoge1xuICAgIEphdmFTY3JpcHQ6IGZhbHNlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEB2ZXJib3NlKFwiSlNDUyBGaXhlciBsYW5ndWFnZSAje2xhbmd1YWdlfVwiKVxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIHRyeVxuICAgICAgICBpZiAhY2hlY2tlcj9cbiAgICAgICAgICBjbGlDb25maWcgPSByZXF1aXJlICdqc2NzL2xpYi9jbGktY29uZmlnJ1xuICAgICAgICAgIENoZWNrZXIgPSByZXF1aXJlICdqc2NzJ1xuICAgICAgICAgIGNoZWNrZXIgPSBuZXcgQ2hlY2tlcigpXG4gICAgICAgICAgY2hlY2tlci5yZWdpc3RlckRlZmF1bHRSdWxlcygpXG4gICAgICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgICBwYXRoID0gaWYgZWRpdG9yPyB0aGVuIGVkaXRvci5nZXRQYXRoKCkgZWxzZSB1bmRlZmluZWRcbiAgICAgICAgY29uZmlnID0gaWYgcGF0aD8gdGhlbiBjbGlDb25maWcubG9hZCh1bmRlZmluZWQsIGF0b20ucHJvamVjdC5yZWxhdGl2aXplUGF0aChwYXRoKVswXSkgZWxzZSB1bmRlZmluZWRcbiAgICAgICAgaWYgIWNvbmZpZz9cbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyBKU0NTIGNvbmZpZyBmb3VuZC5cIilcbiAgICAgICAgY2hlY2tlci5jb25maWd1cmUoY29uZmlnKVxuICAgICAgICByZXN1bHQgPSBjaGVja2VyLmZpeFN0cmluZyh0ZXh0LCBwYXRoKVxuICAgICAgICBpZiByZXN1bHQuZXJyb3JzLmdldEVycm9yQ291bnQoKSA+IDBcbiAgICAgICAgICBAZXJyb3IocmVzdWx0LmVycm9ycy5nZXRFcnJvckxpc3QoKS5yZWR1Y2UoKHJlcywgZXJyKSAtPlxuICAgICAgICAgICAgXCIje3Jlc308YnI+IExpbmUgI3tlcnIubGluZX06ICN7ZXJyLm1lc3NhZ2V9XCJcbiAgICAgICAgICAsIFwiSlNDUyBGaXhlciBlcnJvcjpcIikpXG5cbiAgICAgICAgcmVzb2x2ZSByZXN1bHQub3V0cHV0XG5cbiAgICAgIGNhdGNoIGVyclxuICAgICAgICBAZXJyb3IoXCJKU0NTIEZpeGVyIGVycm9yOiAje2Vycn1cIilcbiAgICAgICAgcmVqZWN0KGVycilcblxuICAgIClcbiJdfQ==
