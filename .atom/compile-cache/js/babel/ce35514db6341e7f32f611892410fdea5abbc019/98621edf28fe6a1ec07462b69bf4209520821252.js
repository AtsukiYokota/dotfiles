'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = {
  panelVisibility: {
    title: 'Panel Visibility',
    description: 'Set when the build panel should be visible.',
    type: 'string',
    'default': 'Toggle',
    'enum': ['Toggle', 'Keep Visible', 'Show on Error', 'Hidden'],
    order: 1
  },
  hidePanelHeading: {
    title: 'Hide panel heading',
    description: 'Set whether to hide the build command and control buttons in the build panel',
    type: 'boolean',
    'default': false,
    order: 2
  },
  buildOnSave: {
    title: 'Automatically build on save',
    description: 'Automatically build your project each time an editor is saved.',
    type: 'boolean',
    'default': false,
    order: 3
  },
  saveOnBuild: {
    title: 'Automatically save on build',
    description: 'Automatically save all edited files when triggering a build.',
    type: 'boolean',
    'default': false,
    order: 4
  },
  matchedErrorFailsBuild: {
    title: 'Any matched error will fail the build',
    description: 'Even if the build has a return code of zero it is marked as "failed" if any error is being matched in the output.',
    type: 'boolean',
    'default': true,
    order: 5
  },
  scrollOnError: {
    title: 'Automatically scroll on build error',
    description: 'Automatically scroll to first matched error when a build failed.',
    type: 'boolean',
    'default': false,
    order: 6
  },
  stealFocus: {
    title: 'Steal Focus',
    description: 'Steal focus when opening build panel.',
    type: 'boolean',
    'default': true,
    order: 7
  },
  overrideThemeColors: {
    title: 'Override Theme Colors',
    description: 'Override theme background- and text color inside the terminal',
    type: 'boolean',
    'default': true,
    order: 8
  },
  selectTriggers: {
    title: 'Selecting new target triggers the build',
    description: 'When selecting a new target (through status-bar, cmd-alt-t, etc), the newly selected target will be triggered.',
    type: 'boolean',
    'default': true,
    order: 9
  },
  refreshOnShowTargetList: {
    title: 'Refresh targets when the target list is shown',
    description: 'When opening the targets menu, the targets will be refreshed.',
    type: 'boolean',
    'default': false,
    order: 10
  },
  notificationOnRefresh: {
    title: 'Show notification when targets are refreshed',
    description: 'When targets are refreshed a notification with information about the number of targets will be displayed.',
    type: 'boolean',
    'default': false,
    order: 11
  },
  beepWhenDone: {
    title: 'Beep when the build completes',
    description: 'Make a "beep" notification sound when the build is complete - in success or failure.',
    type: 'boolean',
    'default': false,
    order: 12
  },
  panelOrientation: {
    title: 'Panel Orientation',
    description: 'Where to attach the build panel',
    type: 'string',
    'default': 'Bottom',
    'enum': ['Bottom', 'Top', 'Left', 'Right'],
    order: 13
  },
  statusBar: {
    title: 'Status Bar',
    description: 'Where to place the status bar. Set to `Disable` to disable status bar display.',
    type: 'string',
    'default': 'Left',
    'enum': ['Left', 'Right', 'Disable'],
    order: 14
  },
  statusBarPriority: {
    title: 'Priority on Status Bar',
    description: 'Lower priority tiles are placed further to the left/right, depends on where you choose to place Status Bar.',
    type: 'number',
    'default': -1000,
    order: 15
  },
  terminalScrollback: {
    title: 'Terminal Scrollback Size',
    description: 'Max number of lines of build log kept in the terminal',
    type: 'number',
    'default': 1000,
    order: 16
  }
};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFdBQVcsQ0FBQzs7Ozs7cUJBRUc7QUFDYixpQkFBZSxFQUFFO0FBQ2YsU0FBSyxFQUFFLGtCQUFrQjtBQUN6QixlQUFXLEVBQUUsNkNBQTZDO0FBQzFELFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxRQUFRO0FBQ2pCLFlBQU0sQ0FBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUU7QUFDN0QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELGtCQUFnQixFQUFFO0FBQ2hCLFNBQUssRUFBRSxvQkFBb0I7QUFDM0IsZUFBVyxFQUFFLDhFQUE4RTtBQUMzRixRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxhQUFXLEVBQUU7QUFDWCxTQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGVBQVcsRUFBRSxnRUFBZ0U7QUFDN0UsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsYUFBVyxFQUFFO0FBQ1gsU0FBSyxFQUFFLDZCQUE2QjtBQUNwQyxlQUFXLEVBQUUsOERBQThEO0FBQzNFLFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLENBQUM7R0FDVDtBQUNELHdCQUFzQixFQUFFO0FBQ3RCLFNBQUssRUFBRSx1Q0FBdUM7QUFDOUMsZUFBVyxFQUFFLG1IQUFtSDtBQUNoSSxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsSUFBSTtBQUNiLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxlQUFhLEVBQUU7QUFDYixTQUFLLEVBQUUscUNBQXFDO0FBQzVDLGVBQVcsRUFBRSxrRUFBa0U7QUFDL0UsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsWUFBVSxFQUFFO0FBQ1YsU0FBSyxFQUFFLGFBQWE7QUFDcEIsZUFBVyxFQUFFLHVDQUF1QztBQUNwRCxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsSUFBSTtBQUNiLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCxxQkFBbUIsRUFBRTtBQUNuQixTQUFLLEVBQUUsdUJBQXVCO0FBQzlCLGVBQVcsRUFBRSwrREFBK0Q7QUFDNUUsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLElBQUk7QUFDYixTQUFLLEVBQUUsQ0FBQztHQUNUO0FBQ0QsZ0JBQWMsRUFBRTtBQUNkLFNBQUssRUFBRSx5Q0FBeUM7QUFDaEQsZUFBVyxFQUFFLGdIQUFnSDtBQUM3SCxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsSUFBSTtBQUNiLFNBQUssRUFBRSxDQUFDO0dBQ1Q7QUFDRCx5QkFBdUIsRUFBRTtBQUN2QixTQUFLLEVBQUUsK0NBQStDO0FBQ3RELGVBQVcsRUFBRSwrREFBK0Q7QUFDNUUsUUFBSSxFQUFFLFNBQVM7QUFDZixlQUFTLEtBQUs7QUFDZCxTQUFLLEVBQUUsRUFBRTtHQUNWO0FBQ0QsdUJBQXFCLEVBQUU7QUFDckIsU0FBSyxFQUFFLDhDQUE4QztBQUNyRCxlQUFXLEVBQUUsMkdBQTJHO0FBQ3hILFFBQUksRUFBRSxTQUFTO0FBQ2YsZUFBUyxLQUFLO0FBQ2QsU0FBSyxFQUFFLEVBQUU7R0FDVjtBQUNELGNBQVksRUFBRTtBQUNaLFNBQUssRUFBRSwrQkFBK0I7QUFDdEMsZUFBVyxFQUFFLHNGQUFzRjtBQUNuRyxRQUFJLEVBQUUsU0FBUztBQUNmLGVBQVMsS0FBSztBQUNkLFNBQUssRUFBRSxFQUFFO0dBQ1Y7QUFDRCxrQkFBZ0IsRUFBRTtBQUNoQixTQUFLLEVBQUUsbUJBQW1CO0FBQzFCLGVBQVcsRUFBRSxpQ0FBaUM7QUFDOUMsUUFBSSxFQUFFLFFBQVE7QUFDZCxlQUFTLFFBQVE7QUFDakIsWUFBTSxDQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sQ0FBRTtBQUMxQyxTQUFLLEVBQUUsRUFBRTtHQUNWO0FBQ0QsV0FBUyxFQUFFO0FBQ1QsU0FBSyxFQUFFLFlBQVk7QUFDbkIsZUFBVyxFQUFFLGdGQUFnRjtBQUM3RixRQUFJLEVBQUUsUUFBUTtBQUNkLGVBQVMsTUFBTTtBQUNmLFlBQU0sQ0FBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFNBQVMsQ0FBRTtBQUNwQyxTQUFLLEVBQUUsRUFBRTtHQUNWO0FBQ0QsbUJBQWlCLEVBQUU7QUFDakIsU0FBSyxFQUFFLHdCQUF3QjtBQUMvQixlQUFXLEVBQUUsNkdBQTZHO0FBQzFILFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxDQUFDLElBQUk7QUFDZCxTQUFLLEVBQUUsRUFBRTtHQUNWO0FBQ0Qsb0JBQWtCLEVBQUU7QUFDbEIsU0FBSyxFQUFFLDBCQUEwQjtBQUNqQyxlQUFXLEVBQUUsdURBQXVEO0FBQ3BFLFFBQUksRUFBRSxRQUFRO0FBQ2QsZUFBUyxJQUFJO0FBQ2IsU0FBSyxFQUFFLEVBQUU7R0FDVjtDQUNGIiwiZmlsZSI6Ii9ob21lL3lva290YS8uYXRvbS9wYWNrYWdlcy9idWlsZC9saWIvY29uZmlnLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcGFuZWxWaXNpYmlsaXR5OiB7XG4gICAgdGl0bGU6ICdQYW5lbCBWaXNpYmlsaXR5JyxcbiAgICBkZXNjcmlwdGlvbjogJ1NldCB3aGVuIHRoZSBidWlsZCBwYW5lbCBzaG91bGQgYmUgdmlzaWJsZS4nLFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRlZmF1bHQ6ICdUb2dnbGUnLFxuICAgIGVudW06IFsgJ1RvZ2dsZScsICdLZWVwIFZpc2libGUnLCAnU2hvdyBvbiBFcnJvcicsICdIaWRkZW4nIF0sXG4gICAgb3JkZXI6IDFcbiAgfSxcbiAgaGlkZVBhbmVsSGVhZGluZzoge1xuICAgIHRpdGxlOiAnSGlkZSBwYW5lbCBoZWFkaW5nJyxcbiAgICBkZXNjcmlwdGlvbjogJ1NldCB3aGV0aGVyIHRvIGhpZGUgdGhlIGJ1aWxkIGNvbW1hbmQgYW5kIGNvbnRyb2wgYnV0dG9ucyBpbiB0aGUgYnVpbGQgcGFuZWwnLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMlxuICB9LFxuICBidWlsZE9uU2F2ZToge1xuICAgIHRpdGxlOiAnQXV0b21hdGljYWxseSBidWlsZCBvbiBzYXZlJyxcbiAgICBkZXNjcmlwdGlvbjogJ0F1dG9tYXRpY2FsbHkgYnVpbGQgeW91ciBwcm9qZWN0IGVhY2ggdGltZSBhbiBlZGl0b3IgaXMgc2F2ZWQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDNcbiAgfSxcbiAgc2F2ZU9uQnVpbGQ6IHtcbiAgICB0aXRsZTogJ0F1dG9tYXRpY2FsbHkgc2F2ZSBvbiBidWlsZCcsXG4gICAgZGVzY3JpcHRpb246ICdBdXRvbWF0aWNhbGx5IHNhdmUgYWxsIGVkaXRlZCBmaWxlcyB3aGVuIHRyaWdnZXJpbmcgYSBidWlsZC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNFxuICB9LFxuICBtYXRjaGVkRXJyb3JGYWlsc0J1aWxkOiB7XG4gICAgdGl0bGU6ICdBbnkgbWF0Y2hlZCBlcnJvciB3aWxsIGZhaWwgdGhlIGJ1aWxkJyxcbiAgICBkZXNjcmlwdGlvbjogJ0V2ZW4gaWYgdGhlIGJ1aWxkIGhhcyBhIHJldHVybiBjb2RlIG9mIHplcm8gaXQgaXMgbWFya2VkIGFzIFwiZmFpbGVkXCIgaWYgYW55IGVycm9yIGlzIGJlaW5nIG1hdGNoZWQgaW4gdGhlIG91dHB1dC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiB0cnVlLFxuICAgIG9yZGVyOiA1XG4gIH0sXG4gIHNjcm9sbE9uRXJyb3I6IHtcbiAgICB0aXRsZTogJ0F1dG9tYXRpY2FsbHkgc2Nyb2xsIG9uIGJ1aWxkIGVycm9yJyxcbiAgICBkZXNjcmlwdGlvbjogJ0F1dG9tYXRpY2FsbHkgc2Nyb2xsIHRvIGZpcnN0IG1hdGNoZWQgZXJyb3Igd2hlbiBhIGJ1aWxkIGZhaWxlZC4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogNlxuICB9LFxuICBzdGVhbEZvY3VzOiB7XG4gICAgdGl0bGU6ICdTdGVhbCBGb2N1cycsXG4gICAgZGVzY3JpcHRpb246ICdTdGVhbCBmb2N1cyB3aGVuIG9wZW5pbmcgYnVpbGQgcGFuZWwuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogdHJ1ZSxcbiAgICBvcmRlcjogN1xuICB9LFxuICBvdmVycmlkZVRoZW1lQ29sb3JzOiB7XG4gICAgdGl0bGU6ICdPdmVycmlkZSBUaGVtZSBDb2xvcnMnLFxuICAgIGRlc2NyaXB0aW9uOiAnT3ZlcnJpZGUgdGhlbWUgYmFja2dyb3VuZC0gYW5kIHRleHQgY29sb3IgaW5zaWRlIHRoZSB0ZXJtaW5hbCcsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDhcbiAgfSxcbiAgc2VsZWN0VHJpZ2dlcnM6IHtcbiAgICB0aXRsZTogJ1NlbGVjdGluZyBuZXcgdGFyZ2V0IHRyaWdnZXJzIHRoZSBidWlsZCcsXG4gICAgZGVzY3JpcHRpb246ICdXaGVuIHNlbGVjdGluZyBhIG5ldyB0YXJnZXQgKHRocm91Z2ggc3RhdHVzLWJhciwgY21kLWFsdC10LCBldGMpLCB0aGUgbmV3bHkgc2VsZWN0ZWQgdGFyZ2V0IHdpbGwgYmUgdHJpZ2dlcmVkLicsXG4gICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgIGRlZmF1bHQ6IHRydWUsXG4gICAgb3JkZXI6IDlcbiAgfSxcbiAgcmVmcmVzaE9uU2hvd1RhcmdldExpc3Q6IHtcbiAgICB0aXRsZTogJ1JlZnJlc2ggdGFyZ2V0cyB3aGVuIHRoZSB0YXJnZXQgbGlzdCBpcyBzaG93bicsXG4gICAgZGVzY3JpcHRpb246ICdXaGVuIG9wZW5pbmcgdGhlIHRhcmdldHMgbWVudSwgdGhlIHRhcmdldHMgd2lsbCBiZSByZWZyZXNoZWQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDEwXG4gIH0sXG4gIG5vdGlmaWNhdGlvbk9uUmVmcmVzaDoge1xuICAgIHRpdGxlOiAnU2hvdyBub3RpZmljYXRpb24gd2hlbiB0YXJnZXRzIGFyZSByZWZyZXNoZWQnLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hlbiB0YXJnZXRzIGFyZSByZWZyZXNoZWQgYSBub3RpZmljYXRpb24gd2l0aCBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbnVtYmVyIG9mIHRhcmdldHMgd2lsbCBiZSBkaXNwbGF5ZWQuJyxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgZGVmYXVsdDogZmFsc2UsXG4gICAgb3JkZXI6IDExXG4gIH0sXG4gIGJlZXBXaGVuRG9uZToge1xuICAgIHRpdGxlOiAnQmVlcCB3aGVuIHRoZSBidWlsZCBjb21wbGV0ZXMnLFxuICAgIGRlc2NyaXB0aW9uOiAnTWFrZSBhIFwiYmVlcFwiIG5vdGlmaWNhdGlvbiBzb3VuZCB3aGVuIHRoZSBidWlsZCBpcyBjb21wbGV0ZSAtIGluIHN1Y2Nlc3Mgb3IgZmFpbHVyZS4nLFxuICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICBvcmRlcjogMTJcbiAgfSxcbiAgcGFuZWxPcmllbnRhdGlvbjoge1xuICAgIHRpdGxlOiAnUGFuZWwgT3JpZW50YXRpb24nLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hlcmUgdG8gYXR0YWNoIHRoZSBidWlsZCBwYW5lbCcsXG4gICAgdHlwZTogJ3N0cmluZycsXG4gICAgZGVmYXVsdDogJ0JvdHRvbScsXG4gICAgZW51bTogWyAnQm90dG9tJywgJ1RvcCcsICdMZWZ0JywgJ1JpZ2h0JyBdLFxuICAgIG9yZGVyOiAxM1xuICB9LFxuICBzdGF0dXNCYXI6IHtcbiAgICB0aXRsZTogJ1N0YXR1cyBCYXInLFxuICAgIGRlc2NyaXB0aW9uOiAnV2hlcmUgdG8gcGxhY2UgdGhlIHN0YXR1cyBiYXIuIFNldCB0byBgRGlzYWJsZWAgdG8gZGlzYWJsZSBzdGF0dXMgYmFyIGRpc3BsYXkuJyxcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkZWZhdWx0OiAnTGVmdCcsXG4gICAgZW51bTogWyAnTGVmdCcsICdSaWdodCcsICdEaXNhYmxlJyBdLFxuICAgIG9yZGVyOiAxNFxuICB9LFxuICBzdGF0dXNCYXJQcmlvcml0eToge1xuICAgIHRpdGxlOiAnUHJpb3JpdHkgb24gU3RhdHVzIEJhcicsXG4gICAgZGVzY3JpcHRpb246ICdMb3dlciBwcmlvcml0eSB0aWxlcyBhcmUgcGxhY2VkIGZ1cnRoZXIgdG8gdGhlIGxlZnQvcmlnaHQsIGRlcGVuZHMgb24gd2hlcmUgeW91IGNob29zZSB0byBwbGFjZSBTdGF0dXMgQmFyLicsXG4gICAgdHlwZTogJ251bWJlcicsXG4gICAgZGVmYXVsdDogLTEwMDAsXG4gICAgb3JkZXI6IDE1XG4gIH0sXG4gIHRlcm1pbmFsU2Nyb2xsYmFjazoge1xuICAgIHRpdGxlOiAnVGVybWluYWwgU2Nyb2xsYmFjayBTaXplJyxcbiAgICBkZXNjcmlwdGlvbjogJ01heCBudW1iZXIgb2YgbGluZXMgb2YgYnVpbGQgbG9nIGtlcHQgaW4gdGhlIHRlcm1pbmFsJyxcbiAgICB0eXBlOiAnbnVtYmVyJyxcbiAgICBkZWZhdWx0OiAxMDAwLFxuICAgIG9yZGVyOiAxNlxuICB9XG59O1xuIl19