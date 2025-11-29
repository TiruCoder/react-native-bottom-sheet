/**
 * Development-only invariant assertion utility.
 * Throws an error if the condition is false in development mode.
 * In production, this function is a no-op and will be tree-shaken.
 *
 * @param condition - The condition to assert
 * @param message - Error message to display when condition fails
 *
 * @example
 * invariant(snapPoints.length > 0, 'SnapPoints array cannot be empty');
 */
export function invariant(
  condition: boolean,
  message: string,
): asserts condition {
  if (__DEV__) {
    if (!condition) {
      throw new Error(`Invariant violation: ${message}`);
    }
  }
}
