
/*
Requires terraform installed
 */

(function() {
  "use strict";
  var Beautifier, Terraformfmt,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Terraformfmt = (function(superClass) {
    extend(Terraformfmt, superClass);

    function Terraformfmt() {
      return Terraformfmt.__super__.constructor.apply(this, arguments);
    }

    Terraformfmt.prototype.name = "terraformfmt";

    Terraformfmt.prototype.link = "https://www.terraform.io/docs/commands/fmt.html";

    Terraformfmt.prototype.options = {
      Terraform: false
    };

    Terraformfmt.prototype.executables = [
      {
        name: "Terraform",
        cmd: "terraform",
        homepage: "https://www.terraform.io",
        installation: "https://www.terraform.io",
        version: {
          parse: function(text) {
            return text.match(/Terraform v(\d+\.\d+\.\d+)/)[1];
          }
        },
        docker: {
          image: "hashicorp/terraform"
        }
      }
    ];

    Terraformfmt.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.exe("terraform").run(["fmt", tempFile = this.tempFile("input", text)]).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return Terraformfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3RlcnJhZm9ybWZtdC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFJQTtBQUpBLE1BQUEsd0JBQUE7SUFBQTs7O0VBS0EsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7OzJCQUNyQixJQUFBLEdBQU07OzJCQUNOLElBQUEsR0FBTTs7MkJBRU4sT0FBQSxHQUFTO01BQ1AsU0FBQSxFQUFXLEtBREo7OzsyQkFJVCxXQUFBLEdBQWE7TUFDWDtRQUNFLElBQUEsRUFBTSxXQURSO1FBRUUsR0FBQSxFQUFLLFdBRlA7UUFHRSxRQUFBLEVBQVUsMEJBSFo7UUFJRSxZQUFBLEVBQWMsMEJBSmhCO1FBS0UsT0FBQSxFQUFTO1VBQ1AsS0FBQSxFQUFPLFNBQUMsSUFBRDttQkFBVSxJQUFJLENBQUMsS0FBTCxDQUFXLDRCQUFYLENBQXlDLENBQUEsQ0FBQTtVQUFuRCxDQURBO1NBTFg7UUFRRSxNQUFBLEVBQVE7VUFDTixLQUFBLEVBQU8scUJBREQ7U0FSVjtPQURXOzs7MkJBZWIsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakI7QUFDUixVQUFBO2FBQUEsSUFBQyxDQUFBLEdBQUQsQ0FBSyxXQUFMLENBQWlCLENBQUMsR0FBbEIsQ0FBc0IsQ0FDcEIsS0FEb0IsRUFFcEIsUUFBQSxHQUFXLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQUZTLENBQXRCLENBSUUsQ0FBQyxJQUpILENBSVEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUNKLEtBQUMsQ0FBQSxRQUFELENBQVUsUUFBVjtRQURJO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUpSO0lBRFE7Ozs7S0F2QmdDO0FBUDVDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyB0ZXJyYWZvcm0gaW5zdGFsbGVkXG4jIyNcblxuXCJ1c2Ugc3RyaWN0XCJcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFRlcnJhZm9ybWZtdCBleHRlbmRzIEJlYXV0aWZpZXJcbiAgbmFtZTogXCJ0ZXJyYWZvcm1mbXRcIlxuICBsaW5rOiBcImh0dHBzOi8vd3d3LnRlcnJhZm9ybS5pby9kb2NzL2NvbW1hbmRzL2ZtdC5odG1sXCJcblxuICBvcHRpb25zOiB7XG4gICAgVGVycmFmb3JtOiBmYWxzZVxuICB9XG5cbiAgZXhlY3V0YWJsZXM6IFtcbiAgICB7XG4gICAgICBuYW1lOiBcIlRlcnJhZm9ybVwiXG4gICAgICBjbWQ6IFwidGVycmFmb3JtXCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vd3d3LnRlcnJhZm9ybS5pb1wiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly93d3cudGVycmFmb3JtLmlvXCJcbiAgICAgIHZlcnNpb246IHtcbiAgICAgICAgcGFyc2U6ICh0ZXh0KSAtPiB0ZXh0Lm1hdGNoKC9UZXJyYWZvcm0gdihcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgIH1cbiAgICAgIGRvY2tlcjoge1xuICAgICAgICBpbWFnZTogXCJoYXNoaWNvcnAvdGVycmFmb3JtXCJcbiAgICAgIH1cbiAgICB9XG4gIF1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBleGUoXCJ0ZXJyYWZvcm1cIikucnVuKFtcbiAgICAgIFwiZm10XCJcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwiaW5wdXRcIiwgdGV4dClcbiAgICAgIF0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICApXG4iXX0=
