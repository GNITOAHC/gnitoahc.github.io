---
title: Removing OBS on Mac
date: 2026-05-22
description: Removing OBS on Mac
tags: ['OBS', 'MacOS']
type: note
---

# Removing OBS on Mac

1. Uninstall plugins from following path:

   ```
   sudo rm -rf /Library/CoreMediaIO/Plug-Ins/DAL/obs-mac-virtualcam.plugin         # OBS plugin
   sudo rm -rf /Library/Application\ Support/obs-studio/plugins/obs-mac-virtualcam # DAL plugin
   ```

2. If virtual camera is still showing, remove it from system extension: Disable SIP > Remove OBS System Extension > Re-enable SIP
   - Check if OBS is in the system extionsion: `systemextensionctl list`
   - Disable MacOS SIP `csrutil disable`
   - Remove OBS system extension `systemextensionctl uninstall [teamID] [bundleID]`
   - Re-enable MacOS SIP `csrutil enable`

   > To disable SIP, you need to boot MacOS into recovery mode.

References:

- https://obsproject.com/forum/threads/how-to-uninstall-obs-virtual-camera.146837
- https://obsproject.com/forum/threads/virtual-camera-still-showing-in-apps-even-after-uninstalling-plugins.174245
