(function() {
  var SublimeSelectEditorHandler, defaultCfg, inputCfg, key, mouseNumMap, os, packageName, selectKeyMap, value;

  packageName = "Sublime-Style-Column-Selection";

  os = require('os');

  SublimeSelectEditorHandler = require('./editor-handler.coffee');

  defaultCfg = (function() {
    switch (os.platform()) {
      case 'win32':
        return {
          selectKey: 'altKey',
          selectKeyName: 'Alt',
          mouseNum: 1,
          mouseName: "Left"
        };
      case 'darwin':
        return {
          selectKey: 'altKey',
          selectKeyName: 'Alt',
          mouseNum: 1,
          mouseName: "Left"
        };
      case 'linux':
        return {
          selectKey: 'shiftKey',
          selectKeyName: 'Shift',
          mouseNum: 1,
          mouseName: "Left"
        };
      default:
        return {
          selectKey: 'shiftKey',
          selectKeyName: 'Shift',
          mouseNum: 1,
          mouseName: "Left"
        };
    }
  })();

  mouseNumMap = {
    Left: 1,
    Middle: 2,
    Right: 3
  };

  selectKeyMap = {
    Shift: 'shiftKey',
    Alt: 'altKey',
    Ctrl: 'ctrlKey'
  };

  if (os.platform() === 'darwin') {
    selectKeyMap.Cmd = 'metaKey';
  }

  selectKeyMap.None = null;

  inputCfg = defaultCfg;

  module.exports = {
    config: {
      mouseButtonTrigger: {
        title: "Mouse Button",
        description: "The mouse button that will trigger column selection. If empty, the default will be used " + defaultCfg.mouseName + " mouse button.",
        type: 'string',
        "enum": (function() {
          var results;
          results = [];
          for (key in mouseNumMap) {
            value = mouseNumMap[key];
            results.push(key);
          }
          return results;
        })(),
        "default": defaultCfg.mouseName
      },
      selectKeyTrigger: {
        title: "Select Key",
        description: "The key that will trigger column selection. If empty, the default will be used " + defaultCfg.selectKeyName + " key.",
        type: 'string',
        "enum": (function() {
          var results;
          results = [];
          for (key in selectKeyMap) {
            value = selectKeyMap[key];
            results.push(key);
          }
          return results;
        })(),
        "default": defaultCfg.selectKeyName
      }
    },
    activate: function(state) {
      this.observers = [];
      this.editor_handler = null;
      this.observers.push(atom.config.observe(packageName + ".mouseButtonTrigger", (function(_this) {
        return function(newValue) {
          inputCfg.mouseName = newValue;
          return inputCfg.mouseNum = mouseNumMap[newValue];
        };
      })(this)));
      this.observers.push(atom.config.observe(packageName + ".selectKeyTrigger", (function(_this) {
        return function(newValue) {
          inputCfg.selectKeyName = newValue;
          return inputCfg.selectKey = selectKeyMap[newValue];
        };
      })(this)));
      this.observers.push(atom.workspace.onDidChangeActivePaneItem(this.switch_editor_handler));
      this.observers.push(atom.workspace.onDidAddPane(this.switch_editor_handler));
      return this.observers.push(atom.workspace.onDidDestroyPane(this.switch_editor_handler));
    },
    deactivate: function() {
      var i, len, observer, ref, ref1;
      if ((ref = this.editor_handler) != null) {
        ref.unsubscribe();
      }
      ref1 = this.observers;
      for (i = 0, len = ref1.length; i < len; i++) {
        observer = ref1[i];
        observer.dispose();
      }
      this.observers = null;
      return this.editor_handler = null;
    },
    switch_editor_handler: (function(_this) {
      return function() {
        var active_editor, ref;
        if ((ref = _this.editor_handler) != null) {
          ref.unsubscribe();
        }
        active_editor = atom.workspace.getActiveTextEditor();
        if (active_editor) {
          _this.editor_handler = new SublimeSelectEditorHandler(active_editor, inputCfg);
          return _this.editor_handler.subscribe();
        }
      };
    })(this)
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL1N1YmxpbWUtU3R5bGUtQ29sdW1uLVNlbGVjdGlvbi9saWIvc3VibGltZS1zZWxlY3QuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWM7O0VBRWQsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLDBCQUFBLEdBQTZCLE9BQUEsQ0FBUSx5QkFBUjs7RUFFN0IsVUFBQTtBQUFhLFlBQU8sRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFQO0FBQUEsV0FDTixPQURNO2VBRVQ7VUFBQSxTQUFBLEVBQWUsUUFBZjtVQUNBLGFBQUEsRUFBZSxLQURmO1VBRUEsUUFBQSxFQUFlLENBRmY7VUFHQSxTQUFBLEVBQWUsTUFIZjs7QUFGUyxXQU1OLFFBTk07ZUFPVDtVQUFBLFNBQUEsRUFBZSxRQUFmO1VBQ0EsYUFBQSxFQUFlLEtBRGY7VUFFQSxRQUFBLEVBQWUsQ0FGZjtVQUdBLFNBQUEsRUFBZSxNQUhmOztBQVBTLFdBV04sT0FYTTtlQVlUO1VBQUEsU0FBQSxFQUFlLFVBQWY7VUFDQSxhQUFBLEVBQWUsT0FEZjtVQUVBLFFBQUEsRUFBZSxDQUZmO1VBR0EsU0FBQSxFQUFlLE1BSGY7O0FBWlM7ZUFpQlQ7VUFBQSxTQUFBLEVBQWUsVUFBZjtVQUNBLGFBQUEsRUFBZSxPQURmO1VBRUEsUUFBQSxFQUFlLENBRmY7VUFHQSxTQUFBLEVBQWUsTUFIZjs7QUFqQlM7OztFQXNCYixXQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQVEsQ0FBUjtJQUNBLE1BQUEsRUFBUSxDQURSO0lBRUEsS0FBQSxFQUFRLENBRlI7OztFQUlGLFlBQUEsR0FDRTtJQUFBLEtBQUEsRUFBTyxVQUFQO0lBQ0EsR0FBQSxFQUFPLFFBRFA7SUFFQSxJQUFBLEVBQU8sU0FGUDs7O0VBSUYsSUFBZ0MsRUFBRSxDQUFDLFFBQUgsQ0FBQSxDQUFBLEtB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SHFCO0lBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQXZDdkI7O0FBN0NGIiwic291cmNlc0NvbnRlbnQiOlsicGFja2FnZU5hbWUgPSBcIlN1YmxpbWUtU3R5bGUtQ29sdW1uLVNlbGVjdGlvblwiXG5cbm9zID0gcmVxdWlyZSAnb3MnXG5TdWJsaW1lU2VsZWN0RWRpdG9ySGFuZGxlciA9IHJlcXVpcmUgJy4vZWRpdG9yLWhhbmRsZXIuY29mZmVlJ1xuXG5kZWZhdWx0Q2ZnID0gc3dpdGNoIG9zLnBsYXRmb3JtKClcbiAgd2hlbiAnd2luMzInXG4gICAgc2VsZWN0S2V5OiAgICAgJ2FsdEtleSdcbiAgICBzZWxlY3RLZXlOYW1lOiAnQWx0J1xuICAgIG1vdXNlTnVtOiAgICAgIDFcbiAgICBtb3VzZU5hbWU6ICAgICBcIkxlZnRcIlxuICB3aGVuICdkYXJ3aW4nXG4gICAgc2VsZWN0S2V5OiAgICAgJ2FsdEtleSdcbiAgICBzZWxlY3RLZXlOYW1lOiAnQWx0J1xuICAgIG1vdXNlTnVtOiAgICAgIDFcbiAgICBtb3VzZU5hbWU6ICAgICBcIkxlZnRcIlxuICB3aGVuICdsaW51eCdcbiAgICBzZWxlY3RLZXk6ICAgICAnc2hpZnRLZXknXG4gICAgc2VsZWN0S2V5TmFtZTogJ1NoaWZ0J1xuICAgIG1vdXNlTnVtOiAgICAgIDFcbiAgICBtb3VzZU5hbWU6ICAgICBcIkxlZnRcIlxuICBlbHNlXG4gICAgc2VsZWN0S2V5OiAgICAgJ3NoaWZ0S2V5J1xuICAgIHNlbGVjdEtleU5hbWU6ICdTaGlmdCdcbiAgICBtb3VzZU51bTogICAgICAxXG4gICAgbW91c2VOYW1lOiAgICAgXCJMZWZ0XCJcblxubW91c2VOdW1NYXAgPVxuICBMZWZ0OiAgIDEsXG4gIE1pZGRsZTogMixcbiAgUmlnaHQ6ICAzXG5cbnNlbGVjdEtleU1hcCA9XG4gIFNoaWZ0OiAnc2hpZnRLZXknLFxuICBBbHQ6ICAgJ2FsdEtleScsXG4gIEN0cmw6ICAnY3RybEtleScsXG5cbnNlbGVjdEtleU1hcC5DbWQgPSAnbWV0YUtleScgaWYgb3MucGxhdGZvcm0oKSA9PSAnZGFyd2luJ1xuXG5zZWxlY3RLZXlNYXAuTm9uZSA9IG51bGxcblxuaW5wdXRDZmcgPSBkZWZhdWx0Q2ZnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBjb25maWc6XG4gICAgbW91c2VCdXR0b25UcmlnZ2VyOlxuICAgICAgdGl0bGU6IFwiTW91c2UgQnV0dG9uXCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBtb3VzZSBidXR0b24gdGhhdCB3aWxsIHRyaWdnZXIgY29sdW1uIHNlbGVjdGlvbi5cbiAgICAgICAgSWYgZW1wdHksIHRoZSBkZWZhdWx0IHdpbGwgYmUgdXNlZCAje2RlZmF1bHRDZmcubW91c2VOYW1lfSBtb3VzZSBidXR0b24uXCJcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBlbnVtOiAoa2V5IGZvciBrZXksIHZhbHVlIG9mIG1vdXNlTnVtTWFwKVxuICAgICAgZGVmYXVsdDogZGVmYXVsdENmZy5tb3VzZU5hbWVcblxuICAgIHNlbGVjdEtleVRyaWdnZXI6XG4gICAgICB0aXRsZTogXCJTZWxlY3QgS2V5XCJcbiAgICAgIGRlc2NyaXB0aW9uOiBcIlRoZSBrZXkgdGhhdCB3aWxsIHRyaWdnZXIgY29sdW1uIHNlbGVjdGlvbi5cbiAgICAgICAgSWYgZW1wdHksIHRoZSBkZWZhdWx0IHdpbGwgYmUgdXNlZCAje2RlZmF1bHRDZmcuc2VsZWN0S2V5TmFtZX0ga2V5LlwiXG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZW51bTogKGtleSBmb3Iga2V5LCB2YWx1ZSBvZiBzZWxlY3RLZXlNYXApXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0Q2ZnLnNlbGVjdEtleU5hbWVcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBvYnNlcnZlcnMgPSBbXVxuICAgIEBlZGl0b3JfaGFuZGxlciA9IG51bGxcblxuICAgIEBvYnNlcnZlcnMucHVzaCBhdG9tLmNvbmZpZy5vYnNlcnZlIFwiI3twYWNrYWdlTmFtZX0ubW91c2VCdXR0b25UcmlnZ2VyXCIsIChuZXdWYWx1ZSkgPT5cbiAgICAgIGlucHV0Q2ZnLm1vdXNlTmFtZSA9IG5ld1ZhbHVlXG4gICAgICBpbnB1dENmZy5tb3VzZU51bSA9IG1vdXNlTnVtTWFwW25ld1ZhbHVlXVxuXG4gICAgQG9ic2VydmVycy5wdXNoIGF0b20uY29uZmlnLm9ic2VydmUgXCIje3BhY2thZ2VOYW1lfS5zZWxlY3RLZXlUcmlnZ2VyXCIsIChuZXdWYWx1ZSkgPT5cbiAgICAgIGlucHV0Q2ZnLnNlbGVjdEtleU5hbWUgPSBuZXdWYWx1ZVxuICAgICAgaW5wdXRDZmcuc2VsZWN0S2V5ID0gc2VsZWN0S2V5TWFwW25ld1ZhbHVlXVxuXG4gICAgQG9ic2VydmVycy5wdXNoIGF0b20ud29ya3NwYWNlLm9uRGlkQ2hhbmdlQWN0aXZlUGFuZUl0ZW0gQHN3aXRjaF9lZGl0b3JfaGFuZGxlclxuICAgIEBvYnNlcnZlcnMucHVzaCBhdG9tLndvcmtzcGFjZS5vbkRpZEFkZFBhbmUgICAgICAgICAgICAgIEBzd2l0Y2hfZWRpdG9yX2hhbmRsZXJcbiAgICBAb2JzZXJ2ZXJzLnB1c2ggYXRvbS53b3Jrc3BhY2Uub25EaWREZXN0cm95UGFuZSAgICAgICAgICBAc3dpdGNoX2VkaXRvcl9oYW5kbGVyXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZWRpdG9yX2hhbmRsZXI/LnVuc3Vic2NyaWJlKClcbiAgICBvYnNlcnZlci5kaXNwb3NlKCkgZm9yIG9ic2VydmVyIGluIEBvYnNlcnZlcnNcbiAgICBAb2JzZXJ2ZXJzID0gbnVsbFxuICAgIEBlZGl0b3JfaGFuZGxlciA9IG51bGxcblxuICBzd2l0Y2hfZWRpdG9yX2hhbmRsZXI6ID0+XG4gICAgQGVkaXRvcl9oYW5kbGVyPy51bnN1YnNjcmliZSgpXG4gICAgYWN0aXZlX2VkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIGlmIGFjdGl2ZV9lZGl0b3JcbiAgICAgIEBlZGl0b3JfaGFuZGxlciA9IG5ldyBTdWJsaW1lU2VsZWN0RWRpdG9ySGFuZGxlcihhY3RpdmVfZWRpdG9yLCBpbnB1dENmZylcbiAgICAgIEBlZGl0b3JfaGFuZGxlci5zdWJzY3JpYmUoKVxuIl19
