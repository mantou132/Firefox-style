/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Services", "resource://gre/modules/Services.jsm");

this.EXPORTED_SYMBOLS = ["AppConstants"];

// Immutable for export.
this.AppConstants = Object.freeze({
  // See this wiki page for more details about channel specific build
  // defines: https://wiki.mozilla.org/Platform/Channel-specific_build_defines
  NIGHTLY_BUILD:
//@line 20 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 24 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  RELEASE_OR_BETA:
//@line 29 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 31 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  ACCESSIBILITY:
//@line 34 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 38 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  // Official corresponds, roughly, to whether this build is performed
  // on Mozilla's continuous integration infrastructure. You should
  // disable developer-only functionality when this flag is set.
  MOZILLA_OFFICIAL:
//@line 44 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 48 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_OFFICIAL_BRANDING:
//@line 53 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 55 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_DEV_EDITION:
//@line 60 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 62 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_SERVICES_HEALTHREPORT:
//@line 65 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 69 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_DATA_REPORTING:
//@line 72 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 76 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_SANDBOX:
//@line 79 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 83 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_CONTENT_SANDBOX:
//@line 86 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 90 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_TELEMETRY_REPORTING:
//@line 93 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 97 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_TELEMETRY_ON_BY_DEFAULT:
//@line 100 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 104 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_UPDATER:
//@line 107 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 111 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_SWITCHBOARD:
//@line 116 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 118 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_WEBRTC:
//@line 121 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 125 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_WIDGET_GTK:
//@line 130 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 132 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  XP_UNIX:
//@line 137 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 139 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

//@line 142 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  platform:
//@line 146 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  "win",
//@line 156 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  isPlatformAndVersionAtLeast(platform, version) {
    let platformVersion = Services.sysinfo.getProperty("version");
    return platform == this.platform &&
           Services.vc.compare(platformVersion, version) >= 0;
  },

  isPlatformAndVersionAtMost(platform, version) {
    let platformVersion = Services.sysinfo.getProperty("version");
    return platform == this.platform &&
           Services.vc.compare(platformVersion, version) <= 0;
  },

  MOZ_CRASHREPORTER:
//@line 171 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 175 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_MAINTENANCE_SERVICE:
//@line 178 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 182 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  E10S_TESTING_ONLY:
//@line 185 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 189 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  DEBUG:
//@line 194 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 196 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  ASAN:
//@line 201 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 203 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_GRAPHENE:
//@line 208 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 210 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_SYSTEM_NSS:
//@line 215 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 217 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_PLACES:
//@line 220 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 224 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_ADDON_SIGNING:
//@line 227 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 231 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_REQUIRE_SIGNING:
//@line 236 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 238 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_ALLOW_LEGACY_EXTENSIONS:
//@line 241 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 245 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  INSTALL_COMPACT_THEMES:
//@line 248 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 252 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MENUBAR_CAN_AUTOHIDE:
//@line 255 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 259 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  CAN_DRAW_IN_TITLEBAR:
//@line 262 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 266 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_ANDROID_HISTORY:
//@line 271 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 273 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_TOOLKIT_SEARCH:
//@line 276 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 280 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_GECKO_PROFILER:
//@line 283 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  true,
//@line 287 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_ANDROID_ACTIVITY_STREAM:
//@line 292 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 294 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_ANDROID_MOZILLA_ONLINE:
//@line 299 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  false,
//@line 301 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  DLL_PREFIX: "",
  DLL_SUFFIX: ".dll",

  MOZ_APP_NAME: "firefox",
  MOZ_APP_VERSION: "58.0a1",
  MOZ_APP_VERSION_DISPLAY: "58.0a1",
  MOZ_BUILD_APP: "browser",
  MOZ_MACBUNDLE_NAME: "Nightly.app",
  MOZ_UPDATE_CHANNEL: "nightly",
  INSTALL_LOCALE: "en-US",
  MOZ_WIDGET_TOOLKIT: "windows",
  ANDROID_PACKAGE_NAME: "org.mozilla.firefox",

  DEBUG_JS_MODULES: "",

  MOZ_BING_API_CLIENTID: "no-bing-api-clientid",
  MOZ_BING_API_KEY: "no-bing-api-key",
  MOZ_GOOGLE_API_KEY: "AIzaSyD_Drzahe4dBzGCZ9ArvowCvrPx_yFrlCM",
  MOZ_MOZILLA_API_KEY: "7e40f68c-7938-4c5d-9f95-e61647c213eb",

  // URL to the hg revision this was built from (e.g.
  // "https://hg.mozilla.org/mozilla-central/rev/6256ec9113c1")
  // On unofficial builds, this is an empty string.
//@line 328 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
  SOURCE_REVISION_URL: "https://hg.mozilla.org/mozilla-central/rev/71a2dacbbb8ba2f3522432ff7e8fc0151ca591f9",

  HAVE_USR_LIB64_DIR:
//@line 334 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
    false,
//@line 336 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  HAVE_SHELL_SERVICE:
//@line 339 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
    true,
//@line 343 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

  MOZ_STYLO:
//@line 346 "z:\build\build\src\toolkit\modules\AppConstants.jsm"
    true,
//@line 350 "z:\build\build\src\toolkit\modules\AppConstants.jsm"

});
