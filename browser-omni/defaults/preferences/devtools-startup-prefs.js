/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// This Devtools preferences file will be loaded as a usual Firefox preferences file.
// Most DevTools prefs are included with the addon and loaded dynamically during the addon
// startup. For preferences that are required before the addon is loaded or that we can't
// process in JS, they can be defined in this file.
// Note that this preference file follows Firefox release cycle.

// Enable the JSON View tool (an inspector for application/json documents).
pref("devtools.jsonview.enabled", true);

// Default theme ("dark" or "light")
//@line 18 "z:\build\build\src\devtools\shim\devtools-startup-prefs.js"
sticky_pref("devtools.theme", "light");
//@line 20 "z:\build\build\src\devtools\shim\devtools-startup-prefs.js"

// Should the devtools toolbar be opened on startup
pref("devtools.toolbar.visible", false);
