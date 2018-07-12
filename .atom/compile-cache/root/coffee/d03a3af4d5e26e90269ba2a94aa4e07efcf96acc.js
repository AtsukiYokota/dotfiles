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

    JSBeautify.prototype.name = "CSScomb";

    JSBeautify.prototype.link = "https://github.com/csscomb/csscomb.js";

    JSBeautify.prototype.options = {
      _: {
        configPath: true,
        predefinedConfig: true
      },
      CSS: true,
      LESS: true,
      SCSS: true
    };

    JSBeautify.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var CSON, Comb, comb, config, expandHomeDir, processedCSS, project, ref, syntax;
        Comb = require('csscomb');
        expandHomeDir = require('expand-home-dir');
        CSON = require('season');
        config = null;
        try {
          project = (ref = atom.project.getDirectories()) != null ? ref[0] : void 0;
          try {
            config = CSON.readFileSync(project != null ? project.resolve('.csscomb.cson') : void 0);
          } catch (error) {
            config = require(project != null ? project.resolve('.csscomb.json') : void 0);
          }
        } catch (error) {
          try {
            config = CSON.readFileSync(expandHomeDir(options.configPath));
          } catch (error) {
            config = Comb.getConfig(options.predefinedConfig);
          }
        }
        comb = new Comb(config);
        syntax = "css";
        switch (language) {
          case "LESS":
            syntax = "less";
            break;
          case "SCSS":
            syntax = "scss";
            break;
          case "Sass":
            syntax = "sass";
        }
        processedCSS = comb.processString(text, {
          syntax: syntax
        });
        return resolve(processedCSS);
      });
    };

    return JSBeautify;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2Nzc2NvbWIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHNCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt5QkFDckIsSUFBQSxHQUFNOzt5QkFDTixJQUFBLEdBQU07O3lCQUVOLE9BQUEsR0FBUztNQUVQLENBQUEsRUFDRTtRQUFBLFVBQUEsRUFBWSxJQUFaO1FBQ0EsZ0JBQUEsRUFBa0IsSUFEbEI7T0FISztNQUtQLEdBQUEsRUFBSyxJQUxFO01BTVAsSUFBQSxFQUFNLElBTkM7TUFPUCxJQUFBLEVBQU0sSUFQQzs7O3lCQVVULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsYUFBTyxJQUFJLElBQUMsQ0FBQSxPQUFMLENBQWEsU0FBQyxPQUFELEVBQVUsTUFBVjtBQUlsQixZQUFBO1FBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxTQUFSO1FBQ1AsYUFBQSxHQUFnQixPQUFBLENBQVEsaUJBQVI7UUFDaEIsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSO1FBRVAsTUFBQSxHQUFTO0FBQ1Q7VUFDRSxPQUFBLHNEQUF5QyxDQUFBLENBQUE7QUFDekM7WUFDRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFlBQUwsbUJBQWtCLE9BQU8sQ0FBRSxPQUFULENBQWlCLGVBQWpCLFVBQWxCLEVBRFg7V0FBQSxhQUFBO1lBR0UsTUFBQSxHQUFTLE9BQUEsbUJBQVEsT0FBTyxDQUFFLE9BQVQsQ0FBaUIsZUFBakIsVUFBUixFQUhYO1dBRkY7U0FBQSxhQUFBO0FBT0U7WUFDRSxNQUFBLEdBQVMsSUFBSSxDQUFDLFlBQUwsQ0FBa0IsYUFBQSxDQUFjLE9BQU8sQ0FBQyxVQUF0QixDQUFsQixFQURYO1dBQUEsYUFBQTtZQUlFLE1BQUEsR0FBUyxJQUFJLENBQUMsU0FBTCxDQUFlLE9BQU8sQ0FBQyxnQkFBdkIsRUFKWDtXQVBGOztRQWNBLElBQUEsR0FBTyxJQUFJLElBQUosQ0FBUyxNQUFUO1FBR1AsTUFBQSxHQUFTO0FBQ1QsZ0JBQU8sUUFBUDtBQUFBLGVBQ08sTUFEUDtZQUVJLE1BQUEsR0FBUztBQUROO0FBRFAsZUFHTyxNQUhQO1lBSUksTUFBQSxHQUFTO0FBRE47QUFIUCxlQUtPLE1BTFA7WUFNSSxNQUFBLEdBQVM7QUFOYjtRQVFBLFlBQUEsR0FBZSxJQUFJLENBQUMsYUFBTCxDQUFtQixJQUFuQixFQUF5QjtVQUN0QyxNQUFBLEVBQVEsTUFEOEI7U0FBekI7ZUFLZixPQUFBLENBQVEsWUFBUjtNQXhDa0IsQ0FBYjtJQURDOzs7O0tBZDhCO0FBSDFDIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEpTQmVhdXRpZnkgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiQ1NTY29tYlwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2Nzc2NvbWIvY3NzY29tYi5qc1wiXG5cbiAgb3B0aW9uczoge1xuICAgICMgVE9ETzogQWRkIHN1cHBvcnQgZm9yIG9wdGlvbnNcbiAgICBfOlxuICAgICAgY29uZmlnUGF0aDogdHJ1ZVxuICAgICAgcHJlZGVmaW5lZENvbmZpZzogdHJ1ZVxuICAgIENTUzogdHJ1ZVxuICAgIExFU1M6IHRydWVcbiAgICBTQ1NTOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgICMgY29uc29sZS5sb2coJ0NTU0NvbWInLCB0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucylcblxuICAgICAgIyBSZXF1aXJlXG4gICAgICBDb21iID0gcmVxdWlyZSgnY3NzY29tYicpXG4gICAgICBleHBhbmRIb21lRGlyID0gcmVxdWlyZSgnZXhwYW5kLWhvbWUtZGlyJylcbiAgICAgIENTT04gPSByZXF1aXJlKCdzZWFzb24nKVxuXG4gICAgICBjb25maWcgPSBudWxsXG4gICAgICB0cnkgIyBMb2FkIGZyb20gcHJvamVjdCBjb25maWcgZmlsZSwgdGhyb3dpbmcgZXJyb3IgaWYgbmVpdGhlciBleGlzdFxuICAgICAgICBwcm9qZWN0ID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCk/WzBdXG4gICAgICAgIHRyeVxuICAgICAgICAgIGNvbmZpZyA9IENTT04ucmVhZEZpbGVTeW5jKHByb2plY3Q/LnJlc29sdmUgJy5jc3Njb21iLmNzb24nKVxuICAgICAgICBjYXRjaFxuICAgICAgICAgIGNvbmZpZyA9IHJlcXVpcmUocHJvamVjdD8ucmVzb2x2ZSAnLmNzc2NvbWIuanNvbicpXG4gICAgICBjYXRjaFxuICAgICAgICB0cnkgIyBMb2FkIGZyb20gY3VzdG9tIGNvbmZpZ1xuICAgICAgICAgIGNvbmZpZyA9IENTT04ucmVhZEZpbGVTeW5jKGV4cGFuZEhvbWVEaXIgb3B0aW9ucy5jb25maWdQYXRoKVxuICAgICAgICBjYXRjaFxuICAgICAgICAgICMgRmFsbGJhY2sgdG8gW3NlbGVjdGVkXSBDU1Njb21iIHByZWRpZmluZWQgY29uZmlnXG4gICAgICAgICAgY29uZmlnID0gQ29tYi5nZXRDb25maWcob3B0aW9ucy5wcmVkZWZpbmVkQ29uZmlnKVxuICAgICAgIyBjb25zb2xlLmxvZygnY29uZmlnJywgY29uZmlnLCBvcHRpb25zKVxuICAgICAgIyBDb25maWd1cmVcbiAgICAgIGNvbWIgPSBuZXcgQ29tYihjb25maWcpXG5cbiAgICAgICMgRGV0ZXJtaW5lIHN5bnRheCBmcm9tIExhbmd1YWdlXG4gICAgICBzeW50YXggPSBcImNzc1wiICMgRGVmYXVsdFxuICAgICAgc3dpdGNoIGxhbmd1YWdlXG4gICAgICAgIHdoZW4gXCJMRVNTXCJcbiAgICAgICAgICBzeW50YXggPSBcImxlc3NcIlxuICAgICAgICB3aGVuIFwiU0NTU1wiXG4gICAgICAgICAgc3ludGF4ID0gXCJzY3NzXCJcbiAgICAgICAgd2hlbiBcIlNhc3NcIlxuICAgICAgICAgIHN5bnRheCA9IFwic2Fzc1wiXG4gICAgICAjIFVzZVxuICAgICAgcHJvY2Vzc2VkQ1NTID0gY29tYi5wcm9jZXNzU3RyaW5nKHRleHQsIHtcbiAgICAgICAgc3ludGF4OiBzeW50YXhcbiAgICAgIH0pXG4gICAgICAjIGNvbnNvbGUubG9nKCdwcm9jZXNzZWRDU1MnLCBwcm9jZXNzZWRDU1MsIHN5bnRheClcblxuICAgICAgcmVzb2x2ZShwcm9jZXNzZWRDU1MpXG4gICAgKVxuIl19
