Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

var TargetManager = (function (_EventEmitter) {
  _inherits(TargetManager, _EventEmitter);

  function TargetManager() {
    var _this = this;

    _classCallCheck(this, TargetManager);

    _get(Object.getPrototypeOf(TargetManager.prototype), 'constructor', this).call(this);

    var projectPaths = atom.project.getPaths();

    this.pathTargets = projectPaths.map(function (path) {
      return _this._defaultPathTarget(path);
    });

    atom.project.onDidChangePaths(function (newProjectPaths) {
      var addedPaths = newProjectPaths.filter(function (el) {
        return projectPaths.indexOf(el) === -1;
      });
      var removedPaths = projectPaths.filter(function (el) {
        return newProjectPaths.indexOf(el) === -1;
      });
      addedPaths.forEach(function (path) {
        return _this.pathTargets.push(_this._defaultPathTarget(path));
      });
      _this.pathTargets = _this.pathTargets.filter(function (pt) {
        return -1 === removedPaths.indexOf(pt.path);
      });
      _this.refreshTargets(addedPaths);
      projectPaths = newProjectPaths;
    });

    atom.commands.add('atom-workspace', 'build:refresh-targets', function () {
      return _this.refreshTargets();
    });
    atom.commands.add('atom-workspace', 'build:select-active-target', function () {
      return _this.selectActiveTarget();
    });
  }

  _createClass(TargetManager, [{
    key: 'setBusyProvider',
    value: function setBusyProvider(busyProvider) {
      this.busyProvider = busyProvider;
    }
  }, {
    key: '_defaultPathTarget',
    value: function _defaultPathTarget(path) {
      var CompositeDisposable = require('atom').CompositeDisposable;
      return {
        path: path,
        loading: false,
        targets: [],
        instancedTools: [],
        activeTarget: null,
        tools: [],
        subscriptions: new CompositeDisposable()
      };
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.pathTargets.forEach(function (pathTarget) {
        return pathTarget.tools.map(function (tool) {
          tool.removeAllListeners && tool.removeAllListeners('refresh');
          tool.destructor && tool.destructor();
        });
      });
    }
  }, {
    key: 'setTools',
    value: function setTools(tools) {
      this.tools = tools || [];
    }
  }, {
    key: 'refreshTargets',
    value: function refreshTargets(refreshPaths) {
      var _this2 = this;

      refreshPaths = refreshPaths || atom.project.getPaths();

      this.busyProvider && this.busyProvider.add('Refreshing targets for ' + refreshPaths.join(','));
      var pathPromises = refreshPaths.map(function (path) {
        var pathTarget = _this2.pathTargets.find(function (pt) {
          return pt.path === path;
        });
        pathTarget.loading = true;

        pathTarget.instancedTools = pathTarget.instancedTools.map(function (t) {
          return t.removeAllListeners && t.removeAllListeners('refresh');
        }).filter(function () {
          return false;
        }); // Just empty the array

        var settingsPromise = _this2.tools.map(function (Tool) {
          return new Tool(path);
        }).filter(function (tool) {
          return tool.isEligible();
        }).map(function (tool) {
          pathTarget.instancedTools.push(tool);
          require('./google-analytics').sendEvent('build', 'tool eligible', tool.getNiceName());

          tool.on && tool.on('refresh', _this2.refreshTargets.bind(_this2, [path]));
          return Promise.resolve().then(function () {
            return tool.settings();
          })['catch'](function (err) {
            if (err instanceof SyntaxError) {
              atom.notifications.addError('Invalid build file.', {
                detail: 'You have a syntax error in your build file: ' + err.message,
                dismissable: true
              });
            } else {
              var toolName = tool.getNiceName();
              atom.notifications.addError('Ooops. Something went wrong' + (toolName ? ' in the ' + toolName + ' build provider' : '') + '.', {
                detail: err.message,
                stack: err.stack,
                dismissable: true
              });
            }
          });
        });

        var CompositeDisposable = require('atom').CompositeDisposable;
        return Promise.all(settingsPromise).then(function (settings) {
          settings = require('./utils').uniquifySettings([].concat.apply([], settings).filter(Boolean).map(function (setting) {
            return require('./utils').getDefaultSettings(path, setting);
          }));

          if (null === pathTarget.activeTarget || !settings.find(function (s) {
            return s.name === pathTarget.activeTarget;
          })) {
            /* Active target has been removed or not set. Set it to the highest prio target */
            pathTarget.activeTarget = settings[0] ? settings[0].name : undefined;
          }

          // CompositeDisposable cannot be reused, so we must create a new instance on every refresh
          pathTarget.subscriptions.dispose();
          pathTarget.subscriptions = new CompositeDisposable();

          settings.forEach(function (setting, index) {
            if (setting.keymap && !setting.atomCommandName) {
              setting.atomCommandName = 'build:trigger:' + setting.name;
            }

            if (setting.atomCommandName) {
              pathTarget.subscriptions.add(atom.commands.add('atom-workspace', setting.atomCommandName, function (atomCommandName) {
                return _this2.emit('trigger', atomCommandName);
              }));
            }

            if (setting.keymap) {
              require('./google-analytics').sendEvent('keymap', 'registered', setting.keymap);
              var keymapSpec = { 'atom-workspace, atom-text-editor': {} };
              keymapSpec['atom-workspace, atom-text-editor'][setting.keymap] = setting.atomCommandName;
              pathTarget.subscriptions.add(atom.keymaps.add(setting.name, keymapSpec));
            }
          });

          pathTarget.targets = settings;
          pathTarget.loading = false;

          return pathTarget;
        })['catch'](function (err) {
          atom.notifications.addError('Ooops. Something went wrong.', {
            detail: err.message,
            stack: err.stack,
            dismissable: true
          });
        });
      });

      return Promise.all(pathPromises).then(function (pathTargets) {
        _this2.fillTargets(require('./utils').activePath(), false);
        _this2.emit('refresh-complete');
        _this2.busyProvider && _this2.busyProvider.remove('Refreshing targets for ' + refreshPaths.join(','));

        if (pathTargets.length === 0) {
          return;
        }

        if (atom.config.get('build.notificationOnRefresh')) {
          var rows = refreshPaths.map(function (path) {
            var pathTarget = _this2.pathTargets.find(function (pt) {
              return pt.path === path;
            });
            if (!pathTarget) {
              return 'Targets ' + path + ' no longer exists. Is build deactivated?';
            }
            return pathTarget.targets.length + ' targets at: ' + path;
          });
          atom.notifications.addInfo('Build targets parsed.', {
            detail: rows.join('\n')
          });
        }
      })['catch'](function (err) {
        atom.notifications.addError('Ooops. Something went wrong.', {
          detail: err.message,
          stack: err.stack,
          dismissable: true
        });
      });
    }
  }, {
    key: 'fillTargets',
    value: function fillTargets(path) {
      var _this3 = this;

      var refreshOnEmpty = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (!this.targetsView) {
        return;
      }

      var activeTarget = this.getActiveTarget(path);
      activeTarget && this.targetsView.setActiveTarget(activeTarget.name);

      this.getTargets(path, refreshOnEmpty).then(function (targets) {
        return targets.map(function (t) {
          return t.name;
        });
      }).then(function (targetNames) {
        return _this3.targetsView && _this3.targetsView.setItems(targetNames);
      });
    }
  }, {
    key: 'selectActiveTarget',
    value: function selectActiveTarget() {
      var _this4 = this;

      if (atom.config.get('build.refreshOnShowTargetList')) {
        this.refreshTargets();
      }

      var path = require('./utils').activePath();
      if (!path) {
        atom.notifications.addWarning('Unable to build.', {
          detail: 'Open file is not part of any open project in Atom'
        });
        return;
      }

      var TargetsView = require('./targets-view');
      this.targetsView = new TargetsView();

      if (this.isLoading(path)) {
        this.targetsView.setLoading('Loading project build targets…');
      } else {
        this.fillTargets(path);
      }

      this.targetsView.awaitSelection().then(function (newTarget) {
        _this4.setActiveTarget(path, newTarget);

        _this4.targetsView = null;
      })['catch'](function (err) {
        _this4.targetsView.setError(err.message);
        _this4.targetsView = null;
      });
    }
  }, {
    key: 'getTargets',
    value: function getTargets(path) {
      var refreshOnEmpty = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      var pathTarget = this.pathTargets.find(function (pt) {
        return pt.path === path;
      });
      if (!pathTarget) {
        return Promise.resolve([]);
      }

      if (refreshOnEmpty && pathTarget.targets.length === 0) {
        return this.refreshTargets([pathTarget.path]).then(function () {
          return pathTarget.targets;
        });
      }
      return Promise.resolve(pathTarget.targets);
    }
  }, {
    key: 'getActiveTarget',
    value: function getActiveTarget(path) {
      var pathTarget = this.pathTargets.find(function (pt) {
        return pt.path === path;
      });
      if (!pathTarget) {
        return null;
      }
      return pathTarget.targets.find(function (target) {
        return target.name === pathTarget.activeTarget;
      });
    }
  }, {
    key: 'setActiveTarget',
    value: function setActiveTarget(path, targetName) {
      this.pathTargets.find(function (pt) {
        return pt.path === path;
      }).activeTarget = targetName;
      this.emit('new-active-target', path, this.getActiveTarget(path));
    }
  }, {
    key: 'isLoading',
    value: function isLoading(path) {
      return this.pathTargets.find(function (pt) {
        return pt.path === path;
      }).loading;
    }
  }]);

  return TargetManager;
})(_events2['default']);

exports['default'] = TargetManager;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvdGFyZ2V0LW1hbmFnZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7c0JBRXlCLFFBQVE7Ozs7QUFGakMsV0FBVyxDQUFDOztJQUlOLGFBQWE7WUFBYixhQUFhOztBQUNOLFdBRFAsYUFBYSxHQUNIOzs7MEJBRFYsYUFBYTs7QUFFZiwrQkFGRSxhQUFhLDZDQUVQOztBQUVSLFFBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUM7O0FBRTNDLFFBQUksQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7YUFBSSxNQUFLLGtCQUFrQixDQUFDLElBQUksQ0FBQztLQUFBLENBQUMsQ0FBQzs7QUFFM0UsUUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFBLGVBQWUsRUFBSTtBQUMvQyxVQUFNLFVBQVUsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRTtlQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQUEsQ0FBQyxDQUFDO0FBQ2pGLFVBQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUMsVUFBQSxFQUFFO2VBQUksZUFBZSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDbkYsZ0JBQVUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2VBQUksTUFBSyxXQUFXLENBQUMsSUFBSSxDQUFDLE1BQUssa0JBQWtCLENBQUMsSUFBSSxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7QUFDakYsWUFBSyxXQUFXLEdBQUcsTUFBSyxXQUFXLENBQUMsTUFBTSxDQUFDLFVBQUEsRUFBRTtlQUFJLENBQUMsQ0FBQyxLQUFLLFlBQVksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUks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QUFFO2VBQUksRUFBRSxDQUFDLElBQUksS0FBSyxJQUFJO09BQUEsQ0FBQyxDQUFDO0FBQ2pFLFVBQUksQ0FBQyxVQUFVLEVBQUU7QUFDZixlQUFPLElBQUksQ0FBQztPQUNiO0FBQ0QsYUFBTyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFBLE1BQU07ZUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLFVBQVUsQ0FBQyxZQUFZO09BQUEsQ0FBQyxDQUFDO0tBQ25GOzs7V0FFYyx5QkFBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO0FBQ2hDLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQUEsRUFBRTtlQUFJLEVBQUUsQ0FBQyxJQUFJLEtBQUssSUFBSTtPQUFBLENBQUMsQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDO0FBQ3hFLFVBQUksQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUNsRTs7O1dBRVEsbUJBQUMsSUFBSSxFQUFFO0FBQ2QsYUFBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFBLEVBQUU7ZUFBSSxFQUFFLENBQUMsSUFBSSxLQUFLLElBQUk7T0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDO0tBQzlEOzs7U0EzT0csYUFBYTs7O3FCQThPSixhQUFhIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvdGFyZ2V0LW1hbmFnZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5jbGFzcyBUYXJnZXRNYW5hZ2VyIGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIGxldCBwcm9qZWN0UGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKTtcblxuICAgIHRoaXMucGF0aFRhcmdldHMgPSBwcm9qZWN0UGF0aHMubWFwKHBhdGggPT4gdGhpcy5fZGVmYXVsdFBhdGhUYXJnZXQocGF0aCkpO1xuXG4gICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMobmV3UHJvamVjdFBhdGhzID0+IHtcbiAgICAgIGNvbnN0IGFkZGVkUGF0aHMgPSBuZXdQcm9qZWN0UGF0aHMuZmlsdGVyKGVsID0+IHByb2plY3RQYXRocy5pbmRleE9mKGVsKSA9PT0gLTEpO1xuICAgICAgY29uc3QgcmVtb3ZlZFBhdGhzID0gcHJvamVjdFBhdGhzLmZpbHRlcihlbCA9PiBuZXdQcm9qZWN0UGF0aHMuaW5kZXhPZihlbCkgPT09IC0xKTtcbiAgICAgIGFkZGVkUGF0aHMuZm9yRWFjaChwYXRoID0+IHRoaXMucGF0aFRhcmdldHMucHVzaCh0aGlzLl9kZWZhdWx0UGF0aFRhcmdldChwYXRoKSkpO1xuICAgICAgdGhpcy5wYXRoVGFyZ2V0cyA9IHRoaXMucGF0aFRhcmdldHMuZmlsdGVyKHB0ID0+IC0xID09PSByZW1vdmVkUGF0aHMuaW5kZXhPZihwdC5wYXRoKSk7XG4gICAgICB0aGlzLnJlZnJlc2hUYXJnZXRzKGFkZGVkUGF0aHMpO1xuICAgICAgcHJvamVjdFBhdGhzID0gbmV3UHJvamVjdFBhdGhzO1xuICAgIH0pO1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnJlZnJlc2gtdGFyZ2V0cycsICgpID0+IHRoaXMucmVmcmVzaFRhcmdldHMoKSk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnNlbGVjdC1hY3RpdmUtdGFyZ2V0JywgKCkgPT4gdGhpcy5zZWxlY3RBY3RpdmVUYXJnZXQoKSk7XG4gIH1cblxuICBzZXRCdXN5UHJvdmlkZXIoYnVzeVByb3ZpZGVyKSB7XG4gICAgdGhpcy5idXN5UHJvdmlkZXIgPSBidXN5UHJvdmlkZXI7XG4gIH1cblxuICBfZGVmYXVsdFBhdGhUYXJnZXQocGF0aCkge1xuICAgIGNvbnN0IENvbXBvc2l0ZURpc3Bvc2FibGUgPSByZXF1aXJlKCdhdG9tJykuQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgICByZXR1cm4ge1xuICAgICAgcGF0aDogcGF0aCxcbiAgICAgIGxvYWRpbmc6IGZhbHNlLFxuICAgICAgdGFyZ2V0czogW10sXG4gICAgICBpbnN0YW5jZWRUb29sczogW10sXG4gICAgICBhY3RpdmVUYXJnZXQ6IG51bGwsXG4gICAgICB0b29sczogW10sXG4gICAgICBzdWJzY3JpcHRpb25zOiBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpXG4gICAgfTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5wYXRoVGFyZ2V0cy5mb3JFYWNoKHBhdGhUYXJnZXQgPT4gcGF0aFRhcmdldC50b29scy5tYXAodG9vbCA9PiB7XG4gICAgICB0b29sLnJlbW92ZUFsbExpc3RlbmVycyAmJiB0b29sLnJlbW92ZUFsbExpc3RlbmVycygncmVmcmVzaCcpO1xuICAgICAgdG9vbC5kZXN0cnVjdG9yICYmIHRvb2wuZGVzdHJ1Y3RvcigpO1xuICAgIH0pKTtcbiAgfVxuXG4gIHNldFRvb2xzKHRvb2xzKSB7XG4gICAgdGhpcy50b29scyA9IHRvb2xzIHx8IFtdO1xuICB9XG5cbiAgcmVmcmVzaFRhcmdldHMocmVmcmVzaFBhdGhzKSB7XG4gICAgcmVmcmVzaFBhdGhzID0gcmVmcmVzaFBhdGhzIHx8IGF0b20ucHJvamVjdC5nZXRQYXRocygpO1xuXG4gICAgdGhpcy5idXN5UHJvdmlkZXIgJiYgdGhpcy5idXN5UHJvdmlkZXIuYWRkKGBSZWZyZXNoaW5nIHRhcmdldHMgZm9yICR7cmVmcmVzaFBhdGhzLmpvaW4oJywnKX1gKTtcbiAgICBjb25zdCBwYXRoUHJvbWlzZXMgPSByZWZyZXNoUGF0aHMubWFwKChwYXRoKSA9PiB7XG4gICAgICBjb25zdCBwYXRoVGFyZ2V0ID0gdGhpcy5wYXRoVGFyZ2V0cy5maW5kKHB0ID0+IHB0LnBhdGggPT09IHBhdGgpO1xuICAgICAgcGF0aFRhcmdldC5sb2FkaW5nID0gdHJ1ZTtcblxuICAgICAgcGF0aFRhcmdldC5pbnN0YW5jZWRUb29scyA9IHBhdGhUYXJnZXQuaW5zdGFuY2VkVG9vbHNcbiAgICAgICAgLm1hcCh0ID0+IHQucmVtb3ZlQWxsTGlzdGVuZXJzICYmIHQucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZWZyZXNoJykpXG4gICAgICAgIC5maWx0ZXIoKCkgPT4gZmFsc2UpOyAvLyBKdXN0IGVtcHR5IHRoZSBhcnJheVxuXG4gICAgICBjb25zdCBzZXR0aW5nc1Byb21pc2UgPSB0aGlzLnRvb2xzXG4gICAgICAgIC5tYXAoVG9vbCA9PiBuZXcgVG9vbChwYXRoKSlcbiAgICAgICAgLmZpbHRlcih0b29sID0+IHRvb2wuaXNFbGlnaWJsZSgpKVxuICAgICAgICAubWFwKHRvb2wgPT4ge1xuICAgICAgICAgIHBhdGhUYXJnZXQuaW5zdGFuY2VkVG9vbHMucHVzaCh0b29sKTtcbiAgICAgICAgICByZXF1aXJlKCcuL2dvb2dsZS1hbmFseXRpY3MnKS5zZW5kRXZlbnQoJ2J1aWxkJywgJ3Rvb2wgZWxpZ2libGUnLCB0b29sLmdldE5pY2VOYW1lKCkpO1xuXG4gICAgICAgICAgdG9vbC5vbiAmJiB0b29sLm9uKCdyZWZyZXNoJywgdGhpcy5yZWZyZXNoVGFyZ2V0cy5iaW5kKHRoaXMsIFsgcGF0aCBdKSk7XG4gICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB0b29sLnNldHRpbmdzKCkpXG4gICAgICAgICAgICAuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIFN5bnRheEVycm9yKSB7XG4gICAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdJbnZhbGlkIGJ1aWxkIGZpbGUuJywge1xuICAgICAgICAgICAgICAgICAgZGV0YWlsOiAnWW91IGhhdmUgYSBzeW50YXggZXJyb3IgaW4geW91ciBidWlsZCBmaWxlOiAnICsgZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRvb2xOYW1lID0gdG9vbC5nZXROaWNlTmFtZSgpO1xuICAgICAgICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignT29vcHMuIFNvbWV0aGluZyB3ZW50IHdyb25nJyArICh0b29sTmFtZSA/ICcgaW4gdGhlICcgKyB0b29sTmFtZSArICcgYnVpbGQgcHJvdmlkZXInIDogJycpICsgJy4nLCB7XG4gICAgICAgICAgICAgICAgICBkZXRhaWw6IGVyci5tZXNzYWdlLFxuICAgICAgICAgICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICAgICAgICAgIGRpc21pc3NhYmxlOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgY29uc3QgQ29tcG9zaXRlRGlzcG9zYWJsZSA9IHJlcXVpcmUoJ2F0b20nKS5Db21wb3NpdGVEaXNwb3NhYmxlO1xuICAgICAgcmV0dXJuIFByb21pc2UuYWxsKHNldHRpbmdzUHJvbWlzZSkudGhlbigoc2V0dGluZ3MpID0+IHtcbiAgICAgICAgc2V0dGluZ3MgPSByZXF1aXJlKCcuL3V0aWxzJykudW5pcXVpZnlTZXR0aW5ncyhbXS5jb25jYXQuYXBwbHkoW10sIHNldHRpbmdzKVxuICAgICAgICAgIC5maWx0ZXIoQm9vbGVhbilcbiAgICAgICAgICAubWFwKHNldHRpbmcgPT4gcmVxdWlyZSgnLi91dGlscycpLmdldERlZmF1bHRTZXR0aW5ncyhwYXRoLCBzZXR0aW5nKSkpO1xuXG4gICAgICAgIGlmIChudWxsID09PSBwYXRoVGFyZ2V0LmFjdGl2ZVRhcmdldCB8fCAhc2V0dGluZ3MuZmluZChzID0+IHMubmFtZSA9PT0gcGF0aFRhcmdldC5hY3RpdmVUYXJnZXQpKSB7XG4gICAgICAgICAgLyogQWN0aXZlIHRhcmdldCBoYXMgYmVlbiByZW1vdmVkIG9yIG5vdCBzZXQuIFNldCBpdCB0byB0aGUgaGlnaGVzdCBwcmlvIHRhcmdldCAqL1xuICAgICAgICAgIHBhdGhUYXJnZXQuYWN0aXZlVGFyZ2V0ID0gc2V0dGluZ3NbMF0gPyBzZXR0aW5nc1swXS5uYW1lIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ29tcG9zaXRlRGlzcG9zYWJsZSBjYW5ub3QgYmUgcmV1c2VkLCBzbyB3ZSBtdXN0IGNyZWF0ZSBhIG5ldyBpbnN0YW5jZSBvbiBldmVyeSByZWZyZXNoXG4gICAgICAgIHBhdGhUYXJnZXQuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgICAgIHBhdGhUYXJnZXQuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICAgICAgc2V0dGluZ3MuZm9yRWFjaCgoc2V0dGluZywgaW5kZXgpID0+IHtcbiAgICAgICAgICBpZiAoc2V0dGluZy5rZXltYXAgJiYgIXNldHRpbmcuYXRvbUNvbW1hbmROYW1lKSB7XG4gICAgICAgICAgICBzZXR0aW5nLmF0b21Db21tYW5kTmFtZSA9IGBidWlsZDp0cmlnZ2VyOiR7c2V0dGluZy5uYW1lfWA7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNldHRpbmcuYXRvbUNvbW1hbmROYW1lKSB7XG4gICAgICAgICAgICBwYXRoVGFyZ2V0LnN1YnNjcmlwdGlvbnMuYWRkKGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHNldHRpbmcuYXRvbUNvbW1hbmROYW1lLCBhdG9tQ29tbWFuZE5hbWUgPT4gdGhpcy5lbWl0KCd0cmlnZ2VyJywgYXRvbUNvbW1hbmROYW1lKSkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChzZXR0aW5nLmtleW1hcCkge1xuICAgICAgICAgICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdrZXltYXAnLCAncmVnaXN0ZXJlZCcsIHNldHRpbmcua2V5bWFwKTtcbiAgICAgICAgICAgIGNvbnN0IGtleW1hcFNwZWMgPSB7ICdhdG9tLXdvcmtzcGFjZSwgYXRvbS10ZXh0LWVkaXRvcic6IHt9IH07XG4gICAgICAgICAgICBrZXltYXBTcGVjWydhdG9tLXdvcmtzcGFjZSwgYXRvbS10ZXh0LWVkaXRvciddW3NldHRpbmcua2V5bWFwXSA9IHNldHRpbmcuYXRvbUNvbW1hbmROYW1lO1xuICAgICAgICAgICAgcGF0aFRhcmdldC5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmtleW1hcHMuYWRkKHNldHRpbmcubmFtZSwga2V5bWFwU3BlYykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcGF0aFRhcmdldC50YXJnZXRzID0gc2V0dGluZ3M7XG4gICAgICAgIHBhdGhUYXJnZXQubG9hZGluZyA9IGZhbHNlO1xuXG4gICAgICAgIHJldHVybiBwYXRoVGFyZ2V0O1xuICAgICAgfSkuY2F0Y2goZXJyID0+IHtcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPb29wcy4gU29tZXRoaW5nIHdlbnQgd3JvbmcuJywge1xuICAgICAgICAgIGRldGFpbDogZXJyLm1lc3NhZ2UsXG4gICAgICAgICAgc3RhY2s6IGVyci5zdGFjayxcbiAgICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHBhdGhQcm9taXNlcykudGhlbihwYXRoVGFyZ2V0cyA9PiB7XG4gICAgICB0aGlzLmZpbGxUYXJnZXRzKHJlcXVpcmUoJy4vdXRpbHMnKS5hY3RpdmVQYXRoKCksIGZhbHNlKTtcbiAgICAgIHRoaXMuZW1pdCgncmVmcmVzaC1jb21wbGV0ZScpO1xuICAgICAgdGhpcy5idXN5UHJvdmlkZXIgJiYgdGhpcy5idXN5UHJvdmlkZXIucmVtb3ZlKGBSZWZyZXNoaW5nIHRhcmdldHMgZm9yICR7cmVmcmVzaFBhdGhzLmpvaW4oJywnKX1gKTtcblxuICAgICAgaWYgKHBhdGhUYXJnZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLm5vdGlmaWNhdGlvbk9uUmVmcmVzaCcpKSB7XG4gICAgICAgIGNvbnN0IHJvd3MgPSByZWZyZXNoUGF0aHMubWFwKHBhdGggPT4ge1xuICAgICAgICAgIGNvbnN0IHBhdGhUYXJnZXQgPSB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCk7XG4gICAgICAgICAgaWYgKCFwYXRoVGFyZ2V0KSB7XG4gICAgICAgICAgICByZXR1cm4gYFRhcmdldHMgJHtwYXRofSBubyBsb25nZXIgZXhpc3RzLiBJcyBidWlsZCBkZWFjdGl2YXRlZD9gO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYCR7cGF0aFRhcmdldC50YXJnZXRzLmxlbmd0aH0gdGFyZ2V0cyBhdDogJHtwYXRofWA7XG4gICAgICAgIH0pO1xuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbygnQnVpbGQgdGFyZ2V0cyBwYXJzZWQuJywge1xuICAgICAgICAgIGRldGFpbDogcm93cy5qb2luKCdcXG4nKVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KS5jYXRjaChlcnIgPT4ge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdPb29wcy4gU29tZXRoaW5nIHdlbnQgd3JvbmcuJywge1xuICAgICAgICBkZXRhaWw6IGVyci5tZXNzYWdlLFxuICAgICAgICBzdGFjazogZXJyLnN0YWNrLFxuICAgICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmaWxsVGFyZ2V0cyhwYXRoLCByZWZyZXNoT25FbXB0eSA9IHRydWUpIHtcbiAgICBpZiAoIXRoaXMudGFyZ2V0c1ZpZXcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBhY3RpdmVUYXJnZXQgPSB0aGlzLmdldEFjdGl2ZVRhcmdldChwYXRoKTtcbiAgICBhY3RpdmVUYXJnZXQgJiYgdGhpcy50YXJnZXRzVmlldy5zZXRBY3RpdmVUYXJnZXQoYWN0aXZlVGFyZ2V0Lm5hbWUpO1xuXG4gICAgdGhpcy5nZXRUYXJnZXRzKHBhdGgsIHJlZnJlc2hPbkVtcHR5KVxuICAgICAgLnRoZW4odGFyZ2V0cyA9PiB0YXJnZXRzLm1hcCh0ID0+IHQubmFtZSkpXG4gICAgICAudGhlbih0YXJnZXROYW1lcyA9PiB0aGlzLnRhcmdldHNWaWV3ICYmIHRoaXMudGFyZ2V0c1ZpZXcuc2V0SXRlbXModGFyZ2V0TmFtZXMpKTtcbiAgfVxuXG4gIHNlbGVjdEFjdGl2ZVRhcmdldCgpIHtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5yZWZyZXNoT25TaG93VGFyZ2V0TGlzdCcpKSB7XG4gICAgICB0aGlzLnJlZnJlc2hUYXJnZXRzKCk7XG4gICAgfVxuXG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJy4vdXRpbHMnKS5hY3RpdmVQYXRoKCk7XG4gICAgaWYgKCFwYXRoKSB7XG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZygnVW5hYmxlIHRvIGJ1aWxkLicsIHtcbiAgICAgICAgZGV0YWlsOiAnT3BlbiBmaWxlIGlzIG5vdCBwYXJ0IG9mIGFueSBvcGVuIHByb2plY3QgaW4gQXRvbSdcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IFRhcmdldHNWaWV3ID0gcmVxdWlyZSgnLi90YXJnZXRzLXZpZXcnKTtcbiAgICB0aGlzLnRhcmdldHNWaWV3ID0gbmV3IFRhcmdldHNWaWV3KCk7XG5cbiAgICBpZiAodGhpcy5pc0xvYWRpbmcocGF0aCkpIHtcbiAgICAgIHRoaXMudGFyZ2V0c1ZpZXcuc2V0TG9hZGluZygnTG9hZGluZyBwcm9qZWN0IGJ1aWxkIHRhcmdldHNcXHUyMDI2Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZmlsbFRhcmdldHMocGF0aCk7XG4gICAgfVxuXG4gICAgdGhpcy50YXJnZXRzVmlldy5hd2FpdFNlbGVjdGlvbigpLnRoZW4obmV3VGFyZ2V0ID0+IHtcbiAgICAgIHRoaXMuc2V0QWN0aXZlVGFyZ2V0KHBhdGgsIG5ld1RhcmdldCk7XG5cbiAgICAgIHRoaXMudGFyZ2V0c1ZpZXcgPSBudWxsO1xuICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgIHRoaXMudGFyZ2V0c1ZpZXcuc2V0RXJyb3IoZXJyLm1lc3NhZ2UpO1xuICAgICAgdGhpcy50YXJnZXRzVmlldyA9IG51bGw7XG4gICAgfSk7XG4gIH1cblxuICBnZXRUYXJnZXRzKHBhdGgsIHJlZnJlc2hPbkVtcHR5ID0gdHJ1ZSkge1xuICAgIGNvbnN0IHBhdGhUYXJnZXQgPSB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCk7XG4gICAgaWYgKCFwYXRoVGFyZ2V0KSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcbiAgICB9XG5cbiAgICBpZiAocmVmcmVzaE9uRW1wdHkgJiYgcGF0aFRhcmdldC50YXJnZXRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMucmVmcmVzaFRhcmdldHMoWyBwYXRoVGFyZ2V0LnBhdGggXSkudGhlbigoKSA9PiBwYXRoVGFyZ2V0LnRhcmdldHMpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBhdGhUYXJnZXQudGFyZ2V0cyk7XG4gIH1cblxuICBnZXRBY3RpdmVUYXJnZXQocGF0aCkge1xuICAgIGNvbnN0IHBhdGhUYXJnZXQgPSB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCk7XG4gICAgaWYgKCFwYXRoVGFyZ2V0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGhUYXJnZXQudGFyZ2V0cy5maW5kKHRhcmdldCA9PiB0YXJnZXQubmFtZSA9PT0gcGF0aFRhcmdldC5hY3RpdmVUYXJnZXQpO1xuICB9XG5cbiAgc2V0QWN0aXZlVGFyZ2V0KHBhdGgsIHRhcmdldE5hbWUpIHtcbiAgICB0aGlzLnBhdGhUYXJnZXRzLmZpbmQocHQgPT4gcHQucGF0aCA9PT0gcGF0aCkuYWN0aXZlVGFyZ2V0ID0gdGFyZ2V0TmFtZTtcbiAgICB0aGlzLmVtaXQoJ25ldy1hY3RpdmUtdGFyZ2V0JywgcGF0aCwgdGhpcy5nZXRBY3RpdmVUYXJnZXQocGF0aCkpO1xuICB9XG5cbiAgaXNMb2FkaW5nKHBhdGgpIHtcbiAgICByZXR1cm4gdGhpcy5wYXRoVGFyZ2V0cy5maW5kKHB0ID0+IHB0LnBhdGggPT09IHBhdGgpLmxvYWRpbmc7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFyZ2V0TWFuYWdlcjtcbiJdfQ==