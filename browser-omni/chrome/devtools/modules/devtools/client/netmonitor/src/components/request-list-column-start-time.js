/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {
  createClass,
  DOM,
  PropTypes,
} = require("devtools/client/shared/vendor/react");
const { getFormattedTime } = require("../utils/format-utils");
const { getStartTime } = require("../utils/request-utils");

const { div } = DOM;

const RequestListColumnStartTime = createClass({
  displayName: "RequestListColumnStartTime",

  propTypes: {
    firstRequestStartedMillis: PropTypes.number.isRequired,
    item: PropTypes.object.isRequired,
  },

  shouldComponentUpdate(nextProps) {
    return getStartTime(this.props.item, this.props.firstRequestStartedMillis)
      !== getStartTime(nextProps.item, nextProps.firstRequestStartedMillis);
  },

  render() {
    let { firstRequestStartedMillis, item } = this.props;
    let startTime = getFormattedTime(getStartTime(item, firstRequestStartedMillis));

    return (
      div({
        className: "requests-list-column requests-list-start-time",
        title: startTime,
      },
        startTime
      )
    );
  }
});

module.exports = RequestListColumnStartTime;
