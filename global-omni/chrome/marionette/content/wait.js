/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const {classes: Cc, interfaces: Ci, utils: Cu} = Components;

const {
  error,
  TimeoutError,
} = Cu.import("chrome://marionette/content/error.js", {});

/* exported TimedPromise */
this.EXPORTED_SYMBOLS = ["wait", "TimedPromise"];

/**
 * Poll-waiting utilities.
 *
 * @namespace
 */
this.wait = {};

const {TYPE_ONE_SHOT, TYPE_REPEATING_SLACK} = Ci.nsITimer;

/**
 * @callback Condition
 *
 * @param {function(*)} resolve
 *     To be called when the condition has been met.  Will return the
 *     resolved value.
 * @param {function} reject
 *     To be called when the condition has not been met.  Will cause
 *     the condition to be revaluated or time out.
 *
 * @return {*}
 *     The value from calling <code>resolve</code>.
 */

/**
 * Runs a promise-like function off the main thread until it is resolved
 * through |resolve| or |rejected| callbacks.  The function is guaranteed
 * to be run at least once, irregardless of the timeout.
 *
 * The |func| is evaluated every |interval| for as long as its runtime
 * duration does not exceed |interval|.  Evaluations occur sequentially,
 * meaning that evaluations of |func| are queued if the runtime evaluation
 * duration of |func| is greater than |interval|.
 *
 * |func| is given two arguments, |resolve| and |reject|, of which one
 * must be called for the evaluation to complete.  Calling |resolve| with
 * an argument indicates that the expected wait condition was met and
 * will return the passed value to the caller.  Conversely, calling
 * |reject| will evaluate |func| again until the |timeout| duration has
 * elapsed or |func| throws.  The passed value to |reject| will also be
 * returned to the caller once the wait has expired.
 *
 * Usage:
 *
 * <pre><code>
 *     let els = wait.until((resolve, reject) => {
 *       let res = document.querySelectorAll("p");
 *       if (res.length > 0) {
 *         resolve(Array.from(res));
 *       } else {
 *         reject([]);
 *       }
 *     });
 * </pre></code>
 *
 * @param {Condition} func
 *     Function to run off the main thread.
 * @param {number=} timeout
 *     Desired timeout.  If 0 or less than the runtime evaluation time
 *     of |func|, |func| is guaranteed to run at least once.  The default
 *     is 2000 milliseconds.
 * @param {number=} interval
 *     Duration between each poll of |func| in milliseconds.  Defaults to
 *     10 milliseconds.
 *
 * @return {Promise.<*>}
 *     Yields the value passed to |func|'s |resolve| or |reject|
 *     callbacks.
 *
 * @throws {*}
 *     If |func| throws, its error is propagated.
 */
wait.until = function(func, timeout = 2000, interval = 10) {
  const timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

  return new Promise((resolve, reject) => {
    const start = new Date().getTime();
    const end = start + timeout;

    let evalFn = () => {
      new Promise(func).then(resolve, rejected => {
        if (error.isError(rejected)) {
          throw rejected;
        }

        // return if timeout is 0, allowing |func| to be evaluated at
        // least once
        if (start == end || new Date().getTime() >= end) {
          resolve(rejected);
        }
      }).catch(reject);
    };

    // the repeating slack timer waits |interval|
    // before invoking |evalFn|
    evalFn();

    timer.init(evalFn, interval, TYPE_REPEATING_SLACK);

  }).then(res => {
    timer.cancel();
    return res;
  }, err => {
    timer.cancel();
    throw err;
  });
};

/**
 * The <code>TimedPromise</code> object represents the timed, eventual
 * completion (or failure) of an asynchronous operation, and its
 * resulting value.
 *
 * In contrast to a regular {@link Promise}, it times out after
 * <var>timeout</var>.
 *
 * @param {Condition} func
 *     Function to run, which will have its <code>reject</code>
 *     callback invoked after the <var>timeout</var> duration is reached.
 *     It is given two callbacks: <code>resolve(value)</code> and
 *     <code>reject(error)</code>.
 * @param {timeout=} [timeout=1500] timeout
 *     <var>condition</var>'s <code>reject</code> callback will be called
 *     after this timeout.
 * @param {Error=} [throws=TimeoutError] throws
 *     When the <var>timeout</var> is hit, this error class will be
 *     thrown.  If it is null, no error is thrown and the promise is
 *     instead resolved on timeout.
 *
 * @return {Promise.<*>}
 *     Timed promise.
 */
function TimedPromise(fn, {timeout = 1500, throws = TimeoutError} = {}) {
  const timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);

  return new Promise((resolve, reject) => {
    // Reject only if |throws| is given.  Otherwise it is assumed that
    // the user is OK with the promise timing out.
    let bail = () => {
      if (throws !== null) {
        let err = new throws();
        reject(err);
      } else {
        resolve();
      }
    };

    timer.initWithCallback({notify: bail}, timeout, TYPE_ONE_SHOT);

    try {
      fn(resolve, reject);
    } catch (e) {
      reject(e);
    }

  }).then(res => {
    timer.cancel();
    return res;
  }, err => {
    timer.cancel();
    throw err;
  });
}
