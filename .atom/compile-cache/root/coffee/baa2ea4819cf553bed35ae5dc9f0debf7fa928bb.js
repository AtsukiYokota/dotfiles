
/*
Requires https://github.com/OCamlPro/ocp-indent
 */

(function() {
  "use strict";
  var Beautifier, OCPIndent,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = OCPIndent = (function(superClass) {
    extend(OCPIndent, superClass);

    function OCPIndent() {
      return OCPIndent.__super__.constructor.apply(this, arguments);
    }

    OCPIndent.prototype.name = "ocp-indent";

    OCPIndent.prototype.link = "https://www.typerex.org/ocp-indent.html";

    OCPIndent.prototype.executables = [
      {
        name: "ocp-indent",
        cmd: "ocp-indent",
        homepage: "https://www.typerex.org/ocp-indent.html",
        installation: "https://www.typerex.org/ocp-indent.html#installation",
        version: {
          parse: function(text) {
            try {
              return text.match(/(\d+\.\d+\.\d+)/)[1];
            } catch (error) {
              return text.match(/(\d+\.\d+)/)[1] + ".0";
            }
          }
        },
        docker: {
          image: "unibeautify/ocp-indent"
        }
      }
    ];

    OCPIndent.prototype.options = {
      OCaml: true
    };

    OCPIndent.prototype.beautify = function(text, language, options) {
      return this.run("ocp-indent", [this.tempFile("input", text)], {
        help: {
          link: "https://www.typerex.org/ocp-indent.html"
        }
      });
    };

    return OCPIndent;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL29jcC1pbmRlbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLHFCQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7Ozt3QkFDckIsSUFBQSxHQUFNOzt3QkFDTixJQUFBLEdBQU07O3dCQUNOLFdBQUEsR0FBYTtNQUNYO1FBQ0UsSUFBQSxFQUFNLFlBRFI7UUFFRSxHQUFBLEVBQUssWUFGUDtRQUdFLFFBQUEsRUFBVSx5Q0FIWjtRQUlFLFlBQUEsRUFBYyxzREFKaEI7UUFLRSxPQUFBLEVBQVM7VUFDUCxLQUFBLEVBQU8sU0FBQyxJQUFEO0FBQ0w7cUJBQ0UsSUFBSSxDQUFDLEtBQUwsQ0FBVyxpQkFBWCxDQUE4QixDQUFBLENBQUEsRUFEaEM7YUFBQSxhQUFBO3FCQUdFLElBQUksQ0FBQyxLQUFMLENBQVcsWUFBWCxDQUF5QixDQUFBLENBQUEsQ0FBekIsR0FBOEIsS0FIaEM7O1VBREssQ0FEQTtTQUxYO1FBWUUsTUFBQSxFQUFRO1VBQ04sS0FBQSxFQUFPLHdCQUREO1NBWlY7T0FEVzs7O3dCQW1CYixPQUFBLEdBQVM7TUFDUCxLQUFBLEVBQU8sSUFEQTs7O3dCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSyxZQUFMLEVBQW1CLENBQ2pCLElBQUMsQ0FBQSxRQUFELENBQVUsT0FBVixFQUFtQixJQUFuQixDQURpQixDQUFuQixFQUVLO1FBQ0QsSUFBQSxFQUFNO1VBQ0osSUFBQSxFQUFNLHlDQURGO1NBREw7T0FGTDtJQURROzs7O0tBMUI2QjtBQVB6QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL09DYW1sUHJvL29jcC1pbmRlbnRcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgT0NQSW5kZW50IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcIm9jcC1pbmRlbnRcIlxuICBsaW5rOiBcImh0dHBzOi8vd3d3LnR5cGVyZXgub3JnL29jcC1pbmRlbnQuaHRtbFwiXG4gIGV4ZWN1dGFibGVzOiBbXG4gICAge1xuICAgICAgbmFtZTogXCJvY3AtaW5kZW50XCJcbiAgICAgIGNtZDogXCJvY3AtaW5kZW50XCJcbiAgICAgIGhvbWVwYWdlOiBcImh0dHBzOi8vd3d3LnR5cGVyZXgub3JnL29jcC1pbmRlbnQuaHRtbFwiXG4gICAgICBpbnN0YWxsYXRpb246IFwiaHR0cHM6Ly93d3cudHlwZXJleC5vcmcvb2NwLWluZGVudC5odG1sI2luc3RhbGxhdGlvblwiXG4gICAgICB2ZXJzaW9uOiB7XG4gICAgICAgIHBhcnNlOiAodGV4dCkgLT5cbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIHRleHQubWF0Y2goLyhcXGQrXFwuXFxkK1xcLlxcZCspLylbMV1cbiAgICAgICAgICBjYXRjaFxuICAgICAgICAgICAgdGV4dC5tYXRjaCgvKFxcZCtcXC5cXGQrKS8pWzFdICsgXCIuMFwiXG4gICAgICB9XG4gICAgICBkb2NrZXI6IHtcbiAgICAgICAgaW1hZ2U6IFwidW5pYmVhdXRpZnkvb2NwLWluZGVudFwiXG4gICAgICB9XG4gICAgfVxuICBdXG5cbiAgb3B0aW9uczoge1xuICAgIE9DYW1sOiB0cnVlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJvY3AtaW5kZW50XCIsIFtcbiAgICAgIEB0ZW1wRmlsZShcImlucHV0XCIsIHRleHQpXG4gICAgICBdLCB7XG4gICAgICAgIGhlbHA6IHtcbiAgICAgICAgICBsaW5rOiBcImh0dHBzOi8vd3d3LnR5cGVyZXgub3JnL29jcC1pbmRlbnQuaHRtbFwiXG4gICAgICAgIH1cbiAgICAgIH0pIl19
