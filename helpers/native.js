/**
 * converts a call expression like `includes(arr, val)` into the native equivalent.
 *
 * Example:
 * fn = 'includes'
 *
 * results in `arr.includes(val)`
 */
module.exports = fn => j => callExpression => {
  const args = callExpression.value.arguments;

  j(callExpression).replaceWith(
    j.callExpression(
      j.memberExpression(args[0], j.identifier(fn)),
      args.slice(1)
    )
  );
};
