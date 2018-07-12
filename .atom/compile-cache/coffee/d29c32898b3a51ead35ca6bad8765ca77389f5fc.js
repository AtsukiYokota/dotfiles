(function() {
  var CompositeDisposable, Emitter, Logger, Metrics, os, path, ref, ref1,
    slice = [].slice;

  os = require('os');

  path = require('path');

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Emitter = ref.Emitter;

  ref1 = [], Metrics = ref1[0], Logger = ref1[1];

  window.DEBUG = false;

  module.exports = {
    config: {
      useKite: {
        type: 'boolean',
        "default": true,
        order: 0,
        title: 'Use Kite-powered Completions (macOS & Windows only)',
        description: 'Kite is a cloud powered autocomplete engine. Choosing\nthis option will allow you to get cloud powered completions and other\nfeatures in addition to the completions provided by Jedi.'
      },
      showDescriptions: {
        type: 'boolean',
        "default": true,
        order: 1,
        title: 'Show Descriptions',
        description: 'Show doc strings from functions, classes, etc.'
      },
      useSnippets: {
        type: 'string',
        "default": 'none',
        order: 2,
        "enum": ['none', 'all', 'required'],
        title: 'Autocomplete Function Parameters',
        description: 'Automatically complete function arguments after typing\nleft parenthesis character. Use completion key to jump between\narguments. See `autocomplete-python:complete-arguments` command if you\nwant to trigger argument completions manually. See README if it does not\nwork for you.'
      },
      pythonPaths: {
        type: 'string',
        "default": '',
        order: 3,
        title: 'Python Executable Paths',
        description: 'Optional semicolon separated list of paths to python\nexecutables (including executable names), where the first one will take\nhigher priority over the last one. By default autocomplete-python will\nautomatically look for virtual environments inside of your project and\ntry to use them as well as try to find global python executable. If you\nuse this config, automatic lookup will have lowest priority.\nUse `$PROJECT` or `$PROJECT_NAME` substitution for project-specific\npaths to point on executables in virtual environments.\nFor example:\n`/Users/name/.virtualenvs/$PROJECT_NAME/bin/python;$PROJECT/venv/bin/python3;/usr/bin/python`.\nSuch config will fall back on `/usr/bin/python` for projects not presented\nwith same name in `.virtualenvs` and without `venv` folder inside of one\nof project folders.\nIf you are using python3 executable while coding for python2 you will get\npython2 completions for some built-ins.'
      },
      extraPaths: {
        type: 'string',
        "default": '',
        order: 4,
        title: 'Extra Paths For Packages',
        description: 'Semicolon separated list of modules to additionally\ninclude for autocomplete. You can use same substitutions as in\n`Python Executable Paths`.\nNote that it still should be valid python package.\nFor example:\n`$PROJECT/env/lib/python2.7/site-packages`\nor\n`/User/name/.virtualenvs/$PROJECT_NAME/lib/python2.7/site-packages`.\nYou don\'t need to specify extra paths for libraries installed with python\nexecutable you use.'
      },
      caseInsensitiveCompletion: {
        type: 'boolean',
        "default": true,
        order: 5,
        title: 'Case Insensitive Completion',
        description: 'The completion is by default case insensitive.'
      },
      triggerCompletionRegex: {
        type: 'string',
        "default": '([\.\ (]|[a-zA-Z_][a-zA-Z0-9_]*)',
        order: 6,
        title: 'Regex To Trigger Autocompletions',
        description: 'By default completions triggered after words, dots, spaces\nand left parenthesis. You will need to restart your editor after changing\nthis.'
      },
      fuzzyMatcher: {
        type: 'boolean',
        "default": true,
        order: 7,
        title: 'Use Fuzzy Matcher For Completions.',
        description: 'Typing `stdr` will match `stderr`.\nFirst character should always match. Uses additional caching thus\ncompletions should be faster. Note that this setting does not affect\nbuilt-in autocomplete-plus provider.'
      },
      outputProviderErrors: {
        type: 'boolean',
        "default": false,
        order: 8,
        title: 'Output Provider Errors',
        description: 'Select if you would like to see the provider errors when\nthey happen. By default they are hidden. Note that critical errors are\nalways shown.'
      },
      outputDebug: {
        type: 'boolean',
        "default": false,
        order: 9,
        title: 'Output Debug Logs',
        description: 'Select if you would like to see debug information in\ndeveloper tools logs. May slow down your editor.'
      },
      showTooltips: {
        type: 'boolean',
        "default": false,
        order: 10,
        title: 'Show Tooltips with information about the object under the cursor',
        description: 'EXPERIMENTAL FEATURE WHICH IS NOT FINISHED YET.\nFeedback and ideas are welcome on github.'
      },
      suggestionPriority: {
        type: 'integer',
        "default": 3,
        minimum: 0,
        maximum: 99,
        order: 11,
        title: 'Suggestion Priority',
        description: 'You can use this to set the priority for autocomplete-python\nsuggestions. For example, you can use lower value to give higher priority\nfor snippets completions which has priority of 2.'
      },
      enableTouchBar: {
        type: 'boolean',
        "default": false,
        order: 12,
        title: 'Enable Touch Bar support',
        description: 'Proof of concept for now, requires tooltips to be enabled and Atom >=1.19.0.'
      }
    },
    installation: null,
    _handleGrammarChangeEvent: function(grammar) {
      var ref2;
      if ((ref2 = grammar.packageName) === 'language-python' || ref2 === 'MagicPython' || ref2 === 'atom-django') {
        this.provider.load();
        this.emitter.emit('did-load-provider');
        return this.disposables.dispose();
      }
    },
    _loadKite: function() {
      var AccountManager, AtomHelper, Installation, Installer, StateController, checkKiteInstallation, compatibility, editorCfg, event, firstInstall, longRunning, pluginCfg, ref2;
      firstInstall = localStorage.getItem('autocomplete-python.installed') === null;
      localStorage.setItem('autocomplete-python.installed', true);
      longRunning = require('process').uptime() > 10;
      if (firstInstall && longRunning) {
        event = "installed";
      } else if (firstInstall) {
        event = "upgraded";
      } else {
        event = "restarted";
      }
      ref2 = require('kite-installer'), AccountManager = ref2.AccountManager, AtomHelper = ref2.AtomHelper, compatibility = ref2.compatibility, Installation = ref2.Installation, Installer = ref2.Installer, Metrics = ref2.Metrics, Logger = ref2.Logger, StateController = ref2.StateController;
      if (atom.config.get('kite.loggingLevel')) {
        Logger.LEVEL = Logger.LEVELS[atom.config.get('kite.loggingLevel').toUpperCase()];
      }
      AccountManager.initClient('alpha.kite.com', -1, true);
      atom.views.addViewProvider(Installation, function(m) {
        return m.element;
      });
      editorCfg = {
        UUID: localStorage.getItem('metrics.userId'),
        name: 'atom'
      };
      pluginCfg = {
        name: 'autocomplete-python'
      };
      Metrics.Tracker.name = "atom acp";
      Metrics.enabled = atom.config.get('core.telemetryConsent') === 'limited';
      atom.packages.onDidActivatePackage((function(_this) {
        return function(pkg) {
          if (pkg.name === 'kite') {
            _this.patchKiteCompletions(pkg);
            return Metrics.Tracker.name = "atom kite+acp";
          }
        };
      })(this));
      checkKiteInstallation = (function(_this) {
        return function() {
          var canInstall, compatible;
          if (!atom.config.get('autocomplete-python.useKite')) {
            return;
          }
          canInstall = StateController.canInstallKite();
          compatible = compatibility.check();
          if (atom.config.get('autocomplete-python.useKite')) {
            return Promise.all([compatible, canInstall]).then(function(values) {
              var installer, pane, projectPath, root, title, variant;
              atom.config.set('autocomplete-python.useKite', true);
              variant = {};
              Metrics.Tracker.props = variant;
              Metrics.Tracker.props.lastEvent = event;
              title = "Choose a autocomplete-python engine";
              _this.installation = new Installation(variant, title);
              _this.installation.accountCreated(function() {
                return atom.config.set('autocomplete-python.useKite', true);
              });
              _this.installation.flowSkipped(function() {
                return atom.config.set('autocomplete-python.useKite', false);
              });
              projectPath = atom.project.getPaths()[0];
              root = (projectPath != null) && path.relative(os.homedir(), projectPath).indexOf('..') === 0 ? path.parse(projectPath).root : os.homedir();
              installer = new Installer([root]);
              installer.init(_this.installation.flow, function() {
                Logger.verbose('in onFinish');
                return atom.packages.activatePackage('kite');
              });
              pane = atom.workspace.getActivePane();
              _this.installation.flow.onSkipInstall(function() {
                atom.config.set('autocomplete-python.useKite', false);
                return pane.destroyActiveItem();
              });
              pane.addItem(_this.installation, {
                index: 0
              });
              return pane.activateItemAtIndex(0);
            }, function(err) {
              if (typeof err !== 'undefined' && err.type === 'denied') {
                return atom.config.set('autocomplete-python.useKite', false);
              }
            });
          }
        };
      })(this);
      checkKiteInstallation();
      return atom.config.onDidChange('autocomplete-python.useKite', function(arg) {
        var newValue, oldValue;
        newValue = arg.newValue, oldValue = arg.oldValue;
        if (newValue) {
          checkKiteInstallation();
          return AtomHelper.enablePackage();
        } else {
          return AtomHelper.disablePackage();
        }
      });
    },
    load: function() {
      var disposable;
      this.disposables = new CompositeDisposable;
      disposable = atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          _this._handleGrammarChangeEvent(editor.getGrammar());
          disposable = editor.onDidChangeGrammar(function(grammar) {
            return _this._handleGrammarChangeEvent(grammar);
          });
          return _this.disposables.add(disposable);
        };
      })(this));
      this.disposables.add(disposable);
      return this._loadKite();
    },
    activate: function(state) {
      var disposable;
      this.emitter = new Emitter;
      this.provider = require('./provider');
      if (typeof atom.packages.hasActivatedInitialPackages === 'function' && atom.packages.hasActivatedInitialPackages()) {
        return this.load();
      } else {
        return disposable = atom.packages.onDidActivateInitialPackages((function(_this) {
          return function() {
            _this.load();
            return disposable.dispose();
          };
        })(this));
      }
    },
    deactivate: function() {
      if (this.provider) {
        this.provider.dispose();
      }
      if (this.installation) {
        return this.installation.destroy();
      }
    },
    getProvider: function() {
      return this.provider;
    },
    getHyperclickProvider: function() {
      return require('./hyperclick-provider');
    },
    consumeSnippets: function(snippetsManager) {
      var disposable;
      return disposable = this.emitter.on('did-load-provider', (function(_this) {
        return function() {
          _this.provider.setSnippetsManager(snippetsManager);
          return disposable.dispose();
        };
      })(this));
    },
    patchKiteCompletions: function(kite) {
      var getSuggestions;
      if (this.kitePackage != null) {
        return;
      }
      this.kitePackage = kite.mainModule;
      this.kiteProvider = this.kitePackage.completions();
      getSuggestions = this.kiteProvider.getSuggestions;
      return this.kiteProvider.getSuggestions = (function(_this) {
        return function() {
          var args, ref2, ref3;
          args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
          return getSuggestions != null ? (ref2 = getSuggestions.apply(_this.kiteProvider, args)) != null ? (ref3 = ref2.then(function(suggestions) {
            _this.lastKiteSuggestions = suggestions;
            _this.kiteSuggested = suggestions != null;
            return suggestions;
          })) != null ? ref3["catch"](function(err) {
            _this.lastKiteSuggestions = [];
            _this.kiteSuggested = false;
            throw err;
          }) : void 0 : void 0 : void 0;
        };
      })(this);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUveW9rb3RhLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1weXRob24vbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxrRUFBQTtJQUFBOztFQUFBLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBaUMsT0FBQSxDQUFRLE1BQVIsQ0FBakMsRUFBQyw2Q0FBRCxFQUFzQjs7RUFFdEIsT0FBb0IsRUFBcEIsRUFBQyxpQkFBRCxFQUFVOztFQUVWLE1BQU0sQ0FBQyxLQUFQLEdBQWU7O0VBQ2YsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLE9BQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO1FBRUEsS0FBQSxFQUFPLENBRlA7UUFHQSxLQUFBLEVBQU8scURBSFA7UUFJQSxXQUFBLEVBQWEseUxBSmI7T0FERjtNQVFBLGdCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsS0FBQSxFQUFPLG1CQUhQO1FBSUEsV0FBQSxFQUFhLGdEQUpiO09BVEY7TUFjQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsTUFEVDtRQUVBLEtBQUEsRUFBTyxDQUZQO1FBR0EsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE1BQUQsRUFBUyxLQUFULEVBQWdCLFVBQWhCLENBSE47UUFJQSxLQUFBLEVBQU8sa0NBSlA7UUFLQSxXQUFBLEVBQWEseVJBTGI7T0FmRjtNQXlCQSxXQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMs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LENBQUE7TUFDaEIsY0FBQSxHQUFpQixJQUFDLENBQUEsWUFBWSxDQUFDO2FBQy9CLElBQUMsQ0FBQSxZQUFZLENBQUMsY0FBZCxHQUErQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7QUFDN0IsY0FBQTtVQUQ4Qjs7Ozs7NEJBTTlCLEVBQUUsS0FBRixFQUxBLENBS1EsU0FBQyxHQUFEO1lBQ04sS0FBQyxDQUFBLG1CQUFELEdBQXVCO1lBQ3ZCLEtBQUMsQ0FBQSxhQUFELEdBQWlCO0FBQ2pCLGtCQUFNO1VBSEEsQ0FMUjtRQUQ2QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7SUFOWCxDQWxRdEI7O0FBUkYiLCJzb3VyY2VzQ29udGVudCI6WyJvcyA9IHJlcXVpcmUgJ29zJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG57Q29tcG9zaXRlRGlzcG9zYWJsZSwgRW1pdHRlcn0gPSByZXF1aXJlICdhdG9tJ1xuXG5bTWV0cmljcywgTG9nZ2VyXSA9IFtdXG5cbndpbmRvdy5ERUJVRyA9IGZhbHNlXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGNvbmZpZzpcbiAgICB1c2VLaXRlOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogMFxuICAgICAgdGl0bGU6ICdVc2UgS2l0ZS1wb3dlcmVkIENvbXBsZXRpb25zIChtYWNPUyAmIFdpbmRvd3Mgb25seSknXG4gICAgICBkZXNjcmlwdGlvbjogJycnS2l0ZSBpcyBhIGNsb3VkIHBvd2VyZWQgYXV0b2NvbXBsZXRlIGVuZ2luZS4gQ2hvb3NpbmdcbiAgICAgIHRoaXMgb3B0aW9uIHdpbGwgYWxsb3cgeW91IHRvIGdldCBjbG91ZCBwb3dlcmVkIGNvbXBsZXRpb25zIGFuZCBvdGhlclxuICAgICAgZmVhdHVyZXMgaW4gYWRkaXRpb24gdG8gdGhlIGNvbXBsZXRpb25zIHByb3ZpZGVkIGJ5IEplZGkuJycnXG4gICAgc2hvd0Rlc2NyaXB0aW9uczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDFcbiAgICAgIHRpdGxlOiAnU2hvdyBEZXNjcmlwdGlvbnMnXG4gICAgICBkZXNjcmlwdGlvbjogJ1Nob3cgZG9jIHN0cmluZ3MgZnJvbSBmdW5jdGlvbnMsIGNsYXNzZXMsIGV0Yy4nXG4gICAgdXNlU25pcHBldHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJ25vbmUnXG4gICAgICBvcmRlcjogMlxuICAgICAgZW51bTogWydub25lJywgJ2FsbCcsICdyZXF1aXJlZCddXG4gICAgICB0aXRsZTogJ0F1dG9jb21wbGV0ZSBGdW5jdGlvbiBQYXJhbWV0ZXJzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0F1dG9tYXRpY2FsbHkgY29tcGxldGUgZnVuY3Rpb24gYXJndW1lbnRzIGFmdGVyIHR5cGluZ1xuICAgICAgbGVmdCBwYXJlbnRoZXNpcyBjaGFyYWN0ZXIuIFVzZSBjb21wbGV0aW9uIGtleSB0byBqdW1wIGJldHdlZW5cbiAgICAgIGFyZ3VtZW50cy4gU2VlIGBhdXRvY29tcGxldGUtcHl0aG9uOmNvbXBsZXRlLWFyZ3VtZW50c2AgY29tbWFuZCBpZiB5b3VcbiAgICAgIHdhbnQgdG8gdHJpZ2dlciBhcmd1bWVudCBjb21wbGV0aW9ucyBtYW51YWxseS4gU2VlIFJFQURNRSBpZiBpdCBkb2VzIG5vdFxuICAgICAgd29yayBmb3IgeW91LicnJ1xuICAgIHB5dGhvblBhdGhzOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICcnXG4gICAgICBvcmRlcjogM1xuICAgICAgdGl0bGU6ICdQeXRob24gRXhlY3V0YWJsZSBQYXRocydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydPcHRpb25hbCBzZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgcGF0aHMgdG8gcHl0aG9uXG4gICAgICBleGVjdXRhYmxlcyAoaW5jbHVkaW5nIGV4ZWN1dGFibGUgbmFtZXMpLCB3aGVyZSB0aGUgZmlyc3Qgb25lIHdpbGwgdGFrZVxuICAgICAgaGlnaGVyIHByaW9yaXR5IG92ZXIgdGhlIGxhc3Qgb25lLiBCeSBkZWZhdWx0IGF1dG9jb21wbGV0ZS1weXRob24gd2lsbFxuICAgICAgYXV0b21hdGljYWxseSBsb29rIGZvciB2aXJ0dWFsIGVudmlyb25tZW50cyBpbnNpZGUgb2YgeW91ciBwcm9qZWN0IGFuZFxuICAgICAgdHJ5IHRvIHVzZSB0aGVtIGFzIHdlbGwgYXMgdHJ5IHRvIGZpbmQgZ2xvYmFsIHB5dGhvbiBleGVjdXRhYmxlLiBJZiB5b3VcbiAgICAgIHVzZSB0aGlzIGNvbmZpZywgYXV0b21hdGljIGxvb2t1cCB3aWxsIGhhdmUgbG93ZXN0IHByaW9yaXR5LlxuICAgICAgVXNlIGAkUFJPSkVDVGAgb3IgYCRQUk9KRUNUX05BTUVgIHN1YnN0aXR1dGlvbiBmb3IgcHJvamVjdC1zcGVjaWZpY1xuICAgICAgcGF0aHMgdG8gcG9pbnQgb24gZXhlY3V0YWJsZXMgaW4gdmlydHVhbCBlbnZpcm9ubWVudHMuXG4gICAgICBGb3IgZXhhbXBsZTpcbiAgICAgIGAvVXNlcnMvbmFtZS8udmlydHVhbGVudnMvJFBST0pFQ1RfTkFNRS9iaW4vcHl0aG9uOyRQUk9KRUNUL3ZlbnYvYmluL3B5dGhvbjM7L3Vzci9iaW4vcHl0aG9uYC5cbiAgICAgIFN1Y2ggY29uZmlnIHdpbGwgZmFsbCBiYWNrIG9uIGAvdXNyL2Jpbi9weXRob25gIGZvciBwcm9qZWN0cyBub3QgcHJlc2VudGVkXG4gICAgICB3aXRoIHNhbWUgbmFtZSBpbiBgLnZpcnR1YWxlbnZzYCBhbmQgd2l0aG91dCBgdmVudmAgZm9sZGVyIGluc2lkZSBvZiBvbmVcbiAgICAgIG9mIHByb2plY3QgZm9sZGVycy5cbiAgICAgIElmIHlvdSBhcmUgdXNpbmcgcHl0aG9uMyBleGVjdXRhYmxlIHdoaWxlIGNvZGluZyBmb3IgcHl0aG9uMiB5b3Ugd2lsbCBnZXRcbiAgICAgIHB5dGhvbjIgY29tcGxldGlvbnMgZm9yIHNvbWUgYnVpbHQtaW5zLicnJ1xuICAgIGV4dHJhUGF0aHM6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogJydcbiAgICAgIG9yZGVyOiA0XG4gICAgICB0aXRsZTogJ0V4dHJhIFBhdGhzIEZvciBQYWNrYWdlcydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZW1pY29sb24gc2VwYXJhdGVkIGxpc3Qgb2YgbW9kdWxlcyB0byBhZGRpdGlvbmFsbHlcbiAgICAgIGluY2x1ZGUgZm9yIGF1dG9jb21wbGV0ZS4gWW91IGNhbiB1c2Ugc2FtZSBzdWJzdGl0dXRpb25zIGFzIGluXG4gICAgICBgUHl0aG9uIEV4ZWN1dGFibGUgUGF0aHNgLlxuICAgICAgTm90ZSB0aGF0IGl0IHN0aWxsIHNob3VsZCBiZSB2YWxpZCBweXRob24gcGFja2FnZS5cbiAgICAgIEZvciBleGFtcGxlOlxuICAgICAgYCRQUk9KRUNUL2Vudi9saWIvcHl0aG9uMi43L3NpdGUtcGFja2FnZXNgXG4gICAgICBvclxuICAgICAgYC9Vc2VyL25hbWUvLnZpcnR1YWxlbnZzLyRQUk9KRUNUX05BTUUvbGliL3B5dGhvbjIuNy9zaXRlLXBhY2thZ2VzYC5cbiAgICAgIFlvdSBkb24ndCBuZWVkIHRvIHNwZWNpZnkgZXh0cmEgcGF0aHMgZm9yIGxpYnJhcmllcyBpbnN0YWxsZWQgd2l0aCBweXRob25cbiAgICAgIGV4ZWN1dGFibGUgeW91IHVzZS4nJydcbiAgICBjYXNlSW5zZW5zaXRpdmVDb21wbGV0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogNVxuICAgICAgdGl0bGU6ICdDYXNlIEluc2Vuc2l0aXZlIENvbXBsZXRpb24nXG4gICAgICBkZXNjcmlwdGlvbjogJ1RoZSBjb21wbGV0aW9uIGlzIGJ5IGRlZmF1bHQgY2FzZSBpbnNlbnNpdGl2ZS4nXG4gICAgdHJpZ2dlckNvbXBsZXRpb25SZWdleDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnKFtcXC5cXCAoXXxbYS16QS1aX11bYS16QS1aMC05X10qKSdcbiAgICAgIG9yZGVyOiA2XG4gICAgICB0aXRsZTogJ1JlZ2V4IFRvIFRyaWdnZXIgQXV0b2NvbXBsZXRpb25zJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ0J5IGRlZmF1bHQgY29tcGxldGlvbnMgdHJpZ2dlcmVkIGFmdGVyIHdvcmRzLCBkb3RzLCBzcGFjZXNcbiAgICAgIGFuZCBsZWZ0IHBhcmVudGhlc2lzLiBZb3Ugd2lsbCBuZWVkIHRvIHJlc3RhcnQgeW91ciBlZGl0b3IgYWZ0ZXIgY2hhbmdpbmdcbiAgICAgIHRoaXMuJycnXG4gICAgZnV6enlNYXRjaGVyOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgICBvcmRlcjogN1xuICAgICAgdGl0bGU6ICdVc2UgRnV6enkgTWF0Y2hlciBGb3IgQ29tcGxldGlvbnMuJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1R5cGluZyBgc3RkcmAgd2lsbCBtYXRjaCBgc3RkZXJyYC5cbiAgICAgIEZpcnN0IGNoYXJhY3RlciBzaG91bGQgYWx3YXlzIG1hdGNoLiBVc2VzIGFkZGl0aW9uYWwgY2FjaGluZyB0aHVzXG4gICAgICBjb21wbGV0aW9ucyBzaG91bGQgYmUgZmFzdGVyLiBOb3RlIHRoYXQgdGhpcyBzZXR0aW5nIGRvZXMgbm90IGFmZmVjdFxuICAgICAgYnVpbHQtaW4gYXV0b2NvbXBsZXRlLXBsdXMgcHJvdmlkZXIuJycnXG4gICAgb3V0cHV0UHJvdmlkZXJFcnJvcnM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOFxuICAgICAgdGl0bGU6ICdPdXRwdXQgUHJvdmlkZXIgRXJyb3JzJ1xuICAgICAgZGVzY3JpcHRpb246ICcnJ1NlbGVjdCBpZiB5b3Ugd291bGQgbGlrZSB0byBzZWUgdGhlIHByb3ZpZGVyIGVycm9ycyB3aGVuXG4gICAgICB0aGV5IGhhcHBlbi4gQnkgZGVmYXVsdCB0aGV5IGFyZSBoaWRkZW4uIE5vdGUgdGhhdCBjcml0aWNhbCBlcnJvcnMgYXJlXG4gICAgICBhbHdheXMgc2hvd24uJycnXG4gICAgb3V0cHV0RGVidWc6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogOVxuICAgICAgdGl0bGU6ICdPdXRwdXQgRGVidWcgTG9ncydcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydTZWxlY3QgaWYgeW91IHdvdWxkIGxpa2UgdG8gc2VlIGRlYnVnIGluZm9ybWF0aW9uIGluXG4gICAgICBkZXZlbG9wZXIgdG9vbHMgbG9ncy4gTWF5IHNsb3cgZG93biB5b3VyIGVkaXRvci4nJydcbiAgICBzaG93VG9vbHRpcHM6XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgICBvcmRlcjogMTBcbiAgICAgIHRpdGxlOiAnU2hvdyBUb29sdGlwcyB3aXRoIGluZm9ybWF0aW9uIGFib3V0IHRoZSBvYmplY3QgdW5kZXIgdGhlIGN1cnNvcidcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydFWFBFUklNRU5UQUwgRkVBVFVSRSBXSElDSCBJUyBOT1QgRklOSVNIRUQgWUVULlxuICAgICAgRmVlZGJhY2sgYW5kIGlkZWFzIGFyZSB3ZWxjb21lIG9uIGdpdGh1Yi4nJydcbiAgICBzdWdnZXN0aW9uUHJpb3JpdHk6XG4gICAgICB0eXBlOiAnaW50ZWdlcidcbiAgICAgIGRlZmF1bHQ6IDNcbiAgICAgIG1pbmltdW06IDBcbiAgICAgIG1heGltdW06IDk5XG4gICAgICBvcmRlcjogMTFcbiAgICAgIHRpdGxlOiAnU3VnZ2VzdGlvbiBQcmlvcml0eSdcbiAgICAgIGRlc2NyaXB0aW9uOiAnJydZb3UgY2FuIHVzZSB0aGlzIHRvIHNldCB0aGUgcHJpb3JpdHkgZm9yIGF1dG9jb21wbGV0ZS1weXRob25cbiAgICAgIHN1Z2dlc3Rpb25zLiBGb3IgZXhhbXBsZSwgeW91IGNhbiB1c2UgbG93ZXIgdmFsdWUgdG8gZ2l2ZSBoaWdoZXIgcHJpb3JpdHlcbiAgICAgIGZvciBzbmlwcGV0cyBjb21wbGV0aW9ucyB3aGljaCBoYXMgcHJpb3JpdHkgb2YgMi4nJydcbiAgICBlbmFibGVUb3VjaEJhcjpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICAgIG9yZGVyOiAxMlxuICAgICAgdGl0bGU6ICdFbmFibGUgVG91Y2ggQmFyIHN1cHBvcnQnXG4gICAgICBkZXNjcmlwdGlvbjogJycnUHJvb2Ygb2YgY29uY2VwdCBmb3Igbm93LCByZXF1aXJlcyB0b29sdGlwcyB0byBiZSBlbmFibGVkIGFuZCBBdG9tID49MS4xOS4wLicnJ1xuXG4gIGluc3RhbGxhdGlvbjogbnVsbFxuXG4gIF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQ6IChncmFtbWFyKSAtPlxuICAgICMgdGhpcyBzaG91bGQgYmUgc2FtZSB3aXRoIGFjdGl2YXRpb25Ib29rcyBuYW1lc1xuICAgIGlmIGdyYW1tYXIucGFja2FnZU5hbWUgaW4gWydsYW5ndWFnZS1weXRob24nLCAnTWFnaWNQeXRob24nLCAnYXRvbS1kamFuZ28nXVxuICAgICAgQHByb3ZpZGVyLmxvYWQoKVxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWxvYWQtcHJvdmlkZXInXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgX2xvYWRLaXRlOiAtPlxuICAgIGZpcnN0SW5zdGFsbCA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhdXRvY29tcGxldGUtcHl0aG9uLmluc3RhbGxlZCcpID09IG51bGxcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYXV0b2NvbXBsZXRlLXB5dGhvbi5pbnN0YWxsZWQnLCB0cnVlKVxuICAgIGxvbmdSdW5uaW5nID0gcmVxdWlyZSgncHJvY2VzcycpLnVwdGltZSgpID4gMTBcbiAgICBpZiBmaXJzdEluc3RhbGwgYW5kIGxvbmdSdW5uaW5nXG4gICAgICBldmVudCA9IFwiaW5zdGFsbGVkXCJcbiAgICBlbHNlIGlmIGZpcnN0SW5zdGFsbFxuICAgICAgZXZlbnQgPSBcInVwZ3JhZGVkXCJcbiAgICBlbHNlXG4gICAgICBldmVudCA9IFwicmVzdGFydGVkXCJcblxuICAgIHtcbiAgICAgIEFjY291bnRNYW5hZ2VyLFxuICAgICAgQXRvbUhlbHBlcixcbiAgICAgIGNvbXBhdGliaWxpdHksXG4gICAgICBJbnN0YWxsYXRpb24sXG4gICAgICBJbnN0YWxsZXIsXG4gICAgICBNZXRyaWNzLFxuICAgICAgTG9nZ2VyLFxuICAgICAgU3RhdGVDb250cm9sbGVyXG4gICAgfSA9IHJlcXVpcmUgJ2tpdGUtaW5zdGFsbGVyJ1xuXG4gICAgaWYgYXRvbS5jb25maWcuZ2V0KCdraXRlLmxvZ2dpbmdMZXZlbCcpXG4gICAgICBMb2dnZXIuTEVWRUwgPSBMb2dnZXIuTEVWRUxTW2F0b20uY29uZmlnLmdldCgna2l0ZS5sb2dnaW5nTGV2ZWwnKS50b1VwcGVyQ2FzZSgpXVxuXG4gICAgQWNjb3VudE1hbmFnZXIuaW5pdENsaWVudCAnYWxwaGEua2l0ZS5jb20nLCAtMSwgdHJ1ZVxuICAgIGF0b20udmlld3MuYWRkVmlld1Byb3ZpZGVyIEluc3RhbGxhdGlvbiwgKG0pIC0+IG0uZWxlbWVudFxuICAgIGVkaXRvckNmZyA9XG4gICAgICBVVUlEOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnbWV0cmljcy51c2VySWQnKVxuICAgICAgbmFtZTogJ2F0b20nXG4gICAgcGx1Z2luQ2ZnID1cbiAgICAgIG5hbWU6ICdhdXRvY29tcGxldGUtcHl0aG9uJ1xuXG4gICAgTWV0cmljcy5UcmFja2VyLm5hbWUgPSBcImF0b20gYWNwXCJcbiAgICBNZXRyaWNzLmVuYWJsZWQgPSBhdG9tLmNvbmZpZy5nZXQoJ2NvcmUudGVsZW1ldHJ5Q29uc2VudCcpIGlzICdsaW1pdGVkJ1xuXG4gICAgYXRvbS5wYWNrYWdlcy5vbkRpZEFjdGl2YXRlUGFja2FnZSAocGtnKSA9PlxuICAgICAgaWYgcGtnLm5hbWUgaXMgJ2tpdGUnXG4gICAgICAgIEBwYXRjaEtpdGVDb21wbGV0aW9ucyhwa2cpXG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5uYW1lID0gXCJhdG9tIGtpdGUrYWNwXCJcblxuICAgIGNoZWNrS2l0ZUluc3RhbGxhdGlvbiA9ICgpID0+XG4gICAgICBpZiBub3QgYXRvbS5jb25maWcuZ2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnXG4gICAgICAgIHJldHVyblxuICAgICAgY2FuSW5zdGFsbCA9IFN0YXRlQ29udHJvbGxlci5jYW5JbnN0YWxsS2l0ZSgpXG4gICAgICBjb21wYXRpYmxlID0gY29tcGF0aWJpbGl0eS5jaGVjaygpXG4gICAgICBQcm9taXNlLmFsbChbY29tcGF0aWJsZSwgY2FuSW5zdGFsbF0pLnRoZW4oKHZhbHVlcykgPT5cbiAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCB0cnVlXG4gICAgICAgIHZhcmlhbnQgPSB7fVxuICAgICAgICBNZXRyaWNzLlRyYWNrZXIucHJvcHMgPSB2YXJpYW50XG4gICAgICAgIE1ldHJpY3MuVHJhY2tlci5wcm9wcy5sYXN0RXZlbnQgPSBldmVudFxuICAgICAgICB0aXRsZSA9IFwiQ2hvb3NlIGEgYXV0b2NvbXBsZXRlLXB5dGhvbiBlbmdpbmVcIlxuICAgICAgICBAaW5zdGFsbGF0aW9uID0gbmV3IEluc3RhbGxhdGlvbiB2YXJpYW50LCB0aXRsZVxuICAgICAgICBAaW5zdGFsbGF0aW9uLmFjY291bnRDcmVhdGVkKCgpID0+XG4gICAgICAgICAgYXRvbS5jb25maWcuc2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnLCB0cnVlXG4gICAgICAgIClcbiAgICAgICAgQGluc3RhbGxhdGlvbi5mbG93U2tpcHBlZCgoKSA9PlxuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICAgKVxuICAgICAgICBbcHJvamVjdFBhdGhdID0gYXRvbS5wcm9qZWN0LmdldFBhdGhzKClcbiAgICAgICAgcm9vdCA9IGlmIHByb2plY3RQYXRoPyBhbmQgcGF0aC5yZWxhdGl2ZShvcy5ob21lZGlyKCksIHByb2plY3RQYXRoKS5pbmRleE9mKCcuLicpIGlzIDBcbiAgICAgICAgICBwYXRoLnBhcnNlKHByb2plY3RQYXRoKS5yb290XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBvcy5ob21lZGlyKClcblxuICAgICAgICBpbnN0YWxsZXIgPSBuZXcgSW5zdGFsbGVyKFtyb290XSlcbiAgICAgICAgaW5zdGFsbGVyLmluaXQgQGluc3RhbGxhdGlvbi5mbG93LCAtPlxuICAgICAgICAgIExvZ2dlci52ZXJib3NlKCdpbiBvbkZpbmlzaCcpXG4gICAgICAgICAgYXRvbS5wYWNrYWdlcy5hY3RpdmF0ZVBhY2thZ2UoJ2tpdGUnKVxuXG4gICAgICAgIHBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICAgICAgQGluc3RhbGxhdGlvbi5mbG93Lm9uU2tpcEluc3RhbGwgKCkgPT5cbiAgICAgICAgICBhdG9tLmNvbmZpZy5zZXQgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsIGZhbHNlXG4gICAgICAgICAgcGFuZS5kZXN0cm95QWN0aXZlSXRlbSgpXG4gICAgICAgIHBhbmUuYWRkSXRlbSBAaW5zdGFsbGF0aW9uLCBpbmRleDogMFxuICAgICAgICBwYW5lLmFjdGl2YXRlSXRlbUF0SW5kZXggMFxuICAgICAgLCAoZXJyKSA9PlxuICAgICAgICBpZiB0eXBlb2YgZXJyICE9ICd1bmRlZmluZWQnIGFuZCBlcnIudHlwZSA9PSAnZGVuaWVkJ1xuICAgICAgICAgIGF0b20uY29uZmlnLnNldCAnYXV0b2NvbXBsZXRlLXB5dGhvbi51c2VLaXRlJywgZmFsc2VcbiAgICAgICkgaWYgYXRvbS5jb25maWcuZ2V0ICdhdXRvY29tcGxldGUtcHl0aG9uLnVzZUtpdGUnXG5cbiAgICBjaGVja0tpdGVJbnN0YWxsYXRpb24oKVxuXG4gICAgYXRvbS5jb25maWcub25EaWRDaGFuZ2UgJ2F1dG9jb21wbGV0ZS1weXRob24udXNlS2l0ZScsICh7IG5ld1ZhbHVlLCBvbGRWYWx1ZSB9KSAtPlxuICAgICAgaWYgbmV3VmFsdWVcbiAgICAgICAgY2hlY2tLaXRlSW5zdGFsbGF0aW9uKClcbiAgICAgICAgQXRvbUhlbHBlci5lbmFibGVQYWNrYWdlKClcbiAgICAgIGVsc2VcbiAgICAgICAgQXRvbUhlbHBlci5kaXNhYmxlUGFja2FnZSgpXG5cbiAgbG9hZDogLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGRpc3Bvc2FibGUgPSBhdG9tLndvcmtzcGFjZS5vYnNlcnZlVGV4dEVkaXRvcnMgKGVkaXRvcikgPT5cbiAgICAgIEBfaGFuZGxlR3JhbW1hckNoYW5nZUV2ZW50KGVkaXRvci5nZXRHcmFtbWFyKCkpXG4gICAgICBkaXNwb3NhYmxlID0gZWRpdG9yLm9uRGlkQ2hhbmdlR3JhbW1hciAoZ3JhbW1hcikgPT5cbiAgICAgICAgQF9oYW5kbGVHcmFtbWFyQ2hhbmdlRXZlbnQoZ3JhbW1hcilcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxuICAgIEBkaXNwb3NhYmxlcy5hZGQgZGlzcG9zYWJsZVxuICAgIEBfbG9hZEtpdGUoKVxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgQGVtaXR0ZXIgPSBuZXcgRW1pdHRlclxuICAgIEBwcm92aWRlciA9IHJlcXVpcmUoJy4vcHJvdmlkZXInKVxuICAgIGlmIHR5cGVvZiBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcyA9PSAnZnVuY3Rpb24nIGFuZFxuICAgICAgICBhdG9tLnBhY2thZ2VzLmhhc0FjdGl2YXRlZEluaXRpYWxQYWNrYWdlcygpXG4gICAgICBAbG9hZCgpXG4gICAgZWxzZVxuICAgICAgZGlzcG9zYWJsZSA9IGF0b20ucGFja2FnZXMub25EaWRBY3RpdmF0ZUluaXRpYWxQYWNrYWdlcyA9PlxuICAgICAgICBAbG9hZCgpXG4gICAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAcHJvdmlkZXIuZGlzcG9zZSgpIGlmIEBwcm92aWRlclxuICAgIEBpbnN0YWxsYXRpb24uZGVzdHJveSgpIGlmIEBpbnN0YWxsYXRpb25cblxuICBnZXRQcm92aWRlcjogLT5cbiAgICByZXR1cm4gQHByb3ZpZGVyXG5cbiAgZ2V0SHlwZXJjbGlja1Byb3ZpZGVyOiAtPlxuICAgIHJldHVybiByZXF1aXJlKCcuL2h5cGVyY2xpY2stcHJvdmlkZXInKVxuXG4gIGNvbnN1bWVTbmlwcGV0czogKHNuaXBwZXRzTWFuYWdlcikgLT5cbiAgICBkaXNwb3NhYmxlID0gQGVtaXR0ZXIub24gJ2RpZC1sb2FkLXByb3ZpZGVyJywgPT5cbiAgICAgIEBwcm92aWRlci5zZXRTbmlwcGV0c01hbmFnZXIgc25pcHBldHNNYW5hZ2VyXG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKVxuXG4gIHBhdGNoS2l0ZUNvbXBsZXRpb25zOiAoa2l0ZSkgLT5cbiAgICByZXR1cm4gaWYgQGtpdGVQYWNrYWdlP1xuXG4gICAgQGtpdGVQYWNrYWdlID0ga2l0ZS5tYWluTW9kdWxlXG4gICAgQGtpdGVQcm92aWRlciA9IEBraXRlUGFja2FnZS5jb21wbGV0aW9ucygpXG4gICAgZ2V0U3VnZ2VzdGlvbnMgPSBAa2l0ZVByb3ZpZGVyLmdldFN1Z2dlc3Rpb25zXG4gICAgQGtpdGVQcm92aWRlci5nZXRTdWdnZXN0aW9ucyA9IChhcmdzLi4uKSA9PlxuICAgICAgZ2V0U3VnZ2VzdGlvbnM/LmFwcGx5KEBraXRlUHJvdmlkZXIsIGFyZ3MpXG4gICAgICA/LnRoZW4gKHN1Z2dlc3Rpb25zKSA9PlxuICAgICAgICBAbGFzdEtpdGVTdWdnZXN0aW9ucyA9IHN1Z2dlc3Rpb25zXG4gICAgICAgIEBraXRlU3VnZ2VzdGVkID0gc3VnZ2VzdGlvbnM/XG4gICAgICAgIHN1Z2dlc3Rpb25zXG4gICAgICA/LmNhdGNoIChlcnIpID0+XG4gICAgICAgIEBsYXN0S2l0ZVN1Z2dlc3Rpb25zID0gW11cbiAgICAgICAgQGtpdGVTdWdnZXN0ZWQgPSBmYWxzZVxuICAgICAgICB0aHJvdyBlcnJcbiJdfQ==
