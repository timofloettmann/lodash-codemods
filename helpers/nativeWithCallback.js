/**
 * converts a call expression like `forEach(arr, fn)` into the native equivalent.
 *
 * Example:
 * fn = 'forEach'
 *
 * results in `arr.forEach(fn)`
 * 
 * Compared to `native.js` this helper ignores any function call that does
 */
module.exports = fn => j => callExpression => {
  const args = callExpression.value.arguments;

  if (
    args[1] &&
    !["ArrowFunctionExpression", "FunctionExpression"].includes(args[1].type)
  ) {
    // ES6 native filter/find/forEach etc. only accept functions but lodash allows objects and strings in same cases
    // -> skip this if the second arg is anything but a function or arrow function.
    return;
  }

  j(callExpression).replaceWith(
    j.callExpression(
      j.memberExpression(args[0], j.identifier(fn)),
      args.slice(1)
    )
  );
};
