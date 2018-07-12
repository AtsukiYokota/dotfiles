Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var StatusBarView = (function (_View) {
  _inherits(StatusBarView, _View);

  function StatusBarView(statusBar) {
    var _this = this;

    _classCallCheck(this, StatusBarView);

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    _get(Object.getPrototypeOf(StatusBarView.prototype), 'constructor', this).apply(this, args);
    this.statusBar = statusBar;
    atom.config.observe('build.statusBar', function () {
      return _this.attach();
    });
    atom.config.observe('build.statusBarPriority', function () {
      return _this.attach();
    });
  }

  _createClass(StatusBarView, [{
    key: 'attach',
    value: function attach() {
      var _this2 = this;

      this.destroy();

      var orientation = atom.config.get('build.statusBar');
      if ('Disable' === orientation) {
        return;
      }

      this.statusBarTile = this.statusBar['add' + orientation + 'Tile']({
        item: this,
        priority: atom.config.get('build.statusBarPriority')
      });

      this.tooltip = atom.tooltips.add(this, {
        title: function title() {
          return _this2.tooltipMessage();
        }
      });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      if (this.statusBarTile) {
        this.statusBarTile.destroy();
        this.statusBarTile = null;
      }

      if (this.tooltip) {
        this.tooltip.dispose();
        this.tooltip = null;
      }
    }
  }, {
    key: 'tooltipMessage',
    value: function tooltipMessage() {
      return 'Current build target is \'' + this.element.textContent + '\'';
    }
  }, {
    key: 'setClasses',
    value: function setClasses(classes) {
      this.removeClass('status-unknown status-success status-error');
      this.addClass(classes);
    }
  }, {
    key: 'setTarget',
    value: function setTarget(t) {
      if (this.target === t) {
        return;
      }

      this.target = t;
      this.message.text(t || '');
      this.setClasses();
    }
  }, {
    key: 'buildAborted',
    value: function buildAborted() {
      this.setBuildSuccess(false);
    }
  }, {
    key: 'setBuildSuccess',
    value: function setBuildSuccess(success) {
      this.setClasses(success ? 'status-success' : 'status-error');
    }
  }, {
    key: 'buildStarted',
    value: function buildStarted() {
      this.setClasses();
    }
  }, {
    key: 'onClick',
    value: function onClick(cb) {
      this.onClick = cb;
    }
  }, {
    key: 'clicked',
    value: function clicked() {
      this.onClick && this.onClick();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this3 = this;

      this.div({ id: 'build-status-bar', 'class': 'inline-block' }, function () {
        _this3.a({ click: 'clicked', outlet: 'message' });
      });
    }
  }]);

  return StatusBarView;
})(_atomSpacePenViews.View);

exports['default'] = StatusBarView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvc3RhdHVzLWJhci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztpQ0FFcUIsc0JBQXNCOztBQUYzQyxXQUFXLENBQUM7O0lBSVMsYUFBYTtZQUFiLGFBQWE7O0FBQ3JCLFdBRFEsYUFBYSxDQUNwQixTQUFTLEVBQVc7OzswQkFEYixhQUFhOztzQ0FDTixJQUFJO0FBQUosVUFBSTs7O0FBQzVCLCtCQUZpQixhQUFhLDhDQUVyQixJQUFJLEVBQUU7QUFDZixRQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztBQUMzQixRQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsRUFBRTthQUFNLE1BQUssTUFBTSxFQUFFO0tBQUEsQ0FBQyxDQUFDO0FBQzVELFFBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixFQUFFO2FBQU0sTUFBSyxNQUFNLEVBQUU7S0FBQSxDQUFDLENBQUM7R0FDckU7O2VBTmtCLGFBQWE7O1dBUTFCLGtCQUFHOzs7QUFDUCxVQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7O0FBRWYsVUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN2RCxVQUFJLFNBQVMsS0FBSyxXQUFXLEVBQUU7QUFDN0IsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLFNBQVMsU0FBTyxXQUFXLFVBQU8sQ0FBQztBQUMzRCxZQUFJLEVBQUUsSUFBSTtBQUNWLGdCQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUM7T0FDckQsQ0FBQyxDQUFDOztBQUVILFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFO0FBQ3JDLGFBQUssRUFBRTtpQkFBTSxPQUFLLGNBQWMsRUFBRTtTQUFBO09BQ25DLENBQUMsQ0FBQztLQUNKOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUN0QixZQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLFlBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO09BQzNCOztBQUVELFVBQUksSUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNoQixZQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3ZCLFlBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO09BQ3JCO0tBQ0Y7OztXQVFhLDBCQUFHO0FBQ2YsNENBQW1DLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxRQUFJO0tBQ2hFOzs7V0FFUyxvQkFBQyxPQUFPLEVBQUU7QUFDbEIsVUFBSSxDQUFDLFdBQVcsQ0FBQyw0Q0FBNEMsQ0FBQyxDQUFDO0FBQy9ELFVBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDeEI7OztXQUVRLG1CQUFDLENBQUMsRUFBRTtBQUNYLFVBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDckIsZUFBTztPQUNSOztBQUVELFVBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUMzQixVQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7S0FDbkI7OztXQUVXLHdCQUFHO0FBQ2IsVUFBSSxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM3Qjs7O1dBRWMseUJBQUMsT0FBTyxFQUFFO0FBQ3ZCLFVBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxHQUFHLGdCQUFnQixHQUFHLGNBQWMsQ0FBQyxDQUFDO0tBQzlEOzs7V0FFVyx3QkFBRztBQUNiLFVBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztLQUNuQjs7O1dBRU0saUJBQUMsRUFBRSxFQUFFO0FBQ1YsVUFBSSxDQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7S0FDbkI7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDaEM7OztXQTNDYSxtQkFBRzs7O0FBQ2YsVUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxrQkFBa0IsRUFBRSxTQUFPLGNBQWMsRUFBRSxFQUFFLFlBQU07QUFDaEUsZUFBSyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUMsQ0FBQyxDQUFDO09BQ2hELENBQUMsQ0FBQztLQUNKOzs7U0ExQ2tCLGFBQWE7OztxQkFBYixhQUFhIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvc3RhdHVzLWJhci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IFZpZXcgfSBmcm9tICdhdG9tLXNwYWNlLXBlbi12aWV3cyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0YXR1c0JhclZpZXcgZXh0ZW5kcyBWaWV3IHtcbiAgY29uc3RydWN0b3Ioc3RhdHVzQmFyLCAuLi5hcmdzKSB7XG4gICAgc3VwZXIoLi4uYXJncyk7XG4gICAgdGhpcy5zdGF0dXNCYXIgPSBzdGF0dXNCYXI7XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnYnVpbGQuc3RhdHVzQmFyJywgKCkgPT4gdGhpcy5hdHRhY2goKSk7XG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSgnYnVpbGQuc3RhdHVzQmFyUHJpb3JpdHknLCAoKSA9PiB0aGlzLmF0dGFjaCgpKTtcbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICB0aGlzLmRlc3Ryb3koKTtcblxuICAgIGNvbnN0IG9yaWVudGF0aW9uID0gYXRvbS5jb25maWcuZ2V0KCdidWlsZC5zdGF0dXNCYXInKTtcbiAgICBpZiAoJ0Rpc2FibGUnID09PSBvcmllbnRhdGlvbikge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuc3RhdHVzQmFyVGlsZSA9IHRoaXMuc3RhdHVzQmFyW2BhZGQke29yaWVudGF0aW9ufVRpbGVgXSh7XG4gICAgICBpdGVtOiB0aGlzLFxuICAgICAgcHJpb3JpdHk6IGF0b20uY29uZmlnLmdldCgnYnVpbGQuc3RhdHVzQmFyUHJpb3JpdHknKVxuICAgIH0pO1xuXG4gICAgdGhpcy50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQodGhpcywge1xuICAgICAgdGl0bGU6ICgpID0+IHRoaXMudG9vbHRpcE1lc3NhZ2UoKVxuICAgIH0pO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5zdGF0dXNCYXJUaWxlKSB7XG4gICAgICB0aGlzLnN0YXR1c0JhclRpbGUuZGVzdHJveSgpO1xuICAgICAgdGhpcy5zdGF0dXNCYXJUaWxlID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy50b29sdGlwKSB7XG4gICAgICB0aGlzLnRvb2x0aXAuZGlzcG9zZSgpO1xuICAgICAgdGhpcy50b29sdGlwID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzdGF0aWMgY29udGVudCgpIHtcbiAgICB0aGlzLmRpdih7IGlkOiAnYnVpbGQtc3RhdHVzLWJhcicsIGNsYXNzOiAnaW5saW5lLWJsb2NrJyB9LCAoKSA9PiB7XG4gICAgICB0aGlzLmEoeyBjbGljazogJ2NsaWNrZWQnLCBvdXRsZXQ6ICdtZXNzYWdlJ30pO1xuICAgIH0pO1xuICB9XG5cbiAgdG9vbHRpcE1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIGBDdXJyZW50IGJ1aWxkIHRhcmdldCBpcyAnJHt0aGlzLmVsZW1lbnQudGV4dENvbnRlbnR9J2A7XG4gIH1cblxuICBzZXRDbGFzc2VzKGNsYXNzZXMpIHtcbiAgICB0aGlzLnJlbW92ZUNsYXNzKCdzdGF0dXMtdW5rbm93biBzdGF0dXMtc3VjY2VzcyBzdGF0dXMtZXJyb3InKTtcbiAgICB0aGlzLmFkZENsYXNzKGNsYXNzZXMpO1xuICB9XG5cbiAgc2V0VGFyZ2V0KHQpIHtcbiAgICBpZiAodGhpcy50YXJnZXQgPT09IHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnRhcmdldCA9IHQ7XG4gICAgdGhpcy5tZXNzYWdlLnRleHQodCB8fCAnJyk7XG4gICAgdGhpcy5zZXRDbGFzc2VzKCk7XG4gIH1cblxuICBidWlsZEFib3J0ZWQoKSB7XG4gICAgdGhpcy5zZXRCdWlsZFN1Y2Nlc3MoZmFsc2UpO1xuICB9XG5cbiAgc2V0QnVpbGRTdWNjZXNzKHN1Y2Nlc3MpIHtcbiAgICB0aGlzLnNldENsYXNzZXMoc3VjY2VzcyA/ICdzdGF0dXMtc3VjY2VzcycgOiAnc3RhdHVzLWVycm9yJyk7XG4gIH1cblxuICBidWlsZFN0YXJ0ZWQoKSB7XG4gICAgdGhpcy5zZXRDbGFzc2VzKCk7XG4gIH1cblxuICBvbkNsaWNrKGNiKSB7XG4gICAgdGhpcy5vbkNsaWNrID0gY2I7XG4gIH1cblxuICBjbGlja2VkKCkge1xuICAgIHRoaXMub25DbGljayAmJiB0aGlzLm9uQ2xpY2soKTtcbiAgfVxufVxuIl19