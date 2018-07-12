Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/* global atom */

var _events = require('events');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _gitIgnoreParser = require('git-ignore-parser');

var _gitIgnoreParser2 = _interopRequireDefault(_gitIgnoreParser);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _underscorePlus = require('underscore-plus');

var _underscorePlus2 = _interopRequireDefault(_underscorePlus);

var _minimatch = require('minimatch');

var _minimatch2 = _interopRequireDefault(_minimatch);

var _atom = require('atom');

var _utils = require('./utils');

'use babel';
var PathsCache = (function (_EventEmitter) {
  _inherits(PathsCache, _EventEmitter);

  function PathsCache() {
    var _this = this;

    _classCallCheck(this, PathsCache);

    _get(Object.getPrototypeOf(PathsCache.prototype), 'constructor', this).call(this);

    this._projectChangeWatcher = atom.project.onDidChangePaths(function () {
      return _this.rebuildCache();
    });

    this._repositories = [];
    this._filePathsByProjectDirectory = new Map();
    this._filePathsByDirectory = new Map();
    this._fileWatchersByDirectory = new Map();
  }

  /**
   * Checks if the given path is ignored
   * @param  {String}  path
   * @return {Boolean}
   * @private
   */

  _createClass(PathsCache, [{
    key: '_isPathIgnored',
    value: function _isPathIgnored(path) {
      var ignored = false;
      if (atom.config.get('core.excludeVcsIgnoredPaths')) {
        this._repositories.forEach(function (repository) {
          if (ignored) return;
          var ignoreSubmodules = atom.config.get('autocomplete-paths.ignoreSubmodules');
          var isIgnoredSubmodule = ignoreSubmodules && repository.isSubmodule(path);
          if (repository.isPathIgnored(path) || isIgnoredSubmodule) {
            ignored = true;
          }
        });
      }

      if (atom.config.get('autocomplete-paths.ignoredNames')) {
        var ignoredNames = atom.config.get('core.ignoredNames');
        ignoredNames.forEach(function (ignoredName) {
          if (ignored) return;
          ignored = ignored || (0, _minimatch2['default'])(path, ignoredName, { matchBase: true, dot: true });
        });
      }

      var ignoredPatterns = atom.config.get('autocomplete-paths.ignoredPatterns');
      if (ignoredPatterns) {
        ignoredPatterns.forEach(function (ignoredPattern) {
          if (ignored) return;
          ignored = ignored || (0, _minimatch2['default'])(path, ignoredPattern, { dot: true });
        });
      }

      return ignored;
    }

    /**
     * Caches the project paths and repositories
     * @return {Promise}
     * @private
     */
  }, {
    key: '_cacheProjectPathsAndRepositories',
    value: function _cacheProjectPathsAndRepositories() {
      var _this2 = this;

      this._projectDirectories = atom.project.getDirectories();

      return Promise.all(this._projectDirectories.map(atom.project.repositoryForDirectory.bind(atom.project))).then(function (repositories) {
        _this2._repositories = repositories.filter(function (r) {
          return r;
        });
      });
    }

    /**
     * Invoked when the content of the given `directory` has changed
     * @param  {Directory} projectDirectory
     * @param  {Directory} directory
     * @private
     */
  }, {
    key: '_onDirectoryChanged',
    value: function _onDirectoryChanged(projectDirectory, directory) {
      this._removeFilePathsForDirectory(projectDirectory, directory);
      this._cleanWatchersForDirectory(directory);
      this._cacheDirectoryFilePaths(projectDirectory, directory);
    }

    /**
     * Removes all watchers inside the given directory
     * @param  {Directory} directory
     * @private
     */
  }, {
    key: '_cleanWatchersForDirectory',
    value: function _cleanWatchersForDirectory(directory) {
      var _this3 = this;

      this._fileWatchersByDirectory.forEach(function (watcher, otherDirectory) {
        if (directory.contains(otherDirectory.path)) {
          watcher.dispose();
          _this3._fileWatchersByDirectory['delete'](otherDirectory);
        }
      });
    }

    /**
     * Removes all cached file paths in the given directory
     * @param  {Directory} projectDirectory
     * @param  {Directory} directory
     * @private
     */
  }, {
    key: '_removeFilePathsForDirectory',
    value: function _removeFilePathsForDirectory(projectDirectory, directory) {
      var filePaths = this._filePathsByProjectDirectory.get(projectDirectory.path);
      if (!filePaths) return;

      filePaths = filePaths.filter(function (path) {
        return !directory.contains(path);
      });
      this._filePathsByProjectDirectory.set(projectDirectory.path, filePaths);

      this._filePathsByDirectory['delete'](directory.path);
    }

    /**
     * Caches file paths for the given directory
     * @param  {Directory} projectDirectory
     * @param  {Directory} directory
     * @return {Promise}
     * @private
     */
  }, {
    key: '_cacheDirectoryFilePaths',
    value: function _cacheDirectoryFilePaths(projectDirectory, directory) {
      var _this4 = this;

      if (this._cancelled) return Promise.resolve([]);

      if (process.platform !== 'win32') {
        var watcher = this._fileWatchersByDirectory.get(directory);
        if (!watcher) {
          watcher = directory.onDidChange(function () {
            return _this4._onDirectoryChanged(projectDirectory, directory);
          });
          this._fileWatchersByDirectory.set(directory, watcher);
        }
      }

      return this._getDirectoryEntries(directory).then(function (entries) {
        if (_this4._cancelled) return Promise.resolve([]);

        // Filter: Files that are not ignored
        var filePaths = entries.filter(function (entry) {
          return entry instanceof _atom.File;
        }).map(function (entry) {
          return entry.path;
        }).filter(function (path) {
          return !_this4._isPathIgnored(path);
        });

        // Merge file paths into existing array (which contains *all* file paths)
        var filePathsArray = _this4._filePathsByProjectDirectory.get(projectDirectory.path) || [];
        var newPathsCount = filePathsArray.length + filePaths.length;

        var maxFileCount = atom.config.get('autocomplete-paths.maxFileCount');
        if (newPathsCount > maxFileCount && !_this4._cancelled) {
          atom.notifications.addError('autocomplete-paths', {
            description: 'Maximum file count of ' + maxFileCount + ' has been exceeded. Path autocompletion will not work in this project.<br /><br /><a href="https://github.com/atom-community/autocomplete-paths/wiki/Troubleshooting#maximum-file-limit-exceeded">Click here to learn more.</a>',
            dismissable: true
          });

          _this4._filePathsByProjectDirectory.clear();
          _this4._filePathsByDirectory.clear();
          _this4._cancelled = true;
          _this4.emit('rebuild-cache-done');
          return;
        }

        _this4._filePathsByProjectDirectory.set(projectDirectory.path, _underscorePlus2['default'].union(filePathsArray, filePaths));

        // Merge file paths into existing array (which contains file paths for a specific directory)
        filePathsArray = _this4._filePathsByDirectory.get(directory.path) || [];
        _this4._filePathsByDirectory.set(directory.path, _underscorePlus2['default'].union(filePathsArray, filePaths));

        var directories = entries.filter(function (entry) {
          return entry instanceof _atom.Directory;
        }).filter(function (entry) {
          return !_this4._isPathIgnored(entry.path);
        });

        return Promise.all(directories.map(function (directory) {
          return _this4._cacheDirectoryFilePaths(projectDirectory, directory);
        }));
      });
    }

    /**
     * Promisified version of Directory#getEntries
     * @param  {Directory} directory
     * @return {Promise}
     * @private
     */
  }, {
    key: '_getDirectoryEntries',
    value: function _getDirectoryEntries(directory) {
      return new Promise(function (resolve, reject) {
        directory.getEntries(function (err, entries) {
          if (err) return reject(err);
          resolve(entries);
        });
      });
    }

    /**
     * Rebuilds the paths cache
     */
  }, {
    key: 'rebuildCache',
    value: function rebuildCache() {
      var _this5 = this;

      var path = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      this.dispose();

      this._cancelled = false;
      this.emit('rebuild-cache');

      return (0, _utils.execPromise)('find --version').then(
      // `find` is available
      function () {
        return _this5._buildInitialCacheWithFind();
      },
      // `find` is not available
      function () {
        return _this5._buildInitialCache();
      });
    }

    /**
     * Builds the initial file cache
     * @return {Promise}
     * @private
     */
  }, {
    key: '_buildInitialCache',
    value: function _buildInitialCache() {
      var _this6 = this;

      return this._cacheProjectPathsAndRepositories().then(function () {
        return Promise.all(_this6._projectDirectories.map(function (projectDirectory) {
          return _this6._cacheDirectoryFilePaths(projectDirectory, projectDirectory);
        }));
      }).then(function (result) {
        _this6.emit('rebuild-cache-done');
        return result;
      });
    }

    /**
     * Returns the project path for the given file / directory pathName
     * @param  {String} pathName
     * @return {String}
     * @private
     */
  }, {
    key: '_getProjectPathForPath',
    value: function _getProjectPathForPath(pathName) {
      var projects = this._projectPaths;
      for (var i = 0; i < projects.length; i++) {
        var projectPath = projects[i];
        if (pathName.indexOf(projectPath) === 0) {
          return projectPath;
        }
      }
      return false;
    }

    /**
     * Returns the file paths for the given project directory with the given (optional) relative path
     * @param  {Directory} projectDirectory
     * @param  {String} [relativeToPath=null]
     * @return {String[]}
     */
  }, {
    key: 'getFilePathsForProjectDirectory',
    value: function getFilePathsForProjectDirectory(projectDirectory) {
      var relativeToPath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      var filePaths = this._filePathsByProjectDirectory.get(projectDirectory.path) || [];
      if (relativeToPath) {
        return filePaths.filter(function (filePath) {
          return filePath.indexOf(relativeToPath) === 0;
        });
      }
      return filePaths;
    }

    /**
     * Disposes this PathsCache
     */
  }, {
    key: 'dispose',
    value: function dispose(isPackageDispose) {
      this._fileWatchersByDirectory.forEach(function (watcher, directory) {
        watcher.dispose();
      });
      this._fileWatchersByDirectory = new Map();
      this._filePathsByProjectDirectory = new Map();
      this._filePathsByDirectory = new Map();
      this._repositories = [];
      if (this._projectWatcher) {
        this._projectWatcher.dispose();
        this._projectWatcher = null;
      }
      if (isPackageDispose && this._projectChangeWatcher) {
        this._projectChangeWatcher.dispose();
        this._projectChangeWatcher = null;
      }
    }

    //
    // Cache with `find`
    //

    /**
     * Builds the initial file cache with `find`
     * @return {Promise}
     * @private
     */
  }, {
    key: '_buildInitialCacheWithFind',
    value: function _buildInitialCacheWithFind() {
      var _this7 = this;

      return this._cacheProjectPathsAndRepositories().then(function () {
        _this7._projectWatcher = atom.project.onDidChangeFiles(_this7._onDidChangeFiles.bind(_this7));

        return Promise.all(_this7._projectDirectories.map(_this7._populateCacheFor.bind(_this7)));
      }).then(function (result) {
        _this7.emit('rebuild-cache-done');
        return result;
      });
    }
  }, {
    key: '_onDidChangeFiles',
    value: function _onDidChangeFiles(events) {
      var _this8 = this;

      events.filter(function (event) {
        return event.action !== 'modified';
      }).forEach(function (event) {
        if (!_this8._projectDirectories) {
          return;
        }

        var action = event.action;
        var path = event.path;
        var oldPath = event.oldPath;

        var projectDirectory = _this8._projectDirectories.find(function (projectDirectory) {
          return path.indexOf(projectDirectory.path) === 0;
        });

        if (!projectDirectory) {
          return;
        }
        var directoryPath = projectDirectory.path;
        var ignored = _this8._isPathIgnored(path);

        if (ignored) {
          return;
        }

        var files = _this8._filePathsByProjectDirectory.get(directoryPath) || [];

        switch (action) {
          case 'created':
            files.push(path);
            break;

          case 'deleted':
            var i = files.indexOf(path);
            if (i > -1) {
              files.splice(i, 1);
            }
            break;

          case 'renamed':
            var j = files.indexOf(oldPath);
            if (j > -1) {
              files[j] = path;
            }
            break;
        }

        if (!_this8._filePathsByProjectDirectory.has(directoryPath)) {
          _this8._filePathsByProjectDirectory.set(directoryPath, files);
        }
      });
    }

    /**
     * Returns a list of ignore patterns for a directory
     * @param  {String} directoryPath
     * @return {String[]}
     * @private
     */
  }, {
    key: '_getIgnorePatterns',
    value: function _getIgnorePatterns(directoryPath) {
      var patterns = [];

      if (atom.config.get('autocomplete-paths.ignoredNames')) {
        atom.config.get('core.ignoredNames').forEach(function (pattern) {
          return patterns.push(pattern);
        });
      }

      if (atom.config.get('core.excludeVcsIgnoredPaths')) {
        try {
          var gitIgnore = _fs2['default'].readFileSync(directoryPath + '/.gitignore', 'utf-8');
          (0, _gitIgnoreParser2['default'])(gitIgnore).forEach(function (pattern) {
            return patterns.push(pattern);
          });
        } catch (err) {
          // .gitignore does not exist for this directory, ignoring
        }
      }

      var ignoredPatterns = atom.config.get('autocomplete-paths.ignoredPatterns');
      if (ignoredPatterns) {
        ignoredPatterns.forEach(function (pattern) {
          return patterns.push(pattern);
        });
      }

      return patterns;
    }

    /**
     * Populates cache for a project directory
     * @param  {Directory} projectDirectory
     * @return {Promise}
     * @private
     */
  }, {
    key: '_populateCacheFor',
    value: function _populateCacheFor(projectDirectory) {
      var _this9 = this;

      var directoryPath = projectDirectory.path;

      var ignorePatterns = this._getIgnorePatterns(directoryPath);
      var ignorePatternsForFind = ignorePatterns.map(function (pattern) {
        return pattern.replace(/\./g, '\\.').replace(/\*/g, '.*');
      });
      var ignorePattern = '\'.*\\(' + ignorePatternsForFind.join('\\|') + '\\).*\'';

      var cmd = ['find', '-L', directoryPath + '/', '-type', 'f', '-not', '-regex', ignorePattern].join(' ');

      return (0, _utils.execPromise)(cmd, {
        maxBuffer: 1024 * 1024
      }).then(function (stdout) {
        var files = _underscorePlus2['default'].compact(stdout.split('\n'));

        _this9._filePathsByProjectDirectory.set(directoryPath, files);

        return files;
      });
    }
  }]);

  return PathsCache;
})(_events.EventEmitter);

exports['default'] = PathsCache;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL3BhdGhzLWNhY2hlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7c0JBRzZCLFFBQVE7O2tCQUN0QixJQUFJOzs7OytCQUNTLG1CQUFtQjs7OztvQkFDOUIsTUFBTTs7Ozs4QkFDVCxpQkFBaUI7Ozs7eUJBQ1QsV0FBVzs7OztvQkFDRCxNQUFNOztxQkFDVixTQUFTOztBQVZyQyxXQUFXLENBQUE7SUFZVSxVQUFVO1lBQVYsVUFBVTs7QUFDakIsV0FETyxVQUFVLEdBQ2Q7OzswQkFESSxVQUFVOztBQUUzQiwrQkFGaUIsVUFBVSw2Q0FFcEI7O0FBRVAsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFBTSxNQUFLLFlBQVksRUFBRTtLQUFBLENBQUMsQ0FBQTs7QUFFckYsUUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUE7QUFDdkIsUUFBSSxDQUFDLDRCQUE0QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDN0MsUUFBSSxDQUFDLHFCQUFxQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7QUFDdEMsUUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksR0FBRyxFQUFFLENBQUE7R0FDMUM7Ozs7Ozs7OztlQVZrQixVQUFVOztXQWtCZCx3QkFBQyxJQUFJLEVBQUU7QUFDcEIsVUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFBO0FBQ25CLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsNkJBQTZCLENBQUMsRUFBRTtBQUNsRCxZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLFVBQVUsRUFBSTtBQUN2QyxjQUFJLE9BQU8sRUFBRSxPQUFNO0FBQ25CLGNBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMscUNBQXFDLENBQUMsQ0FB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LEdBQUcsNEJBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7QUFFNUMsZUFBSyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLEtBQUssQ0FBQyxDQUFDOztBQUU1RCxlQUFPLEtBQUssQ0FBQztPQUNkLENBQUMsQ0FBQztLQUNKOzs7U0FwYWtCLFVBQVU7OztxQkFBVixVQUFVIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9hdXRvY29tcGxldGUtcGF0aHMvbGliL3BhdGhzLWNhY2hlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcbi8qIGdsb2JhbCBhdG9tICovXG5cbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cydcbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCBnaXRJZ25vcmVQYXJzZXIgZnJvbSAnZ2l0LWlnbm9yZS1wYXJzZXInO1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcbmltcG9ydCBfIGZyb20gJ3VuZGVyc2NvcmUtcGx1cydcbmltcG9ydCBtaW5pbWF0Y2ggZnJvbSAnbWluaW1hdGNoJ1xuaW1wb3J0IHsgRGlyZWN0b3J5LCBGaWxlIH0gZnJvbSAnYXRvbSdcbmltcG9ydCB7IGV4ZWNQcm9taXNlIH0gZnJvbSAnLi91dGlscydcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUGF0aHNDYWNoZSBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIGNvbnN0cnVjdG9yICgpIHtcbiAgICBzdXBlcigpXG5cbiAgICB0aGlzLl9wcm9qZWN0Q2hhbmdlV2F0Y2hlciA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHRoaXMucmVidWlsZENhY2hlKCkpXG5cbiAgICB0aGlzLl9yZXBvc2l0b3JpZXMgPSBbXVxuICAgIHRoaXMuX2ZpbGVQYXRoc0J5UHJvamVjdERpcmVjdG9yeSA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2ZpbGVQYXRoc0J5RGlyZWN0b3J5ID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fZmlsZVdhdGNoZXJzQnlEaXJlY3RvcnkgPSBuZXcgTWFwKClcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIGdpdmVuIHBhdGggaXMgaWdub3JlZFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9ICBwYXRoXG4gICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaXNQYXRoSWdub3JlZCAocGF0aCkge1xuICAgIGxldCBpZ25vcmVkID0gZmFsc2VcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnKSkge1xuICAgICAgdGhpcy5fcmVwb3NpdG9yaWVzLmZvckVhY2gocmVwb3NpdG9yeSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmVkKSByZXR1cm5cbiAgICAgICAgY29uc3QgaWdub3JlU3VibW9kdWxlcyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBhdGhzLmlnbm9yZVN1Ym1vZHVsZXMnKVxuICAgICAgICBjb25zdCBpc0lnbm9yZWRTdWJtb2R1bGUgPSBpZ25vcmVTdWJtb2R1bGVzICYmIHJlcG9zaXRvcnkuaXNTdWJtb2R1bGUocGF0aClcbiAgICAgICAgaWYgKHJlcG9zaXRvcnkuaXNQYXRoSWdub3JlZChwYXRoKSB8fCBpc0lnbm9yZWRTdWJtb2R1bGUpIHtcbiAgICAgICAgICBpZ25vcmVkID0gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wYXRocy5pZ25vcmVkTmFtZXMnKSkge1xuICAgICAgY29uc3QgaWdub3JlZE5hbWVzID0gYXRvbS5jb25maWcuZ2V0KCdjb3JlLmlnbm9yZWROYW1lcycpXG4gICAgICBpZ25vcmVkTmFtZXMuZm9yRWFjaChpZ25vcmVkTmFtZSA9PiB7XG4gICAgICAgIGlmIChpZ25vcmVkKSByZXR1cm5cbiAgICAgICAgaWdub3JlZCA9IGlnbm9yZWQgfHwgbWluaW1hdGNoKHBhdGgsIGlnbm9yZWROYW1lLCB7IG1hdGNoQmFzZTogdHJ1ZSwgZG90OiB0cnVlIH0pXG4gICAgICB9KVxuICAgIH1cblxuICAgIGNvbnN0IGlnbm9yZWRQYXR0ZXJucyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBhdGhzLmlnbm9yZWRQYXR0ZXJucycpXG4gICAgaWYgKGlnbm9yZWRQYXR0ZXJucykge1xuICAgICAgaWdub3JlZFBhdHRlcm5zLmZvckVhY2goaWdub3JlZFBhdHRlcm4gPT4ge1xuICAgICAgICBpZiAoaWdub3JlZCkgcmV0dXJuXG4gICAgICAgIGlnbm9yZWQgPSBpZ25vcmVkIHx8IG1pbmltYXRjaChwYXRoLCBpZ25vcmVkUGF0dGVybiwgeyBkb3Q6IHRydWUgfSlcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgcmV0dXJuIGlnbm9yZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWNoZXMgdGhlIHByb2plY3QgcGF0aHMgYW5kIHJlcG9zaXRvcmllc1xuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NhY2hlUHJvamVjdFBhdGhzQW5kUmVwb3NpdG9yaWVzICgpIHtcbiAgICB0aGlzLl9wcm9qZWN0RGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKVxuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHRoaXMuX3Byb2plY3REaXJlY3Rvcmllc1xuICAgICAgLm1hcChhdG9tLnByb2plY3QucmVwb3NpdG9yeUZvckRpcmVjdG9yeS5iaW5kKGF0b20ucHJvamVjdCkpXG4gICAgKS50aGVuKHJlcG9zaXRvcmllcyA9PiB7XG4gICAgICB0aGlzLl9yZXBvc2l0b3JpZXMgPSByZXBvc2l0b3JpZXMuZmlsdGVyKHIgPT4gcilcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEludm9rZWQgd2hlbiB0aGUgY29udGVudCBvZiB0aGUgZ2l2ZW4gYGRpcmVjdG9yeWAgaGFzIGNoYW5nZWRcbiAgICogQHBhcmFtICB7RGlyZWN0b3J5fSBwcm9qZWN0RGlyZWN0b3J5XG4gICAqIEBwYXJhbSAge0RpcmVjdG9yeX0gZGlyZWN0b3J5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfb25EaXJlY3RvcnlDaGFuZ2VkIChwcm9qZWN0RGlyZWN0b3J5LCBkaXJlY3RvcnkpIHtcbiAgICB0aGlzLl9yZW1vdmVGaWxlUGF0aHNGb3JEaXJlY3RvcnkocHJvamVjdERpcmVjdG9yeSwgZGlyZWN0b3J5KVxuICAgIHRoaXMuX2NsZWFuV2F0Y2hlcnNGb3JEaXJlY3RvcnkoZGlyZWN0b3J5KVxuICAgIHRoaXMuX2NhY2hlRGlyZWN0b3J5RmlsZVBhdGhzKHByb2plY3REaXJlY3RvcnksIGRpcmVjdG9yeSlcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFsbCB3YXRjaGVycyBpbnNpZGUgdGhlIGdpdmVuIGRpcmVjdG9yeVxuICAgKiBAcGFyYW0gIHtEaXJlY3Rvcnl9IGRpcmVjdG9yeVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NsZWFuV2F0Y2hlcnNGb3JEaXJlY3RvcnkgKGRpcmVjdG9yeSkge1xuICAgIHRoaXMuX2ZpbGVXYXRjaGVyc0J5RGlyZWN0b3J5LmZvckVhY2goKHdhdGNoZXIsIG90aGVyRGlyZWN0b3J5KSA9PiB7XG4gICAgICBpZiAoZGlyZWN0b3J5LmNvbnRhaW5zKG90aGVyRGlyZWN0b3J5LnBhdGgpKSB7XG4gICAgICAgIHdhdGNoZXIuZGlzcG9zZSgpXG4gICAgICAgIHRoaXMuX2ZpbGVXYXRjaGVyc0J5RGlyZWN0b3J5LmRlbGV0ZShvdGhlckRpcmVjdG9yeSlcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYWxsIGNhY2hlZCBmaWxlIHBhdGhzIGluIHRoZSBnaXZlbiBkaXJlY3RvcnlcbiAgICogQHBhcmFtICB7RGlyZWN0b3J5fSBwcm9qZWN0RGlyZWN0b3J5XG4gICAqIEBwYXJhbSAge0RpcmVjdG9yeX0gZGlyZWN0b3J5XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVtb3ZlRmlsZVBhdGhzRm9yRGlyZWN0b3J5IChwcm9qZWN0RGlyZWN0b3J5LCBkaXJlY3RvcnkpIHtcbiAgICBsZXQgZmlsZVBhdGhzID0gdGhpcy5fZmlsZVBhdGhzQnlQcm9qZWN0RGlyZWN0b3J5LmdldChwcm9qZWN0RGlyZWN0b3J5LnBhdGgpXG4gICAgaWYgKCFmaWxlUGF0aHMpIHJldHVyblxuXG4gICAgZmlsZVBhdGhzID0gZmlsZVBhdGhzLmZpbHRlcihwYXRoID0+ICFkaXJlY3RvcnkuY29udGFpbnMocGF0aCkpXG4gICAgdGhpcy5fZmlsZVBhdGhzQnlQcm9qZWN0RGlyZWN0b3J5LnNldChwcm9qZWN0RGlyZWN0b3J5LnBhdGgsIGZpbGVQYXRocylcblxuICAgIHRoaXMuX2ZpbGVQYXRoc0J5RGlyZWN0b3J5LmRlbGV0ZShkaXJlY3RvcnkucGF0aClcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWNoZXMgZmlsZSBwYXRocyBmb3IgdGhlIGdpdmVuIGRpcmVjdG9yeVxuICAgKiBAcGFyYW0gIHtEaXJlY3Rvcnl9IHByb2plY3REaXJlY3RvcnlcbiAgICogQHBhcmFtICB7RGlyZWN0b3J5fSBkaXJlY3RvcnlcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9jYWNoZURpcmVjdG9yeUZpbGVQYXRocyAocHJvamVjdERpcmVjdG9yeSwgZGlyZWN0b3J5KSB7XG4gICAgaWYgKHRoaXMuX2NhbmNlbGxlZCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSlcblxuICAgIGlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gICAgICBsZXQgd2F0Y2hlciA9IHRoaXMuX2ZpbGVXYXRjaGVyc0J5RGlyZWN0b3J5LmdldChkaXJlY3RvcnkpXG4gICAgICBpZiAoIXdhdGNoZXIpIHtcbiAgICAgICAgd2F0Y2hlciA9IGRpcmVjdG9yeS5vbkRpZENoYW5nZSgoKSA9PlxuICAgICAgICAgIHRoaXMuX29uRGlyZWN0b3J5Q2hhbmdlZChwcm9qZWN0RGlyZWN0b3J5LCBkaXJlY3RvcnkpXG4gICAgICAgIClcbiAgICAgICAgdGhpcy5fZmlsZVdhdGNoZXJzQnlEaXJlY3Rvcnkuc2V0KGRpcmVjdG9yeSwgd2F0Y2hlcilcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5fZ2V0RGlyZWN0b3J5RW50cmllcyhkaXJlY3RvcnkpXG4gICAgICAudGhlbihlbnRyaWVzID0+IHtcbiAgICAgICAgaWYgKHRoaXMuX2NhbmNlbGxlZCkgcmV0dXJuIFByb21pc2UucmVzb2x2ZShbXSlcblxuICAgICAgICAvLyBGaWx0ZXI6IEZpbGVzIHRoYXQgYXJlIG5vdCBpZ25vcmVkXG4gICAgICAgIGNvbnN0IGZpbGVQYXRocyA9IGVudHJpZXNcbiAgICAgICAgICAuZmlsdGVyKGVudHJ5ID0+IGVudHJ5IGluc3RhbmNlb2YgRmlsZSlcbiAgICAgICAgICAubWFwKGVudHJ5ID0+IGVudHJ5LnBhdGgpXG4gICAgICAgICAgLmZpbHRlcihwYXRoID0+ICF0aGlzLl9pc1BhdGhJZ25vcmVkKHBhdGgpKVxuXG4gICAgICAgIC8vIE1lcmdlIGZpbGUgcGF0aHMgaW50byBleGlzdGluZyBhcnJheSAod2hpY2ggY29udGFpbnMgKmFsbCogZmlsZSBwYXRocylcbiAgICAgICAgbGV0IGZpbGVQYXRoc0FycmF5ID0gdGhpcy5fZmlsZVBhdGhzQnlQcm9qZWN0RGlyZWN0b3J5LmdldChwcm9qZWN0RGlyZWN0b3J5LnBhdGgpIHx8IFtdXG4gICAgICAgIGNvbnN0IG5ld1BhdGhzQ291bnQgPSBmaWxlUGF0aHNBcnJheS5sZW5ndGggKyBmaWxlUGF0aHMubGVuZ3RoXG5cbiAgICAgICAgY29uc3QgbWF4RmlsZUNvdW50ID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGF0aHMubWF4RmlsZUNvdW50JylcbiAgICAgICAgaWYgKG5ld1BhdGhzQ291bnQgPiBtYXhGaWxlQ291bnQgJiYgIXRoaXMuX2NhbmNlbGxlZCkge1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignYXV0b2NvbXBsZXRlLXBhdGhzJywge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IGBNYXhpbXVtIGZpbGUgY291bnQgb2YgJHttYXhGaWxlQ291bnR9IGhhcyBiZWVuIGV4Y2VlZGVkLiBQYXRoIGF1dG9jb21wbGV0aW9uIHdpbGwgbm90IHdvcmsgaW4gdGhpcyBwcm9qZWN0LjxiciAvPjxiciAvPjxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vYXRvbS1jb21tdW5pdHkvYXV0b2NvbXBsZXRlLXBhdGhzL3dpa2kvVHJvdWJsZXNob290aW5nI21heGltdW0tZmlsZS1saW1pdC1leGNlZWRlZFwiPkNsaWNrIGhlcmUgdG8gbGVhcm4gbW9yZS48L2E+YCxcbiAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHRoaXMuX2ZpbGVQYXRoc0J5UHJvamVjdERpcmVjdG9yeS5jbGVhcigpXG4gICAgICAgICAgdGhpcy5fZmlsZVBhdGhzQnlEaXJlY3RvcnkuY2xlYXIoKVxuICAgICAgICAgIHRoaXMuX2NhbmNlbGxlZCA9IHRydWVcbiAgICAgICAgICB0aGlzLmVtaXQoJ3JlYnVpbGQtY2FjaGUtZG9uZScpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3Rvcnkuc2V0KHByb2plY3REaXJlY3RvcnkucGF0aCxcbiAgICAgICAgICBfLnVuaW9uKGZpbGVQYXRoc0FycmF5LCBmaWxlUGF0aHMpXG4gICAgICAgIClcblxuICAgICAgICAvLyBNZXJnZSBmaWxlIHBhdGhzIGludG8gZXhpc3RpbmcgYXJyYXkgKHdoaWNoIGNvbnRhaW5zIGZpbGUgcGF0aHMgZm9yIGEgc3BlY2lmaWMgZGlyZWN0b3J5KVxuICAgICAgICBmaWxlUGF0aHNBcnJheSA9IHRoaXMuX2ZpbGVQYXRoc0J5RGlyZWN0b3J5LmdldChkaXJlY3RvcnkucGF0aCkgfHwgW11cbiAgICAgICAgdGhpcy5fZmlsZVBhdGhzQnlEaXJlY3Rvcnkuc2V0KGRpcmVjdG9yeS5wYXRoLFxuICAgICAgICAgIF8udW5pb24oZmlsZVBhdGhzQXJyYXksIGZpbGVQYXRocylcbiAgICAgICAgKVxuXG4gICAgICAgIGNvbnN0IGRpcmVjdG9yaWVzID0gZW50cmllc1xuICAgICAgICAgIC5maWx0ZXIoZW50cnkgPT4gZW50cnkgaW5zdGFuY2VvZiBEaXJlY3RvcnkpXG4gICAgICAgICAgLmZpbHRlcihlbnRyeSA9PiAhdGhpcy5faXNQYXRoSWdub3JlZChlbnRyeS5wYXRoKSlcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoZGlyZWN0b3JpZXMubWFwKGRpcmVjdG9yeSA9PlxuICAgICAgICAgIHRoaXMuX2NhY2hlRGlyZWN0b3J5RmlsZVBhdGhzKHByb2plY3REaXJlY3RvcnksIGRpcmVjdG9yeSlcbiAgICAgICAgKSlcbiAgICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUHJvbWlzaWZpZWQgdmVyc2lvbiBvZiBEaXJlY3RvcnkjZ2V0RW50cmllc1xuICAgKiBAcGFyYW0gIHtEaXJlY3Rvcnl9IGRpcmVjdG9yeVxuICAgKiBAcmV0dXJuIHtQcm9taXNlfVxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2dldERpcmVjdG9yeUVudHJpZXMgKGRpcmVjdG9yeSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBkaXJlY3RvcnkuZ2V0RW50cmllcygoZXJyLCBlbnRyaWVzKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHJldHVybiByZWplY3QoZXJyKVxuICAgICAgICByZXNvbHZlKGVudHJpZXMpXG4gICAgICB9KVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogUmVidWlsZHMgdGhlIHBhdGhzIGNhY2hlXG4gICAqL1xuICByZWJ1aWxkQ2FjaGUgKHBhdGggPSBudWxsKSB7XG4gICAgdGhpcy5kaXNwb3NlKClcblxuICAgIHRoaXMuX2NhbmNlbGxlZCA9IGZhbHNlXG4gICAgdGhpcy5lbWl0KCdyZWJ1aWxkLWNhY2hlJylcblxuICAgIHJldHVybiBleGVjUHJvbWlzZSgnZmluZCAtLXZlcnNpb24nKVxuICAgICAgLnRoZW4oXG4gICAgICAgIC8vIGBmaW5kYCBpcyBhdmFpbGFibGVcbiAgICAgICAgKCkgPT4gdGhpcy5fYnVpbGRJbml0aWFsQ2FjaGVXaXRoRmluZCgpLFxuICAgICAgICAvLyBgZmluZGAgaXMgbm90IGF2YWlsYWJsZVxuICAgICAgICAoKSA9PiB0aGlzLl9idWlsZEluaXRpYWxDYWNoZSgpXG4gICAgICApXG4gIH1cblxuICAvKipcbiAgICogQnVpbGRzIHRoZSBpbml0aWFsIGZpbGUgY2FjaGVcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9idWlsZEluaXRpYWxDYWNoZSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NhY2hlUHJvamVjdFBhdGhzQW5kUmVwb3NpdG9yaWVzKClcbiAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKFxuICAgICAgICAgIHRoaXMuX3Byb2plY3REaXJlY3Rvcmllcy5tYXAocHJvamVjdERpcmVjdG9yeSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVEaXJlY3RvcnlGaWxlUGF0aHMocHJvamVjdERpcmVjdG9yeSwgcHJvamVjdERpcmVjdG9yeSlcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgdGhpcy5lbWl0KCdyZWJ1aWxkLWNhY2hlLWRvbmUnKVxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIHByb2plY3QgcGF0aCBmb3IgdGhlIGdpdmVuIGZpbGUgLyBkaXJlY3RvcnkgcGF0aE5hbWVcbiAgICogQHBhcmFtICB7U3RyaW5nfSBwYXRoTmFtZVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZ2V0UHJvamVjdFBhdGhGb3JQYXRoIChwYXRoTmFtZSkge1xuICAgIGNvbnN0IHByb2plY3RzID0gdGhpcy5fcHJvamVjdFBhdGhzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwcm9qZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgcHJvamVjdFBhdGggPSBwcm9qZWN0c1tpXVxuICAgICAgaWYgKHBhdGhOYW1lLmluZGV4T2YocHJvamVjdFBhdGgpID09PSAwKSB7XG4gICAgICAgIHJldHVybiBwcm9qZWN0UGF0aFxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBmaWxlIHBhdGhzIGZvciB0aGUgZ2l2ZW4gcHJvamVjdCBkaXJlY3Rvcnkgd2l0aCB0aGUgZ2l2ZW4gKG9wdGlvbmFsKSByZWxhdGl2ZSBwYXRoXG4gICAqIEBwYXJhbSAge0RpcmVjdG9yeX0gcHJvamVjdERpcmVjdG9yeVxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IFtyZWxhdGl2ZVRvUGF0aD1udWxsXVxuICAgKiBAcmV0dXJuIHtTdHJpbmdbXX1cbiAgICovXG4gIGdldEZpbGVQYXRoc0ZvclByb2plY3REaXJlY3RvcnkgKHByb2plY3REaXJlY3RvcnksIHJlbGF0aXZlVG9QYXRoID0gbnVsbCkge1xuICAgIGxldCBmaWxlUGF0aHMgPSB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3RvcnkuZ2V0KHByb2plY3REaXJlY3RvcnkucGF0aCkgfHwgW11cbiAgICBpZiAocmVsYXRpdmVUb1BhdGgpIHtcbiAgICAgIHJldHVybiBmaWxlUGF0aHMuZmlsdGVyKGZpbGVQYXRoID0+IGZpbGVQYXRoLmluZGV4T2YocmVsYXRpdmVUb1BhdGgpID09PSAwKVxuICAgIH1cbiAgICByZXR1cm4gZmlsZVBhdGhzXG4gIH1cblxuICAvKipcbiAgICogRGlzcG9zZXMgdGhpcyBQYXRoc0NhY2hlXG4gICAqL1xuICBkaXNwb3NlKGlzUGFja2FnZURpc3Bvc2UpIHtcbiAgICB0aGlzLl9maWxlV2F0Y2hlcnNCeURpcmVjdG9yeS5mb3JFYWNoKCh3YXRjaGVyLCBkaXJlY3RvcnkpID0+IHtcbiAgICAgIHdhdGNoZXIuZGlzcG9zZSgpXG4gICAgfSlcbiAgICB0aGlzLl9maWxlV2F0Y2hlcnNCeURpcmVjdG9yeSA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2ZpbGVQYXRoc0J5UHJvamVjdERpcmVjdG9yeSA9IG5ldyBNYXAoKVxuICAgIHRoaXMuX2ZpbGVQYXRoc0J5RGlyZWN0b3J5ID0gbmV3IE1hcCgpXG4gICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gW11cbiAgICBpZiAodGhpcy5fcHJvamVjdFdhdGNoZXIpIHtcbiAgICAgIHRoaXMuX3Byb2plY3RXYXRjaGVyLmRpc3Bvc2UoKVxuICAgICAgdGhpcy5fcHJvamVjdFdhdGNoZXIgPSBudWxsXG4gICAgfVxuICAgIGlmIChpc1BhY2thZ2VEaXNwb3NlICYmIHRoaXMuX3Byb2plY3RDaGFuZ2VXYXRjaGVyKSB7XG4gICAgICB0aGlzLl9wcm9qZWN0Q2hhbmdlV2F0Y2hlci5kaXNwb3NlKClcbiAgICAgIHRoaXMuX3Byb2plY3RDaGFuZ2VXYXRjaGVyID0gbnVsbFxuICAgIH1cbiAgfVxuXG4gIC8vXG4gIC8vIENhY2hlIHdpdGggYGZpbmRgXG4gIC8vXG5cbiAgLyoqXG4gICAqIEJ1aWxkcyB0aGUgaW5pdGlhbCBmaWxlIGNhY2hlIHdpdGggYGZpbmRgXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfYnVpbGRJbml0aWFsQ2FjaGVXaXRoRmluZCgpIHtcbiAgICByZXR1cm4gdGhpcy5fY2FjaGVQcm9qZWN0UGF0aHNBbmRSZXBvc2l0b3JpZXMoKVxuICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICB0aGlzLl9wcm9qZWN0V2F0Y2hlciA9IGF0b20ucHJvamVjdC5vbkRpZENoYW5nZUZpbGVzKHRoaXMuX29uRGlkQ2hhbmdlRmlsZXMuYmluZCh0aGlzKSlcblxuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwoXG4gICAgICAgICAgdGhpcy5fcHJvamVjdERpcmVjdG9yaWVzLm1hcCh0aGlzLl9wb3B1bGF0ZUNhY2hlRm9yLmJpbmQodGhpcykpXG4gICAgICAgICk7XG4gICAgICB9KVxuICAgICAgLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgdGhpcy5lbWl0KCdyZWJ1aWxkLWNhY2hlLWRvbmUnKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH0pO1xuICB9XG5cbiAgX29uRGlkQ2hhbmdlRmlsZXMoZXZlbnRzKSB7XG4gICAgZXZlbnRzXG4gICAgICAuZmlsdGVyKGV2ZW50ID0+IGV2ZW50LmFjdGlvbiAhPT0gJ21vZGlmaWVkJylcbiAgICAgIC5mb3JFYWNoKGV2ZW50ID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLl9wcm9qZWN0RGlyZWN0b3JpZXMpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCB7IGFjdGlvbiwgcGF0aCwgb2xkUGF0aCB9ID0gZXZlbnQ7XG5cbiAgICAgICAgY29uc3QgcHJvamVjdERpcmVjdG9yeSA9IHRoaXMuX3Byb2plY3REaXJlY3Rvcmllc1xuICAgICAgICAgIC5maW5kKHByb2plY3REaXJlY3RvcnkgPT4gcGF0aC5pbmRleE9mKHByb2plY3REaXJlY3RvcnkucGF0aCkgPT09IDApO1xuXG4gICAgICAgIGlmICghcHJvamVjdERpcmVjdG9yeSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gcHJvamVjdERpcmVjdG9yeS5wYXRoO1xuICAgICAgICBjb25zdCBpZ25vcmVkID0gdGhpcy5faXNQYXRoSWdub3JlZChwYXRoKTtcblxuICAgICAgICBpZiAoaWdub3JlZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbGVzID0gdGhpcy5fZmlsZVBhdGhzQnlQcm9qZWN0RGlyZWN0b3J5LmdldChkaXJlY3RvcnlQYXRoKSB8fCBbXTtcblxuICAgICAgICBzd2l0Y2ggKGFjdGlvbikge1xuICAgICAgICAgIGNhc2UgJ2NyZWF0ZWQnOlxuICAgICAgICAgICAgZmlsZXMucHVzaChwYXRoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgICAgY2FzZSAnZGVsZXRlZCc6XG4gICAgICAgICAgICBjb25zdCBpID0gZmlsZXMuaW5kZXhPZihwYXRoKTtcbiAgICAgICAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgICAgICAgZmlsZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgICBjYXNlICdyZW5hbWVkJzpcbiAgICAgICAgICAgIGNvbnN0IGogPSBmaWxlcy5pbmRleE9mKG9sZFBhdGgpO1xuICAgICAgICAgICAgaWYgKGogPiAtMSkge1xuICAgICAgICAgICAgICBmaWxlc1tqXSA9IHBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5fZmlsZVBhdGhzQnlQcm9qZWN0RGlyZWN0b3J5LmhhcyhkaXJlY3RvcnlQYXRoKSkge1xuICAgICAgICAgIHRoaXMuX2ZpbGVQYXRoc0J5UHJvamVjdERpcmVjdG9yeS5zZXQoZGlyZWN0b3J5UGF0aCwgZmlsZXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgbGlzdCBvZiBpZ25vcmUgcGF0dGVybnMgZm9yIGEgZGlyZWN0b3J5XG4gICAqIEBwYXJhbSAge1N0cmluZ30gZGlyZWN0b3J5UGF0aFxuICAgKiBAcmV0dXJuIHtTdHJpbmdbXX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9nZXRJZ25vcmVQYXR0ZXJucyhkaXJlY3RvcnlQYXRoKSB7XG4gICAgY29uc3QgcGF0dGVybnMgPSBbXTtcblxuICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2F1dG9jb21wbGV0ZS1wYXRocy5pZ25vcmVkTmFtZXMnKSkge1xuICAgICAgYXRvbS5jb25maWcuZ2V0KCdjb3JlLmlnbm9yZWROYW1lcycpLmZvckVhY2gocGF0dGVybiA9PiBwYXR0ZXJucy5wdXNoKHBhdHRlcm4pKTtcbiAgICB9XG5cbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdjb3JlLmV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMnKSkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZ2l0SWdub3JlID0gZnMucmVhZEZpbGVTeW5jKGRpcmVjdG9yeVBhdGggKyAnLy5naXRpZ25vcmUnLCAndXRmLTgnKTtcbiAgICAgICAgZ2l0SWdub3JlUGFyc2VyKGdpdElnbm9yZSkuZm9yRWFjaChwYXR0ZXJuID0+IHBhdHRlcm5zLnB1c2gocGF0dGVybikpO1xuICAgICAgfVxuICAgICAgY2F0Y2goZXJyKSB7XG4gICAgICAgIC8vIC5naXRpZ25vcmUgZG9lcyBub3QgZXhpc3QgZm9yIHRoaXMgZGlyZWN0b3J5LCBpZ25vcmluZ1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IGlnbm9yZWRQYXR0ZXJucyA9IGF0b20uY29uZmlnLmdldCgnYXV0b2NvbXBsZXRlLXBhdGhzLmlnbm9yZWRQYXR0ZXJucycpO1xuICAgIGlmIChpZ25vcmVkUGF0dGVybnMpIHtcbiAgICAgIGlnbm9yZWRQYXR0ZXJucy5mb3JFYWNoKHBhdHRlcm4gPT4gcGF0dGVybnMucHVzaChwYXR0ZXJuKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhdHRlcm5zO1xuICB9XG5cbiAgLyoqXG4gICAqIFBvcHVsYXRlcyBjYWNoZSBmb3IgYSBwcm9qZWN0IGRpcmVjdG9yeVxuICAgKiBAcGFyYW0gIHtEaXJlY3Rvcnl9IHByb2plY3REaXJlY3RvcnlcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9wb3B1bGF0ZUNhY2hlRm9yKHByb2plY3REaXJlY3RvcnkpIHtcbiAgICBjb25zdCBkaXJlY3RvcnlQYXRoID0gcHJvamVjdERpcmVjdG9yeS5wYXRoO1xuXG4gICAgY29uc3QgaWdub3JlUGF0dGVybnMgPSB0aGlzLl9nZXRJZ25vcmVQYXR0ZXJucyhkaXJlY3RvcnlQYXRoKTtcbiAgICBjb25zdCBpZ25vcmVQYXR0ZXJuc0ZvckZpbmQgPSBpZ25vcmVQYXR0ZXJucy5tYXAoXG4gICAgICBwYXR0ZXJuID0+IHBhdHRlcm5cbiAgICAgICAgLnJlcGxhY2UoL1xcLi9nLCAnXFxcXC4nKVxuICAgICAgICAucmVwbGFjZSgvXFwqL2csICcuKicpXG4gICAgKTtcbiAgICBjb25zdCBpZ25vcmVQYXR0ZXJuID0gJ1xcJy4qXFxcXCgnICsgaWdub3JlUGF0dGVybnNGb3JGaW5kLmpvaW4oJ1xcXFx8JykgKyAnXFxcXCkuKlxcJyc7XG5cbiAgICBjb25zdCBjbWQgPSBbXG4gICAgICAnZmluZCcsXG4gICAgICAnLUwnLFxuICAgICAgZGlyZWN0b3J5UGF0aCArICcvJyxcbiAgICAgICctdHlwZScsICdmJyxcbiAgICAgICctbm90JywgJy1yZWdleCcsIGlnbm9yZVBhdHRlcm4sXG4gICAgXS5qb2luKCcgJyk7XG5cbiAgICByZXR1cm4gZXhlY1Byb21pc2UoY21kLCB7XG4gICAgICBtYXhCdWZmZXI6IDEwMjQgKiAxMDI0LFxuICAgIH0pLnRoZW4oc3Rkb3V0ID0+IHtcbiAgICAgIGNvbnN0IGZpbGVzID0gXy5jb21wYWN0KHN0ZG91dC5zcGxpdCgnXFxuJykpO1xuXG4gICAgICB0aGlzLl9maWxlUGF0aHNCeVByb2plY3REaXJlY3Rvcnkuc2V0KGRpcmVjdG9yeVBhdGgsIGZpbGVzKTtcblxuICAgICAgcmV0dXJuIGZpbGVzO1xuICAgIH0pO1xuICB9XG59XG4iXX0=