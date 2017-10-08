/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set sw=2 ts=2 sts=2 et */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

/*
 * Migrates from a Firefox profile in a lossy manner in order to clean up a
 * user's profile.  Data is only migrated where the benefits outweigh the
 * potential problems caused by importing undesired/invalid configurations
 * from the source profile.
 */

const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource:///modules/MigrationUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "PlacesBackups",
                                  "resource://gre/modules/PlacesBackups.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "SessionMigration",
                                  "resource:///modules/sessionstore/SessionMigration.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "OS",
                                  "resource://gre/modules/osfile.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "FileUtils",
                                  "resource://gre/modules/FileUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "ProfileAge",
                                  "resource://gre/modules/ProfileAge.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "AppConstants",
                                  "resource://gre/modules/AppConstants.jsm");


function FirefoxProfileMigrator() {
  this.wrappedJSObject = this; // for testing...
}

FirefoxProfileMigrator.prototype = Object.create(MigratorPrototype);

FirefoxProfileMigrator.prototype._getAllProfiles = function() {
  let allProfiles = new Map();
  let profiles =
    Components.classes["@mozilla.org/toolkit/profile-service;1"]
              .getService(Components.interfaces.nsIToolkitProfileService)
              .profiles;
  while (profiles.hasMoreElements()) {
    let profile = profiles.getNext().QueryInterface(Ci.nsIToolkitProfile);
    let rootDir = profile.rootDir;

    if (rootDir.exists() && rootDir.isReadable() &&
        !rootDir.equals(MigrationUtils.profileStartup.directory)) {
      allProfiles.set(profile.name, rootDir);
    }
  }
  return allProfiles;
};

function sorter(a, b) {
  return a.id.toLocaleLowerCase().localeCompare(b.id.toLocaleLowerCase());
}

Object.defineProperty(FirefoxProfileMigrator.prototype, "sourceProfiles", {
  get() {
    return [...this._getAllProfiles().keys()].map(x => ({id: x, name: x})).sort(sorter);
  }
});

FirefoxProfileMigrator.prototype._getFileObject = function(dir, fileName) {
  let file = dir.clone();
  file.append(fileName);

  // File resources are monolithic.  We don't make partial copies since
  // they are not expected to work alone. Return null to avoid trying to
  // copy non-existing files.
  return file.exists() ? file : null;
};

FirefoxProfileMigrator.prototype.getResources = function(aProfile) {
  let sourceProfileDir = aProfile ? this._getAllProfiles().get(aProfile.id) :
    Components.classes["@mozilla.org/toolkit/profile-service;1"]
              .getService(Components.interfaces.nsIToolkitProfileService)
              .selectedProfile.rootDir;
  if (!sourceProfileDir || !sourceProfileDir.exists() ||
      !sourceProfileDir.isReadable())
    return null;

  // Being a startup-only migrator, we can rely on
  // MigrationUtils.profileStartup being set.
  let currentProfileDir = MigrationUtils.profileStartup.directory;

  // Surely data cannot be imported from the current profile.
  if (sourceProfileDir.equals(currentProfileDir))
    return null;

  return this._getResourcesInternal(sourceProfileDir, currentProfileDir);
};

FirefoxProfileMigrator.prototype.getLastUsedDate = function() {
  // We always pretend we're really old, so that we don't mess
  // up the determination of which browser is the most 'recent'
  // to import from.
  return Promise.resolve(new Date(0));
};

FirefoxProfileMigrator.prototype._getResourcesInternal = function(sourceProfileDir, currentProfileDir) {
  let getFileResource = (aMigrationType, aFileNames) => {
    let files = [];
    for (let fileName of aFileNames) {
      let file = this._getFileObject(sourceProfileDir, fileName);
      if (file)
        files.push(file);
    }
    if (!files.length) {
      return null;
    }
    return {
      type: aMigrationType,
      migrate(aCallback) {
        for (let file of files) {
          file.copyTo(currentProfileDir, "");
        }
        aCallback(true);
      }
    };
  };

  function savePrefs() {
    // If we've used the pref service to write prefs for the new profile, it's too
    // early in startup for the service to have a profile directory, so we have to
    // manually tell it where to save the prefs file.
    let newPrefsFile = currentProfileDir.clone();
    newPrefsFile.append("prefs.js");
    Services.prefs.savePrefFile(newPrefsFile);
  }

  let types = MigrationUtils.resourceTypes;
  let places = getFileResource(types.HISTORY, ["places.sqlite", "places.sqlite-wal"]);
  let favicons = getFileResource(types.HISTORY, ["favicons.sqlite", "favicons.sqlite-wal"]);
  let cookies = getFileResource(types.COOKIES, ["cookies.sqlite", "cookies.sqlite-wal"]);
  let passwords = getFileResource(types.PASSWORDS,
    ["signons.sqlite", "logins.json", "key3.db", "key4.db"]);
  let formData = getFileResource(types.FORMDATA, [
    "formhistory.sqlite",
    "autofill-profiles.json",
  ]);
  let bookmarksBackups = getFileResource(types.OTHERDATA,
    [PlacesBackups.profileRelativeFolderPath]);
  let dictionary = getFileResource(types.OTHERDATA, ["persdict.dat"]);

  let session;
  let env = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment);
  if (env.get("MOZ_RESET_PROFILE_MIGRATE_SESSION")) {
    // We only want to restore the previous firefox session if the profile refresh was
    // triggered by user. The MOZ_RESET_PROFILE_MIGRATE_SESSION would be set when a user-triggered
    // profile refresh happened in nsAppRunner.cpp. Hence, we detect the MOZ_RESET_PROFILE_MIGRATE_SESSION
    // to see if session data migration is required.
    env.set("MOZ_RESET_PROFILE_MIGRATE_SESSION", "");
    let sessionCheckpoints = this._getFileObject(sourceProfileDir, "sessionCheckpoints.json");
    let sessionFile = this._getFileObject(sourceProfileDir, "sessionstore.jsonlz4");
    if (sessionFile) {
      session = {
        type: types.SESSION,
        migrate(aCallback) {
          sessionCheckpoints.copyTo(currentProfileDir, "sessionCheckpoints.json");
          let newSessionFile = currentProfileDir.clone();
          newSessionFile.append("sessionstore.jsonlz4");
          let migrationPromise = SessionMigration.migrate(sessionFile.path, newSessionFile.path);
          migrationPromise.then(function() {
            let buildID = Services.appinfo.platformBuildID;
            let mstone = Services.appinfo.platformVersion;
            // Force the browser to one-off resume the session that we give it:
            Services.prefs.setBoolPref("browser.sessionstore.resume_session_once", true);
            // Reset the homepage_override prefs so that the browser doesn't override our
            // session with the "what's new" page:
            Services.prefs.setCharPref("browser.startup.homepage_override.mstone", mstone);
            Services.prefs.setCharPref("browser.startup.homepage_override.buildID", buildID);
            savePrefs();
            aCallback(true);
          }, function() {
            aCallback(false);
          });
        }
      };
    }
  }

  // Sync/FxA related data
  let sync = {
    name: "sync", // name is used only by tests.
    type: types.OTHERDATA,
    migrate: async aCallback => {
        // Try and parse a signedInUser.json file from the source directory and
        // if we can, copy it to the new profile and set sync's username pref
        // (which acts as a de-facto flag to indicate if sync is configured)
      try {
        let oldPath = OS.Path.join(sourceProfileDir.path, "signedInUser.json");
        let exists = await OS.File.exists(oldPath);
        if (exists) {
          let raw = await OS.File.read(oldPath, {encoding: "utf-8"});
          let data = JSON.parse(raw);
          if (data && data.accountData && data.accountData.email) {
            let username = data.accountData.email;
            // Write it to prefs.js and flush the file.
            Services.prefs.setStringPref("services.sync.username", username);
            savePrefs();
            // and copy the file itself.
            await OS.File.copy(oldPath, OS.Path.join(currentProfileDir.path, "signedInUser.json"));
          }
        }
      } catch (ex) {
        aCallback(false);
        return;
      }
      aCallback(true);
    }
  };

  // Telemetry related migrations.
  let times = {
    name: "times", // name is used only by tests.
    type: types.OTHERDATA,
    migrate: aCallback => {
      let file = this._getFileObject(sourceProfileDir, "times.json");
      if (file) {
        file.copyTo(currentProfileDir, "");
      }
      // And record the fact a migration (ie, a reset) happened.
      let timesAccessor = new ProfileAge(currentProfileDir.path);
      timesAccessor.recordProfileReset().then(
        () => aCallback(true),
        () => aCallback(false)
      );
    }
  };
  let telemetry = {
    name: "telemetry", // name is used only by tests...
    type: types.OTHERDATA,
    migrate: aCallback => {
      let createSubDir = (name) => {
        let dir = currentProfileDir.clone();
        dir.append(name);
        dir.create(Ci.nsIFile.DIRECTORY_TYPE, FileUtils.PERMS_DIRECTORY);
        return dir;
      };

      // If the 'datareporting' directory exists we migrate files from it.
      let haveStateFile = false;
      let dataReportingDir = this._getFileObject(sourceProfileDir, "datareporting");
      if (dataReportingDir && dataReportingDir.isDirectory()) {
        // Copy only specific files.
        let toCopy = ["state.json", "session-state.json"];

        let dest = createSubDir("datareporting");
        let enumerator = dataReportingDir.directoryEntries;
        while (enumerator.hasMoreElements()) {
          let file = enumerator.getNext().QueryInterface(Ci.nsIFile);
          if (file.isDirectory() || toCopy.indexOf(file.leafName) == -1) {
            continue;
          }

          if (file.leafName == "state.json") {
            haveStateFile = true;
          }
          file.copyTo(dest, "");
        }
      }

      if (!haveStateFile) {
        // Fall back to migrating the state file that contains the client id from healthreport/.
        // We first moved the client id management from the FHR implementation to the datareporting
        // service.
        // Consequently, we try to migrate an existing FHR state file here as a fallback.
        let healthReportDir = this._getFileObject(sourceProfileDir, "healthreport");
        if (healthReportDir && healthReportDir.isDirectory()) {
          let stateFile = this._getFileObject(healthReportDir, "state.json");
          if (stateFile) {
            let dest = createSubDir("healthreport");
            stateFile.copyTo(dest, "");
          }
        }
      }

      aCallback(true);
    }
  };

  return [places, cookies, passwords, formData, dictionary, bookmarksBackups,
          session, sync, times, telemetry, favicons].filter(r => r);
};

Object.defineProperty(FirefoxProfileMigrator.prototype, "startupOnlyMigrator", {
  get: () => true
});


FirefoxProfileMigrator.prototype.classDescription = "Firefox Profile Migrator";
FirefoxProfileMigrator.prototype.contractID = "@mozilla.org/profile/migrator;1?app=browser&type=firefox";
FirefoxProfileMigrator.prototype.classID = Components.ID("{91185366-ba97-4438-acba-48deaca63386}");

this.NSGetFactory = XPCOMUtils.generateNSGetFactory([FirefoxProfileMigrator]);
