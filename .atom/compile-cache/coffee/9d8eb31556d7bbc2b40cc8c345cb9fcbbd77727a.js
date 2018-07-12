
/*
Requires http://pear.php.net/package/PHP_Beautifier
 */

(function() {
  "use strict";
  var fs, possibleOptions, temp;

  fs = require("fs");

  temp = require("temp").track();

  possibleOptions = require("./possible-options.json");

  module.exports = function(options, cb) {
    var ic, isPossible, k, text, v, vs;
    text = "";
    options.output_tab_size = options.output_tab_size || options.indent_size;
    options.input_tab_size = options.input_tab_size || options.indent_size;
    delete options.indent_size;
    ic = options.indent_char;
    if (options.indent_with_tabs === 0 || options.indent_with_tabs === 1 || options.indent_with_tabs === 2) {
      null;
    } else if (ic === " ") {
      options.indent_with_tabs = 0;
    } else if (ic === "\t") {
      options.indent_with_tabs = 2;
    } else {
      options.indent_with_tabs = 1;
    }
    delete options.indent_char;
    delete options.languageOverride;
    delete options.configPath;
    for (k in options) {
      isPossible = possibleOptions.indexOf(k) !== -1;
      if (isPossible) {
        v = options[k];
        vs = v;
        if (typeof vs === "boolean") {
          if (vs === true) {
            vs = "True";
          } else {
            vs = "False";
          }
        }
        text += k + " = " + vs + "\n";
      } else {
        delete options[k];
      }
    }
    return temp.open({
      suffix: ".cfg"
    }, function(err, info) {
      if (!err) {
        return fs.write(info.fd, text || "", function(err) {
          if (err) {
            return cb(err);
          }
          return fs.close(info.fd, function(err) {
            if (err) {
              return cb(err);
            }
            return cb(null, info.path);
          });
        });
      } else {
        return cb(err);
      }
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3VuY3J1c3RpZnkvY2ZnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtFQUdBO0FBSEEsTUFBQTs7RUFJQSxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQyxLQUFoQixDQUFBOztFQUNQLGVBQUEsR0FBa0IsT0FBQSxDQUFRLHlCQUFSOztFQUNsQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLE9BQUQsRUFBVSxFQUFWO0FBQ2YsUUFBQTtJQUFBLElBQUEsR0FBTztJQUdQLE9BQU8sQ0FBQyxlQUFSLEdBQTBCLE9BQU8sQ0FBQyxlQUFSLElBQTJCLE9BQU8sQ0FBQztJQUM3RCxPQUFPLENBQUMsY0FBUixHQUF5QixPQUFPLENBQUMsY0FBUixJQUEwQixPQUFPLENBQUM7SUFDM0QsT0FBTyxPQUFPLENBQUM7SUFRZixFQUFBLEdBQUssT0FBTyxDQUFDO0lBQ2IsSUFBRyxPQUFPLENBQUMsZ0JBQVIsS0FBNEIsQ0FBNUIsSUFBaUMsT0FBTyxDQUFDLGdCQUFSLEtBQTRCLENBQTdELElBQWtFLE9BQU8sQ0FBQyxnQkFBUixLQUE0QixDQUFqRztNQUNFLEtBREY7S0FBQSxNQUVLLElBQUcsRUFBQSxLQUFNLEdBQVQ7TUFDSCxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsRUFEeEI7S0FBQSxNQUVBLElBQUcsRUFBQSxLQUFNLElBQVQ7TUFDSCxPQUFPLENBQUMsZ0JBQVIsR0FBMkIsRUFEeEI7S0FBQSxNQUFBO01BR0gsT0FBTyxDQUFDLGdCQUFSLEdBQTJCLEVBSHhCOztJQUlMLE9BQU8sT0FBTyxDQUFDO0lBS2YsT0FBTyxPQUFPLENBQUM7SUFDZixPQUFPLE9BQU8sQ0FBQztBQUdmLFNBQUEsWUFBQTtNQUVFLFVBQUEsR0FBYSxlQUFlLENBQUMsT0FBaEIsQ0FBd0IsQ0FBeEIsQ0FBQSxLQUFnQyxDQUFDO01BQzlDLElBQUcsVUFBSDtRQUNFLENBQUEsR0FBSSxPQUFRLENBQUEsQ0FBQTtRQUNaLEVBQUEsR0FBSztRQUNMLElBQUcsT0FBTyxFQUFQLEtBQWEsU0FBaEI7VUFDRSxJQUFHLEVBQUEsS0FBTSxJQUFUO1lBQ0UsRUFBQSxHQUFLLE9BRFA7V0FBQSxNQUFBO1lBR0UsRUFBQSxHQUFLLFFBSFA7V0FERjs7UUFLQSxJQUFBLElBQVEsQ0FBQSxHQUFJLEtBQUosR0FBWSxFQUFaLEdBQWlCLEtBUjNCO09BQUEsTUFBQTtRQVdFLE9BQU8sT0FBUSxDQUFBLENBQUEsRUFYakI7O0FBSEY7V0FpQkEsSUFBSSxDQUFDLElBQUwsQ0FDRTtNQUFBLE1BQUEsRUFBUSxNQUFSO0tBREYsRUFFRSxTQUFDLEdBQUQsRUFBTSxJQUFOO01BQ0EsSUFBQSxDQUFPLEdBQVA7ZUFHRSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUksQ0FBQyxFQUFkLEVBQWtCLElBQUEsSUFBUSxFQUExQixFQUE4QixTQUFDLEdBQUQ7VUFHNUIsSUFBa0IsR0FBbEI7QUFBQSxtQkFBTyxFQUFBLENBQUcsR0FBSCxFQUFQOztpQkFDQSxFQUFFLENBQUMsS0FBSCxDQUFTLElBQUksQ0FBQyxFQUFkLEVBQWtCLFNBQUMsR0FBRDtZQUdoQixJQUFrQixHQUFsQjtBQUFBLHFCQUFPLEVBQUEsQ0FBRyxHQUFILEVBQVA7O21CQUNBLEVBQUEsQ0FBRyxJQUFILEVBQVMsSUFBSSxDQUFDLElBQWQ7VUFKZ0IsQ0FBbEI7UUFKNEIsQ0FBOUIsRUFIRjtPQUFBLE1BQUE7ZUFlRSxFQUFBLENBQUcsR0FBSCxFQWZGOztJQURBLENBRkY7RUFqRGU7QUFQakIiLCJzb3VyY2VzQ29udGVudCI6WyIjIyNcblJlcXVpcmVzIGh0dHA6Ly9wZWFyLnBocC5uZXQvcGFja2FnZS9QSFBfQmVhdXRpZmllclxuIyMjXG5cInVzZSBzdHJpY3RcIlxuZnMgPSByZXF1aXJlKFwiZnNcIilcbnRlbXAgPSByZXF1aXJlKFwidGVtcFwiKS50cmFjaygpXG5wb3NzaWJsZU9wdGlvbnMgPSByZXF1aXJlIFwiLi9wb3NzaWJsZS1vcHRpb25zLmpzb25cIlxubW9kdWxlLmV4cG9ydHMgPSAob3B0aW9ucywgY2IpIC0+XG4gIHRleHQgPSBcIlwiXG5cbiAgIyBBcHBseSBpbmRlbnRfc2l6ZSB0byBvdXRwdXRfdGFiX3NpemVcbiAgb3B0aW9ucy5vdXRwdXRfdGFiX3NpemUgPSBvcHRpb25zLm91dHB1dF90YWJfc2l6ZSBvciBvcHRpb25zLmluZGVudF9zaXplICMganNoaW50IGlnbm9yZTogbGluZVxuICBvcHRpb25zLmlucHV0X3RhYl9zaXplID0gb3B0aW9ucy5pbnB1dF90YWJfc2l6ZSBvciBvcHRpb25zLmluZGVudF9zaXplICMganNoaW50IGlnbm9yZTogbGluZVxuICBkZWxldGUgb3B0aW9ucy5pbmRlbnRfc2l6ZSAjIGpzaGludCBpZ25vcmU6IGxpbmVcblxuICAjIEluZGVudCB3aXRoIFRhYnM/XG4gICMgSG93IHRvIHVzZSB0YWJzIHdoZW4gaW5kZW50aW5nIGNvZGVcbiAgIyAwPXNwYWNlcyBvbmx5XG4gICMgMT1pbmRlbnQgd2l0aCB0YWJzIHRvIGJyYWNlIGxldmVsLCBhbGlnbiB3aXRoIHNwYWNlc1xuICAjIDI9aW5kZW50IGFuZCBhbGlnbiB3aXRoIHRhYnMsIHVzaW5nIHNwYWNlcyB3aGVuIG5vdCBvbiBhIHRhYnN0b3BcbiAgIyBqc2hpbnQgaWdub3JlOiBzdGFydFxuICBpYyA9IG9wdGlvbnMuaW5kZW50X2NoYXJcbiAgaWYgb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzIGlzIDAgb3Igb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzIGlzIDEgb3Igb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzIGlzIDJcbiAgICBudWxsICMgSWdub3JlIGluZGVudF9jaGFyIG9wdGlvblxuICBlbHNlIGlmIGljIGlzIFwiIFwiXG4gICAgb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzID0gMCAjIFNwYWNlcyBvbmx5XG4gIGVsc2UgaWYgaWMgaXMgXCJcXHRcIlxuICAgIG9wdGlvbnMuaW5kZW50X3dpdGhfdGFicyA9IDIgIyBpbmRlbnQgYW5kIGFsaWduIHdpdGggdGFicywgdXNpbmcgc3BhY2VzIHdoZW4gbm90IG9uIGEgdGFic3RvcFxuICBlbHNlXG4gICAgb3B0aW9ucy5pbmRlbnRfd2l0aF90YWJzID0gMSAjIGluZGVudCB3aXRoIHRhYnMgdG8gYnJhY2UgbGV2ZWwsIGFsaWduIHdpdGggc3BhY2VzXG4gIGRlbGV0ZSBvcHRpb25zLmluZGVudF9jaGFyXG5cblxuICAjIGpzaGludCBpZ25vcmU6IGVuZFxuICAjIFJlbW92ZSBtaXNjXG4gIGRlbGV0ZSBvcHRpb25zLmxhbmd1YWdlT3ZlcnJpZGVcbiAgZGVsZXRlIG9wdGlvbnMuY29uZmlnUGF0aFxuXG4gICMgSXRlcmF0ZSBvdmVyIGVhY2ggcHJvcGVydHkgYW5kIHdyaXRlIHRvIGNvbmZpZ3VyYXRpb24gZmlsZVxuICBmb3IgayBvZiBvcHRpb25zXG4gICAgIyBSZW1vdmUgYWxsIG5vbi1wb3NzaWJsZSBvcHRpb25zXG4gICAgaXNQb3NzaWJsZSA9IHBvc3NpYmxlT3B0aW9ucy5pbmRleE9mKGspIGlzbnQgLTFcbiAgICBpZiBpc1Bvc3NpYmxlXG4gICAgICB2ID0gb3B0aW9uc1trXVxuICAgICAgdnMgPSB2XG4gICAgICBpZiB0eXBlb2YgdnMgaXMgXCJib29sZWFuXCJcbiAgICAgICAgaWYgdnMgaXMgdHJ1ZVxuICAgICAgICAgIHZzID0gXCJUcnVlXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHZzID0gXCJGYWxzZVwiXG4gICAgICB0ZXh0ICs9IGsgKyBcIiA9IFwiICsgdnMgKyBcIlxcblwiXG4gICAgZWxzZVxuICAgICAgIyBjb25zb2xlLmxvZyhcInJlbW92aW5nICN7a30gb3B0aW9uXCIpXG4gICAgICBkZWxldGUgb3B0aW9uc1trXVxuXG4gICMgQ3JlYXRlIHRlbXAgaW5wdXQgZmlsZVxuICB0ZW1wLm9wZW5cbiAgICBzdWZmaXg6IFwiLmNmZ1wiXG4gICwgKGVyciwgaW5mbykgLT5cbiAgICB1bmxlc3MgZXJyXG5cbiAgICAgICMgU2F2ZSBjdXJyZW50IHRleHQgdG8gaW5wdXQgZmlsZVxuICAgICAgZnMud3JpdGUgaW5mby5mZCwgdGV4dCBvciBcIlwiLCAoZXJyKSAtPlxuXG4gICAgICAgICMgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgcmV0dXJuIGNiKGVycikgaWYgZXJyXG4gICAgICAgIGZzLmNsb3NlIGluZm8uZmQsIChlcnIpIC0+XG5cbiAgICAgICAgICAjIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgICAgcmV0dXJuIGNiKGVycikgaWYgZXJyXG4gICAgICAgICAgY2IgbnVsbCwgaW5mby5wYXRoXG5cblxuICAgIGVsc2VcbiAgICAgIGNiIGVyclxuIl19
