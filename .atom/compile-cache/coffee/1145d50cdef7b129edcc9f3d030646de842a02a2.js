(function() {
  var $, CompositeDisposable, Emitter, InputDialog, PlatformIOTerminalView, Pty, Task, Terminal, View, lastActiveElement, lastOpenedView, os, path, ref, ref1,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom'), Task = ref.Task, CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = require('atom-space-pen-views'), $ = ref1.$, View = ref1.View;

  Pty = require.resolve('./process');

  Terminal = require('term.js');

  InputDialog = null;

  path = require('path');

  os = require('os');

  lastOpenedView = null;

  lastActiveElement = null;

  module.exports = PlatformIOTerminalView = (function(superClass) {
    extend(PlatformIOTerminalView, superClass);

    function PlatformIOTerminalView() {
      this.blurTerminal = bind(this.blurTerminal, this);
      this.focusTerminal = bind(this.focusTerminal, this);
      this.blur = bind(this.blur, this);
      this.focus = bind(this.focus, this);
      this.resizePanel = bind(this.resizePanel, this);
      this.resizeStopped = bind(this.resizeStopped, this);
      this.resizeStarted = bind(this.resizeStarted, this);
      this.onWindowResize = bind(this.onWindowResize, this);
      this.hide = bind(this.hide, this);
      this.open = bind(this.open, this);
      this.recieveItemOrFile = bind(this.recieveItemOrFile, this);
      this.setAnimationSpeed = bind(this.setAnimationSpeed, this);
      return PlatformIOTerminalView.__super__.constructor.apply(this, arguments);
    }

    PlatformIOTerminalView.prototype.animating = false;

    PlatformIOTerminalView.prototype.id = '';

    PlatformIOTerminalView.prototype.maximized = false;

    PlatformIOTerminalView.prototype.opened = false;

    PlatformIOTerminalView.prototype.pwd = '';

    PlatformIOTerminalView.prototype.windowHeight = $(window).height();

    PlatformIOTerminalView.prototype.rowHeight = 20;

    PlatformIOTerminalView.prototype.shell = '';

    PlatformIOTerminalView.prototype.tabView = false;

    PlatformIOTerminalView.content = function() {
      return this.div({
        "class": 'platformio-ide-terminal terminal-view',
        outlet: 'platformIOTerminalView'
      }, (function(_this) {
        return function() {
          _this.div({
            "class": 'panel-divider',
            outlet: 'panelDivider'
          });
          _this.section({
            "class": 'input-block'
          }, function() {
            return _this.div({
              "class": 'btn-toolbar'
            }, function() {
              _this.div({
                "class": 'btn-group'
              }, function() {
                return _this.button({
                  outlet: 'inputBtn',
                  "class": 'btn icon icon-keyboard',
                  click: 'inputDialog'
                });
              });
              return _this.div({
                "class": 'btn-group right'
              }, function() {
                _this.button({
                  outlet: 'hideBtn',
                  "class": 'btn icon icon-chevron-down',
                  click: 'hide'
                });
                _this.button({
                  outlet: 'maximizeBtn',
                  "class": 'btn icon icon-screen-full',
                  click: 'maximize'
                });
                return _this.button({
                  outlet: 'closeBtn',
                  "class": 'btn icon icon-x',
                  click: 'destroy'
                });
              });
            });
          });
          return _this.div({
            "class": 'xterm',
            outlet: 'xterm'
          });
        };
      })(this));
    };

    PlatformIOTerminalView.getFocusedTerminal = function() {
      return Terminal.Terminal.focus;
    };

    PlatformIOTerminalView.prototype.initialize = function(id, pwd, statusIcon, statusBar, shell, args, env, autoRun) {
      var bottomHeight, override, percent;
      this.id = id;
      this.pwd = pwd;
      this.statusIcon = statusIcon;
      this.statusBar = statusBar;
      this.shell = shell;
      this.args = args != null ? args : [];
      this.env = env != null ? env : {};
      this.autoRun = autoRun != null ? autoRun : [];
      this.subscriptions = new CompositeDisposable;
      this.emitter = new Emitter;
      this.subscriptions.add(atom.tooltips.add(this.closeBtn, {
        title: 'Close'
      }));
      this.subscriptions.add(atom.tooltips.add(this.hideBtn, {
        title: 'Hide'
      }));
      this.subscriptions.add(this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
        title: 'Fullscreen'
      }));
      this.inputBtn.tooltip = atom.tooltips.add(this.inputBtn, {
        title: 'Insert Text'
      });
      this.prevHeight = atom.config.get('platformio-ide-terminal.style.defaultPanelHeight');
      if (this.prevHeight.indexOf('%') > 0) {
        percent = Math.abs(Math.min(parseFloat(this.prevHeight) / 100.0, 1));
        bottomHeight = $('atom-panel.bottom').children(".terminal-view").height() || 0;
        this.prevHeight = percent * ($('.item-views').height() + bottomHeight);
      }
      this.xterm.height(0);
      this.setAnimationSpeed();
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.animationSpeed', this.setAnimationSpeed));
      override = function(event) {
        if (event.originalEvent.dataTransfer.getData('platformio-ide-terminal') === 'true') {
          return;
        }
        event.preventDefault();
        return event.stopPropagation();
      };
      this.xterm.on('mouseup', (function(_this) {
        return function(event) {
          var lines, rawLines, text;
          if (event.which !== 3) {
            text = window.getSelection().toString();
            if (atom.config.get('platformio-ide-terminal.toggles.selectToCopy') && text) {
              rawLines = text.split(/\r?\n/g);
              lines = rawLines.map(function(line) {
                return line.replace(/\s/g, " ").trimRight();
              });
              text = lines.join("\n");
              atom.clipboard.write(text);
            }
            if (!text) {
              return _this.focus();
            }
          }
        };
      })(this));
      this.xterm.on('dragenter', override);
      this.xterm.on('dragover', override);
      this.xterm.on('drop', this.recieveItemOrFile);
      this.on('focus', this.focus);
      this.subscriptions.add({
        dispose: (function(_this) {
          return function() {
            return _this.off('focus', _this.focus);
          };
        })(this)
      });
      if (/zsh|bash/.test(this.shell) && this.args.indexOf('--login') === -1 && Pty.platform !== 'win32' && atom.config.get('platformio-ide-terminal.toggles.loginShell')) {
        return this.args.unshift('--login');
      }
    };

    PlatformIOTerminalView.prototype.attach = function() {
      if (this.panel != null) {
        return;
      }
      return this.panel = atom.workspace.addBottomPanel({
        item: this,
        visible: false
      });
    };

    PlatformIOTerminalView.prototype.setAnimationSpeed = function() {
      this.animationSpeed = atom.config.get('platformio-ide-terminal.style.animationSpeed');
      if (this.animationSpeed === 0) {
        this.animationSpeed = 100;
      }
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.recieveItemOrFile = function(event) {
      var dataTransfer, file, filePath, i, len, ref2, results;
      event.preventDefault();
      event.stopPropagation();
      dataTransfer = event.originalEvent.dataTransfer;
      if (dataTransfer.getData('atom-event') === 'true') {
        filePath = dataTransfer.getData('text/plain');
        if (filePath) {
          return this.input(filePath + " ");
        }
      } else if (filePath = dataTransfer.getData('initialPath')) {
        return this.input(filePath + " ");
      } else if (dataTransfer.files.length > 0) {
        ref2 = dataTransfer.files;
        results = [];
        for (i = 0, len = ref2.length; i < len; i++) {
          file = ref2[i];
          results.push(this.input(file.path + " "));
        }
        return results;
      }
    };

    PlatformIOTerminalView.prototype.forkPtyProcess = function() {
      return Task.once(Pty, path.resolve(this.pwd), this.shell, this.args, this.env, (function(_this) {
        return function() {
          _this.input = function() {};
          return _this.resize = function() {};
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.getId = function() {
      return this.id;
    };

    PlatformIOTerminalView.prototype.displayTerminal = function() {
      var cols, ref2, rows;
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      this.ptyProcess = this.forkPtyProcess();
      this.terminal = new Terminal({
        cursorBlink: false,
        scrollback: atom.config.get('platformio-ide-terminal.core.scrollback'),
        cols: cols,
        rows: rows
      });
      this.attachListeners();
      this.attachResizeEvents();
      this.attachWindowEvents();
      return this.terminal.open(this.xterm.get(0));
    };

    PlatformIOTerminalView.prototype.attachListeners = function() {
      this.ptyProcess.on("platformio-ide-terminal:data", (function(_this) {
        return function(data) {
          return _this.terminal.write(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:exit", (function(_this) {
        return function() {
          if (atom.config.get('platformio-ide-terminal.toggles.autoClose')) {
            return _this.destroy();
          }
        };
      })(this));
      this.terminal.end = (function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this);
      this.terminal.on("data", (function(_this) {
        return function(data) {
          return _this.input(data);
        };
      })(this));
      this.ptyProcess.on("platformio-ide-terminal:title", (function(_this) {
        return function(title) {
          return _this.process = title;
        };
      })(this));
      this.terminal.on("title", (function(_this) {
        return function(title) {
          return _this.title = title;
        };
      })(this));
      return this.terminal.once("open", (function(_this) {
        return function() {
          var autoRunCommand, command, i, len, ref2, results;
          _this.applyStyle();
          _this.resizeTerminalToView();
          if (_this.ptyProcess.childProcess == null) {
            return;
          }
          autoRunCommand = atom.config.get('platformio-ide-terminal.core.autoRunCommand');
          if (autoRunCommand) {
            _this.input("" + autoRunCommand + os.EOL);
          }
          ref2 = _this.autoRun;
          results = [];
          for (i = 0, len = ref2.length; i < len; i++) {
            command = ref2[i];
            results.push(_this.input("" + command + os.EOL));
          }
          return results;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.destroy = function() {
      var ref2, ref3;
      this.subscriptions.dispose();
      this.statusIcon.destroy();
      this.statusBar.removeTerminalView(this);
      this.detachResizeEvents();
      this.detachWindowEvents();
      if (this.panel.isVisible()) {
        this.hide();
        this.onTransitionEnd((function(_this) {
          return function() {
            return _this.panel.destroy();
          };
        })(this));
      } else {
        this.panel.destroy();
      }
      if (this.statusIcon && this.statusIcon.parentNode) {
        this.statusIcon.parentNode.removeChild(this.statusIcon);
      }
      if ((ref2 = this.ptyProcess) != null) {
        ref2.terminate();
      }
      return (ref3 = this.terminal) != null ? ref3.destroy() : void 0;
    };

    PlatformIOTerminalView.prototype.maximize = function() {
      var btn;
      this.subscriptions.remove(this.maximizeBtn.tooltip);
      this.maximizeBtn.tooltip.dispose();
      this.maxHeight = this.prevHeight + atom.workspace.getCenter().paneContainer.element.offsetHeight;
      btn = this.maximizeBtn.children('span');
      this.onTransitionEnd((function(_this) {
        return function() {
          return _this.focus();
        };
      })(this));
      if (this.maximized) {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Fullscreen'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.prevHeight);
        btn.removeClass('icon-screen-normal').addClass('icon-screen-full');
        return this.maximized = false;
      } else {
        this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
          title: 'Normal'
        });
        this.subscriptions.add(this.maximizeBtn.tooltip);
        this.adjustHeight(this.maxHeight);
        btn.removeClass('icon-screen-full').addClass('icon-screen-normal');
        return this.maximized = true;
      }
    };

    PlatformIOTerminalView.prototype.open = function() {
      var icon;
      if (lastActiveElement == null) {
        lastActiveElement = $(document.activeElement);
      }
      if (lastOpenedView && lastOpenedView !== this) {
        if (lastOpenedView.maximized) {
          this.subscriptions.remove(this.maximizeBtn.tooltip);
          this.maximizeBtn.tooltip.dispose();
          icon = this.maximizeBtn.children('span');
          this.maxHeight = lastOpenedView.maxHeight;
          this.maximizeBtn.tooltip = atom.tooltips.add(this.maximizeBtn, {
            title: 'Normal'
          });
          this.subscriptions.add(this.maximizeBtn.tooltip);
          icon.removeClass('icon-screen-full').addClass('icon-screen-normal');
          this.maximized = true;
        }
        lastOpenedView.hide();
      }
      lastOpenedView = this;
      this.statusBar.setActiveTerminalView(this);
      this.statusIcon.activate();
      this.onTransitionEnd((function(_this) {
        return function() {
          if (!_this.opened) {
            _this.opened = true;
            _this.displayTerminal();
            _this.prevHeight = _this.nearestRow(_this.xterm.height());
            _this.xterm.height(_this.prevHeight);
            return _this.emit("platformio-ide-terminal:terminal-open");
          } else {
            return _this.focus();
          }
        };
      })(this));
      this.panel.show();
      this.xterm.height(0);
      this.animating = true;
      return this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
    };

    PlatformIOTerminalView.prototype.hide = function() {
      var ref2;
      if ((ref2 = this.terminal) != null) {
        ref2.blur();
      }
      lastOpenedView = null;
      this.statusIcon.deactivate();
      this.onTransitionEnd((function(_this) {
        return function() {
          _this.panel.hide();
          if (lastOpenedView == null) {
            if (lastActiveElement != null) {
              lastActiveElement.focus();
              return lastActiveElement = null;
            }
          }
        };
      })(this));
      this.xterm.height(this.maximized ? this.maxHeight : this.prevHeight);
      this.animating = true;
      return this.xterm.height(0);
    };

    PlatformIOTerminalView.prototype.toggle = function() {
      if (this.animating) {
        return;
      }
      if (this.panel.isVisible()) {
        return this.hide();
      } else {
        return this.open();
      }
    };

    PlatformIOTerminalView.prototype.input = function(data) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      this.terminal.stopScrolling();
      return this.ptyProcess.send({
        event: 'input',
        text: data
      });
    };

    PlatformIOTerminalView.prototype.resize = function(cols, rows) {
      if (this.ptyProcess.childProcess == null) {
        return;
      }
      return this.ptyProcess.send({
        event: 'resize',
        rows: rows,
        cols: cols
      });
    };

    PlatformIOTerminalView.prototype.pty = function() {
      var wait;
      if (!this.opened) {
        wait = new Promise((function(_this) {
          return function(resolve, reject) {
            _this.emitter.on("platformio-ide-terminal:terminal-open", function() {
              return resolve();
            });
            return setTimeout(reject, 1000);
          };
        })(this));
        return wait.then((function(_this) {
          return function() {
            return _this.ptyPromise();
          };
        })(this));
      } else {
        return this.ptyPromise();
      }
    };

    PlatformIOTerminalView.prototype.ptyPromise = function() {
      return new Promise((function(_this) {
        return function(resolve, reject) {
          if (_this.ptyProcess != null) {
            _this.ptyProcess.on("platformio-ide-terminal:pty", function(pty) {
              return resolve(pty);
            });
            _this.ptyProcess.send({
              event: 'pty'
            });
            return setTimeout(reject, 1000);
          } else {
            return reject();
          }
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.applyStyle = function() {
      var config, defaultFont, editorFont, editorFontSize, overrideFont, overrideFontSize, ref2, ref3;
      config = atom.config.get('platformio-ide-terminal');
      this.xterm.addClass(config.style.theme);
      if (config.toggles.cursorBlink) {
        this.xterm.addClass('cursor-blink');
      }
      editorFont = atom.config.get('editor.fontFamily');
      defaultFont = "Menlo, Consolas, 'DejaVu Sans Mono', monospace";
      overrideFont = config.style.fontFamily;
      this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
      this.subscriptions.add(atom.config.onDidChange('editor.fontFamily', (function(_this) {
        return function(event) {
          editorFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontFamily', (function(_this) {
        return function(event) {
          overrideFont = event.newValue;
          return _this.terminal.element.style.fontFamily = overrideFont || editorFont || defaultFont;
        };
      })(this)));
      editorFontSize = atom.config.get('editor.fontSize');
      overrideFontSize = config.style.fontSize;
      this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
      this.subscriptions.add(atom.config.onDidChange('editor.fontSize', (function(_this) {
        return function(event) {
          editorFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      this.subscriptions.add(atom.config.onDidChange('platformio-ide-terminal.style.fontSize', (function(_this) {
        return function(event) {
          overrideFontSize = event.newValue;
          _this.terminal.element.style.fontSize = (overrideFontSize || editorFontSize) + "px";
          return _this.resizeTerminalToView();
        };
      })(this)));
      [].splice.apply(this.terminal.colors, [0, 8].concat(ref2 = [config.ansiColors.normal.black.toHexString(), config.ansiColors.normal.red.toHexString(), config.ansiColors.normal.green.toHexString(), config.ansiColors.normal.yellow.toHexString(), config.ansiColors.normal.blue.toHexString(), config.ansiColors.normal.magenta.toHexString(), config.ansiColors.normal.cyan.toHexString(), config.ansiColors.normal.white.toHexString()])), ref2;
      return ([].splice.apply(this.terminal.colors, [8, 8].concat(ref3 = [config.ansiColors.zBright.brightBlack.toHexString(), config.ansiColors.zBright.brightRed.toHexString(), config.ansiColors.zBright.brightGreen.toHexString(), config.ansiColors.zBright.brightYellow.toHexString(), config.ansiColors.zBright.brightBlue.toHexString(), config.ansiColors.zBright.brightMagenta.toHexString(), config.ansiColors.zBright.brightCyan.toHexString(), config.ansiColors.zBright.brightWhite.toHexString()])), ref3);
    };

    PlatformIOTerminalView.prototype.attachWindowEvents = function() {
      return $(window).on('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.detachWindowEvents = function() {
      return $(window).off('resize', this.onWindowResize);
    };

    PlatformIOTerminalView.prototype.attachResizeEvents = function() {
      return this.panelDivider.on('mousedown', this.resizeStarted);
    };

    PlatformIOTerminalView.prototype.detachResizeEvents = function() {
      return this.panelDivider.off('mousedown');
    };

    PlatformIOTerminalView.prototype.onWindowResize = function() {
      var bottomPanel, clamped, delta, newHeight, overflow;
      if (!this.tabView) {
        this.xterm.css('transition', '');
        newHeight = $(window).height();
        bottomPanel = $('atom-panel-container.bottom').first().get(0);
        overflow = bottomPanel.scrollHeight - bottomPanel.offsetHeight;
        delta = newHeight - this.windowHeight;
        this.windowHeight = newHeight;
        if (this.maximized) {
          clamped = Math.max(this.maxHeight + delta, this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.maxHeight = clamped;
          this.prevHeight = Math.min(this.prevHeight, this.maxHeight);
        } else if (overflow > 0) {
          clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
          if (this.panel.isVisible()) {
            this.adjustHeight(clamped);
          }
          this.prevHeight = clamped;
        }
        this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
      }
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.resizeStarted = function() {
      if (this.maximized) {
        return;
      }
      this.maxHeight = this.prevHeight + $('.item-views').height();
      $(document).on('mousemove', this.resizePanel);
      $(document).on('mouseup', this.resizeStopped);
      return this.xterm.css('transition', '');
    };

    PlatformIOTerminalView.prototype.resizeStopped = function() {
      $(document).off('mousemove', this.resizePanel);
      $(document).off('mouseup', this.resizeStopped);
      return this.xterm.css('transition', "height " + (0.25 / this.animationSpeed) + "s linear");
    };

    PlatformIOTerminalView.prototype.nearestRow = function(value) {
      var rows;
      rows = Math.floor(value / this.rowHeight);
      return rows * this.rowHeight;
    };

    PlatformIOTerminalView.prototype.resizePanel = function(event) {
      var clamped, delta, mouseY;
      if (event.which !== 1) {
        return this.resizeStopped();
      }
      mouseY = $(window).height() - event.pageY;
      delta = mouseY - $('atom-panel-container.bottom').height() - $('atom-panel-container.footer').height();
      if (!(Math.abs(delta) > (this.rowHeight * 5 / 6))) {
        return;
      }
      clamped = Math.max(this.nearestRow(this.prevHeight + delta), this.rowHeight);
      if (clamped > this.maxHeight) {
        return;
      }
      this.xterm.height(clamped);
      $(this.terminal.element).height(clamped);
      this.prevHeight = clamped;
      return this.resizeTerminalToView();
    };

    PlatformIOTerminalView.prototype.adjustHeight = function(height) {
      this.xterm.height(height);
      return $(this.terminal.element).height(height);
    };

    PlatformIOTerminalView.prototype.copy = function() {
      var lines, rawLines, rawText, text, textarea;
      if (this.terminal._selected) {
        textarea = this.terminal.getCopyTextarea();
        text = this.terminal.grabText(this.terminal._selected.x1, this.terminal._selected.x2, this.terminal._selected.y1, this.terminal._selected.y2);
      } else {
        rawText = this.terminal.context.getSelection().toString();
        rawLines = rawText.split(/\r?\n/g);
        lines = rawLines.map(function(line) {
          return line.replace(/\s/g, " ").trimRight();
        });
        text = lines.join("\n");
      }
      return atom.clipboard.write(text);
    };

    PlatformIOTerminalView.prototype.paste = function() {
      return this.input(atom.clipboard.read());
    };

    PlatformIOTerminalView.prototype.insertSelection = function(customText) {
      var cursor, editor, line, runCommand, selection, selectionText;
      if (!(editor = atom.workspace.getActiveTextEditor())) {
        return;
      }
      runCommand = atom.config.get('platformio-ide-terminal.toggles.runInsertedText');
      selectionText = '';
      if (selection = editor.getSelectedText()) {
        this.terminal.stopScrolling();
        selectionText = selection;
      } else if (cursor = editor.getCursorBufferPosition()) {
        line = editor.lineTextForBufferRow(cursor.row);
        this.terminal.stopScrolling();
        selectionText = line;
        editor.moveDown(1);
      }
      return this.input("" + (customText.replace(/\$L/, "" + (editor.getCursorBufferPosition().row + 1)).replace(/\$F/, path.basename(editor.buffer.getPath() ? editor.buffer.getPath() : '.')).replace(/\$D/, path.dirname(editor.buffer.getPath() ? editor.buffer.getPath() : '.')).replace(/\$S/, selectionText).replace(/\$\$/, '$')) + (runCommand ? os.EOL : ''));
    };

    PlatformIOTerminalView.prototype.focus = function(fromWindowEvent) {
      this.resizeTerminalToView();
      this.focusTerminal(fromWindowEvent);
      this.statusBar.setActiveTerminalView(this);
      return PlatformIOTerminalView.__super__.focus.call(this);
    };

    PlatformIOTerminalView.prototype.blur = function() {
      this.blurTerminal();
      return PlatformIOTerminalView.__super__.blur.call(this);
    };

    PlatformIOTerminalView.prototype.focusTerminal = function(fromWindowEvent) {
      if (!this.terminal) {
        return;
      }
      lastActiveElement = $(document.activeElement);
      if (fromWindowEvent && !(lastActiveElement.is('div.terminal') || lastActiveElement.parents('div.terminal').length)) {
        return;
      }
      this.terminal.focus();
      if (this.terminal._textarea) {
        return this.terminal._textarea.focus();
      } else {
        return this.terminal.element.focus();
      }
    };

    PlatformIOTerminalView.prototype.blurTerminal = function() {
      if (!this.terminal) {
        return;
      }
      this.terminal.blur();
      this.terminal.element.blur();
      if (lastActiveElement != null) {
        return lastActiveElement.focus();
      }
    };

    PlatformIOTerminalView.prototype.resizeTerminalToView = function() {
      var cols, ref2, rows;
      if (!(this.panel.isVisible() || this.tabView)) {
        return;
      }
      ref2 = this.getDimensions(), cols = ref2.cols, rows = ref2.rows;
      if (!(cols > 0 && rows > 0)) {
        return;
      }
      if (!this.terminal) {
        return;
      }
      if (this.terminal.rows === rows && this.terminal.cols === cols) {
        return;
      }
      this.resize(cols, rows);
      return this.terminal.resize(cols, rows);
    };

    PlatformIOTerminalView.prototype.getDimensions = function() {
      var cols, fakeCol, fakeRow, rows;
      fakeRow = $("<div><span>&nbsp;</span></div>");
      if (this.terminal) {
        this.find('.terminal').append(fakeRow);
        fakeCol = fakeRow.children().first()[0].getBoundingClientRect();
        cols = Math.floor(this.xterm.width() / (fakeCol.width || 9));
        rows = Math.floor(this.xterm.height() / (fakeCol.height || 20));
        this.rowHeight = fakeCol.height;
        fakeRow.remove();
      } else {
        cols = Math.floor(this.xterm.width() / 9);
        rows = Math.floor(this.xterm.height() / 20);
      }
      return {
        cols: cols,
        rows: rows
      };
    };

    PlatformIOTerminalView.prototype.onTransitionEnd = function(callback) {
      return this.xterm.one('webkitTransitionEnd', (function(_this) {
        return function() {
          callback();
          return _this.animating = false;
        };
      })(this));
    };

    PlatformIOTerminalView.prototype.inputDialog = function() {
      var dialog;
      if (InputDialog == null) {
        InputDialog = require('./input-dialog');
      }
      dialog = new InputDialog(this);
      return dialog.attach();
    };

    PlatformIOTerminalView.prototype.rename = function() {
      return this.statusIcon.rename();
    };

    PlatformIOTerminalView.prototype.toggleTabView = function() {
      if (this.tabView) {
        this.panel = atom.workspace.addBottomPanel({
          item: this,
          visible: false
        });
        this.attachResizeEvents();
        this.closeBtn.show();
        this.hideBtn.show();
        this.maximizeBtn.show();
        return this.tabView = false;
      } else {
        this.panel.destroy();
        this.detachResizeEvents();
        this.closeBtn.hide();
        this.hideBtn.hide();
        this.maximizeBtn.hide();
        this.xterm.css("height", "");
        this.tabView = true;
        if (lastOpenedView === this) {
          return lastOpenedView = null;
        }
      }
    };

    PlatformIOTerminalView.prototype.getTitle = function() {
      return this.statusIcon.getName() || "platformio-ide-terminal";
    };

    PlatformIOTerminalView.prototype.getIconName = function() {
      return "terminal";
    };

    PlatformIOTerminalView.prototype.getShell = function() {
      return path.basename(this.shell);
    };

    PlatformIOTerminalView.prototype.getShellPath = function() {
      return this.shell;
    };

    PlatformIOTerminalView.prototype.emit = function(event, data) {
      return this.emitter.emit(event, data);
    };

    PlatformIOTerminalView.prototype.onDidChangeTitle = function(callback) {
      return this.emitter.on('did-change-title', callback);
    };

    PlatformIOTerminalView.prototype.getPath = function() {
      return this.getTerminalTitle();
    };

    PlatformIOTerminalView.prototype.getTerminalTitle = function() {
      return this.title || this.process;
    };

    PlatformIOTerminalView.prototype.getTerminal = function() {
      return this.terminal;
    };

    PlatformIOTerminalView.prototype.isAnimating = function() {
      return this.animating;
    };

    return PlatformIOTerminalView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsL2xpYi92aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsdUpBQUE7SUFBQTs7OztFQUFBLE1BQXVDLE9BQUEsQ0FBUSxNQUFSLENBQXZDLEVBQUMsZUFBRCxFQUFPLDZDQUFQLEVBQTRCOztFQUM1QixPQUFZLE9BQUEsQ0FBUSxzQkFBUixDQUFaLEVBQUMsVUFBRCxFQUFJOztFQUVKLEdBQUEsR0FBTSxPQUFPLENBQUMsT0FBUixDQUFnQixXQUFoQjs7RUFDTixRQUFBLEdBQVcsT0FBQSxDQUFRLFNBQVI7O0VBQ1gsV0FBQSxHQUFjOztFQUVkLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUjs7RUFDUCxFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBRUwsY0FBQSxHQUFpQjs7RUFDakIsaUJBQUEsR0FBb0I7O0VBRXBCLE1BQU0sQ0FBQyxPQUFQLEdBQ007Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7cUNBQ0osU0FBQSxHQUFXOztxQ0FDWCxFQUFBLEdBQUk7O3FDQUNKLFNBQUEsR0FBVzs7cUNBQ1gsTUFBQSxHQUFROztxQ0FDUixHQUFBLEdBQUs7O3FDQUNMLFlBQUEsR0FBYyxDQUFBLENBQUUsTUFBRixDQUFTLENBQUMsTUFBVixDQUFBOztxQ0FDZCxTQUFBLEdBQVc7O3FDQUNYLEtBQUEsR0FBTzs7cUNBQ1AsT0FBQSxHQUFTOztJQUVULHNCQUFDLENBQUEsT0FBRCxHQUFVLFNBQUE7YUFDUixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyx1Q0FBUDtRQUFnRCxNQUFBLEVBQVEsd0JBQXhEO09BQUwsRUFBdUYsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQ3JGLEtBQUMsQ0FBQSxHQUFELENBQUs7WUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGVB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QUEsR0FBaUIsS0FBakI7U0FmRjs7SUFEYTs7cUNBa0JmLFFBQUEsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLFVBQVUsQ0FBQyxPQUFaLENBQUEsQ0FBQSxJQUF5QjtJQURqQjs7cUNBR1YsV0FBQSxHQUFhLFNBQUE7YUFDWDtJQURXOztxQ0FHYixRQUFBLEdBQVUsU0FBQTtBQUNSLGFBQU8sSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFDLENBQUEsS0FBZjtJQURDOztxQ0FHVixZQUFBLEdBQWMsU0FBQTtBQUNaLGFBQU8sSUFBQyxDQUFBO0lBREk7O3FDQUdkLElBQUEsR0FBTSxTQUFDLEtBQUQsRUFBUSxJQUFSO2FBQ0osSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsS0FBZCxFQUFxQixJQUFyQjtJQURJOztxQ0FHTixnQkFBQSxHQUFrQixTQUFDLFFBQUQ7YUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksa0JBQVosRUFBZ0MsUUFBaEM7SUFEZ0I7O3FDQUdsQixPQUFBLEdBQVMsU0FBQTtBQUNQLGFBQU8sSUFBQyxDQUFBLGdCQUFELENBQUE7SUFEQTs7cUNBR1QsZ0JBQUEsR0FBa0IsU0FBQTtBQUNoQixhQUFPLElBQUMsQ0FBQSxLQUFELElBQVUsSUFBQyxDQUFBO0lBREY7O3FDQUdsQixXQUFBLEdBQWEsU0FBQTtBQUNYLGFBQU8sSUFBQyxDQUFBO0lBREc7O3FDQUdiLFdBQUEsR0FBYSxTQUFBO0FBQ1gsYUFBTyxJQUFDLENBQUE7SUFERzs7OztLQXJqQnNCO0FBZHJDIiwic291cmNlc0NvbnRlbnQiOlsie1Rhc2ssIENvbXBvc2l0ZURpc3Bvc2FibGUsIEVtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbnskLCBWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5QdHkgPSByZXF1aXJlLnJlc29sdmUgJy4vcHJvY2VzcydcblRlcm1pbmFsID0gcmVxdWlyZSAndGVybS5qcydcbklucHV0RGlhbG9nID0gbnVsbFxuXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbm9zID0gcmVxdWlyZSAnb3MnXG5cbmxhc3RPcGVuZWRWaWV3ID0gbnVsbFxubGFzdEFjdGl2ZUVsZW1lbnQgPSBudWxsXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFBsYXRmb3JtSU9UZXJtaW5hbFZpZXcgZXh0ZW5kcyBWaWV3XG4gIGFuaW1hdGluZzogZmFsc2VcbiAgaWQ6ICcnXG4gIG1heGltaXplZDogZmFsc2VcbiAgb3BlbmVkOiBmYWxzZVxuICBwd2Q6ICcnXG4gIHdpbmRvd0hlaWdodDogJCh3aW5kb3cpLmhlaWdodCgpXG4gIHJvd0hlaWdodDogMjBcbiAgc2hlbGw6ICcnXG4gIHRhYlZpZXc6IGZhbHNlXG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsIHRlcm1pbmFsLXZpZXcnLCBvdXRsZXQ6ICdwbGF0Zm9ybUlPVGVybWluYWxWaWV3JywgPT5cbiAgICAgIEBkaXYgY2xhc3M6ICdwYW5lbC1kaXZpZGVyJywgb3V0bGV0OiAncGFuZWxEaXZpZGVyJ1xuICAgICAgQHNlY3Rpb24gY2xhc3M6ICdpbnB1dC1ibG9jaycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdidG4tdG9vbGJhcicsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ2J0bi1ncm91cCcsID0+XG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ2lucHV0QnRuJywgY2xhc3M6ICdidG4gaWNvbiBpY29uLWtleWJvYXJkJywgY2xpY2s6ICdpbnB1dERpYWxvZydcbiAgICAgICAgICBAZGl2IGNsYXNzOiAnYnRuLWdyb3VwIHJpZ2h0JywgPT5cbiAgICAgICAgICAgIEBidXR0b24gb3V0bGV0OiAnaGlkZUJ0bicsIGNsYXNzOiAnYnRuIGljb24gaWNvbi1jaGV2cm9uLWRvd24nLCBjbGljazogJ2hpZGUnXG4gICAgICAgICAgICBAYnV0dG9uIG91dGxldDogJ21heGltaXplQnRuJywgY2xhc3M6ICdidG4gaWNvbiBpY29uLXNjcmVlbi1mdWxsJywgY2xpY2s6ICdtYXhpbWl6ZSdcbiAgICAgICAgICAgIEBidXR0b24gb3V0bGV0OiAnY2xvc2VCdG4nLCBjbGFzczogJ2J0biBpY29uIGljb24teCcsIGNsaWNrOiAnZGVzdHJveSdcbiAgICAgIEBkaXYgY2xhc3M6ICd4dGVybScsIG91dGxldDogJ3h0ZXJtJ1xuXG4gIEBnZXRGb2N1c2VkVGVybWluYWw6IC0+XG4gICAgcmV0dXJuIFRlcm1pbmFsLlRlcm1pbmFsLmZvY3VzXG5cbiAgaW5pdGlhbGl6ZTogKEBpZCwgQHB3ZCwgQHN0YXR1c0ljb24sIEBzdGF0dXNCYXIsIEBzaGVsbCwgQGFyZ3M9W10sIEBlbnY9e30sIEBhdXRvUnVuPVtdKSAtPlxuICAgIEBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGNsb3NlQnRuLFxuICAgICAgdGl0bGU6ICdDbG9zZSdcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS50b29sdGlwcy5hZGQgQGhpZGVCdG4sXG4gICAgICB0aXRsZTogJ0hpZGUnXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgdGl0bGU6ICdGdWxsc2NyZWVuJ1xuICAgIEBpbnB1dEJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQGlucHV0QnRuLFxuICAgICAgdGl0bGU6ICdJbnNlcnQgVGV4dCdcblxuICAgIEBwcmV2SGVpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5kZWZhdWx0UGFuZWxIZWlnaHQnKVxuICAgIGlmIEBwcmV2SGVpZ2h0LmluZGV4T2YoJyUnKSA+IDBcbiAgICAgIHBlcmNlbnQgPSBNYXRoLmFicyhNYXRoLm1pbihwYXJzZUZsb2F0KEBwcmV2SGVpZ2h0KSAvIDEwMC4wLCAxKSlcbiAgICAgIGJvdHRvbUhlaWdodCA9ICQoJ2F0b20tcGFuZWwuYm90dG9tJykuY2hpbGRyZW4oXCIudGVybWluYWwtdmlld1wiKS5oZWlnaHQoKSBvciAwXG4gICAgICBAcHJldkhlaWdodCA9IHBlcmNlbnQgKiAoJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKSArIGJvdHRvbUhlaWdodClcbiAgICBAeHRlcm0uaGVpZ2h0IDBcblxuICAgIEBzZXRBbmltYXRpb25TcGVlZCgpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5hbmltYXRpb25TcGVlZCcsIEBzZXRBbmltYXRpb25TcGVlZFxuXG4gICAgb3ZlcnJpZGUgPSAoZXZlbnQpIC0+XG4gICAgICByZXR1cm4gaWYgZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZ2V0RGF0YSgncGxhdGZvcm1pby1pZGUtdGVybWluYWwnKSBpcyAndHJ1ZSdcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KClcbiAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpXG5cbiAgICBAeHRlcm0ub24gJ21vdXNldXAnLCAoZXZlbnQpID0+XG4gICAgICBpZiBldmVudC53aGljaCAhPSAzXG4gICAgICAgIHRleHQgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkudG9TdHJpbmcoKVxuICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnRvZ2dsZXMuc2VsZWN0VG9Db3B5JykgYW5kIHRleHRcbiAgICAgICAgICByYXdMaW5lcyA9IHRleHQuc3BsaXQoL1xccj9cXG4vZylcbiAgICAgICAgICBsaW5lcyA9IHJhd0xpbmVzLm1hcCAobGluZSkgLT5cbiAgICAgICAgICAgIGxpbmUucmVwbGFjZSgvXFxzL2csIFwiIFwiKS50cmltUmlnaHQoKVxuICAgICAgICAgIHRleHQgPSBsaW5lcy5qb2luKFwiXFxuXCIpXG4gICAgICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUodGV4dClcbiAgICAgICAgdW5sZXNzIHRleHRcbiAgICAgICAgICBAZm9jdXMoKVxuICAgIEB4dGVybS5vbiAnZHJhZ2VudGVyJywgb3ZlcnJpZGVcbiAgICBAeHRlcm0ub24gJ2RyYWdvdmVyJywgb3ZlcnJpZGVcbiAgICBAeHRlcm0ub24gJ2Ryb3AnLCBAcmVjaWV2ZUl0ZW1PckZpbGVcblxuICAgIEBvbiAnZm9jdXMnLCBAZm9jdXNcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgZGlzcG9zZTogPT5cbiAgICAgIEBvZmYgJ2ZvY3VzJywgQGZvY3VzXG5cbiAgICBpZiAvenNofGJhc2gvLnRlc3QoQHNoZWxsKSBhbmQgQGFyZ3MuaW5kZXhPZignLS1sb2dpbicpID09IC0xIGFuZCBQdHkucGxhdGZvcm0gaXNudCAnd2luMzInIGFuZCBhdG9tLmNvbmZpZy5nZXQoJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLnRvZ2dsZXMubG9naW5TaGVsbCcpXG4gICAgICBAYXJncy51bnNoaWZ0ICctLWxvZ2luJ1xuXG4gIGF0dGFjaDogLT5cbiAgICByZXR1cm4gaWYgQHBhbmVsP1xuICAgIEBwYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZEJvdHRvbVBhbmVsKGl0ZW06IHRoaXMsIHZpc2libGU6IGZhbHNlKVxuXG4gIHNldEFuaW1hdGlvblNwZWVkOiA9PlxuICAgIEBhbmltYXRpb25TcGVlZCA9IGF0b20uY29uZmlnLmdldCgncGxhdGZvcm1pby1pZGUtdGVybWluYWwuc3R5bGUuYW5pbWF0aW9uU3BlZWQnKVxuICAgIEBhbmltYXRpb25TcGVlZCA9IDEwMCBpZiBAYW5pbWF0aW9uU3BlZWQgaXMgMFxuXG4gICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG5cbiAgcmVjaWV2ZUl0ZW1PckZpbGU6IChldmVudCkgPT5cbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpXG4gICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKClcbiAgICB7ZGF0YVRyYW5zZmVyfSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnRcblxuICAgIGlmIGRhdGFUcmFuc2Zlci5nZXREYXRhKCdhdG9tLWV2ZW50JykgaXMgJ3RydWUnXG4gICAgICBmaWxlUGF0aCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCd0ZXh0L3BsYWluJylcbiAgICAgIEBpbnB1dCBcIiN7ZmlsZVBhdGh9IFwiIGlmIGZpbGVQYXRoXG4gICAgZWxzZSBpZiBmaWxlUGF0aCA9IGRhdGFUcmFuc2Zlci5nZXREYXRhKCdpbml0aWFsUGF0aCcpXG4gICAgICBAaW5wdXQgXCIje2ZpbGVQYXRofSBcIlxuICAgIGVsc2UgaWYgZGF0YVRyYW5zZmVyLmZpbGVzLmxlbmd0aCA+IDBcbiAgICAgIGZvciBmaWxlIGluIGRhdGFUcmFuc2Zlci5maWxlc1xuICAgICAgICBAaW5wdXQgXCIje2ZpbGUucGF0aH0gXCJcblxuICBmb3JrUHR5UHJvY2VzczogLT5cbiAgICBUYXNrLm9uY2UgUHR5LCBwYXRoLnJlc29sdmUoQHB3ZCksIEBzaGVsbCwgQGFyZ3MsIEBlbnYsID0+XG4gICAgICBAaW5wdXQgPSAtPlxuICAgICAgQHJlc2l6ZSA9IC0+XG5cbiAgZ2V0SWQ6IC0+XG4gICAgcmV0dXJuIEBpZFxuXG4gIGRpc3BsYXlUZXJtaW5hbDogLT5cbiAgICB7Y29scywgcm93c30gPSBAZ2V0RGltZW5zaW9ucygpXG4gICAgQHB0eVByb2Nlc3MgPSBAZm9ya1B0eVByb2Nlc3MoKVxuXG4gICAgQHRlcm1pbmFsID0gbmV3IFRlcm1pbmFsIHtcbiAgICAgIGN1cnNvckJsaW5rICAgICA6IGZhbHNlXG4gICAgICBzY3JvbGxiYWNrICAgICAgOiBhdG9tLmNvbmZpZy5nZXQgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsLmNvcmUuc2Nyb2xsYmFjaydcbiAgICAgIGNvbHMsIHJvd3NcbiAgICB9XG5cbiAgICBAYXR0YWNoTGlzdGVuZXJzKClcbiAgICBAYXR0YWNoUmVzaXplRXZlbnRzKClcbiAgICBAYXR0YWNoV2luZG93RXZlbnRzKClcbiAgICBAdGVybWluYWwub3BlbiBAeHRlcm0uZ2V0KDApXG5cbiAgYXR0YWNoTGlzdGVuZXJzOiAtPlxuICAgIEBwdHlQcm9jZXNzLm9uIFwicGxhdGZvcm1pby1pZGUtdGVybWluYWw6ZGF0YVwiLCAoZGF0YSkgPT5cbiAgICAgIEB0ZXJtaW5hbC53cml0ZSBkYXRhXG5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOmV4aXRcIiwgPT5cbiAgICAgIEBkZXN0cm95KCkgaWYgYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLmF1dG9DbG9zZScpXG5cbiAgICBAdGVybWluYWwuZW5kID0gPT4gQGRlc3Ryb3koKVxuXG4gICAgQHRlcm1pbmFsLm9uIFwiZGF0YVwiLCAoZGF0YSkgPT5cbiAgICAgIEBpbnB1dCBkYXRhXG5cbiAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnRpdGxlXCIsICh0aXRsZSkgPT5cbiAgICAgIEBwcm9jZXNzID0gdGl0bGVcbiAgICBAdGVybWluYWwub24gXCJ0aXRsZVwiLCAodGl0bGUpID0+XG4gICAgICBAdGl0bGUgPSB0aXRsZVxuXG4gICAgQHRlcm1pbmFsLm9uY2UgXCJvcGVuXCIsID0+XG4gICAgICBAYXBwbHlTdHlsZSgpXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gICAgICByZXR1cm4gdW5sZXNzIEBwdHlQcm9jZXNzLmNoaWxkUHJvY2Vzcz9cbiAgICAgIGF1dG9SdW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5jb3JlLmF1dG9SdW5Db21tYW5kJylcbiAgICAgIEBpbnB1dCBcIiN7YXV0b1J1bkNvbW1hbmR9I3tvcy5FT0x9XCIgaWYgYXV0b1J1bkNvbW1hbmRcbiAgICAgIEBpbnB1dCBcIiN7Y29tbWFuZH0je29zLkVPTH1cIiBmb3IgY29tbWFuZCBpbiBAYXV0b1J1blxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgQHN0YXR1c0ljb24uZGVzdHJveSgpXG4gICAgQHN0YXR1c0Jhci5yZW1vdmVUZXJtaW5hbFZpZXcgdGhpc1xuICAgIEBkZXRhY2hSZXNpemVFdmVudHMoKVxuICAgIEBkZXRhY2hXaW5kb3dFdmVudHMoKVxuXG4gICAgaWYgQHBhbmVsLmlzVmlzaWJsZSgpXG4gICAgICBAaGlkZSgpXG4gICAgICBAb25UcmFuc2l0aW9uRW5kID0+IEBwYW5lbC5kZXN0cm95KClcbiAgICBlbHNlXG4gICAgICBAcGFuZWwuZGVzdHJveSgpXG5cbiAgICBpZiBAc3RhdHVzSWNvbiBhbmQgQHN0YXR1c0ljb24ucGFyZW50Tm9kZVxuICAgICAgQHN0YXR1c0ljb24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChAc3RhdHVzSWNvbilcblxuICAgIEBwdHlQcm9jZXNzPy50ZXJtaW5hdGUoKVxuICAgIEB0ZXJtaW5hbD8uZGVzdHJveSgpXG5cbiAgbWF4aW1pemU6IC0+XG4gICAgQHN1YnNjcmlwdGlvbnMucmVtb3ZlIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgQG1heGltaXplQnRuLnRvb2x0aXAuZGlzcG9zZSgpXG5cbiAgICBAbWF4SGVpZ2h0ID0gQHByZXZIZWlnaHQgKyBhdG9tLndvcmtzcGFjZS5nZXRDZW50ZXIoKS5wYW5lQ29udGFpbmVyLmVsZW1lbnQub2Zmc2V0SGVpZ2h0XG4gICAgYnRuID0gQG1heGltaXplQnRuLmNoaWxkcmVuKCdzcGFuJylcbiAgICBAb25UcmFuc2l0aW9uRW5kID0+IEBmb2N1cygpXG5cbiAgICBpZiBAbWF4aW1pemVkXG4gICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgdGl0bGU6ICdGdWxsc2NyZWVuJ1xuICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICBAYWRqdXN0SGVpZ2h0IEBwcmV2SGVpZ2h0XG4gICAgICBidG4ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLW5vcm1hbCcpLmFkZENsYXNzKCdpY29uLXNjcmVlbi1mdWxsJylcbiAgICAgIEBtYXhpbWl6ZWQgPSBmYWxzZVxuICAgIGVsc2VcbiAgICAgIEBtYXhpbWl6ZUJ0bi50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQgQG1heGltaXplQnRuLFxuICAgICAgICB0aXRsZTogJ05vcm1hbCdcbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgQGFkanVzdEhlaWdodCBAbWF4SGVpZ2h0XG4gICAgICBidG4ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJylcbiAgICAgIEBtYXhpbWl6ZWQgPSB0cnVlXG5cbiAgb3BlbjogPT5cbiAgICBsYXN0QWN0aXZlRWxlbWVudCA/PSAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG5cbiAgICBpZiBsYXN0T3BlbmVkVmlldyBhbmQgbGFzdE9wZW5lZFZpZXcgIT0gdGhpc1xuICAgICAgaWYgbGFzdE9wZW5lZFZpZXcubWF4aW1pemVkXG4gICAgICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAbWF4aW1pemVCdG4udG9vbHRpcFxuICAgICAgICBAbWF4aW1pemVCdG4udG9vbHRpcC5kaXNwb3NlKClcbiAgICAgICAgaWNvbiA9IEBtYXhpbWl6ZUJ0bi5jaGlsZHJlbignc3BhbicpXG5cbiAgICAgICAgQG1heEhlaWdodCA9IGxhc3RPcGVuZWRWaWV3Lm1heEhlaWdodFxuICAgICAgICBAbWF4aW1pemVCdG4udG9vbHRpcCA9IGF0b20udG9vbHRpcHMuYWRkIEBtYXhpbWl6ZUJ0bixcbiAgICAgICAgICB0aXRsZTogJ05vcm1hbCdcbiAgICAgICAgQHN1YnNjcmlwdGlvbnMuYWRkIEBtYXhpbWl6ZUJ0bi50b29sdGlwXG4gICAgICAgIGljb24ucmVtb3ZlQ2xhc3MoJ2ljb24tc2NyZWVuLWZ1bGwnKS5hZGRDbGFzcygnaWNvbi1zY3JlZW4tbm9ybWFsJylcbiAgICAgICAgQG1heGltaXplZCA9IHRydWVcbiAgICAgIGxhc3RPcGVuZWRWaWV3LmhpZGUoKVxuXG4gICAgbGFzdE9wZW5lZFZpZXcgPSB0aGlzXG4gICAgQHN0YXR1c0Jhci5zZXRBY3RpdmVUZXJtaW5hbFZpZXcgdGhpc1xuICAgIEBzdGF0dXNJY29uLmFjdGl2YXRlKClcblxuICAgIEBvblRyYW5zaXRpb25FbmQgPT5cbiAgICAgIGlmIG5vdCBAb3BlbmVkXG4gICAgICAgIEBvcGVuZWQgPSB0cnVlXG4gICAgICAgIEBkaXNwbGF5VGVybWluYWwoKVxuICAgICAgICBAcHJldkhlaWdodCA9IEBuZWFyZXN0Um93KEB4dGVybS5oZWlnaHQoKSlcbiAgICAgICAgQHh0ZXJtLmhlaWdodChAcHJldkhlaWdodClcbiAgICAgICAgQGVtaXQgXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0ZXJtaW5hbC1vcGVuXCJcbiAgICAgIGVsc2VcbiAgICAgICAgQGZvY3VzKClcblxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAeHRlcm0uaGVpZ2h0IDBcbiAgICBAYW5pbWF0aW5nID0gdHJ1ZVxuICAgIEB4dGVybS5oZWlnaHQgaWYgQG1heGltaXplZCB0aGVuIEBtYXhIZWlnaHQgZWxzZSBAcHJldkhlaWdodFxuXG4gIGhpZGU6ID0+XG4gICAgQHRlcm1pbmFsPy5ibHVyKClcbiAgICBsYXN0T3BlbmVkVmlldyA9IG51bGxcbiAgICBAc3RhdHVzSWNvbi5kZWFjdGl2YXRlKClcblxuICAgIEBvblRyYW5zaXRpb25FbmQgPT5cbiAgICAgIEBwYW5lbC5oaWRlKClcbiAgICAgIHVubGVzcyBsYXN0T3BlbmVkVmlldz9cbiAgICAgICAgaWYgbGFzdEFjdGl2ZUVsZW1lbnQ/XG4gICAgICAgICAgbGFzdEFjdGl2ZUVsZW1lbnQuZm9jdXMoKVxuICAgICAgICAgIGxhc3RBY3RpdmVFbGVtZW50ID0gbnVsbFxuXG4gICAgQHh0ZXJtLmhlaWdodCBpZiBAbWF4aW1pemVkIHRoZW4gQG1heEhlaWdodCBlbHNlIEBwcmV2SGVpZ2h0XG4gICAgQGFuaW1hdGluZyA9IHRydWVcbiAgICBAeHRlcm0uaGVpZ2h0IDBcblxuICB0b2dnbGU6IC0+XG4gICAgcmV0dXJuIGlmIEBhbmltYXRpbmdcblxuICAgIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgQGhpZGUoKVxuICAgIGVsc2VcbiAgICAgIEBvcGVuKClcblxuICBpbnB1dDogKGRhdGEpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG5cbiAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgQHB0eVByb2Nlc3Muc2VuZCBldmVudDogJ2lucHV0JywgdGV4dDogZGF0YVxuXG4gIHJlc2l6ZTogKGNvbHMsIHJvd3MpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBAcHR5UHJvY2Vzcy5jaGlsZFByb2Nlc3M/XG5cbiAgICBAcHR5UHJvY2Vzcy5zZW5kIHtldmVudDogJ3Jlc2l6ZScsIHJvd3MsIGNvbHN9XG5cbiAgcHR5OiAoKSAtPlxuICAgIGlmIG5vdCBAb3BlbmVkXG4gICAgICB3YWl0ID0gbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgICAgQGVtaXR0ZXIub24gXCJwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbDp0ZXJtaW5hbC1vcGVuXCIsICgpID0+XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIHNldFRpbWVvdXQgcmVqZWN0LCAxMDAwXG5cbiAgICAgIHdhaXQudGhlbiAoKSA9PlxuICAgICAgICBAcHR5UHJvbWlzZSgpXG4gICAgZWxzZVxuICAgICAgQHB0eVByb21pc2UoKVxuXG4gIHB0eVByb21pc2U6ICgpIC0+XG4gICAgbmV3IFByb21pc2UgKHJlc29sdmUsIHJlamVjdCkgPT5cbiAgICAgIGlmIEBwdHlQcm9jZXNzP1xuICAgICAgICBAcHR5UHJvY2Vzcy5vbiBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsOnB0eVwiLCAocHR5KSA9PlxuICAgICAgICAgIHJlc29sdmUocHR5KVxuICAgICAgICBAcHR5UHJvY2Vzcy5zZW5kIHtldmVudDogJ3B0eSd9XG4gICAgICAgIHNldFRpbWVvdXQgcmVqZWN0LCAxMDAwXG4gICAgICBlbHNlXG4gICAgICAgIHJlamVjdCgpXG5cbiAgYXBwbHlTdHlsZTogLT5cbiAgICBjb25maWcgPSBhdG9tLmNvbmZpZy5nZXQgJ3BsYXRmb3JtaW8taWRlLXRlcm1pbmFsJ1xuXG4gICAgQHh0ZXJtLmFkZENsYXNzIGNvbmZpZy5zdHlsZS50aGVtZVxuICAgIEB4dGVybS5hZGRDbGFzcyAnY3Vyc29yLWJsaW5rJyBpZiBjb25maWcudG9nZ2xlcy5jdXJzb3JCbGlua1xuXG4gICAgZWRpdG9yRm9udCA9IGF0b20uY29uZmlnLmdldCgnZWRpdG9yLmZvbnRGYW1pbHknKVxuICAgIGRlZmF1bHRGb250ID0gXCJNZW5sbywgQ29uc29sYXMsICdEZWphVnUgU2FucyBNb25vJywgbW9ub3NwYWNlXCJcbiAgICBvdmVycmlkZUZvbnQgPSBjb25maWcuc3R5bGUuZm9udEZhbWlseVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udEZhbWlseScsIChldmVudCkgPT5cbiAgICAgIGVkaXRvckZvbnQgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udEZhbWlseSA9IG92ZXJyaWRlRm9udCBvciBlZGl0b3JGb250IG9yIGRlZmF1bHRGb250XG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5mb250RmFtaWx5JywgKGV2ZW50KSA9PlxuICAgICAgb3ZlcnJpZGVGb250ID0gZXZlbnQubmV3VmFsdWVcbiAgICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRGYW1pbHkgPSBvdmVycmlkZUZvbnQgb3IgZWRpdG9yRm9udCBvciBkZWZhdWx0Rm9udFxuXG4gICAgZWRpdG9yRm9udFNpemUgPSBhdG9tLmNvbmZpZy5nZXQoJ2VkaXRvci5mb250U2l6ZScpXG4gICAgb3ZlcnJpZGVGb250U2l6ZSA9IGNvbmZpZy5zdHlsZS5mb250U2l6ZVxuICAgIEB0ZXJtaW5hbC5lbGVtZW50LnN0eWxlLmZvbnRTaXplID0gXCIje292ZXJyaWRlRm9udFNpemUgb3IgZWRpdG9yRm9udFNpemV9cHhcIlxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdlZGl0b3IuZm9udFNpemUnLCAoZXZlbnQpID0+XG4gICAgICBlZGl0b3JGb250U2l6ZSA9IGV2ZW50Lm5ld1ZhbHVlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IFwiI3tvdmVycmlkZUZvbnRTaXplIG9yIGVkaXRvckZvbnRTaXplfXB4XCJcbiAgICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29uZmlnLm9uRGlkQ2hhbmdlICdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC5zdHlsZS5mb250U2l6ZScsIChldmVudCkgPT5cbiAgICAgIG92ZXJyaWRlRm9udFNpemUgPSBldmVudC5uZXdWYWx1ZVxuICAgICAgQHRlcm1pbmFsLmVsZW1lbnQuc3R5bGUuZm9udFNpemUgPSBcIiN7b3ZlcnJpZGVGb250U2l6ZSBvciBlZGl0b3JGb250U2l6ZX1weFwiXG4gICAgICBAcmVzaXplVGVybWluYWxUb1ZpZXcoKVxuXG4gICAgIyBmaXJzdCA4IGNvbG9ycyBpLmUuICdkYXJrJyBjb2xvcnNcbiAgICBAdGVybWluYWwuY29sb3JzWzAuLjddID0gW1xuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsYWNrLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC5yZWQudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmdyZWVuLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLm5vcm1hbC55ZWxsb3cudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmJsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLm1hZ2VudGEudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLmN5YW4udG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMubm9ybWFsLndoaXRlLnRvSGV4U3RyaW5nKClcbiAgICBdXG4gICAgIyAnYnJpZ2h0JyBjb2xvcnNcbiAgICBAdGVybWluYWwuY29sb3JzWzguLjE1XSA9IFtcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0QmxhY2sudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRSZWQudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRHcmVlbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFllbGxvdy50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodEJsdWUudG9IZXhTdHJpbmcoKVxuICAgICAgY29uZmlnLmFuc2lDb2xvcnMuekJyaWdodC5icmlnaHRNYWdlbnRhLnRvSGV4U3RyaW5nKClcbiAgICAgIGNvbmZpZy5hbnNpQ29sb3JzLnpCcmlnaHQuYnJpZ2h0Q3lhbi50b0hleFN0cmluZygpXG4gICAgICBjb25maWcuYW5zaUNvbG9ycy56QnJpZ2h0LmJyaWdodFdoaXRlLnRvSGV4U3RyaW5nKClcbiAgICBdXG5cbiAgYXR0YWNoV2luZG93RXZlbnRzOiAtPlxuICAgICQod2luZG93KS5vbiAncmVzaXplJywgQG9uV2luZG93UmVzaXplXG5cbiAgZGV0YWNoV2luZG93RXZlbnRzOiAtPlxuICAgICQod2luZG93KS5vZmYgJ3Jlc2l6ZScsIEBvbldpbmRvd1Jlc2l6ZVxuXG4gIGF0dGFjaFJlc2l6ZUV2ZW50czogLT5cbiAgICBAcGFuZWxEaXZpZGVyLm9uICdtb3VzZWRvd24nLCBAcmVzaXplU3RhcnRlZFxuXG4gIGRldGFjaFJlc2l6ZUV2ZW50czogLT5cbiAgICBAcGFuZWxEaXZpZGVyLm9mZiAnbW91c2Vkb3duJ1xuXG4gIG9uV2luZG93UmVzaXplOiA9PlxuICAgIGlmIG5vdCBAdGFiVmlld1xuICAgICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsICcnXG4gICAgICBuZXdIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KClcbiAgICAgIGJvdHRvbVBhbmVsID0gJCgnYXRvbS1wYW5lbC1jb250YWluZXIuYm90dG9tJykuZmlyc3QoKS5nZXQoMClcbiAgICAgIG92ZXJmbG93ID0gYm90dG9tUGFuZWwuc2Nyb2xsSGVpZ2h0IC0gYm90dG9tUGFuZWwub2Zmc2V0SGVpZ2h0XG5cbiAgICAgIGRlbHRhID0gbmV3SGVpZ2h0IC0gQHdpbmRvd0hlaWdodFxuICAgICAgQHdpbmRvd0hlaWdodCA9IG5ld0hlaWdodFxuXG4gICAgICBpZiBAbWF4aW1pemVkXG4gICAgICAgIGNsYW1wZWQgPSBNYXRoLm1heChAbWF4SGVpZ2h0ICsgZGVsdGEsIEByb3dIZWlnaHQpXG5cbiAgICAgICAgQGFkanVzdEhlaWdodCBjbGFtcGVkIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgICBAbWF4SGVpZ2h0ID0gY2xhbXBlZFxuXG4gICAgICAgIEBwcmV2SGVpZ2h0ID0gTWF0aC5taW4oQHByZXZIZWlnaHQsIEBtYXhIZWlnaHQpXG4gICAgICBlbHNlIGlmIG92ZXJmbG93ID4gMFxuICAgICAgICBjbGFtcGVkID0gTWF0aC5tYXgoQG5lYXJlc3RSb3coQHByZXZIZWlnaHQgKyBkZWx0YSksIEByb3dIZWlnaHQpXG5cbiAgICAgICAgQGFkanVzdEhlaWdodCBjbGFtcGVkIGlmIEBwYW5lbC5pc1Zpc2libGUoKVxuICAgICAgICBAcHJldkhlaWdodCA9IGNsYW1wZWRcblxuICAgICAgQHh0ZXJtLmNzcyAndHJhbnNpdGlvbicsIFwiaGVpZ2h0ICN7MC4yNSAvIEBhbmltYXRpb25TcGVlZH1zIGxpbmVhclwiXG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcblxuICByZXNpemVTdGFydGVkOiA9PlxuICAgIHJldHVybiBpZiBAbWF4aW1pemVkXG4gICAgQG1heEhlaWdodCA9IEBwcmV2SGVpZ2h0ICsgJCgnLml0ZW0tdmlld3MnKS5oZWlnaHQoKVxuICAgICQoZG9jdW1lbnQpLm9uKCdtb3VzZW1vdmUnLCBAcmVzaXplUGFuZWwpXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCBAcmVzaXplU3RvcHBlZClcbiAgICBAeHRlcm0uY3NzICd0cmFuc2l0aW9uJywgJydcblxuICByZXNpemVTdG9wcGVkOiA9PlxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2Vtb3ZlJywgQHJlc2l6ZVBhbmVsKVxuICAgICQoZG9jdW1lbnQpLm9mZignbW91c2V1cCcsIEByZXNpemVTdG9wcGVkKVxuICAgIEB4dGVybS5jc3MgJ3RyYW5zaXRpb24nLCBcImhlaWdodCAjezAuMjUgLyBAYW5pbWF0aW9uU3BlZWR9cyBsaW5lYXJcIlxuXG4gIG5lYXJlc3RSb3c6ICh2YWx1ZSkgLT5cbiAgICByb3dzID0gdmFsdWUgLy8gQHJvd0hlaWdodFxuICAgIHJldHVybiByb3dzICogQHJvd0hlaWdodFxuXG4gIHJlc2l6ZVBhbmVsOiAoZXZlbnQpID0+XG4gICAgcmV0dXJuIEByZXNpemVTdG9wcGVkKCkgdW5sZXNzIGV2ZW50LndoaWNoIGlzIDFcblxuICAgIG1vdXNlWSA9ICQod2luZG93KS5oZWlnaHQoKSAtIGV2ZW50LnBhZ2VZXG4gICAgZGVsdGEgPSBtb3VzZVkgLSAkKCdhdG9tLXBhbmVsLWNvbnRhaW5lci5ib3R0b20nKS5oZWlnaHQoKSAtICQoJ2F0b20tcGFuZWwtY29udGFpbmVyLmZvb3RlcicpLmhlaWdodCgpXG4gICAgcmV0dXJuIHVubGVzcyBNYXRoLmFicyhkZWx0YSkgPiAoQHJvd0hlaWdodCAqIDUgLyA2KVxuXG4gICAgY2xhbXBlZCA9IE1hdGgubWF4KEBuZWFyZXN0Um93KEBwcmV2SGVpZ2h0ICsgZGVsdGEpLCBAcm93SGVpZ2h0KVxuICAgIHJldHVybiBpZiBjbGFtcGVkID4gQG1heEhlaWdodFxuXG4gICAgQHh0ZXJtLmhlaWdodCBjbGFtcGVkXG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGNsYW1wZWRcbiAgICBAcHJldkhlaWdodCA9IGNsYW1wZWRcblxuICAgIEByZXNpemVUZXJtaW5hbFRvVmlldygpXG5cbiAgYWRqdXN0SGVpZ2h0OiAoaGVpZ2h0KSAtPlxuICAgIEB4dGVybS5oZWlnaHQgaGVpZ2h0XG4gICAgJChAdGVybWluYWwuZWxlbWVudCkuaGVpZ2h0IGhlaWdodFxuXG4gIGNvcHk6IC0+XG4gICAgaWYgQHRlcm1pbmFsLl9zZWxlY3RlZFxuICAgICAgdGV4dGFyZWEgPSBAdGVybWluYWwuZ2V0Q29weVRleHRhcmVhKClcbiAgICAgIHRleHQgPSBAdGVybWluYWwuZ3JhYlRleHQoXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueDIsXG4gICAgICAgIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTEsIEB0ZXJtaW5hbC5fc2VsZWN0ZWQueTIpXG4gICAgZWxzZVxuICAgICAgcmF3VGV4dCA9IEB0ZXJtaW5hbC5jb250ZXh0LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKClcbiAgICAgIHJhd0xpbmVzID0gcmF3VGV4dC5zcGxpdCgvXFxyP1xcbi9nKVxuICAgICAgbGluZXMgPSByYXdMaW5lcy5tYXAgKGxpbmUpIC0+XG4gICAgICAgIGxpbmUucmVwbGFjZSgvXFxzL2csIFwiIFwiKS50cmltUmlnaHQoKVxuICAgICAgdGV4dCA9IGxpbmVzLmpvaW4oXCJcXG5cIilcbiAgICBhdG9tLmNsaXBib2FyZC53cml0ZSB0ZXh0XG5cbiAgcGFzdGU6IC0+XG4gICAgQGlucHV0IGF0b20uY2xpcGJvYXJkLnJlYWQoKVxuXG4gIGluc2VydFNlbGVjdGlvbjogKGN1c3RvbVRleHQpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICBydW5Db21tYW5kID0gYXRvbS5jb25maWcuZ2V0KCdwbGF0Zm9ybWlvLWlkZS10ZXJtaW5hbC50b2dnbGVzLnJ1bkluc2VydGVkVGV4dCcpXG4gICAgc2VsZWN0aW9uVGV4dCA9ICcnXG4gICAgaWYgc2VsZWN0aW9uID0gZWRpdG9yLmdldFNlbGVjdGVkVGV4dCgpXG4gICAgICBAdGVybWluYWwuc3RvcFNjcm9sbGluZygpXG4gICAgICBzZWxlY3Rpb25UZXh0ID0gc2VsZWN0aW9uXG4gICAgZWxzZSBpZiBjdXJzb3IgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgbGluZSA9IGVkaXRvci5saW5lVGV4dEZvckJ1ZmZlclJvdyhjdXJzb3Iucm93KVxuICAgICAgQHRlcm1pbmFsLnN0b3BTY3JvbGxpbmcoKVxuICAgICAgc2VsZWN0aW9uVGV4dCA9IGxpbmVcbiAgICAgIGVkaXRvci5tb3ZlRG93bigxKTtcbiAgICBAaW5wdXQgXCIje2N1c3RvbVRleHQuXG4gICAgICByZXBsYWNlKC9cXCRMLywgXCIje2VkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnJvdyArIDF9XCIpLlxuICAgICAgcmVwbGFjZSgvXFwkRi8sIHBhdGguYmFzZW5hbWUoaWYgZWRpdG9yLmJ1ZmZlci5nZXRQYXRoKCkgdGhlbiBlZGl0b3IuYnVmZmVyLmdldFBhdGgoKSBlbHNlICcuJykpLlxuICAgICAgcmVwbGFjZSgvXFwkRC8sIHBhdGguZGlybmFtZShpZiBlZGl0b3IuYnVmZmVyLmdldFBhdGgoKSB0aGVuIGVkaXRvci5idWZmZXIuZ2V0UGF0aCgpIGVsc2UgJy4nKSkuXG4gICAgICByZXBsYWNlKC9cXCRTLywgc2VsZWN0aW9uVGV4dCkuXG4gICAgICByZXBsYWNlKC9cXCRcXCQvLCAnJCcpfSN7aWYgcnVuQ29tbWFuZCB0aGVuIG9zLkVPTCBlbHNlICcnfVwiXG5cbiAgZm9jdXM6IChmcm9tV2luZG93RXZlbnQpID0+XG4gICAgQHJlc2l6ZVRlcm1pbmFsVG9WaWV3KClcbiAgICBAZm9jdXNUZXJtaW5hbChmcm9tV2luZG93RXZlbnQpXG4gICAgQHN0YXR1c0Jhci5zZXRBY3RpdmVUZXJtaW5hbFZpZXcodGhpcylcbiAgICBzdXBlcigpXG5cbiAgYmx1cjogPT5cbiAgICBAYmx1clRlcm1pbmFsKClcbiAgICBzdXBlcigpXG5cbiAgZm9jdXNUZXJtaW5hbDogKGZyb21XaW5kb3dFdmVudCkgPT5cbiAgICByZXR1cm4gdW5sZXNzIEB0ZXJtaW5hbFxuXG4gICAgbGFzdEFjdGl2ZUVsZW1lbnQgPSAkKGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQpXG4gICAgcmV0dXJuIGlmIGZyb21XaW5kb3dFdmVudCBhbmQgbm90IChsYXN0QWN0aXZlRWxlbWVudC5pcygnZGl2LnRlcm1pbmFsJykgb3IgbGFzdEFjdGl2ZUVsZW1lbnQucGFyZW50cygnZGl2LnRlcm1pbmFsJykubGVuZ3RoKVxuXG4gICAgQHRlcm1pbmFsLmZvY3VzKClcbiAgICBpZiBAdGVybWluYWwuX3RleHRhcmVhXG4gICAgICBAdGVybWluYWwuX3RleHRhcmVhLmZvY3VzKClcbiAgICBlbHNlXG4gICAgICBAdGVybWluYWwuZWxlbWVudC5mb2N1cygpXG5cbiAgYmx1clRlcm1pbmFsOiA9PlxuICAgIHJldHVybiB1bmxlc3MgQHRlcm1pbmFsXG5cbiAgICBAdGVybWluYWwuYmx1cigpXG4gICAgQHRlcm1pbmFsLmVsZW1lbnQuYmx1cigpXG5cbiAgICBpZiBsYXN0QWN0aXZlRWxlbWVudD9cbiAgICAgIGxhc3RBY3RpdmVFbGVtZW50LmZvY3VzKClcblxuICByZXNpemVUZXJtaW5hbFRvVmlldzogLT5cbiAgICByZXR1cm4gdW5sZXNzIEBwYW5lbC5pc1Zpc2libGUoKSBvciBAdGFiVmlld1xuXG4gICAge2NvbHMsIHJvd3N9ID0gQGdldERpbWVuc2lvbnMoKVxuICAgIHJldHVybiB1bmxlc3MgY29scyA+IDAgYW5kIHJvd3MgPiAwXG4gICAgcmV0dXJuIHVubGVzcyBAdGVybWluYWxcbiAgICByZXR1cm4gaWYgQHRlcm1pbmFsLnJvd3MgaXMgcm93cyBhbmQgQHRlcm1pbmFsLmNvbHMgaXMgY29sc1xuXG4gICAgQHJlc2l6ZSBjb2xzLCByb3dzXG4gICAgQHRlcm1pbmFsLnJlc2l6ZSBjb2xzLCByb3dzXG5cbiAgZ2V0RGltZW5zaW9uczogLT5cbiAgICBmYWtlUm93ID0gJChcIjxkaXY+PHNwYW4+Jm5ic3A7PC9zcGFuPjwvZGl2PlwiKVxuXG4gICAgaWYgQHRlcm1pbmFsXG4gICAgICBAZmluZCgnLnRlcm1pbmFsJykuYXBwZW5kIGZha2VSb3dcbiAgICAgIGZha2VDb2wgPSBmYWtlUm93LmNoaWxkcmVuKCkuZmlyc3QoKVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyAoZmFrZUNvbC53aWR0aCBvciA5KVxuICAgICAgcm93cyA9IE1hdGguZmxvb3IgQHh0ZXJtLmhlaWdodCgpIC8gKGZha2VDb2wuaGVpZ2h0IG9yIDIwKVxuICAgICAgQHJvd0hlaWdodCA9IGZha2VDb2wuaGVpZ2h0XG4gICAgICBmYWtlUm93LnJlbW92ZSgpXG4gICAgZWxzZVxuICAgICAgY29scyA9IE1hdGguZmxvb3IgQHh0ZXJtLndpZHRoKCkgLyA5XG4gICAgICByb3dzID0gTWF0aC5mbG9vciBAeHRlcm0uaGVpZ2h0KCkgLyAyMFxuXG4gICAge2NvbHMsIHJvd3N9XG5cbiAgb25UcmFuc2l0aW9uRW5kOiAoY2FsbGJhY2spIC0+XG4gICAgQHh0ZXJtLm9uZSAnd2Via2l0VHJhbnNpdGlvbkVuZCcsID0+XG4gICAgICBjYWxsYmFjaygpXG4gICAgICBAYW5pbWF0aW5nID0gZmFsc2VcblxuICBpbnB1dERpYWxvZzogLT5cbiAgICBJbnB1dERpYWxvZyA/PSByZXF1aXJlKCcuL2lucHV0LWRpYWxvZycpXG4gICAgZGlhbG9nID0gbmV3IElucHV0RGlhbG9nIHRoaXNcbiAgICBkaWFsb2cuYXR0YWNoKClcblxuICByZW5hbWU6IC0+XG4gICAgQHN0YXR1c0ljb24ucmVuYW1lKClcblxuICB0b2dnbGVUYWJWaWV3OiAtPlxuICAgIGlmIEB0YWJWaWV3XG4gICAgICBAcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiB0aGlzLCB2aXNpYmxlOiBmYWxzZSlcbiAgICAgIEBhdHRhY2hSZXNpemVFdmVudHMoKVxuICAgICAgQGNsb3NlQnRuLnNob3coKVxuICAgICAgQGhpZGVCdG4uc2hvdygpXG4gICAgICBAbWF4aW1pemVCdG4uc2hvdygpXG4gICAgICBAdGFiVmlldyA9IGZhbHNlXG4gICAgZWxzZVxuICAgICAgQHBhbmVsLmRlc3Ryb3koKVxuICAgICAgQGRldGFjaFJlc2l6ZUV2ZW50cygpXG4gICAgICBAY2xvc2VCdG4uaGlkZSgpXG4gICAgICBAaGlkZUJ0bi5oaWRlKClcbiAgICAgIEBtYXhpbWl6ZUJ0bi5oaWRlKClcbiAgICAgIEB4dGVybS5jc3MgXCJoZWlnaHRcIiwgXCJcIlxuICAgICAgQHRhYlZpZXcgPSB0cnVlXG4gICAgICBsYXN0T3BlbmVkVmlldyA9IG51bGwgaWYgbGFzdE9wZW5lZFZpZXcgPT0gdGhpc1xuXG4gIGdldFRpdGxlOiAtPlxuICAgIEBzdGF0dXNJY29uLmdldE5hbWUoKSBvciBcInBsYXRmb3JtaW8taWRlLXRlcm1pbmFsXCJcblxuICBnZXRJY29uTmFtZTogLT5cbiAgICBcInRlcm1pbmFsXCJcblxuICBnZXRTaGVsbDogLT5cbiAgICByZXR1cm4gcGF0aC5iYXNlbmFtZSBAc2hlbGxcblxuICBnZXRTaGVsbFBhdGg6IC0+XG4gICAgcmV0dXJuIEBzaGVsbFxuXG4gIGVtaXQ6IChldmVudCwgZGF0YSkgLT5cbiAgICBAZW1pdHRlci5lbWl0IGV2ZW50LCBkYXRhXG5cbiAgb25EaWRDaGFuZ2VUaXRsZTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtY2hhbmdlLXRpdGxlJywgY2FsbGJhY2tcblxuICBnZXRQYXRoOiAtPlxuICAgIHJldHVybiBAZ2V0VGVybWluYWxUaXRsZSgpXG5cbiAgZ2V0VGVybWluYWxUaXRsZTogLT5cbiAgICByZXR1cm4gQHRpdGxlIG9yIEBwcm9jZXNzXG5cbiAgZ2V0VGVybWluYWw6IC0+XG4gICAgcmV0dXJuIEB0ZXJtaW5hbFxuXG4gIGlzQW5pbWF0aW5nOiAtPlxuICAgIHJldHVybiBAYW5pbWF0aW5nXG4iXX0=
