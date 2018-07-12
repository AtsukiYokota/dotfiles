
/*
Global Logger
 */

(function() {
  module.exports = (function() {
    var Emitter, emitter, levels, stream, winston, writable;
    Emitter = require('event-kit').Emitter;
    emitter = new Emitter();
    winston = require('winston');
    stream = require('stream');
    writable = new stream.Writable();
    writable._write = function(chunk, encoding, next) {
      var msg;
      msg = chunk.toString();
      emitter.emit('logging', msg);
      return next();
    };
    levels = {
      silly: 0,
      input: 1,
      verbose: 2,
      prompt: 3,
      debug: 4,
      info: 5,
      data: 6,
      help: 7,
      warn: 8,
      error: 9
    };
    return function(label) {
      var i, len, logger, loggerMethods, method, transport, wlogger;
      transport = new winston.transports.File({
        label: label,
        level: 'debug',
        timestamp: true,
        stream: writable,
        json: false
      });
      wlogger = new winston.Logger({
        transports: [transport]
      });
      wlogger.on('logging', function(transport, level, msg, meta) {
        var d, levelNum, loggerLevel, loggerLevelNum, path, ref;
        loggerLevel = (ref = typeof atom !== "undefined" && atom !== null ? atom.config.get('atom-beautify.general.loggerLevel') : void 0) != null ? ref : "warn";
        loggerLevelNum = levels[loggerLevel];
        levelNum = levels[level];
        if (loggerLevelNum <= levelNum) {
          path = require('path');
          label = "" + (path.dirname(transport.label).split(path.sep).reverse()[0]) + path.sep + (path.basename(transport.label));
          d = new Date();
          return console.log((d.toLocaleDateString()) + " " + (d.toLocaleTimeString()) + " - " + label + " [" + level + "]: " + msg, meta);
        }
      });
      loggerMethods = ['silly', 'debug', 'verbose', 'info', 'warn', 'error'];
      logger = {};
      for (i = 0, len = loggerMethods.length; i < len; i++) {
        method = loggerMethods[i];
        logger[method] = wlogger[method];
      }
      logger.onLogging = function(handler) {
        var subscription;
        subscription = emitter.on('logging', handler);
        return subscription;
      };
      return logger;
    };
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F0b20tYmVhdXRpZnkvc3JjL2xvZ2dlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7RUFHQSxNQUFNLENBQUMsT0FBUCxHQUFvQixDQUFBLFNBQUE7QUFFbEIsUUFBQTtJQUFDLFVBQVcsT0FBQSxDQUFRLFdBQVI7SUFDWixPQUFBLEdBQVUsSUFBSSxPQUFKLENBQUE7SUFHVixPQUFBLEdBQVUsT0FBQSxDQUFRLFNBQVI7SUFDVixNQUFBLEdBQVMsT0FBQSxDQUFRLFFBQVI7SUFDVCxRQUFBLEdBQVcsSUFBSSxNQUFNLENBQUMsUUFBWCxDQUFBO0lBQ1gsUUFBUSxDQUFDLE1BQVQsR0FBa0IsU0FBQyxLQUFELEVBQVEsUUFBUixFQUFrQixJQUFsQjtBQUNoQixVQUFBO01BQUEsR0FBQSxHQUFNLEtBQUssQ0FBQyxRQUFOLENBQUE7TUFFTixPQUFPLENBQUMsSUFBUixDQUFhLFNBQWIsRUFBd0IsR0FBeEI7YUFDQSxJQUFBLENBQUE7SUFKZ0I7SUFNbEIsTUFBQSxHQUFTO01BQ1AsS0FBQSxFQUFPLENBREE7TUFFUCxLQUFBLEVBQU8sQ0FGQTtNQUdQLE9BQUEsRUFBUyxDQUhGO01BSVAsTUFBQSxFQUFRLENBSkQ7TUFLUCxLQUFBLEVBQU8sQ0FMQTtNQU1QLElBQUEsRUFBTSxDQU5DO01BT1AsSUFBQSxFQUFNLENBUEM7TUFRUCxJQUFBLEVBQU0sQ0FSQztNQVNQLElBQUEsRUFBTSxDQVRDO01BVVAsS0FBQSxFQUFPLENBVkE7O0FBYVQsV0FBTyxTQUFDLEtBQUQ7QUFDTCxVQUFBO01BQUEsU0FBQSxHQUFZLElBQUssT0FBTyxDQUFDLFVBQVUsQ0FBQyxJQUF4QixDQUE4QjtRQUN4QyxLQUFBLEVBQU8sS0FEaUM7UUFFeEMsS0FBQSxFQUFPLE9BRmlDO1FBR3hDLFNBQUEsRUFBVyxJQUg2QjtRQU14QyxNQUFBLEVBQVEsUUFOZ0M7UUFPeEMsSUFBQSxFQUFNLEtBUGtDO09BQTlCO01BVVosT0FBQSxHQUFVLElBQUssT0FBTyxDQUFDLE1BQWIsQ0FBcUI7UUFFN0IsVUFBQSxFQUFZLENBQ1YsU0FEVSxDQUZpQjtPQUFyQjtNQU1WLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixTQUFDLFNBQUQsRUFBWSxLQUFaLEVBQW1CLEdBQW5CLEVBQXdCLElBQXhCO0FBQ3BCLFlBQUE7UUFBQSxXQUFBLHdJQUN5QztRQUV6QyxjQUFBLEdBQWlCLE1BQU8sQ0FBQSxXQUFBO1FBQ3hCLFFBQUEsR0FBVyxNQUFPLENBQUEsS0FBQTtRQUNsQixJQUFHLGNBQUEsSUFBa0IsUUFBckI7VUFDRSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7VUFDUCxLQUFBLEdBQVEsRUFBQSxHQUFFLENBQUMsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFTLENBQUMsS0FBdkIsQ0FDQyxDQUFDLEtBREYsQ0FDUSxJQUFJLENBQUMsR0FEYixDQUNpQixDQUFDLE9BRGxCLENBQUEsQ0FDNEIsQ0FBQSxDQUFBLENBRDdCLENBQUYsR0FFTSxJQUFJLENBQUMsR0FGWCxHQUVnQixDQUFDLElBQUksQ0FBQyxRQUFMLENBQWMsU0FBUyxDQUFDLEtBQXhCLENBQUQ7VUFDeEIsQ0FBQSxHQUFJLElBQUksSUFBSixDQUFBO2lCQUNKLE9BQU8sQ0FBQyxHQUFSLENBQWMsQ0FBQyxDQUFDLENBQUMsa0JBQUYsQ0FBQSxDQUFELENBQUEsR0FBd0IsR0FBeEIsR0FBMEIsQ0FBQyxDQUFDLENBQUMsa0JBQUYsQ0FBQSxDQUFELENBQTFCLEdBQWtELEtBQWxELEdBQXVELEtBQXZELEdBQTZELElBQTdELEdBQWlFLEtBQWpFLEdBQXVFLEtBQXZFLEdBQTRFLEdBQTFGLEVBQWlHLElBQWpHLEVBTkY7O01BTm9CLENBQXRCO01BZUEsYUFBQSxHQUFnQixDQUFDLE9BQUQsRUFBUyxPQUFULEVBQWlCLFNBQWpCLEVBQTJCLE1BQTNCLEVBQWtDLE1BQWxDLEVBQXlDLE9BQXpDO01BQ2hCLE1BQUEsR0FBUztBQUNULFdBQUEsK0NBQUE7O1FBQ0UsTUFBTyxDQUFBLE1BQUEsQ0FBUCxHQUFpQixPQUFRLENBQUEsTUFBQTtBQUQzQjtNQUdBLE1BQU0sQ0FBQyxTQUFQLEdBQW1CLFNBQUMsT0FBRDtBQUVqQixZQUFBO1FBQUEsWUFBQSxHQUFlLE9BQU8sQ0FBQyxFQUFSLENBQVcsU0FBWCxFQUFzQixPQUF0QjtBQUVmLGVBQU87TUFKVTtBQU1uQixhQUFPO0lBM0NGO0VBNUJXLENBQUEsQ0FBSCxDQUFBO0FBSGpCIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG5HbG9iYWwgTG9nZ2VyXG4jIyNcbm1vZHVsZS5leHBvcnRzID0gZG8gLT5cbiAgIyBDcmVhdGUgRXZlbnQgRW1pdHRlclxuICB7RW1pdHRlcn0gPSByZXF1aXJlICdldmVudC1raXQnXG4gIGVtaXR0ZXIgPSBuZXcgRW1pdHRlcigpXG4gICMgQ3JlYXRlIFRyYW5zcG9ydCB3aXRoIFdyaXRhYmxlIFN0cmVhbVxuICAjIFNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMTU4MzgzMS8yNTc4MjA1XG4gIHdpbnN0b24gPSByZXF1aXJlKCd3aW5zdG9uJylcbiAgc3RyZWFtID0gcmVxdWlyZSgnc3RyZWFtJylcbiAgd3JpdGFibGUgPSBuZXcgc3RyZWFtLldyaXRhYmxlKClcbiAgd3JpdGFibGUuX3dyaXRlID0gKGNodW5rLCBlbmNvZGluZywgbmV4dCkgLT5cbiAgICBtc2cgPSBjaHVuay50b1N0cmluZygpXG4gICAgIyBjb25zb2xlLmxvZyhtc2cpXG4gICAgZW1pdHRlci5lbWl0KCdsb2dnaW5nJywgbXNnKVxuICAgIG5leHQoKVxuXG4gIGxldmVscyA9IHtcbiAgICBzaWxseTogMCxcbiAgICBpbnB1dDogMSxcbiAgICB2ZXJib3NlOiAyLFxuICAgIHByb21wdDogMyxcbiAgICBkZWJ1ZzogNCxcbiAgICBpbmZvOiA1LFxuICAgIGRhdGE6IDYsXG4gICAgaGVscDogNyxcbiAgICB3YXJuOiA4LFxuICAgIGVycm9yOiA5XG4gIH1cblxuICByZXR1cm4gKGxhYmVsKSAtPlxuICAgIHRyYW5zcG9ydCA9IG5ldyAod2luc3Rvbi50cmFuc3BvcnRzLkZpbGUpKHtcbiAgICAgIGxhYmVsOiBsYWJlbFxuICAgICAgbGV2ZWw6ICdkZWJ1ZydcbiAgICAgIHRpbWVzdGFtcDogdHJ1ZVxuICAgICAgIyBwcmV0dHlQcmludDogdHJ1ZVxuICAgICAgIyBjb2xvcml6ZTogdHJ1ZVxuICAgICAgc3RyZWFtOiB3cml0YWJsZVxuICAgICAganNvbjogZmFsc2VcbiAgICB9KVxuICAgICMgSW5pdGlhbGl6ZSBsb2dnZXJcbiAgICB3bG9nZ2VyID0gbmV3ICh3aW5zdG9uLkxvZ2dlcikoe1xuICAgICAgIyBDb25maWd1cmUgdHJhbnNwb3J0c1xuICAgICAgdHJhbnNwb3J0czogW1xuICAgICAgICB0cmFuc3BvcnRcbiAgICAgIF1cbiAgICB9KVxuICAgIHdsb2dnZXIub24oJ2xvZ2dpbmcnLCAodHJhbnNwb3J0LCBsZXZlbCwgbXNnLCBtZXRhKS0+XG4gICAgICBsb2dnZXJMZXZlbCA9IGF0b20/LmNvbmZpZy5nZXQoXFxcbiAgICAgICAgJ2F0b20tYmVhdXRpZnkuZ2VuZXJhbC5sb2dnZXJMZXZlbCcpID8gXCJ3YXJuXCJcbiAgICAgICMgY29uc29sZS5sb2coJ2xvZ2dpbmcnLCBsb2dnZXJMZXZlbCwgYXJndW1lbnRzKVxuICAgICAgbG9nZ2VyTGV2ZWxOdW0gPSBsZXZlbHNbbG9nZ2VyTGV2ZWxdXG4gICAgICBsZXZlbE51bSA9IGxldmVsc1tsZXZlbF1cbiAgICAgIGlmIGxvZ2dlckxldmVsTnVtIDw9IGxldmVsTnVtXG4gICAgICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICAgICAgbGFiZWwgPSBcIiN7cGF0aC5kaXJuYW1lKHRyYW5zcG9ydC5sYWJlbClcXFxuICAgICAgICAgICAgICAgICAgICAuc3BsaXQocGF0aC5zZXApLnJldmVyc2UoKVswXX1cXFxuICAgICAgICAgICAgICAgICAgICAje3BhdGguc2VwfSN7cGF0aC5iYXNlbmFtZSh0cmFuc3BvcnQubGFiZWwpfVwiXG4gICAgICAgIGQgPSBuZXcgRGF0ZSgpXG4gICAgICAgIGNvbnNvbGUubG9nKFwiI3tkLnRvTG9jYWxlRGF0ZVN0cmluZygpfSAje2QudG9Mb2NhbGVUaW1lU3RyaW5nKCl9IC0gI3tsYWJlbH0gWyN7bGV2ZWx9XTogI3ttc2d9XCIsIG1ldGEpXG4gICAgKVxuICAgICMgRXhwb3J0IGxvZ2dlciBtZXRob2RzXG4gICAgbG9nZ2VyTWV0aG9kcyA9IFsnc2lsbHknLCdkZWJ1ZycsJ3ZlcmJvc2UnLCdpbmZvJywnd2FybicsJ2Vycm9yJ11cbiAgICBsb2dnZXIgPSB7fVxuICAgIGZvciBtZXRob2QgaW4gbG9nZ2VyTWV0aG9kc1xuICAgICAgbG9nZ2VyW21ldGhvZF0gPSB3bG9nZ2VyW21ldGhvZF1cbiAgICAjIEFkZCBsb2dnZXIgbGlzdGVuZXJcbiAgICBsb2dnZXIub25Mb2dnaW5nID0gKGhhbmRsZXIpIC0+XG4gICAgICAjIGNvbnNvbGUubG9nKCdvbkxvZ2dpbmcnLCBoYW5kbGVyKVxuICAgICAgc3Vic2NyaXB0aW9uID0gZW1pdHRlci5vbignbG9nZ2luZycsIGhhbmRsZXIpXG4gICAgICAjIGNvbnNvbGUubG9nKCdlbWl0dGVyJywgZW1pdHRlci5oYW5kbGVyc0J5RXZlbnROYW1lLCBzdWJzY3JpcHRpb24pXG4gICAgICByZXR1cm4gc3Vic2NyaXB0aW9uXG4gICAgIyBSZXR1cm4gc2ltcGxpZmllZCBsb2dnZXJcbiAgICByZXR1cm4gbG9nZ2VyXG4iXX0=
