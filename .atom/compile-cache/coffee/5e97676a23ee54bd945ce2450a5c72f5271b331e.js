
/*
Requires https://github.com/FriendsOfPHP/PHP-CS-Fixer
 */

(function() {
  "use strict";
  var Beautifier, PHPCSFixer, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  module.exports = PHPCSFixer = (function(superClass) {
    extend(PHPCSFixer, superClass);

    function PHPCSFixer() {
      return PHPCSFixer.__super__.constructor.apply(this, arguments);
    }

    PHPCSFixer.prototype.name = 'PHP-CS-Fixer';

    PHPCSFixer.prototype.link = "https://github.com/FriendsOfPHP/PHP-CS-Fixer";

    PHPCSFixer.prototype.executables = [
      {
        name: "PHP",
        cmd: "php",
        homepage: "http://php.net/",
        installation: "http://php.net/manual/en/install.php",
        version: {
          parse: function(text) {
            return text.match(/PHP (\d+\.\d+\.\d+)/)[1];
          }
        }
      }, {
        name: "PHP-CS-Fixer",
        cmd: "php-cs-fixer",
        homepage: "https://github.com/FriendsOfPHP/PHP-CS-Fixer",
        installation: "https://github.com/FriendsOfPHP/PHP-CS-Fixer#installation",
        optional: true,
        version: {
          parse: function(text) {
            try {
              return text.match(/version (.*) by/)[1] + ".0";
            } catch (error) {
              return text.match(/PHP CS Fixer (\d+\.\d+\.\d+)/)[1];
            }
          }
        },
        docker: {
          image: "unibeautify/php-cs-fixer",
          workingDir: "/project"
        }
      }
    ];

    PHPCSFixer.prototype.options = {
      PHP: {
        rules: true,
        cs_fixer_path: true,
        cs_fixer_version: true,
        cs_fixer_config_file: true,
        allow_risky: true,
        level: true,
        fixers: true
      }
    };

    PHPCSFixer.prototype.beautify = function(text, language, options, context) {
      var configFiles, isVersion1, php, phpCsFixer, phpCsFixerOptions, runOptions;
      this.debug('php-cs-fixer', options);
      php = this.exe('php');
      phpCsFixer = this.exe('php-cs-fixer');
      configFiles = ['.php_cs', '.php_cs.dist'];
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = (context != null) && (context.filePath != null) ? this.findFile(path.dirname(context.filePath), configFiles) : void 0;
      }
      if (!options.cs_fixer_config_file) {
        options.cs_fixer_config_file = this.findFile(atom.project.getPaths()[0], configFiles);
      }
      phpCsFixerOptions = ["fix", options.rules ? "--rules=" + options.rules : void 0, options.cs_fixer_config_file ? "--config" : void 0, options.cs_fixer_config_file ? "" + options.cs_fixer_config_file : void 0, options.allow_risky ? "--allow-risky=" + options.allow_risky : void 0, "--using-cache=no"];
      isVersion1 = (phpCsFixer.isInstalled && phpCsFixer.isVersion('1.x')) || (options.cs_fixer_version && phpCsFixer.versionSatisfies(options.cs_fixer_version + ".0.0", '1.x'));
      if (isVersion1) {
        phpCsFixerOptions = ["fix", options.level ? "--level=" + options.level : void 0, options.fixers ? "--fixers=" + options.fixers : void 0, options.cs_fixer_config_file ? "--config-file=" + options.cs_fixer_config_file : void 0];
      }
      runOptions = {
        ignoreReturnCode: true,
        help: {
          link: "https://github.com/FriendsOfPHP/PHP-CS-Fixer"
        }
      };
      if (options.cs_fixer_path) {
        this.deprecateOptionForExecutable("PHP-CS-Fixer", "PHP - PHP-CS-Fixer Path (cs_fixer_path)", "Path");
      }
      return this.Promise.all([options.cs_fixer_path ? this.which(options.cs_fixer_path) : void 0, phpCsFixer.path(), this.tempFile("temp", text, '.php')]).then((function(_this) {
        return function(arg) {
          var customPhpCsFixerPath, finalPhpCsFixerPath, isPhpScript, phpCsFixerPath, tempFile;
          customPhpCsFixerPath = arg[0], phpCsFixerPath = arg[1], tempFile = arg[2];
          finalPhpCsFixerPath = customPhpCsFixerPath && path.isAbsolute(customPhpCsFixerPath) ? customPhpCsFixerPath : phpCsFixerPath;
          _this.verbose('finalPhpCsFixerPath', finalPhpCsFixerPath, phpCsFixerPath, customPhpCsFixerPath);
          isPhpScript = (finalPhpCsFixerPath.indexOf(".phar") !== -1) || (finalPhpCsFixerPath.indexOf(".php") !== -1);
          _this.verbose('isPhpScript', isPhpScript);
          if (!phpCsFixer.isInstalled && finalPhpCsFixerPath && isPhpScript) {
            return php.run([finalPhpCsFixerPath, phpCsFixerOptions, tempFile], runOptions).then(function() {
              return _this.readFile(tempFile);
            });
          } else {
            return phpCsFixer.run([phpCsFixerOptions, tempFile], Object.assign({}, runOptions, {
              cmd: finalPhpCsFixerPath
            })).then(function() {
              return _this.readFile(tempFile);
            });
          }
        };
      })(this));
    };

    return PHPCSFixer;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3BocC1jcy1maXhlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsNEJBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUNiLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFFUCxNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFFckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLEtBRFI7UUFFRSxHQUFBLEVBQUssS0FGUDtRQUdFLFFBQUEsRUFBVSxpQkFIWjtRQUlFLFlBQUEsRUFBYyxzQ0FKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO21CQUFVLElBQUksQ0FBQyxLQUFMLENBQVcscUJBQVgsQ0FBa0MsQ0FBQSxDQUFBO1VBQTVDLENBREE7U0FMWDtPQURXLEVBVVg7UUFDRSxJQUFBLEVBQU0sY0FEUjtRQUVFLEdBQUEsRUFBSyxjQUZQO1FBR0UsUUFBQSxFQUFVLDhDQUhaO1FBSUUsWUFBQSxFQUFjLDJEQUpoQjtRQUtFLFFBQUEsRUFBVSxJQUxaO1FBTUUsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDtBQUNMO3FCQUNFLElBQUksQ0FBQyxLQUFMLENBQVcsaUJBQVgsQ0FBOEIsQ0FBQSxDQUFBLENBQTlCLEdBQW1DLEtBRHJDO2FBQUEsYUFBQTtxQkFHRSxJQUFJLENBQUMsS0FBTCxDQUFXLDhCQUFYLENBQTJDLENBQUEsQ0FBQSxFQUg3Qzs7VUFESyxDQURBO1NBTlg7UUFhRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8sMEJBREQ7VUFFTixVQUFBLEVBQVksVUFGTjtTQWJWO09B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OEI7QUFSMUMiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHBzOi8vZ2l0aHViLmNvbS9GcmllbmRzT2ZQSFAvUEhQLUNTLUZpeGVyXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxucGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFBIUENTRml4ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogJ1BIUC1DUy1GaXhlcidcbiAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJQSFBcIlxuICAgICAgY21kOiBcInBocFwiXG4gICAgICBob21lcGFnZTogXCJodHRwOi8vcGhwLm5ldC9cIlxuICAgICAgaW5zdGFsbGF0aW9uOiBcImh0dHA6Ly9waHAubmV0L21hbnVhbC9lbi9pbnN0YWxsLnBocFwiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT4gdGV4dC5tYXRjaCgvUEhQIChcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgIH1cbiAgICB9XG4gICAge1xuICAgICAgbmFtZTogXCJQSFAtQ1MtRml4ZXJcIlxuICAgICAgY21kOiBcInBocC1jcy1maXhlclwiXG4gICAgICBob21lcGFnZTogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly9naXRodWIuY29tL0ZyaWVuZHNPZlBIUC9QSFAtQ1MtRml4ZXIjaW5zdGFsbGF0aW9uXCJcbiAgICAgIG9wdGlvbmFsOiB0cnVlXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT5cbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHRleHQubWF0Y2goL3ZlcnNpb24gKC4qKSBieS8pWzFdICsgXCIuMFwiXG4gICAgICAgICAgY2F0Y2hcbiAgICAgICAgICAgIHRleHQubWF0Y2goL1BIUCBDUyBGaXhlciAoXFxkK1xcLlxcZCtcXC5cXGQrKS8pWzFdXG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvcGhwLWNzLWZpeGVyXCJcbiAgICAgICAgd29ya2luZ0RpcjogXCIvcHJvamVjdFwiXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczpcbiAgICBQSFA6XG4gICAgICBydWxlczogdHJ1ZVxuICAgICAgY3NfZml4ZXJfcGF0aDogdHJ1ZVxuICAgICAgY3NfZml4ZXJfdmVyc2lvbjogdHJ1ZVxuICAgICAgY3NfZml4ZXJfY29uZmlnX2ZpbGU6IHRydWVcbiAgICAgIGFsbG93X3Jpc2t5OiB0cnVlXG4gICAgICBsZXZlbDogdHJ1ZVxuICAgICAgZml4ZXJzOiB0cnVlXG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucywgY29udGV4dCkgLT5cbiAgICBAZGVidWcoJ3BocC1jcy1maXhlcicsIG9wdGlvbnMpXG4gICAgcGhwID0gQGV4ZSgncGhwJylcbiAgICBwaHBDc0ZpeGVyID0gQGV4ZSgncGhwLWNzLWZpeGVyJylcbiAgICBjb25maWdGaWxlcyA9IFsnLnBocF9jcycsICcucGhwX2NzLmRpc3QnXVxuXG4gICAgIyBGaW5kIGEgY29uZmlnIGZpbGUgaW4gdGhlIHdvcmtpbmcgZGlyZWN0b3J5IGlmIGEgY3VzdG9tIG9uZSB3YXMgbm90IHByb3ZpZGVkXG4gICAgaWYgbm90IG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGVcbiAgICAgIG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGUgPSBpZiBjb250ZXh0PyBhbmQgY29udGV4dC5maWxlUGF0aD8gdGhlbiBAZmluZEZpbGUocGF0aC5kaXJuYW1lKGNvbnRleHQuZmlsZVBhdGgpLCBjb25maWdGaWxlcylcblxuICAgICMgVHJ5IGFnYWluIHRvIGZpbmQgYSBjb25maWcgZmlsZSBpbiB0aGUgcHJvamVjdCByb290XG4gICAgaWYgbm90IG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGVcbiAgICAgIG9wdGlvbnMuY3NfZml4ZXJfY29uZmlnX2ZpbGUgPSBAZmluZEZpbGUoYXRvbS5wcm9qZWN0LmdldFBhdGhzKClbMF0sIGNvbmZpZ0ZpbGVzKVxuXG4gICAgcGhwQ3NGaXhlck9wdGlvbnMgPSBbXG4gICAgICBcImZpeFwiXG4gICAgICBcIi0tcnVsZXM9I3tvcHRpb25zLnJ1bGVzfVwiIGlmIG9wdGlvbnMucnVsZXNcbiAgICAgIFwiLS1jb25maWdcIiBpZiBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXG4gICAgICBcIiN7b3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZX1cIiBpZiBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXG4gICAgICBcIi0tYWxsb3ctcmlza3k9I3tvcHRpb25zLmFsbG93X3Jpc2t5fVwiIGlmIG9wdGlvbnMuYWxsb3dfcmlza3lcbiAgICAgIFwiLS11c2luZy1jYWNoZT1ub1wiXG4gICAgXVxuXG4gICAgaXNWZXJzaW9uMSA9ICgocGhwQ3NGaXhlci5pc0luc3RhbGxlZCBhbmQgcGhwQ3NGaXhlci5pc1ZlcnNpb24oJzEueCcpKSBvciBcXFxuICAgICAgKG9wdGlvbnMuY3NfZml4ZXJfdmVyc2lvbiBhbmQgcGhwQ3NGaXhlci52ZXJzaW9uU2F0aXNmaWVzKFwiI3tvcHRpb25zLmNzX2ZpeGVyX3ZlcnNpb259LjAuMFwiLCAnMS54JykpKVxuICAgIGlmIGlzVmVyc2lvbjFcbiAgICAgIHBocENzRml4ZXJPcHRpb25zID0gW1xuICAgICAgICBcImZpeFwiXG4gICAgICAgIFwiLS1sZXZlbD0je29wdGlvbnMubGV2ZWx9XCIgaWYgb3B0aW9ucy5sZXZlbFxuICAgICAgICBcIi0tZml4ZXJzPSN7b3B0aW9ucy5maXhlcnN9XCIgaWYgb3B0aW9ucy5maXhlcnNcbiAgICAgICAgXCItLWNvbmZpZy1maWxlPSN7b3B0aW9ucy5jc19maXhlcl9jb25maWdfZmlsZX1cIiBpZiBvcHRpb25zLmNzX2ZpeGVyX2NvbmZpZ19maWxlXG4gICAgICBdXG4gICAgcnVuT3B0aW9ucyA9IHtcbiAgICAgIGlnbm9yZVJldHVybkNvZGU6IHRydWVcbiAgICAgIGhlbHA6IHtcbiAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vRnJpZW5kc09mUEhQL1BIUC1DUy1GaXhlclwiXG4gICAgICB9XG4gICAgfVxuXG4gICAgIyBGaW5kIHBocC1jcy1maXhlci5waGFyIHNjcmlwdFxuICAgIGlmIG9wdGlvbnMuY3NfZml4ZXJfcGF0aFxuICAgICAgQGRlcHJlY2F0ZU9wdGlvbkZvckV4ZWN1dGFibGUoXCJQSFAtQ1MtRml4ZXJcIiwgXCJQSFAgLSBQSFAtQ1MtRml4ZXIgUGF0aCAoY3NfZml4ZXJfcGF0aClcIiwgXCJQYXRoXCIpXG5cbiAgICBAUHJvbWlzZS5hbGwoW1xuICAgICAgQHdoaWNoKG9wdGlvbnMuY3NfZml4ZXJfcGF0aCkgaWYgb3B0aW9ucy5jc19maXhlcl9wYXRoXG4gICAgICBwaHBDc0ZpeGVyLnBhdGgoKVxuICAgICAgQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0LCAnLnBocCcpXG4gICAgXSkudGhlbigoW2N1c3RvbVBocENzRml4ZXJQYXRoLCBwaHBDc0ZpeGVyUGF0aCwgdGVtcEZpbGVdKSA9PlxuICAgICAgIyBHZXQgZmlyc3QgdmFsaWQsIGFic29sdXRlIHBhdGhcbiAgICAgIGZpbmFsUGhwQ3NGaXhlclBhdGggPSBpZiBjdXN0b21QaHBDc0ZpeGVyUGF0aCBhbmQgcGF0aC5pc0Fic29sdXRlKGN1c3RvbVBocENzRml4ZXJQYXRoKSB0aGVuIFxcXG4gICAgICAgIGN1c3RvbVBocENzRml4ZXJQYXRoIGVsc2UgcGhwQ3NGaXhlclBhdGhcbiAgICAgIEB2ZXJib3NlKCdmaW5hbFBocENzRml4ZXJQYXRoJywgZmluYWxQaHBDc0ZpeGVyUGF0aCwgcGhwQ3NGaXhlclBhdGgsIGN1c3RvbVBocENzRml4ZXJQYXRoKVxuXG4gICAgICBpc1BocFNjcmlwdCA9IChmaW5hbFBocENzRml4ZXJQYXRoLmluZGV4T2YoXCIucGhhclwiKSBpc250IC0xKSBvciAoZmluYWxQaHBDc0ZpeGVyUGF0aC5pbmRleE9mKFwiLnBocFwiKSBpc250IC0xKVxuICAgICAgQHZlcmJvc2UoJ2lzUGhwU2NyaXB0JywgaXNQaHBTY3JpcHQpXG5cbiAgICAgIGlmIG5vdCBwaHBDc0ZpeGVyLmlzSW5zdGFsbGVkIGFuZCBmaW5hbFBocENzRml4ZXJQYXRoIGFuZCBpc1BocFNjcmlwdFxuICAgICAgICBwaHAucnVuKFtmaW5hbFBocENzRml4ZXJQYXRoLCBwaHBDc0ZpeGVyT3B0aW9ucywgdGVtcEZpbGVdLCBydW5PcHRpb25zKVxuICAgICAgICAgIC50aGVuKD0+XG4gICAgICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICAgICAgKVxuICAgICAgZWxzZVxuICAgICAgICBwaHBDc0ZpeGVyLnJ1bihbcGhwQ3NGaXhlck9wdGlvbnMsIHRlbXBGaWxlXSxcbiAgICAgICAgICBPYmplY3QuYXNzaWduKHt9LCBydW5PcHRpb25zLCB7IGNtZDogZmluYWxQaHBDc0ZpeGVyUGF0aCB9KVxuICAgICAgICApXG4gICAgICAgICAgLnRoZW4oPT5cbiAgICAgICAgICAgIEByZWFkRmlsZSh0ZW1wRmlsZSlcbiAgICAgICAgICApXG4gICAgKVxuIl19
