
/*
Requires https://github.com/rust-lang-nursery/rustfmt
 */

(function() {
  "use strict";
  var Beautifier, Rustfmt, path, versionCheckState,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Beautifier = require('./beautifier');

  path = require('path');

  versionCheckState = false;

  module.exports = Rustfmt = (function(superClass) {
    extend(Rustfmt, superClass);

    function Rustfmt() {
      return Rustfmt.__super__.constructor.apply(this, arguments);
    }

    Rustfmt.prototype.name = "rustfmt";

    Rustfmt.prototype.link = "https://github.com/rust-lang-nursery/rustfmt";

    Rustfmt.prototype.isPreInstalled = false;

    Rustfmt.prototype.options = {
      Rust: true
    };

    Rustfmt.prototype.beautify = function(text, language, options, context) {
      var cwd, help, p, program;
      cwd = context.filePath && path.dirname(context.filePath);
      program = options.rustfmt_path || "rustfmt";
      help = {
        link: "https://github.com/rust-lang-nursery/rustfmt",
        program: "rustfmt",
        pathOption: "Rust - Rustfmt Path"
      };
      p = versionCheckState === program ? this.Promise.resolve() : this.run(program, ["--version"], {
        help: help
      }).then(function(stdout) {
        if (/^0\.(?:[0-4]\.[0-9])(?!-nightly)/.test(stdout.trim())) {
          versionCheckState = false;
          throw new Error("rustfmt version 0.5.0 or newer required");
        } else {
          versionCheckState = program;
          return void 0;
        }
      });
      return p.then((function(_this) {
        return function() {
          return _this.run(program, [], {
            cwd: cwd,
            help: help,
            onStdin: function(stdin) {
              return stdin.end(text);
            }
          });
        };
      })(this));
    };

    return Rustfmt;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3J1c3RmbXQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0VBSUE7QUFKQSxNQUFBLDRDQUFBO0lBQUE7OztFQUtBLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFDYixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsaUJBQUEsR0FBb0I7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQXVCOzs7Ozs7O3NCQUNyQixJQUFBLEdBQU07O3NCQUNOLElBQUEsR0FBTTs7c0JBQ04sY0FBQSxHQUFnQjs7c0JBRWhCLE9BQUEsR0FBUztNQUNQLElBQUEsRUFBTSxJQURDOzs7c0JBSVQsUUFBQSxHQUFVLFNBQUMsSUFBRCxFQUFPLFFBQVAsRUFBaUIsT0FBakIsRUFBMEIsT0FBMUI7QUFDUixVQUFBO01BQUEsR0FBQSxHQUFNLE9BQU8sQ0FBQyxRQUFSLElBQXFCLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBTyxDQUFDLFFBQXJCO01BQzNCLE9BQUEsR0FBVSxPQUFPLENBQUMsWUFBUixJQUF3QjtNQUNsQyxJQUFBLEdBQU87UUFDTCxJQUFBLEVBQU0sOENBREQ7UUFFTCxPQUFBLEVBQVMsU0FGSjtRQUdMLFVBQUEsRUFBWSxxQkFIUDs7TUFTUCxDQUFBLEdBQU8saUJBQUEsS0FBcUIsT0FBeEIsR0FDRixJQUFDLENBQUEsT0FBTyxDQUFDLE9BQVQsQ0FBQSxDQURFLEdBR0YsSUFBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsQ0FBQyxXQUFELENBQWQsRUFBNkI7UUFBQSxJQUFBLEVBQU0sSUFBTjtPQUE3QixDQUNFLENBQUMsSUFESCxDQUNRLFNBQUMsTUFBRDtRQUNKLElBQUcsa0NBQWtDLENBQUMsSUFBbkMsQ0FBd0MsTUFBTSxDQUFDLElBQVAsQ0FBQSxDQUF4QyxDQUFIO1VBQ0UsaUJBQUEsR0FBb0I7QUFDcEIsZ0JBQU0sSUFBSSxLQUFKLENBQVUseUNBQVYsRUFGUjtTQUFBLE1BQUE7VUFJRSxpQkFBQSxHQUFvQjtpQkFDcEIsT0FMRjs7TUFESSxDQURSO2FBVUYsQ0FBQyxDQUFDLElBQUYsQ0FBTyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQ0wsS0FBQyxDQUFBLEdBQUQsQ0FBSyxPQUFMLEVBQWMsRUFBZCxFQUFrQjtZQUNoQixHQUFBLEVBQUssR0FEVztZQUVoQixJQUFBLEVBQU0sSUFGVTtZQUdoQixPQUFBLEVBQVMsU0FBQyxLQUFEO3FCQUNQLEtBQUssQ0FBQyxHQUFOLENBQVUsSUFBVjtZQURPLENBSE87V0FBbEI7UUFESztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBUDtJQXpCUTs7OztLQVQyQjtBQVZ2QyIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuUmVxdWlyZXMgaHR0cHM6Ly9naXRodWIuY29tL3J1c3QtbGFuZy1udXJzZXJ5L3J1c3RmbXRcbiMjI1xuXG5cInVzZSBzdHJpY3RcIlxuQmVhdXRpZmllciA9IHJlcXVpcmUoJy4vYmVhdXRpZmllcicpXG5wYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbnZlcnNpb25DaGVja1N0YXRlID0gZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBSdXN0Zm10IGV4dGVuZHMgQmVhdXRpZmllclxuICBuYW1lOiBcInJ1c3RmbXRcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9ydXN0LWxhbmctbnVyc2VyeS9ydXN0Zm10XCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFJ1c3Q6IHRydWVcbiAgfVxuXG4gIGJlYXV0aWZ5OiAodGV4dCwgbGFuZ3VhZ2UsIG9wdGlvbnMsIGNvbnRleHQpIC0+XG4gICAgY3dkID0gY29udGV4dC5maWxlUGF0aCBhbmQgcGF0aC5kaXJuYW1lIGNvbnRleHQuZmlsZVBhdGhcbiAgICBwcm9ncmFtID0gb3B0aW9ucy5ydXN0Zm10X3BhdGggb3IgXCJydXN0Zm10XCJcbiAgICBoZWxwID0ge1xuICAgICAgbGluazogXCJodHRwczovL2dpdGh1Yi5jb20vcnVzdC1sYW5nLW51cnNlcnkvcnVzdGZtdFwiXG4gICAgICBwcm9ncmFtOiBcInJ1c3RmbXRcIlxuICAgICAgcGF0aE9wdGlvbjogXCJSdXN0IC0gUnVzdGZtdCBQYXRoXCJcbiAgICB9XG5cbiAgICAjIDAuNS4wIGlzIGEgcmVsYXRpdmVseSBuZXcgdmVyc2lvbiBhdCB0aGUgcG9pbnQgb2Ygd3JpdGluZyxcbiAgICAjIGJ1dCBpcyBlc3NlbnRpYWwgZm9yIHRoaXMgdG8gd29yayB3aXRoIHN0ZGluLlxuICAgICMgPT4gQ2hlY2sgZm9yIGl0IHNwZWNpZmljYWxseS5cbiAgICBwID0gaWYgdmVyc2lvbkNoZWNrU3RhdGUgPT0gcHJvZ3JhbVxuICAgICAgQFByb21pc2UucmVzb2x2ZSgpXG4gICAgZWxzZVxuICAgICAgQHJ1bihwcm9ncmFtLCBbXCItLXZlcnNpb25cIl0sIGhlbHA6IGhlbHApXG4gICAgICAgIC50aGVuKChzdGRvdXQpIC0+XG4gICAgICAgICAgaWYgL14wXFwuKD86WzAtNF1cXC5bMC05XSkoPyEtbmlnaHRseSkvLnRlc3Qoc3Rkb3V0LnRyaW0oKSlcbiAgICAgICAgICAgIHZlcnNpb25DaGVja1N0YXRlID0gZmFsc2VcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInJ1c3RmbXQgdmVyc2lvbiAwLjUuMCBvciBuZXdlciByZXF1aXJlZFwiKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHZlcnNpb25DaGVja1N0YXRlID0gcHJvZ3JhbVxuICAgICAgICAgICAgdW5kZWZpbmVkXG4gICAgICAgIClcblxuICAgIHAudGhlbig9PlxuICAgICAgQHJ1bihwcm9ncmFtLCBbXSwge1xuICAgICAgICBjd2Q6IGN3ZFxuICAgICAgICBoZWxwOiBoZWxwXG4gICAgICAgIG9uU3RkaW46IChzdGRpbikgLT5cbiAgICAgICAgICBzdGRpbi5lbmQgdGV4dFxuICAgICAgfSlcbiAgICApXG4iXX0=
