Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _events = require('events');

'use babel';

var ErrorMatcher = (function (_EventEmitter) {
  _inherits(ErrorMatcher, _EventEmitter);

  function ErrorMatcher() {
    _classCallCheck(this, ErrorMatcher);

    _get(Object.getPrototypeOf(ErrorMatcher.prototype), 'constructor', this).call(this);
    this.regex = null;
    this.cwd = null;
    this.stdout = null;
    this.stderr = null;
    this.currentMatch = [];
    this.firstMatchId = null;

    atom.commands.add('atom-workspace', 'build:error-match', this.match.bind(this));
    atom.commands.add('atom-workspace', 'build:error-match-first', this.matchFirst.bind(this));
  }

  _createClass(ErrorMatcher, [{
    key: '_gotoNext',
    value: function _gotoNext() {
      if (0 === this.currentMatch.length) {
        return;
      }

      this.goto(this.currentMatch[0].id);
    }
  }, {
    key: 'goto',
    value: function goto(id) {
      var _this = this;

      var match = this.currentMatch.find(function (m) {
        return m.id === id;
      });
      if (!match) {
        this.emit('error', 'Can\'t find match with id ' + id);
        return;
      }

      // rotate to next match
      while (this.currentMatch[0] !== match) {
        this.currentMatch.push(this.currentMatch.shift());
      }
      this.currentMatch.push(this.currentMatch.shift());

      var file = match.file;
      if (!file) {
        this.emit('error', 'Did not match any file. Don\'t know what to open.');
        return;
      }

      var path = require('path');
      if (!path.isAbsolute(file)) {
        file = this.cwd + path.sep + file;
      }

      var row = match.line ? match.line - 1 : 0; /* Because atom is zero-based */
      var col = match.col ? match.col - 1 : 0; /* Because atom is zero-based */

      require('fs').exists(file, function (exists) {
        if (!exists) {
          _this.emit('error', 'Matched file does not exist: ' + file);
          return;
        }
        atom.workspace.open(file, {
          initialLine: row,
          initialColumn: col,
          searchAllPanes: true
        });
        _this.emit('matched', match);
      });
    }
  }, {
    key: '_parse',
    value: function _parse() {
      var _this2 = this;

      this.currentMatch = [];

      // first run all functional matches
      this.functions && this.functions.forEach(function (f, functionIndex) {
        _this2.currentMatch = _this2.currentMatch.concat(f(_this2.output).map(function (match, matchIndex) {
          match.id = 'error-match-function-' + functionIndex + '-' + matchIndex;
          match.type = match.type || 'Error';
          return match;
        }));
      });
      // then for all match kinds
      Object.keys(this.regex).forEach(function (kind) {
        // run all matches
        _this2.regex[kind] && _this2.regex[kind].forEach(function (regex, i) {
          regex && require('xregexp').forEach(_this2.output, regex, function (match, matchIndex) {
            match.id = 'error-match-' + i + '-' + matchIndex;
            match.type = kind;
            _this2.currentMatch.push(match);
          });
        });
      });

      this.currentMatch.sort(function (a, b) {
        return a.index - b.index;
      });

      this.firstMatchId = this.currentMatch.length > 0 ? this.currentMatch[0].id : null;
    }
  }, {
    key: '_prepareRegex',
    value: function _prepareRegex(regex) {
      var _this3 = this;

      regex = regex || [];
      regex = regex instanceof Array ? regex : [regex];

      return regex.map(function (r) {
        try {
          var XRegExp = require('xregexp');
          return XRegExp(r);
        } catch (err) {
          _this3.emit('error', 'Error parsing regex. ' + err.message);
          return null;
        }
      });
    }
  }, {
    key: 'set',
    value: function set(target, cwd, output) {
      var _this4 = this;

      if (target.functionMatch) {
        this.functions = (target.functionMatch instanceof Array ? target.functionMatch : [target.functionMatch]).filter(function (f) {
          if (typeof f !== 'function') {
            _this4.emit('error', 'found functionMatch that is no function: ' + typeof f);
            return false;
          }
          return true;
        });
      }
      this.regex = {
        Error: this._prepareRegex(target.errorMatch),
        Warning: this._prepareRegex(target.warningMatch)
      };

      this.cwd = cwd;
      this.output = output;
      this.currentMatch = [];

      this._parse();
    }
  }, {
    key: 'match',
    value: function match() {
      require('./google-analytics').sendEvent('errorMatch', 'match');

      this._gotoNext();
    }
  }, {
    key: 'matchFirst',
    value: function matchFirst() {
      require('./google-analytics').sendEvent('errorMatch', 'first');

      if (this.firstMatchId) {
        this.goto(this.firstMatchId);
      }
    }
  }, {
    key: 'hasMatch',
    value: function hasMatch() {
      return 0 !== this.currentMatch.length;
    }
  }, {
    key: 'getMatches',
    value: function getMatches() {
      return this.currentMatch;
    }
  }]);

  return ErrorMatcher;
})(_events.EventEmitter);

exports['default'] = ErrorMatcher;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvZXJyb3ItbWF0Y2hlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7c0JBRTZCLFFBQVE7O0FBRnJDLFdBQVcsQ0FBQzs7SUFJUyxZQUFZO1lBQVosWUFBWTs7QUFFcEIsV0FGUSxZQUFZLEdBRWpCOzBCQUZLLFlBQVk7O0FBRzdCLCtCQUhpQixZQUFZLDZDQUdyQjtBQUNSLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQ2hCLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFFBQUksQ0FBQyxZQUFZLEdBQUcsRUFBRSxDQUFDO0FBQ3ZCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDOztBQUV6QixRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBSSxJQUFJLENBQUMsS0FBSyxNQUFWLElBQUksRUFBTyxDQUFDO0FBQ3ZFLFFBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLHlCQUF5QixFQUFJLElBQUksQ0FBQyxVQUFVLE1BQWYsSUFBSSxFQUFZLENBQUM7R0FDbkY7O2VBYmtCLFlBQVk7O1dBZXRCLHFCQUFHO0FBQ1YsVUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUU7QUFDbEMsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNwQzs7O1dBRUcsY0FBQyxFQUFFLEVBQUU7OztBQUNQLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFVBQUEsQ0FBQztlQUFJ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QVksRUFBRSxPQUFPLENBQUMsQ0FBQzs7QUFFL0QsVUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3JCLFlBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO09BQzlCO0tBQ0Y7OztXQUVPLG9CQUFHO0FBQ1QsYUFBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7S0FDdkM7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0tBQzFCOzs7U0FySmtCLFlBQVk7OztxQkFBWixZQUFZIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvZXJyb3ItbWF0Y2hlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5pbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFcnJvck1hdGNoZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5yZWdleCA9IG51bGw7XG4gICAgdGhpcy5jd2QgPSBudWxsO1xuICAgIHRoaXMuc3Rkb3V0ID0gbnVsbDtcbiAgICB0aGlzLnN0ZGVyciA9IG51bGw7XG4gICAgdGhpcy5jdXJyZW50TWF0Y2ggPSBbXTtcbiAgICB0aGlzLmZpcnN0TWF0Y2hJZCA9IG51bGw7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYnVpbGQ6ZXJyb3ItbWF0Y2gnLCA6OnRoaXMubWF0Y2gpO1xuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsICdidWlsZDplcnJvci1tYXRjaC1maXJzdCcsIDo6dGhpcy5tYXRjaEZpcnN0KTtcbiAgfVxuXG4gIF9nb3RvTmV4dCgpIHtcbiAgICBpZiAoMCA9PT0gdGhpcy5jdXJyZW50TWF0Y2gubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5nb3RvKHRoaXMuY3VycmVudE1hdGNoWzBdLmlkKTtcbiAgfVxuXG4gIGdvdG8oaWQpIHtcbiAgICBjb25zdCBtYXRjaCA9IHRoaXMuY3VycmVudE1hdGNoLmZpbmQobSA9PiBtLmlkID09PSBpZCk7XG4gICAgaWYgKCFtYXRjaCkge1xuICAgICAgdGhpcy5lbWl0KCdlcnJvcicsICdDYW5cXCd0IGZpbmQgbWF0Y2ggd2l0aCBpZCAnICsgaWQpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIHJvdGF0ZSB0byBuZXh0IG1hdGNoXG4gICAgd2hpbGUgKHRoaXMuY3VycmVudE1hdGNoWzBdICE9PSBtYXRjaCkge1xuICAgICAgdGhpcy5jdXJyZW50TWF0Y2gucHVzaCh0aGlzLmN1cnJlbnRNYXRjaC5zaGlmdCgpKTtcbiAgICB9XG4gICAgdGhpcy5jdXJyZW50TWF0Y2gucHVzaCh0aGlzLmN1cnJlbnRNYXRjaC5zaGlmdCgpKTtcblxuICAgIGxldCBmaWxlID0gbWF0Y2guZmlsZTtcbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCAnRGlkIG5vdCBtYXRjaCBhbnkgZmlsZS4gRG9uXFwndCBrbm93IHdoYXQgdG8gb3Blbi4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xuICAgIGlmICghcGF0aC5pc0Fic29sdXRlKGZpbGUpKSB7XG4gICAgICBmaWxlID0gdGhpcy5jd2QgKyBwYXRoLnNlcCArIGZpbGU7XG4gICAgfVxuXG4gICAgY29uc3Qgcm93ID0gbWF0Y2gubGluZSA/IG1hdGNoLmxpbmUgLSAxIDogMDsgLyogQmVjYXVzZSBhdG9tIGlzIHplcm8tYmFzZWQgKi9cbiAgICBjb25zdCBjb2wgPSBtYXRjaC5jb2wgPyBtYXRjaC5jb2wgLSAxIDogMDsgLyogQmVjYXVzZSBhdG9tIGlzIHplcm8tYmFzZWQgKi9cblxuICAgIHJlcXVpcmUoJ2ZzJykuZXhpc3RzKGZpbGUsIChleGlzdHMpID0+IHtcbiAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCAnTWF0Y2hlZCBmaWxlIGRvZXMgbm90IGV4aXN0OiAnICsgZmlsZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZSwge1xuICAgICAgICBpbml0aWFsTGluZTogcm93LFxuICAgICAgICBpbml0aWFsQ29sdW1uOiBjb2wsXG4gICAgICAgIHNlYXJjaEFsbFBhbmVzOiB0cnVlXG4gICAgICB9KTtcbiAgICAgIHRoaXMuZW1pdCgnbWF0Y2hlZCcsIG1hdGNoKTtcbiAgICB9KTtcbiAgfVxuXG4gIF9wYXJzZSgpIHtcbiAgICB0aGlzLmN1cnJlbnRNYXRjaCA9IFtdO1xuXG4gICAgLy8gZmlyc3QgcnVuIGFsbCBmdW5jdGlvbmFsIG1hdGNoZXNcbiAgICB0aGlzLmZ1bmN0aW9ucyAmJiB0aGlzLmZ1bmN0aW9ucy5mb3JFYWNoKChmLCBmdW5jdGlvbkluZGV4KSA9PiB7XG4gICAgICB0aGlzLmN1cnJlbnRNYXRjaCA9IHRoaXMuY3VycmVudE1hdGNoLmNvbmNhdChmKHRoaXMub3V0cHV0KS5tYXAoKG1hdGNoLCBtYXRjaEluZGV4KSA9PiB7XG4gICAgICAgIG1hdGNoLmlkID0gJ2Vycm9yLW1hdGNoLWZ1bmN0aW9uLScgKyBmdW5jdGlvbkluZGV4ICsgJy0nICsgbWF0Y2hJbmRleDtcbiAgICAgICAgbWF0Y2gudHlwZSA9IG1hdGNoLnR5cGUgfHwgJ0Vycm9yJztcbiAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgfSkpO1xuICAgIH0pO1xuICAgIC8vIHRoZW4gZm9yIGFsbCBtYXRjaCBraW5kc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVnZXgpLmZvckVhY2goa2luZCA9PiB7XG4gICAgICAvLyBydW4gYWxsIG1hdGNoZXNcbiAgICAgIHRoaXMucmVnZXhba2luZF0gJiYgdGhpcy5yZWdleFtraW5kXS5mb3JFYWNoKChyZWdleCwgaSkgPT4ge1xuICAgICAgICByZWdleCAmJiByZXF1aXJlKCd4cmVnZXhwJykuZm9yRWFjaCh0aGlzLm91dHB1dCwgcmVnZXgsIChtYXRjaCwgbWF0Y2hJbmRleCkgPT4ge1xuICAgICAgICAgIG1hdGNoLmlkID0gJ2Vycm9yLW1hdGNoLScgKyBpICsgJy0nICsgbWF0Y2hJbmRleDtcbiAgICAgICAgICBtYXRjaC50eXBlID0ga2luZDtcbiAgICAgICAgICB0aGlzLmN1cnJlbnRNYXRjaC5wdXNoKG1hdGNoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHRoaXMuY3VycmVudE1hdGNoLnNvcnQoKGEsIGIpID0+IGEuaW5kZXggLSBiLmluZGV4KTtcblxuICAgIHRoaXMuZmlyc3RNYXRjaElkID0gKHRoaXMuY3VycmVudE1hdGNoLmxlbmd0aCA+IDApID8gdGhpcy5jdXJyZW50TWF0Y2hbMF0uaWQgOiBudWxsO1xuICB9XG5cbiAgX3ByZXBhcmVSZWdleChyZWdleCkge1xuICAgIHJlZ2V4ID0gcmVnZXggfHwgW107XG4gICAgcmVnZXggPSAocmVnZXggaW5zdGFuY2VvZiBBcnJheSkgPyByZWdleCA6IFsgcmVnZXggXTtcblxuICAgIHJldHVybiByZWdleC5tYXAociA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBYUmVnRXhwID0gcmVxdWlyZSgneHJlZ2V4cCcpO1xuICAgICAgICByZXR1cm4gWFJlZ0V4cChyKTtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICB0aGlzLmVtaXQoJ2Vycm9yJywgJ0Vycm9yIHBhcnNpbmcgcmVnZXguICcgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgc2V0KHRhcmdldCwgY3dkLCBvdXRwdXQpIHtcbiAgICBpZiAodGFyZ2V0LmZ1bmN0aW9uTWF0Y2gpIHtcbiAgICAgIHRoaXMuZnVuY3Rpb25zID0gKCh0YXJnZXQuZnVuY3Rpb25NYXRjaCBpbnN0YW5jZW9mIEFycmF5KSA/IHRhcmdldC5mdW5jdGlvbk1hdGNoIDogWyB0YXJnZXQuZnVuY3Rpb25NYXRjaCBdKS5maWx0ZXIoZiA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZiAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIHRoaXMuZW1pdCgnZXJyb3InLCAnZm91bmQgZnVuY3Rpb25NYXRjaCB0aGF0IGlzIG5vIGZ1bmN0aW9uOiAnICsgdHlwZW9mIGYpO1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aGlzLnJlZ2V4ID0ge1xuICAgICAgRXJyb3I6IHRoaXMuX3ByZXBhcmVSZWdleCh0YXJnZXQuZXJyb3JNYXRjaCksXG4gICAgICBXYXJuaW5nOiB0aGlzLl9wcmVwYXJlUmVnZXgodGFyZ2V0Lndhcm5pbmdNYXRjaClcbiAgICB9O1xuXG4gICAgdGhpcy5jd2QgPSBjd2Q7XG4gICAgdGhpcy5vdXRwdXQgPSBvdXRwdXQ7XG4gICAgdGhpcy5jdXJyZW50TWF0Y2ggPSBbXTtcblxuICAgIHRoaXMuX3BhcnNlKCk7XG4gIH1cblxuICBtYXRjaCgpIHtcbiAgICByZXF1aXJlKCcuL2dvb2dsZS1hbmFseXRpY3MnKS5zZW5kRXZlbnQoJ2Vycm9yTWF0Y2gnLCAnbWF0Y2gnKTtcblxuICAgIHRoaXMuX2dvdG9OZXh0KCk7XG4gIH1cblxuICBtYXRjaEZpcnN0KCkge1xuICAgIHJlcXVpcmUoJy4vZ29vZ2xlLWFuYWx5dGljcycpLnNlbmRFdmVudCgnZXJyb3JNYXRjaCcsICdmaXJzdCcpO1xuXG4gICAgaWYgKHRoaXMuZmlyc3RNYXRjaElkKSB7XG4gICAgICB0aGlzLmdvdG8odGhpcy5maXJzdE1hdGNoSWQpO1xuICAgIH1cbiAgfVxuXG4gIGhhc01hdGNoKCkge1xuICAgIHJldHVybiAwICE9PSB0aGlzLmN1cnJlbnRNYXRjaC5sZW5ndGg7XG4gIH1cblxuICBnZXRNYXRjaGVzKCkge1xuICAgIHJldHVybiB0aGlzLmN1cnJlbnRNYXRjaDtcbiAgfVxufVxuIl19