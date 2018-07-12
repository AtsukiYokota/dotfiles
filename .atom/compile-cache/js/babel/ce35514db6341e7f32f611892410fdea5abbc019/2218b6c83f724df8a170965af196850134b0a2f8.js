Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

'use babel';

function getConfig(file) {
  var fs = require('fs');
  var realFile = fs.realpathSync(file);
  delete require.cache[realFile];
  switch (require('path').extname(file)) {
    case '.json':
    case '.js':
      return require(realFile);

    case '.cson':
      return require('cson-parser').parse(fs.readFileSync(realFile));

    case '.yaml':
    case '.yml':
      return require('js-yaml').safeLoad(fs.readFileSync(realFile));
  }

  return {};
}

function createBuildConfig(build, name) {
  var conf = {
    name: 'Custom: ' + name,
    exec: build.cmd,
    env: build.env,
    args: build.args,
    cwd: build.cwd,
    sh: build.sh,
    errorMatch: build.errorMatch,
    functionMatch: build.functionMatch,
    warningMatch: build.warningMatch,
    atomCommandName: build.atomCommandName,
    keymap: build.keymap,
    killSignals: build.killSignals
  };

  if (typeof build.postBuild === 'function') {
    conf.postBuild = build.postBuild;
  }

  if (typeof build.preBuild === 'function') {
    conf.preBuild = build.preBuild;
  }

  return conf;
}

var CustomFile = (function (_EventEmitter) {
  _inherits(CustomFile, _EventEmitter);

  function CustomFile(cwd) {
    _classCallCheck(this, CustomFile);

    _get(Object.getPrototypeOf(CustomFile.prototype), 'constructor', this).call(this);
    this.cwd = cwd;
    this.fileWatchers = [];
  }

  _createClass(CustomFile, [{
    key: 'destructor',
    value: function destructor() {
      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
    }
  }, {
    key: 'getNiceName',
    value: function getNiceName() {
      return 'Custom file';
    }
  }, {
    key: 'isEligible',
    value: function isEligible() {
      var _this = this;

      var os = require('os');
      var fs = require('fs');
      var path = require('path');
      this.files = [].concat.apply([], ['json', 'cson', 'yaml', 'yml', 'js'].map(function (ext) {
        return [path.join(_this.cwd, '.atom-build.' + ext), path.join(os.homedir(), '.atom-build.' + ext)];
      })).filter(fs.existsSync);
      return 0 < this.files.length;
    }
  }, {
    key: 'settings',
    value: function settings() {
      var _this2 = this;

      var fs = require('fs');
      this.fileWatchers.forEach(function (fw) {
        return fw.close();
      });
      // On Linux, closing a watcher triggers a new callback, which causes an infinite loop
      // fallback to `watchFile` here which polls instead.
      this.fileWatchers = this.files.map(function (file) {
        return (require('os').platform() === 'linux' ? fs.watchFile : fs.watch)(file, function () {
          return _this2.emit('refresh');
        });
      });

      var config = [];
      this.files.map(getConfig).forEach(function (build) {
        config.push.apply(config, [createBuildConfig(build, build.name || 'default')].concat(_toConsumableArray(Object.keys(build.targets || {}).map(function (name) {
          return createBuildConfig(build.targets[name], name);
        }))));
      });

      return config;
    }
  }]);

  return CustomFile;
})(_events2['default']);

exports['default'] = CustomFile;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYXRvbS1idWlsZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3NCQUV5QixRQUFROzs7O0FBRmpDLFdBQVcsQ0FBQzs7QUFJWixTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUU7QUFDdkIsTUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3pCLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkMsU0FBTyxPQUFPLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQy9CLFVBQVEsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDbkMsU0FBSyxPQUFPLENBQUM7QUFDYixTQUFLLEtBQUs7QUFDUixhQUFPLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7QUFBQSxBQUUzQixTQUFLLE9BQU87QUFDVixhQUFPLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOztBQUFBLEFBRWpFLFNBQUssT0FBTyxDQUFDO0FBQ2IsU0FBSyxNQUFNO0FBQ1QsYUFBTyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUFBLEdBQ2pFOztBQUVELFNBQU8sRUFBRSxDQUFDO0NBQ1g7O0FBRUQsU0FBUyxpQkFBaUIsQ0FBQyxLQUFLLEVBQUUsSUFBSSxFQUFFO0FBQ3RDLE1BQU0sSUFBSSxHQUFHO0FBQ1gsUUFBSSxFQUFFLFVBQVUsR0FBRyxJQUFJO0FBQ3ZCLFFBQUksRUFBRSxLQUFLLENBQUMsR0FBRztBQUNmLE9BQUcsRUFBRSxLQUFLLENBQUMsR0FBRztBQUNkLFFBQUksRUFBRSxLQUFL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RyxDQUFDLFNBQVMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUN6QyxjQUFNLENBQUMsSUFBSSxNQUFBLENBQVgsTUFBTSxHQUNKLGlCQUFpQixDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsSUFBSSxJQUFJLFNBQVMsQ0FBQyw0QkFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7aUJBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUM7U0FBQSxDQUFDLEdBQzlGLENBQUM7T0FDSCxDQUFDLENBQUM7O0FBRUgsYUFBTyxNQUFNLENBQUM7S0FDZjs7O1NBNUNrQixVQUFVOzs7cUJBQVYsVUFBVSIsImZpbGUiOiIvaG9tZS95b2tvdGEvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2F0b20tYnVpbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEV2ZW50RW1pdHRlciBmcm9tICdldmVudHMnO1xuXG5mdW5jdGlvbiBnZXRDb25maWcoZmlsZSkge1xuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJyk7XG4gIGNvbnN0IHJlYWxGaWxlID0gZnMucmVhbHBhdGhTeW5jKGZpbGUpO1xuICBkZWxldGUgcmVxdWlyZS5jYWNoZVtyZWFsRmlsZV07XG4gIHN3aXRjaCAocmVxdWlyZSgncGF0aCcpLmV4dG5hbWUoZmlsZSkpIHtcbiAgICBjYXNlICcuanNvbic6XG4gICAgY2FzZSAnLmpzJzpcbiAgICAgIHJldHVybiByZXF1aXJlKHJlYWxGaWxlKTtcblxuICAgIGNhc2UgJy5jc29uJzpcbiAgICAgIHJldHVybiByZXF1aXJlKCdjc29uLXBhcnNlcicpLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhyZWFsRmlsZSkpO1xuXG4gICAgY2FzZSAnLnlhbWwnOlxuICAgIGNhc2UgJy55bWwnOlxuICAgICAgcmV0dXJuIHJlcXVpcmUoJ2pzLXlhbWwnKS5zYWZlTG9hZChmcy5yZWFkRmlsZVN5bmMocmVhbEZpbGUpKTtcbiAgfVxuXG4gIHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVpbGRDb25maWcoYnVpbGQsIG5hbWUpIHtcbiAgY29uc3QgY29uZiA9IHtcbiAgICBuYW1lOiAnQ3VzdG9tOiAnICsgbmFtZSxcbiAgICBleGVjOiBidWlsZC5jbWQsXG4gICAgZW52OiBidWlsZC5lbnYsXG4gICAgYXJnczogYnVpbGQuYXJncyxcbiAgICBjd2Q6IGJ1aWxkLmN3ZCxcbiAgICBzaDogYnVpbGQuc2gsXG4gICAgZXJyb3JNYXRjaDogYnVpbGQuZXJyb3JNYXRjaCxcbiAgICBmdW5jdGlvbk1hdGNoOiBidWlsZC5mdW5jdGlvbk1hdGNoLFxuICAgIHdhcm5pbmdNYXRjaDogYnVpbGQud2FybmluZ01hdGNoLFxuICAgIGF0b21Db21tYW5kTmFtZTogYnVpbGQuYXRvbUNvbW1hbmROYW1lLFxuICAgIGtleW1hcDogYnVpbGQua2V5bWFwLFxuICAgIGtpbGxTaWduYWxzOiBidWlsZC5raWxsU2lnbmFsc1xuICB9O1xuXG4gIGlmICh0eXBlb2YgYnVpbGQucG9zdEJ1aWxkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uZi5wb3N0QnVpbGQgPSBidWlsZC5wb3N0QnVpbGQ7XG4gIH1cblxuICBpZiAodHlwZW9mIGJ1aWxkLnByZUJ1aWxkID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY29uZi5wcmVCdWlsZCA9IGJ1aWxkLnByZUJ1aWxkO1xuICB9XG5cbiAgcmV0dXJuIGNvbmY7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEN1c3RvbUZpbGUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3Rvcihjd2QpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuY3dkID0gY3dkO1xuICAgIHRoaXMuZmlsZVdhdGNoZXJzID0gW107XG4gIH1cblxuICBkZXN0cnVjdG9yKCkge1xuICAgIHRoaXMuZmlsZVdhdGNoZXJzLmZvckVhY2goZncgPT4gZncuY2xvc2UoKSk7XG4gIH1cblxuICBnZXROaWNlTmFtZSgpIHtcbiAgICByZXR1cm4gJ0N1c3RvbSBmaWxlJztcbiAgfVxuXG4gIGlzRWxpZ2libGUoKSB7XG4gICAgY29uc3Qgb3MgPSByZXF1aXJlKCdvcycpO1xuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuICAgIHRoaXMuZmlsZXMgPSBbXS5jb25jYXQuYXBwbHkoW10sIFsgJ2pzb24nLCAnY3NvbicsICd5YW1sJywgJ3ltbCcsICdqcycgXS5tYXAoZXh0ID0+IFtcbiAgICAgIHBhdGguam9pbih0aGlzLmN3ZCwgYC5hdG9tLWJ1aWxkLiR7ZXh0fWApLFxuICAgICAgcGF0aC5qb2luKG9zLmhvbWVkaXIoKSwgYC5hdG9tLWJ1aWxkLiR7ZXh0fWApXG4gICAgXSkpLmZpbHRlcihmcy5leGlzdHNTeW5jKTtcbiAgICByZXR1cm4gMCA8IHRoaXMuZmlsZXMubGVuZ3RoO1xuICB9XG5cbiAgc2V0dGluZ3MoKSB7XG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuICAgIHRoaXMuZmlsZVdhdGNoZXJzLmZvckVhY2goZncgPT4gZncuY2xvc2UoKSk7XG4gICAgLy8gT24gTGludXgsIGNsb3NpbmcgYSB3YXRjaGVyIHRyaWdnZXJzIGEgbmV3IGNhbGxiYWNrLCB3aGljaCBjYXVzZXMgYW4gaW5maW5pdGUgbG9vcFxuICAgIC8vIGZhbGxiYWNrIHRvIGB3YXRjaEZpbGVgIGhlcmUgd2hpY2ggcG9sbHMgaW5zdGVhZC5cbiAgICB0aGlzLmZpbGVXYXRjaGVycyA9IHRoaXMuZmlsZXMubWFwKGZpbGUgPT5cbiAgICAgIChyZXF1aXJlKCdvcycpLnBsYXRmb3JtKCkgPT09ICdsaW51eCcgPyBmcy53YXRjaEZpbGUgOiBmcy53YXRjaCkoZmlsZSwgKCkgPT4gdGhpcy5lbWl0KCdyZWZyZXNoJykpXG4gICAgKTtcblxuICAgIGNvbnN0IGNvbmZpZyA9IFtdO1xuICAgIHRoaXMuZmlsZXMubWFwKGdldENvbmZpZykuZm9yRWFjaChidWlsZCA9PiB7XG4gICAgICBjb25maWcucHVzaChcbiAgICAgICAgY3JlYXRlQnVpbGRDb25maWcoYnVpbGQsIGJ1aWxkLm5hbWUgfHwgJ2RlZmF1bHQnKSxcbiAgICAgICAgLi4uT2JqZWN0LmtleXMoYnVpbGQudGFyZ2V0cyB8fCB7fSkubWFwKG5hbWUgPT4gY3JlYXRlQnVpbGRDb25maWcoYnVpbGQudGFyZ2V0c1tuYW1lXSwgbmFtZSkpXG4gICAgICApO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGNvbmZpZztcbiAgfVxufVxuIl19