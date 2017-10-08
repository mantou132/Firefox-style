/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
*/

"use strict";

const {utils: Cu, interfaces: Ci} = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/AppConstants.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "AboutNewTab",
                                  "resource:///modules/AboutNewTab.jsm");

const LOCAL_NEWTAB_URL = "chrome://browser/content/newtab/newTab.xhtml";

// Debug versions are only available in Nightly
const ACTIVITY_STREAM_URLS = {
  "": "resource://activity-stream/data/content/activity-stream.html",
  "debug": "resource://activity-stream/data/content/activity-stream-debug.html",
  "prerender": "resource://activity-stream/data/content/activity-stream-prerendered.html",
  "prerenderdebug": "resource://activity-stream/data/content/activity-stream-prerendered-debug.html",
};

const ABOUT_URL = "about:newtab";

const IS_MAIN_PROCESS = Services.appinfo.processType === Services.appinfo.PROCESS_TYPE_DEFAULT;

const IS_RELEASE_OR_BETA = AppConstants.RELEASE_OR_BETA;

// Pref that tells if activity stream is enabled
const PREF_ACTIVITY_STREAM_ENABLED = "browser.newtabpage.activity-stream.enabled";
const PREF_ACTIVITY_STREAM_PRERENDER_ENABLED = "browser.newtabpage.activity-stream.prerender";
const PREF_ACTIVITY_STREAM_DEBUG = "browser.newtabpage.activity-stream.debug";


function AboutNewTabService() {
  Services.obs.addObserver(this, "quit-application-granted");
  Services.prefs.addObserver(PREF_ACTIVITY_STREAM_ENABLED, this);
  Services.prefs.addObserver(PREF_ACTIVITY_STREAM_PRERENDER_ENABLED, this);
  if (!IS_RELEASE_OR_BETA) {
    Services.prefs.addObserver(PREF_ACTIVITY_STREAM_DEBUG, this);
  }

  // More initialization happens here
  this.toggleActivityStream();
  this.initialized = true;

  if (IS_MAIN_PROCESS) {
    AboutNewTab.init();
  }
}

/*
 * A service that allows for the overriding, at runtime, of the newtab page's url.
 * Additionally, the service manages pref state between a activity stream, or the regular
 * about:newtab page.
 *
 * There is tight coupling with browser/about/AboutRedirector.cpp.
 *
 * 1. Browser chrome access:
 *
 * When the user issues a command to open a new tab page, usually clicking a button
 * in the browser chrome or using shortcut keys, the browser chrome code invokes the
 * service to obtain the newtab URL. It then loads that URL in a new tab.
 *
 * When not overridden, the default URL emitted by the service is "about:newtab".
 * When overridden, it returns the overriden URL.
 *
 * 2. Redirector Access:
 *
 * When the URL loaded is about:newtab, the default behavior, or when entered in the
 * URL bar, the redirector is hit. The service is then called to return either of
 * two URLs, a chrome or the activity stream one, based on the
 * browser.newtabpage.activity-stream.enabled pref.
 *
 * NOTE: "about:newtab" will always result in a default newtab page, and never an overridden URL.
 *
 * Access patterns:
 *
 * The behavior is different when accessing the service via browser chrome or via redirector
 * largely to maintain compatibility with expectations of add-on developers.
 *
 * Loading a chrome resource, or an about: URL in the redirector with either the
 * LOAD_NORMAL or LOAD_REPLACE flags yield unexpected behaviors, so a roundtrip
 * to the redirector from browser chrome is avoided.
 */
AboutNewTabService.prototype = {

  _newTabURL: ABOUT_URL,
  _activityStreamEnabled: false,
  _activityStreamPrerender: false,
  _activityStreamDebug: false,
  _overridden: false,

  classID: Components.ID("{dfcd2adc-7867-4d3a-ba70-17501f208142}"),
  QueryInterface: XPCOMUtils.generateQI([
    Ci.nsIAboutNewTabService,
    Ci.nsIObserver
  ]),
  _xpcom_categories: [{
    service: true
  }],

  observe(subject, topic, data) {
    switch (topic) {
      case "nsPref:changed":
        if (data === PREF_ACTIVITY_STREAM_ENABLED) {
          if (this.toggleActivityStream()) {
            Services.obs.notifyObservers(null, "newtab-url-changed", ABOUT_URL);
          }
        } else if (data === PREF_ACTIVITY_STREAM_PRERENDER_ENABLED) {
          this._activityStreamPrerender = Services.prefs.getBoolPref(PREF_ACTIVITY_STREAM_PRERENDER_ENABLED);
          Services.obs.notifyObservers(null, "newtab-url-changed", ABOUT_URL);
        } else if (!IS_RELEASE_OR_BETA && data === PREF_ACTIVITY_STREAM_DEBUG) {
          this._activityStreamDebug = Services.prefs.getBoolPref(PREF_ACTIVITY_STREAM_DEBUG, false);
          Services.obs.notifyObservers(null, "newtab-url-changed", ABOUT_URL);
        }
        break;
      case "quit-application-granted":
        this.uninit();
        if (IS_MAIN_PROCESS) {
          AboutNewTab.uninit();
        }
        break;
    }
  },

  /**
   * React to changes to the activity stream pref.
   *
   * If browser.newtabpage.activity-stream.enabled is true, this will change the default URL to the
   * activity stream page URL. If browser.newtabpage.activity-stream.enabled is false, the default URL
   * will be a local chrome URL.
   *
   * This will only act if there is a change of state and if not overridden.
   *
   * @returns {Boolean} Returns if there has been a state change
   *
   * @param {Boolean}   stateEnabled    activity stream enabled state to set to
   * @param {Boolean}   forceState      force state change
   */
  toggleActivityStream(stateEnabled = Services.prefs.getBoolPref(PREF_ACTIVITY_STREAM_ENABLED),
                       forceState = false) {

    if (!forceState && (this.overridden || stateEnabled === this.activityStreamEnabled)) {
      // exit there is no change of state
      return false;
    }
    if (stateEnabled) {
      this._activityStreamEnabled = true;
    } else {
      this._activityStreamEnabled = false;
    }
    this._activityStreamPrerender = Services.prefs.getBoolPref(PREF_ACTIVITY_STREAM_PRERENDER_ENABLED);
    if (!IS_RELEASE_OR_BETA) {
      this._activityStreamDebug = Services.prefs.getBoolPref(PREF_ACTIVITY_STREAM_DEBUG, false);
    }
    this._newtabURL = ABOUT_URL;
    return true;
  },

  /*
   * Returns the default URL.
   *
   * This URL only depends on the browser.newtabpage.activity-stream.enabled pref. Overriding
   * the newtab page has no effect on the result of this function.
   *
   * @returns {String} the default newtab URL, activity-stream or regular depending on browser.newtabpage.activity-stream.enabled
   */
  get defaultURL() {
    if (this.activityStreamEnabled) {
      const prerender = this.activityStreamPrerender ? "prerender" : "";
      const debug = this.activityStreamDebug ? "debug" : "";
      return ACTIVITY_STREAM_URLS[prerender + debug];
    }
    return LOCAL_NEWTAB_URL;
  },

  get newTabURL() {
    return this._newTabURL;
  },

  set newTabURL(aNewTabURL) {
    aNewTabURL = aNewTabURL.trim();
    if (aNewTabURL === ABOUT_URL) {
      // avoid infinite redirects in case one sets the URL to about:newtab
      this.resetNewTabURL();
      return;
    } else if (aNewTabURL === "") {
      aNewTabURL = "about:blank";
    }

    this.toggleActivityStream(false);
    this._newTabURL = aNewTabURL;
    this._overridden = true;
    Services.obs.notifyObservers(null, "newtab-url-changed", this._newTabURL);
  },

  get overridden() {
    return this._overridden;
  },

  get activityStreamEnabled() {
    return this._activityStreamEnabled;
  },

  get activityStreamPrerender() {
    return this._activityStreamPrerender;
  },

  get activityStreamDebug() {
    return this._activityStreamDebug;
  },

  resetNewTabURL() {
    this._overridden = false;
    this._newTabURL = ABOUT_URL;
    this.toggleActivityStream(undefined, true);
    Services.obs.notifyObservers(null, "newtab-url-changed", this._newTabURL);
  },

  uninit() {
    if (!this.initialized) {
      return;
    }
    Services.obs.removeObserver(this, "quit-application-granted");
    Services.prefs.removeObserver(PREF_ACTIVITY_STREAM_ENABLED, this);
    Services.prefs.removeObserver(PREF_ACTIVITY_STREAM_PRERENDER_ENABLED, this);
    if (!IS_RELEASE_OR_BETA) {
      Services.prefs.removeObserver(PREF_ACTIVITY_STREAM_DEBUG, this);
    }
    this.initialized = false;
  }
};

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([AboutNewTabService]);
