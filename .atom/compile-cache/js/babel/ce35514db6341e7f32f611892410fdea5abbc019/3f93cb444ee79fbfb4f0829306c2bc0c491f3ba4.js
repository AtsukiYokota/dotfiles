Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _atomSpacePenViews = require('atom-space-pen-views');

'use babel';

var SaveConfirmView = (function (_View) {
  _inherits(SaveConfirmView, _View);

  function SaveConfirmView() {
    _classCallCheck(this, SaveConfirmView);

    _get(Object.getPrototypeOf(SaveConfirmView.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(SaveConfirmView, [{
    key: 'destroy',
    value: function destroy() {
      this.confirmcb = undefined;
      this.cancelcb = undefined;
      if (this.panel) {
        this.panel.destroy();
        this.panel = null;
      }
    }
  }, {
    key: 'show',
    value: function show(confirmcb, cancelcb) {
      this.confirmcb = confirmcb;
      this.cancelcb = cancelcb;

      this.panel = atom.workspace.addTopPanel({
        item: this
      });
      this.saveBuildButton.focus();
    }
  }, {
    key: 'cancel',
    value: function cancel() {
      this.destroy();
      if (this.cancelcb) {
        this.cancelcb();
      }
    }
  }, {
    key: 'saveAndConfirm',
    value: function saveAndConfirm() {
      if (this.confirmcb) {
        this.confirmcb(true);
      }
      this.destroy();
    }
  }, {
    key: 'confirmWithoutSave',
    value: function confirmWithoutSave() {
      if (this.confirmcb) {
        this.confirmcb(false);
      }
      this.destroy();
    }
  }], [{
    key: 'content',
    value: function content() {
      var _this = this;

      this.div({ 'class': 'build-confirm overlay from-top' }, function () {
        _this.h3('You have unsaved changes');
        _this.div({ 'class': 'btn-container pull-right' }, function () {
          _this.button({ 'class': 'btn btn-success', outlet: 'saveBuildButton', title: 'Save and Build', click: 'saveAndConfirm' }, 'Save and build');
          _this.button({ 'class': 'btn btn-info', title: 'Build Without Saving', click: 'confirmWithoutSave' }, 'Build Without Saving');
        });
        _this.div({ 'class': 'btn-container pull-left' }, function () {
          _this.button({ 'class': 'btn btn-info', title: 'Cancel', click: 'cancel' }, 'Cancel');
        });
      });
    }
  }]);

  return SaveConfirmView;
})(_atomSpacePenViews.View);

exports['default'] = SaveConfirmView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvc2F2ZS1jb25maXJtLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O2lDQUVxQixzQkFBc0I7O0FBRjNDLFdBQVcsQ0FBQzs7SUFJUyxlQUFlO1lBQWYsZUFBZTs7V0FBZixlQUFlOzBCQUFmLGVBQWU7OytCQUFmLGVBQWU7OztlQUFmLGVBQWU7O1dBYzNCLG1CQUFHO0FBQ1IsVUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsVUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7QUFDMUIsVUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ2QsWUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztPQUNuQjtLQUNGOzs7V0FFRyxjQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUU7QUFDeEIsVUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsVUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUM7QUFDdEMsWUFBSSxFQUFFLElBQUk7T0FDWCxDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQzlCOzs7V0FFSyxrQkFBRztBQUNQLFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNmLFVBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNqQixZQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7T0FDakI7S0FDRjs7O1dBRWEsMEJBQUc7QUFDZixVQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7QUFDbEIsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztPQUN0QjtBQUNELFVBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUNoQjs7O1dBRWlCLDhCQUFHO0FBQ25CLFVBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtBQUNsQixZQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO09BQ3ZCO0FBQ0QsVUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2hCOzs7V0FuRGEsbUJBQUc7OztBQUNmLFVBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxTQUFPLGdDQUFnQyxFQUFFLEVBQUUsWUFBTTtBQUMxRCxjQUFLLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO0FBQ3BDLGNBQUssR0FBRyxDQUFDLEVBQUUsU0FBTywwQkFBMEIsRUFBRSxFQUFFLFlBQU07QUFDcEQsZ0JBQUssTUFBTSxDQUFDLEVBQUUsU0FBTyxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLGdCQUFnQixDQUFDLENBQUM7QUFDekksZ0JBQUssTUFBTSxDQUFDLEVBQUUsU0FBTyxjQUFjLEVBQUUsS0FBSyxFQUFFLHNCQUFzQixFQUFFLEtBQUssRUFBRSxvQkFBb0IsRUFBRSxFQUFFLHNCQUFzQixDQUFDLENBQUM7U0FDNUgsQ0FBQyxDQUFDO0FBQ0gsY0FBSyxHQUFHLENBQUMsRUFBRSxTQUFPLHlCQUF5QixFQUFFLEVBQUUsWUFBTTtBQUNuRCxnQkFBSyxNQUFNLENBQUMsRUFBRSxTQUFPLGNBQWMsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztTQUNwRixDQUFDLENBQUM7T0FDSixDQUFDLENBQUM7S0FDSjs7O1NBWmtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvc2F2ZS1jb25maXJtLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IHsgVmlldyB9IGZyb20gJ2F0b20tc3BhY2UtcGVuLXZpZXdzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2F2ZUNvbmZpcm1WaWV3IGV4dGVuZHMgVmlldyB7XG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHRoaXMuZGl2KHsgY2xhc3M6ICdidWlsZC1jb25maXJtIG92ZXJsYXkgZnJvbS10b3AnIH0sICgpID0+IHtcbiAgICAgIHRoaXMuaDMoJ1lvdSBoYXZlIHVuc2F2ZWQgY2hhbmdlcycpO1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ2J0bi1jb250YWluZXIgcHVsbC1yaWdodCcgfSwgKCkgPT4ge1xuICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIGJ0bi1zdWNjZXNzJywgb3V0bGV0OiAnc2F2ZUJ1aWxkQnV0dG9uJywgdGl0bGU6ICdTYXZlIGFuZCBCdWlsZCcsIGNsaWNrOiAnc2F2ZUFuZENvbmZpcm0nIH0sICdTYXZlIGFuZCBidWlsZCcpO1xuICAgICAgICB0aGlzLmJ1dHRvbih7IGNsYXNzOiAnYnRuIGJ0bi1pbmZvJywgdGl0bGU6ICdCdWlsZCBXaXRob3V0IFNhdmluZycsIGNsaWNrOiAnY29uZmlybVdpdGhvdXRTYXZlJyB9LCAnQnVpbGQgV2l0aG91dCBTYXZpbmcnKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5kaXYoeyBjbGFzczogJ2J0bi1jb250YWluZXIgcHVsbC1sZWZ0JyB9LCAoKSA9PiB7XG4gICAgICAgIHRoaXMuYnV0dG9uKHsgY2xhc3M6ICdidG4gYnRuLWluZm8nLCB0aXRsZTogJ0NhbmNlbCcsIGNsaWNrOiAnY2FuY2VsJyB9LCAnQ2FuY2VsJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5jb25maXJtY2IgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5jYW5jZWxjYiA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5wYW5lbCkge1xuICAgICAgdGhpcy5wYW5lbC5kZXN0cm95KCk7XG4gICAgICB0aGlzLnBhbmVsID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICBzaG93KGNvbmZpcm1jYiwgY2FuY2VsY2IpIHtcbiAgICB0aGlzLmNvbmZpcm1jYiA9IGNvbmZpcm1jYjtcbiAgICB0aGlzLmNhbmNlbGNiID0gY2FuY2VsY2I7XG5cbiAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkVG9wUGFuZWwoe1xuICAgICAgaXRlbTogdGhpc1xuICAgIH0pO1xuICAgIHRoaXMuc2F2ZUJ1aWxkQnV0dG9uLmZvY3VzKCk7XG4gIH1cblxuICBjYW5jZWwoKSB7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gICAgaWYgKHRoaXMuY2FuY2VsY2IpIHtcbiAgICAgIHRoaXMuY2FuY2VsY2IoKTtcbiAgICB9XG4gIH1cblxuICBzYXZlQW5kQ29uZmlybSgpIHtcbiAgICBpZiAodGhpcy5jb25maXJtY2IpIHtcbiAgICAgIHRoaXMuY29uZmlybWNiKHRydWUpO1xuICAgIH1cbiAgICB0aGlzLmRlc3Ryb3koKTtcbiAgfVxuXG4gIGNvbmZpcm1XaXRob3V0U2F2ZSgpIHtcbiAgICBpZiAodGhpcy5jb25maXJtY2IpIHtcbiAgICAgIHRoaXMuY29uZmlybWNiKGZhbHNlKTtcbiAgICB9XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbn1cbiJdfQ==