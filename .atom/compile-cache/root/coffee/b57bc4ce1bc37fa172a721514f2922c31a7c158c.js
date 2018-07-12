(function() {
  var CompositeDisposable, MinimapFindAndReplaceBinding;

  CompositeDisposable = require('atom').CompositeDisposable;

  MinimapFindAndReplaceBinding = null;

  module.exports = {
    active: false,
    bindingsById: {},
    subscriptionsById: {},
    isActive: function() {
      return this.active;
    },
    activate: function(state) {
      return this.subscriptions = new CompositeDisposable;
    },
    consumeMinimapServiceV1: function(minimap1) {
      this.minimap = minimap1;
      return this.minimap.registerPlugin('find-and-replace', this);
    },
    deactivate: function() {
      this.minimap.unregisterPlugin('find-and-replace');
      return this.minimap = null;
    },
    activatePlugin: function() {
      var fnrHasServiceAPI, fnrVersion;
      if (this.active) {
        return;
      }
      this.active = true;
      fnrVersion = atom.packages.getLoadedPackage('find-and-replace').metadata.version;
      fnrHasServiceAPI = parseFloat(fnrVersion) >= 0.194;
      if (fnrHasServiceAPI) {
        this.initializeServiceAPI();
      } else {
        this.initializeLegacyAPI();
      }
      return this.subscriptions.add(atom.commands.add('atom-workspace', {
        'find-and-replace:show': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'find-and-replace:toggle': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'find-and-replace:show-replace': (function(_this) {
          return function() {
            return _this.discoverMarkers();
          };
        })(this),
        'core:cancel': (function(_this) {
          return function() {
            return _this.clearBindings();
          };
        })(this),
        'core:close': (function(_this) {
          return function() {
            return _this.clearBindings();
          };
        })(this)
      }));
    },
    initializeServiceAPI: function() {
      return atom.packages.serviceHub.consume('find-and-replace', '0.0.1', (function(_this) {
        return function(fnr) {
          return _this.subscriptions.add(_this.minimap.observeMinimaps(function(minimap) {
            var binding, id;
            if (MinimapFindAndReplaceBinding == null) {
              MinimapFindAndReplaceBinding = require('./minimap-find-and-replace-binding');
            }
            id = minimap.id;
            binding = new MinimapFindAndReplaceBinding(minimap, fnr);
            _this.bindingsById[id] = binding;
            return _this.subscriptionsById[id] = minimap.onDidDestroy(function() {
              var ref, ref1;
              if ((ref = _this.subscriptionsById[id]) != null) {
                ref.dispose();
              }
              if ((ref1 = _this.bindingsById[id]) != null) {
                ref1.destroy();
              }
              delete _this.bindingsById[id];
              return delete _this.subscriptionsById[id];
            });
          }));
        };
      })(this));
    },
    initializeLegacyAPI: function() {
      return this.subscriptions.add(this.minimap.observeMinimaps((function(_this) {
        return function(minimap) {
          var binding, id;
          if (MinimapFindAndReplaceBinding == null) {
            MinimapFindAndReplaceBinding = require('./minimap-find-and-replace-binding');
          }
          id = minimap.id;
          binding = new MinimapFindAndReplaceBinding(minimap);
          _this.bindingsById[id] = binding;
          return _this.subscriptionsById[id] = minimap.onDidDestroy(function() {
            var ref, ref1;
            if ((ref = _this.subscriptionsById[id]) != null) {
              ref.dispose();
            }
            if ((ref1 = _this.bindingsById[id]) != null) {
              ref1.destroy();
            }
            delete _this.bindingsById[id];
            return delete _this.subscriptionsById[id];
          });
        };
      })(this)));
    },
    deactivatePlugin: function() {
      var binding, id, ref, ref1, sub;
      if (!this.active) {
        return;
      }
      this.active = false;
      this.subscriptions.dispose();
      ref = this.subscriptionsById;
      for (id in ref) {
        sub = ref[id];
        sub.dispose();
      }
      ref1 = this.bindingsById;
      for (id in ref1) {
        binding = ref1[id];
        binding.destroy();
      }
      this.bindingsById = {};
      return this.subscriptionsById = {};
    },
    discoverMarkers: function() {
      var binding, id, ref, results;
      ref = this.bindingsById;
      results = [];
      for (id in ref) {
        binding = ref[id];
        results.push(binding.discoverMarkers());
      }
      return results;
    },
    clearBindings: function() {
      var binding, id, ref, results;
      ref = this.bindingsById;
      results = [];
      for (id in ref) {
        binding = ref[id];
        results.push(binding.clear());
      }
      return results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS9saWIvbWluaW1hcC1maW5kLWFuZC1yZXBsYWNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUN4Qiw0QkFBQSxHQUErQjs7RUFFL0IsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFBUSxLQUFSO0lBQ0EsWUFBQSxFQUFjLEVBRGQ7SUFFQSxpQkFBQSxFQUFtQixFQUZuQjtJQUlBLFFBQUEsRUFBVSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUosQ0FKVjtJQU1BLFFBQUEsRUFBVSxTQUFDLEtBQUQ7YUFDUixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFJO0lBRGIsQ0FOVjtJQVNBLHVCQUFBLEVBQXlCLFNBQUMsUUFBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO2FBQ3hCLElBQUMsQ0FBQSxPQUFPLENBQUMsY0FBVCxDQUF3QixrQkFBeEIsRUFBNEMsSUFBNUM7SUFEdUIsQ0FUekI7SUFZQSxVQUFBLEVBQVksU0FBQTtNQUNWLElBQUMsQ0FBQSxPQUFPLENBQUMsZ0JBQVQsQ0FBMEIsa0JBQTFCO2FBQ0EsSUFBQyxDQUFBLE9BQUQsR0FBVztJQUZELENBWlo7SUFnQkEsY0FBQSxFQUFnQixTQUFBO0FBQ2QsVUFBQTtNQUFBLElBQVUsSUFBQyxDQUFBLE1BQVg7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFFVixVQUFBLEdBQWEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQixrQkFBL0IsQ0FBa0QsQ0FBQyxRQUFRLENBQUM7TUFDekUsZ0JBQUEsR0FBbUIsVUFBQSxDQUFXLFVBQVgsQ0FBQSxJQUEwQjtNQUU3QyxJQUFHLGdCQUFIO1FBQ0UsSUFBQyxDQUFBLG9CQUFELENBQUEsRUFE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Q0FBckI7UUFQaUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXpCLENBQW5CO0lBRG1CLENBcERyQjtJQW1FQSxnQkFBQSxFQUFrQixTQUFBO0FBQ2hCLFVBQUE7TUFBQSxJQUFBLENBQWMsSUFBQyxDQUFBLE1BQWY7QUFBQSxlQUFBOztNQUVBLElBQUMsQ0FBQSxNQUFELEdBQVU7TUFDVixJQUFDLENBQUEsYUFBYSxDQUFDLE9BQWYsQ0FBQTtBQUVBO0FBQUEsV0FBQSxTQUFBOztRQUFBLEdBQUcsQ0FBQyxPQUFKLENBQUE7QUFBQTtBQUNBO0FBQUEsV0FBQSxVQUFBOztRQUFBLE9BQU8sQ0FBQyxPQUFSLENBQUE7QUFBQTtNQUVBLElBQUMsQ0FBQSxZQUFELEdBQWdCO2FBQ2hCLElBQUMsQ0FBQSxpQkFBRCxHQUFxQjtJQVZMLENBbkVsQjtJQStFQSxlQUFBLEVBQWlCLFNBQUE7QUFDZixVQUFBO0FBQUE7QUFBQTtXQUFBLFNBQUE7O3FCQUFBLE9BQU8sQ0FBQyxlQUFSLENBQUE7QUFBQTs7SUFEZSxDQS9FakI7SUFrRkEsYUFBQSxFQUFlLFNBQUE7QUFDYixVQUFBO0FBQUE7QUFBQTtXQUFBLFNBQUE7O3FCQUFBLE9BQU8sQ0FBQyxLQUFSLENBQUE7QUFBQTs7SUFEYSxDQWxGZjs7QUFKRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlfSA9IHJlcXVpcmUgJ2F0b20nXG5NaW5pbWFwRmluZEFuZFJlcGxhY2VCaW5kaW5nID0gbnVsbFxuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGFjdGl2ZTogZmFsc2VcbiAgYmluZGluZ3NCeUlkOiB7fVxuICBzdWJzY3JpcHRpb25zQnlJZDoge31cblxuICBpc0FjdGl2ZTogLT4gQGFjdGl2ZVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gIGNvbnN1bWVNaW5pbWFwU2VydmljZVYxOiAoQG1pbmltYXApIC0+XG4gICAgQG1pbmltYXAucmVnaXN0ZXJQbHVnaW4gJ2ZpbmQtYW5kLXJlcGxhY2UnLCB0aGlzXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAbWluaW1hcC51bnJlZ2lzdGVyUGx1Z2luICdmaW5kLWFuZC1yZXBsYWNlJ1xuICAgIEBtaW5pbWFwID0gbnVsbFxuXG4gIGFjdGl2YXRlUGx1Z2luOiAtPlxuICAgIHJldHVybiBpZiBAYWN0aXZlXG5cbiAgICBAYWN0aXZlID0gdHJ1ZVxuXG4gICAgZm5yVmVyc2lvbiA9IGF0b20ucGFja2FnZXMuZ2V0TG9hZGVkUGFja2FnZSgnZmluZC1hbmQtcmVwbGFjZScpLm1ldGFkYXRhLnZlcnNpb25cbiAgICBmbnJIYXNTZXJ2aWNlQVBJID0gcGFyc2VGbG9hdChmbnJWZXJzaW9uKSA+PSAwLjE5NFxuXG4gICAgaWYgZm5ySGFzU2VydmljZUFQSVxuICAgICAgQGluaXRpYWxpemVTZXJ2aWNlQVBJKClcbiAgICBlbHNlXG4gICAgICBAaW5pdGlhbGl6ZUxlZ2FjeUFQSSgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJyxcbiAgICAgICdmaW5kLWFuZC1yZXBsYWNlOnNob3cnOiA9PiBAZGlzY292ZXJNYXJrZXJzKClcbiAgICAgICdmaW5kLWFuZC1yZXBsYWNlOnRvZ2dsZSc6ID0+IEBkaXNjb3Zlck1hcmtlcnMoKVxuICAgICAgJ2ZpbmQtYW5kLXJlcGxhY2U6c2hvdy1yZXBsYWNlJzogPT4gQGRpc2NvdmVyTWFya2VycygpXG4gICAgICAnY29yZTpjYW5jZWwnOiA9PiBAY2xlYXJCaW5kaW5ncygpXG4gICAgICAnY29yZTpjbG9zZSc6ID0+IEBjbGVhckJpbmRpbmdzKClcblxuICBpbml0aWFsaXplU2VydmljZUFQSTogLT5cbiAgICBhdG9tLnBhY2thZ2VzLnNlcnZpY2VIdWIuY29uc3VtZSAnZmluZC1hbmQtcmVwbGFjZScsICcwLjAuMScsIChmbnIpID0+XG4gICAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub2JzZXJ2ZU1pbmltYXBzIChtaW5pbWFwKSA9PlxuICAgICAgICBNaW5pbWFwRmluZEFuZFJlcGxhY2VCaW5kaW5nID89IHJlcXVpcmUgJy4vbWluaW1hcC1maW5kLWFuZC1yZXBsYWNlLWJpbmRpbmcnXG5cbiAgICAgICAgaWQgPSBtaW5pbWFwLmlkXG4gICAgICAgIGJpbmRpbmcgPSBuZXcgTWluaW1hcEZpbmRBbmRSZXBsYWNlQmluZGluZyhtaW5pbWFwLCBmbnIpXG4gICAgICAgIEBiaW5kaW5nc0J5SWRbaWRdID0gYmluZGluZ1xuXG4gICAgICAgIEBzdWJzY3JpcHRpb25zQnlJZFtpZF0gPSBtaW5pbWFwLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICAgIEBzdWJzY3JpcHRpb25zQnlJZFtpZF0/LmRpc3Bvc2UoKVxuICAgICAgICAgIEBiaW5kaW5nc0J5SWRbaWRdPy5kZXN0cm95KClcblxuICAgICAgICAgIGRlbGV0ZSBAYmluZGluZ3NCeUlkW2lkXVxuICAgICAgICAgIGRlbGV0ZSBAc3Vic2NyaXB0aW9uc0J5SWRbaWRdXG5cbiAgaW5pdGlhbGl6ZUxlZ2FjeUFQSTogLT5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQG1pbmltYXAub2JzZXJ2ZU1pbmltYXBzIChtaW5pbWFwKSA9PlxuICAgICAgTWluaW1hcEZpbmRBbmRSZXBsYWNlQmluZGluZyA/PSByZXF1aXJlICcuL21pbmltYXAtZmluZC1hbmQtcmVwbGFjZS1iaW5kaW5nJ1xuXG4gICAgICBpZCA9IG1pbmltYXAuaWRcbiAgICAgIGJpbmRpbmcgPSBuZXcgTWluaW1hcEZpbmRBbmRSZXBsYWNlQmluZGluZyhtaW5pbWFwKVxuICAgICAgQGJpbmRpbmdzQnlJZFtpZF0gPSBiaW5kaW5nXG5cbiAgICAgIEBzdWJzY3JpcHRpb25zQnlJZFtpZF0gPSBtaW5pbWFwLm9uRGlkRGVzdHJveSA9PlxuICAgICAgICBAc3Vic2NyaXB0aW9uc0J5SWRbaWRdPy5kaXNwb3NlKClcbiAgICAgICAgQGJpbmRpbmdzQnlJZFtpZF0/LmRlc3Ryb3koKVxuXG4gICAgICAgIGRlbGV0ZSBAYmluZGluZ3NCeUlkW2lkXVxuICAgICAgICBkZWxldGUgQHN1YnNjcmlwdGlvbnNCeUlkW2lkXVxuXG4gIGRlYWN0aXZhdGVQbHVnaW46IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAYWN0aXZlXG5cbiAgICBAYWN0aXZlID0gZmFsc2VcbiAgICBAc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcblxuICAgIHN1Yi5kaXNwb3NlKCkgZm9yIGlkLHN1YiBvZiBAc3Vic2NyaXB0aW9uc0J5SWRcbiAgICBiaW5kaW5nLmRlc3Ryb3koKSBmb3IgaWQsYmluZGluZyBvZiBAYmluZGluZ3NCeUlkXG5cbiAgICBAYmluZGluZ3NCeUlkID0ge31cbiAgICBAc3Vic2NyaXB0aW9uc0J5SWQgPSB7fVxuXG4gIGRpc2NvdmVyTWFya2VyczogLT5cbiAgICBiaW5kaW5nLmRpc2NvdmVyTWFya2VycygpIGZvciBpZCxiaW5kaW5nIG9mIEBiaW5kaW5nc0J5SWRcblxuICBjbGVhckJpbmRpbmdzOiAtPlxuICAgIGJpbmRpbmcuY2xlYXIoKSBmb3IgaWQsYmluZGluZyBvZiBAYmluZGluZ3NCeUlkXG4iXX0=
