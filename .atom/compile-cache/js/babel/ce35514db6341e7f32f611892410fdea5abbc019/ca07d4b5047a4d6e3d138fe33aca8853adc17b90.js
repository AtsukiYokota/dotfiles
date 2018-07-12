"use babel";

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom-space-pen-views');

var View = _require.View;

var _require2 = require('atom');

var Disposable = _require2.Disposable;
var CompositeDisposable = _require2.CompositeDisposable;

var PdfStatusBarView = (function (_View) {
  _inherits(PdfStatusBarView, _View);

  _createClass(PdfStatusBarView, null, [{
    key: 'content',
    value: function content() {
      var _this = this;

      this.div({ 'class': 'status-image inline-block' }, function () {
        _this.a({ href: '#', 'class': 'pdf-status inline-block', outlet: 'pdfStatus' });
      });
    }
  }]);

  function PdfStatusBarView() {
    var _this2 = this;

    _classCallCheck(this, PdfStatusBarView);

    _get(Object.getPrototypeOf(PdfStatusBarView.prototype), 'constructor', this).call(this);

    this.attach();

    var disposables = new CompositeDisposable();

    var updatePageCallback = function updatePageCallback() {
      return _this2.updatePdfStatus();
    };

    disposables.add(atom.workspace.onDidChangeActivePaneItem(updatePageCallback));

    atom.views.getView(atom.workspace).addEventListener('pdf-view:current-page-update', updatePageCallback);

    disposables.add(new Disposable(function () {
      return window.removeEventListener('pdf-view:current-page-update', updatePageCallback);
    }));

    var clickCallback = function clickCallback() {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'pdf-view:go-to-page');
      return false;
    };

    var elem = this;

    elem.on('click', clickCallback);
    disposables.add(new Disposable(function () {
      return elem.off('click', clickCallback);
    }));
  }

  _createClass(PdfStatusBarView, [{
    key: 'attach',
    value: function attach() {
      var statusBar = document.querySelector("status-bar");

      if (statusBar != null) {
        this.statusBarTile = statusBar.addLeftTile({ item: this, priority: 100 });
      }
    }
  }, {
    key: 'attached',
    value: function attached() {
      this.updatePdfStatus();
    }
  }, {
    key: 'getPdfStatus',
    value: function getPdfStatus(view) {
      this.pdfStatus.text('Page: ' + view.currentPageNumber + '/' + view.totalPageNumber).show();
    }
  }, {
    key: 'updatePdfStatus',
    value: function updatePdfStatus() {
      var pdfView = atom.workspace.getActivePaneItem();

      if (pdfView != null && pdfView.pdfDocument != null) {
        this.getPdfStatus(pdfView);
      } else {
        this.pdfStatus.hide();
      }
    }
  }]);

  return PdfStatusBarView;
})(View);

exports['default'] = PdfStatusBarView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9wZGYtdmlldy9saWIvcGRmLXN0YXR1cy1iYXItdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7Ozs7O2VBRUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDOztJQUF2QyxJQUFJLFlBQUosSUFBSTs7Z0JBQytCLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQWxELFVBQVUsYUFBVixVQUFVO0lBQUUsbUJBQW1CLGFBQW5CLG1CQUFtQjs7SUFFZixnQkFBZ0I7WUFBaEIsZ0JBQWdCOztlQUFoQixnQkFBZ0I7O1dBQ3JCLG1CQUFHOzs7QUFDZixVQUFJLENBQUMsR0FBRyxDQUFDLEVBQUMsU0FBTywyQkFBMkIsRUFBQyxFQUFFLFlBQU07QUFDbkQsY0FBSyxDQUFDLENBQUMsRUFBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLFNBQU8seUJBQXlCLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUM7T0FDNUUsQ0FBQyxDQUFDO0tBQ0o7OztBQUVVLFdBUFEsZ0JBQWdCLEdBT3JCOzs7MEJBUEssZ0JBQWdCOztBQVFqQywrQkFSaUIsZ0JBQWdCLDZDQVF6Qjs7QUFFUixRQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7O0FBRWQsUUFBSSxXQUFXLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDOztBQUU1QyxRQUFJLGtCQUFrQixHQUFHLFNBQXJCLGtCQUFrQixHQUFTO0FBQzdCLGFBQU8sT0FBSyxlQUFlLEVBQUUsQ0FBQztLQUMvQixDQUFDOztBQUVGLGVBQVcsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx5QkFBeUIsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7O0FBRTlFLFFBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyw4QkFBOEIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDOztBQUV4RyxlQUFXLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDO2FBQU0sTUFBTSxDQUFDLG1CQUFtQixDQUFDLDhCQUE4QixFQUFFLGtCQUFrQixDQUFDO0tBQUEsQ0FBQyxDQUFDLENBQUM7O0FBRXRILFFBQUksYUFBYSxHQUFHLFNBQWhCLGFBQWEsR0FBUztBQUN4QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUscUJBQXFCLENBQUMsQ0FBQztBQUNsRixhQUFPLEtBQUssQ0FBQztLQUNkLENBQUM7O0FBRUYsUUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDOztBQUVoQixRQUFJLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNoQyxlQUFXLENBQUMsR0FBRyxDQUFDLElBQUksVUFBVSxDQUFDO2FBQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDO0tBQUEsQ0FBQyxDQUFDLENBQUM7R0FDekU7O2VBakNrQixnQkFBZ0I7O1dBbUM3QixrQkFBRztBQUNQLFVBQUksU0FBUyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRXJELFVBQUksU0FBUyxJQUFJLElBQUksRUFBRTtBQUNyQixZQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQyxXQUFXLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUMsQ0FBQyxDQUFDO09BQ3pFO0tBQ0Y7OztXQUVPLG9CQUFHO0FBQ1QsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0tBQ3hCOzs7V0FFVyxzQkFBQyxJQUFJLEVBQUU7QUFDakIsVUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLFlBQVUsSUFBSSxDQUFDLGlCQUFpQixTQUFJLElBQUksQ0FBQyxlQUFlLENBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUN2Rjs7O1dBRWMsMkJBQUc7QUFDaEIsVUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOztBQUVqRCxVQUFJLE9BQU8sSUFBSSxJQUFJLElBQUksT0FBTyxDQUFDLFdBQVcsSUFBSSxJQUFJLEVBQUU7QUFDbEQsWUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUM1QixNQUFNO0FBQ0wsWUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztPQUN2QjtLQUNGOzs7U0EzRGtCLGdCQUFnQjtHQUFTLElBQUk7O3FCQUE3QixnQkFBZ0IiLCJmaWxlIjoiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL3BkZi12aWV3L2xpYi9wZGYtc3RhdHVzLWJhci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcblxubGV0IHtWaWV3fSA9IHJlcXVpcmUoJ2F0b20tc3BhY2UtcGVuLXZpZXdzJyk7XG5sZXQge0Rpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSgnYXRvbScpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQZGZTdGF0dXNCYXJWaWV3IGV4dGVuZHMgVmlldyB7XG4gIHN0YXRpYyBjb250ZW50KCkge1xuICAgIHRoaXMuZGl2KHtjbGFzczogJ3N0YXR1cy1pbWFnZSBpbmxpbmUtYmxvY2snfSwgKCkgPT4ge1xuICAgICAgdGhpcy5hKHtocmVmOiAnIycsIGNsYXNzOiAncGRmLXN0YXR1cyBpbmxpbmUtYmxvY2snLCBvdXRsZXQ6ICdwZGZTdGF0dXMnfSk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5hdHRhY2goKTtcblxuICAgIGxldCBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG5cbiAgICBsZXQgdXBkYXRlUGFnZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgcmV0dXJuIHRoaXMudXBkYXRlUGRmU3RhdHVzKCk7XG4gICAgfTtcblxuICAgIGRpc3Bvc2FibGVzLmFkZChhdG9tLndvcmtzcGFjZS5vbkRpZENoYW5nZUFjdGl2ZVBhbmVJdGVtKHVwZGF0ZVBhZ2VDYWxsYmFjaykpO1xuXG4gICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKS5hZGRFdmVudExpc3RlbmVyKCdwZGYtdmlldzpjdXJyZW50LXBhZ2UtdXBkYXRlJywgdXBkYXRlUGFnZUNhbGxiYWNrKTtcblxuICAgIGRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncGRmLXZpZXc6Y3VycmVudC1wYWdlLXVwZGF0ZScsIHVwZGF0ZVBhZ2VDYWxsYmFjaykpKTtcblxuICAgIGxldCBjbGlja0NhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLCAncGRmLXZpZXc6Z28tdG8tcGFnZScpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG5cbiAgICBsZXQgZWxlbSA9IHRoaXM7XG5cbiAgICBlbGVtLm9uKCdjbGljaycsIGNsaWNrQ2FsbGJhY2spO1xuICAgIGRpc3Bvc2FibGVzLmFkZChuZXcgRGlzcG9zYWJsZSgoKSA9PiBlbGVtLm9mZignY2xpY2snLCBjbGlja0NhbGxiYWNrKSkpO1xuICB9XG5cbiAgYXR0YWNoKCkge1xuICAgIGxldCBzdGF0dXNCYXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwic3RhdHVzLWJhclwiKTtcblxuICAgIGlmIChzdGF0dXNCYXIgIT0gbnVsbCkge1xuICAgICAgdGhpcy5zdGF0dXNCYXJUaWxlID0gc3RhdHVzQmFyLmFkZExlZnRUaWxlKHtpdGVtOiB0aGlzLCBwcmlvcml0eTogMTAwfSk7XG4gICAgfVxuICB9XG5cbiAgYXR0YWNoZWQoKSB7XG4gICAgdGhpcy51cGRhdGVQZGZTdGF0dXMoKTtcbiAgfVxuXG4gIGdldFBkZlN0YXR1cyh2aWV3KSB7XG4gICAgdGhpcy5wZGZTdGF0dXMudGV4dChgUGFnZTogJHt2aWV3LmN1cnJlbnRQYWdlTnVtYmVyfS8ke3ZpZXcudG90YWxQYWdlTnVtYmVyfWApLnNob3coKTtcbiAgfVxuXG4gIHVwZGF0ZVBkZlN0YXR1cygpIHtcbiAgICBsZXQgcGRmVmlldyA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCk7XG5cbiAgICBpZiAocGRmVmlldyAhPSBudWxsICYmIHBkZlZpZXcucGRmRG9jdW1lbnQgIT0gbnVsbCkge1xuICAgICAgdGhpcy5nZXRQZGZTdGF0dXMocGRmVmlldyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucGRmU3RhdHVzLmhpZGUoKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==