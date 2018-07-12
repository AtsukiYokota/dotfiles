(function() {
  "use strict";
  var AlignYaml, Beautifier,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = AlignYaml = (function(superClass) {
    extend(AlignYaml, superClass);

    function AlignYaml() {
      return AlignYaml.__super__.constructor.apply(this, arguments);
    }

    AlignYaml.prototype.name = "align-yaml";

    AlignYaml.prototype.link = "https://github.com/jonschlinkert/align-yaml";

    AlignYaml.prototype.options = {
      YAML: {
        padding: true
      }
    };

    AlignYaml.prototype.beautify = function(text, language, options) {
      return new this.Promise(function(resolve, reject) {
        var align, result;
        align = require('align-yaml');
        result = align(text, options.padding);
        return resolve(result);
      });
    };

    return AlignYaml;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2FsaWduLXlhbWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUE7QUFBQSxNQUFBLHFCQUFBO0lBQUE7OztFQUNBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUVOLE9BQUEsR0FBUztNQUNQLElBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxJQUFUO09BRks7Ozt3QkFLVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLGFBQU8sSUFBSSxJQUFDLENBQUEsT0FBTCxDQUFhLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDbEIsWUFBQTtRQUFBLEtBQUEsR0FBUSxPQUFBLENBQVEsWUFBUjtRQUNSLE1BQUEsR0FBUyxLQUFBLENBQU0sSUFBTixFQUFZLE9BQU8sQ0FBQyxPQUFwQjtlQUNULE9BQUEsQ0FBUSxNQUFSO01BSGtCLENBQWI7SUFEQzs7OztLQVQ2QjtBQUh6QyIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBBbGlnbllhbWwgZXh0ZW5kcyBCZWF1dGlmaWVyXG4gIG5hbWU6IFwiYWxpZ24teWFtbFwiXG4gIGxpbms6IFwiaHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvYWxpZ24teWFtbFwiXG5cbiAgb3B0aW9uczoge1xuICAgIFlBTUw6XG4gICAgICBwYWRkaW5nOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIHJldHVybiBuZXcgQFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgLT5cbiAgICAgIGFsaWduID0gcmVxdWlyZSgnYWxpZ24teWFtbCcpXG4gICAgICByZXN1bHQgPSBhbGlnbih0ZXh0LCBvcHRpb25zLnBhZGRpbmcpXG4gICAgICByZXNvbHZlKHJlc3VsdClcbiAgICApXG4iXX0=
