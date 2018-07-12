Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x2, _x3, _x4) { var _again = true; _function: while (_again) { var object = _x2, property = _x3, receiver = _x4; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x2 = parent; _x3 = property; _x4 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var BuildView = (function (_View) {
  _inherits(BuildView, _View);

  _createClass(BuildView, null, [{
    key: 'initialTimerText',
    value: function initialTimerText() {
      return '0.0 s';
    }
  }, {
    key: 'initialHeadingText',
    value: function initialHeadingText() {
      return 'Atom Build';
    }
  }, {
    key: 'content',
    value: function content() {
      var _this = this;

      this.div({ tabIndex: -1, 'class': 'build tool-panel native-key-bindings' }, function () {
        _this.div({ 'class': 'heading', outlet: 'panelHeading' }, function () {
          _this.div({ 'class': 'control-container opaque-hover' }, function () {
            _this.button({ 'class': 'btn btn-default icon icon-zap', click: 'build', title: 'Build current project' });
            _this.button({ 'class': 'btn btn-default icon icon-trashcan', click: 'clearOutput' });
            _this.button({ 'class': 'btn btn-default icon icon-x', click: 'close' });
            _this.div({ 'class': 'title', outlet: 'title' }, function () {
              _this.span({ 'class': 'build-timer', outlet: 'buildTimer' }, _this.initialTimerText());
            });
          });
          _this.div({ 'class': 'icon heading-text', outlet: 'heading' }, _this.initialHeadingText());
        });

        _this.div({ 'class': 'output panel-body', outlet: 'output' });
        _this.div({ 'class': 'resizer', outlet: 'resizer' });
      });
    }
  }]);

  function BuildView() {
    var _context,
        _this2 = this;

    _classCallCheck(this, BuildView);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _get(Object.getPrototypeOf(BuildView.prototype), 'constructor', this).apply(this, args);
    var Terminal = require('term.js');
    this.starttime = new Date();
    this.terminal = new Terminal({
      cursorBlink: false,
      convertEol: true,
      useFocus: false,
      termName: 'xterm-256color',
      scrollback: atom.config.get('build.terminalScrollback')
    });

    // On some systems, prependListern and prependOnceListener is expected to exist. Add them until terminal replacement is here.
    this.terminal.prependListener = function () {
      var _terminal;

      (_terminal = _this2.terminal).addListener.apply(_terminal, arguments);
    };
    this.terminal.prependOnceListener = function () {
      var _terminal2;

      (_terminal2 = _this2.terminal).addOnceListener.apply(_terminal2, arguments);
    };

    this.terminal.getContent = function () {
      return this.lines.reduce(function (m1, line) {
        return m1 + line.reduce(function (m2, col) {
          return m2 + col[1];
        }, '') + '\n';
      }, '');
    };

    this.fontGeometry = { w: 15, h: 15 };
    this.terminal.open(this.output[0]);
    this.destroyTerminal = (_context = this.terminal).destroy.bind(_context);
    this.terminal.destroy = this.terminal.destroySoon = function () {}; // This terminal will be open forever and reset when necessary
    this.terminalEl = (0, _atomSpacePenViews.$)(this.terminal.element);
    this.terminalEl[0].terminal = this.terminal; // For testing purposes

    this.resizeStarted = this.resizeStarted.bind(this);
    this.resizeMoved = this.resizeMoved.bind(this);
    this.resizeEnded = this.resizeEnded.bind(this);

    atom.config.observe('build.panelVisibility', this.visibleFromConfig.bind(this));
    atom.config.observe('build.panelOrientation', this.orientationFromConfig.bind(this));
    atom.config.observe('build.hidePanelHeading', function (hide) {
      hide && _this2.panelHeading.hide() || _this2.panelHeading.show();
    });
    atom.config.observe('build.overrideThemeColors', function (override) {
      _this2.output.removeClass('override-theme');
      override && _this2.output.addClass('override-theme');
    });
    atom.config.observe('editor.fontSize', this.fontSizeFromConfig.bind(this));
    atom.config.observe('editor.fontFamily', this.fontFamilyFromConfig.bind(this));
    atom.commands.add('atom-workspace', 'build:toggle-panel', this.toggle.bind(this));
  }

  _createClass(BuildView, [{
    key: 'destroy',
    value: function destroy() {
      this.destroyTerminal();
      clearInterval(this.detectResizeInterval);
    }
  }, {
    key: 'resizeStarted',
    value: function resizeStarted() {
      document.body.style['-webkit-user-select'] = 'none';
      document.addEventListener('mousemove', this.resizeMoved);
      document.addEventListener('mouseup', this.resizeEnded);
    }
  }, {
    key: 'resizeMoved',
    value: function resizeMoved(ev) {
      var h = this.fontGeometry.h;

      switch (atom.config.get('build.panelOrientation')) {
        case 'Bottom':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().top - ev.y;
            if (Math.abs(delta) < h * 5 / 6) return;

            var nearestRowHeight = Math.round((this.terminalEl.height() + delta) / h) * h;
            var maxHeight = (0, _atomSpacePenViews.$)('.item-views').height() + (0, _atomSpacePenViews.$)('.build .output').height();
            this.terminalEl.css('height', Math.min(maxHeight, nearestRowHeight) + 'px');
            break;
          }

        case 'Top':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().top - ev.y;
            if (Math.abs(delta) < h * 5 / 6) return;

            var nearestRowHeight = Math.round((this.terminalEl.height() - delta) / h) * h;
            var maxHeight = (0, _atomSpacePenViews.$)('.item-views').height() + (0, _atomSpacePenViews.$)('.build .output').height();
            this.terminalEl.css('height', Math.min(maxHeight, nearestRowHeight) + 'px');
            break;
          }

        case 'Left':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().right - ev.x;
            this.css('width', this.width() - delta - this.resizer.outerWidth() + 'px');
            break;
          }

        case 'Right':
          {
            var delta = this.resizer.get(0).getBoundingClientRect().left - ev.x;
            this.css('width', this.width() + delta + 'px');
            break;
          }
      }

      this.resizeTerminal();
    }
  }, {
    key: 'resizeEnded',
    value: function resizeEnded() {
      document.body.style['-webkit-user-select'] = 'text';
      document.removeEventListener('mousemove', this.resizeMoved);
      document.removeEventListener('mouseup', this.resizeEnded);
    }
  }, {
    key: 'resizeToNearestRow',
    value: function resizeToNearestRow() {
      if (-1 !== ['Top', 'Bottom'].indexOf(atom.config.get('build.panelOrientation'))) {
        this.fixTerminalElHeight();
      }
      this.resizeTerminal();
    }
  }, {
    key: 'getFontGeometry',
    value: function getFontGeometry() {
      var o = (0, _atomSpacePenViews.$)('<div>A</div>').addClass('terminal').addClass('terminal-test').appendTo(this.output);
      var w = o[0].getBoundingClientRect().width;
      var h = o[0].getBoundingClientRect().height;
      o.remove();
      return { w: w, h: h };
    }
  }, {
    key: 'resizeTerminal',
    value: function resizeTerminal() {
      this.fontGeometry = this.getFontGeometry();
      var _fontGeometry = this.fontGeometry;
      var w = _fontGeometry.w;
      var h = _fontGeometry.h;

      if (0 === w || 0 === h) {
        return;
      }

      var terminalWidth = Math.floor(this.terminalEl.width() / w);
      var terminalHeight = Math.floor(this.terminalEl.height() / h);

      this.terminal.resize(terminalWidth, terminalHeight);
    }
  }, {
    key: 'getContent',
    value: function getContent() {
      return this.terminal.getContent();
    }
  }, {
    key: 'attach',
    value: function attach() {
      var force = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      if (!force) {
        switch (atom.config.get('build.panelVisibility')) {
          case 'Hidden':
          case 'Show on Error':
            return;
        }
      }

      if (this.panel) {
        this.panel.destroy();
      }

      var addfn = {
        Top: atom.workspace.addTopPanel,
        Bottom: atom.workspace.addBottomPanel,
        Left: atom.workspace.addLeftPanel,
        Right: atom.workspace.addRightPanel
      };
      var orientation = atom.config.get('build.panelOrientation') || 'Bottom';
      this.panel = addfn[orientation].call(atom.workspace, { item: this });
      this.fixTerminalElHeight();
      this.resizeToNearestRow();
    }
  }, {
    key: 'fixTerminalElHeight',
    value: function fixTerminalElHeight() {
      var nearestRowHeight = (0, _atomSpacePenViews.$)('.build .output').height();
      this.terminalEl.css('height', nearestRowHeight + 'px');
    }
  }, {
    key: 'detach',
    value: function detach(force) {
      force = force || false;
      if (atom.views.getView(atom.workspace) && document.activeElement === this[0]) {
        atom.views.getView(atom.workspace).focus();
      }
      if (this.panel && (force || 'Keep Visible' !== atom.config.get('build.panelVisibility'))) {
        this.panel.destroy();
        this.panel = null;
      }
    }
  }, {
    key: 'isAttached',
    value: function isAttached() {
      return !!this.panel;
    }
  }, {
    key: 'visibleFromConfig',
    value: function visibleFromConfig(val) {
      switch (val) {
        case 'Toggle':
        case 'Show on Error':
          if (!this.terminalEl.hasClass('error')) {
            this.detach();
          }
          return;
      }

      this.attach();
    }
  }, {
    key: 'orientationFromConfig',
    value: function orientationFromConfig(orientation) {
      var isVisible = this.isVisible();
      this.detach(true);
      if (isVisible) {
        this.attach();
      }

      this.resizer.get(0).removeEventListener('mousedown', this.resizeStarted);

      switch (orientation) {
        case 'Top':
        case 'Bottom':
          this.get(0).style.width = null;
          this.resizer.get(0).addEventListener('mousedown', this.resizeStarted);
          break;

        case 'Left':
        case 'Right':
          this.terminalEl.get(0).style.height = null;
          this.resizer.get(0).addEventListener('mousedown', this.resizeStarted);
          break;
      }

      this.resizeTerminal();
    }
  }, {
    key: 'fontSizeFromConfig',
    value: function fontSizeFromConfig(size) {
      this.css({ 'font-size': size });
      this.resizeToNearestRow();
    }
  }, {
    key: 'fontFamilyFromConfig',
    value: function fontFamilyFromConfig(family) {
      this.css({ 'font-family': family });
      this.resizeToNearestRow();
    }
  }, {
    key: 'reset',
    value: function reset() {
      clearTimeout(this.titleTimer);
      this.buildTimer.text(BuildView.initialTimerText());
      this.titleTimer = 0;
      this.terminal.reset();

      this.panelHeading.removeClass('success error');
      this.title.removeClass('success error');

      this.detach();
    }
  }, {
    key: 'updateTitle',
    value: function updateTitle() {
      this.buildTimer.text(((new Date() - this.starttime) / 1000).toFixed(1) + ' s');
      this.titleTimer = setTimeout(this.updateTitle.bind(this), 100);
    }
  }, {
    key: 'close',
    value: function close() {
      this.detach(true);
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      require('./google-analytics').sendEvent('view', 'panel toggled');
      this.isAttached() ? this.detach(true) : this.attach(true);
    }
  }, {
    key: 'clearOutput',
    value: function clearOutput() {
      this.terminal.reset();
    }
  }, {
    key: 'build',
    value: function build() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'build:trigger');
    }
  }, {
    key: 'setHeading',
    value: function setHeading(heading) {
      this.heading.text(heading);
    }
  }, {
    key: 'buildStarted',
    value: function buildStarted() {
      this.starttime = new Date();
      this.reset();
      this.attach();
      if (atom.config.get('build.stealFocus')) {
        this.focus();
      }
      this.updateTitle();
    }
  }, {
    key: 'buildFinished',
    value: function buildFinished(success) {
      if (!success && !this.isAttached()) {
        this.attach(atom.config.get('build.panelVisibility') === 'Show on Error');
      }
      this.finalizeBuild(success);
    }
  }, {
    key: 'buildAbortInitiated',
    value: function buildAbortInitiated() {
      this.heading.addClass('icon-stop');
    }
  }, {
    key: 'buildAborted',
    value: function buildAborted() {
      this.finalizeBuild(false);
    }
  }, {
    key: 'finalizeBuild',
    value: function finalizeBuild(success) {
      this.title.addClass(success ? 'success' : 'error');
      this.panelHeading.addClass(success ? 'success' : 'error');
      this.heading.removeClass('icon-stop');
      clearTimeout(this.titleTimer);
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(text) {
      var content = this.getContent();
      var endPos = -1;
      var curPos = text.length;
      // We need to decrease the size of `text` until we find a match. This is because
      // terminal will insert line breaks ('\r\n') when width of terminal is reached.
      // It may have been that the middle of a matched error is on a line break.
      while (-1 === endPos && curPos > 0) {
        endPos = content.indexOf(text.substring(0, curPos--));
      }

      if (curPos === 0) {
        // No match - which is weird. Oh well - rather be defensive
        return;
      }

      var row = content.slice(0, endPos).split('\n').length;
      this.terminal.ydisp = 0;
      this.terminal.scrollDisp(row - 1);
    }
  }]);

  return BuildView;
})(_atomSpacePenViews.View);

exports['default'] = BuildView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvYnVpbGQtdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7aUNBRXdCLHNCQUFzQjs7QUFGOUMsV0FBVyxDQUFDOztJQUlTLFNBQVM7WUFBVCxTQUFTOztlQUFULFNBQVM7O1dBRUwsNEJBQUc7QUFDeEIsYUFBTyxPQUFPLENBQUM7S0FDaEI7OztXQUV3Qiw4QkFBRztBQUMxQixhQUFPLFlBQVksQ0FBQztLQUNyQjs7O1dBRWEsbUJBQUc7OztBQUNmLFVBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsU0FBTyxzQ0FBc0MsRUFBRSxFQUFFLFlBQU07QUFDOUUsY0FBSyxHQUFHLENBQUMsRUFBRSxTQUFPLFNBQVMsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLEVBQUUsWUFBTTtBQUMzRCxnQkFBSyxHQUFHLENBQUMsRUFBRSxTQUFPLGdDQUFnQyxFQUFFLEVBQUUsWUFBTTtBQUMxRCxrQkFBSyxNQUFNLENBQUMsRUFBRSxTQUFPLCtCQUErQixFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLHVCQUF1QixFQUFFLENBQUMsQ0FBQztBQUN4RyxrQkFBSyxNQUFNLENBQUMsRUFBRSxTQUFPLG9DQUFvQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsQ0FBQyxDQUFDO0FBQ25GLGtCQUFLLE1BQU0sQ0FBQyxFQUFFLFNBQU8sNkJBQTZCLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDdEUsa0JBQUssR0FBRyxDQUFDLEVBQUUsU0FBTyxPQUFPLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxFQUFFLFlBQU07QUFDbEQsb0JBQUssSUFBSSxDQUFDLEVBQUUsU0FBTyxhQUFhLEVBQUUsTUFBTSxFQUFFLFlBQVksRUFBRSxFQUFFLE1BQUssZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO2FBQ3BGLENBQUMs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Y0FBTSxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQ3ZEOztBQUVELFVBQUksTUFBTSxLQUFLLENBQUMsRUFBRTs7QUFFaEIsZUFBTztPQUNSOztBQUVELFVBQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7QUFDeEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3hCLFVBQUksQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQztLQUNuQzs7O1NBbldrQixTQUFTOzs7cUJBQVQsU0FBUyIsImZpbGUiOiIvaG9tZS95b2tvdGEvLmF0b20vcGFja2FnZXMvYnVpbGQvbGliL2J1aWxkLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgVmlldywgJCB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnVpbGRWaWV3IGV4dGVuZHMgVmlldyB7XG5cbiAgc3RhdGljIGluaXRpYWxUaW1lclRleHQoKSB7XG4gICAgcmV0dXJuICcwLjAgcyc7XG4gIH1cblxuICBzdGF0aWMgaW5pdGlhbEhlYWRpbmdUZXh0KCkge1xuICAgIHJldHVybiAnQXRvbSBCdWlsZCc7XG4gIH1cblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICB0aGlzLmRpdih7IHRhYkluZGV4OiAtMSwgY2xhc3M6ICdidWlsZCB0b29sLXBhbmVsIG5hdGl2ZS1rZXktYmluZGluZ3MnIH0sICgpID0+IHtcbiAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdoZWFkaW5nJywgb3V0bGV0OiAncGFuZWxIZWFkaW5nJyB9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdjb250cm9sLWNvbnRhaW5lciBvcGFxdWUtaG92ZXInIH0sICgpID0+IHtcbiAgICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIGJ0bi1kZWZhdWx0IGljb24gaWNvbi16YXAnLCBjbGljazogJ2J1aWxkJywgdGl0bGU6ICdCdWlsZCBjdXJyZW50IHByb2plY3QnIH0pO1xuICAgICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6ICdidG4gYnRuLWRlZmF1bHQgaWNvbiBpY29uLXRyYXNoY2FuJywgY2xpY2s6ICdjbGVhck91dHB1dCcgfSk7XG4gICAgICAgICAgdGhpcy5idXR0b24oeyBjbGFzczogJ2J0biBidG4tZGVmYXVsdCBpY29uIGljb24teCcsIGNsaWNrOiAnY2xvc2UnIH0pO1xuICAgICAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICd0aXRsZScsIG91dGxldDogJ3RpdGxlJyB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNwYW4oeyBjbGFzczogJ2J1aWxkLXRpbWVyJywgb3V0bGV0OiAnYnVpbGRUaW1lcicgfSwgdGhpcy5pbml0aWFsVGltZXJUZXh0KCkpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ2ljb24gaGVhZGluZy10ZXh0Jywgb3V0bGV0OiAnaGVhZGluZycgfSwgdGhpcy5pbml0aWFsSGVhZGluZ1RleHQoKSk7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ291dHB1dCBwYW5lbC1ib2R5Jywgb3V0bGV0OiAnb3V0cHV0JyB9KTtcbiAgICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdyZXNpemVyJywgb3V0bGV0OiAncmVzaXplcicgfSk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncyk7XG4gICAgY29uc3QgVGVybWluYWwgPSByZXF1aXJlKCd0ZXJtLmpzJyk7XG4gICAgdGhpcy5zdGFydHRpbWUgPSBuZXcgRGF0ZSgpO1xuICAgIHRoaXMudGVybWluYWwgPSBuZXcgVGVybWluYWwoe1xuICAgICAgY3Vyc29yQmxpbms6IGZhbHNlLFxuICAgICAgY29udmVydEVvbDogdHJ1ZSxcbiAgICAgIHVzZUZvY3VzOiBmYWxzZSxcbiAgICAgIHRlcm1OYW1lOiAneHRlcm0tMjU2Y29sb3InLFxuICAgICAgc2Nyb2xsYmFjazogYXRvbS5jb25maWcuZ2V0KCdidWlsZC50ZXJtaW5hbFNjcm9sbGJhY2snKVxuICAgIH0pO1xuXG4gICAgLy8gT24gc29tZSBzeXN0ZW1zLCBwcmVwZW5kTGlzdGVybiBhbmQgcHJlcGVuZE9uY2VMaXN0ZW5lciBpcyBleHBlY3RlZCB0byBleGlzdC4gQWRkIHRoZW0gdW50aWwgdGVybWluYWwgcmVwbGFjZW1lbnQgaXMgaGVyZS5cbiAgICB0aGlzLnRlcm1pbmFsLnByZXBlbmRMaXN0ZW5lciA9ICguLi5hKSA9PiB7XG4gICAgICB0aGlzLnRlcm1pbmFsLmFkZExpc3RlbmVyKC4uLmEpO1xuICAgIH07XG4gICAgdGhpcy50ZXJtaW5hbC5wcmVwZW5kT25jZUxpc3RlbmVyID0gKC4uLmEpID0+IHtcbiAgICAgIHRoaXMudGVybWluYWwuYWRkT25jZUxpc3RlbmVyKC4uLmEpO1xuICAgIH07XG5cbiAgICB0aGlzLnRlcm1pbmFsLmdldENvbnRlbnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5saW5lcy5yZWR1Y2UoKG0xLCBsaW5lKSA9PiB7XG4gICAgICAgIHJldHVybiBtMSArIGxpbmUucmVkdWNlKChtMiwgY29sKSA9PiBtMiArIGNvbFsxXSwgJycpICsgJ1xcbic7XG4gICAgICB9LCAnJyk7XG4gICAgfTtcblxuICAgIHRoaXMuZm9udEdlb21ldHJ5ID0geyB3OiAxNSwgaDogMTUgfTtcbiAgICB0aGlzLnRlcm1pbmFsLm9wZW4odGhpcy5vdXRwdXRbMF0pO1xuICAgIHRoaXMuZGVzdHJveVRlcm1pbmFsID0gOjoodGhpcy50ZXJtaW5hbCkuZGVzdHJveTtcbiAgICB0aGlzLnRlcm1pbmFsLmRlc3Ryb3kgPSB0aGlzLnRlcm1pbmFsLmRlc3Ryb3lTb29uID0gKCkgPT4ge307IC8vIFRoaXMgdGVybWluYWwgd2lsbCBiZSBvcGVuIGZvcmV2ZXIgYW5kIHJlc2V0IHdoZW4gbmVjZXNzYXJ5XG4gICAgdGhpcy50ZXJtaW5hbEVsID0gJCh0aGlzLnRlcm1pbmFsLmVsZW1lbnQpO1xuICAgIHRoaXMudGVybWluYWxFbFswXS50ZXJtaW5hbCA9IHRoaXMudGVybWluYWw7IC8vIEZvciB0ZXN0aW5nIHB1cnBvc2VzXG5cbiAgICB0aGlzLnJlc2l6ZVN0YXJ0ZWQgPSA6OnRoaXMucmVzaXplU3RhcnRlZDtcbiAgICB0aGlzLnJlc2l6ZU1vdmVkID0gOjp0aGlzLnJlc2l6ZU1vdmVkO1xuICAgIHRoaXMucmVzaXplRW5kZWQgPSA6OnRoaXMucmVzaXplRW5kZWQ7XG5cbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdidWlsZC5wYW5lbFZpc2liaWxpdHknLCA6OnRoaXMudmlzaWJsZUZyb21Db25maWcpO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2J1aWxkLnBhbmVsT3JpZW50YXRpb24nLCA6OnRoaXMub3JpZW50YXRpb25Gcm9tQ29uZmlnKTtcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdidWlsZC5oaWRlUGFuZWxIZWFkaW5nJywgKGhpZGUpID0+IHtcbiAgICAgIGhpZGUgJiYgdGhpcy5wYW5lbEhlYWRpbmcuaGlkZSgpIHx8IHRoaXMucGFuZWxIZWFkaW5nLnNob3coKTtcbiAgICB9KTtcbiAgICBhdG9tLmNvbmZpZy5vYnNlcnZlKCdidWlsZC5vdmVycmlkZVRoZW1lQ29sb3JzJywgKG92ZXJyaWRlKSA9PiB7XG4gICAgICB0aGlzLm91dHB1dC5yZW1vdmVDbGFzcygnb3ZlcnJpZGUtdGhlbWUnKTtcbiAgICAgIG92ZXJyaWRlICYmIHRoaXMub3V0cHV0LmFkZENsYXNzKCdvdmVycmlkZS10aGVtZScpO1xuICAgIH0pO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5mb250U2l6ZScsIDo6dGhpcy5mb250U2l6ZUZyb21Db25maWcpO1xuICAgIGF0b20uY29uZmlnLm9ic2VydmUoJ2VkaXRvci5mb250RmFtaWx5JywgOjp0aGlzLmZvbnRGYW1pbHlGcm9tQ29uZmlnKTtcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCAnYnVpbGQ6dG9nZ2xlLXBhbmVsJywgOjp0aGlzLnRvZ2dsZSk7XG4gIH1cblxuICBkZXN0cm95KCkge1xuICAgIHRoaXMuZGVzdHJveVRlcm1pbmFsKCk7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLmRldGVjdFJlc2l6ZUludGVydmFsKTtcbiAgfVxuXG4gIHJlc2l6ZVN0YXJ0ZWQoKSB7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZVsnLXdlYmtpdC11c2VyLXNlbGVjdCddID0gJ25vbmUnO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHRoaXMucmVzaXplTW92ZWQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNldXAnLCB0aGlzLnJlc2l6ZUVuZGVkKTtcbiAgfVxuXG4gIHJlc2l6ZU1vdmVkKGV2KSB7XG4gICAgY29uc3QgeyBoIH0gPSB0aGlzLmZvbnRHZW9tZXRyeTtcblxuICAgIHN3aXRjaCAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5wYW5lbE9yaWVudGF0aW9uJykpIHtcbiAgICAgIGNhc2UgJ0JvdHRvbSc6IHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnJlc2l6ZXIuZ2V0KDApLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCAtIGV2Lnk7XG4gICAgICAgIGlmIChNYXRoLmFicyhkZWx0YSkgPCAoaCAqIDUgLyA2KSkgcmV0dXJuO1xuXG4gICAgICAgIGNvbnN0IG5lYXJlc3RSb3dIZWlnaHQgPSBNYXRoLnJvdW5kKCh0aGlzLnRlcm1pbmFsRWwuaGVpZ2h0KCkgKyBkZWx0YSkgLyBoKSAqIGg7XG4gICAgICAgIGNvbnN0IG1heEhlaWdodCA9ICQoJy5pdGVtLXZpZXdzJykuaGVpZ2h0KCkgKyAkKCcuYnVpbGQgLm91dHB1dCcpLmhlaWdodCgpO1xuICAgICAgICB0aGlzLnRlcm1pbmFsRWwuY3NzKCdoZWlnaHQnLCBgJHtNYXRoLm1pbihtYXhIZWlnaHQsIG5lYXJlc3RSb3dIZWlnaHQpfXB4YCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdUb3AnOiB7XG4gICAgICAgIGNvbnN0IGRlbHRhID0gdGhpcy5yZXNpemVyLmdldCgwKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgLSBldi55O1xuICAgICAgICBpZiAoTWF0aC5hYnMoZGVsdGEpIDwgKGggKiA1IC8gNikpIHJldHVybjtcblxuICAgICAgICBjb25zdCBuZWFyZXN0Um93SGVpZ2h0ID0gTWF0aC5yb3VuZCgodGhpcy50ZXJtaW5hbEVsLmhlaWdodCgpIC0gZGVsdGEpIC8gaCkgKiBoO1xuICAgICAgICBjb25zdCBtYXhIZWlnaHQgPSAkKCcuaXRlbS12aWV3cycpLmhlaWdodCgpICsgJCgnLmJ1aWxkIC5vdXRwdXQnKS5oZWlnaHQoKTtcbiAgICAgICAgdGhpcy50ZXJtaW5hbEVsLmNzcygnaGVpZ2h0JywgYCR7TWF0aC5taW4obWF4SGVpZ2h0LCBuZWFyZXN0Um93SGVpZ2h0KX1weGApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgY2FzZSAnTGVmdCc6IHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnJlc2l6ZXIuZ2V0KDApLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnJpZ2h0IC0gZXYueDtcbiAgICAgICAgdGhpcy5jc3MoJ3dpZHRoJywgYCR7dGhpcy53aWR0aCgpIC0gZGVsdGEgLSB0aGlzLnJlc2l6ZXIub3V0ZXJXaWR0aCgpfXB4YCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBjYXNlICdSaWdodCc6IHtcbiAgICAgICAgY29uc3QgZGVsdGEgPSB0aGlzLnJlc2l6ZXIuZ2V0KDApLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgLSBldi54O1xuICAgICAgICB0aGlzLmNzcygnd2lkdGgnLCBgJHt0aGlzLndpZHRoKCkgKyBkZWx0YX1weGApO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnJlc2l6ZVRlcm1pbmFsKCk7XG4gIH1cblxuICByZXNpemVFbmRlZCgpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlWyctd2Via2l0LXVzZXItc2VsZWN0J10gPSAndGV4dCc7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgdGhpcy5yZXNpemVNb3ZlZCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIHRoaXMucmVzaXplRW5kZWQpO1xuICB9XG5cbiAgcmVzaXplVG9OZWFyZXN0Um93KCkge1xuICAgIGlmICgtMSAhPT0gWyAnVG9wJywgJ0JvdHRvbScgXS5pbmRleE9mKGF0b20uY29uZmlnLmdldCgnYnVpbGQucGFuZWxPcmllbnRhdGlvbicpKSkge1xuICAgICAgdGhpcy5maXhUZXJtaW5hbEVsSGVpZ2h0KCk7XG4gICAgfVxuICAgIHRoaXMucmVzaXplVGVybWluYWwoKTtcbiAgfVxuXG4gIGdldEZvbnRHZW9tZXRyeSgpIHtcbiAgICBjb25zdCBvID0gJCgnPGRpdj5BPC9kaXY+JylcbiAgICAgIC5hZGRDbGFzcygndGVybWluYWwnKVxuICAgICAgLmFkZENsYXNzKCd0ZXJtaW5hbC10ZXN0JylcbiAgICAgIC5hcHBlbmRUbyh0aGlzLm91dHB1dCk7XG4gICAgY29uc3QgdyA9IG9bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gICAgY29uc3QgaCA9IG9bMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuICAgIG8ucmVtb3ZlKCk7XG4gICAgcmV0dXJuIHsgdywgaCB9O1xuICB9XG5cbiAgcmVzaXplVGVybWluYWwoKSB7XG4gICAgdGhpcy5mb250R2VvbWV0cnkgPSB0aGlzLmdldEZvbnRHZW9tZXRyeSgpO1xuICAgIGNvbnN0IHsgdywgaCB9ID0gdGhpcy5mb250R2VvbWV0cnk7XG4gICAgaWYgKDAgPT09IHcgfHwgMCA9PT0gaCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHRlcm1pbmFsV2lkdGggPSBNYXRoLmZsb29yKCh0aGlzLnRlcm1pbmFsRWwud2lkdGgoKSkgLyB3KTtcbiAgICBjb25zdCB0ZXJtaW5hbEhlaWdodCA9IE1hdGguZmxvb3IoKHRoaXMudGVybWluYWxFbC5oZWlnaHQoKSkgLyBoKTtcblxuICAgIHRoaXMudGVybWluYWwucmVzaXplKHRlcm1pbmFsV2lkdGgsIHRlcm1pbmFsSGVpZ2h0KTtcbiAgfVxuXG4gIGdldENvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudGVybWluYWwuZ2V0Q29udGVudCgpO1xuICB9XG5cbiAgYXR0YWNoKGZvcmNlID0gZmFsc2UpIHtcbiAgICBpZiAoIWZvcmNlKSB7XG4gICAgICBzd2l0Y2ggKGF0b20uY29uZmlnLmdldCgnYnVpbGQucGFuZWxWaXNpYmlsaXR5JykpIHtcbiAgICAgICAgY2FzZSAnSGlkZGVuJzpcbiAgICAgICAgY2FzZSAnU2hvdyBvbiBFcnJvcic6XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBhbmVsKSB7XG4gICAgICB0aGlzLnBhbmVsLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBjb25zdCBhZGRmbiA9IHtcbiAgICAgIFRvcDogYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwsXG4gICAgICBCb3R0b206IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsLFxuICAgICAgTGVmdDogYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsLFxuICAgICAgUmlnaHQ6IGF0b20ud29ya3NwYWNlLmFkZFJpZ2h0UGFuZWxcbiAgICB9O1xuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC5wYW5lbE9yaWVudGF0aW9uJykgfHwgJ0JvdHRvbSc7XG4gICAgdGhpcy5wYW5lbCA9IGFkZGZuW29yaWVudGF0aW9uXS5jYWxsKGF0b20ud29ya3NwYWNlLCB7IGl0ZW06IHRoaXMgfSk7XG4gICAgdGhpcy5maXhUZXJtaW5hbEVsSGVpZ2h0KCk7XG4gICAgdGhpcy5yZXNpemVUb05lYXJlc3RSb3coKTtcbiAgfVxuXG4gIGZpeFRlcm1pbmFsRWxIZWlnaHQoKSB7XG4gICAgY29uc3QgbmVhcmVzdFJvd0hlaWdodCA9ICQoJy5idWlsZCAub3V0cHV0JykuaGVpZ2h0KCk7XG4gICAgdGhpcy50ZXJtaW5hbEVsLmNzcygnaGVpZ2h0JywgYCR7bmVhcmVzdFJvd0hlaWdodH1weGApO1xuICB9XG5cbiAgZGV0YWNoKGZvcmNlKSB7XG4gICAgZm9yY2UgPSBmb3JjZSB8fCBmYWxzZTtcbiAgICBpZiAoYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSB0aGlzWzBdKSB7XG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLmZvY3VzKCk7XG4gICAgfVxuICAgIGlmICh0aGlzLnBhbmVsICYmIChmb3JjZSB8fCAnS2VlcCBWaXNpYmxlJyAhPT0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC5wYW5lbFZpc2liaWxpdHknKSkpIHtcbiAgICAgIHRoaXMucGFuZWwuZGVzdHJveSgpO1xuICAgICAgdGhpcy5wYW5lbCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgaXNBdHRhY2hlZCgpIHtcbiAgICByZXR1cm4gISF0aGlzLnBhbmVsO1xuICB9XG5cbiAgdmlzaWJsZUZyb21Db25maWcodmFsKSB7XG4gICAgc3dpdGNoICh2YWwpIHtcbiAgICAgIGNhc2UgJ1RvZ2dsZSc6XG4gICAgICBjYXNlICdTaG93IG9uIEVycm9yJzpcbiAgICAgICAgaWYgKCF0aGlzLnRlcm1pbmFsRWwuaGFzQ2xhc3MoJ2Vycm9yJykpIHtcbiAgICAgICAgICB0aGlzLmRldGFjaCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLmF0dGFjaCgpO1xuICB9XG5cbiAgb3JpZW50YXRpb25Gcm9tQ29uZmlnKG9yaWVudGF0aW9uKSB7XG4gICAgY29uc3QgaXNWaXNpYmxlID0gdGhpcy5pc1Zpc2libGUoKTtcbiAgICB0aGlzLmRldGFjaCh0cnVlKTtcbiAgICBpZiAoaXNWaXNpYmxlKSB7XG4gICAgICB0aGlzLmF0dGFjaCgpO1xuICAgIH1cblxuICAgIHRoaXMucmVzaXplci5nZXQoMCkucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5yZXNpemVTdGFydGVkKTtcblxuICAgIHN3aXRjaCAob3JpZW50YXRpb24pIHtcbiAgICAgIGNhc2UgJ1RvcCc6XG4gICAgICBjYXNlICdCb3R0b20nOlxuICAgICAgICB0aGlzLmdldCgwKS5zdHlsZS53aWR0aCA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzaXplci5nZXQoMCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5yZXNpemVTdGFydGVkKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ0xlZnQnOlxuICAgICAgY2FzZSAnUmlnaHQnOlxuICAgICAgICB0aGlzLnRlcm1pbmFsRWwuZ2V0KDApLnN0eWxlLmhlaWdodCA9IG51bGw7XG4gICAgICAgIHRoaXMucmVzaXplci5nZXQoMCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdGhpcy5yZXNpemVTdGFydGVkKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgdGhpcy5yZXNpemVUZXJtaW5hbCgpO1xuICB9XG5cbiAgZm9udFNpemVGcm9tQ29uZmlnKHNpemUpIHtcbiAgICB0aGlzLmNzcyh7ICdmb250LXNpemUnOiBzaXplIH0pO1xuICAgIHRoaXMucmVzaXplVG9OZWFyZXN0Um93KCk7XG4gIH1cblxuICBmb250RmFtaWx5RnJvbUNvbmZpZyhmYW1pbHkpIHtcbiAgICB0aGlzLmNzcyh7ICdmb250LWZhbWlseSc6IGZhbWlseSB9KTtcbiAgICB0aGlzLnJlc2l6ZVRvTmVhcmVzdFJvdygpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMudGl0bGVUaW1lcik7XG4gICAgdGhpcy5idWlsZFRpbWVyLnRleHQoQnVpbGRWaWV3LmluaXRpYWxUaW1lclRleHQoKSk7XG4gICAgdGhpcy50aXRsZVRpbWVyID0gMDtcbiAgICB0aGlzLnRlcm1pbmFsLnJlc2V0KCk7XG5cbiAgICB0aGlzLnBhbmVsSGVhZGluZy5yZW1vdmVDbGFzcygnc3VjY2VzcyBlcnJvcicpO1xuICAgIHRoaXMudGl0bGUucmVtb3ZlQ2xhc3MoJ3N1Y2Nlc3MgZXJyb3InKTtcblxuICAgIHRoaXMuZGV0YWNoKCk7XG4gIH1cblxuICB1cGRhdGVUaXRsZSgpIHtcbiAgICB0aGlzLmJ1aWxkVGltZXIudGV4dCgoKG5ldyBEYXRlKCkgLSB0aGlzLnN0YXJ0dGltZSkgLyAxMDAwKS50b0ZpeGVkKDEpICsgJyBzJyk7XG4gICAgdGhpcy50aXRsZVRpbWVyID0gc2V0VGltZW91dCh0aGlzLnVwZGF0ZVRpdGxlLmJpbmQodGhpcyksIDEwMCk7XG4gIH1cblxuICBjbG9zZSgpIHtcbiAgICB0aGlzLmRldGFjaCh0cnVlKTtcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICByZXF1aXJlKCcuL2dvb2dsZS1hbmFseXRpY3MnKS5zZW5kRXZlbnQoJ3ZpZXcnLCAncGFuZWwgdG9nZ2xlZCcpO1xuICAgIHRoaXMuaXNBdHRhY2hlZCgpID8gdGhpcy5kZXRhY2godHJ1ZSkgOiB0aGlzLmF0dGFjaCh0cnVlKTtcbiAgfVxuXG4gIGNsZWFyT3V0cHV0KCkge1xuICAgIHRoaXMudGVybWluYWwucmVzZXQoKTtcbiAgfVxuXG4gIGJ1aWxkKCkge1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSwgJ2J1aWxkOnRyaWdnZXInKTtcbiAgfVxuXG4gIHNldEhlYWRpbmcoaGVhZGluZykge1xuICAgIHRoaXMuaGVhZGluZy50ZXh0KGhlYWRpbmcpO1xuICB9XG5cbiAgYnVpbGRTdGFydGVkKCkge1xuICAgIHRoaXMuc3RhcnR0aW1lID0gbmV3IERhdGUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gICAgdGhpcy5hdHRhY2goKTtcbiAgICBpZiAoYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zdGVhbEZvY3VzJykpIHtcbiAgICAgIHRoaXMuZm9jdXMoKTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVUaXRsZSgpO1xuICB9XG5cbiAgYnVpbGRGaW5pc2hlZChzdWNjZXNzKSB7XG4gICAgaWYgKCFzdWNjZXNzICYmICF0aGlzLmlzQXR0YWNoZWQoKSkge1xuICAgICAgdGhpcy5hdHRhY2goYXRvbS5jb25maWcuZ2V0KCdidWlsZC5wYW5lbFZpc2liaWxpdHknKSA9PT0gJ1Nob3cgb24gRXJyb3InKTtcbiAgICB9XG4gICAgdGhpcy5maW5hbGl6ZUJ1aWxkKHN1Y2Nlc3MpO1xuICB9XG5cbiAgYnVpbGRBYm9ydEluaXRpYXRlZCgpIHtcbiAgICB0aGlzLmhlYWRpbmcuYWRkQ2xhc3MoJ2ljb24tc3RvcCcpO1xuICB9XG5cbiAgYnVpbGRBYm9ydGVkKCkge1xuICAgIHRoaXMuZmluYWxpemVCdWlsZChmYWxzZSk7XG4gIH1cblxuICBmaW5hbGl6ZUJ1aWxkKHN1Y2Nlc3MpIHtcbiAgICB0aGlzLnRpdGxlLmFkZENsYXNzKHN1Y2Nlc3MgPyAnc3VjY2VzcycgOiAnZXJyb3InKTtcbiAgICB0aGlzLnBhbmVsSGVhZGluZy5hZGRDbGFzcyhzdWNjZXNzID8gJ3N1Y2Nlc3MnIDogJ2Vycm9yJyk7XG4gICAgdGhpcy5oZWFkaW5nLnJlbW92ZUNsYXNzKCdpY29uLXN0b3AnKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy50aXRsZVRpbWVyKTtcbiAgfVxuXG4gIHNjcm9sbFRvKHRleHQpIHtcbiAgICBjb25zdCBjb250ZW50ID0gdGhpcy5nZXRDb250ZW50KCk7XG4gICAgbGV0IGVuZFBvcyA9IC0xO1xuICAgIGxldCBjdXJQb3MgPSB0ZXh0Lmxlbmd0aDtcbiAgICAvLyBXZSBuZWVkIHRvIGRlY3JlYXNlIHRoZSBzaXplIG9mIGB0ZXh0YCB1bnRpbCB3ZSBmaW5kIGEgbWF0Y2guIFRoaXMgaXMgYmVjYXVzZVxuICAgIC8vIHRlcm1pbmFsIHdpbGwgaW5zZXJ0IGxpbmUgYnJlYWtzICgnXFxyXFxuJykgd2hlbiB3aWR0aCBvZiB0ZXJtaW5hbCBpcyByZWFjaGVkLlxuICAgIC8vIEl0IG1heSBoYXZlIGJlZW4gdGhhdCB0aGUgbWlkZGxlIG9mIGEgbWF0Y2hlZCBlcnJvciBpcyBvbiBhIGxpbmUgYnJlYWsuXG4gICAgd2hpbGUgKC0xID09PSBlbmRQb3MgJiYgY3VyUG9zID4gMCkge1xuICAgICAgZW5kUG9zID0gY29udGVudC5pbmRleE9mKHRleHQuc3Vic3RyaW5nKDAsIGN1clBvcy0tKSk7XG4gICAgfVxuXG4gICAgaWYgKGN1clBvcyA9PT0gMCkge1xuICAgICAgLy8gTm8gbWF0Y2ggLSB3aGljaCBpcyB3ZWlyZC4gT2ggd2VsbCAtIHJhdGhlciBiZSBkZWZlbnNpdmVcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb3cgPSBjb250ZW50LnNsaWNlKDAsIGVuZFBvcykuc3BsaXQoJ1xcbicpLmxlbmd0aDtcbiAgICB0aGlzLnRlcm1pbmFsLnlkaXNwID0gMDtcbiAgICB0aGlzLnRlcm1pbmFsLnNjcm9sbERpc3Aocm93IC0gMSk7XG4gIH1cbn1cbiJdfQ==