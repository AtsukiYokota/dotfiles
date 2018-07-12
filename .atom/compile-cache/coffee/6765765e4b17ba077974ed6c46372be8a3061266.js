(function() {
  var log, touchbar;

  log = require('./log');

  if (atom.config.get('autocomplete-python.enableTouchBar')) {
    touchbar = require('./touchbar');
  }

  module.exports = {
    _showSignatureOverlay: function(event) {
      var cursor, disableForSelector, editor, getTooltip, i, len, marker, ref, scopeChain, scopeDescriptor, wordBufferRange;
      if (this.markers) {
        ref = this.markers;
        for (i = 0, len = ref.length; i < len; i++) {
          marker = ref[i];
          log.debug('destroying old marker', marker);
          marker.destroy();
        }
      } else {
        this.markers = [];
      }
      cursor = event.cursor;
      editor = event.cursor.editor;
      wordBufferRange = cursor.getCurrentWordBufferRange();
      scopeDescriptor = editor.scopeDescriptorForBufferPosition(event.newBufferPosition);
      scopeChain = scopeDescriptor.getScopeChain();
      disableForSelector = this.disableForSelector + ", .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name";
      disableForSelector = this.Selector.create(disableForSelector);
      if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
        log.debug('do nothing for this selector');
        return;
      }
      marker = editor.markBufferRange(wordBufferRange, {
        invalidate: 'never'
      });
      this.markers.push(marker);
      getTooltip = (function(_this) {
        return function(editor, bufferPosition) {
          var payload;
          payload = {
            id: _this._generateRequestId('tooltip', editor, bufferPosition),
            lookup: 'tooltip',
            path: editor.getPath(),
            source: editor.getText(),
            line: bufferPosition.row,
            column: bufferPosition.column,
            config: _this._generateRequestConfig()
          };
          _this._sendRequest(_this._serialize(payload));
          return new Promise(function(resolve) {
            return _this.requests[payload.id] = resolve;
          });
        };
      })(this);
      return getTooltip(editor, event.newBufferPosition).then((function(_this) {
        return function(results) {
          var column, decoration, description, fileName, line, ref1, text, type, view;
          if (marker.isDestroyed()) {
            return;
          }
          if (results.length > 0) {
            ref1 = results[0], text = ref1.text, fileName = ref1.fileName, line = ref1.line, column = ref1.column, type = ref1.type, description = ref1.description;
            description = description.trim();
            if (!description) {
              return;
            }
            view = document.createElement('autocomplete-python-suggestion');
            view.appendChild(document.createTextNode(description));
            decoration = editor.decorateMarker(marker, {
              type: 'overlay',
              item: view,
              position: 'head'
            });
            if (atom.config.get('autocomplete-python.enableTouchBar')) {
              return touchbar.update(results[0]);
            }
          }
        };
      })(this));
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL3Rvb2x0aXBzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxPQUFSOztFQUNOLElBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG9DQUFoQixDQUFIO0lBQ0UsUUFBQSxHQUFXLE9BQUEsQ0FBUSxZQUFSLEVBRGI7OztFQUdBLE1BQU0sQ0FBQyxPQUFQLEdBQ0E7SUFBQSxxQkFBQSxFQUF1QixTQUFDLEtBQUQ7QUFDckIsVUFBQTtNQUFBLElBQUcsSUFBQyxDQUFBLE9BQUo7QUFDRTtBQUFBLGFBQUEscUNBQUE7O1VBQ0UsR0FBRyxDQUFDLEtBQUosQ0FBVSx1QkFBVixFQUFtQyxNQUFuQztVQUNBLE1BQU0sQ0FBQyxPQUFQLENBQUE7QUFGRixTQURGO09BQUEsTUFBQTtRQUtFLElBQUMsQ0FBQSxPQUFELEdBQVcsR0FMYjs7TUFPQSxNQUFBLEdBQVMsS0FBSyxDQUFDO01BQ2YsTUFBQSxHQUFTLEtBQUssQ0FBQyxNQUFNLENBQUM7TUFDdEIsZUFBQSxHQUFrQixNQUFNLENBQUMseUJBQVAsQ0FBQTtNQUNsQixlQUFBLEdBQWtCLE1BQU0sQ0FBQyxnQ0FBUCxDQUNoQixLQUFLLENBQUMsaUJBRFU7TUFFbEIsVUFBQSxHQUFhLGVBQWUsQ0FBQyxhQUFoQixDQUFBO01BRWIsa0JBQUEsR0FBd0IsSUFBQyxDQUFBLGtCQUFGLEdBQXFCO01BQzVDLGtCQUFBLEdBQXFCLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixrQkFBakI7TUFFckIsSUFBRyxJQUFDLENBQUEsd0JBQUQsQ0FBMEIsa0JBQTFCLEVBQThDLFVBQTlDLENBQUg7UUFDRSxHQUFHLENBQUMsS0FBSixDQUFVLDhCQUFWO0FBQ0EsZUFGRjs7TUFJQSxNQUFBLEdBQVMsTUFBTSxDQUFDLGVBQVAsQ0FBdUIsZUFBdkIsRUFBd0M7UUFBQyxVQUFBLEVBQVksT0FBYjtPQUF4QztNQUVULElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLE1BQWQ7TUFFQSxVQUFBLEdBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE1BQUQsRUFBUyxjQUFUO0FBQ1gsY0FBQTtVQUFBLE9BQUEsR0FDRTtZQUFBLEVBQUEsRUFBSSxLQUFDLENBQUEsa0JBQUQsQ0FBb0IsU0FBcEIsRUFBK0IsTUFBL0IsRUFBdUMsY0FBdkMsQ0FBSjtZQUNBLE1BQUEsRUFBUSxTQURSO1lBRUEsSUFBQSxFQUFNLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FGTjtZQUdBLE1BQUEsRUFBUSxNQUFNLENBQUMsT0FBUCxDQUFBLENBSFI7WUFJQSxJQUFBLEVBQU0sY0FBYyxDQUFDLEdBSnJCO1lBS0EsTUFBQSxFQUFRLGNBQWMsQ0FBQyxNQUx2QjtZQU1BLE1BQUEsRUFBUSxLQUFDLENBQUEsc0JBQUQsQ0FBQSxDQU5SOztVQU9GLEtBQUMsQ0FBQSxZQUFELENBQWMsS0FBQyxDQUFBLFVBQUQsQ0FBWSxPQUFaLENBQWQ7QUFDQSxpQkFBTyxJQUFJLE9BQUosQ0FBWSxTQUFDLE9BQUQ7bUJBQ2pCLEtBQUMsQ0FBQSxRQUFTLENBQUEsT0FBTyxDQUFDLEVBQVIsQ0FBVixHQUF3QjtVQURQLENBQVo7UUFWSTtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7YUFhYixVQUFBLENBQVcsTUFBWCxFQUFtQixLQUFLLENBQUMsaUJBQXpCLENBQTJDLENBQUMsSUFBNUMsQ0FBaUQsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFDLE9BQUQ7QUFDL0MsY0FBQTtVQUFBLElBQUcsTUFBTSxDQUFDLFdBQVAsQ0FBQSxDQUFIO0FBQ0UsbUJBREY7O1VBRUEsSUFBRyxPQUFPLENBQUMsTUFBUixHQUFpQixDQUFwQjtZQUNFLE9BQW9ELE9BQVEsQ0FBQSxDQUFBLENBQTVELEVBQUMsZ0JBQUQsRUFBTyx3QkFBUCxFQUFpQixnQkFBakIsRUFBdUIsb0JBQXZCLEVBQStCLGdCQUEvQixFQUFxQztZQUVyQyxXQUFBLEdBQWMsV0FBVyxDQUFDLElBQVosQ0FBQTtZQUNkLElBQUcsQ0FBSSxXQUFQO0FBQ0UscUJBREY7O1lBRUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLGdDQUF2QjtZQUNQLElBQUksQ0FBQyxXQUFMLENBQWlCLFFBQVEsQ0FBQyxjQUFULENBQXdCLFdBQXhCLENBQWpCO1lBQ0EsVUFBQSxHQUFhLE1BQU0sQ0FBQyxjQUFQLENBQXNCLE1BQXRCLEVBQThCO2NBQ3pDLElBQUEsRUFBTSxTQURtQztjQUV6QyxJQUFBLEVBQU0sSUFGbUM7Y0FHekMsUUFBQSxFQUFVLE1BSCtCO2FBQTlCO1lBS2IsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0Isb0NBQWhCLENBQUg7cUJBQ0UsUUFBUSxDQUFDLE1BQVQsQ0FBZ0IsT0FBUSxDQUFBLENBQUEsQ0FBeEIsRUFERjthQWJGOztRQUgrQztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBakQ7SUF2Q3FCLENBQXZCOztBQUxBIiwic291cmNlc0NvbnRlbnQiOlsibG9nID0gcmVxdWlyZSAnLi9sb2cnXG5pZiBhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1weXRob24uZW5hYmxlVG91Y2hCYXInKVxuICB0b3VjaGJhciA9IHJlcXVpcmUgJy4vdG91Y2hiYXInXG5cbm1vZHVsZS5leHBvcnRzID1cbl9zaG93U2lnbmF0dXJlT3ZlcmxheTogKGV2ZW50KSAtPlxuICBpZiBAbWFya2Vyc1xuICAgIGZvciBtYXJrZXIgaW4gQG1hcmtlcnNcbiAgICAgIGxvZy5kZWJ1ZyAnZGVzdHJveWluZyBvbGQgbWFya2VyJywgbWFya2VyXG4gICAgICBtYXJrZXIuZGVzdHJveSgpXG4gIGVsc2VcbiAgICBAbWFya2VycyA9IFtdXG5cbiAgY3Vyc29yID0gZXZlbnQuY3Vyc29yXG4gIGVkaXRvciA9IGV2ZW50LmN1cnNvci5lZGl0b3JcbiAgd29yZEJ1ZmZlclJhbmdlID0gY3Vyc29yLmdldEN1cnJlbnRXb3JkQnVmZmVyUmFuZ2UoKVxuICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oXG4gICAgZXZlbnQubmV3QnVmZmVyUG9zaXRpb24pXG4gIHNjb3BlQ2hhaW4gPSBzY29wZURlc2NyaXB0b3IuZ2V0U2NvcGVDaGFpbigpXG5cbiAgZGlzYWJsZUZvclNlbGVjdG9yID0gXCIje0BkaXNhYmxlRm9yU2VsZWN0b3J9LCAuc291cmNlLnB5dGhvbiAubnVtZXJpYywgLnNvdXJjZS5weXRob24gLmludGVnZXIsIC5zb3VyY2UucHl0aG9uIC5kZWNpbWFsLCAuc291cmNlLnB5dGhvbiAucHVuY3R1YXRpb24sIC5zb3VyY2UucHl0aG9uIC5rZXl3b3JkLCAuc291cmNlLnB5dGhvbiAuc3RvcmFnZSwgLnNvdXJjZS5weXRob24gLnZhcmlhYmxlLnBhcmFtZXRlciwgLnNvdXJjZS5weXRob24gLmVudGl0eS5uYW1lXCJcbiAgZGlzYWJsZUZvclNlbGVjdG9yID0gQFNlbGVjdG9yLmNyZWF0ZShkaXNhYmxlRm9yU2VsZWN0b3IpXG5cbiAgaWYgQHNlbGVjdG9yc01hdGNoU2NvcGVDaGFpbihkaXNhYmxlRm9yU2VsZWN0b3IsIHNjb3BlQ2hhaW4pXG4gICAgbG9nLmRlYnVnICdkbyBub3RoaW5nIGZvciB0aGlzIHNlbGVjdG9yJ1xuICAgIHJldHVyblxuXG4gIG1hcmtlciA9IGVkaXRvci5tYXJrQnVmZmVyUmFuZ2Uod29yZEJ1ZmZlclJhbmdlLCB7aW52YWxpZGF0ZTogJ25ldmVyJ30pXG5cbiAgQG1hcmtlcnMucHVzaChtYXJrZXIpXG5cbiAgZ2V0VG9vbHRpcCA9IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSA9PlxuICAgIHBheWxvYWQgPVxuICAgICAgaWQ6IEBfZ2VuZXJhdGVSZXF1ZXN0SWQoJ3Rvb2x0aXAnLCBlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgbG9va3VwOiAndG9vbHRpcCdcbiAgICAgIHBhdGg6IGVkaXRvci5nZXRQYXRoKClcbiAgICAgIHNvdXJjZTogZWRpdG9yLmdldFRleHQoKVxuICAgICAgbGluZTogYnVmZmVyUG9zaXRpb24ucm93XG4gICAgICBjb2x1bW46IGJ1ZmZlclBvc2l0aW9uLmNvbHVtblxuICAgICAgY29uZmlnOiBAX2dlbmVyYXRlUmVxdWVzdENvbmZpZygpXG4gICAgQF9zZW5kUmVxdWVzdChAX3NlcmlhbGl6ZShwYXlsb2FkKSlcbiAgICByZXR1cm4gbmV3IFByb21pc2UgKHJlc29sdmUpID0+XG4gICAgICBAcmVxdWVzdHNbcGF5bG9hZC5pZF0gPSByZXNvbHZlXG5cbiAgZ2V0VG9vbHRpcChlZGl0b3IsIGV2ZW50Lm5ld0J1ZmZlclBvc2l0aW9uKS50aGVuIChyZXN1bHRzKSA9PlxuICAgIGlmIG1hcmtlci5pc0Rlc3Ryb3llZCgpXG4gICAgICByZXR1cm5cbiAgICBpZiByZXN1bHRzLmxlbmd0aCA+IDBcbiAgICAgIHt0ZXh0LCBmaWxlTmFtZSwgbGluZSwgY29sdW1uLCB0eXBlLCBkZXNjcmlwdGlvbn0gPSByZXN1bHRzWzBdXG5cbiAgICAgIGRlc2NyaXB0aW9uID0gZGVzY3JpcHRpb24udHJpbSgpXG4gICAgICBpZiBub3QgZGVzY3JpcHRpb25cbiAgICAgICAgcmV0dXJuXG4gICAgICB2aWV3ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXV0b2NvbXBsZXRlLXB5dGhvbi1zdWdnZXN0aW9uJylcbiAgICAgIHZpZXcuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGVzY3JpcHRpb24pKVxuICAgICAgZGVjb3JhdGlvbiA9IGVkaXRvci5kZWNvcmF0ZU1hcmtlcihtYXJrZXIsIHtcbiAgICAgICAgdHlwZTogJ292ZXJsYXknLFxuICAgICAgICBpdGVtOiB2aWV3LFxuICAgICAgICBwb3NpdGlvbjogJ2hlYWQnXG4gICAgICB9KVxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLmVuYWJsZVRvdWNoQmFyJylcbiAgICAgICAgdG91Y2hiYXIudXBkYXRlKHJlc3VsdHNbMF0pXG4iXX0=
