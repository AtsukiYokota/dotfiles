(function() {
  var fs, log, os, path,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  fs = require('fs');

  os = require('os');

  path = require('path');

  log = require('./log');

  module.exports = {
    pythonExecutableRe: function() {
      if (/^win/.test(process.platform)) {
        return /^python(\d+(.\d+)?)?\.exe$/;
      } else {
        return /^python(\d+(.\d+)?)?$/;
      }
    },
    possibleGlobalPythonPaths: function() {
      if (/^win/.test(process.platform)) {
        return ['C:\\Python2.7', 'C:\\Python3.4', 'C:\\Python3.5', 'C:\\Program Files (x86)\\Python 2.7', 'C:\\Program Files (x86)\\Python 3.4', 'C:\\Program Files (x86)\\Python 3.5', 'C:\\Program Files (x64)\\Python 2.7', 'C:\\Program Files (x64)\\Python 3.4', 'C:\\Program Files (x64)\\Python 3.5', 'C:\\Program Files\\Python 2.7', 'C:\\Program Files\\Python 3.4', 'C:\\Program Files\\Python 3.5', (os.homedir()) + "\\AppData\\Local\\Programs\\Python\\Python35-32"];
      } else {
        return ['/usr/local/bin', '/usr/bin', '/bin', '/usr/sbin', '/sbin'];
      }
    },
    readDir: function(dirPath) {
      try {
        return fs.readdirSync(dirPath);
      } catch (error) {
        return [];
      }
    },
    isBinary: function(filePath) {
      try {
        fs.accessSync(filePath, fs.X_OK);
        return true;
      } catch (error) {
        return false;
      }
    },
    lookupInterpreters: function(dirPath) {
      var f, fileName, files, interpreters, j, len, matches, potentialInterpreter;
      interpreters = new Set();
      files = this.readDir(dirPath);
      matches = (function() {
        var j, len, results;
        results = [];
        for (j = 0, len = files.length; j < len; j++) {
          f = files[j];
          if (this.pythonExecutableRe().test(f)) {
            results.push(f);
          }
        }
        return results;
      }).call(this);
      for (j = 0, len = matches.length; j < len; j++) {
        fileName = matches[j];
        potentialInterpreter = path.join(dirPath, fileName);
        if (this.isBinary(potentialInterpreter)) {
          interpreters.add(potentialInterpreter);
        }
      }
      return interpreters;
    },
    applySubstitutions: function(paths) {
      var j, k, len, len1, modPaths, p, project, projectName, ref, ref1;
      modPaths = [];
      for (j = 0, len = paths.length; j < len; j++) {
        p = paths[j];
        if (/\$PROJECT/.test(p)) {
          ref = atom.project.getPaths();
          for (k = 0, len1 = ref.length; k < len1; k++) {
            project = ref[k];
            ref1 = project.split(path.sep), projectName = ref1[ref1.length - 1];
            p = p.replace(/\$PROJECT_NAME/i, projectName);
            p = p.replace(/\$PROJECT/i, project);
            if (indexOf.call(modPaths, p) < 0) {
              modPaths.push(p);
            }
          }
        } else {
          modPaths.push(p);
        }
      }
      return modPaths;
    },
    getInterpreter: function() {
      var envPath, f, interpreters, j, k, len, len1, p, project, ref, ref1, userDefinedPythonPaths;
      userDefinedPythonPaths = this.applySubstitutions(atom.config.get('autocomplete-python.pythonPaths').split(';'));
      interpreters = new Set((function() {
        var j, len, results;
        results = [];
        for (j = 0, len = userDefinedPythonPaths.length; j < len; j++) {
          p = userDefinedPythonPaths[j];
          if (this.isBinary(p)) {
            results.push(p);
          }
        }
        return results;
      }).call(this));
      if (interpreters.size > 0) {
        log.debug('User defined interpreters found', interpreters);
        return interpreters.keys().next().value;
      }
      log.debug('No user defined interpreter found, trying automatic lookup');
      interpreters = new Set();
      ref = atom.project.getPaths();
      for (j = 0, len = ref.length; j < len; j++) {
        project = ref[j];
        ref1 = this.readDir(project);
        for (k = 0, len1 = ref1.length; k < len1; k++) {
          f = ref1[k];
          this.lookupInterpreters(path.join(project, f, 'bin')).forEach(function(i) {
            return interpreters.add(i);
          });
        }
      }
      log.debug('Project level interpreters found', interpreters);
      envPath = (process.env.PATH || '').split(path.delimiter);
      envPath = new Set(envPath.concat(this.possibleGlobalPythonPaths()));
      envPath.forEach((function(_this) {
        return function(potentialPath) {
          return _this.lookupInterpreters(potentialPath).forEach(function(i) {
            return interpreters.add(i);
          });
        };
      })(this));
      log.debug('Total automatically found interpreters', interpreters);
      if (interpreters.size > 0) {
        return interpreters.keys().next().value;
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2ludGVycHJldGVycy1sb29rdXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpQkFBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEdBQUEsR0FBTSxPQUFBLENBQVEsT0FBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsa0JBQUEsRUFBb0IsU0FBQTtNQUNsQixJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLFFBQXBCLENBQUg7QUFDRSxlQUFPLDZCQURUO09BQUEsTUFBQTtBQUdFLGVBQU8sd0JBSFQ7O0lBRGtCLENBQXBCO0lBTUEseUJBQUEsRUFBMkIsU0FBQTtNQUN6QixJQUFHLE1BQU0sQ0FBQyxJQUFQLENBQVksT0FBTyxDQUFDLFFBQXBCLENBQUg7QUFDRSxlQUFPLENBQ0wsZUFESyxFQUVMLGVBRkssRUFHTCxlQUhLLEVBSUwscUNBSkssRUFLTCxxQ0FMSyxFQU1MLHFDQU5LLEVBT0wscUNBUEssRUFRTCxxQ0FSSyxFQVNMLHFDQVRLLEVBVUwsK0JBVkssRUFXTCwrQkFYSyxFQVlMLCtCQVpLLEVBYUgsQ0FBQyxFQUFFLENBQUMsT0FBSCxDQUFBLENBQUQsQ0FBQSxHQUFjLGlEQWJYLEVBRFQ7T0FBQSxNQUFBO0FBaUJFLGVBQU8sQ0FBQyxnQkFBRCxFQUFtQixVQUFuQixFQUErQixNQUEvQixFQUF1QyxXQUF2QyxFQUFvRCxPQUFwRCxFQWpCVDs7SUFEeUIsQ0FOM0I7SUEwQkEsT0FBQSxFQUFTLFNBQUMsT0FBRDtBQUNQO0FBQ0UsZUFBTyxFQUFFLENBQUMsV0FBSCxDQUFlLE9BQWYsRUFEVDtP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QUksQ0FBQyxTQUFwQztNQUNWLE9BQUEsR0FBVSxJQUFJLEdBQUosQ0FBUSxPQUFPLENBQUMsTUFBUixDQUFlLElBQUMsQ0FBQSx5QkFBRCxDQUFBLENBQWYsQ0FBUjtNQUNWLE9BQU8sQ0FBQyxPQUFSLENBQWdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxhQUFEO2lCQUNkLEtBQUMsQ0FBQSxrQkFBRCxDQUFvQixhQUFwQixDQUFrQyxDQUFDLE9BQW5DLENBQTJDLFNBQUMsQ0FBRDttQkFDekMsWUFBWSxDQUFDLEdBQWIsQ0FBaUIsQ0FBakI7VUFEeUMsQ0FBM0M7UUFEYztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBaEI7TUFHQSxHQUFHLENBQUMsS0FBSixDQUFVLHdDQUFWLEVBQW9ELFlBQXBEO01BRUEsSUFBRyxZQUFZLENBQUMsSUFBYixHQUFvQixDQUF2QjtBQUNFLGVBQU8sWUFBWSxDQUFDLElBQWIsQ0FBQSxDQUFtQixDQUFDLElBQXBCLENBQUEsQ0FBMEIsQ0FBQyxNQURwQzs7SUF2QmMsQ0EvRGhCOztBQU5GIiwic291cmNlc0NvbnRlbnQiOlsiZnMgPSByZXF1aXJlICdmcydcbm9zID0gcmVxdWlyZSAnb3MnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmxvZyA9IHJlcXVpcmUgJy4vbG9nJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIHB5dGhvbkV4ZWN1dGFibGVSZTogLT5cbiAgICBpZiAvXndpbi8udGVzdCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICByZXR1cm4gL15weXRob24oXFxkKyguXFxkKyk/KT9cXC5leGUkL1xuICAgIGVsc2VcbiAgICAgIHJldHVybiAvXnB5dGhvbihcXGQrKC5cXGQrKT8pPyQvXG5cbiAgcG9zc2libGVHbG9iYWxQeXRob25QYXRoczogLT5cbiAgICBpZiAvXndpbi8udGVzdCBwcm9jZXNzLnBsYXRmb3JtXG4gICAgICByZXR1cm4gW1xuICAgICAgICAnQzpcXFxcUHl0aG9uMi43J1xuICAgICAgICAnQzpcXFxcUHl0aG9uMy40J1xuICAgICAgICAnQzpcXFxcUHl0aG9uMy41J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDg2KVxcXFxQeXRob24gMi43J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDg2KVxcXFxQeXRob24gMy40J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDg2KVxcXFxQeXRob24gMy41J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDY0KVxcXFxQeXRob24gMi43J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDY0KVxcXFxQeXRob24gMy40J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlcyAoeDY0KVxcXFxQeXRob24gMy41J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQeXRob24gMi43J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQeXRob24gMy40J1xuICAgICAgICAnQzpcXFxcUHJvZ3JhbSBGaWxlc1xcXFxQeXRob24gMy41J1xuICAgICAgICBcIiN7b3MuaG9tZWRpcigpfVxcXFxBcHBEYXRhXFxcXExvY2FsXFxcXFByb2dyYW1zXFxcXFB5dGhvblxcXFxQeXRob24zNS0zMlwiXG4gICAgICBdXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFsnL3Vzci9sb2NhbC9iaW4nLCAnL3Vzci9iaW4nLCAnL2JpbicsICcvdXNyL3NiaW4nLCAnL3NiaW4nXVxuXG4gIHJlYWREaXI6IChkaXJQYXRoKSAtPlxuICAgIHRyeVxuICAgICAgcmV0dXJuIGZzLnJlYWRkaXJTeW5jIGRpclBhdGhcbiAgICBjYXRjaFxuICAgICAgcmV0dXJuIFtdXG5cbiAgaXNCaW5hcnk6IChmaWxlUGF0aCkgLT5cbiAgICB0cnlcbiAgICAgIGZzLmFjY2Vzc1N5bmMgZmlsZVBhdGgsIGZzLlhfT0tcbiAgICAgIHJldHVybiB0cnVlXG4gICAgY2F0Y2hcbiAgICAgIHJldHVybiBmYWxzZVxuXG4gIGxvb2t1cEludGVycHJldGVyczogKGRpclBhdGgpIC0+XG4gICAgaW50ZXJwcmV0ZXJzID0gbmV3IFNldCgpXG4gICAgZmlsZXMgPSBAcmVhZERpcihkaXJQYXRoKVxuICAgIG1hdGNoZXMgPSAoZiBmb3IgZiBpbiBmaWxlcyB3aGVuIEBweXRob25FeGVjdXRhYmxlUmUoKS50ZXN0KGYpKVxuICAgIGZvciBmaWxlTmFtZSBpbiBtYXRjaGVzXG4gICAgICBwb3RlbnRpYWxJbnRlcnByZXRlciA9IHBhdGguam9pbihkaXJQYXRoLCBmaWxlTmFtZSlcbiAgICAgIGlmIEBpc0JpbmFyeShwb3RlbnRpYWxJbnRlcnByZXRlcilcbiAgICAgICAgaW50ZXJwcmV0ZXJzLmFkZChwb3RlbnRpYWxJbnRlcnByZXRlcilcbiAgICByZXR1cm4gaW50ZXJwcmV0ZXJzXG5cbiAgYXBwbHlTdWJzdGl0dXRpb25zOiAocGF0aHMpIC0+XG4gICAgbW9kUGF0aHMgPSBbXVxuICAgIGZvciBwIGluIHBhdGhzXG4gICAgICBpZiAvXFwkUFJPSkVDVC8udGVzdCBwXG4gICAgICAgIGZvciBwcm9qZWN0IGluIGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICAgICAgWy4uLiwgcHJvamVjdE5hbWVdID0gcHJvamVjdC5zcGxpdChwYXRoLnNlcClcbiAgICAgICAgICBwID0gcC5yZXBsYWNlKC9cXCRQUk9KRUNUX05BTUUvaSwgcHJvamVjdE5hbWUpXG4gICAgICAgICAgcCA9IHAucmVwbGFjZSgvXFwkUFJPSkVDVC9pLCBwcm9qZWN0KVxuICAgICAgICAgIGlmIHAgbm90IGluIG1vZFBhdGhzXG4gICAgICAgICAgICBtb2RQYXRocy5wdXNoIHBcbiAgICAgIGVsc2VcbiAgICAgICAgbW9kUGF0aHMucHVzaCBwXG4gICAgcmV0dXJuIG1vZFBhdGhzXG5cbiAgZ2V0SW50ZXJwcmV0ZXI6IC0+XG4gICAgdXNlckRlZmluZWRQeXRob25QYXRocyA9IEBhcHBseVN1YnN0aXR1dGlvbnMoXG4gICAgICBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24ucHl0aG9uUGF0aHMnKS5zcGxpdCgnOycpKVxuICAgIGludGVycHJldGVycyA9IG5ldyBTZXQocCBmb3IgcCBpbiB1c2VyRGVmaW5lZFB5dGhvblBhdGhzIHdoZW4gQGlzQmluYXJ5KHApKVxuICAgIGlmIGludGVycHJldGVycy5zaXplID4gMFxuICAgICAgbG9nLmRlYnVnICdVc2VyIGRlZmluZWQgaW50ZXJwcmV0ZXJzIGZvdW5kJywgaW50ZXJwcmV0ZXJzXG4gICAgICByZXR1cm4gaW50ZXJwcmV0ZXJzLmtleXMoKS5uZXh0KCkudmFsdWVcblxuICAgIGxvZy5kZWJ1ZyAnTm8gdXNlciBkZWZpbmVkIGludGVycHJldGVyIGZvdW5kLCB0cnlpbmcgYXV0b21hdGljIGxvb2t1cCdcbiAgICBpbnRlcnByZXRlcnMgPSBuZXcgU2V0KClcblxuICAgIGZvciBwcm9qZWN0IGluIGF0b20ucHJvamVjdC5nZXRQYXRocygpXG4gICAgICBmb3IgZiBpbiBAcmVhZERpcihwcm9qZWN0KVxuICAgICAgICBAbG9va3VwSW50ZXJwcmV0ZXJzKHBhdGguam9pbihwcm9qZWN0LCBmLCAnYmluJykpLmZvckVhY2ggKGkpIC0+XG4gICAgICAgICAgaW50ZXJwcmV0ZXJzLmFkZChpKVxuICAgIGxvZy5kZWJ1ZyAnUHJvamVjdCBsZXZlbCBpbnRlcnByZXRlcnMgZm91bmQnLCBpbnRlcnByZXRlcnNcbiAgICBlbnZQYXRoID0gKHByb2Nlc3MuZW52LlBBVEggb3IgJycpLnNwbGl0IHBhdGguZGVsaW1pdGVyXG4gICAgZW52UGF0aCA9IG5ldyBTZXQoZW52UGF0aC5jb25jYXQoQHBvc3NpYmxlR2xvYmFsUHl0aG9uUGF0aHMoKSkpXG4gICAgZW52UGF0aC5mb3JFYWNoIChwb3RlbnRpYWxQYXRoKSA9PlxuICAgICAgQGxvb2t1cEludGVycHJldGVycyhwb3RlbnRpYWxQYXRoKS5mb3JFYWNoIChpKSAtPlxuICAgICAgICBpbnRlcnByZXRlcnMuYWRkKGkpXG4gICAgbG9nLmRlYnVnICdUb3RhbCBhdXRvbWF0aWNhbGx5IGZvdW5kIGludGVycHJldGVycycsIGludGVycHJldGVyc1xuXG4gICAgaWYgaW50ZXJwcmV0ZXJzLnNpemUgPiAwXG4gICAgICByZXR1cm4gaW50ZXJwcmV0ZXJzLmtleXMoKS5uZXh0KCkudmFsdWVcbiJdfQ==
