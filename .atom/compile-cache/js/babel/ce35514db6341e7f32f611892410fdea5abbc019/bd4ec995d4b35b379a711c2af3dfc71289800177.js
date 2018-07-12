"use babel";

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom-space-pen-views');

var $ = _require.$;
var TextEditorView = _require.TextEditorView;
var View = _require.View;

var _require2 = require('atom');

var Disposable = _require2.Disposable;
var CompositeDisposable = _require2.CompositeDisposable;

var PdfGoToPageView = (function (_View) {
  _inherits(PdfGoToPageView, _View);

  _createClass(PdfGoToPageView, null, [{
    key: 'content',
    value: function content() {
      var _this = this;

      return this.div({ 'class': 'go-to-page' }, function () {
        _this.subview('miniEditor', new TextEditorView({ mini: true }));
        _this.div({ 'class': 'message', outlet: 'message' });
      });
    }
  }]);

  function PdfGoToPageView() {
    var _this2 = this;

    _classCallCheck(this, PdfGoToPageView);

    _get(Object.getPrototypeOf(PdfGoToPageView.prototype), 'constructor', this).call(this);

    this.detaching = false;

    atom.commands.add('atom-workspace', {
      'pdf-view:go-to-page': function pdfViewGoToPage() {
        _this2.toggle();
        return false;
      }
    });

    this.miniEditor.on('blur', function () {
      return _this2.close();
    });

    atom.commands.add(this.element, {
      'core:confirm': function coreConfirm() {
        return _this2.confirm();
      },
      'core:cancel': function coreCancel() {
        return _this2.close();
      }
    });

    this.miniEditor.preempt('textInput', function (e) {
      if (!e.originalEvent.data.match(/[0-9]/)) {
        return false;
      }
    });
  }

  _createClass(PdfGoToPageView, [{
    key: 'toggle',
    value: function toggle() {
      if (this.panel != null && this.panel.isVisible()) {
        return this.close();
      } else {
        return this.attach();
      }
    }
  }, {
    key: 'close',
    value: function close() {
      this.miniEditor.setText('');
      if (this.panel != null) {
        this.panel.hide();
      }
      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'confirm',
    value: function confirm() {
      var pageNumber = this.miniEditor.getText();
      pageNumber = parseInt(pageNumber, 10);
      var pdfView = atom.workspace.getActivePaneItem();

      this.close();

      if (pdfView != null && pdfView.pdfDocument != null && pdfView.scrollToPage != null) {
        pdfView.scrollToPage(pageNumber);
      }
    }
  }, {
    key: 'attach',
    value: function attach() {
      var pdfView = atom.workspace.getActivePaneItem();

      if (pdfView != null && pdfView.pdfDocument != null && pdfView.scrollToPage != null) {
        this.panel = atom.workspace.addModalPanel({ item: this });
        this.message.text('Enter a page number 1-' + pdfView.getTotalPageNumber());
        this.miniEditor.focus();
      }
    }
  }]);

  return PdfGoToPageView;
})(View);

exports['default'] = PdfGoToPageView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9wZGYtdmlldy9saWIvcGRmLWdvdG8tcGFnZS12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7ZUFFb0IsT0FBTyxDQUFDLHNCQUFzQixDQUFDOztJQUExRCxDQUFDLFlBQUQsQ0FBQztJQUFFLGNBQWMsWUFBZCxjQUFjO0lBQUUsSUFBSSxZQUFKLElBQUk7O2dCQUNZLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxELFVBQVUsYUFBVixVQUFVO0lBQUUsbUJBQW1CLGFBQW5CLG1CQUFtQjs7SUFFZixlQUFlO1lBQWYsZUFBZTs7ZUFBZixlQUFlOztXQUNwQixtQkFBRzs7O0FBQ2YsYUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsU0FBTyxZQUFZLEVBQUMsRUFBRSxZQUFNO0FBQzNDLGNBQUssT0FBTyxDQUFDLFlBQVksRUFBRSxJQUFJLGNBQWMsQ0FBQyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsY0FBSyxHQUFHLENBQUMsRUFBQyxTQUFPLFNBQVMsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQztPQUNqRCxDQUFDLENBQUE7S0FDSDs7O0FBRVUsV0FSUSxlQUFlLEdBUXBCOzs7MEJBUkssZUFBZTs7QUFTaEMsK0JBVGlCLGVBQWUsNkNBU3hCOztBQUVSLFFBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDOztBQUV2QixRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFDaEM7QUFDRSwyQkFBcUIsRUFBRSwyQkFBTTtBQUMzQixlQUFLLE1BQU0sRUFBRSxDQUFDO0FBQ2QsZUFBTyxLQUFLLENBQUM7T0FDZDtLQUNGLENBQ0YsQ0FBQzs7QUFFRixRQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUU7YUFBTSxPQUFLLEtBQUssRUFBRTtLQUFBLENBQUMsQ0FBQzs7QUFFL0MsUUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFDNUI7QUFDRSxvQkFBYyxFQUFFO2VBQU0sT0FBSyxPQUFPLEVBQUU7T0FBQTtBQUNwQyxtQkFBYSxFQUFFO2VBQU0sT0FBSyxLQUFLLEVBQUU7T0FBQTtLQUNsQyxDQUNGLENBQUM7O0FBRUYsUUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLFVBQUMsQ0FBQyxFQUFLO0FBQzFDLFVBQUksQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDeEMsZUFBTyxLQUFLLENBQUM7T0FDZDtLQUNGLENBQUMsQ0FBQztHQUNKOztlQXBDa0IsZUFBZTs7V0FzQzVCLGtCQUFHO0FBQ1AsVUFBSSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxFQUFFO0FBQ2hELGVBQU8sSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO09BQ3JCLE1BQU07QUFDTCxlQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztPQUN0QjtLQUNGOzs7V0FFSSxpQkFBRztBQUNOLFVBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzVCLFVBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDdEIsWUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUNuQjtBQUNELFVBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDM0M7OztXQUVNLG1CQUFHO0FBQ1IsVUFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMzQyxnQkFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDdEMsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOztBQUVqRCxVQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWIsVUFBSSxPQUFPLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxXQUFXLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxZQUFZLElBQUksSUFBSSxFQUFFO0FBQ2xGLGVBQU8sQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDbEM7S0FDRjs7O1dBRUssa0JBQUc7QUFDUCxVQUFJLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGlCQUFpQixFQUFFLENBQUM7O0FBRWpELFVBQUksT0FBTyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsWUFBWSxJQUFJLElBQUksRUFBRTtBQUNsRixZQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFDeEQsWUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLDRCQUEwQixPQUFPLENBQUMsa0JBQWtCLEVBQUUsQ0FBRyxDQUFDO0FBQzNFLFlBQUksQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLENBQUM7T0FDekI7S0FDRjs7O1NBMUVrQixlQUFlO0dBQVMsSUFBSTs7cUJBQTVCLGVBQWUiLCJmaWxlIjoiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL3BkZi12aWV3L2xpYi9wZGYtZ290by1wYWdlLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBiYWJlbFwiO1xuXG5sZXQgeyQsIFRleHRFZGl0b3JWaWV3LCBWaWV3fSA9IHJlcXVpcmUoJ2F0b20tc3BhY2UtcGVuLXZpZXdzJyk7XG5sZXQge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZGZHb1RvUGFnZVZpZXcgZXh0ZW5kcyBWaWV3IHtcbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGl2KHtjbGFzczogJ2dvLXRvLXBhZ2UnfSwgKCkgPT4ge1xuICAgICAgdGhpcy5zdWJ2aWV3KCdtaW5pRWRpdG9yJywgbmV3IFRleHRFZGl0b3JWaWV3KHttaW5pOiB0cnVlfSkpO1xuICAgICAgdGhpcy5kaXYoe2NsYXNzOiAnbWVzc2FnZScsIG91dGxldDogJ21lc3NhZ2UnfSk7XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmRldGFjaGluZyA9IGZhbHNlO1xuXG4gICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJyxcbiAgICAgIHtcbiAgICAgICAgJ3BkZi12aWV3OmdvLXRvLXBhZ2UnOiAoKSA9PiB7XG4gICAgICAgICAgdGhpcy50b2dnbGUoKTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5taW5pRWRpdG9yLm9uKCdibHVyJywgKCkgPT4gdGhpcy5jbG9zZSgpKTtcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKHRoaXMuZWxlbWVudCxcbiAgICAgIHtcbiAgICAgICAgJ2NvcmU6Y29uZmlybSc6ICgpID0+IHRoaXMuY29uZmlybSgpLFxuICAgICAgICAnY29yZTpjYW5jZWwnOiAoKSA9PiB0aGlzLmNsb3NlKClcbiAgICAgIH1cbiAgICApO1xuXG4gICAgdGhpcy5taW5pRWRpdG9yLnByZWVtcHQoJ3RleHRJbnB1dCcsIChlKSA9PiB7XG4gICAgICBpZiAoIWUub3JpZ2luYWxFdmVudC5kYXRhLm1hdGNoKC9bMC05XS8pKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHRvZ2dsZSgpIHtcbiAgICBpZiAodGhpcy5wYW5lbCAhPSBudWxsICYmIHRoaXMucGFuZWwuaXNWaXNpYmxlKCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNsb3NlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmF0dGFjaCgpO1xuICAgIH1cbiAgfVxuXG4gIGNsb3NlKCkge1xuICAgIHRoaXMubWluaUVkaXRvci5zZXRUZXh0KCcnKTtcbiAgICBpZiAodGhpcy5wYW5lbCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnBhbmVsLmhpZGUoKTtcbiAgICB9XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gIH1cblxuICBjb25maXJtKCkge1xuICAgIGxldCBwYWdlTnVtYmVyID0gdGhpcy5taW5pRWRpdG9yLmdldFRleHQoKTtcbiAgICBwYWdlTnVtYmVyID0gcGFyc2VJbnQocGFnZU51bWJlciwgMTApO1xuICAgIGxldCBwZGZWaWV3ID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKTtcblxuICAgIHRoaXMuY2xvc2UoKTtcblxuICAgIGlmIChwZGZWaWV3ICE9IG51bGwgJiYgcGRmVmlldy5wZGZEb2N1bWVudCAhPSBudWxsICYmIHBkZlZpZXcuc2Nyb2xsVG9QYWdlICE9IG51bGwpIHtcbiAgICAgIHBkZlZpZXcuc2Nyb2xsVG9QYWdlKHBhZ2VOdW1iZXIpO1xuICAgIH1cbiAgfVxuXG4gIGF0dGFjaCgpIHtcbiAgICBsZXQgcGRmVmlldyA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG5cbiAgICBpZiAocGRmVmlldyAhPSBudWxsICYmIHBkZlZpZXcucGRmRG9jdW1lbnQgIT0gbnVsbCAmJiBwZGZWaWV3LnNjcm9sbFRvUGFnZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLnBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7aXRlbTogdGhpc30pO1xuICAgICAgdGhpcy5tZXNzYWdlLnRleHQoYEVudGVyIGEgcGFnZSBudW1iZXIgMS0ke3BkZlZpZXcuZ2V0VG90YWxQYWdlTnVtYmVyKCl9YCk7XG4gICAgICB0aGlzLm1pbmlFZGl0b3IuZm9jdXMoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==