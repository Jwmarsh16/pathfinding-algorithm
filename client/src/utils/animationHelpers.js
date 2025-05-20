// src/utils/animationHelpers.js
import { SPEED_MIN, SPEED_MAX } from '../config';

/**
 * Compute the interval delay from a raw slider value.
 * Left = slow (long delay), right = fast (short delay).
 * @param {number} speed  Raw slider value between SPEED_MIN and SPEED_MAX
 * @returns {number}      Delay in milliseconds
 */
function computeAnimationDelay(speed) {
  return SPEED_MAX + SPEED_MIN - speed;
}

/**
 * Start an interval that calls `callback` every computed delay.
 * @param {() => void} callback
 * @param {number} speed
 * @returns {number}  Interval ID
 */
function startAnimationInterval(callback, speed) {
  const delay = computeAnimationDelay(speed);
  return setInterval(callback, delay);
}

/**
 * Clear an existing interval and start a new one.
 * @param {{ current: number|null }} intervalRef  A ref object holding the interval ID
 * @param {() => void} callback
 * @param {number} speed
 */
function restartAnimationInterval(intervalRef, callback, speed) {
  if (intervalRef.current != null) {
    clearInterval(intervalRef.current);
  }
  intervalRef.current = startAnimationInterval(callback, speed);
}

export {
  computeAnimationDelay,
  startAnimationInterval,
  restartAnimationInterval,
};
