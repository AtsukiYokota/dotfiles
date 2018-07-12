Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* global atom */

var _events = require('events');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _slash = require('slash');

var _slash2 = _interopRequireDefault(_slash);

var _pathsCache = require('./paths-cache');

var _pathsCache2 = _interopRequireDefault(_pathsCache);

var _fuzzaldrinPlus = require('fuzzaldrin-plus');

var _fuzzaldrinPlus2 = _interopRequireDefault(_fuzzaldrinPlus);

var _configDefaultScopes = require('./config/default-scopes');

var _configDefaultScopes2 = _interopRequireDefault(_configDefaultScopes);

var _configOptionScopes = require('./config/option-scopes');

var _configOptionScopes2 = _interopRequireDefault(_configOptionScopes);

'use babel';
var PathsProvider = (function (_EventEmitter) {
  _inherits(PathsProvider, _EventEmitter);

  function PathsProvider() {
    _classCallCheck(this, PathsProvider);

    _get(Object.getPrototypeOf(PathsProvider.prototype), 'constructor', this).call(this);
    this.reloadScopes();

    this._pathsCache = new _pathsCache2['default']();
    this._isReady = false;

    this._onRebuildCache = this._onRebuildCache.bind(this);
    this._onRebuildCacheDone = this._onRebuildCacheDone.bind(this);

    this._pathsCache.on('rebuild-cache', this._onRebuildCache);
    this._pathsCache.on('rebuild-cache-done', this._onRebuildCacheDone);
  }

  /**
   * Reloads the scopes
   */

  _createClass(PathsProvider, [{
    key: 'reloadScopes',
    value: function reloadScopes() {
      this._scopes = atom.config.get('autocomplete-paths.scopes').slice(0) || [];

      if (!atom.config.get('autocomplete-paths.ignoreBuiltinScopes')) {
        this._scopes = this._scopes.concat(_configDefaultScopes2['default']);
      }

      for (var key in _configOptionScopes2['default']) {
        if (atom.config.get('autocomplete-paths.' + key)) {
          this._scopes = this._scopes.slice(0).concat(_configOptionScopes2['default'][key]);
        }
      }
    }

    /**
     * Gets called when the PathsCache is starting to rebuild the cache
     * @private
     */
  }, {
    key: '_onRebuildCache',
    value: function _onRebuildCache() {
      this.emit('rebuild-cache');
    }

    /**
     * Gets called when the PathsCache is done rebuilding the cache
     * @private
     */
  }, {
    key: '_onRebuildCacheDone',
    value: function _onRebuildCacheDone() {
      this.emit('rebuild-cache-done');
    }

    /**
     * Checks if the given scope config matches the given request
     * @param  {Object} scope
     * @param  {Object} request
     * @return {Array} The match object
     * @private
     */
  }, {
    key: '_scopeMatchesRequest',
    value: function _scopeMatchesRequest(scope, request) {
      var sourceScopes = Array.isArray(scope.scopes) ? scope.scopes : [scope.scopes];

      // Check if the scope descriptors match
      var scopeMatches = _underscorePlus2['default'].intersection(request.scopeDescriptor.getScopesArray(), sourceScopes).length > 0;
      if (!scopeMatches) return false;

      // Check if the line matches the prefixes
      var line = this._getLineTextForRequest(request);

      var lineMatch = null;
      var scopePrefixes = Array.isArray(scope.prefixes) ? scope.prefixes : [scope.prefixes];
      scopePrefixes.forEach(function (prefix) {
        var regex = new RegExp(prefix, 'i');
        lineMatch = lineMatch || line.match(regex);
      });

      return lineMatch;
    }

    /**
     * Returns the whole line text for the given request
     * @param  {Object} request
     * @return {String}
     * @private
     */
  }, {
    key: '_getLineTextForRequest',
    value: function _getLineTextForRequest(request) {
      var editor = request.editor;
      var bufferPosition = request.bufferPosition;

      return editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
    }

    /**
     * Returns the suggestions for the given scope and the given request
     * @param  {Object} scope
     * @param  {Object} request
     * @return {Promise}
     * @private
     */
  }, {
    key: '_getSuggestionsForScope',
    value: function _getSuggestionsForScope(scope, request, match) {
      var line = this._getLineTextForRequest(request);
      var pathPrefix = line.substr(match.index + match[0].length);
      var trailingSlashPresent = pathPrefix.match(/[/|\\]$/);
      var directoryGiven = pathPrefix.indexOf('./') === 0 || pathPrefix.indexOf('../') === 0;
      var parsedPathPrefix = _path2['default'].parse(pathPrefix);

      // path.parse ignores trailing slashes, so we handle this manually
      if (trailingSlashPresent) {
        parsedPathPrefix.dir = _path2['default'].join(parsedPathPrefix.dir, parsedPathPrefix.base);
        parsedPathPrefix.base = '';
        parsedPathPrefix.name = '';
      }

      var projectDirectory = this._getProjectDirectory(request.editor);
      if (!projectDirectory) return Promise.resolve([]);
      var currentDirectory = _path2['default'].dirname(request.editor.getPath());

      var requestedDirectoryPath = _path2['default'].resolve(currentDirectory, parsedPathPrefix.dir);

      var files = directoryGiven ? this._pathsCache.getFilePathsForProjectDirectory(projectDirectory, requestedDirectoryPath) : this._pathsCache.getFilePathsForProjectDirectory(projectDirectory);

      var fuzzyMatcher = directoryGiven ? parsedPathPrefix.base : pathPrefix;

      var extensions = scope.extensions;

      if (extensions) {
        (function () {
          var regex = new RegExp('.(' + extensions.join('|') + ')$');
          files = files.filter(function (path) {
            return regex.test(path);
          });
        })();
      }

      if (fuzzyMatcher) {
        files = _fuzzaldrinPlus2['default'].filter(files, fuzzyMatcher, {
          maxResults: 10
        });
      }

      var suggestions = files.map(function (pathName) {
        var normalizeSlashes = atom.config.get('autocomplete-paths.normalizeSlashes');

        var projectRelativePath = atom.project.relativizePath(pathName)[1];
        var displayText = projectRelativePath;
        if (directoryGiven) {
          displayText = _path2['default'].relative(requestedDirectoryPath, pathName);
        }
        if (normalizeSlashes) {
          displayText = (0, _slash2['default'])(displayText);
        }

        // Relativize path to current file if necessary
        var relativePath = _path2['default'].relative(_path2['default'].dirname(request.editor.getPath()), pathName);
        if (normalizeSlashes) relativePath = (0, _slash2['default'])(relativePath);
        if (scope.relative !== false) {
          pathName = relativePath;
          if (scope.includeCurrentDirectory !== false) {
            if (pathName[0] !== '.') {
              pathName = './' + pathName;
            }
          }
        }

        if (scope.projectRelativePath) {
          pathName = projectRelativePath;
        }

        // Replace stuff if necessary
        if (scope.replaceOnInsert) {
          var originalPathName = pathName;
          scope.replaceOnInsert.forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2);

            var from = _ref2[0];
            var to = _ref2[1];

            var regex = new RegExp(from);
            if (regex.test(pathName)) {
              pathName = pathName.replace(regex, to);
            }
          });
        }

        // Calculate distance to file
        var distanceToFile = relativePath.split(_path2['default'].sep).length;
        return {
          text: pathName,
          replacementPrefix: pathPrefix,
          displayText: displayText,
          type: 'import',
          iconHTML: '<i class="icon-file-code"></i>',
          score: _fuzzaldrinPlus2['default'].score(displayText, request.prefix),
          distanceToFile: distanceToFile
        };
      });

      // Modify score to incorporate distance
      var suggestionsCount = suggestions.length;
      if (suggestions.length) {
        (function () {
          var maxDistance = _underscorePlus2['default'].max(suggestions, function (s) {
            return s.distanceToFile;
          }).distanceToFile;
          suggestions.forEach(function (s, i) {
            s.score = suggestionsCount - i + (maxDistance - s.distanceToFile);
          });

          // Sort again
          suggestions.sort(function (a, b) {
            return b.score - a.score;
          });
        })();
      }

      return Promise.resolve(suggestions);
    }

    /**
     * Returns the suggestions for the given request
     * @param  {Object} request
     * @return {Promise}
     */
  }, {
    key: 'getSuggestions',
    value: function getSuggestions(request) {
      var _this = this;

      var matches = this._scopes.map(function (scope) {
        return [scope, _this._scopeMatchesRequest(scope, request)];
      }).filter(function (result) {
        return result[1];
      }); // Filter scopes that match
      var promises = matches.map(function (_ref3) {
        var _ref32 = _slicedToArray(_ref3, 2);

        var scope = _ref32[0];
        var match = _ref32[1];
        return _this._getSuggestionsForScope(scope, request, match);
      });

      return Promise.all(promises).then(function (suggestions) {
        suggestions = _underscorePlus2['default'].flatten(suggestions);
        if (!suggestions.length) return false;
        return suggestions;
      });
    }

    /**
     * Rebuilds the cache
     * @return {Promise}
     */
  }, {
    key: 'rebuildCache',
    value: function rebuildCache() {
      var _this2 = this;

      return this._pathsCache.rebuildCache().then(function (result) {
        _this2._isReady = true;
        return result;
      });
    }

    /**
     * Returns the project directory that contains the file opened in the given editor
     * @param  {TextEditor} editor
     * @return {Directory}
     * @private
     */
  }, {
    key: '_getProjectDirectory',
    value: function _getProjectDirectory(editor) {
      var filePath = editor.getBuffer().getPath();
      var projectDirectory = null;
      atom.project.getDirectories().forEach(function (directory) {
        if (directory.contains(filePath)) {
          projectDirectory = directory;
        }
      });
      return projectDirectory;
    }
  }, {
    key: 'isReady',
    value: function isReady() {
      return this._isReady;
    }
  }, {
    key: 'dispose',

    /**
     * Disposes this provider
     */
    value: function dispose() {
      this._pathsCache.removeListener('rebuild-cache', this._onRebuildCache);
      this._pathsCache.removeListener('rebuild-cache-done', this._onRebuildCacheDone);
      this._pathsCache.dispose(true);
    }
  }, {
    key: 'suggestionPriority',
    get: function get() {
      return atom.config.get('autocomplete-paths.suggestionPriority');
    }
  }, {
    key: 'fileCount',
    get: function get() {
      var _this3 = this;

      return atom.project.getDirectories().reduce(function (accumulated, directory) {
        var filePaths = _this3._pathsCache.getFilePathsForProjectDirectory(directory);
        return accumulated + filePaths.length;
      }, 0);
    }
  }]);

  return PathsProvider;
})(_events.EventEmitter);

exports['default'] = PathsProvider;

PathsProvider.prototype.selector = '*';
PathsProvider.prototype.inclusionPriority = 1;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL3BhdGhzLXByb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztzQkFHNkIsUUFBUTs7b0JBQ3BCLE1BQU07Ozs7OEJBQ1QsaUJBQWlCOzs7O3FCQUNiLE9BQU87Ozs7MEJBQ0YsZUFBZTs7Ozs4QkFDZixpQkFBaUI7Ozs7bUNBQ2QseUJBQXlCOzs7O2tDQUMxQix3QkFBd0I7Ozs7QUFWakQsV0FBVyxDQUFBO0lBWVUsYUFBYTtZQUFiLGFBQWE7O0FBQ3BCLFdBRE8sYUFBYSxHQUNqQjswQkFESSxhQUFhOztBQUU5QiwrQkFGaUIsYUFBYSw2Q0FFdkI7QUFDUCxRQUFJLENBQUMsWUFBWSxFQUFFLENBQUE7O0FBRW5CLFFBQUksQ0FBQyxXQUFXLEdBQUcsNkJBQWdCLENBQUE7QUFDbkMsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUE7O0FBRXJCLFFBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDdEQsUUFBSSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUE7O0FBRTlELFFBQUksQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLGVBQWUsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUE7QUFDMUQsUUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUE7R0FDcEU7Ozs7OztlQWJrQixhQUFhOztXQWtCbkIsd0JBQUc7QUFDZCxVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDJCQUEyQixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQTs7QUFF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LElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsTUFBTSxDQUFDLFVBQUMsV0FBVyxFQUFFLFNBQVMsRUFBSztBQUN0RSxZQUFNLFNBQVMsR0FBRyxPQUFLLFdBQVcsQ0FBQywrQkFBK0IsQ0FBQyxTQUFTLENBQUMsQ0FBQTtBQUM3RSxlQUFPLFdBQVcsR0FBRyxTQUFTLENBQUMsTUFBTSxDQUFDO09BQ3ZDLEVBQUUsQ0FBQyxDQUFDLENBQUE7S0FDTjs7O1NBNVFrQixhQUFhOzs7cUJBQWIsYUFBYTs7QUF3UmxDLGFBQWEsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQTtBQUN0QyxhQUFhLENBQUMsU0FBUyxDQUFDLGlCQUFpQixHQUFHLENBQUMsQ0FBQSIsImZpbGUiOiIvaG9tZS95b2tvdGEvLmF0b20vcGFja2FnZXMvYXV0b2NvbXBsZXRlLXBhdGhzL2xpYi9wYXRocy1wcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnXG4vKiBnbG9iYWwgYXRvbSAqL1xuXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IF8gZnJvbSAndW5kZXJzY29yZS1wbHVzJ1xuaW1wb3J0IHNsYXNoIGZyb20gJ3NsYXNoJ1xuaW1wb3J0IFBhdGhzQ2FjaGUgZnJvbSAnLi9wYXRocy1jYWNoZSdcbmltcG9ydCBmdXp6YWxkcmluIGZyb20gJ2Z1enphbGRyaW4tcGx1cydcbmltcG9ydCBEZWZhdWx0U2NvcGVzIGZyb20gJy4vY29uZmlnL2RlZmF1bHQtc2NvcGVzJ1xuaW1wb3J0IE9wdGlvblNjb3BlcyBmcm9tICcuL2NvbmZpZy9vcHRpb24tc2NvcGVzJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQYXRoc1Byb3ZpZGVyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IgKCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLnJlbG9hZFNjb3BlcygpXG5cbiAgICB0aGlzLl9wYXRoc0NhY2hlID0gbmV3IFBhdGhzQ2FjaGUoKVxuICAgIHRoaXMuX2lzUmVhZHkgPSBmYWxzZVxuXG4gICAgdGhpcy5fb25SZWJ1aWxkQ2FjaGUgPSB0aGlzLl9vblJlYnVpbGRDYWNoZS5iaW5kKHRoaXMpXG4gICAgdGhpcy5fb25SZWJ1aWxkQ2FjaGVEb25lID0gdGhpcy5fb25SZWJ1aWxkQ2FjaGVEb25lLmJpbmQodGhpcylcblxuICAgIHRoaXMuX3BhdGhzQ2FjaGUub24oJ3JlYnVpbGQtY2FjaGUnLCB0aGlzLl9vblJlYnVpbGRDYWNoZSlcbiAgICB0aGlzLl9wYXRoc0NhY2hlLm9uKCdyZWJ1aWxkLWNhY2hlLWRvbmUnLCB0aGlzLl9vblJlYnVpbGRDYWNoZURvbmUpXG4gIH1cblxuICAvKipcbiAgICogUmVsb2FkcyB0aGUgc2NvcGVzXG4gICAqL1xuICByZWxvYWRTY29wZXMgKCkge1xuICAgIHRoaXMuX3Njb3BlcyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBhdGhzLnNjb3BlcycpLnNsaWNlKDApIHx8IFtdXG5cbiAgICBpZiAoIWF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBhdGhzLmlnbm9yZUJ1aWx0aW5TY29wZXMnKSkge1xuICAgICAgdGhpcy5fc2NvcGVzID0gdGhpcy5fc2NvcGVzLmNvbmNhdChEZWZhdWx0U2NvcGVzKVxuICAgIH1cblxuICAgIGZvciAodmFyIGtleSBpbiBPcHRpb25TY29wZXMpIHtcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoYGF1dG9jb21wbGV0ZS1wYXRocy4ke2tleX1gKSkge1xuICAgICAgICB0aGlzLl9zY29wZXMgPSB0aGlzLl9zY29wZXMuc2xpY2UoMCkuY29uY2F0KE9wdGlvblNjb3Blc1trZXldKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGNhbGxlZCB3aGVuIHRoZSBQYXRoc0NhY2hlIGlzIHN0YXJ0aW5nIHRvIHJlYnVpbGQgdGhlIGNhY2hlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfb25SZWJ1aWxkQ2FjaGUgKCkge1xuICAgIHRoaXMuZW1pdCgncmVidWlsZC1jYWNoZScpXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBjYWxsZWQgd2hlbiB0aGUgUGF0aHNDYWNoZSBpcyBkb25lIHJlYnVpbGRpbmcgdGhlIGNhY2hlXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfb25SZWJ1aWxkQ2FjaGVEb25lICgpIHtcbiAgICB0aGlzLmVtaXQoJ3JlYnVpbGQtY2FjaGUtZG9uZScpXG4gIH1cblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBnaXZlbiBzY29wZSBjb25maWcgbWF0Y2hlcyB0aGUgZ2l2ZW4gcmVxdWVzdFxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHNjb3BlXG4gICAqIEBwYXJhbSAge09iamVjdH0gcmVxdWVzdFxuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIG1hdGNoIG9iamVjdFxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3Njb3BlTWF0Y2hlc1JlcXVlc3QgKHNjb3BlLCByZXF1ZXN0KSB7XG4gICAgY29uc3Qgc291cmNlU2NvcGVzID0gQXJyYXkuaXNBcnJheShzY29wZS5zY29wZXMpXG4gICAgICA/IHNjb3BlLnNjb3Blc1xuICAgICAgOiBbc2NvcGUuc2NvcGVzXVxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHNjb3BlIGRlc2NyaXB0b3JzIG1hdGNoXG4gICAgY29uc3Qgc2NvcGVNYXRjaGVzID0gXy5pbnRlcnNlY3Rpb24oXG4gICAgICByZXF1ZXN0LnNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpLFxuICAgICAgc291cmNlU2NvcGVzXG4gICAgKS5sZW5ndGggPiAwXG4gICAgaWYgKCFzY29wZU1hdGNoZXMpIHJldHVybiBmYWxzZVxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGxpbmUgbWF0Y2hlcyB0aGUgcHJlZml4ZXNcbiAgICBjb25zdCBsaW5lID0gdGhpcy5fZ2V0TGluZVRleHRGb3JSZXF1ZXN0KHJlcXVlc3QpXG5cbiAgICBsZXQgbGluZU1hdGNoID0gbnVsbFxuICAgIGNvbnN0IHNjb3BlUHJlZml4ZXMgPSBBcnJheS5pc0FycmF5KHNjb3BlLnByZWZpeGVzKVxuICAgICAgPyBzY29wZS5wcmVmaXhlc1xuICAgICAgOiBbc2NvcGUucHJlZml4ZXNdXG4gICAgc2NvcGVQcmVmaXhlcy5mb3JFYWNoKHByZWZpeCA9PiB7XG4gICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocHJlZml4LCAnaScpXG4gICAgICBsaW5lTWF0Y2ggPSBsaW5lTWF0Y2ggfHwgbGluZS5tYXRjaChyZWdleClcbiAgICB9KVxuXG4gICAgcmV0dXJuIGxpbmVNYXRjaFxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHdob2xlIGxpbmUgdGV4dCBmb3IgdGhlIGdpdmVuIHJlcXVlc3RcbiAgICogQHBhcmFtICB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEByZXR1cm4ge1N0cmluZ31cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRMaW5lVGV4dEZvclJlcXVlc3QgKHJlcXVlc3QpIHtcbiAgICBjb25zdCB7IGVkaXRvciwgYnVmZmVyUG9zaXRpb24gfSA9IHJlcXVlc3RcbiAgICByZXR1cm4gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHN1Z2dlc3Rpb25zIGZvciB0aGUgZ2l2ZW4gc2NvcGUgYW5kIHRoZSBnaXZlbiByZXF1ZXN0XG4gICAqIEBwYXJhbSAge09iamVjdH0gc2NvcGVcbiAgICogQHBhcmFtICB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0U3VnZ2VzdGlvbnNGb3JTY29wZSAoc2NvcGUsIHJlcXVlc3QsIG1hdGNoKSB7XG4gICAgY29uc3QgbGluZSA9IHRoaXMuX2dldExpbmVUZXh0Rm9yUmVxdWVzdChyZXF1ZXN0KVxuICAgIGNvbnN0IHBhdGhQcmVmaXggPSBsaW5lLnN1YnN0cihtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aClcbiAgICBjb25zdCB0cmFpbGluZ1NsYXNoUHJlc2VudCA9IHBhdGhQcmVmaXgubWF0Y2goL1svfFxcXFxdJC8pXG4gICAgY29uc3QgZGlyZWN0b3J5R2l2ZW4gPSBwYXRoUHJlZml4LmluZGV4T2YoJy4vJykgPT09IDAgfHwgcGF0aFByZWZpeC5pbmRleE9mKCcuLi8nKSA9PT0gMFxuICAgIGNvbnN0IHBhcnNlZFBhdGhQcmVmaXggPSBwYXRoLnBhcnNlKHBhdGhQcmVmaXgpXG5cbiAgICAvLyBwYXRoLnBhcnNlIGlnbm9yZXMgdHJhaWxpbmcgc2xhc2hlcywgc28gd2UgaGFuZGxlIHRoaXMgbWFudWFsbHlcbiAgICBpZiAodHJhaWxpbmdTbGFzaFByZXNlbnQpIHtcbiAgICAgIHBhcnNlZFBhdGhQcmVmaXguZGlyID0gcGF0aC5qb2luKHBhcnNlZFBhdGhQcmVmaXguZGlyLCBwYXJzZWRQYXRoUHJlZml4LmJhc2UpXG4gICAgICBwYXJzZWRQYXRoUHJlZml4LmJhc2UgPSAnJ1xuICAgICAgcGFyc2VkUGF0aFByZWZpeC5uYW1lID0gJydcbiAgICB9XG5cbiAgICBjb25zdCBwcm9qZWN0RGlyZWN0b3J5ID0gdGhpcy5fZ2V0UHJvamVjdERpcmVjdG9yeShyZXF1ZXN0LmVkaXRvcilcbiAgICBpZiAoIXByb2plY3REaXJlY3RvcnkpIHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pXG4gICAgY29uc3QgY3VycmVudERpcmVjdG9yeSA9IHBhdGguZGlybmFtZShyZXF1ZXN0LmVkaXRvci5nZXRQYXRoKCkpXG5cbiAgICBjb25zdCByZXF1ZXN0ZWREaXJlY3RvcnlQYXRoID0gcGF0aC5yZXNvbHZlKGN1cnJlbnREaXJlY3RvcnksIHBhcnNlZFBhdGhQcmVmaXguZGlyKVxuXG4gICAgbGV0IGZpbGVzID0gZGlyZWN0b3J5R2l2ZW5cbiAgICAgID8gdGhpcy5fcGF0aHNDYWNoZS5nZXRGaWxlUGF0aHNGb3JQcm9qZWN0RGlyZWN0b3J5KHByb2plY3REaXJlY3RvcnksIHJlcXVlc3RlZERpcmVjdG9yeVBhdGgpXG4gICAgICA6IHRoaXMuX3BhdGhzQ2FjaGUuZ2V0RmlsZVBhdGhzRm9yUHJvamVjdERpcmVjdG9yeShwcm9qZWN0RGlyZWN0b3J5KVxuXG4gICAgY29uc3QgZnV6enlNYXRjaGVyID0gZGlyZWN0b3J5R2l2ZW5cbiAgICAgID8gcGFyc2VkUGF0aFByZWZpeC5iYXNlXG4gICAgICA6IHBhdGhQcmVmaXhcblxuICAgIGNvbnN0IHsgZXh0ZW5zaW9ucyB9ID0gc2NvcGVcbiAgICBpZiAoZXh0ZW5zaW9ucykge1xuICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGAuKCR7ZXh0ZW5zaW9ucy5qb2luKCd8Jyl9KSRgKVxuICAgICAgZmlsZXMgPSBmaWxlcy5maWx0ZXIocGF0aCA9PiByZWdleC50ZXN0KHBhdGgpKVxuICAgIH1cblxuICAgIGlmIChmdXp6eU1hdGNoZXIpIHtcbiAgICAgIGZpbGVzID0gZnV6emFsZHJpbi5maWx0ZXIoZmlsZXMsIGZ1enp5TWF0Y2hlciwge1xuICAgICAgICBtYXhSZXN1bHRzOiAxMFxuICAgICAgfSlcbiAgICB9XG5cbiAgICBsZXQgc3VnZ2VzdGlvbnMgPSBmaWxlcy5tYXAocGF0aE5hbWUgPT4ge1xuICAgICAgY29uc3Qgbm9ybWFsaXplU2xhc2hlcyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBhdGhzLm5vcm1hbGl6ZVNsYXNoZXMnKVxuXG4gICAgICBjb25zdCBwcm9qZWN0UmVsYXRpdmVQYXRoID0gYXRvbS5wcm9qZWN0LnJlbGF0aXZpemVQYXRoKHBhdGhOYW1lKVsxXVxuICAgICAgbGV0IGRpc3BsYXlUZXh0ID0gcHJvamVjdFJlbGF0aXZlUGF0aFxuICAgICAgaWYgKGRpcmVjdG9yeUdpdmVuKSB7XG4gICAgICAgIGRpc3BsYXlUZXh0ID0gcGF0aC5yZWxhdGl2ZShyZXF1ZXN0ZWREaXJlY3RvcnlQYXRoLCBwYXRoTmFtZSlcbiAgICAgIH1cbiAgICAgIGlmIChub3JtYWxpemVTbGFzaGVzKSB7XG4gICAgICAgIGRpc3BsYXlUZXh0ID0gc2xhc2goZGlzcGxheVRleHQpXG4gICAgICB9XG5cbiAgICAgIC8vIFJlbGF0aXZpemUgcGF0aCB0byBjdXJyZW50IGZpbGUgaWYgbmVjZXNzYXJ5XG4gICAgICBsZXQgcmVsYXRpdmVQYXRoID0gcGF0aC5yZWxhdGl2ZShwYXRoLmRpcm5hbWUocmVxdWVzdC5lZGl0b3IuZ2V0UGF0aCgpKSwgcGF0aE5hbWUpXG4gICAgICBpZiAobm9ybWFsaXplU2xhc2hlcykgcmVsYXRpdmVQYXRoID0gc2xhc2gocmVsYXRpdmVQYXRoKVxuICAgICAgaWYgKHNjb3BlLnJlbGF0aXZlICE9PSBmYWxzZSkge1xuICAgICAgICBwYXRoTmFtZSA9IHJlbGF0aXZlUGF0aFxuICAgICAgICBpZiAoc2NvcGUuaW5jbHVkZUN1cnJlbnREaXJlY3RvcnkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgaWYgKHBhdGhOYW1lWzBdICE9PSAnLicpIHtcbiAgICAgICAgICAgIHBhdGhOYW1lID0gYC4vJHtwYXRoTmFtZX1gXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzY29wZS5wcm9qZWN0UmVsYXRpdmVQYXRoKSB7XG4gICAgICAgIHBhdGhOYW1lID0gcHJvamVjdFJlbGF0aXZlUGF0aFxuICAgICAgfVxuXG4gICAgICAvLyBSZXBsYWNlIHN0dWZmIGlmIG5lY2Vzc2FyeVxuICAgICAgaWYgKHNjb3BlLnJlcGxhY2VPbkluc2VydCkge1xuICAgICAgICBsZXQgb3JpZ2luYWxQYXRoTmFtZSA9IHBhdGhOYW1lXG4gICAgICAgIHNjb3BlLnJlcGxhY2VPbkluc2VydC5mb3JFYWNoKChbZnJvbSwgdG9dKSA9PiB7XG4gICAgICAgICAgY29uc3QgcmVnZXggPSBuZXcgUmVnRXhwKGZyb20pXG4gICAgICAgICAgaWYgKHJlZ2V4LnRlc3QocGF0aE5hbWUpKSB7XG4gICAgICAgICAgICBwYXRoTmFtZSA9IHBhdGhOYW1lLnJlcGxhY2UocmVnZXgsIHRvKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgLy8gQ2FsY3VsYXRlIGRpc3RhbmNlIHRvIGZpbGVcbiAgICAgIGNvbnN0IGRpc3RhbmNlVG9GaWxlID0gcmVsYXRpdmVQYXRoLnNwbGl0KHBhdGguc2VwKS5sZW5ndGhcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHRleHQ6IHBhdGhOYW1lLFxuICAgICAgICByZXBsYWNlbWVudFByZWZpeDogcGF0aFByZWZpeCxcbiAgICAgICAgZGlzcGxheVRleHQsXG4gICAgICAgIHR5cGU6ICdpbXBvcnQnLFxuICAgICAgICBpY29uSFRNTDogJzxpIGNsYXNzPVwiaWNvbi1maWxlLWNvZGVcIj48L2k+JyxcbiAgICAgICAgc2NvcmU6IGZ1enphbGRyaW4uc2NvcmUoZGlzcGxheVRleHQsIHJlcXVlc3QucHJlZml4KSxcbiAgICAgICAgZGlzdGFuY2VUb0ZpbGVcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgLy8gTW9kaWZ5IHNjb3JlIHRvIGluY29ycG9yYXRlIGRpc3RhbmNlXG4gICAgY29uc3Qgc3VnZ2VzdGlvbnNDb3VudCA9IHN1Z2dlc3Rpb25zLmxlbmd0aFxuICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IG1heERpc3RhbmNlID0gXy5tYXgoc3VnZ2VzdGlvbnMsIHMgPT4gcy5kaXN0YW5jZVRvRmlsZSkuZGlzdGFuY2VUb0ZpbGVcbiAgICAgIHN1Z2dlc3Rpb25zLmZvckVhY2goKHMsIGkpID0+IHtcbiAgICAgICAgcy5zY29yZSA9IChzdWdnZXN0aW9uc0NvdW50IC0gaSkgKyAobWF4RGlzdGFuY2UgLSBzLmRpc3RhbmNlVG9GaWxlKVxuICAgICAgfSlcblxuICAgICAgLy8gU29ydCBhZ2FpblxuICAgICAgc3VnZ2VzdGlvbnMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUpXG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShzdWdnZXN0aW9ucylcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzdWdnZXN0aW9ucyBmb3IgdGhlIGdpdmVuIHJlcXVlc3RcbiAgICogQHBhcmFtICB7T2JqZWN0fSByZXF1ZXN0XG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICBnZXRTdWdnZXN0aW9ucyAocmVxdWVzdCkge1xuICAgIGNvbnN0IG1hdGNoZXMgPSB0aGlzLl9zY29wZXNcbiAgICAgIC5tYXAoc2NvcGUgPT4gW3Njb3BlLCB0aGlzLl9zY29wZU1hdGNoZXNSZXF1ZXN0KHNjb3BlLCByZXF1ZXN0KV0pXG4gICAgICAuZmlsdGVyKHJlc3VsdCA9PiByZXN1bHRbMV0pIC8vIEZpbHRlciBzY29wZXMgdGhhdCBtYXRjaFxuICAgIGNvbnN0IHByb21pc2VzID0gbWF0Y2hlcy5tYXAoKFtzY29wZSwgbWF0Y2hdKSA9PlxuICAgICAgdGhpcy5fZ2V0U3VnZ2VzdGlvbnNGb3JTY29wZShzY29wZSwgcmVxdWVzdCwgbWF0Y2gpXG4gICAgKVxuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgLnRoZW4oc3VnZ2VzdGlvbnMgPT4ge1xuICAgICAgICBzdWdnZXN0aW9ucyA9IF8uZmxhdHRlbihzdWdnZXN0aW9ucylcbiAgICAgICAgaWYgKCFzdWdnZXN0aW9ucy5sZW5ndGgpIHJldHVybiBmYWxzZVxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnNcbiAgICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVidWlsZHMgdGhlIGNhY2hlXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICByZWJ1aWxkQ2FjaGUgKCkge1xuICAgIHJldHVybiB0aGlzLl9wYXRoc0NhY2hlLnJlYnVpbGRDYWNoZSgpXG4gICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICB0aGlzLl9pc1JlYWR5ID0gdHJ1ZVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2plY3QgZGlyZWN0b3J5IHRoYXQgY29udGFpbnMgdGhlIGZpbGUgb3BlbmVkIGluIHRoZSBnaXZlbiBlZGl0b3JcbiAgICogQHBhcmFtICB7VGV4dEVkaXRvcn0gZWRpdG9yXG4gICAqIEByZXR1cm4ge0RpcmVjdG9yeX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRQcm9qZWN0RGlyZWN0b3J5IChlZGl0b3IpIHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvci5nZXRCdWZmZXIoKS5nZXRQYXRoKClcbiAgICBsZXQgcHJvamVjdERpcmVjdG9yeSA9IG51bGxcbiAgICBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5mb3JFYWNoKGRpcmVjdG9yeSA9PiB7XG4gICAgICBpZiAoZGlyZWN0b3J5LmNvbnRhaW5zKGZpbGVQYXRoKSkge1xuICAgICAgICBwcm9qZWN0RGlyZWN0b3J5ID0gZGlyZWN0b3J5XG4gICAgICB9XG4gICAgfSlcbiAgICByZXR1cm4gcHJvamVjdERpcmVjdG9yeVxuICB9XG5cbiAgaXNSZWFkeSAoKSB7IHJldHVybiB0aGlzLl9pc1JlYWR5IH1cblxuICBnZXQgc3VnZ2VzdGlvblByaW9yaXR5ICgpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMuc3VnZ2VzdGlvblByaW9yaXR5JylcbiAgfVxuXG4gIGdldCBmaWxlQ291bnQoKSB7XG4gICAgcmV0dXJuIGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLnJlZHVjZSgoYWNjdW11bGF0ZWQsIGRpcmVjdG9yeSkgPT4ge1xuICAgICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5fcGF0aHNDYWNoZS5nZXRGaWxlUGF0aHNGb3JQcm9qZWN0RGlyZWN0b3J5KGRpcmVjdG9yeSlcbiAgICAgIHJldHVybiBhY2N1bXVsYXRlZCArIGZpbGVQYXRocy5sZW5ndGg7XG4gICAgfSwgMClcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwb3NlcyB0aGlzIHByb3ZpZGVyXG4gICAqL1xuICBkaXNwb3NlICgpIHtcbiAgICB0aGlzLl9wYXRoc0NhY2hlLnJlbW92ZUxpc3RlbmVyKCdyZWJ1aWxkLWNhY2hlJywgdGhpcy5fb25SZWJ1aWxkQ2FjaGUpXG4gICAgdGhpcy5fcGF0aHNDYWNoZS5yZW1vdmVMaXN0ZW5lcigncmVidWlsZC1jYWNoZS1kb25lJywgdGhpcy5fb25SZWJ1aWxkQ2FjaGVEb25lKVxuICAgIHRoaXMuX3BhdGhzQ2FjaGUuZGlzcG9zZSh0cnVlKVxuICB9XG59XG5cblBhdGhzUHJvdmlkZXIucHJvdG90eXBlLnNlbGVjdG9yID0gJyonXG5QYXRoc1Byb3ZpZGVyLnByb3RvdHlwZS5pbmNsdXNpb25Qcmlvcml0eSA9IDFcbiJdfQ==