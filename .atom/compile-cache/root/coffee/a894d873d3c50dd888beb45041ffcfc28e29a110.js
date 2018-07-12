
/*
Requires https://github.com/commercialhaskell/hindent
 */

(function() {
  "use strict";
  var Beautifier, Hindent,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  module.exports = Hindent = (function(superClass) {
    extend(Hindent, superClass);

    function Hindent() {
      return Hindent.__super__.constructor.apply(this, arguments);
    }

    Hindent.prototype.name = "hindent";

    Hindent.prototype.link = "https://github.com/commercialhaskell/hindent";

    Hindent.prototype.isPreInstalled = false;

    Hindent.prototype.options = {
      Haskell: false
    };

    Hindent.prototype.beautify = function(text, language, options) {
      var tempFile;
      return this.run("hindent", [tempFile = this.tempFile("temp", text)], {
        help: {
          link: "https://github.com/commercialhaskell/hindent"
        }
      }).then((function(_this) {
        return function() {
          return _this.readFile(tempFile);
        };
      })(this));
    };

    return Hindent;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL2hpbmRlbnQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLG1CQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixNQUFNLENBQUMsT0FBUCxHQUF1Qjs7Ozs7OztzQkFDckIsSUFBQSxHQUFNOztzQkFDTixJQUFBLEdBQU07O3NCQUNOLGNBQUEsR0FBZ0I7O3NCQUVoQixPQUFBLEdBQVM7TUFDUCxPQUFBLEVBQVMsS0FERjs7O3NCQUlULFFBQUEsR0FBVSxTQUFDLElBQUQsRUFBTyxRQUFQLEVBQWlCLE9BQWpCO0FBQ1IsVUFBQTthQUFBLElBQUMsQ0FBQSxHQUFELENBQUssU0FBTCxFQUFnQixDQUNkLFFBQUEsR0FBVyxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVYsRUFBa0IsSUFBbEIsQ0FERyxDQUFoQixFQUVLO1FBQ0QsSUFBQSxFQUFNO1VBQ0osSUFBQSxFQUFNLDhDQURGO1NBREw7T0FGTCxDQU9FLENBQUMsSUFQSCxDQU9RLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFDSixLQUFDLENBQUEsUUFBRCxDQUFVLFFBQVY7UUFESTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FQUjtJQURROzs7O0tBVDJCO0FBUHZDIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5SZXF1aXJlcyBodHRwczovL2dpdGh1Yi5jb20vY29tbWVyY2lhbGhhc2tlbGwvaGluZGVudFxuIyMjXG5cblwidXNlIHN0cmljdFwiXG5CZWF1dGlmaWVyID0gcmVxdWlyZSgnLi9iZWF1dGlmaWVyJylcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIaW5kZW50IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcImhpbmRlbnRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9jb21tZXJjaWFsaGFza2VsbC9oaW5kZW50XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIEhhc2tlbGw6IGZhbHNlXG4gIH1cblxuICBiZWF1dGlmeTogKHRleHQsIGxhbmd1YWdlLCBvcHRpb25zKSAtPlxuICAgIEBydW4oXCJoaW5kZW50XCIsIFtcbiAgICAgIHRlbXBGaWxlID0gQHRlbXBGaWxlKFwidGVtcFwiLCB0ZXh0KVxuICAgICAgXSwge1xuICAgICAgICBoZWxwOiB7XG4gICAgICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vY29tbWVyY2lhbGhhc2tlbGwvaGluZGVudFwiXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAudGhlbig9PlxuICAgICAgICBAcmVhZEZpbGUodGVtcEZpbGUpXG4gICAgICApXG4iXX0=
