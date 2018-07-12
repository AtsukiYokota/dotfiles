(function() {
  'use strict';
  var Beautifier, HOST, MULTI_LINE_OUTPUT_TABLE, PORT, PythonBeautifier, format, net,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  net = require('net');

  Beautifier = require('./beautifier');

  HOST = '127.0.0.1';

  PORT = 36805;

  MULTI_LINE_OUTPUT_TABLE = {
    'Grid': 0,
    'Vertical': 1,
    'Hanging Indent': 2,
    'Vertical Hanging Indent': 3,
    'Hanging Grid': 4,
    'Hanging Grid Grouped': 5,
    'NOQA': 6
  };

  format = function(data, formatters) {
    return new Promise(function(resolve, reject) {
      var client;
      client = new net.Socket();
      client.on('error', function(error) {
        client.destroy();
        return reject(error);
      });
      return client.connect(PORT, HOST, function() {
        var response;
        client.setEncoding('utf8');
        client.write(JSON.stringify({
          'data': data,
          'formatters': formatters
        }));
        response = '';
        client.on('data', function(chunk) {
          return response += chunk;
        });
        return client.on('end', function() {
          response = JSON.parse(response);
          if (response.error != null) {
            reject(Error(response.error));
          } else {
            resolve(response.data);
          }
          return client.destroy();
        });
      });
    });
  };

  module.exports = PythonBeautifier = (function(superClass) {
    extend(PythonBeautifier, superClass);

    function PythonBeautifier() {
      return PythonBeautifier.__super__.constructor.apply(this, arguments);
    }

    PythonBeautifier.prototype.name = "pybeautifier";

    PythonBeautifier.prototype.link = "https://github.com/guyskk/pybeautifier";

    PythonBeautifier.prototype.isPreInstalled = false;

    PythonBeautifier.prototype.options = {
      Python: true
    };

    PythonBeautifier.prototype.beautify = function(text, language, options) {
      var formatter, formatters, multi_line_output;
      formatter = {
        'name': options.formatter
      };
      if (options.formatter === 'autopep8') {
        formatter.config = {
          'ignore': options.ignore,
          'max_line_length': options.max_line_length
        };
      } else if (options.formatter === 'yapf') {
        formatter.config = {
          'style_config': options.style_config
        };
      }
      formatters = [formatter];
      if (options.sort_imports) {
        multi_line_output = MULTI_LINE_OUTPUT_TABLE[options.multi_line_output];
        formatters.push({
          'name': 'isort',
          'config': {
            'multi_line_output': multi_line_output
          }
        });
      }
      return new this.Promise(function(resolve, reject) {
        return format(text, formatters).then(function(data) {
          return resolve(data);
        })["catch"](function(error) {
          return reject(error);
        });
      });
    };

    return PythonBeautifier;

  })(Beautifier);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2JlYXV0aWZpZXJzL3B5YmVhdXRpZmllci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQTtBQUFBLE1BQUEsOEVBQUE7SUFBQTs7O0VBQ0EsR0FBQSxHQUFNLE9BQUEsQ0FBUSxLQUFSOztFQUNOLFVBQUEsR0FBYSxPQUFBLENBQVEsY0FBUjs7RUFFYixJQUFBLEdBQU87O0VBQ1AsSUFBQSxHQUFPOztFQUNQLHVCQUFBLEdBQTBCO0lBQ3hCLE1BQUEsRUFBUSxDQURnQjtJQUV4QixVQUFBLEVBQVksQ0FGWTtJQUd4QixnQkFBQSxFQUFrQixDQUhNO0lBSXhCLHlCQUFBLEVBQTJCLENBSkg7SUFLeEIsY0FBQSxFQUFnQixDQUxRO0lBTXhCLHNCQUFBLEVBQXdCLENBTkE7SUFPeEIsTUFBQSxFQUFRLENBUGdCOzs7RUFVMUIsTUFBQSxHQUFTLFNBQUMsSUFBRCxFQUFPLFVBQVA7QUFDUCxXQUFPLElBQUksT0FBSixDQUFZLFNBQUMsT0FBRCxFQUFVLE1BQVY7QUFDakIsVUFBQTtNQUFBLE1BQUEsR0FBUyxJQUFJLEdBQUcsQ0FBQyxNQUFSLENBQUE7TUFDVCxNQUFNLENBQUMsRUFBUCxDQUFVLE9BQVYsRUFBbUIsU0FBQyxLQUFEO1FBQ2pCLE1BQU0sQ0FBQyxPQUFQLENBQUE7ZUFDQSxNQUFBLENBQU8sS0FBUDtNQUZpQixDQUFuQjthQUdBLE1BQU0sQ0FBQyxPQUFQLENBQWUsSUFBZixFQUFxQixJQUFyQixFQUEyQixTQUFBO0FBQ3pCLFlBQUE7UUFBQSxNQUFNLENBQUMsV0FBUCxDQUFtQixNQUFuQjtRQUNBLE1BQU0sQ0FBQyxLQUFQLENBQWEsSUFBSSxDQUFDLFNBQUwsQ0FBZTtVQUFDLE1BQUEsRUFBUSxJQUFUO1VBQWUsWUFBQSxFQUFjLFVBQTdCO1NBQWYsQ0FBYjtRQUNBLFFBQUEsR0FBVztRQUNYLE1BQU0sQ0FBQyxFQUFQLENBQVUsTUFBVixFQUFrQixTQUFDLEtBQUQ7aUJBQ2hCLFFBQUEsSUFBWTtRQURJLENBQWxCO2VBRUEsTUFBTSxDQUFDLEVBQVAsQ0FBVSxLQUFWLEVBQWlCLFNBQUE7VUFDZixRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxRQUFYO1VBQ1gsSUFBRyxzQkFBSDtZQUNFLE1BQUEsQ0FBTyxLQUFBLENBQU0sUUFBUSxDQUFDLEtBQWYsQ0FBUCxFQURGO1dBQUEsTUFBQTtZQUdFLE9BQUEsQ0FBUSxRQUFRLENBQUMsSUFBakIsRUFIRjs7aUJBSUEsTUFBTSxDQUFDLE9BQVAsQ0FBQTtRQU5lLENBQWpCO01BTnlCLENBQTNCO0lBTGlCLENBQVo7RUFEQTs7RUFvQlQsTUFBTSxDQUFDLE9BQVAsR0FBdUI7Ozs7Ozs7K0JBRXJCLElBQUEsR0FBTTs7K0JBQ04sSUFBQSxHQUFNOzsrQkFDTixjQUFBLEdBQWdCOzsrQkFFaEIsT0FBQSxHQUFTO01BQ1AsTUFBQSxFQUFRLElBREQ7OzsrQkFJVCxRQUFBLEdBQVUsU0FBQyxJQUFELEVBQU8sUUFBUCxFQUFpQixPQUFqQjtBQUNSLFVBQUE7TUFBQSxTQUFBLEdBQVk7UUFBQyxNQUFBLEVBQVEsT0FBTyxDQUFDLFNBQWpCOztNQUNaLElBQUcsT0FBTyxDQUFDLFNBQVIsS0FBcUIsVUFBeEI7UUFDRSxTQUFTLENBQUMsTUFBVixHQUFtQjtVQUNqQixRQUFBLEVBQVUsT0FBTyxDQUFDLE1BREQ7VUFFakIsaUJBQUEsRUFBbUIsT0FBTyxDQUFDLGVBRlY7VUFEckI7T0FBQSxNQUtLLElBQUcsT0FBTyxDQUFDLFNBQVIsS0FBcUIsTUFBeEI7UUFDSCxTQUFTLENBQUMsTUFBVixHQUFtQjtVQUFDLGNBQUEsRUFBZ0IsT0FBTyxDQUFDLFlBQXpCO1VBRGhCOztNQUVMLFVBQUEsR0FBYSxDQUFDLFNBQUQ7TUFDYixJQUFHLE9BQU8sQ0FBQyxZQUFYO1FBQ0UsaUJBQUEsR0FBb0IsdUJBQXdCLENBQUEsT0FBTyxDQUFDLGlCQUFSO1FBQzVDLFVBQVUsQ0FBQyxJQUFYLENBQ0U7VUFBQSxNQUFBLEVBQVEsT0FBUjtVQUNBLFFBQUEsRUFBVTtZQUFDLG1CQUFBLEVBQXFCLGlCQUF0QjtXQURWO1NBREYsRUFGRjs7QUFLQSxhQUFPLElBQUksSUFBQyxDQUFBLE9BQUwsQ0FBYSxTQUFDLE9BQUQsRUFBVSxNQUFWO2VBQ2xCLE1BQUEsQ0FBTyxJQUFQLEVBQWEsVUFBYixDQUNBLENBQUMsSUFERCxDQUNNLFNBQUMsSUFBRDtpQkFDSixPQUFBLENBQVEsSUFBUjtRQURJLENBRE4sQ0FHQSxFQUFDLEtBQUQsRUFIQSxDQUdPLFNBQUMsS0FBRDtpQkFDTCxNQUFBLENBQU8sS0FBUDtRQURLLENBSFA7TUFEa0IsQ0FBYjtJQWZDOzs7O0tBVm9DO0FBcENoRCIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xubmV0ID0gcmVxdWlyZSgnbmV0JylcbkJlYXV0aWZpZXIgPSByZXF1aXJlKCcuL2JlYXV0aWZpZXInKVxuXG5IT1NUID0gJzEyNy4wLjAuMSdcblBPUlQgPSAzNjgwNVxuTVVMVElfTElORV9PVVRQVVRfVEFCTEUgPSB7XG4gICdHcmlkJzogMCxcbiAgJ1ZlcnRpY2FsJzogMSxcbiAgJ0hhbmdpbmcgSW5kZW50JzogMixcbiAgJ1ZlcnRpY2FsIEhhbmdpbmcgSW5kZW50JzogMyxcbiAgJ0hhbmdpbmcgR3JpZCc6IDQsXG4gICdIYW5naW5nIEdyaWQgR3JvdXBlZCc6IDUsXG4gICdOT1FBJzogNlxufVxuXG5mb3JtYXQgPSAoZGF0YSwgZm9ybWF0dGVycykgLT5cbiAgcmV0dXJuIG5ldyBQcm9taXNlIChyZXNvbHZlLCByZWplY3QpIC0+XG4gICAgY2xpZW50ID0gbmV3IG5ldC5Tb2NrZXQoKVxuICAgIGNsaWVudC5vbiAnZXJyb3InLCAoZXJyb3IpIC0+XG4gICAgICBjbGllbnQuZGVzdHJveSgpXG4gICAgICByZWplY3QoZXJyb3IpXG4gICAgY2xpZW50LmNvbm5lY3QgUE9SVCwgSE9TVCwgLT5cbiAgICAgIGNsaWVudC5zZXRFbmNvZGluZygndXRmOCcpXG4gICAgICBjbGllbnQud3JpdGUoSlNPTi5zdHJpbmdpZnkoeydkYXRhJzogZGF0YSwgJ2Zvcm1hdHRlcnMnOiBmb3JtYXR0ZXJzfSkpXG4gICAgICByZXNwb25zZSA9ICcnXG4gICAgICBjbGllbnQub24gJ2RhdGEnLCAoY2h1bmspIC0+XG4gICAgICAgIHJlc3BvbnNlICs9IGNodW5rXG4gICAgICBjbGllbnQub24gJ2VuZCcsIC0+XG4gICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShyZXNwb25zZSlcbiAgICAgICAgaWYgcmVzcG9uc2UuZXJyb3I/XG4gICAgICAgICAgcmVqZWN0KEVycm9yKHJlc3BvbnNlLmVycm9yKSlcbiAgICAgICAgZWxzZVxuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UuZGF0YSlcbiAgICAgICAgY2xpZW50LmRlc3Ryb3koKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFB5dGhvbkJlYXV0aWZpZXIgZXh0ZW5kcyBCZWF1dGlmaWVyXG5cbiAgbmFtZTogXCJweWJlYXV0aWZpZXJcIlxuICBsaW5rOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9ndXlza2svcHliZWF1dGlmaWVyXCJcbiAgaXNQcmVJbnN0YWxsZWQ6IGZhbHNlXG5cbiAgb3B0aW9uczoge1xuICAgIFB5dGhvbjogdHJ1ZVxuICB9XG5cbiAgYmVhdXRpZnk6ICh0ZXh0LCBsYW5ndWFnZSwgb3B0aW9ucykgLT5cbiAgICBmb3JtYXR0ZXIgPSB7J25hbWUnOiBvcHRpb25zLmZvcm1hdHRlcn1cbiAgICBpZiBvcHRpb25zLmZvcm1hdHRlciA9PSAnYXV0b3BlcDgnXG4gICAgICBmb3JtYXR0ZXIuY29uZmlnID0ge1xuICAgICAgICAnaWdub3JlJzogb3B0aW9ucy5pZ25vcmVcbiAgICAgICAgJ21heF9saW5lX2xlbmd0aCc6IG9wdGlvbnMubWF4X2xpbmVfbGVuZ3RoXG4gICAgICB9XG4gICAgZWxzZSBpZiBvcHRpb25zLmZvcm1hdHRlciA9PSAneWFwZidcbiAgICAgIGZvcm1hdHRlci5jb25maWcgPSB7J3N0eWxlX2NvbmZpZyc6IG9wdGlvbnMuc3R5bGVfY29uZmlnfVxuICAgIGZvcm1hdHRlcnMgPSBbZm9ybWF0dGVyXVxuICAgIGlmIG9wdGlvbnMuc29ydF9pbXBvcnRzXG4gICAgICBtdWx0aV9saW5lX291dHB1dCA9IE1VTFRJX0xJTkVfT1VUUFVUX1RBQkxFW29wdGlvbnMubXVsdGlfbGluZV9vdXRwdXRdXG4gICAgICBmb3JtYXR0ZXJzLnB1c2hcbiAgICAgICAgJ25hbWUnOiAnaXNvcnQnXG4gICAgICAgICdjb25maWcnOiB7J211bHRpX2xpbmVfb3V0cHV0JzogbXVsdGlfbGluZV9vdXRwdXR9XG4gICAgcmV0dXJuIG5ldyBAUHJvbWlzZSAocmVzb2x2ZSwgcmVqZWN0KSAtPlxuICAgICAgZm9ybWF0KHRleHQsIGZvcm1hdHRlcnMpXG4gICAgICAudGhlbiAoZGF0YSkgLT5cbiAgICAgICAgcmVzb2x2ZShkYXRhKVxuICAgICAgLmNhdGNoIChlcnJvcikgLT5cbiAgICAgICAgcmVqZWN0KGVycm9yKVxuIl19
