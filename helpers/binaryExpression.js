/**
 * converts a call expression like `isUndefined(arg)` into a binary expression.
 *
 * Example:
 * comparedValue = 'undefined'
 *
 * results in `arg === undefined`
 *
 * Note: `!isUndefined(arg)` is converted to arg !== undefined
 */
module.exports = comparedValue => j => callExpression => {
  const [arg] = callExpression.value.arguments;

  const isUnequalCheck =
    callExpression.parentPath.value.type === "UnaryExpression" &&
    callExpression.parentPath.value.operator === "!";

  const newExpression = j.binaryExpression(
    isUnequalCheck ? "!==" : "===",
    arg,
    j.identifier(comparedValue)
  );

  // if it's an !fn(arg0) call, the `UnaryExpression` (!) is the parent and will be replaced
  // Otherwise just the call is replaced
  j(isUnequalCheck ? callExpression.parentPath : callExpression).replaceWith(
    newExpression
  );
};
