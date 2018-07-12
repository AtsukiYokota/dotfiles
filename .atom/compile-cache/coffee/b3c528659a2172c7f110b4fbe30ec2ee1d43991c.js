(function() {
  module.exports = {
    priority: 1,
    providerName: 'autocomplete-python',
    disableForSelector: '.source.python .comment, .source.python .string, .source.python .numeric, .source.python .integer, .source.python .decimal, .source.python .punctuation, .source.python .keyword, .source.python .storage, .source.python .variable.parameter, .source.python .entity.name',
    constructed: false,
    constructor: function() {
      this.provider = require('./provider');
      this.log = require('./log');
      this.selectorsMatchScopeChain = require('./scope-helpers').selectorsMatchScopeChain;
      this.Selector = require('selector-kit').Selector;
      this.constructed = true;
      return this.log.debug('Loading python hyper-click provider...');
    },
    _getScopes: function(editor, range) {
      return editor.scopeDescriptorForBufferPosition(range).scopes;
    },
    getSuggestionForWord: function(editor, text, range) {
      var bufferPosition, callback, disableForSelector, scopeChain, scopeDescriptor;
      if (!this.constructed) {
        this.constructor();
      }
      if (text === '.' || text === ':') {
        return;
      }
      if (editor.getGrammar().scopeName.indexOf('source.python') > -1) {
        bufferPosition = range.start;
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(bufferPosition);
        scopeChain = scopeDescriptor.getScopeChain();
        disableForSelector = this.Selector.create(this.disableForSelector);
        if (this.selectorsMatchScopeChain(disableForSelector, scopeChain)) {
          return;
        }
        if (atom.config.get('autocomplete-python.outputDebug')) {
          this.log.debug(range.start, this._getScopes(editor, range.start));
          this.log.debug(range.end, this._getScopes(editor, range.end));
        }
        callback = (function(_this) {
          return function() {
            return _this.provider.load().goToDefinition(editor, bufferPosition);
          };
        })(this);
        return {
          range: range,
          callback: callback
        };
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL2h5cGVyY2xpY2stcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLFFBQUEsRUFBVSxDQUFWO0lBQ0EsWUFBQSxFQUFjLHFCQURkO0lBRUEsa0JBQUEsRUFBb0IsNFFBRnBCO0lBR0EsV0FBQSxFQUFhLEtBSGI7SUFLQSxXQUFBLEVBQWEsU0FBQTtNQUNYLElBQUMsQ0FBQSxRQUFELEdBQVksT0FBQSxDQUFRLFlBQVI7TUFDWixJQUFDLENBQUEsR0FBRCxHQUFPLE9BQUEsQ0FBUSxPQUFSO01BQ04sSUFBQyxDQUFBLDJCQUE0QixPQUFBLENBQVEsaUJBQVIsRUFBNUI7TUFDRCxJQUFDLENBQUEsV0FBWSxPQUFBLENBQVEsY0FBUixFQUFaO01BQ0YsSUFBQyxDQUFBLFdBQUQsR0FBZTthQUNmLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLHdDQUFYO0lBTlcsQ0FMYjtJQWFBLFVBQUEsRUFBWSxTQUFDLE1BQUQsRUFBUyxLQUFUO0FBQ1YsYUFBTyxNQUFNLENBQUMsZ0NBQVAsQ0FBd0MsS0FBeEMsQ0FBOEMsQ0FBQztJQUQ1QyxDQWJaO0lBZ0JBLG9CQUFBLEVBQXNCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxLQUFmO0FBQ3BCLFVBQUE7TUFBQSxJQUFHLENBQUksSUFBQyxDQUFBLFdBQVI7UUFDRSxJQUFDLENBQUEsV0FBRCxDQUFBLEVBREY7O01BRUEsSUFBRyxJQUFBLEtBQVMsR0FBVCxJQUFBLElBQUEsS0FBYyxHQUFqQjtBQUNFLGVBREY7O01BRUEsSUFBRyxNQUFNLENBQUMsVUFBUCxDQUFBLENBQW1CLENBQUMsU0FBUyxDQUFDLE9BQTlCLENBQXNDLGVBQXRDLENBQUEsR0FBeUQsQ0FBQyxDQUE3RDtRQUNFLGNBQUEsR0FBaUIsS0FBSyxDQUFDO1FBQ3ZCLGVBQUEsR0FBa0IsTUFBTSxDQUFDLGdDQUFQLENBQ2hCLGNBRGdCO1FBRWxCLFVBQUEsR0FBYSxlQUFlLENBQUMsYUFBaEIsQ0FBQTtRQUNiLGtCQUFBLEdBQXFCLElBQUMsQ0FBQSxRQUFRLENBQUMsTUFBVixDQUFpQixJQUFDLENBQUEsa0JBQWxCO1FBQ3JCLElBQUcsSUFBQyxDQUFBLHdCQUFELENBQTBCLGtCQUExQixFQUE4QyxVQUE5QyxDQUFIO0FBQ0UsaUJBREY7O1FBR0EsSUFBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCLENBQUg7VUFDRSxJQUFDLENBQUEsR0FBRyxDQUFDLEtBQUwsQ0FBVyxLQUFLLENBQUMsS0FBakIsRUFBd0IsSUFBQyxDQUFBLFVBQUQsQ0FBWSxNQUFaLEVBQW9CLEtBQUssQ0FBQyxLQUExQixDQUF4QjtVQUNBLElBQUMsQ0FBQSxHQUFHLENBQUMsS0FBTCxDQUFXLEtBQUssQ0FBQyxHQUFqQixFQUFzQixJQUFDLENBQUEsVUFBRCxDQUFZLE1BQVosRUFBb0IsS0FBSyxDQUFDLEdBQTFCLENBQXRCLEVBRkY7O1FBR0EsUUFBQSxHQUFXLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ1QsS0FBQyxDQUFBLFFBQVEsQ0FBQyxJQUFWLENBQUEsQ0FBZ0IsQ0FBQyxjQUFqQixDQUFnQyxNQUFoQyxFQUF3QyxjQUF4QztVQURTO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQTtBQUVYLGVBQU87VUFBQyxPQUFBLEtBQUQ7VUFBUSxVQUFBLFFBQVI7VUFkVDs7SUFMb0IsQ0FoQnRCOztBQURGIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPVxuICBwcmlvcml0eTogMVxuICBwcm92aWRlck5hbWU6ICdhdXRvY29tcGxldGUtcHl0aG9uJ1xuICBkaXNhYmxlRm9yU2VsZWN0b3I6ICcuc291cmNlLnB5dGhvbiAuY29tbWVudCwgLnNvdXJjZS5weXRob24gLnN0cmluZywgLnNvdXJjZS5weXRob24gLm51bWVyaWMsIC5zb3VyY2UucHl0aG9uIC5pbnRlZ2VyLCAuc291cmNlLnB5dGhvbiAuZGVjaW1hbCwgLnNvdXJjZS5weXRob24gLnB1bmN0dWF0aW9uLCAuc291cmNlLnB5dGhvbiAua2V5d29yZCwgLnNvdXJjZS5weXRob24gLnN0b3JhZ2UsIC5zb3VyY2UucHl0aG9uIC52YXJpYWJsZS5wYXJhbWV0ZXIsIC5zb3VyY2UucHl0aG9uIC5lbnRpdHkubmFtZSdcbiAgY29uc3RydWN0ZWQ6IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHByb3ZpZGVyID0gcmVxdWlyZSAnLi9wcm92aWRlcidcbiAgICBAbG9nID0gcmVxdWlyZSAnLi9sb2cnXG4gICAge0BzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW59ID0gcmVxdWlyZSAnLi9zY29wZS1oZWxwZXJzJ1xuICAgIHtAU2VsZWN0b3J9ID0gcmVxdWlyZSAnc2VsZWN0b3Ita2l0J1xuICAgIEBjb25zdHJ1Y3RlZCA9IHRydWVcbiAgICBAbG9nLmRlYnVnICdMb2FkaW5nIHB5dGhvbiBoeXBlci1jbGljayBwcm92aWRlci4uLidcblxuICBfZ2V0U2NvcGVzOiAoZWRpdG9yLCByYW5nZSkgLT5cbiAgICByZXR1cm4gZWRpdG9yLnNjb3BlRGVzY3JpcHRvckZvckJ1ZmZlclBvc2l0aW9uKHJhbmdlKS5zY29wZXNcblxuICBnZXRTdWdnZXN0aW9uRm9yV29yZDogKGVkaXRvciwgdGV4dCwgcmFuZ2UpIC0+XG4gICAgaWYgbm90IEBjb25zdHJ1Y3RlZFxuICAgICAgQGNvbnN0cnVjdG9yKClcbiAgICBpZiB0ZXh0IGluIFsnLicsICc6J11cbiAgICAgIHJldHVyblxuICAgIGlmIGVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lLmluZGV4T2YoJ3NvdXJjZS5weXRob24nKSA+IC0xXG4gICAgICBidWZmZXJQb3NpdGlvbiA9IHJhbmdlLnN0YXJ0XG4gICAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oXG4gICAgICAgIGJ1ZmZlclBvc2l0aW9uKVxuICAgICAgc2NvcGVDaGFpbiA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZUNoYWluKClcbiAgICAgIGRpc2FibGVGb3JTZWxlY3RvciA9IEBTZWxlY3Rvci5jcmVhdGUoQGRpc2FibGVGb3JTZWxlY3RvcilcbiAgICAgIGlmIEBzZWxlY3RvcnNNYXRjaFNjb3BlQ2hhaW4oZGlzYWJsZUZvclNlbGVjdG9yLCBzY29wZUNoYWluKVxuICAgICAgICByZXR1cm5cblxuICAgICAgaWYgYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcHl0aG9uLm91dHB1dERlYnVnJylcbiAgICAgICAgQGxvZy5kZWJ1ZyByYW5nZS5zdGFydCwgQF9nZXRTY29wZXMoZWRpdG9yLCByYW5nZS5zdGFydClcbiAgICAgICAgQGxvZy5kZWJ1ZyByYW5nZS5lbmQsIEBfZ2V0U2NvcGVzKGVkaXRvciwgcmFuZ2UuZW5kKVxuICAgICAgY2FsbGJhY2sgPSA9PlxuICAgICAgICBAcHJvdmlkZXIubG9hZCgpLmdvVG9EZWZpbml0aW9uKGVkaXRvciwgYnVmZmVyUG9zaXRpb24pXG4gICAgICByZXR1cm4ge3JhbmdlLCBjYWxsYmFja31cbiJdfQ==
