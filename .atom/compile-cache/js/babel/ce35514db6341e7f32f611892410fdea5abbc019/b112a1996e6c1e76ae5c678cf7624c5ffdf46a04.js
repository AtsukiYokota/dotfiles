"use babel";

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x6, _x7, _x8) { var _again = true; _function: while (_again) { var object = _x6, property = _x7, receiver = _x8; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x6 = parent; _x7 = property; _x8 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _require = require('atom-space-pen-views');

var $ = _require.$;
var ScrollView = _require.ScrollView;

var _require2 = require('atom');

var Point = _require2.Point;

var fs = require('fs-plus');
var path = require('path');
var _ = require('underscore-plus');

var _require3 = require('atom');

var File = _require3.File;
var Disposable = _require3.Disposable;
var CompositeDisposable = _require3.CompositeDisposable;

var _require4 = require('loophole');

var Function = _require4.Function;

global.Function = Function;

global.PDFJS = { workerSrc: "temp", cMapUrl: "temp", cMapPacked: true };
require('./../node_modules/pdfjs-dist/build/pdf.js');
PDFJS.workerSrc = "file://" + path.resolve(__dirname, "../node_modules/pdfjs-dist/build/pdf.worker.js");
PDFJS.cMapUrl = "file://" + path.resolve(__dirname, "../node_modules/pdfjs-dist/cmaps") + "/";

var _require5 = require('child_process');

var exec = _require5.exec;
var execFile = _require5.execFile;

var PdfEditorView = (function (_ScrollView) {
  _inherits(PdfEditorView, _ScrollView);

  _createClass(PdfEditorView, null, [{
    key: 'content',
    value: function content() {
      var _this = this;

      this.div({ 'class': 'pdf-view', tabindex: -1 }, function () {
        _this.div({ outlet: 'container', style: 'position: relative' });
      });
    }
  }]);

  function PdfEditorView(filePath) {
    var scale = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

    var _this2 = this;

    var scrollTop = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
    var scrollLeft = arguments.length <= 3 || arguments[3] === undefined ? 0 : arguments[3];

    _classCallCheck(this, PdfEditorView);

    _get(Object.getPrototypeOf(PdfEditorView.prototype), 'constructor', this).call(this);

    this.currentScale = scale ? scale : 1.5;
    this.defaultScale = 1.5;
    this.scaleFactor = 10.0;
    this.fitToWidthOnOpen = !scale && atom.config.get('pdf-view.fitToWidthOnOpen');

    this.filePath = filePath;
    this.file = new File(this.filePath);
    this.scrollTopBeforeUpdate = scrollTop;
    this.scrollLeftBeforeUpdate = scrollLeft;
    this.canvases = [];
    this.updating = false;

    this.updatePdf(true);

    this.pdfViewElements = [];
    this.binaryViewEditor = null;

    this.currentPageNumber = 0;
    this.totalPageNumber = 0;
    this.centersBetweenPages = [];
    this.pageHeights = [];
    this.maxPageWidth = 0;
    this.toScaleFactor = 1.0;
    this.dragging = null;

    var disposables = new CompositeDisposable();

    var needsUpdateCallback = function needsUpdateCallback() {
      if (_this2.updating) {
        _this2.needsUpdate = true;
      } else {
        _this2.updatePdf();
      }
    };

    var toggleNightModeCallback = function toggleNightModeCallback() {
      _this2.setNightMode();
    };

    disposables.add(atom.config.onDidChange('pdf-view.nightMode', toggleNightModeCallback));
    disposables.add(atom.config.onDidChange('pdf-view.reverseSyncBehaviour', needsUpdateCallback));

    disposables.add(this.file.onDidChange(function () {
      if (atom.config.get('pdf-view.autoReloadOnUpdate')) {
        needsUpdateCallback();
      } else {
        _this2.fileUpdated = true;
      }
    }));

    var autoReloadDisposable = undefined;
    var setupAutoReload = function setupAutoReload() {
      if (!atom.config.get('pdf-view.autoReloadOnUpdate')) {
        autoReloadDisposable = atom.workspace.onDidOpen(function (e) {
          if (e.item == _this2 && _this2.fileUpdated) {
            _this2.fileUpdated = false;
            needsUpdateCallback();
          }
        });
      } else {
        if (autoReloadDisposable) {
          disposables.remove(autoReloadDisposable);
          autoReloadDisposable.dispose();
        }

        if (_this2.fileUpdated) {
          _this2.fileUpdated = false;
          needsUpdateCallback();
        }
      }
    };
    disposables.add(atom.config.observe('pdf-view.autoReloadOnUpdate', setupAutoReload));

    var moveLeftCallback = function moveLeftCallback() {
      return _this2.scrollLeft(_this2.scrollLeft() - $(window).width() / 20);
    };
    var moveRightCallback = function moveRightCallback() {
      return _this2.scrollRight(_this2.scrollRight() + $(window).width() / 20);
    };
    var scrollCallback = function scrollCallback() {
      return _this2.onScroll();
    };
    var resizeHandler = function resizeHandler() {
      return _this2.setCurrentPageNumber();
    };

    atom.commands.add('.pdf-view', {
      'core:move-left': moveLeftCallback,
      'core:move-right': moveRightCallback
    });

    this.on('scroll', scrollCallback);
    $(window).on('resize', resizeHandler);

    disposables.add(new Disposable(function () {
      $(window).off('scroll', scrollCallback);
      $(window).off('resize', resizeHandler);
    }));

    atom.commands.add('atom-workspace', {
      'pdf-view:zoom-fit': function pdfViewZoomFit() {
        if (_this2.hasFocus()) {
          _this2.zoomFit();
        }
      },
      'pdf-view:zoom-in': function pdfViewZoomIn() {
        if (_this2.hasFocus()) {
          _this2.zoomIn();
        }
      },
      'pdf-view:zoom-out': function pdfViewZoomOut() {
        if (_this2.hasFocus()) {
          _this2.zoomOut();
        }
      },
      'pdf-view:reset-zoom': function pdfViewResetZoom() {
        if (_this2.hasFocus()) {
          _this2.resetZoom();
        }
      },
      'pdf-view:go-to-next-page': function pdfViewGoToNextPage() {
        if (_this2.hasFocus()) {
          _this2.goToNextPage();
        }
      },
      'pdf-view:go-to-previous-page': function pdfViewGoToPreviousPage() {
        if (_this2.hasFocus()) {
          _this2.goToPreviousPage();
        }
      },
      'pdf-view:reload': function pdfViewReload() {
        _this2.updatePdf(true);
      }
    });

    this.onMouseMove = function (e) {
      if (_this2.binaryView) {
        return;
      }
      if (_this2.dragging) {
        _this2.simpleClick = false;

        _this2.scrollTop(_this2.dragging.scrollTop - (e.screenY - _this2.dragging.y));
        _this2.scrollLeft(_this2.dragging.scrollLeft - (e.screenX - _this2.dragging.x));
        e.preventDefault();
      }
    };

    this.onMouseUp = function (e) {
      if (_this2.binaryView) {
        return;
      }
      _this2.dragging = null;
      $(document).unbind('mousemove', _this2.onMouseMove);
      $(document).unbind('mouseup', _this2.onMouseUp);
      e.preventDefault();
    };

    this.on('mousedown', function (e) {
      if (_this2.binaryView) {
        return;
      }
      _this2.simpleClick = true;
      atom.workspace.paneForItem(_this2).activate();
      _this2.dragging = { x: e.screenX, y: e.screenY, scrollTop: _this2.scrollTop(), scrollLeft: _this2.scrollLeft() };
      $(document).on('mousemove', _this2.onMouseMove);
      $(document).on('mouseup', _this2.onMouseUp);
      e.preventDefault();
    });

    this.on('mousewheel', function (e) {
      if (_this2.binaryView) {
        return;
      }
      if (e.ctrlKey) {
        e.preventDefault();
        if (e.originalEvent.wheelDelta > 0) {
          _this2.zoomIn();
        } else if (e.originalEvent.wheelDelta < 0) {
          _this2.zoomOut();
        }
      }
    });
  }

  _createClass(PdfEditorView, [{
    key: 'hasFocus',
    value: function hasFocus() {
      return !this.binaryView && atom.workspace.getActivePaneItem() === this;
    }
  }, {
    key: 'setNightMode',
    value: function setNightMode() {
      if (atom.config.get('pdf-view.nightMode')) {
        this.addClass('night-mode');
      } else {
        this.removeClass('night-mode');
      }
    }
  }, {
    key: 'reverseSync',
    value: function reverseSync(page, e) {
      var _this3 = this;

      if (this.simpleClick) {
        e.preventDefault();
        this.pdfDocument.getPage(page).then(function (pdfPage) {
          var viewport = pdfPage.getViewport(_this3.currentScale);
          var x = undefined,
              y = undefined;

          var _viewport$convertToPdfPoint = viewport.convertToPdfPoint(e.offsetX, $(_this3.canvases[page - 1]).height() - e.offsetY);

          var _viewport$convertToPdfPoint2 = _slicedToArray(_viewport$convertToPdfPoint, 2);

          x = _viewport$convertToPdfPoint2[0];
          y = _viewport$convertToPdfPoint2[1];

          var callback = function callback(error, stdout, stderr) {
            if (!error) {
              stdout = stdout.replace(/\r\n/g, '\n');
              var attrs = {};
              for (var _line of stdout.split('\n')) {
                var m = _line.match(/^([a-zA-Z]*):(.*)$/);
                if (m) {
                  attrs[m[1]] = m[2];
                }
              }

              var file = attrs.Input;
              var line = attrs.Line;

              if (file && line) {
                var editor = null;
                var pathToOpen = path.normalize(attrs.Input);
                var lineToOpen = +attrs.Line;
                var done = false;
                for (var _editor of atom.workspace.getTextEditors()) {
                  if (_editor.getPath() === pathToOpen) {
                    var position = new Point(lineToOpen - 1, -1);
                    _editor.scrollToBufferPosition(position, { center: true });
                    _editor.setCursorBufferPosition(position);
                    _editor.moveToFirstCharacterOfLine();
                    var pane = atom.workspace.paneForItem(_editor);
                    pane.activateItem(_editor);
                    pane.activate();
                    done = true;
                    break;
                  }
                }

                if (!done) {
                  var paneopt = atom.config.get('pdf-view.paneToUseInSynctex');
                  atom.workspace.open(pathToOpen, { initialLine: lineToOpen, initialColumn: 0, split: paneopt });
                }
              }
            }
          };

          var synctexPath = atom.config.get('pdf-view.syncTeXPath');
          var clickspec = [page, x, y, _this3.filePath].join(':');

          if (synctexPath) {
            execFile(synctexPath, ["edit", "-o", clickspec], callback);
          } else {
            var cmd = 'synctex edit -o "' + clickspec + '"';
            exec(cmd, callback);
          }
        });
      }
    }
  }, {
    key: 'forwardSync',
    value: function forwardSync(texPath, lineNumber) {
      var _this4 = this;

      if (this.updating) {
        this.forwardSyncAfterUpdate = {
          texPath: texPath,
          lineNumber: lineNumber
        };
        return;
      }

      var callback = function callback(error, stdout, stderr) {
        if (!error) {
          var _ret = (function () {
            stdout = stdout.replace(/\r\n/g, '\n');
            var attrs = {};
            for (var line of stdout.split('\n')) {
              var m = line.match(/^([a-zA-Z]*):(.*)$/);
              if (m) {
                if (m[1] in attrs) {
                  break;
                }

                attrs[m[1]] = m[2];
              }
            }

            var page = parseInt(attrs.Page);

            if (!_this4.pdfDocument) {
              return {
                v: undefined
              };
            }

            if (page > _this4.pdfDocument.numPages) {
              return {
                v: undefined
              };
            }

            _this4.pdfDocument.getPage(page).then(function (pdfPage) {
              var viewport = pdfPage.getViewport(_this4.currentScale);
              var canvas = _this4.canvases[page - 1];

              var x = parseFloat(attrs.x);
              var y = parseFloat(attrs.y);

              var _viewport$convertToViewportPoint = viewport.convertToViewportPoint(x, y);

              var _viewport$convertToViewportPoint2 = _slicedToArray(_viewport$convertToViewportPoint, 2);

              x = _viewport$convertToViewportPoint2[0];
              y = _viewport$convertToViewportPoint2[1];

              x = x + canvas.offsetLeft;
              y = viewport.height - y + canvas.offsetTop;

              var visibilityThreshold = 50;

              // Scroll
              if (y < _this4.scrollTop() + visibilityThreshold) {
                _this4.scrollTop(y - visibilityThreshold);
              } else if (y > _this4.scrollBottom() - visibilityThreshold) {
                _this4.scrollBottom(y + visibilityThreshold);
              }

              if (x < _this4.scrollLeft() + visibilityThreshold) {
                _this4.scrollLeft(x - visibilityThreshold);
              } else if (x > _this4.scrollRight() - visibilityThreshold) {
                _this4.scrollBottom(x + visibilityThreshold);
              }

              // Show highlighter
              $('<div/>', {
                'class': "tex-highlight",
                style: 'top: ' + y + 'px; left: ' + x + 'px;'
              }).appendTo(_this4.container).on('animationend', function () {
                $(this).remove();
              });
            });
          })();

          if (typeof _ret === 'object') return _ret.v;
        }
      };

      var synctexPath = atom.config.get('pdf-view.syncTeXPath');
      var inputspec = [lineNumber, 0, texPath].join(':');

      if (synctexPath) {
        execFile(synctexPath, ["view", "-i", inputspec, "-o", this.filePath], callback);
      } else {
        var cmd = 'synctex view -i "' + inputspec + '" -o "' + this.filePath + '"';
        exec(cmd, callback);
      }
    }
  }, {
    key: 'onScroll',
    value: function onScroll() {
      if (this.binaryView) {
        return;
      }

      if (!this.updating) {
        this.scrollTopBeforeUpdate = this.scrollTop();
        this.scrollLeftBeforeUpdate = this.scrollLeft();
      }

      this.setCurrentPageNumber();
    }
  }, {
    key: 'setCurrentPageNumber',
    value: function setCurrentPageNumber() {
      if (!this.pdfDocument || this.binaryView) {
        return;
      }

      var center = (this.scrollBottom() + this.scrollTop()) / 2.0;
      this.currentPageNumber = 1;

      if (this.centersBetweenPages.length === 0 && this.pageHeights.length === this.pdfDocument.numPages) for (var pdfPageNumber of _.range(1, this.pdfDocument.numPages + 1)) {
        this.centersBetweenPages.push(this.pageHeights.slice(0, pdfPageNumber).reduce(function (x, y) {
          return x + y;
        }, 0) + pdfPageNumber * 20 - 10);
      }

      for (var pdfPageNumber of _.range(2, this.pdfDocument.numPages + 1)) {
        if (center >= this.centersBetweenPages[pdfPageNumber - 2] && center < this.centersBetweenPages[pdfPageNumber - 1]) {
          this.currentPageNumber = pdfPageNumber;
        }
      }

      atom.views.getView(atom.workspace).dispatchEvent(new Event('pdf-view:current-page-update'));
    }
  }, {
    key: 'finishUpdate',
    value: function finishUpdate() {
      this.updating = false;
      if (this.needsUpdate) {
        this.updatePdf();
      }
      if (this.toScaleFactor != 1) {
        this.adjustSize(1);
      }
      if (this.scrollToPageAfterUpdate) {
        this.scrollToPage(this.scrollToPageAfterUpdate);
        delete this.scrollToPageAfterUpdate;
      }
      if (this.scrollToNamedDestAfterUpdate) {
        this.scrollToNamedDest(this.scrollToNamedDestAfterUpdate);
        delete this.scrollToNamedDestAfterUpdate;
      }
      if (this.forwardSyncAfterUpdate) {
        this.forwardSync(this.forwardSyncAfterUpdate.texPath, this.forwardSyncAfterUpdate.lineNumber);
        delete this.forwardSyncAfterUpdate;
      }
    }
  }, {
    key: 'updatePdf',
    value: function updatePdf() {
      var _this5 = this;

      var closeOnError = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      this.needsUpdate = false;

      if (!fs.existsSync(this.filePath)) {
        return;
      }

      var pdfData = null;

      try {
        pdfData = new Uint8Array(fs.readFileSync(this.filePath));
      } catch (error) {
        if (error.code === 'ENOENT') {
          return;
        }
      }

      this.updating = true;

      var reverseSyncClicktype = null;
      switch (atom.config.get('pdf-view.reverseSyncBehaviour')) {
        case 'Click':
          reverseSyncClicktype = 'click';
          break;
        case 'Double click':
          reverseSyncClicktype = 'dblclick';
          break;
      }

      this.setNightMode();

      PDFJS.getDocument(pdfData).then(function (pdfDocument) {
        _this5.container.find("canvas").remove();
        _this5.canvases = [];
        _this5.pageHeights = [];

        _this5.pdfDocument = pdfDocument;
        _this5.totalPageNumber = _this5.pdfDocument.numPages;

        var _loop = function (pdfPageNumber) {
          var canvas = $("<canvas/>", { 'class': "page-container" }).appendTo(_this5.container)[0];
          _this5.canvases.push(canvas);
          _this5.pageHeights.push(0);
          if (reverseSyncClicktype) {
            $(canvas).on(reverseSyncClicktype, function (e) {
              return _this5.reverseSync(pdfPageNumber, e);
            });
          }
        };

        for (var pdfPageNumber of _.range(1, _this5.pdfDocument.numPages + 1)) {
          _loop(pdfPageNumber);
        }

        _this5.maxPageWidth = 0;

        if (_this5.fitToWidthOnOpen) {
          Promise.all(_.range(1, _this5.pdfDocument.numPages + 1).map(function (pdfPageNumber) {
            return _this5.pdfDocument.getPage(pdfPageNumber).then(function (pdfPage) {
              return pdfPage.getViewport(1.0).width;
            });
          })).then(function (pdfPageWidths) {
            _this5.maxPageWidth = Math.max.apply(Math, _toConsumableArray(pdfPageWidths));
            _this5.renderPdf();
          });
        } else {
          _this5.renderPdf();
        }
      }, function () {
        if (closeOnError) {
          atom.notifications.addError(_this5.filePath + " is not a PDF file.");
          atom.workspace.paneForItem(_this5).destroyItem(_this5);
        } else {
          _this5.finishUpdate();
        }
      });
    }
  }, {
    key: 'renderPdf',
    value: function renderPdf() {
      var _this6 = this;

      var scrollAfterRender = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      this.centersBetweenPages = [];

      if (this.fitToWidthOnOpen) {
        this.currentScale = this[0].clientWidth / this.maxPageWidth;
        this.fitToWidthOnOpen = false;
      }

      Promise.all(_.range(1, this.pdfDocument.numPages + 1).map(function (pdfPageNumber) {
        var canvas = _this6.canvases[pdfPageNumber - 1];

        return _this6.pdfDocument.getPage(pdfPageNumber).then(function (pdfPage) {
          var viewport = pdfPage.getViewport(_this6.currentScale);
          var context = canvas.getContext('2d');

          var outputScale = window.devicePixelRatio;
          canvas.height = Math.floor(viewport.height) * outputScale;
          canvas.width = Math.floor(viewport.width) * outputScale;

          context._scaleX = outputScale;
          context._scaleY = outputScale;
          context.scale(outputScale, outputScale);
          context._transformMatrix = [outputScale, 0, 0, outputScale, 0, 0];
          canvas.style.width = Math.floor(viewport.width) + 'px';
          canvas.style.height = Math.floor(viewport.height) + 'px';

          _this6.pageHeights[pdfPageNumber - 1] = Math.floor(viewport.height);

          return pdfPage.render({ canvasContext: context, viewport: viewport });
        });
      })).then(function (renderTasks) {
        if (scrollAfterRender) {
          _this6.scrollTop(_this6.scrollTopBeforeUpdate);
          _this6.scrollLeft(_this6.scrollLeftBeforeUpdate);
          _this6.setCurrentPageNumber();
        }
        Promise.all(renderTasks).then(function () {
          return _this6.finishUpdate();
        });
      }, function () {
        return _this6.finishUpdate();
      });
    }
  }, {
    key: 'computeMaxPageWidthAndTryZoomFit',
    value: function computeMaxPageWidthAndTryZoomFit() {
      var _this7 = this;

      Promise.all(_.range(1, this.pdfDocument.numPages + 1).map(function (pdfPageNumber) {
        return _this7.pdfDocument.getPage(pdfPageNumber).then(function (pdfPage) {
          return pdfPage.getViewport(1.0).width;
        });
      })).then(function (pdfPageWidths) {
        _this7.maxPageWidth = Math.max.apply(Math, _toConsumableArray(pdfPageWidths));
        _this7.zoomFit();
      });
    }
  }, {
    key: 'zoomFit',
    value: function zoomFit() {
      if (this.maxPageWidth == 0) {
        this.computeMaxPageWidthAndTryZoomFit();
        return;
      }
      var fitScale = this[0].clientWidth / this.maxPageWidth;
      return this.adjustSize(fitScale / (this.currentScale * this.toScaleFactor));
    }
  }, {
    key: 'zoomOut',
    value: function zoomOut() {
      return this.adjustSize(100 / (100 + this.scaleFactor));
    }
  }, {
    key: 'zoomIn',
    value: function zoomIn() {
      return this.adjustSize((100 + this.scaleFactor) / 100);
    }
  }, {
    key: 'resetZoom',
    value: function resetZoom() {
      return this.adjustSize(this.defaultScale / this.currentScale);
    }
  }, {
    key: 'goToNextPage',
    value: function goToNextPage() {
      return this.scrollToPage(this.currentPageNumber + 1);
    }
  }, {
    key: 'goToPreviousPage',
    value: function goToPreviousPage() {
      return this.scrollToPage(this.currentPageNumber - 1);
    }
  }, {
    key: 'computeZoomedScrollTop',
    value: function computeZoomedScrollTop(oldScrollTop, oldPageHeights) {
      var pixelsToZoom = 0;
      var spacesToSkip = 0;
      var zoomedPixels = 0;

      for (var pdfPageNumber of _.range(0, this.pdfDocument.numPages)) {
        if (pixelsToZoom + spacesToSkip + oldPageHeights[pdfPageNumber] > oldScrollTop) {
          zoomFactorForPage = this.pageHeights[pdfPageNumber] / oldPageHeights[pdfPageNumber];
          var partOfPageAboveUpperBorder = oldScrollTop - (pixelsToZoom + spacesToSkip);
          zoomedPixels += Math.round(partOfPageAboveUpperBorder * zoomFactorForPage);
          pixelsToZoom += partOfPageAboveUpperBorder;
          break;
        } else {
          pixelsToZoom += oldPageHeights[pdfPageNumber];
          zoomedPixels += this.pageHeights[pdfPageNumber];
        }

        if (pixelsToZoom + spacesToSkip + 20 > oldScrollTop) {
          var partOfPaddingAboveUpperBorder = oldScrollTop - (pixelsToZoom + spacesToSkip);
          spacesToSkip += partOfPaddingAboveUpperBorder;
          break;
        } else {
          spacesToSkip += 20;
        }
      }

      return zoomedPixels + spacesToSkip;
    }
  }, {
    key: 'adjustSize',
    value: function adjustSize(factor) {
      var _this8 = this;

      if (!this.pdfDocument) {
        return;
      }

      factor = this.toScaleFactor * factor;

      if (this.updating) {
        this.toScaleFactor = factor;
        return;
      }

      this.updating = true;
      this.toScaleFactor = 1;

      var oldScrollTop = this.scrollTop();
      var oldPageHeights = this.pageHeights.slice(0);
      this.currentScale = this.currentScale * factor;
      this.renderPdf(false);

      process.nextTick(function () {
        var newScrollTop = _this8.computeZoomedScrollTop(oldScrollTop, oldPageHeights);
        _this8.scrollTop(newScrollTop);
      });

      process.nextTick(function () {
        var newScrollLeft = _this8.scrollLeft() * factor;
        _this8.scrollLeft(newScrollLeft);
      });
    }
  }, {
    key: 'getCurrentPageNumber',
    value: function getCurrentPageNumber() {
      return this.currentPageNumber;
    }
  }, {
    key: 'getTotalPageNumber',
    value: function getTotalPageNumber() {
      return this.totalPageNumber;
    }
  }, {
    key: 'scrollToPage',
    value: function scrollToPage(pdfPageNumber) {
      if (this.updating) {
        this.scrollToPageAfterUpdate = pdfPageNumber;
        return;
      }

      if (!this.pdfDocument || isNaN(pdfPageNumber)) {
        return;
      }

      pdfPageNumber = Math.min(pdfPageNumber, this.pdfDocument.numPages);
      pageScrollPosition = this.pageHeights.slice(0, pdfPageNumber - 1).reduce(function (x, y) {
        return x + y;
      }, 0) + (pdfPageNumber - 1) * 20;

      return this.scrollTop(pageScrollPosition);
    }
  }, {
    key: 'scrollToNamedDest',
    value: function scrollToNamedDest(namedDest) {
      var _this9 = this;

      if (this.updating) {
        this.scrollToNamedDestAfterUpdate = namedDest;
        return;
      }

      if (!this.pdfDocument) {
        return;
      }

      this.pdfDocument.getDestination(namedDest).then(function (destRef) {
        return _this9.pdfDocument.getPageIndex(destRef[0]);
      }).then(function (pageNumber) {
        return _this9.scrollToPage(pageNumber + 1);
      })['catch'](function () {
        return atom.notifications.addError('Cannot find named destination ' + namedDest + '.');
      });
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        filePath: this.filePath,
        scale: this.currentScale,
        scrollTop: this.scrollTopBeforeUpdate,
        scrollLeft: this.scrollLeftBeforeUpdate,
        deserializer: 'PdfEditorDeserializer'
      };
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      if (this.filePath) {
        return path.basename(this.filePath);
      } else {
        return 'untitled';
      }
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      return this.filePath;
    }
  }, {
    key: 'getPath',
    value: function getPath() {
      return this.filePath;
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      return this.detach();
    }
  }, {
    key: 'onDidChangeTitle',
    value: function onDidChangeTitle() {
      return new Disposable(function () {
        return null;
      });
    }
  }, {
    key: 'onDidChangeModified',
    value: function onDidChangeModified() {
      return new Disposable(function () {
        return null;
      });
    }
  }, {
    key: 'binaryView',
    get: function get() {
      return this.hasClass('binary-view');
    },
    set: function set(enabled) {
      var container = this.container[0];
      if (!!enabled === this.binaryView) {
        return;
      }
      if (!this.binaryViewEditor) {
        var _require6 = require('atom');

        var TextBuffer = _require6.TextBuffer;
        var TextEditor = _require6.TextEditor;

        var buffer = TextBuffer.loadSync(this.filePath);
        this.binaryViewEditor = new TextEditor({ buffer: buffer, readOnly: true });
      }
      if (enabled) {
        this.addClass('binary-view');
        for (var el of Array.from(container.children)) {
          container.removeChild(el);
          this.pdfViewElements.push(el);
        }
        container.appendChild(this.binaryViewEditor.element);
      } else {
        this.removeClass('binary-view');
        container.removeChild(this.binaryViewEditor.element);
        while (this.pdfViewElements.length) {
          container.appendChild(this.pdfViewElements.shift());
        }
      }
    }
  }]);

  return PdfEditorView;
})(ScrollView);

exports['default'] = PdfEditorView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9wZGYtdmlldy9saWIvcGRmLWVkaXRvci12aWV3LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O2VBRVUsT0FBTyxDQUFDLHNCQUFzQixDQUFDOztJQUFoRCxDQUFDLFlBQUQsQ0FBQztJQUFFLFVBQVUsWUFBVixVQUFVOztnQkFDSixPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLGFBQUwsS0FBSzs7QUFDVixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDNUIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNCLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDOztnQkFDVyxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4RCxJQUFJLGFBQUosSUFBSTtJQUFFLFVBQVUsYUFBVixVQUFVO0lBQUUsbUJBQW1CLGFBQW5CLG1CQUFtQjs7Z0JBQ3pCLE9BQU8sQ0FBQyxVQUFVLENBQUM7O0lBQS9CLFFBQVEsYUFBUixRQUFROztBQUNiLE1BQU0sQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDOztBQUUzQixNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBQyxJQUFJLEVBQUMsQ0FBQztBQUNwRSxPQUFPLENBQUMsMkNBQTJDLENBQUMsQ0FBQztBQUNyRCxLQUFLLENBQUMsU0FBUyxHQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsRUFBRSxnREFBZ0QsQ0FBQyxDQUFDO0FBQ3hHLEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLGtDQUFrQyxDQUFDLEdBQUMsR0FBRyxDQUFDOztnQkFDckUsT0FBTyxD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U0FBUyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0FBQy9DLG1CQUFTLENBQUMsV0FBVyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFCLGNBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQy9CO0FBQ0QsaUJBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ3RELE1BQ0k7QUFDSCxZQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2hDLGlCQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNyRCxlQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFO0FBQ2xDLG1CQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztTQUNyRDtPQUNGO0tBQ0Y7OztTQXhOa0IsYUFBYTtHQUFTLFVBQVU7O3FCQUFoQyxhQUFhIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9wZGYtdmlldy9saWIvcGRmLWVkaXRvci12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2UgYmFiZWxcIjtcblxubGV0IHskLCBTY3JvbGxWaWV3fSA9IHJlcXVpcmUoJ2F0b20tc3BhY2UtcGVuLXZpZXdzJyk7XG5sZXQge1BvaW50fSA9IHJlcXVpcmUoJ2F0b20nKTtcbmxldCBmcyA9IHJlcXVpcmUoJ2ZzLXBsdXMnKTtcbmxldCBwYXRoID0gcmVxdWlyZSgncGF0aCcpO1xubGV0IF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlLXBsdXMnKTtcbmxldCB7RmlsZSwgRGlzcG9zYWJsZSwgQ29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5sZXQge0Z1bmN0aW9ufSA9IHJlcXVpcmUoJ2xvb3Bob2xlJyk7XG5nbG9iYWwuRnVuY3Rpb24gPSBGdW5jdGlvbjtcblxuZ2xvYmFsLlBERkpTID0ge3dvcmtlclNyYzogXCJ0ZW1wXCIsIGNNYXBVcmw6XCJ0ZW1wXCIsIGNNYXBQYWNrZWQ6dHJ1ZX07XG5yZXF1aXJlKCcuLy4uL25vZGVfbW9kdWxlcy9wZGZqcy1kaXN0L2J1aWxkL3BkZi5qcycpO1xuUERGSlMud29ya2VyU3JjID0gXCJmaWxlOi8vXCIgKyBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL25vZGVfbW9kdWxlcy9wZGZqcy1kaXN0L2J1aWxkL3BkZi53b3JrZXIuanNcIik7XG5QREZKUy5jTWFwVXJsID0gXCJmaWxlOi8vXCIgKyBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4uL25vZGVfbW9kdWxlcy9wZGZqcy1kaXN0L2NtYXBzXCIpK1wiL1wiO1xubGV0IHtleGVjLCBleGVjRmlsZX0gPSByZXF1aXJlKCdjaGlsZF9wcm9jZXNzJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBkZkVkaXRvclZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3IHtcbiAgc3RhdGljIGNvbnRlbnQoKSB7XG4gICAgdGhpcy5kaXYoe2NsYXNzOiAncGRmLXZpZXcnLCB0YWJpbmRleDogLTF9LCAoKSA9PiB7XG4gICAgICB0aGlzLmRpdih7b3V0bGV0OiAnY29udGFpbmVyJywgc3R5bGU6ICdwb3NpdGlvbjogcmVsYXRpdmUnfSk7XG4gICAgfSk7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihmaWxlUGF0aCwgc2NhbGUgPSBudWxsLCBzY3JvbGxUb3AgPSAwLCBzY3JvbGxMZWZ0ID0gMCkge1xuICAgIHN1cGVyKCk7XG5cbiAgICB0aGlzLmN1cnJlbnRTY2FsZSA9IHNjYWxlID8gc2NhbGUgOiAxLjU7XG4gICAgdGhpcy5kZWZhdWx0U2NhbGUgPSAxLjU7XG4gICAgdGhpcy5zY2FsZUZhY3RvciA9IDEwLjA7XG4gICAgdGhpcy5maXRUb1dpZHRoT25PcGVuID0gIXNjYWxlICYmIGF0b20uY29uZmlnLmdldCgncGRmLXZpZXcuZml0VG9XaWR0aE9uT3BlbicpO1xuXG4gICAgdGhpcy5maWxlUGF0aCA9IGZpbGVQYXRoO1xuICAgIHRoaXMuZmlsZSA9IG5ldyBGaWxlKHRoaXMuZmlsZVBhdGgpO1xuICAgIHRoaXMuc2Nyb2xsVG9wQmVmb3JlVXBkYXRlID0gc2Nyb2xsVG9wO1xuICAgIHRoaXMuc2Nyb2xsTGVmdEJlZm9yZVVwZGF0ZSA9IHNjcm9sbExlZnQ7XG4gICAgdGhpcy5jYW52YXNlcyA9IFtdO1xuICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcblxuICAgIHRoaXMudXBkYXRlUGRmKHRydWUpO1xuXG4gICAgdGhpcy5wZGZWaWV3RWxlbWVudHMgPSBbXTtcbiAgICB0aGlzLmJpbmFyeVZpZXdFZGl0b3IgPSBudWxsO1xuXG4gICAgdGhpcy5jdXJyZW50UGFnZU51bWJlciA9IDA7XG4gICAgdGhpcy50b3RhbFBhZ2VOdW1iZXIgPSAwO1xuICAgIHRoaXMuY2VudGVyc0JldHdlZW5QYWdlcyA9IFtdO1xuICAgIHRoaXMucGFnZUhlaWdodHMgPSBbXTtcbiAgICB0aGlzLm1heFBhZ2VXaWR0aCA9IDA7XG4gICAgdGhpcy50b1NjYWxlRmFjdG9yID0gMS4wO1xuICAgIHRoaXMuZHJhZ2dpbmcgPSBudWxsO1xuXG4gICAgbGV0IGRpc3Bvc2FibGVzID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcblxuICAgIGxldCBuZWVkc1VwZGF0ZUNhbGxiYWNrID0gKCkgPT4ge1xuICAgICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgICAgdGhpcy5uZWVkc1VwZGF0ZSA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVwZGF0ZVBkZigpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB0b2dnbGVOaWdodE1vZGVDYWxsYmFjayA9ICgpID0+IHtcbiAgICAgIHRoaXMuc2V0TmlnaHRNb2RlKCk7XG4gICAgfVxuXG4gICAgZGlzcG9zYWJsZXMuYWRkKGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlKCdwZGYtdmlldy5uaWdodE1vZGUnLCB0b2dnbGVOaWdodE1vZGVDYWxsYmFjaykpO1xuICAgIGRpc3Bvc2FibGVzLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgncGRmLXZpZXcucmV2ZXJzZVN5bmNCZWhhdmlvdXInLCBuZWVkc1VwZGF0ZUNhbGxiYWNrKSk7XG5cbiAgICBkaXNwb3NhYmxlcy5hZGQodGhpcy5maWxlLm9uRGlkQ2hhbmdlKCgpID0+IHtcbiAgICAgIGlmIChhdG9tLmNvbmZpZy5nZXQoJ3BkZi12aWV3LmF1dG9SZWxvYWRPblVwZGF0ZScpKSB7XG4gICAgICAgIG5lZWRzVXBkYXRlQ2FsbGJhY2soKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZmlsZVVwZGF0ZWQgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pKTtcblxuICAgIGxldCBhdXRvUmVsb2FkRGlzcG9zYWJsZTtcbiAgICBsZXQgc2V0dXBBdXRvUmVsb2FkID0gKCkgPT4ge1xuICAgICAgaWYgKCFhdG9tLmNvbmZpZy5nZXQoJ3BkZi12aWV3LmF1dG9SZWxvYWRPblVwZGF0ZScpKSB7XG4gICAgICAgIGF1dG9SZWxvYWREaXNwb3NhYmxlID0gYXRvbS53b3Jrc3BhY2Uub25EaWRPcGVuKChlKSA9PiB7XG4gICAgICAgICAgaWYgKGUuaXRlbSA9PSB0aGlzICYmIHRoaXMuZmlsZVVwZGF0ZWQpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsZVVwZGF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIG5lZWRzVXBkYXRlQ2FsbGJhY2soKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYoYXV0b1JlbG9hZERpc3Bvc2FibGUpIHtcbiAgICAgICAgICBkaXNwb3NhYmxlcy5yZW1vdmUoYXV0b1JlbG9hZERpc3Bvc2FibGUpO1xuICAgICAgICAgIGF1dG9SZWxvYWREaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmZpbGVVcGRhdGVkKSB7XG4gICAgICAgICAgdGhpcy5maWxlVXBkYXRlZCA9IGZhbHNlO1xuICAgICAgICAgIG5lZWRzVXBkYXRlQ2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBkaXNwb3NhYmxlcy5hZGQoYXRvbS5jb25maWcub2JzZXJ2ZSgncGRmLXZpZXcuYXV0b1JlbG9hZE9uVXBkYXRlJywgc2V0dXBBdXRvUmVsb2FkKSk7XG5cbiAgICBsZXQgbW92ZUxlZnRDYWxsYmFjayA9ICgoKSA9PiB0aGlzLnNjcm9sbExlZnQodGhpcy5zY3JvbGxMZWZ0KCkgLSAkKHdpbmRvdykud2lkdGgoKSAvIDIwKSk7XG4gICAgbGV0IG1vdmVSaWdodENhbGxiYWNrID0gKCgpID0+IHRoaXMuc2Nyb2xsUmlnaHQodGhpcy5zY3JvbGxSaWdodCgpICsgJCh3aW5kb3cpLndpZHRoKCkgLyAyMCkpO1xuICAgIGxldCBzY3JvbGxDYWxsYmFjayA9ICgoKSA9PiB0aGlzLm9uU2Nyb2xsKCkpO1xuICAgIGxldCByZXNpemVIYW5kbGVyID0gKCgpID0+IHRoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIoKSk7XG5cbiAgICBhdG9tLmNvbW1hbmRzLmFkZCgnLnBkZi12aWV3Jywge1xuICAgICAgJ2NvcmU6bW92ZS1sZWZ0JzogbW92ZUxlZnRDYWxsYmFjayxcbiAgICAgICdjb3JlOm1vdmUtcmlnaHQnOiBtb3ZlUmlnaHRDYWxsYmFja1xuICAgIH0pO1xuXG4gICAgdGhpcy5vbignc2Nyb2xsJywgc2Nyb2xsQ2FsbGJhY2spO1xuICAgICQod2luZG93KS5vbigncmVzaXplJywgcmVzaXplSGFuZGxlcik7XG4gICAgXG4gICAgZGlzcG9zYWJsZXMuYWRkKG5ldyBEaXNwb3NhYmxlKCgpID0+IHtcbiAgICAgICQod2luZG93KS5vZmYoJ3Njcm9sbCcsIHNjcm9sbENhbGxiYWNrKTtcbiAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZScsIHJlc2l6ZUhhbmRsZXIpO1xuICAgIH0pKTtcblxuICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICdwZGYtdmlldzp6b29tLWZpdCc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaGFzRm9jdXMoKSkge1xuICAgICAgICAgIHRoaXMuem9vbUZpdCgpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ3BkZi12aWV3Onpvb20taW4nOiAoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLmhhc0ZvY3VzKCkpIHtcbiAgICAgICAgICB0aGlzLnpvb21JbigpO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgJ3BkZi12aWV3Onpvb20tb3V0JzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5oYXNGb2N1cygpKSB7XG4gICAgICAgICAgdGhpcy56b29tT3V0KCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAncGRmLXZpZXc6cmVzZXQtem9vbSc6ICgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuaGFzRm9jdXMoKSkge1xuICAgICAgICAgIHRoaXMucmVzZXRab29tKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAncGRmLXZpZXc6Z28tdG8tbmV4dC1wYWdlJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5oYXNGb2N1cygpKSB7XG4gICAgICAgICAgdGhpcy5nb1RvTmV4dFBhZ2UoKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgICdwZGYtdmlldzpnby10by1wcmV2aW91cy1wYWdlJzogKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5oYXNGb2N1cygpKSB7XG4gICAgICAgICAgdGhpcy5nb1RvUHJldmlvdXNQYWdlKCk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAncGRmLXZpZXc6cmVsb2FkJzogKCkgPT4ge1xuICAgICAgICB0aGlzLnVwZGF0ZVBkZih0cnVlKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMub25Nb3VzZU1vdmUgPSAoZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuYmluYXJ5Vmlldykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5kcmFnZ2luZykge1xuICAgICAgICB0aGlzLnNpbXBsZUNsaWNrID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy5zY3JvbGxUb3AodGhpcy5kcmFnZ2luZy5zY3JvbGxUb3AgLSAoZS5zY3JlZW5ZIC0gdGhpcy5kcmFnZ2luZy55KSk7XG4gICAgICAgIHRoaXMuc2Nyb2xsTGVmdCh0aGlzLmRyYWdnaW5nLnNjcm9sbExlZnQgLSAoZS5zY3JlZW5YIC0gdGhpcy5kcmFnZ2luZy54KSk7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5vbk1vdXNlVXAgPSAoZSkgPT4ge1xuICAgICAgaWYgKHRoaXMuYmluYXJ5Vmlldykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB0aGlzLmRyYWdnaW5nID0gbnVsbDtcbiAgICAgICQoZG9jdW1lbnQpLnVuYmluZCgnbW91c2Vtb3ZlJywgdGhpcy5vbk1vdXNlTW92ZSk7XG4gICAgICAkKGRvY3VtZW50KS51bmJpbmQoJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfTtcblxuICAgIHRoaXMub24oJ21vdXNlZG93bicsIChlKSA9PiB7XG4gICAgICBpZiAodGhpcy5iaW5hcnlWaWV3KSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMuc2ltcGxlQ2xpY2sgPSB0cnVlO1xuICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvckl0ZW0odGhpcykuYWN0aXZhdGUoKTtcbiAgICAgIHRoaXMuZHJhZ2dpbmcgPSB7eDogZS5zY3JlZW5YLCB5OiBlLnNjcmVlblksIHNjcm9sbFRvcDogdGhpcy5zY3JvbGxUb3AoKSwgc2Nyb2xsTGVmdDogdGhpcy5zY3JvbGxMZWZ0KCl9O1xuICAgICAgJChkb2N1bWVudCkub24oJ21vdXNlbW92ZScsIHRoaXMub25Nb3VzZU1vdmUpO1xuICAgICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCB0aGlzLm9uTW91c2VVcCk7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLm9uKCdtb3VzZXdoZWVsJywgKGUpID0+IHtcbiAgICAgIGlmICh0aGlzLmJpbmFyeVZpZXcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgaWYgKGUuY3RybEtleSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlmIChlLm9yaWdpbmFsRXZlbnQud2hlZWxEZWx0YSA+IDApIHtcbiAgICAgICAgICB0aGlzLnpvb21JbigpO1xuICAgICAgICB9IGVsc2UgaWYgKGUub3JpZ2luYWxFdmVudC53aGVlbERlbHRhIDwgMCkge1xuICAgICAgICAgIHRoaXMuem9vbU91dCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBnZXQgYmluYXJ5VmlldygpIHtcbiAgICByZXR1cm4gdGhpcy5oYXNDbGFzcygnYmluYXJ5LXZpZXcnKTtcbiAgfVxuXG4gIHNldCBiaW5hcnlWaWV3KGVuYWJsZWQpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSB0aGlzLmNvbnRhaW5lclswXTtcbiAgICBpZiAoISFlbmFibGVkID09PSB0aGlzLmJpbmFyeVZpZXcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKCF0aGlzLmJpbmFyeVZpZXdFZGl0b3IpIHtcbiAgICAgIGNvbnN0IHtUZXh0QnVmZmVyLCBUZXh0RWRpdG9yfSA9IHJlcXVpcmUoJ2F0b20nKTtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IFRleHRCdWZmZXIubG9hZFN5bmModGhpcy5maWxlUGF0aCk7XG4gICAgICB0aGlzLmJpbmFyeVZpZXdFZGl0b3IgPSBuZXcgVGV4dEVkaXRvcih7YnVmZmVyLCByZWFkT25seTogdHJ1ZX0pO1xuICAgIH1cbiAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgdGhpcy5hZGRDbGFzcygnYmluYXJ5LXZpZXcnKTtcbiAgICAgIGZvciAoY29uc3QgZWwgb2YgQXJyYXkuZnJvbShjb250YWluZXIuY2hpbGRyZW4pKSB7XG4gICAgICAgIGNvbnRhaW5lci5yZW1vdmVDaGlsZChlbCk7XG4gICAgICAgIHRoaXMucGRmVmlld0VsZW1lbnRzLnB1c2goZWwpO1xuICAgICAgfVxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMuYmluYXJ5Vmlld0VkaXRvci5lbGVtZW50KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLnJlbW92ZUNsYXNzKCdiaW5hcnktdmlldycpO1xuICAgICAgY29udGFpbmVyLnJlbW92ZUNoaWxkKHRoaXMuYmluYXJ5Vmlld0VkaXRvci5lbGVtZW50KTtcbiAgICAgIHdoaWxlICh0aGlzLnBkZlZpZXdFbGVtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRoaXMucGRmVmlld0VsZW1lbnRzLnNoaWZ0KCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGhhc0ZvY3VzKCkge1xuICAgIHJldHVybiAhdGhpcy5iaW5hcnlWaWV3ICYmIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKCkgPT09IHRoaXM7XG4gIH1cblxuICBzZXROaWdodE1vZGUoKSB7XG4gICAgaWYgKGF0b20uY29uZmlnLmdldCgncGRmLXZpZXcubmlnaHRNb2RlJykpIHtcbiAgICAgIHRoaXMuYWRkQ2xhc3MoJ25pZ2h0LW1vZGUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZW1vdmVDbGFzcygnbmlnaHQtbW9kZScpO1xuICAgIH1cbiAgfVxuXG4gIHJldmVyc2VTeW5jKHBhZ2UsIGUpIHtcbiAgICBpZiAodGhpcy5zaW1wbGVDbGljaykge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBhZ2UpLnRoZW4oKHBkZlBhZ2UpID0+IHtcbiAgICAgICAgbGV0IHZpZXdwb3J0ID0gcGRmUGFnZS5nZXRWaWV3cG9ydCh0aGlzLmN1cnJlbnRTY2FsZSk7XG4gICAgICAgIGxldCB4LHk7XG4gICAgICAgIFt4LHldID0gdmlld3BvcnQuY29udmVydFRvUGRmUG9pbnQoZS5vZmZzZXRYLCAkKHRoaXMuY2FudmFzZXNbcGFnZSAtIDFdKS5oZWlnaHQoKSAtIGUub2Zmc2V0WSk7XG5cbiAgICAgICAgbGV0IGNhbGxiYWNrID0gKChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgICBpZiAoIWVycm9yKSB7XG4gICAgICAgICAgICBzdGRvdXQgPSBzdGRvdXQucmVwbGFjZSgvXFxyXFxuL2csICdcXG4nKTtcbiAgICAgICAgICAgIGxldCBhdHRycyA9IHt9O1xuICAgICAgICAgICAgZm9yIChsZXQgbGluZSBvZiBzdGRvdXQuc3BsaXQoJ1xcbicpKSB7XG4gICAgICAgICAgICAgIGxldCBtID0gbGluZS5tYXRjaCgvXihbYS16QS1aXSopOiguKikkLylcbiAgICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgICBhdHRyc1ttWzFdXSA9IG1bMl07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGZpbGUgPSBhdHRycy5JbnB1dDtcbiAgICAgICAgICAgIGxldCBsaW5lID0gYXR0cnMuTGluZTtcblxuICAgICAgICAgICAgaWYgKGZpbGUgJiYgbGluZSkge1xuICAgICAgICAgICAgICBsZXQgZWRpdG9yID0gbnVsbDtcbiAgICAgICAgICAgICAgbGV0IHBhdGhUb09wZW4gPSBwYXRoLm5vcm1hbGl6ZShhdHRycy5JbnB1dCk7XG4gICAgICAgICAgICAgIGxldCBsaW5lVG9PcGVuID0gK2F0dHJzLkxpbmU7XG4gICAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XG4gICAgICAgICAgICAgIGZvciAobGV0IGVkaXRvciBvZiBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVkaXRvci5nZXRQYXRoKCkgPT09IHBhdGhUb09wZW4pIHtcbiAgICAgICAgICAgICAgICAgIGxldCBwb3NpdGlvbiA9IG5ldyBQb2ludChsaW5lVG9PcGVuLTEsIC0xKTtcbiAgICAgICAgICAgICAgICAgIGVkaXRvci5zY3JvbGxUb0J1ZmZlclBvc2l0aW9uKHBvc2l0aW9uLCB7Y2VudGVyOiB0cnVlfSk7XG4gICAgICAgICAgICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9zaXRpb24pO1xuICAgICAgICAgICAgICAgICAgZWRpdG9yLm1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lKCk7XG4gICAgICAgICAgICAgICAgICBsZXQgcGFuZSA9IGF0b20ud29ya3NwYWNlLnBhbmVGb3JJdGVtKGVkaXRvcik7XG4gICAgICAgICAgICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbShlZGl0b3IpO1xuICAgICAgICAgICAgICAgICAgcGFuZS5hY3RpdmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAoIWRvbmUpIHtcbiAgICAgICAgICAgICAgICBsZXQgcGFuZW9wdCA9IGF0b20uY29uZmlnLmdldCgncGRmLXZpZXcucGFuZVRvVXNlSW5TeW5jdGV4JylcbiAgICAgICAgICAgICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKHBhdGhUb09wZW4sIHtpbml0aWFsTGluZTogbGluZVRvT3BlbiwgaW5pdGlhbENvbHVtbjogMCwgc3BsaXQ6IHBhbmVvcHR9KVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBsZXQgc3luY3RleFBhdGggPSBhdG9tLmNvbmZpZy5nZXQoJ3BkZi12aWV3LnN5bmNUZVhQYXRoJyk7XG4gICAgICAgIGxldCBjbGlja3NwZWMgPSBbcGFnZSwgeCwgeSwgdGhpcy5maWxlUGF0aF0uam9pbignOicpO1xuXG4gICAgICAgIGlmIChzeW5jdGV4UGF0aCkge1xuICAgICAgICAgIGV4ZWNGaWxlKHN5bmN0ZXhQYXRoLCBbXCJlZGl0XCIsIFwiLW9cIiwgY2xpY2tzcGVjXSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGxldCBjbWQgPSBgc3luY3RleCBlZGl0IC1vIFwiJHtjbGlja3NwZWN9XCJgO1xuICAgICAgICAgIGV4ZWMoY21kLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZvcndhcmRTeW5jKHRleFBhdGgsIGxpbmVOdW1iZXIpIHtcbiAgICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICAgIHRoaXMuZm9yd2FyZFN5bmNBZnRlclVwZGF0ZSA9IHtcbiAgICAgICAgICB0ZXhQYXRoLFxuICAgICAgICAgIGxpbmVOdW1iZXJcbiAgICAgICAgfVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgbGV0IGNhbGxiYWNrID0gKChlcnJvciwgc3Rkb3V0LCBzdGRlcnIpID0+IHtcbiAgICAgICAgaWYgKCFlcnJvcikge1xuICAgICAgICAgIHN0ZG91dCA9IHN0ZG91dC5yZXBsYWNlKC9cXHJcXG4vZywgJ1xcbicpO1xuICAgICAgICAgIGxldCBhdHRycyA9IHt9O1xuICAgICAgICAgIGZvciAobGV0IGxpbmUgb2Ygc3Rkb3V0LnNwbGl0KCdcXG4nKSkge1xuICAgICAgICAgICAgbGV0IG0gPSBsaW5lLm1hdGNoKC9eKFthLXpBLVpdKik6KC4qKSQvKVxuICAgICAgICAgICAgaWYgKG0pIHtcbiAgICAgICAgICAgICAgaWYgKG1bMV0gaW4gYXR0cnMpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGF0dHJzW21bMV1dID0gbVsyXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgcGFnZSA9IHBhcnNlSW50KGF0dHJzLlBhZ2UpO1xuXG4gICAgICAgICAgaWYgKCF0aGlzLnBkZkRvY3VtZW50KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHBhZ2UgPiB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBhZ2UpLnRoZW4oKHBkZlBhZ2UpID0+IHtcbiAgICAgICAgICAgIGxldCB2aWV3cG9ydCA9IHBkZlBhZ2UuZ2V0Vmlld3BvcnQodGhpcy5jdXJyZW50U2NhbGUpO1xuICAgICAgICAgICAgbGV0IGNhbnZhcyA9IHRoaXMuY2FudmFzZXNbcGFnZSAtIDFdO1xuXG4gICAgICAgICAgICBsZXQgeCA9IHBhcnNlRmxvYXQoYXR0cnMueCk7XG4gICAgICAgICAgICBsZXQgeSA9IHBhcnNlRmxvYXQoYXR0cnMueSk7XG4gICAgICAgICAgICBbeCwgeV0gPSB2aWV3cG9ydC5jb252ZXJ0VG9WaWV3cG9ydFBvaW50KHgsIHkpO1xuXG4gICAgICAgICAgICB4ID0geCArIGNhbnZhcy5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgeSA9IHZpZXdwb3J0LmhlaWdodCAtIHkgKyBjYW52YXMub2Zmc2V0VG9wO1xuXG4gICAgICAgICAgICBsZXQgdmlzaWJpbGl0eVRocmVzaG9sZCA9IDUwO1xuXG4gICAgICAgICAgICAvLyBTY3JvbGxcbiAgICAgICAgICAgIGlmICh5IDwgdGhpcy5zY3JvbGxUb3AoKSArIHZpc2liaWxpdHlUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgdGhpcy5zY3JvbGxUb3AoeSAtIHZpc2liaWxpdHlUaHJlc2hvbGQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh5ID4gdGhpcy5zY3JvbGxCb3R0b20oKSAtIHZpc2liaWxpdHlUaHJlc2hvbGQpIHtcbiAgICAgICAgICAgICAgdGhpcy5zY3JvbGxCb3R0b20oeSArIHZpc2liaWxpdHlUaHJlc2hvbGQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoeCA8IHRoaXMuc2Nyb2xsTGVmdCgpICsgdmlzaWJpbGl0eVRocmVzaG9sZCkge1xuICAgICAgICAgICAgICB0aGlzLnNjcm9sbExlZnQoeCAtIHZpc2liaWxpdHlUaHJlc2hvbGQpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh4ID4gdGhpcy5zY3JvbGxSaWdodCgpIC0gdmlzaWJpbGl0eVRocmVzaG9sZCkge1xuICAgICAgICAgICAgICB0aGlzLnNjcm9sbEJvdHRvbSh4ICsgdmlzaWJpbGl0eVRocmVzaG9sZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFNob3cgaGlnaGxpZ2h0ZXJcbiAgICAgICAgICAgICQoJzxkaXYvPicsIHtcbiAgICAgICAgICAgICAgY2xhc3M6IFwidGV4LWhpZ2hsaWdodFwiLFxuICAgICAgICAgICAgICBzdHlsZTogYHRvcDogJHt5fXB4OyBsZWZ0OiAke3h9cHg7YFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hcHBlbmRUbyh0aGlzLmNvbnRhaW5lcilcbiAgICAgICAgICAgIC5vbignYW5pbWF0aW9uZW5kJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICQodGhpcykucmVtb3ZlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGxldCBzeW5jdGV4UGF0aCA9IGF0b20uY29uZmlnLmdldCgncGRmLXZpZXcuc3luY1RlWFBhdGgnKTtcbiAgICAgIGxldCBpbnB1dHNwZWMgPSBbbGluZU51bWJlciwgMCwgdGV4UGF0aF0uam9pbignOicpO1xuXG4gICAgICBpZiAoc3luY3RleFBhdGgpIHtcbiAgICAgICAgZXhlY0ZpbGUoc3luY3RleFBhdGgsIFtcInZpZXdcIiwgXCItaVwiLCBpbnB1dHNwZWMsIFwiLW9cIiwgdGhpcy5maWxlUGF0aF0sIGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjbWQgPSBgc3luY3RleCB2aWV3IC1pIFwiJHtpbnB1dHNwZWN9XCIgLW8gXCIke3RoaXMuZmlsZVBhdGh9XCJgO1xuICAgICAgICBleGVjKGNtZCwgY2FsbGJhY2spO1xuICAgICAgfVxuICB9XG5cblxuICBvblNjcm9sbCgpIHtcbiAgICBpZiAodGhpcy5iaW5hcnlWaWV3KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnVwZGF0aW5nKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvcEJlZm9yZVVwZGF0ZSA9IHRoaXMuc2Nyb2xsVG9wKCk7XG4gICAgICB0aGlzLnNjcm9sbExlZnRCZWZvcmVVcGRhdGUgPSB0aGlzLnNjcm9sbExlZnQoKTtcbiAgICB9XG5cbiAgICB0aGlzLnNldEN1cnJlbnRQYWdlTnVtYmVyKCk7XG4gIH1cblxuICBzZXRDdXJyZW50UGFnZU51bWJlcigpIHtcbiAgICBpZiAoIXRoaXMucGRmRG9jdW1lbnQgfHwgdGhpcy5iaW5hcnlWaWV3KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGNlbnRlciA9ICh0aGlzLnNjcm9sbEJvdHRvbSgpICsgdGhpcy5zY3JvbGxUb3AoKSkvMi4wXG4gICAgdGhpcy5jdXJyZW50UGFnZU51bWJlciA9IDFcblxuICAgIGlmICh0aGlzLmNlbnRlcnNCZXR3ZWVuUGFnZXMubGVuZ3RoID09PSAwICYmIHRoaXMucGFnZUhlaWdodHMubGVuZ3RoID09PSB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzKVxuICAgICAgZm9yIChsZXQgcGRmUGFnZU51bWJlciBvZiBfLnJhbmdlKDEsIHRoaXMucGRmRG9jdW1lbnQubnVtUGFnZXMrMSkpIHtcbiAgICAgICAgdGhpcy5jZW50ZXJzQmV0d2VlblBhZ2VzLnB1c2godGhpcy5wYWdlSGVpZ2h0cy5zbGljZSgwLCBwZGZQYWdlTnVtYmVyKS5yZWR1Y2UoKCh4LHkpID0+IHggKyB5KSwgMCkgKyBwZGZQYWdlTnVtYmVyICogMjAgLSAxMCk7XG4gICAgICB9XG5cbiAgICBmb3IgKGxldCBwZGZQYWdlTnVtYmVyIG9mIF8ucmFuZ2UoMiwgdGhpcy5wZGZEb2N1bWVudC5udW1QYWdlcysxKSkge1xuICAgICAgaWYgKGNlbnRlciA+PSB0aGlzLmNlbnRlcnNCZXR3ZWVuUGFnZXNbcGRmUGFnZU51bWJlci0yXSAmJiBjZW50ZXIgPCB0aGlzLmNlbnRlcnNCZXR3ZWVuUGFnZXNbcGRmUGFnZU51bWJlci0xXSkge1xuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlTnVtYmVyID0gcGRmUGFnZU51bWJlcjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdwZGYtdmlldzpjdXJyZW50LXBhZ2UtdXBkYXRlJykpO1xuICB9XG5cbiAgZmluaXNoVXBkYXRlKCkge1xuICAgIHRoaXMudXBkYXRpbmcgPSBmYWxzZTtcbiAgICBpZiAodGhpcy5uZWVkc1VwZGF0ZSkge1xuICAgICAgdGhpcy51cGRhdGVQZGYoKTtcbiAgICB9XG4gICAgaWYgKHRoaXMudG9TY2FsZUZhY3RvciAhPSAxKSB7XG4gICAgICB0aGlzLmFkanVzdFNpemUoMSk7XG4gICAgfVxuICAgIGlmICh0aGlzLnNjcm9sbFRvUGFnZUFmdGVyVXBkYXRlKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvUGFnZSh0aGlzLnNjcm9sbFRvUGFnZUFmdGVyVXBkYXRlKVxuICAgICAgZGVsZXRlIHRoaXMuc2Nyb2xsVG9QYWdlQWZ0ZXJVcGRhdGVcbiAgICB9XG4gICAgaWYgKHRoaXMuc2Nyb2xsVG9OYW1lZERlc3RBZnRlclVwZGF0ZSkge1xuICAgICAgdGhpcy5zY3JvbGxUb05hbWVkRGVzdCh0aGlzLnNjcm9sbFRvTmFtZWREZXN0QWZ0ZXJVcGRhdGUpXG4gICAgICBkZWxldGUgdGhpcy5zY3JvbGxUb05hbWVkRGVzdEFmdGVyVXBkYXRlXG4gICAgfVxuICAgIGlmICh0aGlzLmZvcndhcmRTeW5jQWZ0ZXJVcGRhdGUpIHtcbiAgICAgIHRoaXMuZm9yd2FyZFN5bmModGhpcy5mb3J3YXJkU3luY0FmdGVyVXBkYXRlLnRleFBhdGgsIHRoaXMuZm9yd2FyZFN5bmNBZnRlclVwZGF0ZS5saW5lTnVtYmVyKVxuICAgICAgZGVsZXRlIHRoaXMuZm9yd2FyZFN5bmNBZnRlclVwZGF0ZVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZVBkZihjbG9zZU9uRXJyb3IgPSBmYWxzZSkge1xuICAgIHRoaXMubmVlZHNVcGRhdGUgPSBmYWxzZTtcblxuICAgIGlmICghZnMuZXhpc3RzU3luYyh0aGlzLmZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwZGZEYXRhID0gbnVsbDtcblxuICAgIHRyeSB7XG4gICAgICBwZGZEYXRhID0gbmV3IFVpbnQ4QXJyYXkoZnMucmVhZEZpbGVTeW5jKHRoaXMuZmlsZVBhdGgpKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcblxuICAgIGxldCByZXZlcnNlU3luY0NsaWNrdHlwZSA9IG51bGxcbiAgICBzd2l0Y2goYXRvbS5jb25maWcuZ2V0KCdwZGYtdmlldy5yZXZlcnNlU3luY0JlaGF2aW91cicpKSB7XG4gICAgICBjYXNlICdDbGljayc6XG4gICAgICAgIHJldmVyc2VTeW5jQ2xpY2t0eXBlID0gJ2NsaWNrJ1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnRG91YmxlIGNsaWNrJzpcbiAgICAgICAgcmV2ZXJzZVN5bmNDbGlja3R5cGUgPSAnZGJsY2xpY2snXG4gICAgICAgIGJyZWFrXG4gICAgfVxuXG4gICAgdGhpcy5zZXROaWdodE1vZGUoKTtcblxuICAgIFBERkpTLmdldERvY3VtZW50KHBkZkRhdGEpLnRoZW4oKHBkZkRvY3VtZW50KSA9PiB7XG4gICAgICB0aGlzLmNvbnRhaW5lci5maW5kKFwiY2FudmFzXCIpLnJlbW92ZSgpO1xuICAgICAgdGhpcy5jYW52YXNlcyA9IFtdO1xuICAgICAgdGhpcy5wYWdlSGVpZ2h0cyA9IFtdO1xuXG4gICAgICB0aGlzLnBkZkRvY3VtZW50ID0gcGRmRG9jdW1lbnQ7XG4gICAgICB0aGlzLnRvdGFsUGFnZU51bWJlciA9IHRoaXMucGRmRG9jdW1lbnQubnVtUGFnZXM7XG5cbiAgICAgIGZvciAobGV0IHBkZlBhZ2VOdW1iZXIgb2YgXy5yYW5nZSgxLCB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzKzEpKSB7XG4gICAgICAgIGxldCBjYW52YXMgPSAkKFwiPGNhbnZhcy8+XCIsIHtjbGFzczogXCJwYWdlLWNvbnRhaW5lclwifSkuYXBwZW5kVG8odGhpcy5jb250YWluZXIpWzBdO1xuICAgICAgICB0aGlzLmNhbnZhc2VzLnB1c2goY2FudmFzKTtcbiAgICAgICAgdGhpcy5wYWdlSGVpZ2h0cy5wdXNoKDApO1xuICAgICAgICBpZiAocmV2ZXJzZVN5bmNDbGlja3R5cGUpIHtcbiAgICAgICAgICAkKGNhbnZhcykub24ocmV2ZXJzZVN5bmNDbGlja3R5cGUsIChlKSA9PiB0aGlzLnJldmVyc2VTeW5jKHBkZlBhZ2VOdW1iZXIsIGUpKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLm1heFBhZ2VXaWR0aCA9IDA7XG5cbiAgICAgIGlmICh0aGlzLmZpdFRvV2lkdGhPbk9wZW4pIHtcbiAgICAgICAgUHJvbWlzZS5hbGwoXG4gICAgICAgICAgXy5yYW5nZSgxLCB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzICsgMSkubWFwKChwZGZQYWdlTnVtYmVyKSA9PlxuICAgICAgICAgICAgdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBkZlBhZ2VOdW1iZXIpLnRoZW4oKHBkZlBhZ2UpID0+XG4gICAgICAgICAgICAgIHBkZlBhZ2UuZ2V0Vmlld3BvcnQoMS4wKS53aWR0aFxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgKS50aGVuKChwZGZQYWdlV2lkdGhzKSA9PiB7XG4gICAgICAgICAgdGhpcy5tYXhQYWdlV2lkdGggPSBNYXRoLm1heCguLi5wZGZQYWdlV2lkdGhzKTtcbiAgICAgICAgICB0aGlzLnJlbmRlclBkZigpO1xuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yZW5kZXJQZGYoKTtcbiAgICAgIH1cbiAgICB9LCAoKSA9PiB7XG4gICAgICBpZiAoY2xvc2VPbkVycm9yKSB7XG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcih0aGlzLmZpbGVQYXRoICsgXCIgaXMgbm90IGEgUERGIGZpbGUuXCIpO1xuICAgICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9ySXRlbSh0aGlzKS5kZXN0cm95SXRlbSh0aGlzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZmluaXNoVXBkYXRlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW5kZXJQZGYoc2Nyb2xsQWZ0ZXJSZW5kZXIgPSB0cnVlKSB7XG4gICAgdGhpcy5jZW50ZXJzQmV0d2VlblBhZ2VzID0gW107XG5cbiAgICBpZiAodGhpcy5maXRUb1dpZHRoT25PcGVuKSB7XG4gICAgICB0aGlzLmN1cnJlbnRTY2FsZSA9IHRoaXNbMF0uY2xpZW50V2lkdGggLyB0aGlzLm1heFBhZ2VXaWR0aDtcbiAgICAgIHRoaXMuZml0VG9XaWR0aE9uT3BlbiA9IGZhbHNlO1xuICAgIH1cblxuICAgIFByb21pc2UuYWxsKFxuICAgICAgXy5yYW5nZSgxLCB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzICsgMSkubWFwKChwZGZQYWdlTnVtYmVyKSA9PiB7XG4gICAgICAgIGxldCBjYW52YXMgPSB0aGlzLmNhbnZhc2VzW3BkZlBhZ2VOdW1iZXIgLSAxXTtcblxuICAgICAgICByZXR1cm4gdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBkZlBhZ2VOdW1iZXIpLnRoZW4oKHBkZlBhZ2UpID0+IHtcbiAgICAgICAgICBsZXQgdmlld3BvcnQgPSBwZGZQYWdlLmdldFZpZXdwb3J0KHRoaXMuY3VycmVudFNjYWxlKTtcbiAgICAgICAgICBsZXQgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgbGV0IG91dHB1dFNjYWxlID0gd2luZG93LmRldmljZVBpeGVsUmF0aW87XG4gICAgICAgICAgY2FudmFzLmhlaWdodCA9IE1hdGguZmxvb3Iodmlld3BvcnQuaGVpZ2h0KSAqIG91dHB1dFNjYWxlO1xuICAgICAgICAgIGNhbnZhcy53aWR0aCA9IE1hdGguZmxvb3Iodmlld3BvcnQud2lkdGgpICogb3V0cHV0U2NhbGU7XG5cbiAgICAgICAgICBjb250ZXh0Ll9zY2FsZVggPSBvdXRwdXRTY2FsZTtcbiAgICAgICAgICBjb250ZXh0Ll9zY2FsZVkgPSBvdXRwdXRTY2FsZTtcbiAgICAgICAgICBjb250ZXh0LnNjYWxlKG91dHB1dFNjYWxlLCBvdXRwdXRTY2FsZSk7XG4gICAgICAgICAgY29udGV4dC5fdHJhbnNmb3JtTWF0cml4ID0gW291dHB1dFNjYWxlLCAwLCAwLCBvdXRwdXRTY2FsZSwgMCwgMF07XG4gICAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gTWF0aC5mbG9vcih2aWV3cG9ydC53aWR0aCkgKyAncHgnO1xuICAgICAgICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQgPSBNYXRoLmZsb29yKHZpZXdwb3J0LmhlaWdodCkgKyAncHgnO1xuXG4gICAgICAgICAgdGhpcy5wYWdlSGVpZ2h0c1twZGZQYWdlTnVtYmVyIC0gMV0gPSBNYXRoLmZsb29yKHZpZXdwb3J0LmhlaWdodCk7XG5cbiAgICAgICAgICByZXR1cm4gcGRmUGFnZS5yZW5kZXIoe2NhbnZhc0NvbnRleHQ6IGNvbnRleHQsIHZpZXdwb3J0OiB2aWV3cG9ydH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0pXG4gICAgKS50aGVuKChyZW5kZXJUYXNrcykgPT4ge1xuICAgICAgaWYgKHNjcm9sbEFmdGVyUmVuZGVyKSB7XG4gICAgICAgIHRoaXMuc2Nyb2xsVG9wKHRoaXMuc2Nyb2xsVG9wQmVmb3JlVXBkYXRlKTtcbiAgICAgICAgdGhpcy5zY3JvbGxMZWZ0KHRoaXMuc2Nyb2xsTGVmdEJlZm9yZVVwZGF0ZSk7XG4gICAgICAgIHRoaXMuc2V0Q3VycmVudFBhZ2VOdW1iZXIoKTtcbiAgICAgIH1cbiAgICAgIFByb21pc2UuYWxsKHJlbmRlclRhc2tzKS50aGVuKCgpID0+IHRoaXMuZmluaXNoVXBkYXRlKCkpO1xuICAgIH0sICgpID0+IHRoaXMuZmluaXNoVXBkYXRlKCkpO1xuICB9XG5cbiAgY29tcHV0ZU1heFBhZ2VXaWR0aEFuZFRyeVpvb21GaXQoKXtcbiAgICBQcm9taXNlLmFsbChcbiAgICAgIF8ucmFuZ2UoMSwgdGhpcy5wZGZEb2N1bWVudC5udW1QYWdlcyArIDEpLm1hcCgocGRmUGFnZU51bWJlcikgPT5cbiAgICAgICAgdGhpcy5wZGZEb2N1bWVudC5nZXRQYWdlKHBkZlBhZ2VOdW1iZXIpLnRoZW4oKHBkZlBhZ2UpID0+XG4gICAgICAgICAgcGRmUGFnZS5nZXRWaWV3cG9ydCgxLjApLndpZHRoXG4gICAgICAgIClcbiAgICAgIClcbiAgICApLnRoZW4oKHBkZlBhZ2VXaWR0aHMpID0+IHtcbiAgICAgIHRoaXMubWF4UGFnZVdpZHRoID0gTWF0aC5tYXgoLi4ucGRmUGFnZVdpZHRocyk7XG4gICAgICB0aGlzLnpvb21GaXQoKTtcbiAgICB9KVxuICB9XG5cbiAgem9vbUZpdCgpIHtcbiAgICBpZiAodGhpcy5tYXhQYWdlV2lkdGggPT0gMCkge1xuICAgICAgdGhpcy5jb21wdXRlTWF4UGFnZVdpZHRoQW5kVHJ5Wm9vbUZpdCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBsZXQgZml0U2NhbGUgPSB0aGlzWzBdLmNsaWVudFdpZHRoIC8gdGhpcy5tYXhQYWdlV2lkdGg7XG4gICAgcmV0dXJuIHRoaXMuYWRqdXN0U2l6ZShmaXRTY2FsZSAvICh0aGlzLmN1cnJlbnRTY2FsZSAqICB0aGlzLnRvU2NhbGVGYWN0b3IpKTtcbiAgfVxuXG4gIHpvb21PdXQoKSB7XG4gICAgcmV0dXJuIHRoaXMuYWRqdXN0U2l6ZSgxMDAgLyAoMTAwICsgdGhpcy5zY2FsZUZhY3RvcikpO1xuICB9XG5cbiAgem9vbUluKCkge1xuICAgIHJldHVybiB0aGlzLmFkanVzdFNpemUoKDEwMCArIHRoaXMuc2NhbGVGYWN0b3IpIC8gMTAwKTtcbiAgfVxuXG4gIHJlc2V0Wm9vbSgpIHtcbiAgICByZXR1cm4gdGhpcy5hZGp1c3RTaXplKHRoaXMuZGVmYXVsdFNjYWxlIC8gdGhpcy5jdXJyZW50U2NhbGUpO1xuICB9XG5cbiAgZ29Ub05leHRQYWdlKCkge1xuICAgIHJldHVybiB0aGlzLnNjcm9sbFRvUGFnZSh0aGlzLmN1cnJlbnRQYWdlTnVtYmVyICsgMSk7XG4gIH1cblxuICBnb1RvUHJldmlvdXNQYWdlKCkge1xuICAgIHJldHVybiB0aGlzLnNjcm9sbFRvUGFnZSh0aGlzLmN1cnJlbnRQYWdlTnVtYmVyIC0gMSk7XG4gIH1cblxuICBjb21wdXRlWm9vbWVkU2Nyb2xsVG9wKG9sZFNjcm9sbFRvcCwgb2xkUGFnZUhlaWdodHMpIHtcbiAgICBsZXQgcGl4ZWxzVG9ab29tID0gMDtcbiAgICBsZXQgc3BhY2VzVG9Ta2lwID0gMDtcbiAgICBsZXQgem9vbWVkUGl4ZWxzID0gMDtcblxuICAgIGZvciAobGV0IHBkZlBhZ2VOdW1iZXIgb2YgXy5yYW5nZSgwLCB0aGlzLnBkZkRvY3VtZW50Lm51bVBhZ2VzKSkge1xuICAgICAgaWYgKHBpeGVsc1RvWm9vbSArIHNwYWNlc1RvU2tpcCArIG9sZFBhZ2VIZWlnaHRzW3BkZlBhZ2VOdW1iZXJdID4gb2xkU2Nyb2xsVG9wKSB7XG4gICAgICAgIHpvb21GYWN0b3JGb3JQYWdlID0gdGhpcy5wYWdlSGVpZ2h0c1twZGZQYWdlTnVtYmVyXSAvIG9sZFBhZ2VIZWlnaHRzW3BkZlBhZ2VOdW1iZXJdO1xuICAgICAgICBsZXQgcGFydE9mUGFnZUFib3ZlVXBwZXJCb3JkZXIgPSBvbGRTY3JvbGxUb3AgLSAocGl4ZWxzVG9ab29tICsgc3BhY2VzVG9Ta2lwKTtcbiAgICAgICAgem9vbWVkUGl4ZWxzICs9IE1hdGgucm91bmQocGFydE9mUGFnZUFib3ZlVXBwZXJCb3JkZXIgKiB6b29tRmFjdG9yRm9yUGFnZSk7XG4gICAgICAgIHBpeGVsc1RvWm9vbSArPSBwYXJ0T2ZQYWdlQWJvdmVVcHBlckJvcmRlcjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaXhlbHNUb1pvb20gKz0gb2xkUGFnZUhlaWdodHNbcGRmUGFnZU51bWJlcl07XG4gICAgICAgIHpvb21lZFBpeGVscyArPSB0aGlzLnBhZ2VIZWlnaHRzW3BkZlBhZ2VOdW1iZXJdO1xuICAgICAgfVxuXG4gICAgICBpZiAocGl4ZWxzVG9ab29tICsgc3BhY2VzVG9Ta2lwICsgMjAgPiBvbGRTY3JvbGxUb3ApIHtcbiAgICAgICAgbGV0IHBhcnRPZlBhZGRpbmdBYm92ZVVwcGVyQm9yZGVyID0gb2xkU2Nyb2xsVG9wIC0gKHBpeGVsc1RvWm9vbSArIHNwYWNlc1RvU2tpcCk7XG4gICAgICAgIHNwYWNlc1RvU2tpcCArPSBwYXJ0T2ZQYWRkaW5nQWJvdmVVcHBlckJvcmRlcjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzcGFjZXNUb1NraXAgKz0gMjA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHpvb21lZFBpeGVscyArIHNwYWNlc1RvU2tpcDtcbiAgfVxuXG4gIGFkanVzdFNpemUoZmFjdG9yKSB7XG4gICAgaWYgKCF0aGlzLnBkZkRvY3VtZW50KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZmFjdG9yID0gdGhpcy50b1NjYWxlRmFjdG9yICogZmFjdG9yO1xuXG4gICAgaWYgKHRoaXMudXBkYXRpbmcpIHtcbiAgICAgIHRoaXMudG9TY2FsZUZhY3RvciA9IGZhY3RvcjtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnVwZGF0aW5nID0gdHJ1ZTtcbiAgICB0aGlzLnRvU2NhbGVGYWN0b3IgPSAxO1xuXG4gICAgbGV0IG9sZFNjcm9sbFRvcCA9IHRoaXMuc2Nyb2xsVG9wKCk7XG4gICAgbGV0IG9sZFBhZ2VIZWlnaHRzID0gdGhpcy5wYWdlSGVpZ2h0cy5zbGljZSgwKTtcbiAgICB0aGlzLmN1cnJlbnRTY2FsZSA9IHRoaXMuY3VycmVudFNjYWxlICogZmFjdG9yO1xuICAgIHRoaXMucmVuZGVyUGRmKGZhbHNlKTtcblxuICAgIHByb2Nlc3MubmV4dFRpY2soKCkgPT4ge1xuICAgICAgbGV0IG5ld1Njcm9sbFRvcCA9IHRoaXMuY29tcHV0ZVpvb21lZFNjcm9sbFRvcChvbGRTY3JvbGxUb3AsIG9sZFBhZ2VIZWlnaHRzKTtcbiAgICAgIHRoaXMuc2Nyb2xsVG9wKG5ld1Njcm9sbFRvcCk7XG4gICAgfSk7XG5cbiAgICBwcm9jZXNzLm5leHRUaWNrKCgpID0+IHtcbiAgICAgIGxldCBuZXdTY3JvbGxMZWZ0ID0gdGhpcy5zY3JvbGxMZWZ0KCkgKiBmYWN0b3I7XG4gICAgICB0aGlzLnNjcm9sbExlZnQobmV3U2Nyb2xsTGVmdCk7XG4gICAgfSk7XG4gIH1cblxuICBnZXRDdXJyZW50UGFnZU51bWJlcigpIHtcbiAgICByZXR1cm4gdGhpcy5jdXJyZW50UGFnZU51bWJlcjtcbiAgfVxuXG4gIGdldFRvdGFsUGFnZU51bWJlcigpIHtcbiAgICByZXR1cm4gdGhpcy50b3RhbFBhZ2VOdW1iZXI7XG4gIH1cblxuICBzY3JvbGxUb1BhZ2UocGRmUGFnZU51bWJlcikge1xuICAgIGlmICh0aGlzLnVwZGF0aW5nKSB7XG4gICAgICB0aGlzLnNjcm9sbFRvUGFnZUFmdGVyVXBkYXRlID0gcGRmUGFnZU51bWJlclxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLnBkZkRvY3VtZW50IHx8IGlzTmFOKHBkZlBhZ2VOdW1iZXIpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcGRmUGFnZU51bWJlciA9IE1hdGgubWluKHBkZlBhZ2VOdW1iZXIsIHRoaXMucGRmRG9jdW1lbnQubnVtUGFnZXMpO1xuICAgIHBhZ2VTY3JvbGxQb3NpdGlvbiA9ICh0aGlzLnBhZ2VIZWlnaHRzLnNsaWNlKDAsIChwZGZQYWdlTnVtYmVyLTEpKS5yZWR1Y2UoKCh4LHkpID0+IHgreSksIDApKSArIChwZGZQYWdlTnVtYmVyIC0gMSkgKiAyMFxuXG4gICAgcmV0dXJuIHRoaXMuc2Nyb2xsVG9wKHBhZ2VTY3JvbGxQb3NpdGlvbik7XG4gIH1cblxuICBzY3JvbGxUb05hbWVkRGVzdChuYW1lZERlc3QpIHtcbiAgICBpZiAodGhpcy51cGRhdGluZykge1xuICAgICAgdGhpcy5zY3JvbGxUb05hbWVkRGVzdEFmdGVyVXBkYXRlID0gbmFtZWREZXN0XG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucGRmRG9jdW1lbnQpIHtcbiAgICAgIHJldHVyblxuICAgIH1cblxuICAgIHRoaXMucGRmRG9jdW1lbnQuZ2V0RGVzdGluYXRpb24obmFtZWREZXN0KVxuICAgICAgLnRoZW4oZGVzdFJlZiA9PiB0aGlzLnBkZkRvY3VtZW50LmdldFBhZ2VJbmRleChkZXN0UmVmWzBdKSlcbiAgICAgIC50aGVuKHBhZ2VOdW1iZXIgPT4gdGhpcy5zY3JvbGxUb1BhZ2UocGFnZU51bWJlciArIDEpKVxuICAgICAgLmNhdGNoKCgpID0+IGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcihgQ2Fubm90IGZpbmQgbmFtZWQgZGVzdGluYXRpb24gJHtuYW1lZERlc3R9LmApKVxuICB9XG5cbiAgc2VyaWFsaXplKCkge1xuICAgIHJldHVybiB7XG4gICAgICBmaWxlUGF0aDogdGhpcy5maWxlUGF0aCxcbiAgICAgIHNjYWxlOiB0aGlzLmN1cnJlbnRTY2FsZSxcbiAgICAgIHNjcm9sbFRvcDogdGhpcy5zY3JvbGxUb3BCZWZvcmVVcGRhdGUsXG4gICAgICBzY3JvbGxMZWZ0OiB0aGlzLnNjcm9sbExlZnRCZWZvcmVVcGRhdGUsXG4gICAgICBkZXNlcmlhbGl6ZXI6ICdQZGZFZGl0b3JEZXNlcmlhbGl6ZXInXG4gICAgfTtcbiAgfVxuXG4gIGdldFRpdGxlKCkge1xuICAgIGlmICh0aGlzLmZpbGVQYXRoKSB7XG4gICAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSh0aGlzLmZpbGVQYXRoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICd1bnRpdGxlZCc7XG4gICAgfVxuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIHJldHVybiB0aGlzLmZpbGVQYXRoO1xuICB9XG5cbiAgZ2V0UGF0aCgpIHtcbiAgICByZXR1cm4gdGhpcy5maWxlUGF0aDtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgcmV0dXJuIHRoaXMuZGV0YWNoKCk7XG4gIH1cblxuICBvbkRpZENoYW5nZVRpdGxlKCkge1xuICAgIHJldHVybiBuZXcgRGlzcG9zYWJsZSgoKSA9PiBudWxsKTtcbiAgfVxuXG4gIG9uRGlkQ2hhbmdlTW9kaWZpZWQoKSB7XG4gICAgcmV0dXJuIG5ldyBEaXNwb3NhYmxlKCgpID0+IG51bGwpO1xuICB9XG59XG4iXX0=