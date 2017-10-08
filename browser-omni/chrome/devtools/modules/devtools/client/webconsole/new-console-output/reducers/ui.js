/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const {
  FILTER_BAR_TOGGLE,
  PERSIST_TOGGLE,
  TIMESTAMPS_TOGGLE,
  SELECT_NETWORK_MESSAGE_TAB,
} = require("devtools/client/webconsole/new-console-output/constants");
const Immutable = require("devtools/client/shared/vendor/immutable");

const {
  PANELS,
} = require("devtools/client/netmonitor/src/constants");

const UiState = Immutable.Record({
  filterBarVisible: false,
  persistLogs: false,
  timestampsVisible: true,
  networkMessageActiveTabId: PANELS.HEADERS,
});

function ui(state = new UiState(), action) {
  switch (action.type) {
    case FILTER_BAR_TOGGLE:
      return state.set("filterBarVisible", !state.filterBarVisible);
    case PERSIST_TOGGLE:
      return state.set("persistLogs", !state.persistLogs);
    case TIMESTAMPS_TOGGLE:
      return state.set("timestampsVisible", action.visible);
    case SELECT_NETWORK_MESSAGE_TAB:
      return state.set("networkMessageActiveTabId", action.id);
  }

  return state;
}

module.exports = {
  UiState,
  ui,
};
