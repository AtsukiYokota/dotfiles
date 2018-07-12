'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

exports['default'] = {
  config: require('./config'),

  activate: function activate() {
    var _this = this;

    if (!/^win/.test(process.platform)) {
      // Manually append /usr/local/bin as it may not be set on some systems,
      // and it's common to have node installed here. Keep it at end so it won't
      // accidentially override any other node installation

      // Note: This should probably be removed in a end-user friendly way...
      process.env.PATH += ':/usr/local/bin';
    }

    require('atom-package-deps').install('build');

    this.tools = [require('./atom-build')];
    this.linter = null;

    this.setupTargetManager();
    this.setupBuildView();
    this.setupErrorMatcher();

    atom.commands.add('atom-workspace', 'build:trigger', function () {
      return _this.build('trigger');
    });
    atom.commands.add('atom-workspace', 'build:stop', function () {
      return _this.stop();
    });
    atom.commands.add('atom-workspace', 'build:confirm', function () {
      require('./google-analytics').sendEvent('build', 'confirmed');
      document.activeElement.click();
    });
    atom.commands.add('atom-workspace', 'build:no-confirm', function () {
      if (_this.saveConfirmView) {
        require('./google-analytics').sendEvent('build', 'not confirmed');
        _this.saveConfirmView.cancel();
      }
    });

    atom.workspace.observeTextEditors(function (editor) {
      editor.onDidSave(function () {
        if (atom.config.get('build.buildOnSave')) {
          _this.build('save');
        }
      });
    });

    atom.workspace.onDidChangeActivePaneItem(function () {
      return _this.updateStatusBar();
    });
    atom.packages.onDidActivateInitialPackages(function () {
      return _this.targetManager.refreshTargets();
    });
  },

  setupTargetManager: function setupTargetManager() {
    var _this2 = this;

    var TargetManager = require('./target-manager');
    this.targetManager = new TargetManager();
    this.targetManager.setTools(this.tools);
    this.targetManager.on('refresh-complete', function () {
      _this2.updateStatusBar();
    });
    this.targetManager.on('new-active-target', function (path, target) {
      _this2.updateStatusBar();

      if (atom.config.get('build.selectTriggers')) {
        _this2.build('trigger');
      }
    });
    this.targetManager.on('trigger', function (atomCommandName) {
      return _this2.build('trigger', atomCommandName);
    });
  },

  setupBuildView: function setupBuildView() {
    var BuildView = require('./build-view');
    this.buildView = new BuildView();
  },

  setupErrorMatcher: function setupErrorMatcher() {
    var _this3 = this;

    var ErrorMatcher = require('./error-matcher');
    this.errorMatcher = new ErrorMatcher();
    this.errorMatcher.on('error', function (message) {
      atom.notifications.addError('Error matching failed!', { detail: message });
    });
    this.errorMatcher.on('matched', function (match) {
      match[0] && _this3.buildView.scrollTo(match[0]);
    });
  },

  deactivate: function deactivate() {
    if (this.child) {
      this.child.removeAllListeners();
      require('tree-kill')(this.child.pid, 'SIGKILL');
      this.child = null;
    }

    this.statusBarView && this.statusBarView.destroy();
    this.buildView && this.buildView.destroy();
    this.saveConfirmView && this.saveConfirmView.destroy();
    this.linter && this.linter.destroy();
    this.targetManager.destroy();

    clearTimeout(this.finishedTimer);
  },

  updateStatusBar: function updateStatusBar() {
    var path = require('./utils').activePath();
    var activeTarget = this.targetManager.getActiveTarget(path);
    this.statusBarView && activeTarget && this.statusBarView.setTarget(activeTarget.name);
  },

  startNewBuild: function startNewBuild(source, atomCommandName) {
    var _this4 = this;

    var BuildError = require('./build-error');
    var path = require('./utils').activePath();
    var buildTitle = '';
    this.linter && this.linter.clear();

    Promise.resolve(this.targetManager.getTargets(path)).then(function (targets) {
      if (!targets || 0 === targets.length) {
        throw new BuildError('No eligible build target.', 'No configuration to build this project exists.');
      }

      var target = targets.find(function (t) {
        return t.atomCommandName === atomCommandName;
      });
      if (!target) {
        target = _this4.targetManager.getActiveTarget(path);
      }
      require('./google-analytics').sendEvent('build', 'triggered');

      if (!target.exec) {
        throw new BuildError('Invalid build file.', 'No executable command specified.');
      }

      _this4.statusBarView && _this4.statusBarView.buildStarted();
      _this4.busyProvider && _this4.busyProvider.add('Build: ' + target.name);
      _this4.buildView.buildStarted();
      _this4.buildView.setHeading('Running preBuild...');

      return Promise.resolve(target.preBuild ? target.preBuild() : null).then(function () {
        return target;
      });
    }).then(function (target) {
      var replace = require('./utils').replace;
      var env = Object.assign({}, process.env, target.env);
      Object.keys(env).forEach(function (key) {
        env[key] = replace(env[key], target.env);
      });

      var exec = replace(target.exec, target.env);
      var args = target.args.map(function (arg) {
        return replace(arg, target.env);
      });
      var cwd = replace(target.cwd, target.env);
      var isWin = process.platform === 'win32';
      var shCmd = isWin ? 'cmd' : '/bin/sh';
      var shCmdArg = isWin ? '/C' : '-c';

      // Store this as we need to re-set it after postBuild
      buildTitle = [target.sh ? shCmd + ' ' + shCmdArg + ' ' + exec : exec].concat(_toConsumableArray(args), ['\n']).join(' ');

      _this4.buildView.setHeading(buildTitle);
      if (target.sh) {
        _this4.child = require('child_process').spawn(shCmd, [shCmdArg, [exec].concat(args).join(' ')], { cwd: cwd, env: env, stdio: ['ignore', null, null] });
      } else {
        _this4.child = require('cross-spawn').spawn(exec, args, { cwd: cwd, env: env, stdio: ['ignore', null, null] });
      }

      var stdout = '';
      var stderr = '';
      _this4.child.stdout.setEncoding('utf8');
      _this4.child.stderr.setEncoding('utf8');
      _this4.child.stdout.on('data', function (d) {
        return stdout += d;
      });
      _this4.child.stderr.on('data', function (d) {
        return stderr += d;
      });
      _this4.child.stdout.pipe(_this4.buildView.terminal);
      _this4.child.stderr.pipe(_this4.buildView.terminal);
      _this4.child.killSignals = (target.killSignals || ['SIGINT', 'SIGTERM', 'SIGKILL']).slice();

      _this4.child.on('error', function (err) {
        _this4.buildView.terminal.write((target.sh ? 'Unable to execute with shell: ' : 'Unable to execute: ') + exec + '\n');

        if (/\s/.test(exec) && !target.sh) {
          _this4.buildView.terminal.write('`cmd` cannot contain space. Use `args` for arguments.\n');
        }

        if ('ENOENT' === err.code) {
          _this4.buildView.terminal.write('Make sure cmd:\'' + exec + '\' and cwd:\'' + cwd + '\' exists and have correct access permissions.\n');
          _this4.buildView.terminal.write('Binaries are found in these folders: ' + process.env.PATH + '\n');
        }
      });

      _this4.child.on('close', function (exitCode) {
        _this4.child = null;
        _this4.errorMatcher.set(target, cwd, stdout + stderr);

        var success = 0 === exitCode;
        if (atom.config.get('build.matchedErrorFailsBuild')) {
          success = success && !_this4.errorMatcher.getMatches().some(function (match) {
            return match.type && match.type.toLowerCase() === 'error';
          });
        }

        _this4.linter && _this4.linter.processMessages(_this4.errorMatcher.getMatches(), cwd);

        if (atom.config.get('build.beepWhenDone')) {
          atom.beep();
        }

        _this4.buildView.setHeading('Running postBuild...');
        return Promise.resolve(target.postBuild ? target.postBuild(success, stdout, stderr) : null).then(function () {
          _this4.buildView.setHeading(buildTitle);

          _this4.busyProvider && _this4.busyProvider.remove('Build: ' + target.name, success);
          _this4.buildView.buildFinished(success);
          _this4.statusBarView && _this4.statusBarView.setBuildSuccess(success);
          if (success) {
            require('./google-analytics').sendEvent('build', 'succeeded');
            _this4.finishedTimer = setTimeout(function () {
              _this4.buildView.detach();
            }, 1200);
          } else {
            if (atom.config.get('build.scrollOnError')) {
              _this4.errorMatcher.matchFirst();
            }
            require('./google-analytics').sendEvent('build', 'failed');
          }

          _this4.nextBuild && _this4.nextBuild();
          _this4.nextBuild = null;
        });
      });
    })['catch'](function (err) {
      if (err instanceof BuildError) {
        if (source === 'save') {
          // If there is no eligible build tool, and cause of build was a save, stay quiet.
          return;
        }

        atom.notifications.addWarning(err.name, { detail: err.message, stack: err.stack });
      } else {
        atom.notifications.addError('Failed to build.', { detail: err.message, stack: err.stack });
      }
    });
  },

  sendNextSignal: function sendNextSignal() {
    try {
      var signal = this.child.killSignals.shift();
      require('tree-kill')(this.child.pid, signal);
    } catch (e) {
      /* Something may have happened to the child (e.g. terminated by itself). Ignore this. */
    }
  },

  abort: function abort(cb) {
    var _this5 = this;

    if (!this.child.killed) {
      this.buildView.buildAbortInitiated();
      this.child.killed = true;
      this.child.on('exit', function () {
        _this5.child = null;
        cb && cb();
      });
    }

    this.sendNextSignal();
  },

  build: function build(source, event) {
    var _this6 = this;

    clearTimeout(this.finishedTimer);

    this.doSaveConfirm(this.unsavedTextEditors(), function () {
      var nextBuild = _this6.startNewBuild.bind(_this6, source, event ? event.type : null);
      if (_this6.child) {
        _this6.nextBuild = nextBuild;
        return _this6.abort();
      }
      return nextBuild();
    });
  },

  doSaveConfirm: function doSaveConfirm(modifiedTextEditors, continuecb, cancelcb) {
    var saveAndContinue = function saveAndContinue(save) {
      modifiedTextEditors.forEach(function (textEditor) {
        return save && textEditor.save();
      });
      continuecb();
    };

    if (0 === modifiedTextEditors.length || atom.config.get('build.saveOnBuild')) {
      saveAndContinue(true);
      return;
    }

    if (this.saveConfirmView) {
      this.saveConfirmView.destroy();
    }

    var SaveConfirmView = require('./save-confirm-view');
    this.saveConfirmView = new SaveConfirmView();
    this.saveConfirmView.show(saveAndContinue, cancelcb);
  },

  unsavedTextEditors: function unsavedTextEditors() {
    return atom.workspace.getTextEditors().filter(function (textEditor) {
      return textEditor.isModified() && undefined !== textEditor.getPath();
    });
  },

  stop: function stop() {
    var _this7 = this;

    this.nextBuild = null;
    clearTimeout(this.finishedTimer);
    if (this.child) {
      this.abort(function () {
        _this7.buildView.buildAborted();
        _this7.statusBarView && _this7.statusBarView.buildAborted();
      });
    } else {
      this.buildView.reset();
    }
  },

  consumeLinterRegistry: function consumeLinterRegistry(registry) {
    this.linter && this.linter.destroy();
    var Linter = require('./linter-integration');
    this.linter = new Linter(registry);
  },

  consumeBuilder: function consumeBuilder(builder) {
    var _tools,
        _this8 = this;

    if (Array.isArray(builder)) (_tools = this.tools).push.apply(_tools, _toConsumableArray(builder));else this.tools.push(builder);
    this.targetManager.setTools(this.tools);
    var Disposable = require('atom').Disposable;
    return new Disposable(function () {
      _this8.tools = _this8.tools.filter(Array.isArray(builder) ? function (tool) {
        return builder.indexOf(tool) === -1;
      } : function (tool) {
        return tool !== builder;
      });
      _this8.targetManager.setTools(_this8.tools);
    });
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    var _this9 = this;

    var StatusBarView = require('./status-bar-view');
    this.statusBarView = new StatusBarView(statusBar);
    this.statusBarView.onClick(function () {
      return _this9.targetManager.selectActiveTarget();
    });
    this.statusBarView.attach();
  },

  consumeBusySignal: function consumeBusySignal(registry) {
    this.busyProvider = registry.create();
    this.targetManager.setBusyProvider(this.busyProvider);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7OztxQkFFRztBQUNiLFFBQU0sRUFBRSxPQUFPLENBQUMsVUFBVSxDQUFDOztBQUUzQixVQUFRLEVBQUEsb0JBQUc7OztBQUNULFFBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTs7Ozs7O0FBTWxDLGFBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLGlCQUFpQixDQUFDO0tBQ3ZDOztBQUVELFdBQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFFLE9BQU8sQ0FBQyxjQUFjLENBQUMsQ0FBRSxDQUFDO0FBQ3pDLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDOztBQUVuQixRQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztBQUMxQixRQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDdEIsUUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRXpCLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLGVBQWUsRUFBRTthQUFNLE1BQUssS0FBSyxDQUFDLFNBQVMsQ0FBQztLQUFBLENBQUMsQ0FBQztBQUNsRixRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUU7YUFBTSxNQUFLLElBQUksRUFBRTtLQUFBLENBQUMsQ0FBQztBQUNyRSxRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsWUFBTTtBQUN6RCxhQUFPLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQzlELGNBQVEsQ0FB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VSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxVQUFVLENBQUM7QUFDOUMsV0FBTyxJQUFJLFVBQVUsQ0FBQyxZQUFNO0FBQzFCLGFBQUssS0FBSyxHQUFHLE9BQUssS0FBSyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFVBQUEsSUFBSTtlQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQUEsR0FBRyxVQUFBLElBQUk7ZUFBSSxJQUFJLEtBQUssT0FBTztPQUFBLENBQUMsQ0FBQztBQUN6SCxhQUFLLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBSyxLQUFLLENBQUMsQ0FBQztLQUN6QyxDQUFDLENBQUM7R0FDSjs7QUFFRCxrQkFBZ0IsRUFBQSwwQkFBQyxTQUFTLEVBQUU7OztBQUMxQixRQUFNLGFBQWEsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUNuRCxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ2xELFFBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO2FBQU0sT0FBSyxhQUFhLENBQUMsa0JBQWtCLEVBQUU7S0FBQSxDQUFDLENBQUM7QUFDMUUsUUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztHQUM3Qjs7QUFFRCxtQkFBaUIsRUFBQSwyQkFBQyxRQUFRLEVBQUU7QUFDMUIsUUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDdEMsUUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQ3ZEO0NBQ0YiLCJmaWxlIjoiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2J1aWxkL2xpYi9idWlsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGNvbmZpZzogcmVxdWlyZSgnLi9jb25maWcnKSxcblxuICBhY3RpdmF0ZSgpIHtcbiAgICBpZiAoIS9ed2luLy50ZXN0KHByb2Nlc3MucGxhdGZvcm0pKSB7XG4gICAgICAvLyBNYW51YWxseSBhcHBlbmQgL3Vzci9sb2NhbC9iaW4gYXMgaXQgbWF5IG5vdCBiZSBzZXQgb24gc29tZSBzeXN0ZW1zLFxuICAgICAgLy8gYW5kIGl0J3MgY29tbW9uIHRvIGhhdmUgbm9kZSBpbnN0YWxsZWQgaGVyZS4gS2VlcCBpdCBhdCBlbmQgc28gaXQgd29uJ3RcbiAgICAgIC8vIGFjY2lkZW50aWFsbHkgb3ZlcnJpZGUgYW55IG90aGVyIG5vZGUgaW5zdGFsbGF0aW9uXG5cbiAgICAgIC8vIE5vdGU6IFRoaXMgc2hvdWxkIHByb2JhYmx5IGJlIHJlbW92ZWQgaW4gYSBlbmQtdXNlciBmcmllbmRseSB3YXkuLi5cbiAgICAgIHByb2Nlc3MuZW52LlBBVEggKz0gJzovdXNyL2xvY2FsL2Jpbic7XG4gICAgfVxuXG4gICAgcmVxdWlyZSgnYXRvbS1wYWNrYWdlLWRlcHMnKS5pbnN0YWxsKCdidWlsZCcpO1xuXG4gICAgdGhpcy50b29scyA9IFsgcmVxdWlyZSgnLi9hdG9tLWJ1aWxkJykgXTtcbiAgICB0aGlzLmxpbnRlciA9IG51bGw7XG5cbiAgICB0aGlzLnNldHVwVGFyZ2V0TWFuYWdlcigpO1xuICAgIHRoaXMuc2V0dXBCdWlsZFZpZXcoKTtcbiAgICB0aGlzLnNldHVwRXJyb3JNYXRjaGVyKCk7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYnVpbGQ6dHJpZ2dlcicsICgpID0+IHRoaXMuYnVpbGQoJ3RyaWdnZXInKSk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOnN0b3AnLCAoKSA9PiB0aGlzLnN0b3AoKSk7XG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywgJ2J1aWxkOmNvbmZpcm0nLCAoKSA9PiB7XG4gICAgICByZXF1aXJlKCcuL2dvb2dsZS1hbmFseXRpY3MnKS5zZW5kRXZlbnQoJ2J1aWxkJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgZG9jdW1lbnQuYWN0aXZlRWxlbWVudC5jbGljaygpO1xuICAgIH0pO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDpuby1jb25maXJtJywgKCkgPT4ge1xuICAgICAgaWYgKHRoaXMuc2F2ZUNvbmZpcm1WaWV3KSB7XG4gICAgICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgnYnVpbGQnLCAnbm90IGNvbmZpcm1lZCcpO1xuICAgICAgICB0aGlzLnNhdmVDb25maXJtVmlldy5jYW5jZWwoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycygoZWRpdG9yKSA9PiB7XG4gICAgICBlZGl0b3Iub25EaWRTYXZlKCgpID0+IHtcbiAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQuYnVpbGRPblNhdmUnKSkge1xuICAgICAgICAgIHRoaXMuYnVpbGQoJ3NhdmUnKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKCgpID0+IHRoaXMudXBkYXRlU3RhdHVzQmFyKCkpO1xuICAgIGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcygoKSA9PiB0aGlzLnRhcmdldE1hbmFnZXIucmVmcmVzaFRhcmdldHMoKSk7XG4gIH0sXG5cbiAgc2V0dXBUYXJnZXRNYW5hZ2VyKCkge1xuICAgIGNvbnN0IFRhcmdldE1hbmFnZXIgPSByZXF1aXJlKCcuL3RhcmdldC1tYW5hZ2VyJyk7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyID0gbmV3IFRhcmdldE1hbmFnZXIoKTtcbiAgICB0aGlzLnRhcmdldE1hbmFnZXIuc2V0VG9vbHModGhpcy50b29scyk7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyLm9uKCdyZWZyZXNoLWNvbXBsZXRlJywgKCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVTdGF0dXNCYXIoKTtcbiAgICB9KTtcbiAgICB0aGlzLnRhcmdldE1hbmFnZXIub24oJ25ldy1hY3RpdmUtdGFyZ2V0JywgKHBhdGgsIHRhcmdldCkgPT4ge1xuICAgICAgdGhpcy51cGRhdGVTdGF0dXNCYXIoKTtcblxuICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQuc2VsZWN0VHJpZ2dlcnMnKSkge1xuICAgICAgICB0aGlzLmJ1aWxkKCd0cmlnZ2VyJyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy50YXJnZXRNYW5hZ2VyLm9uKCd0cmlnZ2VyJywgYXRvbUNvbW1hbmROYW1lID0+IHRoaXMuYnVpbGQoJ3RyaWdnZXInLCBhdG9tQ29tbWFuZE5hbWUpKTtcbiAgfSxcblxuICBzZXR1cEJ1aWxkVmlldygpIHtcbiAgICBjb25zdCBCdWlsZFZpZXcgPSByZXF1aXJlKCcuL2J1aWxkLXZpZXcnKTtcbiAgICB0aGlzLmJ1aWxkVmlldyA9IG5ldyBCdWlsZFZpZXcoKTtcbiAgfSxcblxuICBzZXR1cEVycm9yTWF0Y2hlcigpIHtcbiAgICBjb25zdCBFcnJvck1hdGNoZXIgPSByZXF1aXJlKCcuL2Vycm9yLW1hdGNoZXInKTtcbiAgICB0aGlzLmVycm9yTWF0Y2hlciA9IG5ldyBFcnJvck1hdGNoZXIoKTtcbiAgICB0aGlzLmVycm9yTWF0Y2hlci5vbignZXJyb3InLCAobWVzc2FnZSkgPT4ge1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdFcnJvciBtYXRjaGluZyBmYWlsZWQhJywgeyBkZXRhaWw6IG1lc3NhZ2UgfSk7XG4gICAgfSk7XG4gICAgdGhpcy5lcnJvck1hdGNoZXIub24oJ21hdGNoZWQnLCAobWF0Y2gpID0+IHtcbiAgICAgIG1hdGNoWzBdICYmIHRoaXMuYnVpbGRWaWV3LnNjcm9sbFRvKG1hdGNoWzBdKTtcbiAgICB9KTtcbiAgfSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmICh0aGlzLmNoaWxkKSB7XG4gICAgICB0aGlzLmNoaWxkLnJlbW92ZUFsbExpc3RlbmVycygpO1xuICAgICAgcmVxdWlyZSgndHJlZS1raWxsJykodGhpcy5jaGlsZC5waWQsICdTSUdLSUxMJyk7XG4gICAgICB0aGlzLmNoaWxkID0gbnVsbDtcbiAgICB9XG5cbiAgICB0aGlzLnN0YXR1c0JhclZpZXcgJiYgdGhpcy5zdGF0dXNCYXJWaWV3LmRlc3Ryb3koKTtcbiAgICB0aGlzLmJ1aWxkVmlldyAmJiB0aGlzLmJ1aWxkVmlldy5kZXN0cm95KCk7XG4gICAgdGhpcy5zYXZlQ29uZmlybVZpZXcgJiYgdGhpcy5zYXZlQ29uZmlybVZpZXcuZGVzdHJveSgpO1xuICAgIHRoaXMubGludGVyICYmIHRoaXMubGludGVyLmRlc3Ryb3koKTtcbiAgICB0aGlzLnRhcmdldE1hbmFnZXIuZGVzdHJveSgpO1xuXG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuZmluaXNoZWRUaW1lcik7XG4gIH0sXG5cbiAgdXBkYXRlU3RhdHVzQmFyKCkge1xuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCcuL3V0aWxzJykuYWN0aXZlUGF0aCgpO1xuICAgIGNvbnN0IGFjdGl2ZVRhcmdldCA9IHRoaXMudGFyZ2V0TWFuYWdlci5nZXRBY3RpdmVUYXJnZXQocGF0aCk7XG4gICAgdGhpcy5zdGF0dXNCYXJWaWV3ICYmIGFjdGl2ZVRhcmdldCAmJiB0aGlzLnN0YXR1c0JhclZpZXcuc2V0VGFyZ2V0KGFjdGl2ZVRhcmdldC5uYW1lKTtcbiAgfSxcblxuICBzdGFydE5ld0J1aWxkKHNvdXJjZSwgYXRvbUNvbW1hbmROYW1lKSB7XG4gICAgY29uc3QgQnVpbGRFcnJvciA9IHJlcXVpcmUoJy4vYnVpbGQtZXJyb3InKTtcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgnLi91dGlscycpLmFjdGl2ZVBhdGgoKTtcbiAgICBsZXQgYnVpbGRUaXRsZSA9ICcnO1xuICAgIHRoaXMubGludGVyICYmIHRoaXMubGludGVyLmNsZWFyKCk7XG5cbiAgICBQcm9taXNlLnJlc29sdmUodGhpcy50YXJnZXRNYW5hZ2VyLmdldFRhcmdldHMocGF0aCkpLnRoZW4odGFyZ2V0cyA9PiB7XG4gICAgICBpZiAoIXRhcmdldHMgfHwgMCA9PT0gdGFyZ2V0cy5sZW5ndGgpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJ1aWxkRXJyb3IoJ05vIGVsaWdpYmxlIGJ1aWxkIHRhcmdldC4nLCAnTm8gY29uZmlndXJhdGlvbiB0byBidWlsZCB0aGlzIHByb2plY3QgZXhpc3RzLicpO1xuICAgICAgfVxuXG4gICAgICBsZXQgdGFyZ2V0ID0gdGFyZ2V0cy5maW5kKHQgPT4gdC5hdG9tQ29tbWFuZE5hbWUgPT09IGF0b21Db21tYW5kTmFtZSk7XG4gICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICB0YXJnZXQgPSB0aGlzLnRhcmdldE1hbmFnZXIuZ2V0QWN0aXZlVGFyZ2V0KHBhdGgpO1xuICAgICAgfVxuICAgICAgcmVxdWlyZSgnLi9nb29nbGUtYW5hbHl0aWNzJykuc2VuZEV2ZW50KCdidWlsZCcsICd0cmlnZ2VyZWQnKTtcblxuICAgICAgaWYgKCF0YXJnZXQuZXhlYykge1xuICAgICAgICB0aHJvdyBuZXcgQnVpbGRFcnJvcignSW52YWxpZCBidWlsZCBmaWxlLicsICdObyBleGVjdXRhYmxlIGNvbW1hbmQgc3BlY2lmaWVkLicpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnN0YXR1c0JhclZpZXcgJiYgdGhpcy5zdGF0dXNCYXJWaWV3LmJ1aWxkU3RhcnRlZCgpO1xuICAgICAgdGhpcy5idXN5UHJvdmlkZXIgJiYgdGhpcy5idXN5UHJvdmlkZXIuYWRkKGBCdWlsZDogJHt0YXJnZXQubmFtZX1gKTtcbiAgICAgIHRoaXMuYnVpbGRWaWV3LmJ1aWxkU3RhcnRlZCgpO1xuICAgICAgdGhpcy5idWlsZFZpZXcuc2V0SGVhZGluZygnUnVubmluZyBwcmVCdWlsZC4uLicpO1xuXG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRhcmdldC5wcmVCdWlsZCA/IHRhcmdldC5wcmVCdWlsZCgpIDogbnVsbCkudGhlbigoKSA9PiB0YXJnZXQpO1xuICAgIH0pLnRoZW4odGFyZ2V0ID0+IHtcbiAgICAgIGNvbnN0IHJlcGxhY2UgPSByZXF1aXJlKCcuL3V0aWxzJykucmVwbGFjZTtcbiAgICAgIGNvbnN0IGVudiA9IE9iamVjdC5hc3NpZ24oe30sIHByb2Nlc3MuZW52LCB0YXJnZXQuZW52KTtcbiAgICAgIE9iamVjdC5rZXlzKGVudikuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICBlbnZba2V5XSA9IHJlcGxhY2UoZW52W2tleV0sIHRhcmdldC5lbnYpO1xuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGV4ZWMgPSByZXBsYWNlKHRhcmdldC5leGVjLCB0YXJnZXQuZW52KTtcbiAgICAgIGNvbnN0IGFyZ3MgPSB0YXJnZXQuYXJncy5tYXAoYXJnID0+IHJlcGxhY2UoYXJnLCB0YXJnZXQuZW52KSk7XG4gICAgICBjb25zdCBjd2QgPSByZXBsYWNlKHRhcmdldC5jd2QsIHRhcmdldC5lbnYpO1xuICAgICAgY29uc3QgaXNXaW4gPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuICAgICAgY29uc3Qgc2hDbWQgPSBpc1dpbiA/ICdjbWQnIDogJy9iaW4vc2gnO1xuICAgICAgY29uc3Qgc2hDbWRBcmcgPSBpc1dpbiA/ICcvQycgOiAnLWMnO1xuXG4gICAgICAvLyBTdG9yZSB0aGlzIGFzIHdlIG5lZWQgdG8gcmUtc2V0IGl0IGFmdGVyIHBvc3RCdWlsZFxuICAgICAgYnVpbGRUaXRsZSA9IFsgKHRhcmdldC5zaCA/IGAke3NoQ21kfSAke3NoQ21kQXJnfSAke2V4ZWN9YCA6IGV4ZWMgKSwgLi4uYXJncywgJ1xcbiddLmpvaW4oJyAnKTtcblxuICAgICAgdGhpcy5idWlsZFZpZXcuc2V0SGVhZGluZyhidWlsZFRpdGxlKTtcbiAgICAgIGlmICh0YXJnZXQuc2gpIHtcbiAgICAgICAgdGhpcy5jaGlsZCA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKS5zcGF3bihcbiAgICAgICAgICBzaENtZCxcbiAgICAgICAgICBbIHNoQ21kQXJnLCBbIGV4ZWMgXS5jb25jYXQoYXJncykuam9pbignICcpXSxcbiAgICAgICAgICB7IGN3ZDogY3dkLCBlbnY6IGVudiwgc3RkaW86IFsnaWdub3JlJywgbnVsbCwgbnVsbF0gfVxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jaGlsZCA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduJykuc3Bhd24oXG4gICAgICAgICAgZXhlYyxcbiAgICAgICAgICBhcmdzLFxuICAgICAgICAgIHsgY3dkOiBjd2QsIGVudjogZW52LCBzdGRpbzogWydpZ25vcmUnLCBudWxsLCBudWxsXSB9XG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGxldCBzdGRvdXQgPSAnJztcbiAgICAgIGxldCBzdGRlcnIgPSAnJztcbiAgICAgIHRoaXMuY2hpbGQuc3Rkb3V0LnNldEVuY29kaW5nKCd1dGY4Jyk7XG4gICAgICB0aGlzLmNoaWxkLnN0ZGVyci5zZXRFbmNvZGluZygndXRmOCcpO1xuICAgICAgdGhpcy5jaGlsZC5zdGRvdXQub24oJ2RhdGEnLCBkID0+IChzdGRvdXQgKz0gZCkpO1xuICAgICAgdGhpcy5jaGlsZC5zdGRlcnIub24oJ2RhdGEnLCBkID0+IChzdGRlcnIgKz0gZCkpO1xuICAgICAgdGhpcy5jaGlsZC5zdGRvdXQucGlwZSh0aGlzLmJ1aWxkVmlldy50ZXJtaW5hbCk7XG4gICAgICB0aGlzLmNoaWxkLnN0ZGVyci5waXBlKHRoaXMuYnVpbGRWaWV3LnRlcm1pbmFsKTtcbiAgICAgIHRoaXMuY2hpbGQua2lsbFNpZ25hbHMgPSAodGFyZ2V0LmtpbGxTaWduYWxzIHx8IFsgJ1NJR0lOVCcsICdTSUdURVJNJywgJ1NJR0tJTEwnIF0pLnNsaWNlKCk7XG5cbiAgICAgIHRoaXMuY2hpbGQub24oJ2Vycm9yJywgKGVycikgPT4ge1xuICAgICAgICB0aGlzLmJ1aWxkVmlldy50ZXJtaW5hbC53cml0ZSgodGFyZ2V0LnNoID8gJ1VuYWJsZSB0byBleGVjdXRlIHdpdGggc2hlbGw6ICcgOiAnVW5hYmxlIHRvIGV4ZWN1dGU6ICcpICsgZXhlYyArICdcXG4nKTtcblxuICAgICAgICBpZiAoL1xccy8udGVzdChleGVjKSAmJiAhdGFyZ2V0LnNoKSB7XG4gICAgICAgICAgdGhpcy5idWlsZFZpZXcudGVybWluYWwud3JpdGUoJ2BjbWRgIGNhbm5vdCBjb250YWluIHNwYWNlLiBVc2UgYGFyZ3NgIGZvciBhcmd1bWVudHMuXFxuJyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJ0VOT0VOVCcgPT09IGVyci5jb2RlKSB7XG4gICAgICAgICAgdGhpcy5idWlsZFZpZXcudGVybWluYWwud3JpdGUoYE1ha2Ugc3VyZSBjbWQ6JyR7ZXhlY30nIGFuZCBjd2Q6JyR7Y3dkfScgZXhpc3RzIGFuZCBoYXZlIGNvcnJlY3QgYWNjZXNzIHBlcm1pc3Npb25zLlxcbmApO1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LnRlcm1pbmFsLndyaXRlKGBCaW5hcmllcyBhcmUgZm91bmQgaW4gdGhlc2UgZm9sZGVyczogJHtwcm9jZXNzLmVudi5QQVRIfVxcbmApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5jaGlsZC5vbignY2xvc2UnLCAoZXhpdENvZGUpID0+IHtcbiAgICAgICAgdGhpcy5jaGlsZCA9IG51bGw7XG4gICAgICAgIHRoaXMuZXJyb3JNYXRjaGVyLnNldCh0YXJnZXQsIGN3ZCwgc3Rkb3V0ICsgc3RkZXJyKTtcblxuICAgICAgICBsZXQgc3VjY2VzcyA9ICgwID09PSBleGl0Q29kZSk7XG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLm1hdGNoZWRFcnJvckZhaWxzQnVpbGQnKSkge1xuICAgICAgICAgIHN1Y2Nlc3MgPSBzdWNjZXNzICYmICF0aGlzLmVycm9yTWF0Y2hlci5nZXRNYXRjaGVzKCkuc29tZShtYXRjaCA9PiBtYXRjaC50eXBlICYmIG1hdGNoLnR5cGUudG9Mb3dlckNhc2UoKSA9PT0gJ2Vycm9yJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxpbnRlciAmJiB0aGlzLmxpbnRlci5wcm9jZXNzTWVzc2FnZXModGhpcy5lcnJvck1hdGNoZXIuZ2V0TWF0Y2hlcygpLCBjd2QpO1xuXG4gICAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ2J1aWxkLmJlZXBXaGVuRG9uZScpKSB7XG4gICAgICAgICAgYXRvbS5iZWVwKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmJ1aWxkVmlldy5zZXRIZWFkaW5nKCdSdW5uaW5nIHBvc3RCdWlsZC4uLicpO1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRhcmdldC5wb3N0QnVpbGQgPyB0YXJnZXQucG9zdEJ1aWxkKHN1Y2Nlc3MsIHN0ZG91dCwgc3RkZXJyKSA6IG51bGwpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LnNldEhlYWRpbmcoYnVpbGRUaXRsZSk7XG5cbiAgICAgICAgICB0aGlzLmJ1c3lQcm92aWRlciAmJiB0aGlzLmJ1c3lQcm92aWRlci5yZW1vdmUoYEJ1aWxkOiAke3RhcmdldC5uYW1lfWAsIHN1Y2Nlc3MpO1xuICAgICAgICAgIHRoaXMuYnVpbGRWaWV3LmJ1aWxkRmluaXNoZWQoc3VjY2Vzcyk7XG4gICAgICAgICAgdGhpcy5zdGF0dXNCYXJWaWV3ICYmIHRoaXMuc3RhdHVzQmFyVmlldy5zZXRCdWlsZFN1Y2Nlc3Moc3VjY2Vzcyk7XG4gICAgICAgICAgaWYgKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgnYnVpbGQnLCAnc3VjY2VlZGVkJyk7XG4gICAgICAgICAgICB0aGlzLmZpbmlzaGVkVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgdGhpcy5idWlsZFZpZXcuZGV0YWNoKCk7XG4gICAgICAgICAgICB9LCAxMjAwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGF0b20uY29uZmlnLmdldCgnYnVpbGQuc2Nyb2xsT25FcnJvcicpKSB7XG4gICAgICAgICAgICAgIHRoaXMuZXJyb3JNYXRjaGVyLm1hdGNoRmlyc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgnYnVpbGQnLCAnZmFpbGVkJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5uZXh0QnVpbGQgJiYgdGhpcy5uZXh0QnVpbGQoKTtcbiAgICAgICAgICB0aGlzLm5leHRCdWlsZCA9IG51bGw7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIEJ1aWxkRXJyb3IpIHtcbiAgICAgICAgaWYgKHNvdXJjZSA9PT0gJ3NhdmUnKSB7XG4gICAgICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gZWxpZ2libGUgYnVpbGQgdG9vbCwgYW5kIGNhdXNlIG9mIGJ1aWxkIHdhcyBhIHNhdmUsIHN0YXkgcXVpZXQuXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcoZXJyLm5hbWUsIHsgZGV0YWlsOiBlcnIubWVzc2FnZSwgc3RhY2s6IGVyci5zdGFjayB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignRmFpbGVkIHRvIGJ1aWxkLicsIHsgZGV0YWlsOiBlcnIubWVzc2FnZSwgc3RhY2s6IGVyci5zdGFjayB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSxcblxuICBzZW5kTmV4dFNpZ25hbCgpIHtcbiAgICB0cnkge1xuICAgICAgY29uc3Qgc2lnbmFsID0gdGhpcy5jaGlsZC5raWxsU2lnbmFscy5zaGlmdCgpO1xuICAgICAgcmVxdWlyZSgndHJlZS1raWxsJykodGhpcy5jaGlsZC5waWQsIHNpZ25hbCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgLyogU29tZXRoaW5nIG1heSBoYXZlIGhhcHBlbmVkIHRvIHRoZSBjaGlsZCAoZS5nLiB0ZXJtaW5hdGVkIGJ5IGl0c2VsZikuIElnbm9yZSB0aGlzLiAqL1xuICAgIH1cbiAgfSxcblxuICBhYm9ydChjYikge1xuICAgIGlmICghdGhpcy5jaGlsZC5raWxsZWQpIHtcbiAgICAgIHRoaXMuYnVpbGRWaWV3LmJ1aWxkQWJvcnRJbml0aWF0ZWQoKTtcbiAgICAgIHRoaXMuY2hpbGQua2lsbGVkID0gdHJ1ZTtcbiAgICAgIHRoaXMuY2hpbGQub24oJ2V4aXQnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2hpbGQgPSBudWxsO1xuICAgICAgICBjYiAmJiBjYigpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5zZW5kTmV4dFNpZ25hbCgpO1xuICB9LFxuXG4gIGJ1aWxkKHNvdXJjZSwgZXZlbnQpIHtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5maW5pc2hlZFRpbWVyKTtcblxuICAgIHRoaXMuZG9TYXZlQ29uZmlybSh0aGlzLnVuc2F2ZWRUZXh0RWRpdG9ycygpLCAoKSA9PiB7XG4gICAgICBjb25zdCBuZXh0QnVpbGQgPSB0aGlzLnN0YXJ0TmV3QnVpbGQuYmluZCh0aGlzLCBzb3VyY2UsIGV2ZW50ID8gZXZlbnQudHlwZSA6IG51bGwpO1xuICAgICAgaWYgKHRoaXMuY2hpbGQpIHtcbiAgICAgICAgdGhpcy5uZXh0QnVpbGQgPSBuZXh0QnVpbGQ7XG4gICAgICAgIHJldHVybiB0aGlzLmFib3J0KCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV4dEJ1aWxkKCk7XG4gICAgfSk7XG4gIH0sXG5cbiAgZG9TYXZlQ29uZmlybShtb2RpZmllZFRleHRFZGl0b3JzLCBjb250aW51ZWNiLCBjYW5jZWxjYikge1xuICAgIGNvbnN0IHNhdmVBbmRDb250aW51ZSA9IChzYXZlKSA9PiB7XG4gICAgICBtb2RpZmllZFRleHRFZGl0b3JzLmZvckVhY2goKHRleHRFZGl0b3IpID0+IHNhdmUgJiYgdGV4dEVkaXRvci5zYXZlKCkpO1xuICAgICAgY29udGludWVjYigpO1xuICAgIH07XG5cbiAgICBpZiAoMCA9PT0gbW9kaWZpZWRUZXh0RWRpdG9ycy5sZW5ndGggfHwgYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zYXZlT25CdWlsZCcpKSB7XG4gICAgICBzYXZlQW5kQ29udGludWUodHJ1ZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2F2ZUNvbmZpcm1WaWV3KSB7XG4gICAgICB0aGlzLnNhdmVDb25maXJtVmlldy5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgY29uc3QgU2F2ZUNvbmZpcm1WaWV3ID0gcmVxdWlyZSgnLi9zYXZlLWNvbmZpcm0tdmlldycpO1xuICAgIHRoaXMuc2F2ZUNvbmZpcm1WaWV3ID0gbmV3IFNhdmVDb25maXJtVmlldygpO1xuICAgIHRoaXMuc2F2ZUNvbmZpcm1WaWV3LnNob3coc2F2ZUFuZENvbnRpbnVlLCBjYW5jZWxjYik7XG4gIH0sXG5cbiAgdW5zYXZlZFRleHRFZGl0b3JzKCkge1xuICAgIHJldHVybiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpLmZpbHRlcigodGV4dEVkaXRvcikgPT4ge1xuICAgICAgcmV0dXJuIHRleHRFZGl0b3IuaXNNb2RpZmllZCgpICYmICh1bmRlZmluZWQgIT09IHRleHRFZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICB9KTtcbiAgfSxcblxuICBzdG9wKCkge1xuICAgIHRoaXMubmV4dEJ1aWxkID0gbnVsbDtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5maW5pc2hlZFRpbWVyKTtcbiAgICBpZiAodGhpcy5jaGlsZCkge1xuICAgICAgdGhpcy5hYm9ydCgoKSA9PiB7XG4gICAgICAgIHRoaXMuYnVpbGRWaWV3LmJ1aWxkQWJvcnRlZCgpO1xuICAgICAgICB0aGlzLnN0YXR1c0JhclZpZXcgJiYgdGhpcy5zdGF0dXNCYXJWaWV3LmJ1aWxkQWJvcnRlZCgpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuYnVpbGRWaWV3LnJlc2V0KCk7XG4gICAgfVxuICB9LFxuXG4gIGNvbnN1bWVMaW50ZXJSZWdpc3RyeShyZWdpc3RyeSkge1xuICAgIHRoaXMubGludGVyICYmIHRoaXMubGludGVyLmRlc3Ryb3koKTtcbiAgICBjb25zdCBMaW50ZXIgPSByZXF1aXJlKCcuL2xpbnRlci1pbnRlZ3JhdGlvbicpO1xuICAgIHRoaXMubGludGVyID0gbmV3IExpbnRlcihyZWdpc3RyeSk7XG4gIH0sXG5cbiAgY29uc3VtZUJ1aWxkZXIoYnVpbGRlcikge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGJ1aWxkZXIpKSB0aGlzLnRvb2xzLnB1c2goLi4uYnVpbGRlcik7IGVsc2UgdGhpcy50b29scy5wdXNoKGJ1aWxkZXIpO1xuICAgIHRoaXMudGFyZ2V0TWFuYWdlci5zZXRUb29scyh0aGlzLnRvb2xzKTtcbiAgICBjb25zdCBEaXNwb3NhYmxlID0gcmVxdWlyZSgnYXRvbScpLkRpc3Bvc2FibGU7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgIHRoaXMudG9vbHMgPSB0aGlzLnRvb2xzLmZpbHRlcihBcnJheS5pc0FycmF5KGJ1aWxkZXIpID8gdG9vbCA9PiBidWlsZGVyLmluZGV4T2YodG9vbCkgPT09IC0xIDogdG9vbCA9PiB0b29sICE9PSBidWlsZGVyKTtcbiAgICAgIHRoaXMudGFyZ2V0TWFuYWdlci5zZXRUb29scyh0aGlzLnRvb2xzKTtcbiAgICB9KTtcbiAgfSxcblxuICBjb25zdW1lU3RhdHVzQmFyKHN0YXR1c0Jhcikge1xuICAgIGNvbnN0IFN0YXR1c0JhclZpZXcgPSByZXF1aXJlKCcuL3N0YXR1cy1iYXItdmlldycpO1xuICAgIHRoaXMuc3RhdHVzQmFyVmlldyA9IG5ldyBTdGF0dXNCYXJWaWV3KHN0YXR1c0Jhcik7XG4gICAgdGhpcy5zdGF0dXNCYXJWaWV3Lm9uQ2xpY2soKCkgPT4gdGhpcy50YXJnZXRNYW5hZ2VyLnNlbGVjdEFjdGl2ZVRhcmdldCgpKTtcbiAgICB0aGlzLnN0YXR1c0JhclZpZXcuYXR0YWNoKCk7XG4gIH0sXG5cbiAgY29uc3VtZUJ1c3lTaWduYWwocmVnaXN0cnkpIHtcbiAgICB0aGlzLmJ1c3lQcm92aWRlciA9IHJlZ2lzdHJ5LmNyZWF0ZSgpO1xuICAgIHRoaXMudGFyZ2V0TWFuYWdlci5zZXRCdXN5UHJvdmlkZXIodGhpcy5idXN5UHJvdmlkZXIpO1xuICB9XG59O1xuIl19