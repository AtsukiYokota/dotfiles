(function() {
  "use strict";
  var Beautifier, TypeScriptFormatter,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = TypeScriptFormatter = (function(superClass) {
    extend(TypeScriptFormatter, superClass);

    function TypeScriptFormatter() {
      return TypeScriptFormatter.__super__.constructor.apply(this, arguments);
    }

    TypeScriptFormatter.prototype.name = "TypeScript Formatter";

    TypeScriptFormatter.prototype.link = "https://github.com/vvakame/typescript-formatter";

    TypeScriptFormatter.prototype.options = {
      TypeScript: {
        indent_with_tabs: true,
        tab_width: true,
        indent_size: true
      },
      TSX: {
        indent_with_tabs: true,
        tab_width: true,
        indent_size: true
      }
    };

    TypeScriptFormatter.prototype.beautify = function(text, language, options) {
      return new this.Promise((function(_this) {
        return function(resolve, reject) {
          var e, fileName, format, formatterUtils, opts, result;
          try {
            format = require("typescript-formatter/lib/formatter").format;
            formatterUtils = require("typescript-formatter/lib/utils");
            opts = formatterUtils.createDefaultFormatCodeSettings();
            if (options.indent_with_tabs) {
              opts.convertTabsToSpaces = false;
            } else {
              opts.tabSize = options.tab_width || options.indent_size;
              opts.indentSize = options.indent_size;
              opts.indentStyle = 'space';
            }
            if (language === "TSX") {
              fileName = 'test.tsx';
            } else {
              fileName = '';
            }
            _this.verbose('typescript', text, opts);
            result = format(fileName, text, opts);
            _this.verbose(result);
            return resolve(result);
          } catch (error) {
            e = error;
            return reject(e);
          }
        };
      })(this));
    };

    return TypeScriptFormatter;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3R5cGVzY3JpcHQtZm9ybWF0dGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtFQUFBO0FBQUEsTUFBQSwrQkFBQTtJQUFBOzs7RUFDQSxVQUFBLEdBQWEsT0FBQSxDQUFRLGNBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7a0NBQ3JCLElBQUEsR0FBTTs7a0NBQ04sSUFBQSxHQUFNOztrQ0FDTixPQUFBLEdBQVM7TUFDUCxVQUFBLEVBQ0U7UUFBQSxnQkFBQSxFQUFrQixJQUFsQjtRQUNBLFNBQUEsRUFBVyxJQURYO1FBRUEsV0FBQSxFQUFhLElBRmI7T0FGSztNQUtQLEdBQUEsRUFDRTtRQUFBLGdCQUFBLEVBQWtCLElBQWxCO1FBQ0EsU0FBQSxFQUFXLElBRFg7UUFFQSxXQUFBLEVBQWEsSUFGYjtPQU5LOzs7a0NBV1QsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixhQUFPLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFFbEIsY0FBQTtBQUFBO1lBQ0UsTUFBQSxHQUFTLE9BQUEsQ0FBUSxvQ0FBUixDQUE2QyxDQUFDO1lBQ3ZELGNBQUEsR0FBaUIsT0FBQSxDQUFRLGdDQUFSO1lBR2pCLElBQUEsR0FBTyxjQUFjLENBQUMsK0JBQWYsQ0FBQTtZQUVQLElBQUcsT0FBTyxDQUFDLGdCQUFYO2NBQ0UsSUFBSSxDQUFDLG1CQUFMLEdBQTJCLE1BRDdCO2FBQUEsTUFBQTtjQUdFLElBQUksQ0FBQyxPQUFMLEdBQWUsT0FBTyxDQUFDLFNBQVIsSUFBcUIsT0FBTyxDQUFDO2NBQzVDLElBQUksQ0FBQyxVQUFMLEdBQWtCLE9BQU8sQ0FBQztjQUMxQixJQUFJLENBQUMsV0FBTCxHQUFtQixRQUxyQjs7WUFPQSxJQUFHLFFBQUEsS0FBWSxLQUFmO2NBQ0UsUUFBQSxHQUFXLFdBRGI7YUFBQSxNQUFBO2NBR0UsUUFBQSxHQUFXLEdBSGI7O1lBS0EsS0FBQyxDQUFBLE9BQUQsQ0FBUyxZQUFULEVBQXVCLElBQXZCLEVBQTZCLElBQTdCO1lBQ0EsTUFBQSxHQUFTLE1BQUEsQ0FBTyxRQUFQLEVBQWlCLElBQWpCLEVBQXVCLElBQXZCO1lBQ1QsS0FBQyxDQUFBLE9BQUQsQ0FBUyxNQUFUO21CQUNBLE9BQUEsQ0FBUSxNQUFSLEVBdEJGO1dBQUEsYUFBQTtZQXVCTTtBQUNKLG1CQUFPLE1BQUEsQ0FBTyxDQUFQLEVBeEJUOztRQUZrQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBYjtJQURDOzs7O0tBZHVDO0FBSG5EIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFR5cGVTY3JpcHRGb3JtYXR0ZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiVHlwZVNjcmlwdCBGb3JtYXR0ZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS92dmFrYW1lL3R5cGVzY3JpcHQtZm9ybWF0dGVyXCJcbiAgb3B0aW9uczoge1xuICAgIFR5cGVTY3JpcHQ6XG4gICAgICBpbmRlbnRfd2l0aF90YWJzOiB0cnVlXG4gICAgICB0YWJfd2lkdGg6IHRydWVcbiAgICAgIGluZGVudF9zaXplOiB0cnVlXG4gICAgVFNYOlxuICAgICAgaW5kZW50X3dpdGhfdGFiczogdHJ1ZVxuICAgICAgdGFiX3dpZHRoOiB0cnVlXG4gICAgICBpbmRlbnRfc2l6ZTogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICByZXR1cm4gbmV3IEBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+XG5cbiAgICAgIHRyeVxuICAgICAgICBmb3JtYXQgPSByZXF1aXJlKFwidHlwZXNjcmlwdC1mb3JtYXR0ZXIvbGliL2Zvcm1hdHRlclwiKS5mb3JtYXRcbiAgICAgICAgZm9ybWF0dGVyVXRpbHMgPSByZXF1aXJlKFwidHlwZXNjcmlwdC1mb3JtYXR0ZXIvbGliL3V0aWxzXCIpXG4gICAgICAgICMgQHZlcmJvc2UoJ2Zvcm1hdCcsIGZvcm1hdCwgZm9ybWF0dGVyVXRpbHMpXG5cbiAgICAgICAgb3B0cyA9IGZvcm1hdHRlclV0aWxzLmNyZWF0ZURlZmF1bHRGb3JtYXRDb2RlU2V0dGluZ3MoKVxuXG4gICAgICAgIGlmIG9wdGlvbnMuaW5kZW50X3dpdGhfdGFic1xuICAgICAgICAgIG9wdHMuY29udmVydFRhYnNUb1NwYWNlcyA9IGZhbHNlXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcHRzLnRhYlNpemUgPSBvcHRpb25zLnRhYl93aWR0aCBvciBvcHRpb25zLmluZGVudF9zaXplXG4gICAgICAgICAgb3B0cy5pbmRlbnRTaXplID0gb3B0aW9ucy5pbmRlbnRfc2l6ZVxuICAgICAgICAgIG9wdHMuaW5kZW50U3R5bGUgPSAnc3BhY2UnXG5cbiAgICAgICAgaWYgbGFuZ3VhZ2UgaXMgXCJUU1hcIlxuICAgICAgICAgIGZpbGVOYW1lID0gJ3Rlc3QudHN4J1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZmlsZU5hbWUgPSAnJ1xuXG4gICAgICAgIEB2ZXJib3NlKCd0eXBlc2NyaXB0JywgdGV4dCwgb3B0cylcbiAgICAgICAgcmVzdWx0ID0gZm9ybWF0KGZpbGVOYW1lLCB0ZXh0LCBvcHRzKVxuICAgICAgICBAdmVyYm9zZShyZXN1bHQpXG4gICAgICAgIHJlc29sdmUgcmVzdWx0XG4gICAgICBjYXRjaCBlXG4gICAgICAgIHJldHVybiByZWplY3QoZSlcblxuICAgIClcbiJdfQ==
