Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/* global atom */

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

var _pathsProvider = require('./paths-provider');

var _pathsProvider2 = _interopRequireDefault(_pathsProvider);

var _atom = require('atom');

var _configOptionScopes = require('./config/option-scopes');

var _configOptionScopes2 = _interopRequireDefault(_configOptionScopes);

'use babel';exports['default'] = {
  config: _config2['default'],
  subscriptions: null,

  activate: function activate() {
    var _this = this;

    this.subscriptions = new _atom.CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'autocomplete-paths:rebuild-cache': function autocompletePathsRebuildCache() {
        _this._provider.rebuildCache();
      }
    }));

    var cacheOptions = ['core.ignoredNames', 'core.excludeVcsIgnoredPaths', 'autocomplete-paths.ignoreSubmodules', 'autocomplete-paths.ignoredNames', 'autocomplete-paths.ignoredPatterns'];
    cacheOptions.forEach(function (cacheOption) {
      _this.subscriptions.add(atom.config.observe(cacheOption, function (value) {
        if (!_this._provider) return;
        _this._provider.rebuildCache();
      }));
    });

    var scopeOptions = ['autocomplete-paths.scopes'];
    for (var key in _configOptionScopes2['default']) {
      scopeOptions.push('autocomplete-paths.' + key);
    }
    scopeOptions.forEach(function (scopeOption) {
      _this.subscriptions.add(atom.config.observe(scopeOption, function (value) {
        if (!_this._provider) return;
        _this._provider.reloadScopes();
      }));
    });
  },

  deactivate: function deactivate() {
    this.subscriptions.dispose();
    if (this._provider) {
      this._provider.dispose();
      this._provider = null;
    }
    if (this._statusBarTile) {
      this._statusBarTile.destroy();
      this._statusBarTile = null;
    }
  },

  /**
   * Invoked when the status bar becomes available
   * @param  {StatusBar} statusBar
   */
  consumeStatusBar: function consumeStatusBar(statusBar) {
    this._statusBar = statusBar;
    if (this._displayStatusBarItemOnConsumption) {
      this._displayStatusBarTile();
    }
  },

  /**
   * Displays the status bar tile
   */
  _displayStatusBarTile: function _displayStatusBarTile() {
    var _this2 = this;

    if (!this._statusBar) {
      this._displayStatusBarItemOnConsumption = true;
      return;
    }
    if (this._statusBarTile) return;

    this._statusBarElement = document.createElement('autocomplete-paths-status-bar');
    this._statusBarElement.innerHTML = 'Rebuilding paths cache...';
    this._statusBarTile = this._statusBar.addRightTile({
      item: this._statusBarElement,
      priority: 100
    });
    this._statusBarInterval = setInterval(function () {
      var fileCount = _this2._provider.fileCount;
      _this2._statusBarElement.innerHTML = 'Rebuilding paths cache... ' + fileCount + ' files';
    }, 500);
  },

  /**
   * Hides the status bar tile
   */
  _hideStatusBarTile: function _hideStatusBarTile() {
    clearInterval(this._statusBarInterval);
    this._statusBarTile && this._statusBarTile.destroy();
    this._statusBarTile = null;
    this._statusBarElement = null;
  },

  getProvider: function getProvider() {
    var _this3 = this;

    if (!this._provider) {
      this._provider = new _pathsProvider2['default']();
      this._provider.on('rebuild-cache', function () {
        _this3._displayStatusBarTile();
      });
      this._provider.on('rebuild-cache-done', function () {
        _this3._hideStatusBarTile();
      });
      this._provider.rebuildCache();
    }
    return this._provider;
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL2F1dG9jb21wbGV0ZS1wYXRocy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztzQkFHbUIsVUFBVTs7Ozs2QkFDSCxrQkFBa0I7Ozs7b0JBQ1IsTUFBTTs7a0NBQ2pCLHdCQUF3Qjs7OztBQU5qRCxXQUFXLENBQUEscUJBUUk7QUFDYixRQUFNLHFCQUFRO0FBQ2QsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBRSxvQkFBWTs7O0FBQ3BCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQXlCLENBQUE7QUFDOUMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsd0NBQWtDLEVBQUUseUNBQU07QUFDeEMsY0FBSyxTQUFTLENBQUMsWUFBWSxFQUFFLENBQUE7T0FDOUI7S0FDRixDQUFDLENBQUMsQ0FBQTs7QUFFSCxRQUFNLFlBQVksR0FBRyxDQUNuQixtQkFBbUIsRUFDbkIsNkJBQTZCLEVBQzdCLHFDQUFxQyxFQUNyQyxpQ0FBaUMsRUFDakMsb0NBQW9DLENBQ3JDLENBQUE7QUFDRCxnQkFBWSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFdBQVcsRUFBSTtBQUNsQyxZQUFLLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFVBQUEsS0FBSyxFQUFJO0FBQy9ELFlBQUksQ0FBQyxNQUFLLFNBQVMsRUFBRSxPQUFNO0FBQzNCLGNBQUssU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFBO09BQzlCLENBQUMsQ0FBQyxDQUFBO0tBQ0osQ0FBQyxDQUFBOztBQUVGLFFBQU0sWUFBWSxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQTtBQUNsRCxTQUFLLElBQUksR0FBRyxxQ0FBa0I7QUFDNUIsa0JBQVksQ0FBQyxJQUFJ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Q0FBQyxZQUFZLEVBQUUsQ0FBQTtLQUM5QjtBQUNELFdBQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQTtHQUN0QjtDQUNGIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL2F1dG9jb21wbGV0ZS1wYXRocy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBnbG9iYWwgYXRvbSAqL1xuXG5pbXBvcnQgQ29uZmlnIGZyb20gJy4vY29uZmlnJ1xuaW1wb3J0IFBhdGhzUHJvdmlkZXIgZnJvbSAnLi9wYXRocy1wcm92aWRlcidcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuaW1wb3J0IE9wdGlvblNjb3BlcyBmcm9tICcuL2NvbmZpZy9vcHRpb24tc2NvcGVzJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNvbmZpZzogQ29uZmlnLFxuICBzdWJzY3JpcHRpb25zOiBudWxsLFxuXG4gIGFjdGl2YXRlOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKVxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2F1dG9jb21wbGV0ZS1wYXRoczpyZWJ1aWxkLWNhY2hlJzogKCkgPT4ge1xuICAgICAgICB0aGlzLl9wcm92aWRlci5yZWJ1aWxkQ2FjaGUoKVxuICAgICAgfVxuICAgIH0pKVxuXG4gICAgY29uc3QgY2FjaGVPcHRpb25zID0gW1xuICAgICAgJ2NvcmUuaWdub3JlZE5hbWVzJyxcbiAgICAgICdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnLFxuICAgICAgJ2F1dG9jb21wbGV0ZS1wYXRocy5pZ25vcmVTdWJtb2R1bGVzJyxcbiAgICAgICdhdXRvY29tcGxldGUtcGF0aHMuaWdub3JlZE5hbWVzJyxcbiAgICAgICdhdXRvY29tcGxldGUtcGF0aHMuaWdub3JlZFBhdHRlcm5zJ1xuICAgIF1cbiAgICBjYWNoZU9wdGlvbnMuZm9yRWFjaChjYWNoZU9wdGlvbiA9PiB7XG4gICAgICB0aGlzLnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29uZmlnLm9ic2VydmUoY2FjaGVPcHRpb24sIHZhbHVlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9wcm92aWRlcikgcmV0dXJuXG4gICAgICAgIHRoaXMuX3Byb3ZpZGVyLnJlYnVpbGRDYWNoZSgpXG4gICAgICB9KSlcbiAgICB9KVxuXG4gICAgY29uc3Qgc2NvcGVPcHRpb25zID0gWydhdXRvY29tcGxldGUtcGF0aHMuc2NvcGVzJ11cbiAgICBmb3IgKGxldCBrZXkgaW4gT3B0aW9uU2NvcGVzKSB7XG4gICAgICBzY29wZU9wdGlvbnMucHVzaChgYXV0b2NvbXBsZXRlLXBhdGhzLiR7a2V5fWApXG4gICAgfVxuICAgIHNjb3BlT3B0aW9ucy5mb3JFYWNoKHNjb3BlT3B0aW9uID0+IHtcbiAgICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZShzY29wZU9wdGlvbiwgdmFsdWUgPT4ge1xuICAgICAgICBpZiAoIXRoaXMuX3Byb3ZpZGVyKSByZXR1cm5cbiAgICAgICAgdGhpcy5fcHJvdmlkZXIucmVsb2FkU2NvcGVzKClcbiAgICAgIH0pKVxuICAgIH0pXG4gIH0sXG5cbiAgZGVhY3RpdmF0ZTogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKClcbiAgICBpZiAodGhpcy5fcHJvdmlkZXIpIHtcbiAgICAgIHRoaXMuX3Byb3ZpZGVyLmRpc3Bvc2UoKVxuICAgICAgdGhpcy5fcHJvdmlkZXIgPSBudWxsXG4gICAgfVxuICAgIGlmICh0aGlzLl9zdGF0dXNCYXJUaWxlKSB7XG4gICAgICB0aGlzLl9zdGF0dXNCYXJUaWxlLmRlc3Ryb3koKVxuICAgICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IG51bGxcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEludm9rZWQgd2hlbiB0aGUgc3RhdHVzIGJhciBiZWNvbWVzIGF2YWlsYWJsZVxuICAgKiBAcGFyYW0gIHtTdGF0dXNCYXJ9IHN0YXR1c0JhclxuICAgKi9cbiAgY29uc3VtZVN0YXR1c0JhcjogZnVuY3Rpb24gKHN0YXR1c0Jhcikge1xuICAgIHRoaXMuX3N0YXR1c0JhciA9IHN0YXR1c0JhclxuICAgIGlmICh0aGlzLl9kaXNwbGF5U3RhdHVzQmFySXRlbU9uQ29uc3VtcHRpb24pIHtcbiAgICAgIHRoaXMuX2Rpc3BsYXlTdGF0dXNCYXJUaWxlKClcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIERpc3BsYXlzIHRoZSBzdGF0dXMgYmFyIHRpbGVcbiAgICovXG4gIF9kaXNwbGF5U3RhdHVzQmFyVGlsZSAoKSB7XG4gICAgaWYgKCF0aGlzLl9zdGF0dXNCYXIpIHtcbiAgICAgIHRoaXMuX2Rpc3BsYXlTdGF0dXNCYXJJdGVtT25Db25zdW1wdGlvbiA9IHRydWVcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBpZiAodGhpcy5fc3RhdHVzQmFyVGlsZSkgcmV0dXJuXG5cbiAgICB0aGlzLl9zdGF0dXNCYXJFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYXV0b2NvbXBsZXRlLXBhdGhzLXN0YXR1cy1iYXInKVxuICAgIHRoaXMuX3N0YXR1c0JhckVsZW1lbnQuaW5uZXJIVE1MID0gJ1JlYnVpbGRpbmcgcGF0aHMgY2FjaGUuLi4nXG4gICAgdGhpcy5fc3RhdHVzQmFyVGlsZSA9IHRoaXMuX3N0YXR1c0Jhci5hZGRSaWdodFRpbGUoe1xuICAgICAgaXRlbTogdGhpcy5fc3RhdHVzQmFyRWxlbWVudCxcbiAgICAgIHByaW9yaXR5OiAxMDBcbiAgICB9KVxuICAgIHRoaXMuX3N0YXR1c0JhckludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgY29uc3QgZmlsZUNvdW50ID0gdGhpcy5fcHJvdmlkZXIuZmlsZUNvdW50O1xuICAgICAgdGhpcy5fc3RhdHVzQmFyRWxlbWVudC5pbm5lckhUTUwgPSBgUmVidWlsZGluZyBwYXRocyBjYWNoZS4uLiAke2ZpbGVDb3VudH0gZmlsZXNgO1xuICAgIH0sIDUwMClcbiAgfSxcblxuICAvKipcbiAgICogSGlkZXMgdGhlIHN0YXR1cyBiYXIgdGlsZVxuICAgKi9cbiAgX2hpZGVTdGF0dXNCYXJUaWxlICgpIHtcbiAgICBjbGVhckludGVydmFsKHRoaXMuX3N0YXR1c0JhckludGVydmFsKVxuICAgIHRoaXMuX3N0YXR1c0JhclRpbGUgJiYgdGhpcy5fc3RhdHVzQmFyVGlsZS5kZXN0cm95KClcbiAgICB0aGlzLl9zdGF0dXNCYXJUaWxlID0gbnVsbFxuICAgIHRoaXMuX3N0YXR1c0JhckVsZW1lbnQgPSBudWxsXG4gIH0sXG5cbiAgZ2V0UHJvdmlkZXI6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX3Byb3ZpZGVyKSB7XG4gICAgICB0aGlzLl9wcm92aWRlciA9IG5ldyBQYXRoc1Byb3ZpZGVyKClcbiAgICAgIHRoaXMuX3Byb3ZpZGVyLm9uKCdyZWJ1aWxkLWNhY2hlJywgKCkgPT4ge1xuICAgICAgICB0aGlzLl9kaXNwbGF5U3RhdHVzQmFyVGlsZSgpXG4gICAgICB9KVxuICAgICAgdGhpcy5fcHJvdmlkZXIub24oJ3JlYnVpbGQtY2FjaGUtZG9uZScsICgpID0+IHtcbiAgICAgICAgdGhpcy5faGlkZVN0YXR1c0JhclRpbGUoKVxuICAgICAgfSlcbiAgICAgIHRoaXMuX3Byb3ZpZGVyLnJlYnVpbGRDYWNoZSgpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wcm92aWRlclxuICB9XG59XG4iXX0=